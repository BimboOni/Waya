export function cleanMarkdown(text: string): string {
  return text
    .replace(/---/g, '\u2014')
    .replace(/--/g, '\u2013')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
