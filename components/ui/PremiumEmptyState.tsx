'use client';

interface PremiumEmptyStateProps {
  illustration: 'map' | 'history';
  headline: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
}

function MapIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="12" y="42" width="38" height="36" rx="8" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <rect x="68" y="26" width="38" height="36" rx="8" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <rect x="38" y="78" width="38" height="30" rx="8" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <line x1="50" y1="60" x2="68" y2="44" stroke="var(--color-border-default)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="57" y1="78" x2="68" y2="62" stroke="var(--color-border-default)" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="31" cy="60" r="5" fill="var(--color-brand-primary)" opacity="0.35" />
      <circle cx="87" cy="44" r="5" fill="var(--color-subject-math)" opacity="0.35" />
      <circle cx="57" cy="93" r="5" fill="var(--color-subject-science)" opacity="0.35" />
      <circle cx="85" cy="85" r="3" fill="var(--color-border-default)" opacity="0.5" />
      <circle cx="20" cy="78" r="3" fill="var(--color-border-default)" opacity="0.5" />
    </svg>
  );
}

function HistoryIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="60" cy="60" r="44" fill="var(--color-bg-secondary)" stroke="var(--color-border-default)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="var(--color-border-default)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="60" y1="36" x2="60" y2="60" stroke="var(--color-brand-primary)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="60" y1="60" x2="76" y2="68" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="60" r="4" fill="var(--color-brand-primary)" />
      <line x1="20" y1="30" x2="32" y2="38" stroke="var(--color-border-default)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="100" y1="30" x2="88" y2="38" stroke="var(--color-border-default)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="20" r="4" fill="var(--color-subject-science)" opacity="0.4" />
      <circle cx="92" cy="60" r="4" fill="var(--color-subject-math)" opacity="0.4" />
      <circle cx="60" cy="100" r="4" fill="var(--color-subject-arts)" opacity="0.4" />
      <circle cx="28" cy="60" r="4" fill="var(--color-subject-history)" opacity="0.4" />
    </svg>
  );
}

export function PremiumEmptyState({
  illustration,
  headline,
  body,
  ctaLabel,
  onCta,
}: PremiumEmptyStateProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-24 px-6">
      <div className="w-28 h-28 flex items-center justify-center mx-auto mb-6 text-text-muted/60" aria-hidden="true">
        {illustration === 'map' ? <MapIllustration /> : <HistoryIllustration />}
      </div>
      <h3 className="text-headline-sm text-text-primary font-heading mb-3">
        {headline}
      </h3>
      <p className="text-body-md text-text-secondary font-body leading-relaxed max-w-sm mx-auto mb-8">
        {body}
      </p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-[5px] border-brand-dark transition-all duration-100 hover:brightness-105 active:translate-y-1 active:border-b-0 active:scale-[0.98]"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
