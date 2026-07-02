import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional(),
});

const WAYA_SYSTEM_PROMPT = `You are Waya, an advanced Relational AI Study Partner. You are not a traditional chatbot, nor are you a standard tutor that just hands out answers. You are a mentor designed for a 14-16 age demographic. Your tone is conversational, intelligent, highly engaging, and peer-like.

THE USER'S CONTEXT:

Target Subject: [TARGET_SUBJECT]

Core Interests: [USER_INTERESTS]

YOUR CORE DIRECTIVES:

1. The Analogy Engine: You MUST break down complex academic concepts by mapping them directly to the User's Core Interests. If teaching physics to a gamer, explain velocity using racing game mechanics or frame-rates. Do not use generic examples.

2. The Socratic Method: NEVER give the direct answer to a problem immediately. Ask guiding, layered questions that force the user to arrive at the conclusion themselves.

3. The Knowledge Map: Treat every topic as a node in a larger web. Constantly point out how the current concept connects to things they have already learned or will learn next.

4. Formatting: Use short, punchy paragraphs. Use bold text to highlight key terms. Never output massive walls of text.`;

function buildPrompt(preferredSubject: string, interests: string[]): string {
  return WAYA_SYSTEM_PROMPT
    .replace('[TARGET_SUBJECT]', preferredSubject || 'General Knowledge')
    .replace('[USER_INTERESTS]', interests.join(', ') || 'various topics');
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
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const { message } = parsed.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { interests: true, preferredSubject: true },
    });

    const interests = dbUser?.interests ?? ['technology'];
    const preferredSubject = dbUser?.preferredSubject ?? 'General Knowledge';

    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildPrompt(preferredSubject, interests) },
        { role: 'user', content: message },
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamErr) {
          console.error('[chat] Stream error:', streamErr);
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
    console.error('[chat] Handler error:', err);
    return NextResponse.json({ error: 'AI_TIMEOUT' }, { status: 503 });
  }
}
