'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSparkles, IconBolt, IconCategory, IconHistory } from '@tabler/icons-react';

const TIPS_KEY = 'waya_tips_completed';

export function hasSeenTips(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(TIPS_KEY) === 'true';
  } catch {
    return true;
  }
}

export function markTipsSeen() {
  try {
    localStorage.setItem(TIPS_KEY, 'true');
  } catch {}
}

export function clearTipsSeen() {
  try {
    localStorage.removeItem(TIPS_KEY);
  } catch {}
}

interface Tip {
  title: string;
  description: string;
  targetSelector: string;
  placement: 'bottom' | 'top' | 'left' | 'right';
}

const TIPS: Tip[] = [
  {
    title: 'Ask Waya Anything',
    description: 'Type any topic and Waya will explain it through your interests, then challenge you with a synthesis question.',
    targetSelector: 'textarea[rows="1"]',
    placement: 'top',
  },
  {
    title: 'Track Your Progress',
    description: 'Your streak and XP live here. Complete sessions daily to grow your streak and level up!',
    targetSelector: '[data-gamification="true"]',
    placement: 'bottom',
  },
  {
    title: 'Explore Subjects',
    description: 'Each subject has its own page with session history, stats, and suggested topics to explore.',
    targetSelector: '[data-tab="subjects"]',
    placement: 'bottom',
  },
  {
    title: 'Review Your History',
    description: 'Every session is saved. Come back anytime to review past conversations and see how far you\'ve come.',
    targetSelector: '[data-tab="history"]',
    placement: 'bottom',
  },
];

interface Position {
  top: number;
  left: number;
}

function computePosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: 'bottom' | 'top' | 'left' | 'right',
  gap = 12,
): Position {
  const { innerWidth, innerHeight } = window;
  switch (placement) {
    case 'bottom':
      return {
        top: Math.min(targetRect.bottom + gap, innerHeight - tooltipHeight - 16),
        left: Math.max(8, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, innerWidth - tooltipWidth - 8)),
      };
    case 'top':
      return {
        top: Math.max(8, targetRect.top - tooltipHeight - gap),
        left: Math.max(8, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, innerWidth - tooltipWidth - 8)),
      };
    case 'left':
      return {
        top: Math.max(8, Math.min(targetRect.top + targetRect.height / 2 - tooltipHeight / 2, innerHeight - tooltipHeight - 8)),
        left: Math.max(8, targetRect.left - tooltipWidth - gap),
      };
    case 'right':
      return {
        top: Math.max(8, Math.min(targetRect.top + targetRect.height / 2 - tooltipHeight / 2, innerHeight - tooltipHeight - 8)),
        left: Math.min(targetRect.right + gap, innerWidth - tooltipWidth - 8),
      };
  }
}

export function FirstTimeTips({ isOpen, onComplete }: { isOpen: boolean; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const TOOLTIP_WIDTH = 360;

  const reposition = useCallback(() => {
    const tip = TIPS[step];
    if (!tip) return;
    const target = document.querySelector(tip.targetSelector);
    if (!target) {
      setPosition({ top: 80, left: Math.max(8, (window.innerWidth - TOOLTIP_WIDTH) / 2) });
      return;
    }
    const targetRect = target.getBoundingClientRect();
    const height = tooltipRef.current?.offsetHeight ?? 280;
    setPosition(computePosition(targetRect, TOOLTIP_WIDTH, height, tip.placement));
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setTimeout(() => setVisible(true), 400);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(() => reposition());
    const onResize = () => reposition();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [visible, reposition]);

  if (!isOpen) return null;

  const tip = TIPS[step];
  const isLast = step === TIPS.length - 1;

  const tipIcons = [
    <IconSparkles key="ask" size={22} className="text-brand-on-primary" />,
    <IconBolt key="xp" size={22} className="text-brand-on-primary" />,
    <IconCategory key="subjects" size={22} className="text-brand-on-primary" />,
    <IconHistory key="history" size={22} className="text-brand-on-primary" />,
  ];

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-bg-primary/60"
      />

      <AnimatePresence>
        {visible && (
          <div
            ref={tooltipRef}
            className="absolute pointer-events-auto"
            style={{ top: position.top, left: position.left, width: TOOLTIP_WIDTH }}
          >
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="bg-bg-card rounded-xl shadow-sm border border-border-default p-6"
            >
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center mb-4">
                {tipIcons[step]}
              </div>

              <h3 className="text-headline-sm text-text-primary font-heading mb-2">{tip.title}</h3>
              <p className="text-body-md text-text-secondary font-body mb-5 leading-relaxed">{tip.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {TIPS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ width: i === step ? 20 : 6 }}
                      className={`h-1.5 rounded-full transition-colors duration-300 ${i === step ? 'bg-brand-primary' : 'bg-border-default'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {!isLast && (
                    <button
                      onClick={() => { markTipsSeen(); onComplete(); }}
                      className="text-label-md text-text-muted font-medium hover:text-text-primary transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (isLast) {
                        markTipsSeen();
                        onComplete();
                      } else {
                        setStep((s) => s + 1);
                      }
                    }}
                    className="text-label-md text-brand-primary font-semibold hover:text-brand-hover transition-colors"
                  >
                    {isLast ? `Let's go!` : 'Next'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
