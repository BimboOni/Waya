'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconArrowUp } from '@tabler/icons-react';
import { SUBJECT_META, SUBJECT_COLORS, SUBJECT_CONTAINER_COLORS, SUBJECT_TEXT_COLORS } from '@/lib/constants';
import { useWayaStore } from '@/store/useWayaStore';
import type { MockSession } from '@/types';

const SUBJECTS = [
  { id: 'Mathematics', label: 'Mathematics', desc: 'Algebra, geometry, calculus' },
  { id: 'ScienceTech', label: 'Science & Tech', desc: 'Physics, biology, coding' },
  { id: 'HistoryCulture', label: 'History & Culture', desc: 'World history, civics, geography' },
  { id: 'CreativeArts', label: 'Creative Arts', desc: 'Music, art, literature, design' },
];

const SUGGESTED_TOPICS: Record<string, string[]> = {
  Mathematics: ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Prime Numbers'],
  ScienceTech: ['Physics', 'Biology', 'Chemistry', 'Coding', 'Space Exploration'],
  HistoryCulture: ['World History', 'Geography', 'Ancient Civilizations', 'Government', 'Trade Routes'],
  CreativeArts: ['Music Theory', 'Visual Arts', 'Literature', 'Design', 'Film History'],
};

interface SubjectsTabProps {
  sessions: MockSession[];
  onStartSession: (topic: string, subject?: string) => void;
  onResumeSession: (session: MockSession) => void;
}

function SubjectDetailView({
  subjectKey,
  sessions,
  onBack,
  onStartSession,
  onResumeSession,
}: {
  subjectKey: string;
  sessions: MockSession[];
  onBack: () => void;
  onStartSession: (topic: string, subject?: string) => void;
  onResumeSession: (session: MockSession) => void;
}) {
  const meta = SUBJECT_META[subjectKey];
  const [topic, setTopic] = useState('');
  const [isCompact, setIsCompact] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH <= 40) { el.style.removeProperty('height'); setIsCompact(true); }
    else { el.style.height = Math.min(scrollH, 200) + 'px'; setIsCompact(false); }
  }, []);

  useEffect(() => { setTopic(''); setIsCompact(true); if (textareaRef.current) textareaRef.current.style.removeProperty('height'); }, [subjectKey]);
  useEffect(() => {
    if (!topic) { setIsCompact(true); if (textareaRef.current) textareaRef.current.style.removeProperty('height'); return; }
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [topic, autoResize]);

  const handleSubmit = () => {
    const trimmed = topic.trim();
    if (trimmed.length < 3) return;
    onStartSession(trimmed, subjectKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const recentSessions = sessions.filter((s) => s.subject === subjectKey);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-body-md text-text-muted hover:text-text-primary transition-colors mt-8 mb-8 w-fit outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-lg"
        >
          <IconArrowLeft size={16} /> Back
        </button>

        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto pb-24">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="text-3xl font-medium text-text-primary tracking-tight mb-2">{meta?.label ?? subjectKey}</h1>
            <p className="text-body-md text-text-muted max-w-lg">
              Pick a topic or type your own. I&apos;ll explain it through your interests and challenge you with a synthesis question.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
          <div className={`w-full max-w-xl mx-auto bg-bg-card border-2 border-border-default transition-all ${isCompact ? 'flex flex-row items-center h-[60px] rounded-full px-4' : 'flex flex-col rounded-2xl'}`}>
            <textarea
              ref={textareaRef}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onInput={(e) => autoResize(e.currentTarget)}
              onKeyDown={handleKeyDown}
              placeholder="What topic do you want to explore?"
              rows={1}
              className={`bg-transparent text-text-primary font-body text-body-lg placeholder:text-text-muted resize-none border-none outline-none ${isCompact ? 'flex-1 py-0' : 'w-full px-4 pt-3 pb-1 min-h-0 max-h-[200px] overflow-y-auto'}`}
            />
            {!isCompact && (
              <div className="flex justify-end w-full px-3 pb-3">
                <div className="relative group">
                  <button onClick={handleSubmit} disabled={topic.trim().length < 3}
                    className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 flex items-center justify-center" aria-label="Ask Waya">
                    <IconArrowUp size={18} />
                  </button>
                  <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">Ask Waya</span>
                </div>
              </div>
            )}
            {isCompact && (
              <div className="relative group shrink-0">
                <button onClick={handleSubmit} disabled={topic.trim().length < 3}
                  className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 flex items-center justify-center" aria-label="Ask Waya">
                  <IconArrowUp size={18} />
                </button>
                <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">Ask Waya</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center w-full max-w-xl">
            {(SUGGESTED_TOPICS[subjectKey] ?? []).map((suggestion) => (
              <button key={suggestion} onClick={() => setTopic(suggestion)}
                className="px-3 py-1.5 rounded-full text-body-sm text-text-muted font-body border border-border-default hover:border-brand-primary/40 hover:text-text-primary hover:bg-bg-secondary transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
                ✦ {suggestion}
              </button>
            ))}
          </div>
        </div>

        </div>
      </motion.div>

      {recentSessions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-slate-50 dark:bg-[#121212] border-t border-slate-200 dark:border-slate-800 z-50">
          {showLeftBlur && <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-[#121212] dark:via-[#121212]/80 z-20 pointer-events-none" />}
          {showRightBlur && <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-[#121212] dark:via-[#121212]/80 z-20 pointer-events-none" />}
          <div ref={scrollRef} onScroll={updateScrollBlurs} className="flex flex-row overflow-x-auto justify-start items-center px-4 sm:px-6 lg:px-8 py-6 gap-4 scrollbar-hide w-full h-full">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onResumeSession(s)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary dark:hover:bg-bg-card border border-border-default transition-all text-sm shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 w-[260px]"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: SUBJECT_CONTAINER_COLORS[s.subject] ?? 'var(--color-bg-secondary)', color: SUBJECT_TEXT_COLORS[s.subject] ?? 'var(--color-text-secondary)' }}>
                  {SUBJECT_META[s.subject]?.label?.charAt(0) ?? '?'}
                </div>
                <span className="truncate flex-1 min-w-0">{s.topic}</span>
                {s.completed ? (
                  <span className="text-label-xs font-semibold shrink-0" style={{ color: 'var(--color-success)' }}>+{s.xpEarned}</span>
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

export function SubjectsTab({ sessions, onStartSession, onResumeSession }: SubjectsTabProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (selectedSubject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
        <SubjectDetailView
          subjectKey={selectedSubject}
          sessions={sessions}
          onBack={() => setSelectedSubject(null)}
          onStartSession={onStartSession}
          onResumeSession={onResumeSession}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-text-primary tracking-tight">What will you explore?</h1>
        <p className="text-body-md text-text-muted mt-1">Pick a subject. Waya will teach you through your interests and challenge you to think deeper.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SUBJECTS.map((subj, i) => {
          const count = sessions.filter((s) => s.subject === subj.id).length;
          const totalXp = sessions.filter((s) => s.subject === subj.id).reduce((sum, s) => sum + s.xpEarned, 0);

          return (
            <div
              key={subj.id}
              onClick={() => setSelectedSubject(subj.id)}
              className={`relative rounded-xl p-8 flex flex-col gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-2 hover:brightness-95 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 animate-fade-in-up opacity-0`}
              style={{ backgroundColor: SUBJECT_CONTAINER_COLORS[subj.id], animationDelay: `${i * 75}ms` }}
            >
              <h3 className="text-headline-sm font-heading" style={{ color: SUBJECT_TEXT_COLORS[subj.id] }}>
                {subj.label}
              </h3>
              <p className="text-body-sm" style={{ color: SUBJECT_TEXT_COLORS[subj.id] }}>
                {subj.desc}
              </p>

              <div className="flex flex-col gap-1 mt-auto pt-3">
                <p className="text-body-sm font-medium" style={{ color: SUBJECT_TEXT_COLORS[subj.id] }}>
                  {count} topics explored
                </p>
                <p className="text-body-sm" style={{ color: SUBJECT_TEXT_COLORS[subj.id] }}>
                  {totalXp} XP earned
                </p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setSelectedSubject(subj.id); }}
                className="text-body-sm font-semibold mt-3 px-5 py-3 rounded-full transition-all duration-150 active:translate-y-[1px] w-full text-center outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                style={{ backgroundColor: SUBJECT_CONTAINER_COLORS[subj.id], color: SUBJECT_TEXT_COLORS[subj.id], border: `1.5px solid ${SUBJECT_COLORS[subj.id]}`, borderBottomWidth: '5px' }}
              >
                {count === 0 ? 'Start Exploring' : 'Continue Exploring'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
