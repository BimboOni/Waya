import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const DraftSchema = z.object({
  sessionId: z.string(),
  topic: z.string().min(1),
  subject: z.string().min(1),
  aiResponse: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = DraftSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { sessionId, topic, subject, aiResponse } = parsed.data;

    const existing = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!existing) {
      await prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          topic,
          subject,
          aiResponse,
          completed: false,
          xpEarned: 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[session/draft] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
