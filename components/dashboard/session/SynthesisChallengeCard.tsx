'use client';

import { motion } from 'framer-motion';

interface SynthesisChallengeCardProps {
  synthQuestion: string | null;
}

export function SynthesisChallengeCard({ synthQuestion }: SynthesisChallengeCardProps) {
  if (!synthQuestion) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-none w-full mb-8">
        <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-2">Synthesis Challenge</p>
        <p className="text-body-lg text-text-primary font-body leading-relaxed">{synthQuestion}</p>
      </div>
    </motion.div>
  );
}
