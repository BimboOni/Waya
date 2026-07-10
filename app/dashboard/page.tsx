'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWayaStore } from '@/store/useWayaStore';
import { AppShell } from '@/components/layout/AppShell';
import { StudyTab } from '@/components/dashboard/StudyTab';
import { SubjectsTab } from '@/components/dashboard/SubjectsTab';
import { HistoryTab } from '@/components/dashboard/HistoryTab';
import { SessionView, type ResumeSessionData } from '@/components/dashboard/SessionView';
import { KnowledgeMap } from '@/components/dashboard/KnowledgeMap';
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { WelcomeModal } from '@/components/dashboard/WelcomeModal';
import { FirstTimeTips, hasSeenTips, markTipsSeen } from '@/components/onboarding/FirstTimeTips';
import type { DashboardTab } from '@/components/layout/TopNav';
import type { MockUser, MockSession } from '@/types';
import { createClientSupabaseClient } from '@/lib/supabase/client';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useWayaStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('study');
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionSubject, setSessionSubject] = useState('');
  const [resumeSession, setResumeSession] = useState<ResumeSessionData | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Auth guard — check local session first, NEVER redirect if session exists
  useEffect(() => {
    const supabase = createClientSupabaseClient();

    async function verifyIdentity() {
      try {
        // 1. Check local client session state first
        const { data: { session } } = await supabase.auth.getSession();

        // 2. Also check localStorage for Supabase auth tokens (sb-* keys)
        const hasLocalToken = typeof window !== 'undefined' &&
          Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
            .some((k) => k?.startsWith('sb-'));

        const hasSession = !!session || hasLocalToken;

        if (!hasSession) {
          console.log('[DASHBOARD AUTH ALERT]: No active session found. Redirecting...');
          router.push('/auth?view=login');
          return;
        }

        // 3. Session exists locally! Proceed with database profile sync safely
        if (session) await supabase.auth.refreshSession();
        const res = await fetch('/api/user/me');
        console.log('[DASHBOARD RECEIVED PAYLOAD STATUS]:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('[DASHBOARD RECEIVED PAYLOAD]:', data);
          const userData = data.user || data;
          if (userData && userData.id) {
            setUser(userData as MockUser);
            setDataReady(true);
            setIsLoading(false);
            return;
          }
        }

        // 4. Database profile sync failed but session is valid — don't boot them!
        console.warn('[DASHBOARD] API sync failed but session exists — staying on dashboard');
        setIsLoading(false);

      } catch (err) {
        console.error('[DASHBOARD IDENTITY CRASH]:', err);
        router.push('/auth?view=login');
      }
    }

    verifyIdentity();
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/session', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions ?? []);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Show welcome for brand-new users (only once — uses welcomeDone ref to prevent re-trigger)
  const [welcomeDone, setWelcomeDone] = useState(false);
  useEffect(() => {
    if (dataReady && !isLoading && sessions.length === 0 && !hasSeenTips() && !welcomeDone && !showWelcome) {
      setShowWelcome(true);
    }
  }, [dataReady, isLoading, sessions.length, welcomeDone, showWelcome]);

  // Show tips after welcome modal closes (or directly for returning users)
  const shouldShowTips = welcomeDone;
  useEffect(() => {
    if (dataReady && !isLoading && !hasSeenTips() && !showWelcome && shouldShowTips) {
      const timer = setTimeout(() => setShowTips(true), 600);
      return () => clearTimeout(timer);
    }
  }, [dataReady, isLoading, showWelcome, shouldShowTips]);

  const handleWelcomeDone = () => {
    setShowWelcome(false);
    setWelcomeDone(true);
  };

  const handleTipsDone = () => {
    setShowTips(false);
    markTipsSeen();
  };

  const handleStartSession = useCallback((topic: string, subject?: string) => {
    setSessionTopic(topic);
    setSessionSubject(subject ?? '');
    setResumeSession(null);
    setSessionOpen(true);
  }, []);

  const handleResumeSession = useCallback((session: MockSession, keepExploringTopic?: string) => {
    const parts = session.aiResponse?.split(/\[synthesis_question\]/i) ?? [];
    const explanation = parts[0]?.trim() ?? '';
    const synthQuestion = parts[1]?.trim() || (session as any).synthesisQuestion || '';
    setResumeSession({
      sessionId: session.id,
      topic: session.topic,
      explanation,
      synthQuestion,
      subject: session.subject,
      keepExploringTopic,
    });
    setSessionTopic(session.topic);
    setSessionOpen(true);
  }, []);

  // Auto-start session from ?topic= param (Subject Detail staging view entry)
  useEffect(() => {
    if (!dataReady) return;
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      handleStartSession(topicParam);
      router.replace('/dashboard');
    }
  }, [searchParams, dataReady, handleStartSession, router]);

  // Navigate to tab from ?tab= param
  useEffect(() => {
    if (!dataReady) return;
    const tabParam = searchParams.get('tab');
    if (tabParam && ['study', 'subjects', 'map', 'history', 'settings', 'profile'].includes(tabParam as string)) {
      setActiveTab(tabParam as DashboardTab);
      router.replace('/dashboard');
    }
  }, [searchParams, dataReady, router]);

  const handleSessionClose = async () => {
    setSessionOpen(false);
    setSessionTopic('');
    setSessionSubject('');
    setResumeSession(null);
    await fetchSessions();
  };

  const renderTab = (tab: DashboardTab) => {
    switch (tab) {
      case 'study':
        return (
          <StudyTab
            sessions={sessions}
            onStartSession={handleStartSession}
            onResumeSession={handleResumeSession}
            onViewHistory={() => setActiveTab('history')}
          />
        );
      case 'subjects':
        return (
          <SubjectsTab
            sessions={sessions}
            onStartSession={handleStartSession}
            onResumeSession={handleResumeSession}
          />
        );
      case 'map':
        return (
          <div className="h-[calc(100vh-4rem)] w-full">
            <KnowledgeMap sessions={sessions} onCta={() => setActiveTab('study')} onStartSession={handleStartSession} onResumeSession={handleResumeSession} />
          </div>
        );
      case 'history':
        return <HistoryTab sessions={sessions} onCta={() => setActiveTab('study')} onResumeSession={handleResumeSession} />;
      case 'profile':
        return <ProfileTab synthesesCount={sessions.filter((s) => s.completed).length} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 rounded-full border-2 border-border-default animate-spin" style={{ borderTopColor: 'var(--color-brand-primary)', animationDuration: '0.65s' }} />
      </div>
    );
  }

  return (
    <>
      <AppShell
        initialUser={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderContent={renderTab}
      />

      <SessionView
        isOpen={sessionOpen}
        onClose={handleSessionClose}
        topic={sessionTopic}
        userInterests={user?.interests ?? []}
        resumeSession={resumeSession}
        userSubject={sessionSubject}
        onSessionComplete={fetchSessions}
      />

      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeDone}
        onStartTooltips={handleWelcomeDone}
      />

      <FirstTimeTips
        isOpen={showTips}
        onComplete={handleTipsDone}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-primary"><div className="w-8 h-8 rounded-full border-2 border-border-default animate-spin" style={{ borderTopColor: 'var(--color-brand-primary)', animationDuration: '0.65s' }} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
