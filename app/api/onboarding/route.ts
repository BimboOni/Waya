import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

const RequestSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  interests: z.array(z.string()).min(1).max(15),
  preferredSubject: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { userId, email, name, interests, preferredSubject } = parsed.data;

    // Verify the user exists in Supabase Auth using the service role key
    const sbAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: { user }, error: userError } = await sbAdmin.auth.admin.getUserById(userId);
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found in auth system' }, { status: 400 });
    }

    const safeEmail = email && email.length > 0 ? email : `user-${userId}@placeholder.waya`;
    const safeName = name && name.length > 0 ? name : 'Learner';

    try {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: safeEmail,
          name: safeName,
          interests,
          preferredSubject: preferredSubject ?? null,
          xp: 0,
          level: 1,
          streak: 0,
        },
      });
      return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (createErr) {
      if (createErr instanceof Error && createErr.message.includes('Unique constraint')) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { email: safeEmail },
            update: {
              id: userId,
              name: safeName,
              interests,
              preferredSubject: preferredSubject ?? null,
            },
            create: {
              id: userId,
              email: safeEmail,
              name: safeName,
              interests,
              preferredSubject: preferredSubject ?? null,
              xp: 0,
              level: 1,
              streak: 0,
            },
          });
          return NextResponse.json({ user: dbUser }, { status: 201 });
        } catch (upsertErr) {
          console.error('[onboarding] Upsert failed:', upsertErr);
          throw upsertErr;
        }
      }
      throw createErr;
    }
  } catch (err) {
    const message = err instanceof Error ? `[${err.name}] ${err.message}` : String(err);
    console.error('[onboarding] Error:', message);
    return NextResponse.json(
      { error: 'Database error', detail: message },
      { status: 500 },
    );
  }
}
