export const LEVELS = [
  { name: 'Curious',   minXP: 0,    maxXP: 149  },
  { name: 'Explorer',  minXP: 150,  maxXP: 399  },
  { name: 'Connector', minXP: 400,  maxXP: 799  },
  { name: 'Architect', minXP: 800,  maxXP: 1499 },
  { name: 'Polymath',  minXP: 1500, maxXP: Infinity },
] as const;

function getLevelForXP(xp: number) {
  return LEVELS.findLast(l => xp >= l.minXP) ?? LEVELS[0];
}

function getProgressToNextLevel(xp: number) {
  const current = getLevelForXP(xp);
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  if (!next) return 100;
  return Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100);
}

export function calculateLevel(xp: number): number {
  const level = getLevelForXP(xp);
  return LEVELS.indexOf(level) + 1;
}

export function getLevelFromXp(xp: number): {
  level: number;
  currentLevelProgressXp: number;
  xpRequiredForNextTier: number;
  progressBarPercent: number;
} {
  const current = getLevelForXP(xp);
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  const idx = LEVELS.indexOf(current);
  return {
    level: idx + 1,
    currentLevelProgressXp: xp - current.minXP,
    xpRequiredForNextTier: next ? next.minXP - current.minXP : 0,
    progressBarPercent: next ? getProgressToNextLevel(xp) : 100,
  };
}

export function getLevelName(level: number): string {
  return LEVELS[level - 1]?.name ?? `Level ${level}`;
}

function getXPToNextLevel(xp: number): number {
  const current = getLevelForXP(xp);
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  return next ? next.minXP - current.minXP : 0;
}
