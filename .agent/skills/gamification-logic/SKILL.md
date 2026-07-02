# skills/gamification-logic/SKILL.md
Gamification Logic — XP, Levels, Streaks & Badges

## 1. XP System
Constants (lib/constants.ts):

```typescript
export const XP_PER_SYNTHESIS = 50;
export const XP_PER_LEVEL = 500;

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Curious',
  2: 'Explorer',
  3: 'Connector',
  4: 'Architect',
  5: 'Polymath',
};
XP award flow:User submits a synthesis answer.app/api/validate-answer/route.ts calls DeepSeek to validate.If valid === true, XP_PER_SYNTHESIS (50) is added to User.xp.New level is calculated: newLevel = Math.min(Math.floor(newXP / XP_PER_LEVEL) + 1, 5)UI receives xpAwarded, newXP, newLevel in the API response and updates the Zustand store.Progress bar calculation:TypeScriptexport function getXPProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL; // 0.0 → 1.0
}
2. Streak System — CRITICAL: Browser Local TimezoneStreaks MUST use the user's browser local timezone, not server UTC, to prevent users losing streaks due to timezone differences.How It WorksClient sends local date string with every synthesis submission.Server compares the received local date against User.lastActive (stored as a UTC timestamp but compared against the browser's local date using a fallback field).Client-Side: Send Local DateTypeScript// In the submit handler inside SynthesisEngine.tsx
const localDateString = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format

// Include in the validate-answer API call body:
body: JSON.stringify({
  sessionId,
  userAnswer: answer.trim(),
  localDate: localDateString,
})
Database Schema DependencyTo preserve exact baseline synchronization, the User model inside prisma/schema.prisma must support this isolation field matching the architecture criteria:Code snippetmodel User {
  id            String    @id @default(uuid())
  // ... baseline fields
  lastLocalDate String?   // 'YYYY-MM-DD' in browser local timezone
}
Server-Side: Streak CalculationFile: lib/streak.tsTypeScriptimport { prisma } from './prisma';

export async function updateStreak(userId: string, clientLocalDate: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActive: true, lastLocalDate: true },
  });
  if (!user) throw new Error('User not found');

  if (!user.lastLocalDate) {
    // First ever activity
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActive: new Date(), lastLocalDate: clientLocalDate },
    });
    return 1;
  }

  if (user.lastLocalDate === clientLocalDate) {
    return user.streak; // Same day — no streak change, just update lastActive timestamp downstream
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
3. Level CalculationFile: lib/gamification.tsTypeScriptimport { XP_PER_LEVEL, LEVEL_NAMES } from './constants';

export function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, 5);
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? 'Polymath';
}

export function getXPToNextLevel(xp: number): number {
  const level = calculateLevel(xp);
  if (level >= 5) return 0; // Max level
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}
4. Milestone Badge TriggersFile: lib/milestones.ts (see gemini-image-generation/SKILL.md for integration specifications)Milestones checked after every successful synthesis:ConditionBadge Type TagFirst synthesis everFIRST_SYNTHESISStreak reaches 3STREAK_3Streak reaches 7STREAK_7Streak reaches 30STREAK_30Total nodes = 10NODES_10Total nodes = 50NODES_50Level up to 2LEVEL_2Level up to 3LEVEL_3Level up to 4LEVEL_4Level up to 5LEVEL_55. Full Gamification Update Flow in validate-answer RouteFile: app/api/validate-answer/route.ts — gamification blockTypeScriptimport { updateStreak } from '@/lib/streak';
import { calculateLevel, getLevelName } from '@/lib/gamification';
import { detectMilestone } from '@/lib/milestones';
import { TOAST_MESSAGES } from '@/lib/constants';

// Inside POST handler, after validation succeeds:
const { localDate } = parsed.data;

// 1. Update XP
const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
const newXP = (currentUser?.xp ?? 0) + XP_PER_SYNTHESIS;
const newLevel = calculateLevel(newXP);
const prevLevel = calculateLevel(currentUser?.xp ?? 0);
const didLevelUp = newLevel > prevLevel;

// 2. Update streak
const newStreak = await updateStreak(user.id, localDate);

// 3. Update user record
await prisma.user.update({
  where: { id: user.id },
  data: { xp: newXP, level: newLevel },
});

// 4. Count total nodes (after creating new node)
const totalNodes = await prisma.knowledgeNode.count({ where: { userId: user.id } });
const isFirstSynthesis = totalNodes === 1;

// 5. Detect milestone
const milestone = detectMilestone({ newStreak, newLevel, totalNodes, isFirstSynthesis });

// 6. Fire badge generation internally
if (milestone) {
  console.log(`[gamification]: Milestone badge sequence triggered for execution: ${milestone}`);
}

// 7. Return to client
return NextResponse.json({
  valid: true,
  feedback,
  subject,
  xpAwarded: XP_PER_SYNTHESIS,
  newXP,
  newLevel,
  didLevelUp,
  levelName: getLevelName(newLevel),
  newStreak,
  milestone: milestone ?? null,
});
6. UI Notification Mapping RulesAll runtime notifications must map strictly back onto verified structural constants definitions:XP Awarded Activity: Call TOAST_MESSAGES.XP_AWARDED(50) -> Triggers flat bottom snackbar UI layout for exactly 4000ms.Streak Increments: Call TOAST_MESSAGES.STREAK_INCREMENT(newStreak) -> Triggers bottom snackbar UI tracking notification.Level Up Event: Overlays a flat Bento Modal sheet declaring the new tier classification string via getLevelName(newLevel).New Badge Achievement: Triggers an action panel slide-up from bottom (0.4s cubic-bezier), rendering a clean image placeholder preview framework.