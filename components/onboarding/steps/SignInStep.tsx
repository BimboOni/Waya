'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { WayaMascot } from '@/components/ui/WayaMascot';
import { Input } from '@/components/ui/Input';
import { createClientSupabaseClient } from '@/lib/supabase/client';

interface SignInStepProps {
  interests: string[];
  preferredSubject: string | null;
}


export function SignInStep({ interests, preferredSubject }: SignInStepProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'sign-in'>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const last = value.slice(-1);
    const newCode = [...code];
    newCode[index] = last;
    setCode(newCode);
    if (last && index < 5) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
      }
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
    setCode(newCode);
    setTimeout(() => {
      if (pasted.length < 6) inputRefs.current[pasted.length]?.focus();
      else inputRefs.current[5]?.blur();
    }, 1);
  };

  const handleVerifyCode = async () => {
    const otp = code.join('');
    if (otp.length !== 6) { setError('Enter all 6 digits from your email.'); return; }
    setIsSaving(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp, type: 'signup' });
      if (verifyError) { setError('Invalid or expired code. Try signing up again.'); setIsSaving(false); return; }
      if (!data.user) { setError('Something went wrong.'); setIsSaving(false); return; }
      localStorage.removeItem('waya_tips_completed');
      localStorage.removeItem('waya_local_date');
      window.location.href = '/dashboard';
    } catch { setError('Something went wrong.'); setIsSaving(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create' && !name.trim()) { setError('What should I call you?'); return; }
    if (!email.trim()) { setError('Enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setIsSaving(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      if (mode === 'create') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() } },
        });
        if (authError) {
          if (authError.message.toLowerCase().includes('already')) { setMode('sign-in'); setError(null); setIsSaving(false); return; }
          setError('Invalid login credentials.'); setIsSaving(false); return;
        }
        if (!data.user) { setError('Something went wrong.'); setIsSaving(false); return; }

        const createRes = await fetch('/api/user/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.user.id, email: email.trim(), first_name: name.trim(), selected_subject: preferredSubject, interests }),
        });
        if (!createRes.ok) {
          const errorText = await createRes.text();
          console.error('DATABASE INITIALIZATION FAILED:', errorText);
          try {
            const errBody = JSON.parse(errorText);
            setError(errBody?.detail || errBody?.error || `Server error (${createRes.status})`);
          } catch { setError(`Server error (${createRes.status}): ${errorText.slice(0, 200)}`); }
          setIsSaving(false); return;
        }

        setIsEmailSent(true);
        setIsSaving(false);
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError('Invalid login credentials.'); setIsSaving(false); return; }
        if (!data.user) { setError('Something went wrong.'); setIsSaving(false); return; }

        const metadataName = data.user.user_metadata?.full_name as string | undefined;
        const syncRes = await fetch('/api/user/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.user.id, email: email.trim(), first_name: metadataName || name.trim() || email.trim().split('@')[0], interests: [] }),
        });
        if (!syncRes.ok) {
          const errorText = await syncRes.text();
          console.error('DATABASE INITIALIZATION FAILED:', errorText);
          try {
            const errBody = JSON.parse(errorText);
            setError(errBody?.detail || errBody?.error || `Server error (${syncRes.status})`);
          } catch { setError(`Server error (${syncRes.status}): ${errorText.slice(0, 200)}`); }
          setIsSaving(false); return;
        }

        await supabase.auth.getSession();
        await new Promise((r) => setTimeout(r, 500));
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[SignInStep] Sign-up error trace:', err);
      setError('Something went wrong.'); setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 text-center pt-6 sm:pt-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 250, damping: 20 }}>
          <WayaMascot mood="celebrating" size={64} />
        </motion.div>
        <div className="flex flex-col gap-2">
          {mode === 'create' ? (
            <><h1 className="text-display-sm text-text-primary font-heading">You&apos;re in.</h1>
            <p className="text-body-md text-text-secondary font-body leading-relaxed">
              Create your free account and I&apos;ll remember everything — your interests, your map, your progress.
            </p></>
          ) : (
            <><h1 className="text-display-sm text-text-primary font-heading">Welcome back.</h1>
            <p className="text-body-md text-text-secondary font-body leading-relaxed">
              Sign in to continue your journey.
            </p></>
          )}
        </div>
        {error && (
          <div className="w-full px-4 py-3 rounded-xl text-left" style={{ backgroundColor: 'var(--color-error-container)' }} role="alert">
            <p className="text-label-md text-error font-body">{error}</p>
          </div>
        )}
        {isEmailSent ? (
          <div className="flex flex-col items-center text-center py-6">
            <h1 className="text-[clamp(1.25rem,0.75rem+2vw,1.5rem)] font-bold font-poppins text-text-primary mb-2">Check your email</h1>
            <p className="text-body-md text-text-secondary font-body leading-relaxed max-w-xs mb-4">
              We sent a 6-digit code to <strong className="text-text-primary">{email}</strong>.
            </p>
            <div className="flex justify-center gap-1 sm:gap-2 my-4">
              {code.map((digit, index) => (
                <input key={index} ref={(el) => { inputRefs.current[index] = el; if (index === 0 && el) setTimeout(() => el.focus(), 100); }}
                  type="text" inputMode="numeric" maxLength={1}
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono border-2 border-slate-200 rounded-lg bg-white focus:border-[#11B4B4] focus:ring-1 focus:ring-[#11B4B4] outline-none transition-all"
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    if (val) {
                      e.currentTarget.value = val.slice(-1);
                      const newCode = [...code];
                      newCode[index] = val.slice(-1);
                      setCode(newCode);
                      if (index < 5) inputRefs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      if (!e.currentTarget.value && index > 0) {
                        e.preventDefault();
                        const prevInput = inputRefs.current[index - 1];
                        if (prevInput) {
                          prevInput.value = '';
                          prevInput.focus();
                          const newCode = [...code];
                          newCode[index - 1] = '';
                          setCode(newCode);
                        }
                      } else {
                        e.currentTarget.value = '';
                        const newCode = [...code];
                        newCode[index] = '';
                        setCode(newCode);
                      }
                    }
                  }}
                  onPaste={handleCodePaste}
              />
              ))}
            </div>
            <button type="button" onClick={handleVerifyCode} disabled={code.join('').length !== 6 || isSaving}
              className="w-full mt-2 min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:shadow-none active:translate-y-[4px] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0 flex items-center justify-center">
              {isSaving ? (
                <div className="w-5 h-5 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" style={{ animationDuration: '0.65s' }} />
              ) : 'Verify Code'}
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 text-left" noValidate>
          {mode === 'create' && (
            <Input type="text" value={name} onChange={(v) => { setName(v); if (error) setError(null); }}
              placeholder="Your name" autoComplete="name" autoFocus disabled={isSaving} />
          )}
          <Input type="email" value={email} onChange={(v) => { setEmail(v); if (error) setError(null); }}
            placeholder="Email address" autoComplete="email" autoFocus={mode === 'sign-in'} disabled={isSaving} />
          <Input type="password" value={password} showPasswordToggle
            onChange={(v) => { setPassword(v); if (error) setError(null); }}
            placeholder="Password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} disabled={isSaving} />
          <button type="submit" disabled={isSaving || !email.trim() || password.length < 8}
            className="w-full min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:shadow-none active:translate-y-[4px] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0 flex items-center justify-center">
            {isSaving ? (
              <div className="w-5 h-5 mx-auto rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} aria-label="Processing…" />
            ) : mode === 'create' ? 'Create Free Account' : 'Sign In'}
          </button>
        </form>
        )}

        <div className="flex flex-col items-center gap-2">
          {isEmailSent ? (
            <p className="text-label-sm text-text-muted font-body">Didn&apos;t receive it? Check your spam folder or try signing up again.</p>
          ) : (
          <>
          {mode === 'create' ? (
            <button type="button" onClick={() => { setMode('sign-in'); setError(null); }}
              className="text-label-sm text-text-muted font-body hover:text-text-primary transition-colors underline underline-offset-2">
              Already have an account? Sign In
            </button>
          ) : (
            <button type="button" onClick={() => { setMode('create'); setError(null); }}
              className="text-label-sm text-text-muted font-body hover:text-text-primary transition-colors underline underline-offset-2">
              Don&apos;t have an account? Create one free
            </button>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
