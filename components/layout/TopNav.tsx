'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconFlame, IconBolt, IconUser, IconSettings, IconLogout, IconSun, IconMoon } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWayaStore } from '@/store/useWayaStore';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const TAB_IDS = ['study', 'subjects', 'map', 'history'] as const;
export type DashboardTab = (typeof TAB_IDS)[number] | 'settings' | 'profile';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'study', label: 'Study' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'map', label: 'Map' },
  { id: 'history', label: 'History' },
];

interface TopNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

function applyTheme(theme: string) {
  const root = document.documentElement;
  if (theme === 'system') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
  localStorage.setItem('waya_theme', theme);
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const router = useRouter();
  const { user, xp, streak } = useWayaStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const t = localStorage.getItem('waya_theme');
    return t === 'dark' || (t !== 'light' && t !== 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await createClientSupabaseClient().auth.signOut();
    useWayaStore.setState({ user: null, xp: 0, level: 1, streak: 0, badges: [] });
    localStorage.clear();
    router.push('/');
  };

  const handleThemeToggle = () => {
    const current = localStorage.getItem('waya_theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setIsDark(next === 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-card border-b border-border-default h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-logo text-2xl text-brand-primary font-black lowercase tracking-tight leading-none">
            waya
          </Link>
          <nav className="hidden md:flex items-center gap-0" aria-label="Main navigation">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative px-5 py-2 text-label-lg font-body font-medium transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-brand-primary',
                  active ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

        <div className="flex items-center justify-end gap-4 sm:gap-4">
          {/* Streak pill */}
          <div data-gamification="true" className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <IconFlame className="w-5 h-5 text-[var(--color-streak)]" />
            <span>{streak}</span>
          </div>

          {/* XP pill */}
          <div className="flex items-center gap-1.5 text-sm font-bold text-text-primary">
            <IconBolt className="w-5 h-5 text-[var(--color-xp)]" />
            <span>{xp}</span>
          </div>

          {/* User controls — theme + avatar */}
          <div className="flex items-center bg-bg-secondary dark:bg-[#2A2A2A] rounded-full p-0.5 gap-0.5">
            <div className="relative group">
              <button
                onClick={handleThemeToggle}
                className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
                aria-label="Toggle theme"
              >
                <IconSun size={18} className="hidden [html[data-theme=dark]_&]:block" />
                <IconMoon size={18} className="block [html[data-theme=dark]_&]:hidden" />
              </button>
            <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-top scale-95 opacity-0 pointer-events-none shadow-sm ${dropdownOpen ? '' : 'group-hover:scale-100 group-hover:opacity-100'}`}>
              {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
            </div>            
            <div className="relative group" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-brand-on-primary text-label-md font-heading font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
              >
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </button>
            <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-top scale-95 opacity-0 pointer-events-none shadow-sm ${dropdownOpen ? '' : 'group-hover:scale-100 group-hover:opacity-100'}`}>
              Account
            </span>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-56 bg-bg-card border border-border-default rounded-xl shadow-sm overflow-hidden z-50"
                >
                    <div className="px-4 py-3 border-b border-border-default">
                    <p className="text-label-lg text-text-primary font-medium truncate">{user?.name ?? 'Learner'}</p>
                    <p className="text-xs text-slate-500 font-normal truncate">{user?.email ?? ''}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { setDropdownOpen(false); onTabChange('profile'); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-label-lg text-text-secondary hover:bg-bg-secondary transition-colors">
                      <IconUser size={16} /> Profile
                    </button>
                    <button onClick={() => { setDropdownOpen(false); onTabChange('settings'); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-label-lg text-text-secondary hover:bg-bg-secondary transition-colors">
                      <IconSettings size={16} /> Settings
                    </button>
                    <div className="border-t border-border-default my-1" />
                    <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2.5 text-label-lg text-error hover:bg-error/[0.06] transition-colors">
                      <IconLogout size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}
