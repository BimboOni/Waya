'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Search, X } from 'lucide-react';

const SUBJECTS = [
  { id: 'ScienceTech', label: 'Science & Tech', icon: '🔬', color: '#07B6D5', desc: 'Physics, biology, coding' },
  { id: 'Mathematics', label: 'Mathematics', icon: '📐', color: '#895AF6', desc: 'Algebra, geometry, calculus' },
  { id: 'HistoryCulture', label: 'History & Culture', icon: '🗺️', color: '#D97959', desc: 'World history, civics, geography' },
  { id: 'CreativeArts', label: 'Creative Arts', icon: '🎨', color: '#EC4699', desc: 'Music, art, literature' },
];

interface StudyHubProps {
  currentSubject: string;
  onSelectSubject: (id: string) => void;
  onOpenQuery: (subject: string) => void;
}

export function StudyHub({ currentSubject, onSelectSubject, onOpenQuery }: StudyHubProps) {
  const [synthesisModal, setSynthesisModal] = useState<string | null>(null);
  const [focusQuery, setFocusQuery] = useState('');

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">What will you explore today?</h2>
        <p className="text-sm text-slate-400 mt-1">Pick a subject to start a guided synthesis session</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUBJECTS.map((sub, i) => (
          <motion.button key={sub.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => { onSelectSubject(sub.id); setSynthesisModal(sub.id); }}
            className="group relative text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
            style={{
              borderColor: currentSubject === sub.id ? sub.color : 'rgb(226 232 240)',
              backgroundColor: currentSubject === sub.id ? `${sub.color}08` : 'white',
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${sub.color}15` }}>
                <span>{sub.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{sub.label}</p>
                <p className="text-[0.6rem] text-slate-400 mt-0.5">{sub.desc}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: `${sub.color}15` }}>
                <div className="h-full rounded-full" style={{ width: '0%', backgroundColor: sub.color }} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {synthesisModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={() => { setSynthesisModal(null); setFocusQuery(''); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{SUBJECTS.find((s) => s.id === synthesisModal)?.icon}</span>
                  <h3 className="text-base font-bold text-slate-900">{SUBJECTS.find((s) => s.id === synthesisModal)?.label}</h3>
                </div>
                <button onClick={() => { setSynthesisModal(null); setFocusQuery(''); }} className="p-1 text-slate-300 hover:text-slate-500">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-4">What specific topic would you like Waya to break down?</p>
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={focusQuery} onChange={(e) => setFocusQuery(e.target.value)}
                  placeholder="e.g. Digital Illustration, Vibe Coding..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#0EA4A4] transition-colors"
                  autoFocus />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setSynthesisModal(null); setFocusQuery(''); }}
                  className="px-4 py-2 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={() => { if (focusQuery.trim()) { onOpenQuery(focusQuery.trim()); setSynthesisModal(null); setFocusQuery(''); } }}
                  disabled={!focusQuery.trim()}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white transition-all disabled:opacity-40"
                  style={{ backgroundColor: '#0EA4A4' }}>Start Synthesis</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
