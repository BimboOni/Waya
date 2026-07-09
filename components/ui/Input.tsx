'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  autoFocus?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange, label, placeholder, error, maxLength, disabled, className, id: externalId, type = 'text', autoComplete, autoFocus, onBlur, onFocus, onKeyDown }, ref) => {
    const autoId = useId();
    const id = externalId ?? autoId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="text-label-md font-body font-medium text-text-secondary">{label}</label>}
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full min-h-[52px] px-4 rounded-xl border-2 border-border-default bg-bg-primary text-text-primary font-body text-body-lg placeholder:text-text-muted transition-all duration-default ease-waya focus:outline-none focus:border-brand-primary',
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
Input.displayName = 'Input';
