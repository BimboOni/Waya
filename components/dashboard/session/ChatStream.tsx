import { motion } from 'framer-motion';
import { IconCopy, IconThumbUp, IconThumbDown } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cleanMarkdown, getTopicEmoji, markdownComponents } from './utils';

interface ChatStreamProps {
  topic: string;
  subject: string;
  stage: 'streaming' | 'answering' | 'complete';
  explanation: string;
  synthQuestion: string;
  tooltipFeedback: Record<string, string>;
  clickedActions: Record<string, boolean>;
  chipSubmitted: Record<string, boolean>;
  showTooltipFeedback: (key: string, label: string) => void;
  handleActionClick: (key: string) => void;
  handleChipClick: (sectionKey: string, chipLabel: string) => void;
  FEEDBACK_CHIPS: string[];
}

export function ChatStream({
  topic,
  subject,
  stage,
  explanation,
  synthQuestion,
  tooltipFeedback,
  clickedActions,
  chipSubmitted,
  showTooltipFeedback,
  handleActionClick,
  handleChipClick,
  FEEDBACK_CHIPS,
}: ChatStreamProps) {
  return (
    <>
      <div className="flex justify-end">
        <div>
          <div className="w-fit max-w-[92%] ml-auto bg-slate-100 dark:bg-[#2A2A2A] rounded-2xl rounded-br-md p-4">
            <p className="text-body-lg text-text-primary max-w-prose">{getTopicEmoji(topic, subject)} {topic}</p>
          </div>
          <div className="flex items-center justify-end gap-2 mt-2 text-text-muted">
            <div className="relative group">
              <button
                onClick={() => { navigator.clipboard.writeText(topic); showTooltipFeedback('copy-topic', 'Copied!'); }}
                className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors"
                aria-label="Copy topic"
              >
                <IconCopy size={18} />
              </button>
              <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                {tooltipFeedback['copy-topic'] || 'Copy text'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {stage === 'streaming' && !explanation && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 px-1 py-5">
            <div className="flex items-center gap-1">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-text-muted"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-text-muted"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-text-muted"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
            </div>
            <span className="text-body-md text-text-muted font-body">Thinking</span>
          </div>
        </div>
      )}

      {explanation && (
        <div className="flex justify-start">
          <div className="max-w-[90%]">
            <div className="text-body-lg text-text-primary font-body leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{cleanMarkdown(explanation)}</ReactMarkdown>
            </div>
            {stage !== 'streaming' && (
              <div className="flex flex-row items-center gap-3 w-full flex-wrap text-text-muted mt-3">
                <div className="relative group">
                  <button
                    onClick={() => { navigator.clipboard.writeText(explanation); showTooltipFeedback('copy-exp', 'Copied!'); }}
                    className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors"
                    aria-label="Copy text"
                  >
                    <IconCopy size={18} />
                  </button>
                  <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                    {tooltipFeedback['copy-exp'] || 'Copy text'}
                  </span>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => handleActionClick('good-exp')}
                    className={`p-1.5 rounded-full transition-colors ${clickedActions['good-exp'] ? 'bg-brand-primary/10 text-brand-primary' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                    aria-label="Good response"
                  >
                    <IconThumbUp size={18} />
                  </button>
                  <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                    {tooltipFeedback['good-exp'] || 'Good response'}
                  </span>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => handleActionClick('bad-exp')}
                    className={`p-1.5 rounded-full transition-colors ${clickedActions['bad-exp'] ? 'text-red-500 hover:text-red-600' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                    aria-label="Bad response"
                  >
                    <IconThumbDown size={18} />
                  </button>
                  <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                    {tooltipFeedback['bad-exp'] || 'Bad response'}
                  </span>
                </div>
                {clickedActions['bad-exp'] && !chipSubmitted['bad-exp'] && FEEDBACK_CHIPS.map((chip) => (
                  <button key={chip} onClick={() => handleChipClick('bad-exp', chip)}
                    className="text-xs px-3 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 cursor-pointer transition-colors">
                    {chip}
                  </button>
                ))}
                {chipSubmitted['bad-exp'] && (
                  <span className="text-xs text-green-600">✓ Thanks for the feedback</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {synthQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-none w-full mb-8">
            <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-2">Synthesis Challenge</p>
            <p className="text-body-lg text-text-primary font-body leading-relaxed">
              {synthQuestion}
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
}
