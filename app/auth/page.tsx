'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClientSupabaseClient } from '@/lib/supabase/client';

const INTERESTS = [
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Music' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'sports', label: 'Sports' },
  { id: 'anime', label: 'Anime' },
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'movies', label: 'Movies' },
  { id: 'art', label: 'Art' },
];

const SUBJECTS = [
  { id: 'Mathematics', label: 'Mathematics', desc: 'Algebra, geometry, calculus', icon: '📐', color: '#895AF6', bg: 'rgba(137, 90, 246, 0.08)' },
  { id: 'ScienceTech', label: 'Science & Tech', desc: 'Physics, biology, coding', icon: '🔬', color: '#07B6D5', bg: 'rgba(7, 182, 213, 0.08)' },
  { id: 'HistoryCulture', label: 'History & Culture', desc: 'World history, civics, geography', icon: '🗺️', color: '#D97959', bg: 'rgba(217, 121, 89, 0.08)' },
  { id: 'CreativeArts', label: 'Creative Arts', desc: 'Music, art, literature, design', icon: '🎨', color: '#EC4699', bg: 'rgba(236, 70, 153, 0.08)' },
];

const fadeStep = {
  enter: { opacity: 0, y: 20, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.98 },
};

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'get-started';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [nameBlurred, setNameBlurred] = useState(false);
  const [emailRegexValid, setEmailRegexValid] = useState(false);
  const [passwordReqs, setPasswordReqs] = useState({ len: false, upper: false, lower: false, num: false, special: false });
  const [showLoginLink, setShowLoginLink] = useState(false);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return name.trim().length >= 3;
    if (step === 3) return interests.length >= 2;
    if (step === 4) return selectedSubject !== null;
    if (step === 5) return emailRegexValid && passwordReqs.len && passwordReqs.upper && passwordReqs.lower && passwordReqs.num && passwordReqs.special;
    return false;
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 5));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    setPasswordReqs({ len: v.length >= 8, upper: /[A-Z]/.test(v), lower: /[a-z]/.test(v), num: /[0-9]/.test(v), special: /[!@#$%^&*(),.?":{}|<>]/.test(v) });
  };

  const handleSignUp = async () => {
    setIsLoading(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: {
          data: {
            full_name: name.trim(),
            interests: JSON.stringify(interests),
            preferred_subject: selectedSubject,
          },
        },
      });
      if (authError) { setError(authError.message); setIsLoading(false); if (authError.message.toLowerCase().includes('already')) setShowLoginLink(true); return; }
      if (!data.user) { setError('Something went wrong.'); setIsLoading(false); return; }
      try {
        await fetch('/api/onboarding', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, email: email.trim(), name: name.trim(), interests, preferredSubject: selectedSubject }),
        });
      } catch (e) {
        console.error('[auth] Onboarding API fallback failed:', e);
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError('Account created! Check your email to confirm your account, then sign in.');
        setIsLoading(false);
        return;
      }
      try { localStorage.removeItem('waya_tips_completed'); localStorage.removeItem('waya_local_date'); } catch {}
      router.push('/dashboard');
    } catch (err) {
      console.error('[auth] SignUp error:', err);
      setError('Something went wrong.'); setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setIsLoading(false); return; }
      if (!data.user) { setError('Something went wrong.'); setIsLoading(false); return; }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        await new Promise((r) => setTimeout(r, 1000));
        await supabase.auth.getSession();
      }
      router.push('/dashboard');
    } catch { setError('Something went wrong.'); setIsLoading(false); }
  };

  const handleResetPassword = async () => {
    setIsLoading(true); setError(null);
    try {
      const supabase = createClientSupabaseClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (authError) { setError(authError.message); } else { setResetSent(true); }
    } catch { setError('Something went wrong.'); }
    setIsLoading(false);
  };


  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left panel — Brand side */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="hidden md:flex w-1/2 p-12 lg:p-16 flex-col relative overflow-hidden bg-brand-dark">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Link href="/" className="relative z-10 mb-8 block">
            <span className="font-logo text-2xl text-white font-black lowercase">waya</span>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }} className="relative z-10 flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg aspect-[4/3] rounded-[20px] overflow-hidden border-2 border-white/20">
            <Image src="/images/hero-section-image.webp" alt="Student" fill className="object-cover -scale-x-100" priority sizes="(max-width: 768px) 100vw, 50vw" style={{ borderRadius: '20px' }} />
          </div>
        </motion.div>
        {/* Decorative circles */}
        <div className="absolute top-12 left-12 w-3 h-3 rounded-full bg-white/20" />
        <div className="absolute top-24 right-16 w-2.5 h-2.5 rounded-full bg-white/15" />
        <div className="absolute top-1/3 left-20 w-2 h-2 rounded-full bg-white/10" />
        <div className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-white/15" />
        <div className="absolute top-1/2 left-10 w-2 h-2 rounded-full bg-white/[0.12]" />
        <div className="absolute bottom-1/3 right-20 w-2.5 h-2.5 rounded-full bg-white/15" />
        <div className="absolute bottom-1/3 left-16 w-2 h-2 rounded-full bg-white/10" />
        <div className="absolute bottom-24 right-12 w-3 h-3 rounded-full bg-white/20" />
        <div className="absolute bottom-12 left-20 w-2 h-2 rounded-full bg-white/[0.12]" />
      </motion.div>

      {/* Right panel — Form side */}
      <div className="w-full md:w-1/2 min-h-screen relative flex flex-col items-center justify-start md:justify-center">
        {/* Mobile logo */}
        <div className="md:hidden fixed top-5 left-5 z-10">
          <Link href="/" className="font-logo text-2xl text-brand-primary font-black lowercase">waya</Link>
        </div>
        <div className="overflow-y-auto pt-24 md:pt-0 px-5 md:px-16 pb-8 w-full">
          <div className="w-full max-w-md mx-auto flex flex-col gap-8">



          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.45, 0, 0.1, 1] }}>

              {/* ═══ GET STARTED FLOW ═══ */}
              {view === 'get-started' && (
                <div className="flex flex-col gap-6">
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                      className="px-4 py-4 rounded-2xl bg-error/[0.06] text-center">
                      <p className="text-sm text-error font-body font-medium">{error}</p>
                    </motion.div>
                  )}
                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-border-default">
                        <motion.div
                          className="h-full rounded-full bg-brand-primary"
                          initial={{ width: 0 }}
                          animate={{ width: s <= step ? '100%' : '0%' }}
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: s <= step ? (s - 1) * 0.05 : 0 }}
                        />
                      </div>
                    ))}
                    <span className="text-sm text-text-muted font-body ml-2 shrink-0">{step}/5</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={step} variants={fadeStep} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.45, 0, 0.1, 1] }}>

                      {/* Step 1: Welcome */}
                      {step === 1 && (
                        <div className="flex flex-col gap-6">
                          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">Your world is your classroom.</h1>
                          <p className="text-lg text-text-secondary font-body leading-relaxed">Waya turns the subjects you study into lessons that connect with the hobbies and interests you already love.</p>
                          <div className="mt-6 flex flex-col gap-4">
                            <Button onClick={goNext} size="lg" className="w-full rounded-full py-4 text-lg">Get Started</Button>
                            <p className="text-sm text-text-muted font-body text-center">Already have an account? <Link href="/auth?view=login" className="text-brand-primary font-semibold hover:underline">Sign In</Link></p>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Name */}
                      {step === 2 && (
                        <form onSubmit={(e) => { e.preventDefault(); if (canProceed()) goNext(); }} className="flex flex-col gap-6">
                          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">What should I call you?</h1>
                          <p className="text-lg text-text-secondary font-body leading-relaxed">Just your first name is fine. This is how I&apos;ll address you throughout our sessions.</p>
                          <Input
                            value={name}
                            onChange={(v) => { setName(v); setNameBlurred(true); if (v.length > 0 && v.length < 3) setNameError('Name must be at least 3 characters.'); else if (v.length === 0 && nameBlurred) setNameError('This field cannot be empty.'); else setNameError(null); }}
                            onBlur={() => { setNameBlurred(true); if (name.trim().length === 0) setNameError('This field cannot be empty.'); }}
                            placeholder="Your name"
                            autoComplete="name"
                            autoFocus
                            error={nameError}
                          />
                          <div className="mt-6 flex flex-col gap-3">
                            <Button type="submit" disabled={!canProceed()} size="lg" className="w-full rounded-full py-4 text-lg">Continue</Button>
                            <button type="button" onClick={goBack} className="text-sm text-text-muted font-body hover:text-text-primary transition-colors text-center py-2">&larr; Back</button>
                          </div>
                        </form>
                      )}

                      {/* Step 3: Interests */}
                      {step === 3 && (
                        <div className="flex flex-col gap-6">
                          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">What are you into?</h1>
                          <p className="text-lg text-text-secondary font-body leading-relaxed">Pick a few hobbies and we&apos;ll tailor every lesson to your world.</p>
                          <div className="flex flex-wrap gap-3">
                            {INTERESTS.map((hobby) => {
                              const selected = interests.includes(hobby.id);
                              return (
                                <motion.button key={hobby.id} onClick={() => toggleInterest(hobby.id)}
                                  whileTap={{ scale: 0.93 }}
                                  animate={{ scale: selected ? [1, 1.08, 1] : 1 }}
                                  transition={{ duration: 0.25 }}
                                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${selected ? 'text-white bg-brand-primary border-2 border-brand-primary' : 'border-2 border-border-default text-text-secondary hover:border-brand-primary/40'}`}>
                                  {hobby.label}
                                </motion.button>
                              );
                            })}
                          </div>
                          <p className="text-sm text-text-muted font-body">{interests.length} selected (min 2, max 5)</p>
                          <div className="mt-6 flex flex-col gap-3">
                            <Button onClick={goNext} disabled={!canProceed()} size="lg" className="w-full rounded-full py-4 text-lg">Continue</Button>
                            <button type="button" onClick={goBack} className="text-sm text-text-muted font-body hover:text-text-primary transition-colors text-center py-2">&larr; Back</button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Subject */}
                      {step === 4 && (
                        <div className="flex flex-col gap-6">
                          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">What are we studying?</h1>
                          <p className="text-lg text-text-secondary font-body leading-relaxed">Pick the subject you want to focus on first.</p>
                          <div className="flex flex-col gap-3">
                            {SUBJECTS.map((subj) => {
                              const isSelected = selectedSubject === subj.id;
                              return (
                                <motion.button key={subj.id} onClick={() => setSelectedSubject(subj.id)}
                                  whileTap={{ scale: 0.97 }}
                                  animate={isSelected ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className={`flex items-center gap-4 rounded-2xl p-4 border-2 text-left transition-all duration-200 bg-white ${
                                    isSelected
                                      ? 'border-brand-primary border-b-4 shadow-inner translate-y-0.5'
                                      : 'border-border-default hover:border-b-4 hover:border-border-default hover:translate-y-0.5'
                                  }`}>
                                  <motion.div animate={{ scale: isSelected ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: subj.bg }}>
                                    <span>{subj.icon}</span>
                                  </motion.div>
                                  <div className="flex-1">
                                    <p className="text-base font-bold text-text-primary">{subj.label}</p>
                                    <p className="text-sm text-text-muted">{subj.desc}</p>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                          <div className="mt-6 flex flex-col gap-3">
                            <Button onClick={goNext} disabled={!canProceed()} size="lg" className="w-full rounded-full py-4 text-lg">Continue</Button>
                            <button type="button" onClick={goBack} className="text-sm text-text-muted font-body hover:text-text-primary transition-colors text-center py-2">&larr; Back</button>
                          </div>
                        </div>
                      )}

                      {/* Step 5: Credentials */}
                      {step === 5 && (
                        <form onSubmit={(e) => { e.preventDefault(); if (canProceed() && !isLoading) handleSignUp(); }} className="flex flex-col gap-6">
                          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">Let&apos;s make it official.</h1>
                          <p className="text-lg text-text-secondary font-body leading-relaxed">Create your free account and we&apos;ll save everything.</p>
                          <Input
                            value={email}
                            onChange={(v) => { setEmail(v); setEmailRegexValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)); }}
                            type="email"
                            placeholder="Email address"
                            autoComplete="email"
                            error={email.length > 0 && !emailRegexValid ? 'Enter a valid email address.' : null}
                          />
                          <Input
                            value={password}
                            onChange={handlePasswordChange}
                            type="password"
                            placeholder="Password"
                            autoComplete="new-password"
                          />
                          {password.length > 0 && !(passwordReqs.len && passwordReqs.upper && passwordReqs.lower && passwordReqs.num && passwordReqs.special) && (
                            <div className="flex flex-col gap-1.5 -mt-3">
                              {[
                                { met: passwordReqs.len, label: 'At least 8 characters' },
                                { met: passwordReqs.upper, label: 'One uppercase letter' },
                                { met: passwordReqs.lower, label: 'One lowercase letter' },
                                { met: passwordReqs.num, label: 'One number' },
                                { met: passwordReqs.special, label: 'One special character' },
                              ].map((req) => (
                                <p key={req.label} className={`text-xs font-body flex items-center gap-1.5 ${req.met ? 'text-success' : 'text-text-muted'}`}>
                                  {req.met ? <CheckCircle2 size={13} /> : <span className="w-[13px] h-[13px] rounded-full border border-border-default inline-block" />}
                                  {req.label}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-col gap-3">
                            <Button type="submit" disabled={!canProceed()} isLoading={isLoading} size="lg" className="w-full rounded-full py-4 text-lg">
                              {isLoading ? 'Creating Account...' : 'Create My Account'}
                            </Button>
                            {showLoginLink && (
                              <p className="text-center text-sm text-text-muted font-body">
                                Already have an account?{' '}
                                <Link href="/auth?view=login" className="text-brand-primary font-semibold hover:underline">Sign In</Link>
                              </p>
                            )}
                            <button type="button" onClick={goBack} className="text-sm text-text-muted font-body hover:text-text-primary transition-colors text-center py-2">&larr; Back</button>
                          </div>
                        </form>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* ═══ LOGIN ═══ */}
              {view === 'login' && (
                <form onSubmit={(e) => { e.preventDefault(); if (!isLoading && email.trim() && password) handleSignIn(); }} className="flex flex-col gap-6">
                  <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">Welcome back!</h1>
                  <Input
                    value={email}
                    onChange={setEmail}
                    onFocus={() => setError(null)}
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    autoFocus
                  />
                  <Input
                    value={password}
                    onChange={setPassword}
                    onFocus={() => setError(null)}
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                  <Link href="/auth?view=forgot-password" className="text-sm text-text-secondary hover:text-brand-primary transition-colors text-right -mt-2">Forgot Password?</Link>
                  <div className="mt-4 flex flex-col gap-4">
                    <Button type="submit" disabled={isLoading || !email.trim() || !password} isLoading={isLoading} size="lg" className="w-full rounded-full py-4 text-lg">
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    <p className="text-center text-sm text-text-secondary">Don&apos;t have an account? <Link href="/auth?view=get-started" className="text-brand-primary font-semibold hover:underline">Get Started</Link></p>
                  </div>
                </form>
              )}

              {/* ═══ FORGOT PASSWORD ═══ */}
              {view === 'forgot-password' && (
                <div className="flex flex-col gap-6">
                  {resetSent ? (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-4 py-8">
                      <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L8 14L16 6" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <h2 className="text-headline-sm text-text-primary font-heading">Check your email</h2>
                      <p className="text-body-md text-text-secondary font-body max-w-xs leading-relaxed">
                        If an account exists for <span className="font-medium text-text-primary">{email}</span>, you&apos;ll receive a password reset link shortly.
                      </p>
                      <Link href="/auth?view=login" className="text-label-md text-brand-primary font-body font-semibold hover:text-brand-hover transition-colors mt-2">
                        Back to sign in
                      </Link>
                    </motion.div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if (!isLoading && email.trim()) handleResetPassword(); }} className="flex flex-col gap-6">
                      <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-tight text-text-primary">Reset your password</h1>
                      <p className="text-body-md text-text-secondary font-body leading-relaxed">Enter your email and we&apos;ll send you a reset link.</p>
                      <Input
                        value={email}
                        onChange={setEmail}
                        type="email"
                        placeholder="Email address"
                        autoComplete="email"
                        autoFocus
                      />
                      <div className="mt-4 flex flex-col gap-3">
                        <Button type="submit" disabled={isLoading || !email.trim()} isLoading={isLoading} size="lg" className="w-full rounded-full py-4 text-lg">
                          {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                      </div>
                    </form>
                  )}
                  {!resetSent && (
                    <Link href="/auth?view=login" className="text-sm text-text-muted font-body hover:text-text-primary transition-colors text-center">&larr; Back To Sign In</Link>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 animate-spin border-border-default" style={{ borderTopColor: 'var(--color-brand-primary)', animationDuration: '0.65s' }} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
