'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { SUBJECT_COLORS, SUBJECT_CONTAINER_COLORS, SUBJECT_TEXT_COLORS } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import type { MockSession } from '@/types';

const SUBJECT_LABELS: Record<string, string> = {
  Mathematics: 'Mathematics',
  ScienceTech: 'Science & Tech',
  HistoryCulture: 'History & Culture',
  CreativeArts: 'Creative Arts',
};

interface HistoryTabProps {
  sessions: MockSession[];
  onCta?: () => void;
  onResumeSession?: (session: MockSession) => void;
}

export function HistoryTab({ sessions, onCta, onResumeSession }: HistoryTabProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});

  const grouped = sessions.reduce<Record<string, MockSession[]>>((acc, s) => {
    const key = s.subject || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const subjects = Object.keys(grouped).sort();

  if (sessions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center overflow-hidden">
        <PremiumEmptyState
          headline="No Sessions Yet"
          body="Your learning history will appear here after you complete a synthesis in the Study Hub."
          ctaLabel="Start Your First Lesson"
          onCta={onCta}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
      <h1 className="text-3xl font-medium text-text-primary tracking-tight">Your Learning Journey</h1>
        <p className="text-body-md text-text-muted mt-1 mb-8">Every session is saved. Review past topics, track progress, and pick up where you left off.</p>

      <div className="flex flex-col gap-4">
        {subjects.map((subj) => {
          const isOpen = expanded[subj] === true;
          const items = grouped[subj];

          return (
            <div key={subj} className="bg-bg-card border border-border-default rounded-xl overflow-hidden" style={{ borderBottom: '5px solid var(--color-border-default)' }}>
              <button
                onClick={() => setExpanded((p) => ({ ...p, [subj]: !isOpen }))}
                className="w-full flex items-center justify-between px-5 py-6 hover:bg-bg-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[subj] }} />
                  <span className="text-title-md text-text-primary font-medium">{SUBJECT_LABELS[subj] ?? subj}</span>
                  <span className="text-body-sm text-text-muted">{items.length} sessions</span>
                </div>
                <IconChevronDown
                  size={18}
                  className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
            <div className="border-t border-border-default">
              {items.slice(0, showAll[subj] ? items.length : 5).map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => onResumeSession?.(s)}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-bg-secondary/30 transition-colors cursor-pointer border-b border-border-default last:border-b-0 animate-fade-in-up opacity-0`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SUBJECT_COLORS[s.subject] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md text-text-primary truncate">{s.topic}</p>
                    <p className="text-body-sm text-text-muted">{formatRelativeDate(s.createdAt)}</p>
                  </div>
                  {s.completed ? (
                    <span className="text-body-sm font-medium shrink-0 flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                      +{s.xpEarned} XP
                    </span>
                  ) : (
                    <span className="text-body-sm font-semibold shrink-0 flex items-center gap-1" style={{ color: 'var(--color-brand-primary)' }}>
                      Resume
                    </span>
                  )}
                  <IconChevronRight size={16} className="text-text-muted shrink-0" />
                </div>
              ))}
              {items.length > 5 && (
                <button
                  onClick={() => setShowAll((p) => ({ ...p, [subj]: !p[subj] }))}
                  className="w-full px-5 py-4 text-body-sm text-brand-primary font-semibold hover:bg-bg-secondary/30 transition-colors text-center"
                >
                  {showAll[subj] ? 'Show less' : `View all ${items.length} sessions`}
                </button>
              )}
            </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
