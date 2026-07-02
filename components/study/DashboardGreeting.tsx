'use client';

import { useMemo } from 'react';

interface DashboardGreetingProps {
  name: string;
  levelName: string;
  streak: number;
}

export function DashboardGreeting({ name, levelName, streak }: DashboardGreetingProps) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = name.split(' ')[0];

  return (
    <div className="flex flex-col gap-2 pt-1">
      <h1
        className="font-heading font-bold leading-none"
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.025em',
        }}
      >
        {greeting}, {firstName} {streak >= 3 ? '🔥' : '👋'}
      </h1>
      <p className="text-body-lg font-body" style={{ color: 'var(--color-text-secondary)' }}>
        You&apos;re a{' '}
        <span className="font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
          {levelName}
        </span>
        . What do you want to synthesise today?
      </p>
    </div>
  );
}
