'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';

interface ExpandedAnswerModalProps {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  answer: string;
  setAnswer: (v: string) => void;
  isSubmitting: boolean;
  handleSubmitAnswer: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ExpandedAnswerModal({
  isExpanded, setIsExpanded, answer, setAnswer, isSubmitting, handleSubmitAnswer, handleKeyDown,
}: ExpandedAnswerModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
        >
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border-none">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md text-text-primary font-heading">Type your answer</h2>
              <button onClick={() => setIsExpanded(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors shrink-0" aria-label="Close">
                <IconX size={20} />
              </button>
            </div>
            <textarea ref={textareaRef} value={answer} onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
              onKeyDown={handleKeyDown} placeholder="Type your answer here..."
              className="w-full min-h-[200px] bg-bg-card border-2 border-border-default rounded-2xl p-6 text-body-lg text-text-primary font-body placeholder:text-text-muted resize-none outline-none focus:outline-none focus:border-slate-200 dark:focus:border-slate-800 transition-colors"
              autoFocus
            />
            <div className="flex justify-center mt-6">
              <Button onClick={handleSubmitAnswer} disabled={!answer.trim() || isSubmitting} size="lg" className="px-12">
                {isSubmitting ? (
                  <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                ) : 'Submit Answer'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
