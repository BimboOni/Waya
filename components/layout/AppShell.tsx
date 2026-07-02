'use client';

import { useState, useEffect } from 'react';
import { useWayaStore } from '@/store/useWayaStore';
import { Toast } from '@/components/ui/Toast';
import { LevelUpModal } from '@/components/gamification/LevelUpModal';
import { TopNav } from '@/components/layout/TopNav';
import { MobileNav } from '@/components/layout/MobileNav';
import type { DashboardTab } from '@/components/layout/TopNav';
import type { MockUser } from '@/types';

interface AppShellProps {
  children?: React.ReactNode;
  initialUser?: MockUser | null;
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  renderContent?: (tab: DashboardTab) => React.ReactNode;
}

export function AppShell({ children, initialUser, activeTab: controlledTab, onTabChange: controlledOnTabChange, renderContent }: AppShellProps) {
  const { setUser } = useWayaStore();
  const [internalTab, setInternalTab] = useState<DashboardTab>('study');

  const activeTab = controlledTab ?? internalTab;
  const onTabChange = controlledOnTabChange ?? setInternalTab;

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser, setUser]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col overflow-hidden">
      <TopNav activeTab={activeTab} onTabChange={onTabChange} />

      <main className="flex-1 pt-16 pb-20 md:pb-0 overflow-hidden">
        {renderContent ? renderContent(activeTab) : children}
      </main>

      <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
      <Toast />
      <LevelUpModal />
    </div>
  );
}
