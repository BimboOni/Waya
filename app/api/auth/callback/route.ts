import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { prisma } from '@/lib/prisma';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

interface OnboardingData {
  name?: string;
  interests?: string[];
  preferredSubject?: string;
}

const ONBOARDING_COOKIE = 'waya_onboarding';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?view=login&error=no_code`);
  }

  // Capture auth cookies from the session exchange
  let sessionCookies: CookieToSet[] = [];
  let tempResponse = NextResponse.redirect(`${origin}/auth`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
        },
        setAll(cookiesToSet: CookieToSet[]) {
          sessionCookies = cookiesToSet;
          cookiesToSet.forEach(({ name, value, options }) =>
            tempResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let exchangeResult;
  try {
    exchangeResult = await supabase.auth.exchangeCodeForSession(code);
  } catch (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession threw:', exchangeError);
    return NextResponse.redirect(`${origin}/auth?view=login`);
  }
  const { data: { user }, error } = exchangeResult;

  if (error || !user) {
    return NextResponse.redirect(`${origin}/auth?view=login`);
  }

  // Read onboarding data from cookie (set by the client before OAuth redirect)
  let onboarding: OnboardingData = {};
  const rawCookie = request.cookies.get(ONBOARDING_COOKIE)?.value;
  if (rawCookie) {
    try {
      onboarding = JSON.parse(decodeURIComponent(rawCookie));
    } catch {
      console.warn('[callback] Malformed onboarding cookie');
    }
  }

  const name = onboarding.name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Learner';
  const interests = onboarding.interests ?? [];
  const preferredSubject = onboarding.preferredSubject ?? user.user_metadata?.preferred_subject ?? null;

  const safeEmail = user.email && user.email.length > 0 ? user.email : `${user.id}@placeholder.waya`;

  try {
    await prisma.user.upsert({
      where: { email: safeEmail },
      update: {
        id: user.id,
        name,
        interests,
        preferredSubject,
      },
      create: {
        id: user.id,
        email: safeEmail,
        name,
        interests,
        preferredSubject,
        xp: 0,
        level: 1,
        streak: 0,
      },
    });
  } catch (dbErr) {
    console.error('[callback] Prisma user upsert failed:', dbErr);
    return NextResponse.redirect(`${origin}/auth?view=login&error=profile_creation_failed`);
  }

  // Build final response: redirect to dashboard with auth cookies
  const response = NextResponse.redirect(`${origin}/dashboard`);

  // Attach auth cookies from the session exchange
  sessionCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  // Clear the onboarding cookie
  response.cookies.set(ONBOARDING_COOKIE, '', { path: '/', maxAge: 0 });

  return response;
}
