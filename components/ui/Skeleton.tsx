import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' };

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('shimmer', roundedMap[rounded], className)}
    />
  );
}

export function SessionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border-default last:border-0">
      <Skeleton className="w-10 h-10 shrink-0" rounded="md" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-14 shrink-0" rounded="full" />
    </div>
  );
}

export function BadgeCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default">
      <Skeleton className="w-16 h-16" rounded="lg" />
      <Skeleton className="h-3 w-20" rounded="sm" />
    </div>
  );
}

export function NodeSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border border-border-default bg-bg-card min-w-[140px]">
      <Skeleton className="h-5 w-16" rounded="full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
