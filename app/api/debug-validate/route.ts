import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const { deepseek, buildValidationSystemPrompt } = await import('@/lib/deepseek');

  try {
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildValidationSystemPrompt() },
        { role: 'user', content: JSON.stringify({
          topic: 'photosynthesis',
          synthesisQuestion: 'How does this connect to gaming?',
          studentAnswer: 'Plants use sunlight like a game character regens health.',
        })},
      ],
      stream: false,
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    return NextResponse.json({ success: true, raw, parsed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
