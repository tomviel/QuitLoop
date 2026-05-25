export type PlanId = 'starter' | 'pro' | 'unlimited';
export type BillingCycle = 'monthly' | 'yearly';
export type AddictionType = 'vaping' | 'junkfood';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  timezone: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  billing_cycle: BillingCycle;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  status: SubscriptionStatus;
  created_at: string;
}

export interface Module {
  id: string;
  user_id: string;
  addiction_type: AddictionType;
  start_date: string;
  active: boolean;
  created_at: string;
}

export interface Trigger {
  id: string;
  user_id: string;
  trigger_type: string;
  created_at: string;
}

export interface CravingSession {
  id: string;
  user_id: string;
  addiction_type: AddictionType;
  location_answer: string;
  trigger_answer: string;
  nearby_answer: string;
  resisted: boolean | null;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  addiction_type: AddictionType;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  last_updated: string;
}

export interface SMSSchedule {
  id: string;
  user_id: string;
  craving_start: string;
  craving_end: string;
  timezone: string;
  active: boolean;
  created_at: string;
}

export const TRIGGER_OPTIONS = [
  'Stress',
  'Boredom',
  'Social situations',
  'After meals',
  'Evening',
  'Morning',
  'After work',
  'Loneliness',
  'Other',
] as const;

export type TriggerOption = (typeof TRIGGER_OPTIONS)[number];

export const LOCATION_OPTIONS = [
  'Home',
  'Work',
  'Outside',
  'Social event',
  'Car',
  'Other',
] as const;

export const NEARBY_OPTIONS = [
  'My phone only',
  'Food nearby',
  'Vape/cigarettes nearby',
  'Nothing dangerous',
  'Other',
] as const;

export const MODULE_DISPLAY: Record<
  AddictionType,
  { label: string; icon: string; description: string }
> = {
  vaping: {
    label: 'Vaping / Smoking',
    icon: '🚭',
    description: 'Nicotine and vaping addiction',
  },
  junkfood: {
    label: 'Junk Food / Sugar',
    icon: '🍬',
    description: 'Food and sugar cravings',
  },
};
