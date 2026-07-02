import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deepseek, buildExplanationSystemPrompt } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const RequestSchema = z.object({
  topic: z.string().min(3).max(200),
  subject: z.string().optional(),
});

const SUBJECT_KEYWORDS: [string, string][] = [
  ['Mathematics', 'math,algebra,calculus,geometry,trigonometry,statistics,probability,equation,number,theorem,proof,matrix,derivative,integral,quadratic,linear'],
  ['ScienceTech', 'science,physics,chemistry,biology,dna,cell,evolution,quantum,energy,force,molecule,atom,chemical,experiment,lab,computer,code,algorithm,data,ai,robot,engineering,circuit,programming'],
  ['CreativeArts', 'music,art,painting,sculpture,drawing,film,dance,theater,poetry,literature,nove,story,creative,design,fashion,architecture,photography'],
  ['HistoryCulture', 'history,war,battle,revolution,empire,civilization,culture,custom,tradition,language,religion,philosophy,government,politics,society,ancient,medieval,colonial,independence,yoruba,igbo,hausa,africa,heritage,tribe,kingdom'],
];

function classifySubject(topic: string): string {
  const lower = topic.toLowerCase();
  let bestScore = 0;
  let bestSubject = 'ScienceTech';
  for (const [subject, keywords] of SUBJECT_KEYWORDS) {
    const words = keywords.split(',');
    let score = 0;
    for (const word of words) {
      if (lower.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSubject = subject;
    }
  }
  return bestSubject;
}

export async function POST(req: NextRequest) {
  try {
    // Try to get authenticated user, but allow anonymous requests for testing
    let userId = 'anonymous';
    let interests: string[] = [];
    let preferredSubject: string | null = null;
    try {
      const supabase = createServerSupabaseClient(req);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { interests: true, preferredSubject: true },
        });
        if (dbUser) {
          interests = dbUser.interests;
          preferredSubject = dbUser.preferredSubject;
        }
      }
    } catch {
      // Auth failed — continue as anonymous
    }

    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { topic, subject: userSubject } = parsed.data;

    // Create a lightweight session ID (no DB write for anonymous)
    const sessionId = crypto.randomUUID();

    // Use user-selected subject if provided, otherwise classify from topic
    const subject = userSubject || classifySubject(topic);

    const stream = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildExplanationSystemPrompt(interests, preferredSubject) },
        { role: 'user', content: `Explain this topic to me: ${topic}` },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    }, { timeout: 30000 });

    const encoder = new TextEncoder();
    let fullResponse = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            fullResponse += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, sessionId, subject })}\n\n`));
          }

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
    console.error('[synthesis] Handler error:', err instanceof Error ? err.message : err);
    console.error('[synthesis] Stack:', err instanceof Error ? err.stack : '');
    return NextResponse.json({ error: 'AI_TIMEOUT' }, { status: 503 });
  }
}
