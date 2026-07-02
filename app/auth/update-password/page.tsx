'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabaseClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClientSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth?view=login');
      }
    });
    return () => subscription?.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setIsLoading(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); setIsLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push('/auth?view=login'), 2000);
    } catch { setError('Something went wrong.'); setIsLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-sm flex flex-col items-center gap-6">
          <span className="font-logo text-2xl text-brand-primary font-black lowercase">waya</span>
          <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h1 className="text-display-sm text-text-primary font-heading mb-2">Password updated</h1>
            <p className="text-body-md text-text-secondary font-body">Redirecting you to sign in...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <Link href="/" className="font-logo text-2xl text-brand-primary font-black lowercase">waya</Link>
        <div className="w-full flex flex-col gap-2 text-center">
          <h1 className="text-display-sm text-text-primary font-heading">Set new password</h1>
          <p className="text-body-md text-text-secondary font-body">Enter your new password below.</p>
        </div>
        {error && (
          <div className="w-full px-4 py-3 rounded-xl bg-error-container" role="alert">
            <p className="text-label-md text-error font-body">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="New password" autoComplete="new-password" autoFocus required
            className="w-full min-h-[52px] px-4 rounded-xl border-2 border-border-default bg-bg-primary text-text-primary font-body text-body-lg placeholder:text-text-muted outline-none focus:border-brand-primary transition-all" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password" autoComplete="new-password" required
            className="w-full min-h-[52px] px-4 rounded-xl border-2 border-border-default bg-bg-primary text-text-primary font-body text-body-lg placeholder:text-text-muted outline-none focus:border-brand-primary transition-all" />
          <button type="submit" disabled={isLoading || !password || !confirmPassword}
            className="w-full min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-4 border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center mt-2">
            {isLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
