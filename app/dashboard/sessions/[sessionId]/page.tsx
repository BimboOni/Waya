'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IconArrowLeft, IconSparkles, IconCheck } from '@tabler/icons-react';
import { SUBJECT_CONTAINER_COLORS, SUBJECT_TEXT_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface SessionDetail {
  id: string;
  topic: string;
  subject: string;
  explanation?: string;
  synthesisQuestion?: string;
  aiResponse: string;
  userAnswer: string;
  xpEarned: number;
  completed: boolean;
  createdAt: string;
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const found = (data.sessions ?? []).find((s: any) => s.id === params.sessionId);
          if (found) setSession(found);
        }
      } catch {}
      setLoading(false);
    })();
  }, [params.sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-border-default animate-spin" style={{ borderTopColor: 'var(--color-brand-primary)', animationDuration: '0.65s' }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-body-md text-text-muted">Session not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-body-md text-text-secondary hover:text-text-primary transition-colors mb-4">
          <IconArrowLeft size={18} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider"
            style={{ backgroundColor: SUBJECT_CONTAINER_COLORS[session.subject], color: SUBJECT_TEXT_COLORS[session.subject] }}>
            {session.subject}
          </span>
          <span className="text-body-sm text-text-muted">{formatDate(session.createdAt)} <span className="ml-2 text-label-sm font-medium" style={{ color: 'var(--color-success)' }}>COMPLETED</span></span>
        </div>

        <div className="flex flex-col gap-5">
          <div className="self-end max-w-[80%]">
            <div className="bg-bg-secondary rounded-2xl rounded-br-md px-5 py-4">
              <p className="text-body-lg text-text-primary">{session.topic}</p>
            </div>
          </div>

          {(() => {
            const parts = (session.aiResponse ?? '').split(/\[synthesis_question\]/i);
            const explanation = parts[0]?.trim() || session.explanation || session.aiResponse;
            const synthQuestion = parts[1]?.trim() || (session as any).synthesisQuestion || '';
            return (
              <>
                <div className="self-start max-w-[90%]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                      <IconSparkles size={16} className="text-brand-on-primary" />
                    </div>
                    <div className="bg-bg-card border border-border-default px-5 py-4" style={{ borderRadius: 'var(--radius-lg)' }}>
                      <p className="text-body-lg text-text-primary font-body leading-relaxed whitespace-pre-wrap">{explanation}</p>
                    </div>
                  </div>
                </div>

                <div className="self-start max-w-[90%]">
                  <div className="rounded-2xl p-5 bg-white dark:bg-[#1A1A1A] dark:border dark:border-slate-800">
                    <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-2">Synthesis Challenge</p>
                    <p className="text-body-md text-text-primary">{synthQuestion || 'No challenge question recorded for this session.'}</p>
                  </div>
                </div>
              </>
            );
          })()}

          <div className="self-end max-w-[80%]">
            <div className="bg-bg-secondary rounded-2xl rounded-br-md px-5 py-4">
              <p className="text-body-lg text-text-primary">{session.userAnswer}</p>
            </div>
          </div>

          <div className="self-start max-w-[90%]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                <IconSparkles size={16} className="text-brand-on-primary" />
              </div>
              <div className="bg-bg-card border border-border-default px-5 py-4" style={{ borderRadius: 'var(--radius-lg)' }}>
                <p className="text-body-lg text-text-primary font-body leading-relaxed">Great work! Keep exploring.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-bg-card border border-border-default rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <IconCheck size={24} style={{ color: 'var(--color-success)' }} />
          </div>
          <p className="text-label-lg font-bold mb-4" style={{ color: 'var(--color-success)' }}>XP earned: +{session.xpEarned} XP</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 rounded-full bg-brand-primary text-brand-on-primary font-body text-label-lg font-bold border-b-4 border-brand-dark transition-all duration-100 hover:brightness-105 active:translate-y-1 active:border-b-0"
          >
            Study this topic again →
          </button>
        </div>
      </div>
    </div>
  );
}
