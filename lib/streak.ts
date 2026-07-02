import { prisma } from './prisma';

export async function updateStreak(userId: string, clientLocalDate: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActive: true, lastLocalDate: true },
  });
  if (!user) throw new Error('User not found');

  if (!user.lastLocalDate) {
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActive: new Date(), lastLocalDate: clientLocalDate },
    });
    return 1;
  }

  if (user.lastLocalDate === clientLocalDate) {
    return user.streak;
  }

  const todayDate = new Date(clientLocalDate);
  const lastDate = new Date(user.lastLocalDate);
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  const newStreak = diffDays === 1 ? user.streak + 1 : 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastActive: new Date(),
      lastLocalDate: clientLocalDate,
    },
  });

  return newStreak;
}
