import { prisma } from './prisma';
import { updateStreak } from './streak';
import { calculateLevel } from './gamification';
import { createKnowledgeNode } from './knowledge-map';
import { XP_FIRST_SESSION_BONUS } from './constants';

interface AwardSessionParams {
  userId: string;
  sessionId: string;
  sessionTopic: string;
  subject: string;
  sessionAiResponse: string;
  userAnswer: string;
  xpAwarded: number;
  completed: boolean;
  localDate: string;
}

interface AwardSessionResult {
  newXP: number;
  newLevel: number;
  didLevelUp: boolean;
  newStreak: number;
  isFirstSessionToday: boolean;
  newNodeData: {
    nodeId: string; position: { x: number; y: number };
    edgeId: string | null; sourceNodeId: string | null;
  } | null;
}

export async function awardSession(params: AwardSessionParams): Promise<AwardSessionResult> {
  const { userId, sessionId, sessionTopic, subject, sessionAiResponse, userAnswer, xpAwarded, completed, localDate } = params;

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) throw new Error('User not found');

  const newStreak = await updateStreak(userId, localDate);
  const isFirstSessionToday = dbUser.lastLocalDate !== localDate;
  const finalXp = xpAwarded + (isFirstSessionToday ? XP_FIRST_SESSION_BONUS : 0);
  const newXP = dbUser.xp + finalXp;
  const newLevel = calculateLevel(newXP);
  const didLevelUp = newLevel > (dbUser.level ?? 1);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { xp: newXP } });

    const existing = await tx.session.findUnique({ where: { id: sessionId } });
    if (existing) {
      await tx.session.update({
        where: { id: sessionId },
        data: { userAnswer, xpEarned: finalXp, completed },
      });
    } else {
      await tx.session.create({
        data: { id: sessionId, userId, topic: sessionTopic, subject, aiResponse: sessionAiResponse, userAnswer, xpEarned: finalXp, completed },
      });
    }

    if (didLevelUp) {
      await tx.user.update({ where: { id: userId }, data: { level: newLevel } });
    }
  });

  let newNodeData = null;
  if (completed) {
    try {
      newNodeData = await createKnowledgeNode({ userId, sessionId, topic: sessionTopic, subject });
    } catch (e) {
      console.error('[awardSession] Failed to create knowledge node:', e);
    }
  }

  return { newXP, newLevel, didLevelUp, newStreak, isFirstSessionToday, newNodeData };
}
