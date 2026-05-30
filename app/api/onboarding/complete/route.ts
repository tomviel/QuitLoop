import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sanitizePhone, isValidTimezone, isValidTime } from '@/lib/sanitize';
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

  // Sanitize inputs
  const cleanPhone = phone ? sanitizePhone(phone) : '';
  const cleanTimezone = isValidTimezone(timezone) ? timezone : 'UTC';
  const cleanCravingStart = isValidTime(cravingStart) ? cravingStart : '20:00';
  const cleanCravingEnd = isValidTime(cravingEnd) ? cravingEnd : '22:00';

  // 1. Upsert user profile — insert if the row doesn't exist yet (e.g. the
  //    handle_new_user trigger hadn't fired), otherwise update in place.
  //    This guarantees the FK constraint on modules.user_id is satisfied.
  const profileUpsert: { id: string; email: string; timezone: string; phone?: string } = {
    id: user.id,
    email: user.email!,
    timezone: cleanTimezone,
  };
  if (cleanPhone) profileUpsert.phone = cleanPhone;

  const { error: userError } = await supabase
    .from('users')
    .upsert(profileUpsert, { onConflict: 'id' });

  if (userError) {
    console.error('[onboarding] user upsert error:', userError);
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
        craving_start: cleanCravingStart,
        craving_end: cleanCravingEnd,
        timezone: cleanTimezone,
        active: true,
      },
      { onConflict: 'user_id' }
    );

    if (smsError) {
      console.error('[onboarding] sms_schedules error:', smsError);
      // Non-fatal — continue
    }
  }

  // 5. Create or update subscription with 7-day trial.
  // Uses admin (service role) client to bypass RLS — subscriptions table has no INSERT policy
  // intentionally, since Stripe webhook owns all post-onboarding updates.
  // Explicit SELECT → INSERT/UPDATE avoids relying on onConflict, which requires a UNIQUE
  // CONSTRAINT (not just a unique index) in PostgREST.
  const adminSupabase = await createAdminClient();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const subscriptionPayload = {
    plan,
    billing_cycle: billingCycle,
    status: 'trialing' as const,
    trial_ends_at: trialEnd.toISOString(),
  };

  const { data: existingSub } = await adminSupabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { error: subError } = existingSub
    ? await adminSupabase
        .from('subscriptions')
        .update(subscriptionPayload)
        .eq('user_id', user.id)
    : await adminSupabase
        .from('subscriptions')
        .insert({ user_id: user.id, ...subscriptionPayload });

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
