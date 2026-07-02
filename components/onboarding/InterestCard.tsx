'use client';

import { motion } from 'framer-motion';
import { Check, Gamepad2, Music, Film, Sparkles, Camera, Shirt, Palette, ChefHat, BookOpen, Trophy, Car, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  gaming: Gamepad2, music: Music, movies: Film, anime: Sparkles,
  content: Camera, fashion: Shirt, art: Palette, cooking: ChefHat,
  reading: BookOpen, sports: Trophy, cars: Car, tech: Monitor,
};

const SUBJECT_TINTS: Record<string, string> = {
  gaming: 'var(--color-subject-science-container)', music: 'var(--color-subject-arts-container)',
  movies: 'var(--color-subject-history-container)', anime: 'var(--color-subject-arts-container)',
  content: 'var(--color-subject-science-container)', fashion: 'var(--color-subject-arts-container)',
  art: 'var(--color-subject-arts-container)', cooking: 'var(--color-subject-science-container)',
  reading: 'var(--color-subject-history-container)', sports: 'var(--color-subject-science-container)',
  cars: 'var(--color-subject-math-container)', tech: 'var(--color-subject-science-container)',
};

interface InterestCardProps {
  id: string;
  label: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function InterestCard({ id, label, isSelected, onToggle }: InterestCardProps) {
  const Icon = ICON_MAP[id];
  const tint = SUBJECT_TINTS[id] || 'var(--color-bg-secondary)';

  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 overflow-hidden w-full',
        'transition-colors duration-default ease-waya cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-brand-primary bg-brand-primary/5'
          : 'border-border-default bg-bg-card hover:border-brand-primary/40',
      )}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${label}`}
    >
      <div className="w-full flex items-center justify-center p-5 sm:p-6" style={{ backgroundColor: tint }}>
        {Icon ? (
          <Icon size={36} className={isSelected ? 'text-brand-primary' : 'text-text-primary'} />
        ) : (
          <span className="text-headline-sm font-heading font-semibold opacity-30" style={{ color: 'var(--color-text-muted)' }}>{label.charAt(0)}</span>
        )}
      </div>
      <div className="w-full p-4 text-center">
        <span className={cn('text-label-md font-heading font-medium leading-tight', isSelected ? 'text-brand-primary' : 'text-text-primary')}>
          {label}
        </span>
      </div>
    </button>
  );
}
