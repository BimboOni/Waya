import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function cleanMarkdown(text: string): string {
  return text
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function stripChallengeHeader(text: string): string {
  return text.replace(/###\s*Synthesis Challenge\s*\n?/gi, '').trim();
}

export function getTopicEmoji(topic: string, subject: string): string {
  const t = topic.toLowerCase();
  if (/\b(music|song|guitar|piano|rap|melody|rhythm|dj|beat|instrument)\b/i.test(t)) return '🎵';
  if (/\b(painting|drawing|sculpture|canvas|gallery|art|illustration)\b/i.test(t)) return '🎨';
  if (/\b(timeline|empire|war|revolution|century|ancient|medieval|dynasty|kingdom)\b/i.test(t)) return '📜';
  if (/\b(sport|game|player|score|tournament|championship|athlete|goal)\b/i.test(t)) return '🏀';
  if (/\b(code|programming|algorithm|data|computer|software|app|digital)\b/i.test(t)) return '💻';
  if (/\b(planet|star|space|gravity|atom|cell|dna|physics|chemistry|biology)\b/i.test(t)) return '🔬';
  if (/\b(math|algebra|calculus|geometry|equation|number|graph)\b/i.test(t)) return '📐';
  const subjectMap: Record<string, string> = {
    Mathematics: '📐', ScienceTech: '🔬', HistoryCulture: '📜', CreativeArts: '🎨',
  };
  return subjectMap[subject] || '📚';
}

export const markdownComponents = {
  h1: ({ children, ...props }: any) => <h1 className="mt-4 mb-2 text-lg font-bold block clear-both reset-edge text-text-primary" {...props}>{children}</h1>,
  h2: ({ children, ...props }: any) => <h2 className="mt-4 mb-2 text-lg font-bold block clear-both reset-edge text-text-primary" {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 className="mt-4 mb-2 text-lg font-bold block clear-both reset-edge text-text-primary" {...props}>{children}</h3>,
  p: ({ children, ...props }: any) => <p className="mb-4 text-base leading-relaxed text-text-secondary" {...props}>{children}</p>,
  ul: ({ children, ...props }: any) => <ul className="list-disc pl-6 space-y-2.5 mt-2 mb-4 block text-text-primary" {...props}>{children}</ul>,
  ol: ({ children, ...props }: any) => <ol className="list-decimal pl-6 space-y-2.5 mt-2 mb-4 block text-text-primary" {...props}>{children}</ol>,
  li: ({ children, ...props }: any) => <li className="py-0.5 leading-relaxed text-text-primary" {...props}>{children}</li>,
  strong: ({ children, ...props }: any) => <strong className="font-semibold text-text-primary" {...props}>{children}</strong>,
  blockquote: ({ children, ...props }: any) => <blockquote className="border-l-4 border-brand-primary/30 pl-4 italic text-text-secondary my-2" {...props}>{children}</blockquote>,
  code: ({ children, ...props }: any) => <code className="bg-bg-secondary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>,
};
