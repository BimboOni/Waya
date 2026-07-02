'use client';

import { useEffect, useState } from 'react';
import { XP_PER_LEVEL } from '@/lib/constants';

interface XPBarProps {
  currentXP: number;
  animated?: boolean;
  height?: number;
}

export function XPBar({ currentXP, animated = true, height = 3 }: XPBarProps) {
  const targetWidth = ((currentXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  const [width, setWidth] = useState(animated ? 0 : targetWidth);

  useEffect(() => {
    if (!animated) {
      setWidth(targetWidth);
      return;
    }
    const timer = setTimeout(() => setWidth(targetWidth), 200);
    return () => clearTimeout(timer);
  }, [targetWidth, animated]);

  return (
    <div
      role="progressbar"
      aria-label={`XP progress: ${Math.round(width)}%`}
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full bg-bg-secondary overflow-hidden rounded-full"
      style={{ height }}
    >
      <div
        className="h-full bg-xp rounded-full"
        style={{
          width: `${width}%`,
          transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
