'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { BillingCycle, PlanId } from '@/types';
import { PLAN_DISPLAY } from '@/lib/stripe';

const PLANS: { id: PlanId; recommended?: boolean }[] = [
  { id: 'starter' },
  { id: 'pro', recommended: true },
  { id: 'unlimited' },
];

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <section className="py-16 px-4" id="pricing">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Simple pricing
          </h2>
          <p className="text-text-secondary mb-6">
            Start free for 7 days. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-bg-surface border border-border rounded-xl p-1">
            {(['monthly', 'yearly'] as BillingCycle[]).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                  cycle === c
                    ? 'bg-bg text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {c === 'monthly' ? 'Monthly' : 'Yearly'}
                {c === 'yearly' && (
                  <span className="ml-1.5 text-xs text-success font-bold">−30%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PLANS.map(({ id, recommended }) => {
            const display = PLAN_DISPLAY[id];
            const price =
              cycle === 'monthly'
                ? display.monthly
                : Math.round(display.yearly / 12);
            const yearlyTotal = display.yearly;

            return (
              <div
                key={id}
                className={`rounded-2xl border p-6 flex flex-col ${
                  recommended
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-bg-surface'
                }`}
              >
                {recommended && (
                  <div className="text-xs font-bold text-primary bg-primary/15 rounded-full
                                  px-2.5 py-1 w-fit mb-3">
                    Recommended
                  </div>
                )}

                <h3 className="font-bold text-text-primary text-lg mb-1">{display.name}</h3>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-text-primary">€{price}</span>
                  <span className="text-text-muted text-sm">/mo</span>
                  {cycle === 'yearly' && (
                    <p className="text-text-muted text-xs mt-0.5">€{yearlyTotal} billed yearly</p>
                  )}
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {display.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`w-full text-center py-3 rounded-xl text-sm font-semibold
                              transition-all active:scale-[0.98] min-h-[44px] flex items-center justify-center ${
                    recommended
                      ? 'bg-primary hover:bg-primary-hover text-white'
                      : 'border border-border hover:border-text-muted text-text-primary'
                  }`}
                >
                  Start free trial
                </Link>
                <p className="text-text-muted text-xs text-center mt-2">
                  7 days free · No credit card
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
