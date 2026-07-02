import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ children, size = 32, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

// ── Interest Icons ────────────────────────────────────────────────

export function IconGaming({ size }: IconProps) {
  return (
    <Base size={size}>
      <rect x="4" y="10" width="24" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="10" cy="17" r="2" fill="currentColor" />
      <circle cx="22" cy="17" r="2" fill="currentColor" />
      <line x1="15" y1="14" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="18" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconMusic({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="10" cy="23" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="22" cy="21" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="13" y1="23" x2="13" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="6" x2="24" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="25" y1="8" x2="25" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Base>
  );
}

export function IconSports({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M16 7 C20 12 20 20 16 25 C12 20 12 12 16 7Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="7" y1="16" x2="25" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconArt({ size }: IconProps) {
  return (
    <Base size={size}>
      <rect x="5" y="6" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="9" y1="12" x2="9" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="24" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <circle cx="20" cy="18" r="2" fill="currentColor" />
      <line x1="23" y1="26" x2="27" y2="28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Base>
  );
}

export function IconCoding({ size }: IconProps) {
  return (
    <Base size={size}>
      <rect x="3" y="8" width="26" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="10" y1="13" x2="7" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="13" x2="25" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="16" x2="22" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconCooking({ size }: IconProps) {
  return (
    <Base size={size}>
      <rect x="8" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="8" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 20 L11 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 20 L21 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 20 L16 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 6 L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 6 L19 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconReading({ size }: IconProps) {
  return (
    <Base size={size}>
      <path d="M6 8 C10 6 16 6 16 6 C16 6 22 6 26 8 L26 22 C22 20 16 20 16 20 C16 20 10 20 6 22 L6 8Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="16" y1="6" x2="16" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconScience({ size }: IconProps) {
  return (
    <Base size={size}>
      <path d="M16 4 L16 14 L22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M16 14 L10 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="16" cy="23" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="8" cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="25" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </Base>
  );
}

// ── Subject Icons ─────────────────────────────────────────────────

export function IconContentCreation({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="16" cy="14" r="4" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="5" y="20" width="22" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <polygon points="16,18 13,21 19,21" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="8" y1="24" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconMath({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="11" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 12 L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 20 L19 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconScienceBig({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <line x1="12" y1="12" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
      <circle cx="22" cy="16" r="1.5" fill="currentColor" />
      <circle cx="10" cy="16" r="1.5" fill="currentColor" />
    </Base>
  );
}

export function IconHistory({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="12" y="10" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="12" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="10" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="10" x2="18" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

export function IconArtsBig({ size }: IconProps) {
  return (
    <Base size={size}>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="20" cy="18" r="2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="16" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Base>
  );
}

// ── Icon Map ──────────────────────────────────────────────────────

export const INTEREST_ICONS: Record<string, React.ComponentType<IconProps>> = {
  gaming: IconGaming,
  music: IconMusic,
  sports: IconSports,
  art: IconArt,
  content: IconContentCreation,
  coding: IconCoding,
  cooking: IconCooking,
  reading: IconReading,
  science: IconScience,
};

export const SUBJECT_ICONS: Record<string, React.ComponentType<IconProps>> = {
  Mathematics: IconMath,
  ScienceTech: IconScienceBig,
  HistoryCulture: IconHistory,
  CreativeArts: IconArtsBig,
};

export type InterestId = keyof typeof INTEREST_ICONS;
export type SubjectId = keyof typeof SUBJECT_ICONS;

export function InterestIcon({ name, size, className }: { name: string; size?: number; className?: string }) {
  const Icon = INTEREST_ICONS[name];
  if (!Icon) return null;
  return <span className={className}><Icon size={size ?? 32} /></span>;
}

export function SubjectIcon({ name, size, className }: { name: string; size?: number; className?: string }) {
  const Icon = SUBJECT_ICONS[name];
  if (!Icon) return null;
  return <span className={className}><Icon size={size ?? 40} /></span>;
}
