import { prisma } from '@/lib/prisma';

const DAILY_TOKEN_LIMIT = 100_000;

export async function getTokenUsage(userId: string): Promise<{ used: number; limit: number; remaining: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tokensUsed: true, tokensResetAt: true } });
  if (!user) return { used: 0, limit: DAILY_TOKEN_LIMIT, remaining: DAILY_TOKEN_LIMIT };

  const now = new Date();
  const resetAt = user.tokensResetAt ? new Date(user.tokensResetAt) : null;

  if (!resetAt || now >= resetAt) {
    await prisma.user.update({ where: { id: userId }, data: { tokensUsed: 0, tokensResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) } });
    return { used: 0, limit: DAILY_TOKEN_LIMIT, remaining: DAILY_TOKEN_LIMIT };
  }

  return { used: user.tokensUsed, limit: DAILY_TOKEN_LIMIT, remaining: Math.max(0, DAILY_TOKEN_LIMIT - user.tokensUsed) };
}

export async function trackTokenUsage(userId: string, tokens: number): Promise<void> {
  if (tokens <= 0) return;
  await prisma.user.update({ where: { id: userId }, data: { tokensUsed: { increment: tokens } } });
}

export async function checkTokenLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const { remaining } = await getTokenUsage(userId);
  return { allowed: remaining > 0, remaining };
}
