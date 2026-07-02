'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                'w-full bg-bg-card rounded-xl border border-border-default p-6',
                'relative',
                sizeMap[size],
                className,
              )}
            >
              {title && (
                <div className="flex items-center justify-between mb-5">
                  <h2 id="modal-title" className="text-headline-md text-text-primary font-heading">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all duration-default ease-waya focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all duration-default ease-waya focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
