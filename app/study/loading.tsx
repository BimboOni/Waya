import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function StudyLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
