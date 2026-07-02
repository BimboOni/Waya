'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOBBIES } from '@/lib/constants';

// ── Types ──────────────────────────────────────────────────────
type StepId = 'goal' | 'subjects' | 'interests' | 'pace';

interface WizardState {
  goal: string | null;
  subjects: string[];
  interests: string[];
  pace: string | null;
}

// ── Step definitions ────────────────────────────────────────────
const STEPS: StepId[] = ['goal', 'subjects', 'interests', 'pace'];

const GOALS = [
  { id: 'exams', emoji: '🎓', label: 'Ace my exams', description: 'Targeted revision that actually sticks' },
  { id: 'fun', emoji: '🧠', label: 'Learn for fun', description: 'Explore ideas that spark curiosity' },
  { id: 'work', emoji: '💼', label: 'Level up at work', description: 'Build knowledge that moves my career' },
  { id: 'habit', emoji: '🌱', label: 'Build a daily habit', description: 'A little learning every day adds up' },
];

const SUBJECT_OPTIONS = [
  { id: 'math', emoji: '🔢', label: 'Mathematics', description: 'Numbers, proofs, and patterns' },
  { id: 'science', emoji: '🧪', label: 'Science & Tech', description: 'Biology, physics, and code' },
  { id: 'history', emoji: '🏛️', label: 'History & Culture', description: 'People, places, and pivotal moments' },
  { id: 'arts', emoji: '🎭', label: 'Arts & Humanities', description: 'Language, music, and philosophy' },
];

const PACE_OPTIONS = [
  { id: '5', emoji: '☕', label: 'Casual', sub: '5 min / day', description: 'Quick daily spark' },
  { id: '15', emoji: '🎯', label: 'Regular', sub: '15 min / day', description: 'Steady and consistent' },
  { id: '30', emoji: '🔥', label: 'Intensive', sub: '30 min / day', description: 'Deep dives every session' },
];

// ── Animation variants ─────────────────────────────────────────
const slide = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};
const TRANSITION = { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: TRANSITION },
};

// ── Main component ─────────────────────────────────────────────
export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    goal: null,
    subjects: [],
    interests: [],
    pace: null,
  });

  const stepId = STEPS[stepIndex];

  const isStepComplete = (): boolean => {
    if (stepId === 'goal') return !!state.goal;
    if (stepId === 'subjects') return state.subjects.length >= 1;
    if (stepId === 'interests') return state.interests.length >= 2;
    if (stepId === 'pace') return !!state.pace;
    return false;
  };

  const goNext = async () => {
    if (!isStepComplete()) return;
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    } else {
      await finish();
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setDirection(-1);
    setStepIndex((i) => i - 1);
  };

  const finish = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: state.interests }),
      });
      if (!res.ok) throw new Error('save failed');
      router.push('/study');
    } catch {
      setSaveError('Something went wrong saving your preferences. Please try again.');
      setIsSaving(false);
    }
  };

  const toggleMulti = (key: 'subjects' | 'interests', id: string, max: number) => {
    setState((prev) => {
      const arr = prev[key];
      if (arr.includes(id)) return { ...prev, [key]: arr.filter((s) => s !== id) };
      if (arr.length >= max) return prev;
      return { ...prev, [key]: [...arr, id] };
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur-sm border-b border-border-default px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all duration-default ease-waya disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Progress pills */}
        <div className="flex items-center gap-2 flex-1" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemax={STEPS.length} aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                flex: i === stepIndex ? 2 : 1,
                backgroundColor: i < stepIndex
                  ? 'var(--color-brand-primary)'
                  : i === stepIndex
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-border-default)',
                opacity: i > stepIndex ? 0.5 : 1,
              }}
            />
          ))}
        </div>

        <span className="text-label-sm text-text-muted font-body shrink-0">
          {stepIndex + 1} / {STEPS.length}
        </span>

        {/* Logo */}
        <span className="text-label-lg text-brand-primary font-heading font-semibold">Waya</span>
      </div>

      {/* ── Step content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
        <div className="w-full max-w-[600px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={stepId}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
              className="flex flex-col gap-8"
            >
              {stepId === 'goal' && (
                <GoalStep
                  selected={state.goal}
                  onSelect={(id) => setState((p) => ({ ...p, goal: id }))}
                />
              )}
              {stepId === 'subjects' && (
                <SubjectsStep
                  selected={state.subjects}
                  onToggle={(id) => toggleMulti('subjects', id, 3)}
                />
              )}
              {stepId === 'interests' && (
                <InterestsStep
                  selected={state.interests}
                  onToggle={(id) => toggleMulti('interests', id, 3)}
                />
              )}
              {stepId === 'pace' && (
                <PaceStep
                  selected={state.pace}
                  onSelect={(id) => setState((p) => ({ ...p, pace: id }))}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom action bar ───────────────────────────────────── */}
      <div className="sticky bottom-0 bg-bg-primary/95 backdrop-blur-sm border-t border-border-default px-4 py-4">
        <div className="w-full max-w-[600px] mx-auto flex flex-col gap-2">
          {saveError && (
            <p className="text-label-md text-error font-body text-center" role="alert">{saveError}</p>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!isStepComplete() || isSaving}
            className="w-full min-h-[52px] rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-medium flex items-center justify-center gap-2 transition-all duration-default ease-waya hover:bg-brand-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            aria-label={stepIndex === STEPS.length - 1 ? 'Finish setup and go to study' : 'Continue to next step'}
          >
            {isSaving ? (
              <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
            ) : stepIndex === STEPS.length - 1 ? (
              <>Start learning ✦</>
            ) : (
              <>Continue →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step: Goal ─────────────────────────────────────────────────
function GoalStep({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      <StepHeader
        step={1}
        title="What brings you to Waya?"
        sub="We'll personalise your experience to match your goal."
      />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {GOALS.map(({ id, emoji, label, description }) => (
          <motion.div key={id} variants={cardReveal}>
            <SelectCard
              emoji={emoji}
              label={label}
              description={description}
              isSelected={selected === id}
              onClick={() => onSelect(id)}
              aria-label={`Goal: ${label}`}
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// ── Step: Subjects ─────────────────────────────────────────────
function SubjectsStep({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <>
      <StepHeader
        step={2}
        title="Which subjects do you study?"
        sub="Pick everything that applies — Waya bridges them all."
        counter={`${selected.length} selected`}
      />
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {SUBJECT_OPTIONS.map(({ id, emoji, label, description }) => (
          <motion.div key={id} variants={cardReveal}>
            <SelectCard
              emoji={emoji}
              label={label}
              description={description}
              isSelected={selected.includes(id)}
              onClick={() => onToggle(id)}
              aria-label={`${selected.includes(id) ? 'Deselect' : 'Select'} ${label}`}
            multi
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// ── Step: Interests ────────────────────────────────────────────
function InterestsStep({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <>
      <StepHeader
        step={3}
        title="What are you into?"
        sub="Pick 2–3 interests. Waya uses these to make every explanation click."
        counter={`${selected.length} / 3`}
      />
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {HOBBIES.map(({ id, icon, label }) => (
          <motion.div key={id} variants={cardReveal}>
            <InterestTile
              emoji={icon}
              label={label}
              isSelected={selected.includes(id)}
              onClick={() => onToggle(id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// ── Step: Pace ─────────────────────────────────────────────────
function PaceStep({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <>
      <StepHeader
        step={4}
        title="How much time can you give each day?"
        sub="You can always change this later. Even 5 minutes builds a habit."
      />
      <motion.div
        className="flex flex-col gap-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {PACE_OPTIONS.map(({ id, emoji, label, sub, description }) => (
          <motion.div key={id} variants={cardReveal}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-default ease-waya',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
                selected === id
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-border-default bg-bg-card hover:border-brand-primary/50 hover:bg-bg-secondary/60',
              )}
              aria-pressed={selected === id}
              aria-label={`${label}: ${sub}`}
            >
              <span className="text-3xl shrink-0" aria-hidden="true">{emoji}</span>
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-title-lg font-heading', selected === id ? 'text-brand-primary' : 'text-text-primary')}>
                    {label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-label-sm font-body bg-bg-secondary text-text-muted">{sub}</span>
                </div>
                <span className="text-body-sm text-text-muted font-body">{description}</span>
              </div>
              {selected === id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                  aria-hidden="true"
                >
                  <Check size={13} className="text-brand-on-primary" />
                </motion.div>
              )}
            </button>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// ── Reusable: Step header ──────────────────────────────────────
function StepHeader({ step, title, sub, counter }: { step: number; title: string; sub: string; counter?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-md text-brand-primary font-body">Step {step} of {STEPS.length}</p>
      <h1 className="text-display-sm text-text-primary font-heading leading-tight">{title}</h1>
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-md text-text-secondary font-body">{sub}</p>
        {counter && <span className="text-label-md text-text-muted font-body shrink-0">{counter}</span>}
      </div>
    </div>
  );
}

// ── Reusable: Goal / Subject card ──────────────────────────────
function SelectCard({
  emoji, label, description, isSelected, onClick, multi = false, ...rest
}: {
  emoji: string; label: string; description: string;
  isSelected: boolean; onClick: () => void; multi?: boolean;
  'aria-label'?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full flex flex-col items-start gap-2 p-5 rounded-2xl border-2 text-left',
        'transition-colors duration-default ease-waya',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-brand-primary bg-brand-primary/5'
          : 'border-border-default bg-bg-card hover:border-brand-primary/50 hover:bg-bg-secondary/60',
      )}
      aria-pressed={isSelected}
      {...rest}
    >
      {/* Multi-select checkmark */}
      {multi && (
        <div
          className={cn(
            'absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-default ease-waya',
            isSelected ? 'border-brand-primary bg-brand-primary' : 'border-border-default bg-bg-primary',
          )}
          aria-hidden="true"
        >
          {isSelected && <Check size={11} className="text-brand-on-primary" />}
        </div>
      )}

      {/* Single-select check */}
      {!multi && isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <Check size={11} className="text-brand-on-primary" />
        </motion.div>
      )}

      <span className="text-3xl" aria-hidden="true">{emoji}</span>
      <div className="flex flex-col gap-0.5">
        <span className={cn('text-title-lg font-heading', isSelected ? 'text-brand-primary' : 'text-text-primary')}>
          {label}
        </span>
        <span className="text-body-sm text-text-muted font-body">{description}</span>
      </div>
    </motion.button>
  );
}

// ── Reusable: Interest tile (compact, icon-first) ──────────────
function InterestTile({
  emoji, label, isSelected, onClick,
}: {
  emoji: string; label: string; isSelected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 w-full min-h-[100px]',
        'transition-colors duration-default ease-waya',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-brand-primary bg-brand-primary/5'
          : 'border-border-default bg-bg-card hover:border-brand-primary/50 hover:bg-bg-secondary/60',
      )}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${label}`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <Check size={9} className="text-brand-on-primary" />
        </motion.div>
      )}
      <span className="text-3xl" aria-hidden="true">{emoji}</span>
      <span className={cn('text-label-lg font-heading font-medium text-center leading-tight', isSelected ? 'text-brand-primary' : 'text-text-primary')}>
        {label}
      </span>
    </motion.button>
  );
}
