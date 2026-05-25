'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PLAN_DISPLAY } from '@/lib/stripe';
import type { PlanId, BillingCycle } from '@/types';

function PricingContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSubscribe(plan: PlanId) {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-lg mx-auto">
        {reason === 'trial_expired' && (
          <div className="card border-warning/30 bg-warning/5 mb-6 text-center">
            <p className="text-warning font-semibold">Your free trial has ended</p>
            <p className="text-text-secondary text-sm mt-1">
              Choose a plan to keep your streaks and progress.
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Choose your plan
        </h1>
        <p className="text-text-secondary text-sm mb-6">
          Cancel anytime. No hidden fees.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center bg-bg-surface border border-border rounded-xl p-1 mb-6 w-fit">
          {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                billingCycle === cycle
                  ? 'bg-bg text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
              {cycle === 'yearly' && (
                <span className="ml-1.5 text-xs text-success font-semibold">−30%</span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {(['starter', 'pro', 'unlimited'] as PlanId[]).map((plan) => {
            const display = PLAN_DISPLAY[plan];
            const price =
              billingCycle === 'monthly'
                ? display.monthly
                : Math.round(display.yearly / 12);

            return (
              <div
                key={plan}
                className={`card ${plan === 'pro' ? 'border-primary/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{display.name}</span>
                      {plan === 'pro' && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-text-primary">€{price}</span>
                      <span className="text-text-secondary text-sm">/mo</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {display.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="text-success text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan)}
                  loading={loadingPlan === plan}
                  variant={plan === 'pro' ? 'primary' : 'outline'}
                  className="w-full"
                >
                  Subscribe to {display.name}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <PricingContent />
    </Suspense>
  );
}
