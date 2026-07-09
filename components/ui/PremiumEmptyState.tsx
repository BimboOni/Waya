'use client';

interface PremiumEmptyStateProps {
  headline: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function PremiumEmptyState({
  headline,
  body,
  ctaLabel,
  onCta,
}: PremiumEmptyStateProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-24 px-6">
      <h3 className="text-headline-sm text-text-primary font-heading mb-3">
        {headline}
      </h3>
      <p className="text-body-md text-text-secondary font-body leading-relaxed max-w-sm mx-auto mb-8">
        {body}
      </p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-dark transition-all duration-100 hover:brightness-105 active:translate-y-[3px] active:border-b-0 active:shadow-none active:scale-[0.98]"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
