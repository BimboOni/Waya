'use client';

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  maxLength?: number;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  id?: string;
  type?: 'text' | 'email' | 'password';
  autoComplete?: string;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder,
      error,
      maxLength,
      disabled,
      multiline = false,
      rows = 4,
      className,
      id: externalId,
      type = 'text',
      autoComplete,
      autoFocus,
      onKeyDown,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseClasses = cn(
      'w-full h-14 px-5 rounded-xl border-2 bg-bg-card text-text-primary font-body text-base',
      'placeholder:text-text-muted',
      'outline-none focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
      'transition-all duration-[400ms] ease-in-out',
      error
        ? 'border-error focus:border-error focus:ring-error/20'
        : 'border-border-default',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      isPassword && 'pr-12',
      className,
    );

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-label-lg text-text-secondary font-body">
            {label}
          </label>
        )}
        {multiline ? (
          <textarea
            id={id}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement> | undefined}
            onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement> | undefined}
            onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement> | undefined}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
            className={cn(baseClasses, 'resize-none h-auto py-3')}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        ) : (
          <div className="relative">
            <input
              id={id}
              ref={ref as React.Ref<HTMLInputElement>}
              type={resolvedType}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLInputElement> | undefined}
              onFocus={onFocus as React.FocusEventHandler<HTMLInputElement> | undefined}
              onBlur={onBlur as React.FocusEventHandler<HTMLInputElement> | undefined}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              className={baseClasses}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
          </div>
        )}
        {error && (
          <p id={`${id}-error`} className="text-xs text-error font-body" role="alert">
            {error}
          </p>
        )}
        {maxLength && value.length > maxLength * 0.8 && (
          <p className="text-label-sm text-text-muted text-right">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
