'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface ProfileErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ProfileErrorProps) {
  useEffect(() => {
    console.error('[PROFILE_ROUTE_ERROR]:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 rounded-xl bg-error-container flex items-center justify-center text-2xl mb-4" aria-hidden="true">⚠️</div>
      <h2 className="text-headline-md text-text-primary font-heading mb-2">Profile unavailable</h2>
      <p className="text-body-md text-text-secondary font-body mb-6 max-w-sm">
        We had trouble loading your profile. Please try again.
      </p>
      <Button variant="primary" size="md" onClick={reset}>Try again</Button>
    </div>
  );
}
