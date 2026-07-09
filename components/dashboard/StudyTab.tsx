'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronRight, IconArrowUp, IconArrowsMaximize, IconX, IconChevronDown, IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import { useWayaStore } from '@/store/useWayaStore';
import { SUBJECT_CONTAINER_COLORS, SUBJECT_TEXT_COLORS, SUBJECT_META } from '@/lib/constants';
import { formatRelativeDate, formatInterests } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { MockSession } from '@/types';

const SUGGESTED_TOPICS: Record<string, Record<string, string[]>> = {
  CreativeArts: {
    Fashion: ['History of fashion illustration', 'Colour theory in design', 'What is typography?'],
    Music: ['How chord progressions create emotion', 'The physics of sound waves', 'What makes a hit song?'],
    Gaming: ['Visual storytelling in game design', 'How pixel art became an art form', 'Colour palettes in indie games'],
    default: ['The golden ratio in art', 'How music theory works', 'What makes great design?'],
  },
  Mathematics: {
    Gaming: ['How probability works in video games', 'Game theory basics', 'The math behind loot boxes'],
    Sports: ['The geometry behind a perfect free kick', 'Statistics in basketball', 'How odds work in betting'],
    Music: ['Why music and maths are the same language', 'Fibonacci in nature', 'The math of rhythm'],
    default: ['Why prime numbers matter', 'Algebra in everyday life', 'How calculus was invented'],
  },
  ScienceTech: {
    Sneakers: ['The materials science behind Air Max soles', 'How rubber is engineered', 'Shoe biomechanics'],
    Gaming: ['How game physics engines simulate reality', 'GPU rendering explained', 'What is ray tracing?'],
    Fashion: ['How synthetic fabrics are engineered', 'The chemistry of dyes', 'Smart textile technology'],
    default: ['How batteries actually work', 'The science of cooking', 'What is CRISPR?'],
  },
  HistoryCulture: {
    Music: ['How the blues shaped modern music', 'History of hip-hop culture', 'Music as protest'],
    Gaming: ['Ancient civilisations that inspired game worlds', 'The history of chess', 'Video game history'],
    Fashion: ['How fashion reflected political power', 'The history of streetwear', 'Ancient textile trade routes'],
    default: ['Why empires fall', 'The Silk Road explained', 'How writing was invented'],
  },
};

function getSuggestedTopics(subject?: string, interests?: string[]): string[] {
  const sub = subject ?? 'Mathematics';
  const subTopics = SUGGESTED_TOPICS[sub];
  if (!subTopics) return SUGGESTED_TOPICS.Mathematics.default;
  const firstInterest = interests?.[0];
  if (firstInterest && subTopics[firstInterest]) return subTopics[firstInterest];
  return subTopics.default;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface StudyTabProps {
  sessions: MockSession[];
  onStartSession: (topic: string, subject: string) => void;
  onResumeSession: (session: MockSession) => void;
  onViewHistory: () => void;
}

const SUBJECTS = [
  { id: 'Mathematics', label: 'Mathematics' },
  { id: 'ScienceTech', label: 'Science & Tech' },
  { id: 'HistoryCulture', label: 'History & Culture' },
  { id: 'CreativeArts', label: 'Creative Arts' },
];

export function StudyTab({ sessions, onStartSession, onResumeSession, onViewHistory }: StudyTabProps) {
  const router = useRouter();
  const { user } = useWayaStore();
  const [topic, setTopic] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [activeSubject, setActiveSubject] = useState(user?.preferredSubject ?? 'Mathematics');
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync active subject whenever the store's preferredSubject updates
  useEffect(() => {
    if (user?.preferredSubject) {
      setActiveSubject(user.preferredSubject);
    }
  }, [user?.preferredSubject]);
  const expandedRef = useRef<HTMLTextAreaElement>(null);
  const subjectMenuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBlur, setShowLeftBlur] = useState(false);
  const [showRightBlur, setShowRightBlur] = useState(true);

  const updateScrollBlurs = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftBlur(el.scrollLeft > 4);
    setShowRightBlur(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useLayoutEffect(() => {
    updateScrollBlurs();
    window.addEventListener('resize', updateScrollBlurs);
    return () => window.removeEventListener('resize', updateScrollBlurs);
  }, [updateScrollBlurs]);

  const suggested = getSuggestedTopics(activeSubject, user?.interests);
  const recentSessions = sessions;
  const isFirstTime = sessions.length === 0;
  const subjectLabel = activeSubject
    ? { Mathematics: 'Mathematics', ScienceTech: 'Science & Tech', HistoryCulture: 'History & Culture', CreativeArts: 'Creative Arts' }[activeSubject] ?? activeSubject
    : null;
  const chips = isFirstTime && subjectLabel
    ? [`Introduction to ${subjectLabel}`, ...suggested.slice(0, 2)]
    : suggested;
  const interestPhrase = formatInterests(user?.interests ?? []);
  const subtext = interestPhrase
    ? `What topic are you curious about? I'll break it down through ${interestPhrase}, then test your understanding.`
    : 'What topic are you curious about? I\'ll break it down and test your understanding.';

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH <= 40) {
      el.style.removeProperty('height');
      setIsCompact(true);
    } else {
      el.style.height = Math.min(scrollH, 200) + 'px';
      setIsCompact(false);
    }
  }, []);

  useEffect(() => {
    if (!topic) {
      setIsCompact(true);
      if (textareaRef.current) textareaRef.current.style.removeProperty('height');
      return;
    }
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [topic, autoResize]);

  useEffect(() => {
    if (expandedRef.current) autoResize(expandedRef.current);
  }, [topic, autoResize]);

  useEffect(() => {
    if (!showSubjectMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (subjectMenuRef.current && !subjectMenuRef.current.contains(e.target as Node)) {
        setShowSubjectMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSubjectMenu]);

  const handleSubmit = useCallback(() => {
    const trimmed = topic.trim();
    if (trimmed.length < 3) return;
    onStartSession(trimmed, activeSubject);
    setTopic('');
    setIsExpanded(false);
  }, [topic, activeSubject, onStartSession]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 flex flex-col justify-center gap-8 items-center text-center overflow-y-auto pb-24"
      >
        <div>
          <h1 className="text-[clamp(1.5rem,1rem+1.5vw,1.875rem)] font-medium text-text-primary tracking-tight">
            {getGreeting()}, {user?.name ?? 'Learner'}!
          </h1>
          <p className="text-body-md text-text-muted font-normal mt-2 max-w-lg mx-auto">
            {subtext}
          </p>
        </div>

        {/* Subject context pill */}
        <div className="relative mx-auto mb-4" ref={subjectMenuRef}>
          <button
            onClick={() => setShowSubjectMenu(!showSubjectMenu)}
            className="flex items-center gap-1.5 text-sm text-text-secondary bg-bg-card border border-border-default rounded-full px-3 py-1.5 hover:bg-bg-secondary hover:text-text-primary hover:border-brand-primary/30 transition-all duration-200 w-fit"
          >
            {SUBJECTS.find((s) => s.id === activeSubject)?.label}
            <IconChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${showSubjectMenu ? 'rotate-180' : ''}`} />
          </button>
          {showSubjectMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-bg-card border border-border-default dark:border-slate-700 rounded-lg overflow-hidden z-20 min-w-[200px]">
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => { setActiveSubject(sub.id); setShowSubjectMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all duration-150 ${sub.id === activeSubject ? 'bg-brand-primary/10 text-text-primary font-medium' : 'text-text-muted dark:text-slate-400 hover:text-text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${sub.id === activeSubject ? 'bg-brand-primary' : 'bg-text-muted dark:bg-slate-400'}`} />
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`w-full max-w-xl mx-auto bg-bg-card border-2 border-border-default transition-all ${isCompact ? 'flex flex-row items-center h-[60px] rounded-full px-4' : 'flex flex-col rounded-2xl'}`}>
          <textarea
            ref={textareaRef}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onInput={(e) => autoResize(e.currentTarget)}
            onKeyDown={handleKeyDown}
            placeholder=""
            rows={1}
            className={`bg-transparent text-text-primary font-body text-body-lg placeholder:text-text-muted resize-none border-none outline-none ${isCompact ? 'flex-1 py-0' : 'w-full px-4 pt-3 pb-1 min-h-0 max-h-[200px] overflow-y-auto'}`}
          />
          {!isCompact && (
          <div className="flex justify-between items-center w-full px-3 pb-3">
            {topic.length > 0 && (
              <div className="relative group">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  aria-label="Expand"
                >
                  <IconArrowsMaximize size={20} />
                </button>
                <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                  Expand
                </span>
              </div>
            )}
            <div className="relative group ml-auto">
              <button
                onClick={handleSubmit}
                disabled={topic.trim().length < 3}
                className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Ask Waya"
              >
                <IconArrowUp size={18} />
              </button>
              <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                Ask Waya
              </span>
            </div>
          </div>
          )}
          {isCompact && (
          <div className="relative group shrink-0 ml-auto">
            <button
              onClick={handleSubmit}
              disabled={topic.trim().length < 3}
              className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Ask Waya"
            >
              <IconArrowUp size={18} />
            </button>
            <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
              Ask Waya
            </span>
          </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
            >
              <div className="flex items-center justify-end px-6 sm:px-10 pt-6 sm:pt-8 pb-4">
                <div className="relative group">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                    aria-label="Close"
                  >
                    <IconX size={20} />
                  </button>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-top scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                    Close
                  </span>
                </div>
              </div>
              <div className="flex-1 flex flex-col px-6 sm:px-10 pb-6 sm:pb-10 max-w-4xl mx-auto w-full overflow-y-auto">
                <div className="max-w-xl mx-auto text-center mb-8">
                  <h2 className="text-headline-md text-text-primary font-heading mb-2">What do you want to learn?</h2>
                  <p className="text-body-md text-text-muted font-normal">
                    {interestPhrase ? `What topic are you curious about? I'll break it down through ${interestPhrase}, then test your understanding.` : "What topic are you curious about? I'll break it down and test your understanding."}
                  </p>
                </div>
                <textarea
                  ref={expandedRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onInput={(e) => autoResize(e.currentTarget)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your topic here..."
                  className="w-full flex-1 min-h-[240px] bg-bg-card border-2 border-border-default rounded-2xl p-6 text-body-xl text-text-primary font-body placeholder:text-text-muted resize-none outline-none"
                  autoFocus
                />
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={topic.trim().length < 3}
                    size="lg"
                    className="px-12"
                  >
                    Ask Waya
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 justify-center w-full max-w-xl">
          {chips.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="px-3 py-1.5 rounded-full text-body-sm text-text-muted font-body border border-border-default hover:border-brand-primary/40 hover:text-text-primary hover:bg-bg-secondary transition-all"
            >
              ✦ {s}
            </button>
          ))}
        </div>
      </motion.div>

      {recentSessions.length > 0 && !isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-slate-50 dark:bg-[#121212] border-t border-slate-200 dark:border-slate-800 z-50">
          {showLeftBlur && <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-[#121212] dark:via-[#121212]/80 z-20 pointer-events-none" />}
          {showRightBlur && <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-[#121212] dark:via-[#121212]/80 z-20 pointer-events-none" />}
          <div ref={scrollRef} onScroll={updateScrollBlurs} className="flex flex-row overflow-x-auto justify-start items-center px-4 sm:px-6 lg:px-8 py-6 gap-4 scrollbar-hide w-full h-full">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => s.completed ? router.push(`/dashboard/sessions/${s.id}`) : onResumeSession(s)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary dark:hover:bg-bg-card border border-border-default transition-all text-sm shrink-0 cursor-pointer w-[260px]"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: SUBJECT_CONTAINER_COLORS[s.subject] ?? 'var(--color-bg-secondary)', color: SUBJECT_TEXT_COLORS[s.subject] ?? 'var(--color-text-secondary)' }}
                >
                  {SUBJECT_META[s.subject]?.label?.charAt(0) ?? '?'}
                </div>
                <span className="truncate flex-1 min-w-0">{s.topic}</span>
                {s.completed ? (
                  <span className="text-label-xs font-semibold shrink-0" style={{ color: 'var(--color-success)' }}>
                    +{s.xpEarned}
                  </span>
                ) : (
                  <span className="text-body-sm font-semibold shrink-0" style={{ color: 'var(--color-brand-primary)' }}>
                    Resume
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
