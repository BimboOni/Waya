# skills/gemini-image-generation/SKILL.md
Gemini Image Generation — Badge & Reward Asset Pipeline

## Purpose
Gemini handles ALL visual asset generation in Waya. It is invoked exclusively from the server-side badge API route when a gamification milestone is triggered. It produces flat-UI style badge illustrations stored in Supabase Storage.

---

## 1. Installation
```bash
npm install @google/generative-ai
2. Client Initialization
File: lib/gemini.ts

TypeScript
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('[gemini] GEMINI_API_KEY is not set in environment variables.');
}

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiImageModel = gemini.getGenerativeModel({
  model: 'gemini-2.5-flash',
});
3. Badge Prompt Architecture
Prompts are constructed in lib/gemini.ts as exported builder functions. All generated images use a consistent flat-UI aesthetic matching Waya's design system.

TypeScript
// lib/gemini.ts (continued)

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
  return `Create a single badge icon for a student achievement app.

Style requirements:
- Flat design, NO gradients, NO shadows, NO 3D effects
- Clean geometric shapes with bold outlines
- Background: solid white circle
- Primary color: Use the core app Primary Brand Color theme palette tone
- Accent colors: Use the app Secondary and Tertiary Accent palette theme colors exclusively
- Icon centered within the circle, taking up 60% of the space
- Thick 3px stroke outlines on all shapes
- Minimal, icon-app style (like a modern mobile app badge)

Subject: ${description}

Output: A single, centered badge icon. No text. No background patterns. No decorative borders outside the main circle.`;
}
4. Milestone Detection Logic
File: lib/milestones.ts

TypeScript
import type { BadgeType } from './gemini';

interface MilestoneCheckParams {
  newStreak: number;
  newLevel: number;
  totalNodes: number;
  isFirstSynthesis: boolean;
}

export function detectMilestone(params: MilestoneCheckParams): BadgeType | null {
  const { newStreak, newLevel, totalNodes, isFirstSynthesis } = params;

  if (isFirstSynthesis) return 'FIRST_SYNTHESIS';
  if (newStreak === 3)   return 'STREAK_3';
  if (newStreak === 7)   return 'STREAK_7';
  if (newStreak === 30)  return 'STREAK_30';
  if (totalNodes === 10) return 'NODES_10';
  if (totalNodes === 50) return 'NODES_50';
  if (newLevel === 2)    return 'LEVEL_2';
  if (newLevel === 3)    return 'LEVEL_3';
  if (newLevel === 4)    return 'LEVEL_4';
  if (newLevel === 5)    return 'LEVEL_5';

  return null;
}
5. Badge Generation API Route
File: app/api/badge/route.ts

TypeScript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { geminiImageModel, buildBadgePrompt, type BadgeType } from '@/lib/gemini';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_SVG_URL = '/assets/badge-fallback.svg'; // served from public/

const RequestSchema = z.object({
  badgeType: z.enum([
    'FIRST_SYNTHESIS', 'STREAK_3', 'STREAK_7', 'STREAK_30',
    'NODES_10', 'NODES_50', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5',
  ]),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid badge type' }, { status: 400 });
    }
    const { badgeType } = parsed.data as { badgeType: BadgeType };

    // 3. Prevent duplicate badges
    const existing = await prisma.badge.findFirst({
      where: { userId: user.id, badgeType },
    });
    if (existing) {
      return NextResponse.json({ badge: existing }, { status: 200 });
    }

    // 4. Generate image with Gemini
    let imageUrl = FALLBACK_SVG_URL;

    try {
      const prompt = buildBadgePrompt(badgeType);
      const result = await geminiImageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.mimeType?.startsWith('image/')
      );

      if (imagePart?.inlineData?.data) {
        // 5. Upload to Supabase Storage
        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
        const filePath = `badges/${user.id}/${badgeType.toLowerCase()}-${Date.now()}.png`;

        const supabaseAdmin = createServerSupabaseClient(); // service role client
        const { error: uploadError } = await supabaseAdmin.storage
          .from('badges')
          .upload(filePath, imageBuffer, {
            contentType: 'image/png',
            upsert: false,
          });

        if (!uploadError) {
          // Generate signed URL (1 hour expiry)
          const { data: signedData } = await supabaseAdmin.storage
            .from('badges')
            .createSignedUrl(filePath, 3600);

          if (signedData?.signedUrl) {
            imageUrl = signedData.signedUrl;
          }
        }
      }
    } catch (geminiErr) {
      // Gemini failure: log and fall through to fallback
      console.error('[badge] Gemini generation failed:', geminiErr);
      // imageUrl remains FALLBACK_SVG_URL
    }

    // 6. Save badge record (always — even on Gemini failure)
    const badge = await prisma.badge.create({
      data: {
        userId: user.id,
        badgeType,
        imageUrl,
      },
    });

    return NextResponse.json({ badge }, { status: 201 });

  } catch (err) {
    console.error('[badge] Handler error:', err);
    return NextResponse.json({ error: 'Badge generation failed' }, { status: 500 });
  }
}
6. Fallback SVG
File: public/assets/badge-fallback.svg
Create a simple default badge SVG for cases where Gemini fails:
7. Supabase Storage Setup
Run once in Supabase dashboard or via migration:

SQL
-- Create badges bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('badges', 'badges', false);

-- RLS policy for badge storage
CREATE POLICY "Badge storage: own files only"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'badges'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
8. Integration Point Strategy
To prevent network loop timeouts inside serverless compute functions, the badge API is handled via server module abstractions imported directly inside data transaction paths.

TypeScript
// Inside validate-answer route handler, immediately after your Prisma user progress transactions finalize:
const milestone = detectMilestone({ newStreak, newLevel, totalNodes, isFirstSynthesis });

if (milestone) {
  // Execute server utility generation script internally rather than using external API fetch dependencies
  console.log(`[milestone-triggered]: Initializing rewarding sequence for type ${milestone}`);
}