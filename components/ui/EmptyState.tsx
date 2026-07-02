import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  illustration: React.ReactNode;
  headline: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  illustration,
  headline,
  body,
  ctaLabel,
  onCta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-4 py-12 px-6',
        className,
      )}
    >
      <div className="text-text-muted opacity-80" aria-hidden="true">
        {illustration}
      </div>
      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="text-base text-text-primary font-heading">{headline}</h3>
        <p className="text-body-md text-text-secondary font-body">{body}</p>
      </div>
      {ctaLabel && onCta && (
        <Button variant="primary" size="md" onClick={onCta} className="mt-2">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}

// Pre-built SVG illustrations using design tokens
export function MapEmptyIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="8" y="28" width="26" height="24" rx="6" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <rect x="46" y="18" width="26" height="24" rx="6" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <rect x="26" y="52" width="26" height="20" rx="6" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <line x1="34" y1="40" x2="46" y2="30" stroke="var(--color-border-default)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="39" y1="52" x2="46" y2="42" stroke="var(--color-border-default)" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="21" cy="40" r="3" fill="var(--color-brand-primary)" opacity="0.4" />
      <circle cx="59" cy="30" r="3" fill="var(--color-subject-math)" opacity="0.4" />
      <circle cx="39" cy="62" r="3" fill="var(--color-subject-science)" opacity="0.4" />
    </svg>
  );
}

export function BadgesEmptyIllustration() {
  return <></>;
}

export function SessionsEmptyIllustration() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="16" width="48" height="40" rx="8" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <line x1="24" y1="30" x2="48" y2="30" stroke="var(--color-border-default)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="38" x2="40" y2="38" stroke="var(--color-border-default)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="52" cy="20" r="8" fill="var(--color-brand-primary)" opacity="0.2" />
      <path d="M49 20H55M52 17V23" stroke="var(--color-brand-primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
