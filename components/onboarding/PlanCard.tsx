'use client';

import { cn } from '@/lib/utils';
import type { PlanId, BillingCycle } from '@/types';
import { PLAN_DISPLAY } from '@/lib/stripe';

interface PlanCardProps {
  plan: PlanId;
  billingCycle: BillingCycle;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}

export function PlanCard({
  plan,
  billingCycle,
  selected,
  recommended,
  onSelect,
}: PlanCardProps) {
  const display = PLAN_DISPLAY[plan];
  const price =
    billingCycle === 'monthly' ? display.monthly : Math.round(display.yearly / 12);
  const yearlyTotal = display.yearly;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-2xl border p-4 transition-all duration-150',
        'focus:outline-none active:scale-[0.99]',
        selected
          ? 'border-primary/60 bg-primary/10'
          : 'border-border bg-bg-surface hover:border-border/80'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">{display.name}</span>
            {recommended && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                Recommended
              </span>
            )}
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-text-primary">€{price}</span>
            <span className="text-text-secondary text-sm">/mo</span>
            {billingCycle === 'yearly' && (
              <span className="text-text-muted text-xs ml-2">
                €{yearlyTotal}/yr
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-all',
            selected ? 'border-primary bg-primary' : 'border-border'
          )}
        >
          {selected && (
            <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      <ul className="space-y-1.5">
        {display.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="text-success text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-3 text-xs text-text-muted">
        7-day free trial · No credit card
      </div>
    </button>
  );
}
