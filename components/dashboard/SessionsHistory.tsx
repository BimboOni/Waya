'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Clock, Award, BookOpen } from 'lucide-react';


interface Session {
  id: string; topic: string; subject: string; aiResponse: string;
  userAnswer?: string; xpEarned: number; completed: boolean; createdAt: string;
}

interface SessionsHistoryProps {
  sessions: Session[];
  onResumeSession: (session: Session) => void;
}

const SUBJECT_META: Record<string, { label: string; icon: string; color: string }> = {
  ScienceTech: { label: 'Science & Tech', icon: '🔬', color: '#07B6D5' },
  Mathematics: { label: 'Mathematics', icon: '📐', color: '#895AF6' },
  HistoryCulture: { label: 'History & Culture', icon: '🗺️', color: '#D97959' },
  CreativeArts: { label: 'Creative Arts', icon: '🎨', color: '#EC4699' },
};

export function SessionsHistory({ sessions, onResumeSession }: SessionsHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const grouped = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const key = s.subject || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const groupOrder = ['ScienceTech', 'Mathematics', 'HistoryCulture', 'CreativeArts', 'Other'];

  if (sessions.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(14, 164, 164, 0.08)' }}>
          <BookOpen size={24} style={{ color: '#0EA4A4' }} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">No sessions yet</h3>
        <p className="text-sm text-slate-400 mb-5">Complete your first synthesis to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Session History</h2>
          <p className="text-sm text-slate-400 mt-0.5">{sessions.length} total sessions</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {groupOrder.map((groupKey) => {
          const group = grouped[groupKey];
          if (!group) return null;
          const meta = SUBJECT_META[groupKey] || { label: groupKey, icon: '📚', color: '#0EA4A4' };
          const isOpen = expandedGroup === groupKey;
          return (
            <div key={groupKey} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button onClick={() => setExpandedGroup(isOpen ? null : groupKey)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${meta.color}15` }}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{meta.label}</p>
                  <p className="text-[0.6rem] text-slate-400">{group.length} session{group.length !== 1 ? 's' : ''}</p>
                </div>
                {isOpen ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-3 space-y-1.5">
                      {group.map((s) => {
                        const isExpanded = expandedId === s.id;
                        const date = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                          <div key={s.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '5px solid var(--color-border-default)' }}>
                            <button onClick={() => setExpandedId(isExpanded ? null : s.id)}
                              className="w-full flex items-center gap-2.5 p-3 text-left transition-colors hover:bg-slate-100/50">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.completed ? '#82CB15' : '#FB6F84' }} />
                              <span className="flex-1 text-xs font-medium text-slate-700 truncate">{s.topic || 'Untitled'}</span>
                              <span className="text-[0.55rem] text-slate-400 shrink-0">{date}</span>
                              {s.completed ? (
                                <span className="text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full shrink-0 text-emerald-600">DONE</span>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onResumeSession(s); }}
                                  className="text-[0.5rem] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                                  style={{ color: 'var(--color-brand-primary)', backgroundColor: 'rgba(14, 164, 164, 0.08)' }}
                                >
                                  Resume
                                </button>
                              )}
                              {isExpanded ? <ChevronDown size={10} className="text-slate-300" /> : <ChevronRight size={10} className="text-slate-300" />}
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                  <div className="px-3 pb-3 space-y-2">
                                    {(() => {
                                      const parts = (s.aiResponse ?? '').split(/\[synthesis_question\]/i);
                                      const explanation = parts[0]?.trim();
                                      const question = parts[1]?.trim();
                                      return (
                                        <>
                                          {explanation && <p className="text-[0.6rem] text-slate-500 leading-relaxed">{explanation.slice(0, 200)}</p>}
                                          {question && (
                                            <div className="bg-white rounded-2xl p-4 dark:bg-[#1A1A1A] dark:border dark:border-slate-800">
                                              <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-1">Synthesis Challenge</p>
                                              <p className="text-body-md text-text-primary">{question}</p>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                    {s.userAnswer && (
                                      <div className="bg-white rounded-2xl p-4 dark:bg-[#1A1A1A] dark:border dark:border-slate-800">
                                        <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-1">Your Answer</p>
                                        <p className="text-body-md text-text-primary">{s.userAnswer}</p>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <Clock size={10} className="text-slate-400" />
                                        <span className="text-[0.55rem] text-slate-400">{date}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        {s.completed ? (
                                          <><Award size={10} className="text-emerald-500" /><span className="text-[0.55rem] font-medium text-emerald-600">+{s.xpEarned || 10} XP</span></>
                                        ) : (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); onResumeSession(s); }}
                                            className="flex items-center gap-1 text-[0.55rem] font-semibold"
                                            style={{ color: 'var(--color-brand-primary)' }}
                                          >
                                            Resume
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
