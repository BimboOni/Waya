# skills/deepseek-chat-integration/SKILL.md
DeepSeek Chat Integration — Synthesis Engine

## Purpose
This skill governs ALL text-based AI interactions in Waya. DeepSeek is the sole provider for:
*   Streaming interest-flavored topic explanations (under 250 words)
*   Generating a single Synthesis Question per session
*   Validating and scoring user synthesis answers

---

## 1. Installation
```bash
npm install openai
The standard OpenAI Node SDK is used. DeepSeek's API is OpenAI-compatible — only the baseURL differs.

2. Client Initialization
File: lib/deepseek.ts

TypeScript
import OpenAI from 'openai';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('[deepseek] DEEPSEEK_API_KEY is not set in environment variables.');
}

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: '[https://api.deepseek.com/v1](https://api.deepseek.com/v1)',
});
This file is imported ONLY by server-side code (app/api/ routes). Never import in Client Components.

3. System Prompt Architecture
System prompts are constructed dynamically based on the user's interest profile. They live in lib/deepseek.ts as exported builder functions:

TypeScript
// lib/deepseek.ts (continued)

export function buildExplanationSystemPrompt(interests: string[]): string {
  const interestList = interests.join(', ');
  return `You are Waya, a brilliant and enthusiastic AI study partner for students aged 10-16.

Your job is to explain academic topics by connecting them to things the student already loves.

The student's interests are: ${interestList}.

RULES:
1. Your explanation MUST be under 250 words.
2. You MUST reference at least one of the student's interests in your explanation.
3. End your explanation with exactly ONE synthesis question. The question must ask the student to connect the topic to a DIFFERENT subject or hobby than the one you used in your explanation.
4. Format your response as:
   [EXPLANATION]
   Your explanation here.
   [SYNTHESIS_QUESTION]
   Your question here.
5. Use simple, engaging language appropriate for ages 10-16.
6. Never use markdown headers, bullet points, or bold text in your response.`;
}

export function buildValidationSystemPrompt(): string {
  return `You are Waya's answer validation engine.

You receive a topic, a synthesis question, and a student's answer.

Your job is to determine if the student has made a genuine, creative cross-disciplinary connection.

Respond ONLY in this exact JSON format:
{
  "valid": true | false,
  "feedback": "One sentence of encouraging feedback (max 20 words).",
  "subject": "The academic subject category of the original topic (Mathematics | ScienceTech | HistoryCulture | CreativeArts)"
}

Be generous — reward creative thinking. Mark as valid if the student shows any genuine effort to connect concepts across domains.`;
}
4. Streaming Explanation — API Route
File: app/api/synthesis/route.ts

TypeScript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek, buildExplanationSystemPrompt } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const RequestSchema = z.object({
  topic: z.string().min(3).max(200),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Input validation
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { topic } = parsed.data;

    // 3. Load user interests
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { interests: true },
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Create pending session record
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        topic,
        subject: 'Other', // updated after validation
        aiResponse: '',    // updated after stream completes
        completed: false,
      },
    });

    // 5. Stream from DeepSeek
    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildExplanationSystemPrompt(dbUser.interests) },
        { role: 'user', content: `Explain this topic to me: ${topic}` },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    });

    // 6. Return as ReadableStream (SSE)
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            fullResponse += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, sessionId: session.id })}\n\n`));
          }

          // Persist full response to DB
          await prisma.session.update({
            where: { id: session.id },
            data: { aiResponse: fullResponse },
          });

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamErr) {
          console.error('[synthesis] Stream error:', streamErr);
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
    console.error('[synthesis] Handler error:', err);
    return NextResponse.json({ error: 'AI_TIMEOUT' }, { status: 503 });
  }
}
5. Client-Side Stream Consumer
File: components/synthesis/SynthesisEngine.tsx

TypeScript
const handleAskWaya = async () => {
  if (topic.trim().length < 3) {
    setTopicError(TOAST_MESSAGES.EMPTY_TOPIC);
    return;
  }

  setIsStreaming(true);
  setStreamedText('');

  try {
    const response = await fetch('/api/synthesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.trim() }),
    });

    if (!response.ok) throw new Error('API error');

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.replace('data: ', '').trim();
        if (payload === '[DONE]') {
          setIsStreaming(false);
          break;
        }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) {
            setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
            setIsStreaming(false);
            break;
          }
          if (parsed.delta) {
            setStreamedText(prev => prev + parsed.delta);
            if (parsed.sessionId) setCurrentSessionId(parsed.sessionId);
          }
        } catch { /* malformed chunk — skip */ }
      }
    }
  } catch {
    setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
    setIsStreaming(false);
  }
};
6. Answer Validation — API Route
File: app/api/validate-answer/route.ts

TypeScript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek, buildValidationSystemPrompt } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { XP_PER_SYNTHESIS } from '@/lib/constants';

const RequestSchema = z.object({
  sessionId: z.string().uuid(),
  userAnswer: z.string().min(3).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { sessionId, userAnswer } = parsed.data;

    // Fetch session (ownership check via userId)
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: user.id },
    });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Validate answer via DeepSeek (non-streaming)
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildValidationSystemPrompt() },
        {
          role: 'user',
          content: JSON.stringify({
            topic: session.topic,
            synthesisQuestion: extractSynthesisQuestion(session.aiResponse),
            studentAnswer: userAnswer,
          }),
        },
      ],
      stream: false,
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const { valid, feedback, subject } = JSON.parse(raw);

    if (valid) {
      // Update session record
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          userAnswer,
          subject: subject ?? 'Other',
          xpEarned: XP_PER_SYNTHESIS,
          completed: true,
        },
      });

      // Update user XP, streak, level
      const updatedUser = await updateUserProgress(user.id);

      return NextResponse.json({
        valid: true,
        feedback,
        subject: subject ?? 'Other',
        xpAwarded: XP_PER_SYNTHESIS,
        newXP: updatedUser.xp,
        newLevel: updatedUser.level,
        newStreak: updatedUser.streak,
      });
    }

    return NextResponse.json({ valid: false, feedback });

  } catch (err) {
    console.error('[validate-answer] Error:', err);
    return NextResponse.json({ error: 'AI_TIMEOUT' }, { status: 503 });
  }
}

function extractSynthesisQuestion(aiResponse: string): string {
  const match = aiResponse.match(/\[SYNTHESIS_QUESTION\]([\s\S]*?)$/);
  return match ? match[1].trim() : aiResponse;
}

async function updateUserProgress(userId: string) {
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) throw new Error('User not found');

  const newXP = dbUser.xp + XP_PER_SYNTHESIS;
  const newLevel = Math.floor(newXP / 500) + 1;

  // Streak logic: handled by gamification-logic/SKILL.md
  return prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: Math.min(newLevel, 5) },
  });
}
7. Token & Cost Management
max_tokens: 600 for explanation generation (keeps responses under 250 words with buffer)

max_tokens: 200 for validation (JSON response is short)

temperature: 0.7 for explanations (creative but focused)

temperature: 0.3 for validation (deterministic JSON)

DeepSeek pricing is near-zero for MVP scale — no rate limiting required in MVP