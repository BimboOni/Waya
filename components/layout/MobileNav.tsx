'use client';

import { IconBook, IconCategory, IconMap, IconHistory } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { DashboardTab } from './TopNav';

const TABS: { id: DashboardTab; label: string; icon: typeof IconBook }[] = [
  { id: 'study', label: 'Study', icon: IconBook },
  { id: 'subjects', label: 'Subjects', icon: IconCategory },
  { id: 'map', label: 'Map', icon: IconMap },
  { id: 'history', label: 'History', icon: IconHistory },
];

interface MobileNavProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-card border-t border-border-default" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-14 px-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              data-tab={id}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-md',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset',
                active ? 'text-brand-primary' : 'text-text-muted hover:text-text-secondary',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} className={cn('transition-transform duration-200', active && 'scale-110')} />
              <span className="text-label-sm font-body">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
