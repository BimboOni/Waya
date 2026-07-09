'use client';

import { useState } from 'react';
import { IconCopy } from '@tabler/icons-react';

interface ChatMessageProps {
  topic: string;
  subject: string;
  subjectLabel: string;
}

export function ChatMessage({ topic, subject, subjectLabel }: ChatMessageProps) {
  const [tooltipFeedback, setTooltipFeedback] = useState<Record<string, string>>({});

  const handleCopy = async (label: string) => {
    try {
      await navigator.clipboard.writeText(topic);
      setTooltipFeedback((prev) => ({ ...prev, [label]: 'Copied!' }));
      setTimeout(() => setTooltipFeedback((prev) => ({ ...prev, [label]: '' })), 2000);
    } catch { /* silent */ }
  };

  function getTopicEmoji(t: string, s: string): string {
    const lower = t.toLowerCase();
    if (/\b(music|song|guitar|piano|rap|melody|rhythm|dj|beat|instrument)\b/i.test(lower)) return '\uD83C\uDFB5';
    if (/\b(painting|drawing|sculpture|canvas|gallery|art|illustration)\b/i.test(lower)) return '\uD83C\uDFA8';
    if (/\b(timeline|empire|war|revolution|century|ancient|medieval|dynasty|kingdom)\b/i.test(lower)) return '\uD83D\uDCDC';
    if (/\b(sport|game|player|score|tournament|championship|athlete|goal)\b/i.test(lower)) return '\uD83C\uDFC0';
    if (/\b(code|programming|algorithm|data|computer|software|app|digital)\b/i.test(lower)) return '\uD83D\uDCBB';
    if (/\b(planet|star|space|gravity|atom|cell|dna|physics|chemistry|biology)\b/i.test(lower)) return '\uD83D\uDD2C';
    if (/\b(math|algebra|calculus|geometry|equation|number|graph)\b/i.test(lower)) return '\uD83D\uDCD0';
    const m: Record<string, string> = { Mathematics: '\uD83D\uDCD0', ScienceTech: '\uD83D\uDD2C', HistoryCulture: '\uD83D\uDCDC', CreativeArts: '\uD83C\uDFA8' };
    return m[s] || '\uD83D\uDCDA';
  }

  return (
    <div className="flex justify-end">
      <div>
        <div className="w-fit max-w-[92%] ml-auto bg-slate-100 dark:bg-[#2A2A2A] rounded-2xl rounded-br-md p-4 flex flex-col gap-1.5">
          {subjectLabel && (
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>{subjectLabel}</span>
          )}
          <p className="text-body-lg text-text-primary max-w-prose">{getTopicEmoji(topic, subject)} {topic}</p>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2 text-text-muted">
          <div className="relative group">
            <button onClick={() => handleCopy('copy-topic')} className="p-1.5 rounded-lg hover:bg-bg-secondary transition-colors" title="Copy text">
              <IconCopy size={16} />
            </button>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {tooltipFeedback['copy-topic'] || 'Copy text'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
