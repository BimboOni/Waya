'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

type Mood = 'idle' | 'celebrating' | 'thinking';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface WayaMascotProps {
  mood?: Mood;
  size?: number;
  className?: string;
  onCelebrationComplete?: () => void;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 30 + Math.random() * 40,
    y: 10 + Math.random() * 30,
    size: 4 + Math.random() * 6,
    color: Math.random() > 0.5 ? 'var(--color-xp)' : 'var(--color-milestone)',
    delay: Math.random() * 0.3,
  }));
}

export function WayaMascot({ mood = 'idle', size = 40, className, onCelebrationComplete }: WayaMascotProps) {
  const controls = useAnimationControls();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [celebrationCount, setCelebrationCount] = useState(0);

  const faceSize = size;
  const eyeSize = size * 0.14;
  const eyeY = size * 0.3;
  const eyeSpacing = size * 0.22;

  useEffect(() => {
    if (mood === 'celebrating') {
      setSparkles(generateSparkles(4));
      controls.start({
        scale: [1, 1.15, 1],
        transition: { type: 'spring', stiffness: 300, damping: 20, duration: 0.6 },
      });
      const timer = setTimeout(() => {
        onCelebrationComplete?.();
      }, 1200);
      setCelebrationCount((c) => c + 1);
      return () => clearTimeout(timer);
    }
  }, [mood, controls, onCelebrationComplete]);

  const floatVariants = {
    idle: {
      y: [0, -6, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    thinking: {
      y: [0, -4, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    celebrating: {
      y: 0,
    },
  };

  const eyeVariants = {
    idle: { x: 0 },
    thinking: { x: eyeSize * 0.4 },
    celebrating: { x: 0 },
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`} style={{ width: faceSize, height: faceSize }}>
      <motion.div
        animate={mood === 'idle' ? 'idle' : mood === 'thinking' ? 'thinking' : 'celebrating'}
        variants={floatVariants}
        className="relative"
      >
        <motion.div
          animate={controls}
          className="relative flex items-center justify-center"
          style={{
            width: faceSize,
            height: faceSize,
            borderRadius: '40%',
            backgroundColor: 'var(--color-brand-primary)',
          }}
        >
          <motion.div
            animate={eyeVariants}
            variants={eyeVariants}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex gap-2"
            style={{ gap: eyeSpacing * 0.6 }}
          >
            <div
              style={{
                width: eyeSize,
                height: eyeSize,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
              }}
            />
            <div
              style={{
                width: eyeSize,
                height: eyeSize,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        key={celebrationCount}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        {sparkles.map((s) => (
          <motion.div
            key={`${celebrationCount}-${s.id}`}
            initial={{ opacity: 0, scale: 0, x: '50%', y: '50%' }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: `${50 + (s.x - 50) * 2.5}%`,
              y: `${50 + (s.y - 50) * 2.5}%`,
            }}
            transition={{ duration: 0.6, delay: s.delay, ease: 'easeOut' }}
            className="absolute"
            style={{
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
