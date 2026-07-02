import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feedbackKey, feedbackTag } = await req.json();
    if (!feedbackKey || !feedbackTag) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

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
