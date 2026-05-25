'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'input',
          error && 'border-red-500/60 focus:ring-red-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      {hint && !error && <p className="text-text-muted text-xs mt-1.5">{hint}</p>}
    </div>
  );
}
