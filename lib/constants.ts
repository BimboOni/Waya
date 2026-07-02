export const XP_START_SESSION = 5;
export const XP_EXPLANATION_COMPLETE = 5;
export const XP_SUBMIT_ANSWER = 5;
export const XP_CORRECT_BONUS = 10;
export const XP_FIRST_SESSION_BONUS = 5;
export const XP_MAX_PER_SESSION = 25;
export const XP_PER_LEVEL = 500;
export const STREAK_MULTIPLIER = 1.5;
export const MAX_TOPIC_LENGTH = 200;
export const MAX_ANSWER_LENGTH = 500;
export const AI_EXPLANATION_MAX_WORDS = 250;
export const TOAST_DURATION_MS = 4000;

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Curious',
  2: 'Explorer',
  3: 'Weaver',
  4: 'Architect',
  5: 'Sage',
};

export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'var(--color-subject-math)',
  ScienceTech: 'var(--color-subject-science)',
  HistoryCulture: 'var(--color-subject-history)',
  CreativeArts: 'var(--color-subject-arts)',
  Other: 'var(--color-text-muted)',
};

export const SUBJECT_CONTAINER_COLORS: Record<string, string> = {
  Mathematics: 'var(--color-subject-math-container)',
  ScienceTech: 'var(--color-subject-science-container)',
  HistoryCulture: 'var(--color-subject-history-container)',
  CreativeArts: 'var(--color-subject-arts-container)',
  Other: 'var(--color-bg-secondary)',
};

export const SUBJECT_TEXT_COLORS: Record<string, string> = {
  Mathematics: 'var(--color-subject-math-text)',
  ScienceTech: 'var(--color-subject-science-text)',
  HistoryCulture: 'var(--color-subject-history-text)',
  CreativeArts: 'var(--color-subject-arts-text)',
  Other: 'var(--color-text-secondary)',
};

export const SUBJECTS = ['Mathematics', 'ScienceTech', 'HistoryCulture', 'CreativeArts', 'Other'] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_META: Record<string, { label: string; icon: string }> = {
  Mathematics: { label: 'Mathematics', icon: 'math-symbols' },
  ScienceTech: { label: 'Science & Tech', icon: 'flask' },
  HistoryCulture: { label: 'History & Culture', icon: 'world' },
  CreativeArts: { label: 'Creative Arts', icon: 'palette' },
};

export const HOBBIES = [
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'anime', label: 'Anime', icon: '📺' },
  { id: 'content', label: 'Content Creation', icon: '🎙️' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'cooking', label: 'Cooking', icon: '🍳' },
  { id: 'baking', label: 'Baking', icon: '🥐' },
  { id: 'reading', label: 'Reading', icon: '📚' },
  { id: 'books', label: 'Books', icon: '📖' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'tech', label: 'Tech & Coding', icon: '💻' },
  { id: 'cars', label: 'Cars', icon: '🚗' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'animals', label: 'Animals', icon: '🐾' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'dance', label: 'Dance', icon: '💃' },
  { id: 'writing', label: 'Writing', icon: '✍️' },
] as const;

export const TOAST_MESSAGES = {
  AI_TIMEOUT: 'Waya is currently gathering its thoughts. Please try your request again in a moment.',
  EMPTY_TOPIC: 'Please enter a topic before asking Waya.',
  EMPTY_ANSWER: 'Please write your synthesis answer before submitting.',
  XP_AWARDED: (amount: number) => `+${amount} XP earned!`,
  STREAK_INCREMENT: (days: number) => `${days}-day streak! Keep going!`,
  LEVEL_UP: (level: number) => `Level up! You're now a ${LEVEL_NAMES[level] ?? 'Master'}!`,
} as const;

export const MILESTONE_THRESHOLDS = {
  STREAK_3: 3,
  STREAK_7: 7,
  STREAK_30: 30,
  NODES_10: 10,
  NODES_50: 50,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
} as const;
