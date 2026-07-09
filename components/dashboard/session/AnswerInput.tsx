'use client';

import { useRef, useEffect } from 'react';
import { IconArrowUp, IconArrowsMaximize } from '@tabler/icons-react';

interface AnswerInputProps {
  answer: string;
  setAnswer: (v: string) => void;
  isSubmitting: boolean;
  isCompact: boolean;
  setIsCompact: (v: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  handleSubmitAnswer: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function AnswerInput({
  answer, setAnswer, isSubmitting, isCompact, setIsCompact, isExpanded, setIsExpanded,
  handleSubmitAnswer, handleKeyDown,
}: AnswerInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.removeProperty('height');
    el.style.height = el.scrollHeight + 'px';
    const h = el.scrollHeight;
    if (h > 100 && isCompact) setIsCompact(false);
    if (h <= 40 && !isCompact) setIsCompact(true);
  };

  useEffect(() => {
    if (!isExpanded && textareaRef.current) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [isExpanded]);

  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent pt-6 pb-4 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {isCompact ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }}
            className="w-full bg-bg-card border-2 border-border-default flex flex-row items-center h-[60px] rounded-full px-4"
          >
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
              onInput={(e) => autoResize(e.currentTarget)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              rows={1}
              className="flex-1 bg-transparent text-body-md text-text-primary font-body placeholder:text-text-muted resize-none outline-none py-3 leading-relaxed"
            />
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <button type="button" onClick={() => setIsExpanded(true)}
                className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors" aria-label="Expand">
                <IconArrowsMaximize size={18} />
              </button>
              <div className="relative group shrink-0">
                <button type="submit" disabled={!answer.trim() || isSubmitting}
                  className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center" aria-label="Submit answer">
                  {isSubmitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                  ) : <IconArrowUp size={18} />}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }}
            className="w-full bg-bg-card border-2 border-border-default flex flex-col rounded-2xl"
          >
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
              onInput={(e) => autoResize(e.currentTarget)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              className="w-full bg-transparent text-body-lg text-text-primary font-body placeholder:text-text-muted resize-none outline-none p-4 min-h-[120px] leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-between px-4 pb-4">
              <button type="button" onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1.5 text-label-sm text-text-muted hover:text-text-primary transition-colors">
                <IconArrowsMaximize size={16} />
                Expand
              </button>
              <div className="relative group shrink-0">
                <button type="submit" disabled={!answer.trim() || isSubmitting}
                  className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center" aria-label="Submit answer">
                  {isSubmitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                  ) : <IconArrowUp size={18} />}
                </button>
                <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none shadow-sm">
                  Submit
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
