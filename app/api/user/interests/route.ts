import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const InterestsSchema = z.object({
  interests: z.array(z.string().min(1)).min(2).max(3),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = InterestsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: { interests: parsed.data.interests },
      create: {
        id: user.id,
        email: user.email ?? `user-${user.id}@placeholder.waya`,
        name: user.user_metadata?.full_name ?? null,
        interests: parsed.data.interests,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[USER_INTERESTS_ERROR]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
