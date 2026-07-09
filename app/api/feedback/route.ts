import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const FeedbackSchema = z.object({
  feedbackKey: z.string().min(1),
  feedbackTag: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = FeedbackSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { feedbackKey, feedbackTag } = parsed.data;

    await prisma.aIFeedback.create({
      data: {
        userId: user.id,
        feedbackKey,
        feedbackTag,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[feedback] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
