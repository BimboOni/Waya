import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek, buildExplanationSystemPrompt } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const RequestSchema = z.object({
  text: z.string().min(1).max(4000),
  image: z.string().optional(),
  subject: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[study] Auth failed:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { text, image, subject } = parsed.data;

    let interests: string[] = [];
    let targetSubject: string | null = subject ?? null;
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { interests: true, preferredSubject: true },
      });
      interests = dbUser?.interests ?? [];
      if (!targetSubject) targetSubject = dbUser?.preferredSubject ?? null;
    } catch (dbErr) {
      console.error('[study] DB fetch failed:', dbErr);
    }

    const systemContent = buildExplanationSystemPrompt(interests, targetSubject);
    const userContent: any[] = [{ type: 'text', text }];
    if (image) {
      userContent.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${image}` } });
    }

    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      stream: true,
      max_tokens: 1200,
      temperature: 0.7,
    }, { timeout: 45000 });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullResponse += delta;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          // Save session record
          if (fullResponse.trim()) {
            try {
              await prisma.session.create({
                data: {
                  userId: user.id,
                  topic: text.slice(0, 100),
                  aiResponse: fullResponse.slice(0, 5000),
                  subject: targetSubject ?? 'Other',
                  completed: true,
                  xpEarned: 10,
                },
              });
            } catch (sessionErr) {
              console.error('[study] Session save failed:', sessionErr);
            }
          }
        } catch (streamErr) {
          console.error('[study] Stream error:', streamErr);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'AI_TIMEOUT' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    console.error('[study] Handler error:', err instanceof Error ? err.message : err);
    console.error('[study] Stack:', err instanceof Error ? err.stack : '');
    return NextResponse.json({ error: 'AI_TIMEOUT' }, { status: 503 });
  }
}
