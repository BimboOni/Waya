import { NextRequest, NextResponse } from 'next/server';
import { deepseek } from '@/lib/deepseek';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const status: Record<string, any> = {};

  // Check Supabase auth
  try {
    const supabase = createServerSupabaseClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();
    status.auth = user ? `authenticated (${user.id.slice(0, 8)}...)` : 'no session';
    if (error) status.auth_error = error.message;
  } catch (e: any) {
    status.auth = 'error: ' + e.message;
  }

  // Check DeepSeek
  try {
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
      max_tokens: 5,
    });
    status.deepseek = completion.choices[0]?.message?.content?.trim() ?? 'no response';
  } catch (e: any) {
    status.deepseek = 'error: ' + e.message;
  }

  return NextResponse.json({ status });
}
