'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface StudyErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StudyError({ error, reset }: StudyErrorProps) {
  useEffect(() => {
    console.error('[STUDY_ROUTE_ERROR]:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 rounded-xl bg-error-container flex items-center justify-center text-2xl mb-4" aria-hidden="true">⚠️</div>
      <h2 className="text-headline-md text-text-primary font-heading mb-2">Something went wrong</h2>
      <p className="text-body-md text-text-secondary font-body mb-6 max-w-sm">
        Waya encountered an unexpected issue. Your data is safe — just try again.
      </p>
      <Button variant="primary" size="md" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
