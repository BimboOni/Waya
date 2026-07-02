import { MILESTONE_THRESHOLDS } from './constants';

export interface MilestoneContext {
  newStreak: number;
  newLevel: number;
  totalNodes: number;
  isFirstSynthesis: boolean;
}

const MILESTONE_MAP: Record<string, (ctx: MilestoneContext) => boolean> = {
  FIRST_SYNTHESIS: (ctx) => ctx.isFirstSynthesis,
  STREAK_3: (ctx) => ctx.newStreak >= MILESTONE_THRESHOLDS.STREAK_3,
  STREAK_7: (ctx) => ctx.newStreak >= MILESTONE_THRESHOLDS.STREAK_7,
  STREAK_30: (ctx) => ctx.newStreak >= MILESTONE_THRESHOLDS.STREAK_30,
  NODES_10: (ctx) => ctx.totalNodes >= MILESTONE_THRESHOLDS.NODES_10,
  NODES_50: (ctx) => ctx.totalNodes >= MILESTONE_THRESHOLDS.NODES_50,
  LEVEL_2: (ctx) => ctx.newLevel >= MILESTONE_THRESHOLDS.LEVEL_2,
  LEVEL_3: (ctx) => ctx.newLevel >= MILESTONE_THRESHOLDS.LEVEL_3,
  LEVEL_4: (ctx) => ctx.newLevel >= MILESTONE_THRESHOLDS.LEVEL_4,
  LEVEL_5: (ctx) => ctx.newLevel >= MILESTONE_THRESHOLDS.LEVEL_5,
};

export function detectMilestone(ctx: MilestoneContext): string | null {
  for (const [badgeType, check] of Object.entries(MILESTONE_MAP)) {
    if (check(ctx)) return badgeType;
  }
  return null;
}
