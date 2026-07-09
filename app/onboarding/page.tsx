'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOBBIES } from '@/lib/constants';
import { WayaMascot } from '@/components/ui/WayaMascot';
import { InterestCard } from '@/components/onboarding/InterestCard';
import { useWayaStore } from '@/store/useWayaStore';
import { createClientSupabaseClient } from '@/lib/supabase/client';

type StepId = 'intro' | 'interests' | 'subject' | 'signin';
const STEPS: StepId[] = ['intro', 'interests', 'subject', 'signin'];
const MAX_INTERESTS = 5;
const MIN_INTERESTS = 2;

const SUBJECTS = [
  { id: 'Mathematics', label: 'Mathematics', desc: 'Numbers, algebra, geometry, calculus', bg: 'var(--color-subject-math-container)', text: 'var(--color-subject-math-text)', border: 'var(--color-subject-math)' },
  { id: 'ScienceTech', label: 'Science & Tech', desc: 'Physics, chemistry, biology, computers', bg: 'var(--color-subject-science-container)', text: 'var(--color-subject-science-text)', border: 'var(--color-subject-science)' },
  { id: 'HistoryCulture', label: 'History & Culture', desc: 'World history, geography, civics', bg: 'var(--color-subject-history-container)', text: 'var(--color-subject-history-text)', border: 'var(--color-subject-history)' },
  { id: 'CreativeArts', label: 'Creative Arts', desc: 'Music, visual arts, literature', bg: 'var(--color-subject-arts-container)', text: 'var(--color-subject-arts-text)', border: 'var(--color-subject-arts)' },
];

const slide = {
  enter: (dir: number) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -50, opacity: 0 }),
};
const TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };
const cardReveal = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: TRANSITION } };

const inputClass = 'w-full min-h-[52px] px-4 rounded-xl border-2 border-border-default bg-bg-primary text-text-primary font-body text-body-lg placeholder:text-text-muted transition-all duration-default ease-waya focus:outline-none focus:border-slate-200 dark:focus:border-slate-800';

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredSubject, setPreferredSubject] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<'idle' | 'celebrating' | 'thinking'>('idle');
  const [mascotCelebrationKey, setMascotCelebrationKey] = useState(0);

  const stepId = STEPS[stepIndex];
  const isStepComplete = (): boolean => {
    if (stepId === 'intro') return true;
    if (stepId === 'interests') return interests.length >= MIN_INTERESTS;
    if (stepId === 'subject') return preferredSubject !== null;
    if (stepId === 'signin') return true;
    return false;
  };

  const goNext = () => {
    if (!isStepComplete()) return;
    if (stepIndex < STEPS.length - 1) { setDirection(1); setStepIndex((i) => i + 1); }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setDirection(-1); setStepIndex((i) => i - 1);
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_INTERESTS) return prev;
      setMascotMood('celebrating');
      setMascotCelebrationKey((k) => k + 1);
      return [...prev, id];
    });
  };

  const selectSubject = (id: string) => {
    setPreferredSubject(id);
    setMascotMood('celebrating');
    setMascotCelebrationKey((k) => k + 1);
  };

  const handleCelebrationComplete = () => setMascotMood('idle');

  useEffect(() => {
    const t = setTimeout(() => { setMascotMood('celebrating'); setMascotCelebrationKey((k) => k + 1); }, 300);
    const t2 = setTimeout(() => setMascotMood('idle'), 1500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-border-default">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 flex items-center gap-4 h-14">
          <button type="button" onClick={goBack} disabled={stepIndex === 0}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all disabled:opacity-0 disabled:pointer-events-none">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500 ease-waya"
                style={{
                  flex: i === stepIndex ? 2.5 : 1,
                  backgroundColor: i <= stepIndex ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                }} />
            ))}
          </div>
          <span className="text-label-md font-heading font-semibold" style={{ color: 'var(--color-brand-primary)' }}>Waya</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 sm:px-8 py-8 sm:py-12 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={stepId} custom={direction} variants={slide} initial="enter" animate="center" exit="exit"
              transition={TRANSITION} className="flex flex-col gap-8">
              {stepId === 'intro' && <IntroStep mascotMood={mascotMood} celebrationKey={mascotCelebrationKey} onCelebrationComplete={handleCelebrationComplete} />}
              {stepId === 'interests' && (
                <InterestsStep selected={interests} onToggle={toggleInterest} mascotMood={mascotMood} celebrationKey={mascotCelebrationKey} onCelebrationComplete={handleCelebrationComplete} />
              )}
              {stepId === 'subject' && <SubjectStep selected={preferredSubject} onSelect={selectSubject} />}
              {stepId === 'signin' && <SignInStep interests={interests} preferredSubject={preferredSubject} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {stepId !== 'signin' && (
        <div className="sticky bottom-0 bg-bg-primary border-t border-border-default px-5 sm:px-8 py-4">
          <div className="max-w-3xl mx-auto flex justify-center">
            <button type="button" onClick={goNext} disabled={!isStepComplete()}
              className="w-full sm:w-64 min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:shadow-none active:translate-y-[4px] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0 flex items-center justify-center">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ Step 1: Intro ═══
function IntroStep({ mascotMood, celebrationKey, onCelebrationComplete }: {
  mascotMood: 'idle' | 'celebrating' | 'thinking';
  celebrationKey: number;
  onCelebrationComplete: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-10 text-center pt-6 sm:pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 250, damping: 20 }}>
        <WayaMascot key={celebrationKey} mood={mascotMood} size={88} onCelebrationComplete={onCelebrationComplete} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
        className="flex flex-col gap-4 max-w-md">
        <h1 className="text-display-md text-text-primary font-heading leading-tight">Hey, I&apos;m Waya.</h1>
        <p className="text-body-lg text-text-secondary font-body leading-relaxed">
          I explain every topic through the things you already love — gaming, music, sports, whatever you&apos;re into.
        </p>
      </motion.div>
    </div>
  );
}

// ═══ Step 2: Interests ═══
function InterestsStep({ selected, onToggle, mascotMood, celebrationKey, onCelebrationComplete }: {
  selected: string[]; onToggle: (id: string) => void;
  mascotMood: 'idle' | 'celebrating' | 'thinking';
  celebrationKey: number; onCelebrationComplete: () => void;
}) {
  return (
    <>
      <div className="flex items-start gap-4">
        <div className="hidden sm:block shrink-0">
          <WayaMascot key={celebrationKey} mood={mascotMood} size={36} onCelebrationComplete={onCelebrationComplete} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-display-sm text-text-primary font-heading">What are you into?</h1>
          <p className="text-body-md text-text-secondary font-body leading-relaxed">
            Pick your interests <span className="text-text-muted">(min {MIN_INTERESTS}, max {MAX_INTERESTS})</span> — I&apos;ll tailor every explanation to your world.
          </p>
        </div>
      </div>
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        variants={stagger} initial="hidden" animate="visible">
        {HOBBIES.map(({ id, label }) => (
          <motion.div key={id} variants={cardReveal}>
            <InterestCard id={id} label={label} isSelected={selected.includes(id)} onToggle={onToggle} />
          </motion.div>
        ))}
      </motion.div>
      <div className="flex items-center justify-center gap-2.5">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_INTERESTS }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-default ease-waya"
              style={{ backgroundColor: i < selected.length ? 'var(--color-brand-primary)' : 'var(--color-border-default)', transform: i < selected.length ? 'scale(1.15)' : 'scale(1)' }} />
          ))}
        </div>
        <span className="text-body-sm text-text-muted font-body ml-1">{selected.length} of {MAX_INTERESTS}</span>
        {selected.length === MAX_INTERESTS && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="text-label-sm font-body flex items-center gap-1" style={{ color: 'var(--color-xp)' }}>
            <Check size={12} /> All set!
          </motion.span>
        )}
      </div>
    </>
  );
}

// ═══ Step 3: Target Subject ═══
function SubjectStep({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center pt-4">
        <h1 className="text-display-sm text-text-primary font-heading">What do you want to master first?</h1>
        <p className="text-body-md text-text-secondary font-body max-w-md leading-relaxed">
          Pick a subject and I&apos;ll focus your first sessions there — using your interests as the lens.
        </p>
      </div>
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto w-full"
        variants={stagger} initial="hidden" animate="visible">
        {SUBJECTS.map((subj) => (
          <motion.div key={subj.id} variants={cardReveal}>
            <button type="button" onClick={() => onSelect(subj.id)}
              className={cn(
                'w-full rounded-2xl border-2 p-5 sm:p-6 flex flex-col gap-3 text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
                'active:scale-[0.98]',
                selected === subj.id
                  ? 'border-brand-primary border-b-4 bg-bg-card shadow-inner translate-y-0.5'
                  : 'border-border-default bg-bg-card hover:border-b-4 hover:border-border-default hover:translate-y-0.5',
              )}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-headline-sm font-heading font-semibold" style={{ color: subj.text }}>{subj.label}</h3>
                  <p className="text-body-md font-body leading-snug" style={{ color: subj.text, opacity: 0.75 }}>{subj.desc}</p>
                </div>
                {selected === subj.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center shrink-0 ml-4">
                    <Check size={14} className="text-text-inverse" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// ═══ Step 4: Sign In ═══
function SignInStep({ interests, preferredSubject }: { interests: string[]; preferredSubject: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<'create' | 'sign-in'>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length < 6) {
      inputRefs.current[pasted.length]?.focus();
    } else {
      inputRefs.current[5]?.blur();
    }
  };

  const handleVerifyCode = async () => {
    const otp = code.join('');
    if (otp.length !== 6) { setError('Enter all 6 digits from your email.'); return; }
    setIsSaving(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: 'signup',
      });
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

        // 1. Upsert profile into Prisma
        const createRes = await fetch('/api/user/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: email.trim(),
            first_name: name.trim(),
            selected_subject: preferredSubject,
            interests,
          }),
        });
        if (!createRes.ok) {
          const errorText = await createRes.text();
          console.error('DATABASE INITIALIZATION FAILED:', errorText);
          try {
            const errBody = JSON.parse(errorText);
            setError(errBody?.detail || errBody?.error || `Server error (${createRes.status})`);
          } catch {
            setError(`Server error (${createRes.status}): ${errorText.slice(0, 200)}`);
          }
          setIsSaving(false);
          return;
        }

        // 2. Show verification notice instead of navigating
        // Session won't exist until email is confirmed
        setIsEmailSent(true);
        setIsSaving(false);
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) { setError('Invalid login credentials.'); setIsSaving(false); return; }
        if (!data.user) { setError('Something went wrong.'); setIsSaving(false); return; }

        // Ensure Prisma profile exists (handles partial signups that created Auth but not DB)
        const metadataName = data.user.user_metadata?.full_name as string | undefined;
        const syncRes = await fetch('/api/user/create', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: email.trim(),
            first_name: metadataName || name.trim() || email.trim().split('@')[0],
            interests: [],
          }),
        });
        if (!syncRes.ok) {
          const errorText = await syncRes.text();
          console.error('DATABASE INITIALIZATION FAILED:', errorText);
          try {
            const errBody = JSON.parse(errorText);
            setError(errBody?.detail || errBody?.error || `Server error (${syncRes.status})`);
          } catch {
            setError(`Server error (${syncRes.status}): ${errorText.slice(0, 200)}`);
          }
          setIsSaving(false);
          return;
        }

        await supabase.auth.getSession();
        await new Promise((r) => setTimeout(r, 500));
        router.push('/dashboard');
      }
    } catch { setError('Something went wrong.'); setIsSaving(false); }
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
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; if (index === 0 && el) setTimeout(() => el.focus(), 100); }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono border-2 border-slate-200 rounded-lg bg-white focus:border-[#11B4B4] focus:ring-1 focus:ring-[#11B4B4] outline-none transition-all"
                  onChange={(e) => handleCodeChange(e.target.value, index)}
                  onKeyDown={(e) => handleCodeKeyDown(e, index)}
                  onPaste={handleCodePaste}
                />
              ))}
            </div>
            <button type="button" onClick={handleVerifyCode} disabled={code.join('').length !== 6 || isSaving}
              className="w-full mt-2 min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:shadow-none active:translate-y-[3px] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0 flex items-center justify-center"
            >
              {isSaving ? (
                <div className="w-5 h-5 mx-auto rounded-full border-2 border-white/30 border-t-white animate-spin" style={{ animationDuration: '0.65s' }} />
              ) : 'Verify Code'}
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 text-left" noValidate>
          {mode === 'create' && (
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(null); }}
              placeholder="Your name" autoComplete="name" autoFocus disabled={isSaving} className={inputClass} />
          )}
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
            placeholder="Email address" autoComplete="email" autoFocus={mode === 'sign-in'} disabled={isSaving} className={inputClass} />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
              placeholder="Password" autoComplete={mode === 'create' ? 'new-password' : 'current-password'} disabled={isSaving}
              className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-secondary transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
              className="text-label-md text-text-muted font-body hover:text-text-primary transition-colors">
              Already have an account? Sign in
            </button>
          ) : (
            <button type="button" onClick={() => { setMode('create'); setError(null); }}
              className="text-label-md text-text-muted font-body hover:text-text-primary transition-colors">
              Don&apos;t have an account? Create one free
            </button>
          )}
          {mode === 'create' && (
            <a href="/auth?view=login"
              className="text-label-md text-brand-primary font-body font-semibold hover:text-brand-hover transition-colors">
              Already have an account? Sign In
            </a>
          )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
