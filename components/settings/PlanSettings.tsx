'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLAN_DISPLAY } from '@/lib/stripe';
import type { PlanId } from '@/types';

interface PlanSettingsProps {
  plan: PlanId;
  status: string;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
}

export function PlanSettings({
  plan,
  status,
  trialEndsAt,
  hasStripeCustomer,
}: PlanSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const display = PLAN_DISPLAY[plan];
  const isTrial = status === 'trialing';

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  async function openPortal() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Could not open billing portal.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary mb-3">Subscription</h2>
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-text-primary">{display.name} plan</p>
            {isTrial && trialDaysLeft !== null && (
              <p className="text-warning text-xs mt-0.5">
                Free trial — {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left
              </p>
            )}
            {status === 'active' && (
              <p className="text-success text-xs mt-0.5">Active</p>
            )}
            {status === 'canceled' && (
              <p className="text-text-muted text-xs mt-0.5">Canceled</p>
            )}
          </div>
          <span className="text-text-muted text-sm">
            €{display.monthly}/mo
          </span>
        </div>

        <ul className="space-y-1">
          {display.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="text-success text-xs">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          {(isTrial || status === 'canceled') && (
            <Link
              href="/pricing"
              className="btn-primary w-full flex items-center justify-center min-h-[44px] rounded-xl text-sm font-semibold"
            >
              {isTrial ? 'Subscribe now' : 'Resubscribe'}
            </Link>
          )}

          {plan !== 'elite' && status === 'active' && (
            <Link
              href="/pricing"
              className="w-full flex items-center justify-center min-h-[44px] rounded-xl
                         border border-border text-text-secondary text-sm font-medium
                         hover:border-text-muted transition-colors"
            >
              Upgrade plan
            </Link>
          )}

          {hasStripeCustomer && status === 'active' && (
            <button
              onClick={openPortal}
              disabled={loading}
              className="w-full flex items-center justify-center min-h-[44px] rounded-xl
                         text-text-muted text-sm hover:text-text-secondary
                         transition-colors disabled:opacity-50"
            >
              {loading ? 'Opening…' : 'Manage billing / cancel'}
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    </div>
  );
}
