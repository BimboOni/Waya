import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek, buildValidationSystemPrompt } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { XP_SUBMIT_ANSWER, XP_CORRECT_BONUS, XP_FIRST_SESSION_BONUS } from '@/lib/constants';
import { createKnowledgeNode } from '@/lib/knowledge-map';
import { checkTokenLimit, trackTokenUsage } from '@/lib/tokens';

const RequestSchema = z.object({
  sessionId: z.string(),
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
      trackTokenUsage(user.id, totalTokens).catch(() => {});
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

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = localDate;
    const lastDate = dbUser.lastLocalDate;
    const yesterdayDate = new Date(localDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    let newStreak = dbUser.streak;
    let isFirstSessionToday = false;
    if (lastDate === today) {
      // already studied today
    } else if (lastDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    if (lastDate !== today) isFirstSessionToday = true;
    if (isFirstSessionToday) xpAwarded += XP_FIRST_SESSION_BONUS;

    const newXP = dbUser.xp + xpAwarded;

    await prisma.user.update({
      where: { id: user.id },
      data: { xp: newXP, lastLocalDate: today, streak: newStreak },
    });

    if (sessionId) {
      const existing = await prisma.session.findUnique({ where: { id: sessionId } });
      if (existing) {
        await prisma.session.update({
          where: { id: sessionId },
          data: { userAnswer, xpEarned: xpAwarded, completed },
        });
      } else {
        await prisma.session.create({
          data: {
            id: sessionId,
            userId: user.id,
            topic: sessionTopic,
            subject: subject ?? 'Other',
            aiResponse: sessionAiResponse,
            userAnswer,
            xpEarned: xpAwarded,
            completed,
          },
        });
      }
    }

    const { calculateLevel } = await import('@/lib/gamification');
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > (dbUser.level ?? 1);
    if (leveledUp) {
      await prisma.user.update({ where: { id: user.id }, data: { level: newLevel } });
    }

    let newNodeData: { nodeId: string; position: { x: number; y: number }; edgeId: string | null; sourceNodeId: string | null } | null = null;
    if (completed && sessionId) {
      try {
        newNodeData = await createKnowledgeNode({
          userId: user.id,
          sessionId,
          topic: sessionTopic,
          subject: subject ?? 'Other',
        });
      } catch (nodeErr) {
        console.error('[validate-answer] Failed to create knowledge node:', nodeErr);
      }
    }

    return NextResponse.json({
      valid: isCorrect,
      feedback: feedback ?? 'Great effort!',
      subject: subject ?? 'Other',
      xpAwarded,
      newXP,
      newLevel,
      didLevelUp: leveledUp,
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
