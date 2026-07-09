'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconCopy, IconThumbUp, IconThumbDown } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents, cleanMarkdown } from './MarkdownConfig';

const FEEDBACK_CHIPS = ['Too vague', 'Too complex', 'Wrong topic', 'Great explanation'];

interface KeepExploringSectionProps {
  messages: string[];
  responses: string[];
  done: boolean;
}

export function KeepExploringSection({ messages, responses, done }: KeepExploringSectionProps) {
  const [clickedActions, setClickedActions] = useState<Record<string, boolean>>({});
  const [chipSubmitted, setChipSubmitted] = useState<Record<string, boolean>>({});
  const [tooltipFeedback, setTooltipFeedback] = useState<Record<string, string>>({});

  const showTooltip = (key: string, msg: string) => {
    setTooltipFeedback((prev) => ({ ...prev, [key]: msg }));
    setTimeout(() => setTooltipFeedback((prev) => ({ ...prev, [key]: '' })), 2000);
  };

  const handleActionClick = (key: string) => {
    if (clickedActions[key]) return;
    setClickedActions((prev) => ({ ...prev, [key]: true }));
  };

  const handleChipClick = (chip: string) => {
    if (chipSubmitted[chip]) return;
    setChipSubmitted((prev) => ({ ...prev, [chip]: true }));
    showTooltip('bad-ke', 'Thanks!');
    fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedbackKey: 'bad-ke', feedbackTag: chip }) }).catch(() => {});
  };

  if (messages.length === 0) return null;

  return (
    <>
      {messages.map((msg, i) => (
        <div key={i}>
          <div className="flex justify-end">
            <div className="w-fit max-w-[85%] bg-slate-100 dark:bg-[#2A2A2A] rounded-2xl rounded-br-md p-4">
              <p className="text-body-lg text-text-primary">{msg}</p>
            </div>
          </div>
          {responses[i] && (
            <div className="flex justify-start mt-3">
              <div className="max-w-[90%]">
                <div className="text-body-lg text-text-primary font-body leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{cleanMarkdown(responses[i])}</ReactMarkdown>
                </div>
                {done && (
                  <div className="flex flex-row items-center gap-3 w-full flex-wrap text-text-muted mt-3">
                    <div className="relative group">
                      <button onClick={() => { navigator.clipboard.writeText(responses[i]); showTooltip(`copy-ke-${i}`, 'Copied!'); }}
                        className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors" aria-label="Copy">
                        <IconCopy size={18} />
                      </button>
                      <span className="absolute bottom-full mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none shadow-sm">
                        {tooltipFeedback[`copy-ke-${i}`] || 'Copy'}
                      </span>
                    </div>
                    <div className="relative group">
                      <button onClick={() => handleActionClick(`good-ke-${i}`)}
                        className={`p-1.5 rounded-full transition-colors ${clickedActions[`good-ke-${i}`] ? 'bg-brand-primary/10 text-brand-primary' : 'hover:text-text-primary hover:bg-bg-secondary'}`}>
                        <IconThumbUp size={18} />
                      </button>
                    </div>
                    <div className="relative group">
                      <button onClick={() => handleActionClick(`bad-ke-${i}`)}
                        className={`p-1.5 rounded-full transition-colors ${clickedActions[`bad-ke-${i}`] ? 'bg-error/10 text-error' : 'hover:text-text-primary hover:bg-bg-secondary'}`}>
                        <IconThumbDown size={18} />
                      </button>
                    </div>
                    {clickedActions[`bad-ke-${i}`] && !chipSubmitted[`bad-ke-${i}`] && (
                      <div className="flex flex-wrap gap-1.5 mt-1 w-full">
                        {FEEDBACK_CHIPS.filter((c) => !chipSubmitted[`bad-ke-${i}-${c}`]).map((chip) => (
                          <button key={chip} onClick={() => handleChipClick(`bad-ke-${i}-${chip}`)}
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
          )}
        </div>
      ))}
    </>
  );
}
