import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { userId, email, name, interests, preferredSubject } = parsed.data;

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
