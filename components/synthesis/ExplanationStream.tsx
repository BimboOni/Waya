'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

interface ExplanationStreamProps {
  explanation: string;
  synthesisQuestion: string;
  subject: string;
  isStreaming: boolean;
}

export function ExplanationStream({
  explanation,
  synthesisQuestion,
  subject,
  isStreaming,
}: ExplanationStreamProps) {
  if (isStreaming && !explanation) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" rounded="full" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Badge label={subject} variant="subject" subject={subject} />
        <span className="text-label-md text-text-muted font-body">Waya&apos;s explanation</span>
      </div>

      <div className="bg-bg-secondary rounded-xl p-5 sm:p-6 border border-border-default">
        <p className="text-body-lg text-text-primary font-body leading-relaxed whitespace-pre-wrap">
          {explanation}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-brand-primary ml-0.5 animate-pulse align-middle" />
          )}
        </p>
      </div>

      {synthesisQuestion && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 mt-8 border-none"
        >
          <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-2">
            Synthesis Challenge
          </p>
          <p className="text-body-md text-text-primary font-body leading-relaxed">{synthesisQuestion}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
