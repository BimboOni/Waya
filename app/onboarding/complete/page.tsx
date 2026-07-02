'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      const raw = sessionStorage.getItem('waya_pending_interests');
      if (!raw) {
        console.log('[complete] No pending interests found, redirecting to dashboard');
        router.replace('/dashboard');
        return;
      }

      let payload: { interests: string[]; preferredSubject?: string };
      try {
        payload = JSON.parse(raw);
        console.log('[complete] Payload:', payload);
      } catch (e) {
        console.error('[complete] Failed to parse sessionStorage:', e);
        sessionStorage.removeItem('waya_pending_interests');
        router.replace('/dashboard');
        return;
      }

      try {
        console.log('[complete] POST /api/onboarding');
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log('[complete] Response status:', res.status);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('[complete] API error:', res.status, body);
          if (!cancelled) { setErrorMsg(body?.error || `HTTP ${res.status}`); setStatus('error'); }
          return;
        }

        sessionStorage.removeItem('waya_pending_interests');
        console.log('[complete] Profile saved, redirecting to dashboard');

        if (!cancelled) {
          setStatus('saved');
          setTimeout(() => router.replace('/dashboard'), 800);
        }
      } catch (e) {
        console.error('[complete] Fetch error:', e);
        if (!cancelled) { setErrorMsg('Network error — check console'); setStatus('error'); }
      }
    }

    complete();
    return () => { cancelled = true; };
  }, [router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-error-container)' }}>
          <span className="text-2xl" aria-hidden="true">!</span>
        </div>
        <h1 className="text-headline-lg text-text-primary font-heading text-center">Something went wrong</h1>
        <p className="text-body-md text-text-secondary font-body text-center max-w-sm">
          {errorMsg || 'We couldn\'t save your preferences. Please try signing in again.'}
        </p>
        <p className="text-label-sm text-text-muted font-body text-center max-w-sm">
          Check the browser console (Cmd+Option+J) for details.
        </p>
        <button onClick={() => router.push('/auth?view=login')}
          className="min-h-[52px] px-8 rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-medium transition-all duration-default ease-waya hover:bg-brand-hover">Sign in</button>
        <button onClick={() => window.location.reload()}
          className="text-label-md text-text-muted font-body hover:text-text-primary transition-colors mt-2">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 gap-5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--color-border-default)', borderTopColor: 'var(--color-brand-primary)', animationDuration: '0.65s' }}
          aria-label="Saving your preferences\u2026" />
      </div>
      <h1 className="text-headline-lg text-text-primary font-heading text-center">Setting up your profile</h1>
      <p className="text-body-md text-text-secondary font-body text-center max-w-sm">
        {status === 'saving' ? 'Almost there\u2026' : 'Redirecting to your study space\u2026'}
      </p>
    </div>
  );
}
