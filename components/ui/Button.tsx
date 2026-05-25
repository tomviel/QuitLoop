'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg select-none';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary/50',
    ghost: 'bg-transparent hover:bg-bg-hover text-text-secondary hover:text-text-primary focus:ring-border',
    danger: 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 focus:ring-red-500/30',
    outline: 'bg-transparent border border-border hover:border-text-secondary text-text-primary focus:ring-border',
  };

  const sizes = {
    sm: 'text-sm px-4 py-2 min-h-[36px]',
    md: 'text-sm px-5 py-3 min-h-[44px]',
    lg: 'text-base px-6 py-4 min-h-[56px]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
