import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowUp, IconArrowsMaximize, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';

interface SynthesisChallengeProps {
  answer: string;
  setAnswer: (val: string) => void;
  feedback: string;
  stage: 'streaming' | 'answering' | 'complete';
  isSubmitting: boolean;
  onSubmit: () => void;
  isCompact: boolean;
  setIsCompact: (val: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

export function SynthesisChallenge({
  answer,
  setAnswer,
  feedback,
  stage,
  isSubmitting,
  onSubmit,
  isCompact,
  setIsCompact,
  isExpanded,
  setIsExpanded,
}: SynthesisChallengeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, [setIsCompact]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 border-t border-border-default bg-bg-primary px-4 sm:px-6 py-4"
      >
        <div className="max-w-3xl mx-auto">
          {feedback && (
            <div className="mb-3 px-4 py-3 rounded-2xl border-l-4" style={{ backgroundColor: 'var(--color-ask-card-bg)', borderColor: 'var(--color-warning)' }}>
              <p className="text-body-md text-text-primary">{feedback}</p>
            </div>
          )}
          {stage === 'complete' ? null : stage === 'streaming' ? (
            <div className="w-full bg-bg-card border-2 border-border-default rounded-full px-5 h-[60px] flex items-center opacity-50">
              <span className="text-body-md text-text-muted font-body">Waya is crafting your lesson...</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
              className={`w-full bg-bg-card border-2 border-border-default transition-all ${isCompact ? 'flex flex-row items-center h-[60px] rounded-full px-4' : 'flex flex-col rounded-2xl'}`}
            >
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
                onInput={(e) => autoResize(e.currentTarget)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                rows={1}
                className={`bg-transparent text-text-primary font-body text-body-lg placeholder:text-text-muted resize-none border-none outline-none ${isCompact ? 'flex-1 py-0' : 'w-full px-4 pt-3 pb-1 min-h-0 max-h-[200px] overflow-y-auto'}`}
              />
              {!isCompact && (
              <div className="flex justify-between items-center w-full px-3 pb-3">
                {answer.length > 0 && (
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(true)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                      aria-label="Expand"
                    >
                      <IconArrowsMaximize size={20} />
                    </button>
                  </div>
                )}
                <div className="relative group ml-auto">
                  <button
                    type="submit"
                    onClick={onSubmit}
                    disabled={!answer.trim() || isSubmitting}
                    className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                    aria-label="Submit answer"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                    ) : (
                      <IconArrowUp size={18} />
                    )}
                  </button>
                </div>
              </div>
              )}
              {isCompact && (
              <div className="relative group shrink-0">
                <button
                  type="submit"
                  onClick={onSubmit}
                  disabled={!answer.trim() || isSubmitting}
                  className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Submit answer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                  ) : (
                    <IconArrowUp size={18} />
                  )}
                </button>
              </div>
              )}
            </form>
          )}
        </div>
      </motion.div>

      {/* Full-screen expanded modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border-none"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-headline-md text-text-primary font-heading">Type your answer</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors shrink-0"
                  aria-label="Close"
                >
                  <IconX size={20} />
                </button>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
                onInput={(e) => autoResize(e.currentTarget)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                className="w-full min-h-[200px] bg-bg-card border-2 border-border-default rounded-2xl p-6 text-body-lg text-text-primary font-body placeholder:text-text-muted resize-none outline-none focus:outline-none focus:border-slate-200 dark:focus:border-slate-800 transition-colors"
                autoFocus
              />
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => { setIsExpanded(false); onSubmit(); }}
                  disabled={!answer.trim() || isSubmitting}
                  size="lg"
                  className="px-12"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
