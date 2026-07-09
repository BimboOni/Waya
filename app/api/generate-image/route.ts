import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { geminiImageModel, WAYA_VECTOR_STYLE_MODIFIER } from '@/lib/gemini';

const RequestSchema = z.object({
  prompt: z.string().min(3).max(500).optional(),
  subject: z.string().min(1).max(200).optional(),
  scene: z.enum(['hero', 'subject', 'illustration']).optional(),
});

const SCENE_DESCRIPTIONS: Record<string, string> = {
  hero: 'A friendly glowing brain connected to colorful nodes by thin lines, representing knowledge and learning connections. Simple geometric style with bold lines. No text.',
  subject: 'A single clean subject icon: a geometric compass for Mathematics, a molecule for Science, a scroll for History, or a palette for Creative Arts. Bold flat colors, no text, solid white background.',
  illustration: 'A student sitting at a desk with a glowing holographic knowledge map floating above their hands. Clean geometric shapes, flat colors, no text, minimal style.',
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { prompt, subject, scene } = parsed.data as {
      prompt?: string; subject?: string; scene?: string;
    };

    let fullPrompt: string;

    if (subject) {
      fullPrompt = `${WAYA_VECTOR_STYLE_MODIFIER}\n\nSubject: ${subject}.`;
    } else if (scene && SCENE_DESCRIPTIONS[scene]) {
      fullPrompt = `${WAYA_VECTOR_STYLE_MODIFIER}\n\n${SCENE_DESCRIPTIONS[scene]}`;
    } else if (prompt) {
      fullPrompt = `${WAYA_VECTOR_STYLE_MODIFIER}\n\n${prompt}`;
    } else {
      return NextResponse.json({ error: 'Provide prompt, subject, or scene.' }, { status: 400 });
    }

    const result = await geminiImageModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any,
    });

    const candidate = result.response.candidates?.[0]?.content?.parts;
    const imagePart = candidate?.find(
      (p: any) => p.inlineData?.mimeType?.startsWith('image/'),
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({
      data: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    });
  } catch (err) {
    console.error('[generate-image] Error:', err);
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      scenes: Object.keys(SCENE_DESCRIPTIONS),
      modifier: WAYA_VECTOR_STYLE_MODIFIER.slice(0, 80) + '...',
      usage: 'POST with { subject: "History & Culture" } or { scene: "hero" } or { prompt: "your text" }',
    });
  } catch (err) {
    console.error('[generate-image] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
