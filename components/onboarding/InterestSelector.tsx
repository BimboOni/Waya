'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { InterestCard } from './InterestCard';
import { Button } from '@/components/ui/Button';
import { useWayaStore } from '@/store/useWayaStore';
import { HOBBIES } from '@/lib/constants';

const MIN_SELECTED = 2;
const MAX_SELECTED = 3;

export function InterestSelector() {
  const router = useRouter();
  const { setToastMessage } = useWayaStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= MAX_SELECTED) {
        setToastMessage(`Pick up to ${MAX_SELECTED} interests.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (selected.length < MIN_SELECTED) {
      setToastMessage(`Please select at least ${MIN_SELECTED} interests.`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selected }),
      });

      if (!res.ok) throw new Error('Failed to save interests');
      router.push('/study');
    } catch {
      setToastMessage('Waya is currently gathering its thoughts. Please try your request again in a moment.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-display-sm text-text-primary font-heading mb-2">
          What do you love?
        </h1>
        <p className="text-body-md text-text-secondary font-body">
          Pick your interests <span className="text-text-muted">(min {MIN_SELECTED}, max {MAX_SELECTED})</span>
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {HOBBIES.map((hobby) => (
          <motion.div
            key={hobby.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
            }}
          >
            <InterestCard
              id={hobby.id}
              label={hobby.label}
              isSelected={selected.includes(hobby.id)}
              onToggle={handleToggle}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-label-md text-text-muted font-body">
          {selected.length}/{MAX_SELECTED} selected
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          isLoading={isSaving}
          disabled={selected.length < MIN_SELECTED}
          className="w-full sm:w-auto"
        >
          Start Learning →
        </Button>
      </div>
    </div>
  );
}
