import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  elevated?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
}

export function Card({
  children,
  className,
  onClick,
  hover = false,
  elevated = false,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'bg-bg-card rounded-xl',
        elevated ? 'border-0' : 'border border-border-default',
        'transition-all duration-default ease-waya',
        hover && 'hover:-translate-y-0.5 cursor-pointer',
        hover && !elevated && 'hover:border-brand-primary',
        onClick && !hover && 'cursor-pointer hover:border-border-strong',
        className,
      )}
      style={
        elevated
          ? { boxShadow: '0 2px 12px rgba(14,15,24,0.08), 0 0 0 1px rgba(195,197,229,0.55)' }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
