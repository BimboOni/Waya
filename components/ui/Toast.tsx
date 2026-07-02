'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useWayaStore } from '@/store/useWayaStore';
import { TOAST_DURATION_MS } from '@/lib/constants';

export function Toast() {
  const { toastMessage, setToastMessage } = useWayaStore();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastMessage, setToastMessage]);

  const isXP = toastMessage?.startsWith('+') && toastMessage.includes('XP');
  const isError = toastMessage?.toLowerCase().includes('error') || toastMessage?.includes('gathering');

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-bg-card border border-border-default"
            role="status"
            aria-live="polite"
          >
            {isXP && <Zap size={16} className="text-xp shrink-0" />}
            {isError && <AlertCircle size={16} className="text-error shrink-0" />}
            {!isXP && !isError && <CheckCircle size={16} className="text-success shrink-0" />}
            <span className="text-label-md text-text-inverse whitespace-nowrap max-w-[320px] truncate font-medium">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
