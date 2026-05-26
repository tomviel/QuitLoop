import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { PlanId, BillingCycle, AddictionType } from '@/types';

interface OnboardingPayload {
  plan: PlanId;
  billingCycle: BillingCycle;
  modules: AddictionType[];
  triggers: string[];
  phone: string;
  cravingStart: string;
  cravingEnd: string;
  smsOptIn: boolean;
  timezone: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: OnboardingPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { plan, billingCycle, modules, triggers, phone, cravingStart, cravingEnd, smsOptIn, timezone } = body;

  // Basic validation — phone only required when user opted into SMS
  if (!plan || !modules?.length || !triggers?.length || (smsOptIn && !phone?.trim())) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Update user profile (phone + timezone)
  // Only persist phone if one was provided — don't overwrite with empty string
  const profileUpdate: { timezone: string; phone?: string } = { timezone };
  if (phone?.trim()) profileUpdate.phone = phone.trim();

  const { error: userError } = await supabase
    .from('users')
    .update(profileUpdate)
    .eq('id', user.id);

  if (userError) {
    console.error('[onboarding] user update error:', userError);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }

  // 2. Create modules (upsert in case of re-onboarding)
  const moduleRows = modules.map((addiction_type) => ({
    user_id: user.id,
    addiction_type,
    active: true,
    start_date: new Date().toISOString().split('T')[0],
  }));

  const { error: modulesError } = await supabase
    .from('modules')
    .upsert(moduleRows, { onConflict: 'user_id,addiction_type' });

  if (modulesError) {
    console.error('[onboarding] modules error:', modulesError);
    return NextResponse.json({ error: 'Failed to save modules' }, { status: 500 });
  }

  // 3. Delete old triggers and insert new ones
  await supabase.from('triggers').delete().eq('user_id', user.id);

  const triggerRows = triggers.map((trigger_type) => ({
    user_id: user.id,
    trigger_type,
  }));

  const { error: triggersError } = await supabase.from('triggers').insert(triggerRows);

  if (triggersError) {
    console.error('[onboarding] triggers error:', triggersError);
    return NextResponse.json({ error: 'Failed to save triggers' }, { status: 500 });
  }

  // 4. Create/update SMS schedule if opted in
  if (smsOptIn) {
    const { error: smsError } = await supabase.from('sms_schedules').upsert(
      {
        user_id: user.id,
        craving_start: cravingStart,
        craving_end: cravingEnd,
        timezone,
        active: true,
      },
      { onConflict: 'user_id' }
    );

    if (smsError) {
      console.error('[onboarding] sms_schedules error:', smsError);
      // Non-fatal — continue
    }
  }

  // 5. Create subscription with 7-day trial
  // Uses admin (service role) client to bypass RLS — subscriptions table has no INSERT policy
  // intentionally, since Stripe webhook owns all updates post-onboarding.
  const adminSupabase = await createAdminClient();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const { error: subError } = await adminSupabase.from('subscriptions').upsert(
    {
      user_id: user.id,
      plan,
      billing_cycle: billingCycle,
      status: 'trialing',
      trial_ends_at: trialEnd.toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (subError) {
    console.error('[onboarding] subscription error:', subError);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }

  // 6. Initialize streak records for each module
  const streakRows = modules.map((addiction_type) => ({
    user_id: user.id,
    addiction_type,
    current_streak: 0,
    longest_streak: 0,
  }));

  await supabase
    .from('streaks')
    .upsert(streakRows, { onConflict: 'user_id,addiction_type' });

  return NextResponse.json({ success: true });
}
