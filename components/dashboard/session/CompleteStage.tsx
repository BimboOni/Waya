'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCopy, IconThumbUp, IconThumbDown, IconCheck, IconStar } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents, cleanMarkdown } from './MarkdownConfig';

interface CompleteStageProps {
  feedback: string;
  xpEarned: number;
  showXpFloat: boolean;
  onClose: () => void;
}

export function CompleteStage({ feedback, xpEarned, showXpFloat, onClose }: CompleteStageProps) {
  const [clickedActions, setClickedActions] = useState<Record<string, boolean>>({});
  const [chipSubmitted, setChipSubmitted] = useState<Record<string, boolean>>({});

  const handleActionClick = (key: string) => {
    if (clickedActions[key]) return;
    setClickedActions((prev) => ({ ...prev, [key]: true }));
    if (key === 'fb-good') {
      fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedbackKey: 'session-good', feedbackTag: 'completed' }) }).catch(() => {});
    }
  };

  const handleChipClick = (chip: string) => {
    if (chipSubmitted[chip]) return;
    setChipSubmitted((prev) => ({ ...prev, [chip]: true }));
    fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedbackKey: 'session-bad', feedbackTag: chip }) }).catch(() => {});
  };

  if (!feedback) return null;

  return (
    <div className="space-y-4">
      {showXpFloat && (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700/30 mx-auto w-fit">
          <IconStar size={20} className="text-amber-500" />
          <span className="text-label-lg font-bold text-amber-700 dark:text-amber-300">+{xpEarned} XP</span>
        </motion.div>
      )}
      <div className="flex justify-end">
        <div className="w-fit max-w-[85%] bg-bg-secondary rounded-2xl rounded-br-md p-4">
          <div className="text-body-md text-text-primary font-body leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{cleanMarkdown(feedback)}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-3 mt-3 text-text-muted">
            <div className="relative group">
              <button onClick={() => handleActionClick('fb-good')}
                className={`p-1.5 rounded-full transition-colors ${clickedActions['fb-good'] ? 'bg-brand-primary/10 text-brand-primary' : 'hover:text-text-primary hover:bg-bg-secondary'}`}>
                <IconThumbUp size={16} />
              </button>
            </div>
            <div className="relative group">
              <button onClick={() => handleActionClick('fb-bad')}
                className={`p-1.5 rounded-full transition-colors ${clickedActions['fb-bad'] ? 'bg-error/10 text-error' : 'hover:text-text-primary hover:bg-bg-secondary'}`}>
                <IconThumbDown size={16} />
              </button>
            </div>
            {clickedActions['fb-bad'] && !chipSubmitted['fb-bad'] && (
              <div className="flex flex-wrap gap-1.5">
                {['Too easy', 'Too hard', 'Wrong topic', 'Boring'].filter((c) => !chipSubmitted[`fb-bad-${c}`]).map((chip) => (
                  <button key={chip} onClick={() => handleChipClick(`fb-bad-${chip}`)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-bg-card border border-border-default text-text-muted hover:bg-bg-secondary transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-4">
        <button onClick={onClose}
          className="bg-bg-card text-text-primary border-2 border-border-default border-b-4 rounded-full h-12 px-8 text-label-md font-medium hover:bg-bg-secondary/60 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 flex items-center gap-2">
          <IconCheck size={18} />
          Complete Session
        </button>
      </div>
    </div>
  );
}
