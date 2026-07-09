import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek, buildValidationSystemPrompt } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { XP_SUBMIT_ANSWER, XP_CORRECT_BONUS } from '@/lib/constants';
import { checkTokenLimit, trackTokenUsage } from '@/lib/tokens';
import { awardSession } from '@/lib/answer';

const RequestSchema = z.object({
  sessionId: z.string().uuid(),
  userAnswer: z.string().min(3).max(500),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  topic: z.string().optional(),
  explanation: z.string().optional(),
  synthQuestion: z.string().optional(),
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
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { userAnswer, topic, explanation, synthQuestion, localDate, sessionId } = parsed.data;

    // Token limit check
    const { allowed } = await checkTokenLimit(user.id);
    if (!allowed) {
      return NextResponse.json({ error: 'Daily token limit reached. Try again tomorrow.' }, { status: 429 });
    }

    const sessionTopic = topic ?? 'Unknown topic';
    const sessionAiResponse = synthQuestion ? `${explanation}\n[SYNTHESIS_QUESTION]\n${synthQuestion}` : (explanation ?? '');

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildValidationSystemPrompt() },
        {
          role: 'user',
          content: JSON.stringify({
            topic: sessionTopic,
            synthesisQuestion: extractSynthesisQuestion(sessionAiResponse),
            studentAnswer: userAnswer,
          }),
        },
      ],
      stream: false,
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }, { timeout: 15000 });

    const totalTokens = (completion as any).usage?.total_tokens ?? 0;
    if (totalTokens > 0) {
      try { await trackTokenUsage(user.id, totalTokens); } catch (e) { console.error('[validate-answer] Token tracking failed:', e); }
    }

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let valid: boolean, feedback: string, subject: string;
    try {
      const parsed = JSON.parse(raw);
      valid = parsed.valid === true;
      feedback = parsed.feedback ?? 'Great effort!';
      subject = parsed.subject ?? 'ScienceTech';
    } catch {
      valid = false;
      feedback = 'Great effort — keep thinking!';
      subject = 'ScienceTech';
    }
    const isCorrect = valid;

    let xpAwarded = 0;
    let completed = false;
    if (isCorrect) {
      xpAwarded = XP_SUBMIT_ANSWER + XP_CORRECT_BONUS;
      completed = true;
    }

    const { newXP, newLevel, didLevelUp, newStreak, isFirstSessionToday, newNodeData } = await awardSession({
      userId: user.id,
      sessionId,
      sessionTopic,
      subject: subject ?? 'Other',
      sessionAiResponse,
      userAnswer,
      xpAwarded,
      completed,
      localDate,
    });

    return NextResponse.json({
      valid: isCorrect,
      feedback: feedback ?? 'Great effort!',
      subject: subject ?? 'Other',
      xpAwarded,
      newXP,
      newLevel,
      didLevelUp,
      newStreak,
      isFirstSessionToday,
      milestone: null,
      newNode: newNodeData ? { id: newNodeData.nodeId, position: newNodeData.position } : null,
      newEdge: newNodeData?.edgeId ? { id: newNodeData.edgeId, sourceNodeId: newNodeData.sourceNodeId, targetNodeId: newNodeData.nodeId } : null,
    });

  } catch (err) {
    console.error('[validate-answer] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'AI_TIMEOUT' }, { status: 503 });
  }
}

function extractSynthesisQuestion(aiResponse: string): string {
  const match = aiResponse.match(/\[SYNTHESIS_QUESTION\]([\s\S]*?)$/);
  return match ? match[1].trim() : aiResponse;
}
