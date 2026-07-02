import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
          },
        },
      },
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  const response = NextResponse.redirect(`${origin}/dashboard`);

  const allCookies = request.cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, cookie.value, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: 31536000000,
      });
    }
  }

  return response;
}
