import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { geminiImageModel, WAYA_VECTOR_STYLE_MODIFIER } from '@/lib/gemini';

const RequestSchema = z.object({
  type: z.enum(['interest', 'subject']),
  id: z.string(),
  label: z.string(),
});

const SCENE_DESCRIPTIONS: Record<string, string> = {
  gaming: 'A game controller with d-pad and two thumbsticks',
  music: 'A musical note with a clean geometric shape',
  sports: 'A sports ball with motion lines on each side',
  art: 'A paint palette and brush crossed diagonally',
  coding: 'Angle brackets with a cursor line in the middle',
  cooking: 'A cooking pot with steam rising in simple wavy lines',
  reading: 'An open book with pages fanned out',
  science: 'A flask with liquid and bubbles',
  content: 'A camera on a tripod with a clapperboard',
  Mathematics: 'A compass and protractor geometric arrangement',
  ScienceTech: 'A molecule structure with connected atoms',
  HistoryCulture: 'A scroll with rolled edges',
  CreativeArts: 'A stage curtain with stars',
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

    const { id, label } = parsed.data;
    const description = SCENE_DESCRIPTIONS[id];
    const prompt = `${WAYA_VECTOR_STYLE_MODIFIER}\n\nSubject: ${label}. ${description}. Clean geometric icon, centered, white background circle. Thick 2px stroke outlines.`;

    const result = await geminiImageModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any,
    });

    const candidate = result.response.candidates?.[0]?.content?.parts;
    const imagePart = candidate?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({
      id,
      data: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    });
  } catch (err) {
    console.error('[generate-icons] Error:', err);
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
      available: Object.keys(SCENE_DESCRIPTIONS),
      modifier: WAYA_VECTOR_STYLE_MODIFIER.slice(0, 80) + '...',
      usage: 'POST with { type, id, label } — one icon at a time.',
    });
  } catch (err) {
    console.error('[generate-icons] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
