import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export type PlanId = 'starter' | 'pro' | 'unlimited';
export type BillingCycle = 'monthly' | 'yearly';

export const PLAN_PRICES: Record<PlanId, Record<BillingCycle, string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY!,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  },
  unlimited: {
    monthly: process.env.STRIPE_PRICE_UNLIMITED_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_UNLIMITED_YEARLY!,
  },
};

export const PLAN_DISPLAY: Record<
  PlanId,
  { name: string; monthly: number; yearly: number; features: string[] }
> = {
  starter: {
    name: 'Starter',
    monthly: 9,
    yearly: 79,
    features: ['1 addiction module', 'Craving intervention', 'Streak tracker'],
  },
  pro: {
    name: 'Pro',
    monthly: 14,
    yearly: 119,
    features: [
      '2 addiction modules',
      'Craving intervention',
      'Proactive SMS alerts',
      'Weekly stats',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    monthly: 19,
    yearly: 159,
    features: [
      'Everything in Pro',
      'Community access',
      'Priority support',
    ],
  },
};
