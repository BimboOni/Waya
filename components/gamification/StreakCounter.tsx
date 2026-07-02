'use client';

import { motion } from 'framer-motion';
import { useWayaStore } from '@/store/useWayaStore';

interface StreakCounterProps {
  initialStreak?: number;
}

export function StreakCounter({ initialStreak = 0 }: StreakCounterProps) {
  const { streak } = useWayaStore();
  const display = streak || initialStreak;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border-default bg-bg-card"
    >
      <span className="text-2xl" aria-hidden="true">🔥</span>
      <div>
        <p className="text-display-sm text-text-primary font-heading leading-none">{display}</p>
        <p className="text-label-md text-text-muted font-body mt-0.5">day streak</p>
      </div>
    </motion.div>
  );
}
