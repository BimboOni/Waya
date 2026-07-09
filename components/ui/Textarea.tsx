'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  rows?: number;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ value, onChange, label, placeholder, error, maxLength, disabled, className, id: externalId, rows = 4, autoFocus, onKeyDown, onFocus, onBlur }, ref) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="text-label-md font-body font-medium text-text-secondary">{label}</label>}
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={rows}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn(
            'w-full min-h-[100px] px-4 py-3 rounded-xl border-2 border-border-default bg-bg-primary text-text-primary font-body text-body-lg placeholder:text-text-muted resize-none transition-all duration-default ease-waya focus:outline-none focus:border-slate-200 dark:focus:border-slate-800',
            error && 'border-error',
            disabled && 'opacity-40 cursor-not-allowed',
            className,
          )}
        />
        {error && <p className="text-label-sm font-body text-error">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
