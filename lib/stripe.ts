import Stripe from 'stripe';
import type { PlanId, BillingCycle } from '@/types';

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

export { type PlanId, type BillingCycle };

export const PLAN_PRICES: Record<PlanId, Record<BillingCycle, string>> = {
  solo: {
    monthly: process.env.STRIPE_PRICE_SOLO_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_SOLO_YEARLY!,
  },
  community: {
    monthly: process.env.STRIPE_PRICE_COMMUNITY_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_COMMUNITY_YEARLY!,
  },
  elite: {
    monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_ELITE_YEARLY!,
  },
};

export const PLAN_DISPLAY: Record<
  PlanId,
  { name: string; monthly: number; yearly: number; features: string[] }
> = {
  solo: {
    name: 'Solo',
    monthly: 9,
    yearly: 79,
    features: [
      '1 addiction module',
      'AI craving intervention',
      'Streak tracker',
      'Mastery score',
    ],
  },
  community: {
    name: 'Community',
    monthly: 19,
    yearly: 159,
    features: [
      '2 addiction modules',
      'AI craving intervention',
      'Proactive SMS alerts',
      'Community win feed',
      'Weekly leaderboard',
      'Mastery score',
    ],
  },
  elite: {
    name: 'Elite',
    monthly: 49,
    yearly: 490,
    features: [
      'Everything in Community',
      'Infinite progression challenges',
      'Accountability partner',
      'Elder status (90-day streaks)',
      'Priority support',
    ],
  },
};
