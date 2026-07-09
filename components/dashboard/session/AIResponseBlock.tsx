'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCopy, IconThumbUp, IconThumbDown } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents, cleanMarkdown } from './MarkdownConfig';

const FEEDBACK_CHIPS = ['Too vague', 'Too complex', 'Wrong topic', 'Great explanation'];

interface AIResponseBlockProps {
  explanation: string;
  stage: string;
  subject: string;
  userInterests: string[];
  onKeepExploring?: (topic: string) => void;
}

export function AIResponseBlock({ explanation, stage, subject, userInterests, onKeepExploring }: AIResponseBlockProps) {
  const [clickedActions, setClickedActions] = useState<Record<string, boolean>>({});
  const [chipSubmitted, setChipSubmitted] = useState<Record<string, boolean>>({});
  const [tooltipFeedback, setTooltipFeedback] = useState<Record<string, string>>({});
  const [keepExploringTopic, setKeepExploringTopic] = useState('');

  const showTooltip = (key: string, msg: string) => {
    setTooltipFeedback((prev) => ({ ...prev, [key]: msg }));
    setTimeout(() => setTooltipFeedback((prev) => ({ ...prev, [key]: '' })), 2000);
  };

  const handleActionClick = (key: string) => {
    if (clickedActions[key]) return;
    setClickedActions((prev) => ({ ...prev, [key]: true }));
    if (key === 'good-exp') showTooltip(key, 'Thanks for the feedback!');
    if (key === 'bad-exp') showTooltip(key, 'Help us improve');
  };

  const handleChipClick = async (chip: string) => {
    if (chipSubmitted[chip]) return;
    setChipSubmitted((prev) => ({ ...prev, [chip]: true }));
    showTooltip('bad-exp', 'Thanks for the feedback!');
    try {
      await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackKey: 'bad-exp', feedbackTag: chip }),
      });
    } catch { /* silent */ }
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        {explanation && (
          <div className="text-body-lg text-text-primary font-body leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{cleanMarkdown(explanation)}</ReactMarkdown>
          </div>
        )}
        {stage !== 'streaming' && (
          <div className="flex flex-row items-center gap-3 w-full flex-wrap text-text-muted mt-3">
            <div className="relative group">
              <button onClick={() => { navigator.clipboard.writeText(explanation); showTooltip('copy-exp', 'Copied!'); }}
                className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors" aria-label="Copy text">
                <IconCopy size={18} />
              </button>
              <span className="absolute bottom-full mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none shadow-sm">
                {tooltipFeedback['copy-exp'] || 'Copy text'}
              </span>
            </div>
            <div className="relative group">
              <button onClick={() => handleActionClick('good-exp')}
                className={`p-1.5 rounded-full transition-colors ${clickedActions['good-exp'] ? 'bg-brand-primary/10 text-brand-primary' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                aria-label="Good response">
                <IconThumbUp size={18} />
              </button>
              <span className="absolute bottom-full mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none shadow-sm">
                {tooltipFeedback['good-exp'] || 'Good response'}
              </span>
            </div>
            <div className="relative group">
              <button onClick={() => handleActionClick('bad-exp')}
                className={`p-1.5 rounded-full transition-colors ${clickedActions['bad-exp'] ? 'bg-error/10 text-error' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                aria-label="Bad response">
                <IconThumbDown size={18} />
              </button>
              <span className="absolute bottom-full mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none shadow-sm">
                {tooltipFeedback['bad-exp'] || 'Bad response'}
              </span>
            </div>
            {clickedActions['bad-exp'] && !chipSubmitted['bad-exp'] && (
              <div className="flex flex-wrap gap-1.5 mt-1 w-full">
                {FEEDBACK_CHIPS.filter((c) => !chipSubmitted[`bad-exp-${c}`]).map((chip) => (
                  <button key={chip} onClick={() => handleChipClick(`bad-exp-${chip}`)}
                    className="px-3 py-1 rounded-full text-[12px] font-medium bg-bg-card border border-border-default text-text-muted hover:bg-bg-secondary transition-colors">
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
