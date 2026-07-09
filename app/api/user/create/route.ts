import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const CreateUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  first_name: z.string().min(1).max(100),
  selected_subject: z.string().optional(),
  interests: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = CreateUserSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { id, email, first_name, selected_subject, interests } = parsed.data;

    const safeEmail = email && email.length > 0 ? email : `user-${id}@placeholder.waya`;
    const safeName = first_name.slice(0, 100);
    const safeInterests = Array.isArray(interests) ? interests.filter((i): i is string => typeof i === 'string').slice(0, 15) : [];

    try {
      const dbUser = await prisma.user.create({
        data: {
          id,
          email: safeEmail,
          name: safeName,
          interests: safeInterests,
          preferredSubject: selected_subject ?? null,
          xp: 0,
          level: 1,
          streak: 0,
        },
      });

      return NextResponse.json({ user: dbUser }, { status: 201 });
    } catch (createErr) {
      if (createErr instanceof Error && createErr.message.includes('Unique constraint')) {
        const dbUser = await prisma.user.upsert({
          where: { email: safeEmail },
          update: {
            id,
            name: safeName,
            interests: safeInterests,
            preferredSubject: selected_subject ?? null,
          },
          create: {
            id,
            email: safeEmail,
            name: safeName,
            interests: safeInterests,
            preferredSubject: selected_subject ?? null,
            xp: 0,
            level: 1,
            streak: 0,
          },
        });
        return NextResponse.json({ user: dbUser }, { status: 201 });
      }
      throw createErr;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[user/create] Error:', message);
    return NextResponse.json(
      { error: 'Failed to create profile.' },
      { status: 500 },
    );
  }
}
