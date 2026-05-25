'use client';

import { cn } from '@/lib/utils';
import type { AddictionType } from '@/types';
import { MODULE_DISPLAY } from '@/types';

interface ModuleCardProps {
  type: AddictionType;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function ModuleCard({ type, selected, disabled, onToggle }: ModuleCardProps) {
  const display = MODULE_DISPLAY[type];

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-2xl border p-5 transition-all duration-150',
        'focus:outline-none active:scale-[0.99]',
        selected
          ? 'border-primary/60 bg-primary/10'
          : 'border-border bg-bg-surface hover:border-border/80',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl leading-none">{display.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text-primary">{display.label}</div>
          <div className="text-sm text-text-secondary mt-0.5">{display.description}</div>
        </div>
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
            selected ? 'border-primary bg-primary' : 'border-border'
          )}
        >
          {selected && (
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
