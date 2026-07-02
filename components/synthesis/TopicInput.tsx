'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MAX_TOPIC_LENGTH } from '@/lib/constants';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export function TopicInput({ onSubmit, isLoading }: TopicInputProps) {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = topic.trim();
    if (trimmed.length < 3) {
      setError('Please enter a topic (at least 3 characters).');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          value={topic}
          onChange={(v) => { setTopic(v); if (error) setError(null); }}
          label="What do you want to learn about?"
          placeholder="e.g. Photosynthesis, The French Revolution, Prime Numbers…"
          maxLength={MAX_TOPIC_LENGTH}
          disabled={isLoading}
          error={error}
          onKeyDown={handleKey}
        />
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={handleSubmit}
        isLoading={isLoading}
        disabled={!topic.trim()}
        className="self-start gap-2 rounded-full"
      >
        <Sparkles size={16} aria-hidden="true" />
        Ask Waya
      </Button>
    </div>
  );
}
