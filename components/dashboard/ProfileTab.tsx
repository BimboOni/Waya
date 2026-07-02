'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconFlame, IconBolt, IconCheck, IconX, IconPencil, IconStack2 } from '@tabler/icons-react';
import { useWayaStore } from '@/store/useWayaStore';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { XPBar } from '@/components/ui/XPBar';
import { LEVEL_NAMES, XP_PER_LEVEL, HOBBIES } from '@/lib/constants';
import { getLevelFromXp } from '@/lib/gamification';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: i * 0.06 },
  },
});

export function ProfileTab({ synthesesCount = 0 }: { synthesesCount?: number }) {
  const { user, xp, streak, badges, setUser } = useWayaStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [interestSelections, setInterestSelections] = useState<string[]>([]);
  const [nameDraft, setNameDraft] = useState(user?.name ?? '');
  const [interestDrafts, setInterestDrafts] = useState<string[]>(user?.interests ?? []);
  const [saving, setSaving] = useState(false);
  const [interestSaving, setInterestSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { level, progressBarPercent } = getLevelFromXp(xp);
  const currentLevelName = LEVEL_NAMES[level] ?? 'Curious';
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const earnedBadges = badges.length;
  const levelEntries = Object.entries(LEVEL_NAMES);

  const handleSave = async () => {
    if (!nameDraft.trim()) return;
    const newName = nameDraft.trim();
    setSaving(true);
    if (newName === user?.name) { setIsEditingName(false); setSaving(false); return; }
    try {
      await fetch('/api/user/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }), credentials: 'include',
      });
    } catch {}
    if (user) setUser({ ...user, name: newName });
    setMsg('Saved'); setTimeout(() => setMsg(null), 2000);
    setSaving(false);
    setIsEditingName(false);
  };

  const handleAddInterest = async () => {
    setInterestSaving(true);
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: JSON.stringify(interestSelections) }), credentials: 'include',
      });
      if (res.ok && user) {
        setUser({ ...user, interests: interestSelections });
      }
    } catch {}
    setInterestSaving(false);
    setIsAddingInterest(false);
    setInterestSelections([]);
  };

  const openAddInterest = () => {
    const normalized = (user?.interests ?? []).map((stored) => {
      const match = HOBBIES.find((h) => h.id === stored || h.label.toLowerCase() === stored.toLowerCase());
      return match ? match.id : stored;
    });
    setInterestSelections(normalized);
    setIsAddingInterest(true);
  };

  const closeAddInterest = () => {
    setIsAddingInterest(false);
    setInterestSelections([]);
  };

  const toggleInterestSelection = (id: string) => {
    setInterestSelections((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const isInterestSelected = (id: string) => {
    return interestSelections.includes(id);
  };

  const openEditName = () => {
    setNameDraft(user?.name ?? '');
    setIsEditingName(true);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 pt-16 pb-12 flex flex-col gap-10">

      {/* ── Profile card ── */}
      <motion.section {...fadeUp(0)} aria-labelledby="profile-heading">
        <div className="rounded-2xl bg-bg-card border border-border-default px-6 sm:px-8 py-6 sm:py-8">

          {/* Name + streak row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 id="profile-heading" className="text-display-sm font-heading text-text-primary leading-tight tracking-tight truncate">
                  {user?.name ?? 'Learner'}
                </h1>
                <button onClick={openEditName} className="shrink-0 text-text-muted hover:text-text-secondary cursor-pointer transition-colors" aria-label="Edit name">
                  <IconPencil size={16} />
                </button>
              </div>
              <p className="text-body-md text-text-secondary font-body mt-1">{user?.email ?? ''}</p>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-body font-semibold shrink-0 mt-1"
                style={{ backgroundColor: 'var(--color-streak-container)', color: 'var(--color-streak)' }}
              >
                <IconFlame size={13} />
                {streak} day streak
              </div>
            )}
          </div>

          {/* Level + XP bar */}
          <div className={isEditingName ? 'mb-10' : ''}>
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-xs font-medium text-text-muted">
                Level {level}
              </span>
              <span className="text-xs text-text-muted ml-auto">
                {xpIntoLevel} / {XP_PER_LEVEL} XP
              </span>
            </div>
            <XPBar currentXP={xp} animated height={10} />
          </div>

          {/* Name editing */}
          {isEditingName && (
            <div className="flex flex-col gap-5 max-w-md w-full mb-6">
              <input
                type="text" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditingName(false); }}
                autoFocus
                className="border border-border-default rounded-xl px-4 py-2.5 bg-bg-card text-text-primary font-body text-body-lg outline-none focus:border-brand-primary transition-all w-full"
              />
              <div className="flex flex-row gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-brand-primary text-white font-bold rounded-full h-12 px-6 border-b-4 border-brand-hover active:translate-y-[2px] active:border-b-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setIsEditingName(false)}
                  className="flex-1 bg-bg-card border border-border-default border-b-4 text-text-secondary font-medium rounded-full h-12 px-6 active:translate-y-[2px] active:border-b-2 transition-all hover:brightness-95">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {msg && (
            <div className="mt-4 flex items-center gap-1.5 text-[13px] font-body font-medium text-success">
              <IconCheck size={14} /> {msg}
            </div>
          )}

        </div>
      </motion.section>

      {/* ── Your interests ── */}
      <motion.section {...fadeUp(1)} aria-labelledby="interests-heading">
        <h2 id="interests-heading" className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
          Your interests
        </h2>
        <div className="rounded-2xl bg-bg-card border border-border-default px-6 sm:px-8 py-6">
          <div className="flex flex-row justify-between items-start w-full gap-4">
            <div className="flex flex-wrap items-center gap-3 gap-y-3">
              {(user?.interests ?? []).length > 0 ? (
                  (user?.interests ?? []).map((interestId) => {
                    const hobby = HOBBIES.find((h) => h.id === interestId);
                    return (
                      <span key={interestId}
                        className="h-12 px-4 flex items-center justify-center rounded-full text-sm font-medium bg-bg-secondary text-text-secondary"
                      >
                        {hobby?.label ?? interestId}
                      </span>
                  );
                })
              ) : (
                <span className="text-[13px] font-body text-text-muted">No interests selected yet</span>
              )}
            </div>
            {!isAddingInterest && (
                <button onClick={openAddInterest}
                  className="bg-bg-card border border-border-default border-b-4 text-text-secondary font-medium rounded-full h-12 px-6 active:translate-y-[2px] active:border-b-2 transition-all hover:brightness-95 shrink-0">
                  Add Interest
                </button>
            )}
          </div>

          {isAddingInterest && (
            <div className="mt-6 space-y-4">
              <p className="text-label-md text-text-muted font-body font-medium">
                Pick more interests <span className="text-text-muted font-normal">(min 2, max 5)</span>
              </p>
              <div className="flex flex-wrap gap-3 gap-y-3">
                {HOBBIES.map((h) => {
                  const selected = isInterestSelected(h.id);
                  return (
                    <button key={h.id} onClick={() => toggleInterestSelection(h.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-body font-medium transition-all duration-150 ${
                        selected ? 'bg-brand-primary text-brand-on-primary' : 'bg-bg-secondary text-text-secondary border border-border-default hover:border-brand-primary/40'
                      }`}
                    >
                      {h.label}
                      {selected && <IconX size={12} className="text-brand-on-primary/70" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 pt-6">
                <button onClick={handleAddInterest} disabled={interestSaving}
                  className="flex-1 bg-brand-primary text-white font-bold rounded-full h-12 px-6 border-b-4 border-brand-hover active:translate-y-[2px] active:border-b-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95">
                  {interestSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={closeAddInterest}
                  className="flex-1 bg-bg-card border border-border-default border-b-4 text-text-secondary font-medium rounded-full h-12 px-6 active:translate-y-[2px] active:border-b-2 transition-all hover:brightness-95">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Your journey ── */}
      <motion.section {...fadeUp(2)} aria-label="Level progression">
        <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
          Your journey
        </h2>
        <div className="rounded-2xl bg-bg-card border border-border-default px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-5">
            {levelEntries.map(([lvl, name], i) => {
              const lvlNum = Number(lvl);
              const isPast = lvlNum < level;
              const isCurrent = lvlNum === level;

              return (
                <div key={lvl} className="flex flex-col items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      width: isCurrent ? 40 : 28,
                      height: isCurrent ? 40 : 28,
                      backgroundColor: isPast || isCurrent ? 'var(--color-brand-primary)' : 'transparent',
                      color: isPast || isCurrent ? 'white' : 'var(--color-text-muted)',
                      border: isPast || isCurrent ? 'none' : '1.5px solid var(--color-border-default)',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(14,164,164,0.16)' : 'none',
                      fontSize: isCurrent ? 14 : 11,
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isPast ? '\u2713' : lvl}
                  </div>
                  <span className="text-xs font-medium text-center whitespace-nowrap leading-tight"
                    style={{
                      color: isCurrent ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                    }}
                  >
                    {name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border-default">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-body-md font-body text-text-primary font-medium">
                  {currentLevelName} · Level {level}
                </p>
                <p className="text-body-sm text-text-muted font-body mt-0.5">
                  {progressBarPercent}% to {LEVEL_NAMES[level + 1] ?? 'Master'}
                  {level < 5 && ` · ${XP_PER_LEVEL - xpIntoLevel} XP to go`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Stats ── */}
      <motion.section {...fadeUp(3)} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
          Stats
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 rounded-2xl bg-bg-card border border-border-default p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-info-container)' }}>
              <IconStack2 size={28} style={{ color: 'var(--color-info)' }} className="shrink-0" />
            </div>
            <div>
              <p className="font-heading font-bold text-text-primary text-display-sm tracking-tight">{synthesesCount}</p>
              <p className="text-body-md font-body text-text-muted">Syntheses</p>
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-bg-card border border-border-default p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(172, 248, 73, 0.2)' }}>
              <IconBolt size={28} style={{ color: 'var(--color-xp)' }} className="shrink-0" />
            </div>
            <div>
              <p className="font-heading font-bold text-text-primary text-display-sm tracking-tight">{xp.toLocaleString()}</p>
              <p className="text-body-md font-body text-text-muted">Total XP</p>
            </div>
          </div>
          <div className="flex-1 rounded-2xl bg-bg-card border border-border-default p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-streak-container)' }}>
              <IconFlame size={28} style={{ color: 'var(--color-streak)' }} className="shrink-0" />
            </div>
            <div>
              <p className="font-heading font-bold text-text-primary text-display-sm tracking-tight">{streak}</p>
              <p className="text-body-md font-body text-text-muted">Day streak</p>
            </div>
          </div>
        </div>

      </motion.section>

      {/* ── Badges ── */}
      <motion.section {...fadeUp(4)} aria-labelledby="badges-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="badges-heading" className="font-heading font-medium" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
            Badges
          </h2>
          <span className="text-label-md text-text-muted font-body">{earnedBadges} earned</span>
        </div>
        <BadgeGrid badges={badges} />
      </motion.section>

    </div>
  );
}
