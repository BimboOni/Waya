import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { geminiImageModel, buildBadgePrompt, type BadgeType, BADGE_TYPES } from '@/lib/gemini';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const FALLBACK_IMAGE_URL = '/assets/badge-fallback.svg';

const RequestSchema = z.object({
  badgeType: z.enum(BADGE_TYPES as [BadgeType, ...BadgeType[]]),
});

const CACHE_TTL = 300;
const SIGNED_URL_EXPIRY = 604800;

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badges = await prisma.badge.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      { badges },
      {
        status: 200,
        headers: {
          'Cache-Control': `private, max-age=${CACHE_TTL}, stale-while-revalidate=60`,
        },
      },
    );
  } catch (err) {
    console.error('[badge GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid badge type' }, { status: 400 });
    }
    const { badgeType } = parsed.data as { badgeType: BadgeType };

    const existing = await prisma.badge.findFirst({
      where: { userId: user.id, badgeType },
    });
    if (existing) {
      return NextResponse.json({ badge: existing }, { status: 200 });
    }

    let imageUrl = FALLBACK_IMAGE_URL;

    try {
      const prompt = buildBadgePrompt(badgeType);
      const result = await geminiImageModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        } as any,
      });

      const candidate = result.response.candidates?.[0]?.content?.parts;
      const imagePart = candidate?.find(
        (p: any) => p.inlineData?.mimeType?.startsWith('image/'),
      );

      if (imagePart?.inlineData?.data) {
        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
        const filePath = `badges/${user.id}/${badgeType.toLowerCase()}-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from('badges')
          .upload(filePath, imageBuffer, {
            contentType: 'image/png',
            upsert: false,
          });

        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('badges')
            .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

          if (signedData?.signedUrl) {
            imageUrl = signedData.signedUrl;
          }
        } else {
          console.error('[badge] Storage upload error:', uploadError);
        }
      }
    } catch (geminiErr) {
      console.error('[badge] Gemini generation failed:', geminiErr);
    }

    const badge = await prisma.badge.create({
      data: {
        userId: user.id,
        badgeType,
        imageUrl,
      },
    });

    return NextResponse.json({ badge }, { status: 201 });

  } catch (err) {
    console.error('[badge POST] Handler error:', err);
    return NextResponse.json({ error: 'Badge generation failed' }, { status: 500 });
  }
}
