import { cn } from '@/lib/utils';
import { SUBJECT_COLORS, SUBJECT_CONTAINER_COLORS, SUBJECT_TEXT_COLORS } from '@/lib/constants';

type BadgeVariant = 'subject' | 'status' | 'level';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  subject?: string;
  className?: string;
}

export function Badge({ label, variant = 'status', subject, className }: BadgeProps) {
  if (variant === 'subject' && subject) {
    const bg = SUBJECT_CONTAINER_COLORS[subject] ?? 'var(--color-bg-secondary)';
    const text = SUBJECT_TEXT_COLORS[subject] ?? 'var(--color-text-secondary)';
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-body',
          className,
        )}
        style={{ backgroundColor: bg, color: text }}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-body',
        'bg-bg-secondary text-text-secondary border border-border-default',
        className,
      )}
    >
      {label}
    </span>
  );
}
