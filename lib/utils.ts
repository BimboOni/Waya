import { SUBJECT_COLORS } from './constants';

export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? 'var(--color-brand-primary)';
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(d);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getLocalDateString(date?: Date): string {
  const d = date ?? new Date();
  return d.toLocaleDateString('en-CA');
}


export function formatInterests(interests: string[]): string {
  if (!interests || interests.length === 0) return '';
  if (interests.length === 1) return interests[0];
  if (interests.length === 2) return interests.join(' and ');
  return interests.slice(0, -1).join(', ') + ', and ' + interests.slice(-1);
}
