'use client';

import { forwardRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';
import type { ButtonVariant, ButtonSize } from '@/types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-brand-on-primary border-b-[5px] border-brand-hover transition-all duration-150 hover:brightness-110 active:border-b-0 active:shadow-none active:translate-y-[3px] active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand-primary',
  secondary:
    'bg-bg-card text-text-primary border-2 border-border-default border-b-[5px] transition-all duration-100 hover:bg-bg-secondary/60 active:translate-y-0.5 active:border-b-2 active:translate-y-[2px] active:border-b-[1px] transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand-primary',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-5 py-2 text-label-md rounded-full',
  md: 'min-h-[48px] px-8 py-3 text-label-lg rounded-full',
  lg: 'min-h-[52px] px-10 py-3 text-body-lg rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-body font-bold',
          'transition-all duration-100',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:border-b-[5px] disabled:translate-y-0',
          'focus-visible:outline-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="opacity-70">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
