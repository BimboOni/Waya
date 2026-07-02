import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('[gemini] GEMINI_API_KEY is not set in environment variables.');
}

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiImageModel = gemini.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

export const WAYA_VECTOR_STYLE_MODIFIER =
  'A clean, minimalist 2D flat vector illustration for a premium modern ed-tech interface. Icy, cool-toned vibrant color palette utilizing Electric Frost Blue, Vivid Cyan, and high-energy neon pops. Flat design with zero gradients, zero shadows, no 3D rendering, and no skeuomorphism. High contrast, clean geometric line art with simple, bold, youthful shapes. Set against a solid, pure white background. The visual style must look exactly like part of a unified, clean, vector asset icon pack for teenagers.';

export type BadgeType =
  | 'FIRST_SYNTHESIS'
  | 'STREAK_3'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'NODES_10'
  | 'NODES_50'
  | 'LEVEL_2'
  | 'LEVEL_3'
  | 'LEVEL_4'
  | 'LEVEL_5';

const BADGE_DESCRIPTIONS: Record<BadgeType, string> = {
  FIRST_SYNTHESIS: 'a glowing light bulb with a small spark, representing the first idea connection',
  STREAK_3:  'a flame with the number 3, clean and bold, representing 3 days in a row',
  STREAK_7:  'a bright sun with 7 rays, representing a full week of learning',
  STREAK_30: 'a golden crown with 30 gems, representing a month-long streak',
  NODES_10:  'a network of 10 connected dots forming a constellation shape',
  NODES_50:  'a complex web of nodes forming a brain shape, representing mastery',
  LEVEL_2:   'an open compass pointing north-east, representing an Explorer',
  LEVEL_3:   'two interlocking puzzle pieces, representing a Connector',
  LEVEL_4:   'a geometric blueprint of a building, representing an Architect',
  LEVEL_5:   'a stylized globe with interconnected knowledge lines, representing a Polymath',
};

export function buildBadgePrompt(badgeType: BadgeType): string {
  const description = BADGE_DESCRIPTIONS[badgeType];
  return `Create a single badge icon for a student achievement app. The final image MUST be exactly 200x200 pixels — do not exceed this size.

Style requirements:
- Flat design, NO gradients, NO shadows, NO 3D effects
- Clean geometric shapes with bold outlines
- Background: solid white circle filling the entire 200x200 canvas
- Primary color: Use the core app Primary Brand Color theme palette tone
- Accent colors: Use the app Secondary and Tertiary Accent palette theme colors exclusively
- Icon centered within the circle, taking up 60% of the space
- Thick 3px stroke outlines on all shapes
- Minimal, icon-app style (like a modern mobile app badge)

Subject: ${description}

Output: A single, centered badge icon. No text. No background patterns. No decorative borders outside the main circle.`;
}

export const BADGE_TYPES: BadgeType[] = [
  'FIRST_SYNTHESIS', 'STREAK_3', 'STREAK_7', 'STREAK_30',
  'NODES_10', 'NODES_50', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5',
];
