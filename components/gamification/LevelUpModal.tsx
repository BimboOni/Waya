'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useWayaStore } from '@/store/useWayaStore';
import { getLevelName } from '@/lib/gamification';
import { playLevelUp } from '@/lib/sounds';

export function LevelUpModal() {
  const { showLevelUpModal, newLevelReached, dismissLevelUp } = useWayaStore();

  useEffect(() => {
    if (!showLevelUpModal) return;

    playLevelUp().catch(() => {});

    const colors = ['#0EA4A4', '#82CB15', '#BF27D3', '#FB6F84'];
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
    const t = setTimeout(() => {
      confetti({ particleCount: 40, spread: 90, origin: { x: 0.3, y: 0.5 }, colors });
      confetti({ particleCount: 40, spread: 90, origin: { x: 0.7, y: 0.5 }, colors });
    }, 400);

    return () => clearTimeout(t);
  }, [showLevelUpModal]);

  return (
    <Modal isOpen={showLevelUpModal} onClose={dismissLevelUp} size="sm">
      <div className="flex flex-col items-center text-center gap-5 pb-2">
        {/* Placeholder logo shape */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          className="w-20 h-20 rounded-[40%] bg-brand-primary flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-on-primary" />
            <div className="w-3 h-3 rounded-full bg-brand-on-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
          className="flex flex-col gap-1"
        >
          <h2 className="text-display-md text-text-primary font-heading">Level Up!</h2>
          <p className="text-body-md text-text-secondary font-body">
            You&apos;re now a{' '}
            <span className="font-semibold text-text-primary">{getLevelName(newLevelReached)}</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Button variant="primary" size="lg" onClick={dismissLevelUp} className="rounded-full">
            Keep Learning →
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
