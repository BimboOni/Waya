import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PROTECTED_PATHS = ['/dashboard', '/profile', '/study', '/onboarding'];
const AUTH_PATHS = ['/auth', '/api/auth'];
const AUTH_RATE_LIMIT = 5;
const AUTH_RATE_WINDOW_MS = 10 * 60 * 1000;

const rateStore = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + AUTH_RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= AUTH_RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const authenticated = !error && !!data?.claims?.sub;

  const pathname = request.nextUrl.pathname;

  // Rate limiting for unauthenticated auth requests
  const isAuth = AUTH_PATHS.some((path) => pathname.startsWith(path)) || pathname === '/api/user/create';
  if (isAuth && !authenticated) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';
    if (isRateLimited(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '600' },
      });
    }
  }

  // Email verification guard — block unverified users from protected routes
  // Allow onboarding even without email confirmation
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isOnboarding = pathname.startsWith('/onboarding');
  const isVerifyView = pathname.startsWith('/auth') && request.nextUrl.searchParams.get('view') === 'verify-email';
  if (authenticated && isProtected && !isOnboarding) {
    // On the auth callback redirect, the session cookie may not be fully propagated.
    // If this is a fresh redirect, allow it through and let the client-side handle it.
    const freshRedirect = request.headers.get('referer')?.includes('/auth/callback') ?? false;
    if (!freshRedirect) {
      const { data: userData } = await supabase.auth.getUser();
      const emailConfirmed = !!userData?.user?.email_confirmed_at;
      if (!emailConfirmed && !isVerifyView) {
        return NextResponse.redirect(new URL('/auth?view=verify-email', request.url));
      }
    }
  }

  if (isProtected && !authenticated) {
    // Avoid double-redirect loops: if we're already on an auth page, don't redirect
    if (pathname.startsWith('/auth')) return supabaseResponse;
    return NextResponse.redirect(new URL('/auth?view=login', request.url));
  }

  // Allow verify-email view even when unauthenticated
  if (isVerifyView) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
