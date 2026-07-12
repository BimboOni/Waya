'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOBBIES } from '@/lib/constants';
import { WayaMascot } from '@/components/ui/WayaMascot';
import { InterestCard } from '@/components/onboarding/InterestCard';
import { SignInStep } from '@/components/onboarding/steps/SignInStep';
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
              className="w-full sm:w-64 min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0 flex items-center justify-center">
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
                'active:translate-y-[2px] active:border-b-[1px] transition-all duration-100',
                selected === subj.id
                  ? 'border-brand-primary border-b-4 bg-bg-card shadow-inner translate-y-0.5'
                  : 'border-border-default bg-bg-card sm:hover:border-b-4 sm:hover:border-border-default sm:hover:translate-y-0.5',
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

