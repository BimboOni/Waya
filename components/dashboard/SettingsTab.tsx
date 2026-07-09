'use client';

import { IconVolume, IconBell, IconLogout, IconEye, IconEyeOff, IconCheck, IconSun, IconMoon, IconSettings, IconTrash, IconMail, IconPalette, IconFlame, IconAlertTriangle } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useWayaStore } from '@/store/useWayaStore';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import type { ThemeMode } from '@/types';

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'system') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  } else root.setAttribute('data-theme', theme);
  localStorage.setItem('waya_theme', theme);
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${on ? 'bg-brand-primary' : 'bg-border-default'}`}
      aria-checked={on} role="switch"
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 m-0.5 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function PwInput({ value, set, show, toggleShow, placeholder }: {
  value: string; set: (v: string) => void; show: boolean; toggleShow: () => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-border-default bg-bg-card text-text-primary text-body-md outline-none focus:border-brand-primary transition-all pr-10 placeholder:text-text-muted"
      />
      <button type="button" onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
        {show ? <IconEyeOff size={20} /> : <IconEye size={20} />}
      </button>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel, icon: Icon, confirmClass }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel: string; icon: React.ElementType; confirmClass?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card rounded-2xl border border-border-default p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-2.5 rounded-full bg-error-container/30 text-error">
            <Icon size={28} />
          </div>
          <h3 className="text-headline-sm font-heading text-text-primary">{title}</h3>
          <p className="text-body-md text-text-muted">{description}</p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onClose}
              className="flex-1 bg-bg-card border-2 border-border-default border-b-4 text-text-secondary font-medium rounded-full h-12 px-6 active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 transition-all hover:brightness-95">
              Cancel
            </button>
            <button onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 font-medium rounded-full h-12 px-6 border-b-4 active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 transition-all hover:brightness-110 ${confirmClass ?? 'bg-bg-card border-2 border-error dark:border-red-900/50 border-b-4 border-b-red-800 text-error dark:text-red-300 hover:bg-error-container/50 hover:brightness-95'}`}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsTab() {
  const { user, soundEnabled, setSoundEnabled, theme, setTheme } = useWayaStore();
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>((typeof window !== 'undefined' ? localStorage.getItem('waya_theme') : null) as ThemeMode || 'light');
  const [soundState, setSoundState] = useState(soundEnabled);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordReqs, setPasswordReqs] = useState({ len: false, upper: false, lower: false, num: false, special: false });

  const handleThemeChange = (mode: ThemeMode) => {
    setCurrentTheme(mode);
    setTheme(mode);
    applyTheme(mode);
  };

  const handleChangePassword = async () => {
    if (!oldPassword) { setPasswordMsg('Enter your current password'); return; }
    if (!passwordReqs.len || !passwordReqs.upper || !passwordReqs.lower || !passwordReqs.num || !passwordReqs.special) { setPasswordMsg('Password does not meet all requirements.'); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg('Passwords do not match'); return; }
    setSaving(true);
    try {
      const supabase = createClientSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: oldPassword });
      if (signInError) { setPasswordMsg('Current password is incorrect'); setSaving(false); return; }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setPasswordMsg(error.message); } else {
        setPasswordMsg('Password updated!');
        setShowPasswordForm(false);
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch { setPasswordMsg('Something went wrong.'); }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await createClientSupabaseClient().auth.signOut();
    useWayaStore.setState({ user: null, xp: 0, level: 1, streak: 0, badges: [] });
    localStorage.clear();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/user/me', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) { console.error('[Settings] Account deletion failed:', res.status); return; }
      await createClientSupabaseClient().auth.signOut();
      useWayaStore.setState({ user: null, xp: 0, level: 1, streak: 0, badges: [] });
      localStorage.clear();
      window.location.href = '/';
    } catch (err) { console.error('[Settings] Account deletion error:', err); }
  };

  const sectionCard = 'rounded-2xl bg-bg-card p-6';
  const sectionBorder = '1px solid var(--color-border-default)';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
      <div className="mb-8 animate-fade-in-up opacity-0">
        <h1 className="text-3xl font-medium text-text-primary tracking-tight">Settings</h1>
        <p className="text-body-lg text-text-muted mt-1">Manage your preferences and account.</p>
      </div>

      <div className="space-y-8">

        {/* ── Appearance ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '50ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Appearance</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-lg text-text-primary font-medium">Theme</p>
                <p className="text-body-md text-text-muted">Choose between light, dark, or system theme.</p>
              </div>
              <div className="flex rounded-xl border border-border-default bg-bg-secondary p-1 w-fit shrink-0" role="radiogroup" aria-label="Theme selection">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
                  const selected = currentTheme === mode;
                  return (
                    <button key={mode} role="radio" aria-checked={selected} onClick={() => handleThemeChange(mode)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-md font-medium transition-all duration-200 ${
                        selected ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                      }`}>
                      {mode === 'light' ? <IconSun size={16} /> : mode === 'dark' ? <IconMoon size={16} /> : <IconSettings size={16} />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Audio ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Audio</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center shrink-0">
                  <IconVolume size={18} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-body-lg text-text-primary font-medium">Sound effects</p>
                  <p className="text-body-md text-text-muted">Play sounds for XP, streaks, and level ups</p>
                </div>
              </div>
              <Toggle on={soundState} onClick={() => { const n = !soundState; setSoundState(n); setSoundEnabled(n); localStorage.setItem('waya_sound_enabled', String(n)); }} />
            </div>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '150ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Notifications</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center shrink-0">
                    <IconBell size={18} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-body-lg text-text-primary font-medium">Daily reminders</p>
                    <p className="text-body-md text-text-muted">Get reminded to study each day</p>
                  </div>
                </div>
                <Toggle on={dailyReminders} onClick={() => setDailyReminders(!dailyReminders)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center shrink-0">
                    <IconBell size={18} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-body-lg text-text-primary font-medium">Streak alerts</p>
                    <p className="text-body-md text-text-muted">Get notified when your streak is at risk</p>
                  </div>
                </div>
                <Toggle on={streakAlerts} onClick={() => setStreakAlerts(!streakAlerts)} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Email ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Email</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            <p className="text-body-lg text-text-primary font-medium">{user?.email ?? 'No email registered'}</p>
            <p className="text-body-md text-text-muted mt-1">Used for login and account recovery.</p>
          </div>
        </section>

        {/* ── Password ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '250ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Password</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            {!showPasswordForm ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center w-full">
                <p className="text-body-md text-text-muted">Update your account password.</p>
                <button onClick={() => setShowPasswordForm(true)}
                  className="bg-bg-card border-2 border-border-default border-b-4 text-text-secondary font-medium rounded-full h-12 px-6 min-w-[180px] text-center active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 transition-all w-full sm:w-auto hover:brightness-95">
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <PwInput value={oldPassword} set={setOldPassword} show={showOld} toggleShow={() => setShowOld(!showOld)} placeholder="Current password" />
                <div>
                  <PwInput value={newPassword} set={(v) => { setNewPassword(v); setPasswordReqs({ len: v.length >= 8, upper: /[A-Z]/.test(v), lower: /[a-z]/.test(v), num: /[0-9]/.test(v), special: /[!@#$%^&*(),.?":{}|<>]/.test(v) }); }} show={showNew} toggleShow={() => setShowNew(!showNew)} placeholder="New password" />
                  {newPassword.length > 0 && !(passwordReqs.len && passwordReqs.upper && passwordReqs.lower && passwordReqs.num && passwordReqs.special) && (
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      {[
                        { met: passwordReqs.len, label: 'At least 8 characters' },
                        { met: passwordReqs.upper, label: 'One uppercase letter' },
                        { met: passwordReqs.lower, label: 'One lowercase letter' },
                        { met: passwordReqs.num, label: 'One number' },
                        { met: passwordReqs.special, label: 'One special character' },
                      ].map((req) => (
                        <p key={req.label} className={`text-xs font-body flex items-center gap-1.5 ${req.met ? 'text-success' : 'text-text-muted'}`}>
                          {req.met ? <IconCheck size={13} className="text-success" /> : <span className="w-[13px] h-[13px] rounded-full border border-border-default inline-block" />}
                          {req.label}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <PwInput value={confirmPassword} set={setConfirmPassword} show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} placeholder="Confirm new password" />
                  {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                    <p className="text-body-sm text-error mt-1">Passwords do not match.</p>
                  )}
                </div>
                {passwordMsg && (
                  <p className={`text-body-sm ${passwordMsg.includes('updated') ? 'text-success' : 'text-error'}`}>{passwordMsg}</p>
                )}
                <div className="flex items-center gap-3 pt-3">
                  <button onClick={handleChangePassword} disabled={saving || !oldPassword || !passwordReqs.len || !passwordReqs.upper || !passwordReqs.lower || !passwordReqs.num || !passwordReqs.special || !confirmPassword}
                    className={`flex-1 rounded-full font-medium transition-all text-center h-12 px-6 ${
                      oldPassword && passwordReqs.len && passwordReqs.upper && passwordReqs.lower && passwordReqs.num && passwordReqs.special && confirmPassword
                        ? 'bg-brand-primary text-white border-b-4 border-brand-hover active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100'
                        : 'bg-brand-primary text-white/40 border-b-4 border-brand-hover opacity-30 cursor-not-allowed'
                    }`}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                  <button onClick={() => { setShowPasswordForm(false); setPasswordMsg(null); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordReqs({ len: false, upper: false, lower: false, num: false, special: false }); }}
                    className="flex-1 bg-bg-card border-2 border-border-default border-b-4 text-text-secondary font-medium rounded-full h-12 px-6 active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 transition-all hover:brightness-95">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Sign Out ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Sign Out</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center w-full">
              <p className="text-body-md text-text-muted">Your data and progress will be saved.</p>
              <button onClick={() => setShowSignOutModal(true)}
                className="bg-bg-card border-2 border-error dark:border-red-900/50 border-b-4 border-b-red-800 text-error dark:text-red-300 font-medium rounded-full h-12 px-6 min-w-[180px] text-center active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 transition-all w-full sm:w-auto hover:bg-error-container/50 hover:brightness-95">
                  Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* ── Danger Zone ── */}
        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '350ms' }}>
          <h2 className="font-heading font-medium mb-4" style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Danger Zone</h2>
          <div className={sectionCard} style={{ border: sectionBorder }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center w-full">
              <p className="text-body-md text-text-muted">All data, sessions, and XP will be lost permanently.</p>
              <button onClick={() => setShowDeleteModal(true)}
                className="bg-bg-card border-2 border-error dark:border-red-900/50 border-b-4 border-b-red-800 text-error dark:text-red-300 font-medium rounded-full h-12 px-6 min-w-[180px] text-center active:translate-y-[2px] active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 transition-all w-full sm:w-auto hover:bg-error-container/50 hover:brightness-95">
                Delete Account
              </button>
            </div>
          </div>
        </section>

      </div>

      <ConfirmModal
        open={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out? Your data and progress will be saved."
        confirmLabel="Sign Out"
        icon={IconLogout}
        confirmClass="bg-error dark:bg-red-900/50 hover:bg-error/90 dark:hover:bg-error-container/90 text-white border-b-4 border-b-red-800"
      />
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This permanently deletes your account, all sessions, and XP. This cannot be undone."
        confirmLabel="Delete"
        icon={IconTrash}
        confirmClass="bg-error dark:bg-red-900/50 hover:bg-error/90 dark:hover:bg-error-container/90 text-white border-b-4 border-b-red-800"
      />

    </div>
  );
}
