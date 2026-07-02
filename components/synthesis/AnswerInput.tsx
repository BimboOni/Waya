'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MAX_ANSWER_LENGTH } from '@/lib/constants';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export function AnswerInput({ onSubmit, isLoading }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = answer.trim();
    if (trimmed.length < 3) {
      setError('Answer must be at least 3 characters.');
      return;
    }
    setError(null);
    onSubmit(trimmed);
    setAnswer('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-4"
    >
      <Input
        value={answer}
        onChange={(v) => { setAnswer(v); if (error) setError(null); }}
        label="Your synthesis answer"
        placeholder="Connect the concept to a completely different subject or your personal hobby…"
        multiline
        rows={3}
        maxLength={MAX_ANSWER_LENGTH}
        disabled={isLoading}
        error={error}
      />
      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        isLoading={isLoading}
        disabled={!answer.trim()}
        className="self-start gap-2 rounded-full"
      >
        <Send size={15} aria-hidden="true" />
        Submit Answer
      </Button>
    </motion.div>
  );
}
