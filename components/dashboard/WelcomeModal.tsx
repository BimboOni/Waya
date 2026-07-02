'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWayaStore } from '@/store/useWayaStore';
import { Button } from '@/components/ui/Button';
import { formatInterests } from '@/lib/utils';

const SUBJECT_LABELS: Record<string, string> = {
  Mathematics: 'Mathematics',
  ScienceTech: 'Science & Tech',
  HistoryCulture: 'History & Culture',
  CreativeArts: 'Creative Arts',
};

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTooltips: () => void;
}

export function WelcomeModal({ isOpen, onClose, onStartTooltips }: WelcomeModalProps) {
  const { user } = useWayaStore();
  const subjectLabel = SUBJECT_LABELS[user?.preferredSubject ?? ''] ?? 'your subject';
  const interestList = formatInterests(user?.interests ?? ['your hobbies', 'your interests']);

  const handleContinue = () => {
    onClose();
    onStartTooltips();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-white rounded-2xl max-w-2xl w-full p-16 flex flex-col items-center text-center shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-brand-primary">W</span>
            </div>
            <h2 className="text-display-sm text-text-primary font-heading font-bold mb-3">
              Welcome to Waya, {user?.name ?? 'Learner'}!
            </h2>
            <p className="text-body-lg text-text-secondary font-body mb-10 leading-relaxed max-w-md">
              You picked <strong className="text-text-primary">{subjectLabel}</strong>. I&apos;ll teach you everything through {interestList}.
            </p>

            <Button variant="primary" size="lg" onClick={handleContinue} className="rounded-full w-full max-w-xs">
              Let&apos;s Go
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
