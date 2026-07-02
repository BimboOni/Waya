'use client';

import { motion } from 'framer-motion';
import { EmptyState, BadgesEmptyIllustration } from '@/components/ui/EmptyState';
import { useWayaStore } from '@/store/useWayaStore';
import { formatDate } from '@/lib/utils';
import type { MockBadge } from '@/types';

const BADGE_ICONS: Record<string, string> = {
  '3-Day Streak': '🔥',
  '7-Day Streak': '⚡',
  'First Synthesis': '✨',
  '5 Nodes Mapped': '🗺️',
  '10 Nodes Mapped': '🧭',
  'Science Explorer': '🔬',
  'Math Wizard': '🔢',
  'Polymath': '🎓',
};

interface BadgeCardProps {
  badge: MockBadge;
  index: number;
}

function BadgeCard({ badge, index }: BadgeCardProps) {
  const icon = BADGE_ICONS[badge.badgeType] ?? '🏅';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: index * 0.05 }}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default bg-bg-card hover:border-brand-primary hover:-translate-y-0.5 transition-all duration-default ease-waya"
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-milestone-container" aria-hidden="true">
        {icon}
      </div>
      <p className="text-label-md text-text-primary font-body text-center leading-snug">
        {badge.badgeType}
      </p>
      {badge.earnedAt && (
        <p className="text-label-sm text-text-muted font-body">{formatDate(badge.earnedAt)}</p>
      )}
    </motion.div>
  );
}

interface BadgeGridProps {
  badges: MockBadge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="rounded-2xl bg-bg-card border border-border-default px-6 sm:px-8 py-6 sm:py-8">
        <EmptyState
          illustration={<BadgesEmptyIllustration />}
          headline="No badges yet"
          body="Complete 3-day streaks, map milestones, and synthesise across subjects to earn unique visual badges."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {badges.map((badge, i) => (
        <BadgeCard key={badge.id} badge={badge} index={i} />
      ))}
    </div>
  );
}
