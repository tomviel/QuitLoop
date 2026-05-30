import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ModuleSettings } from '@/components/settings/ModuleSettings';
import { SMSSettings } from '@/components/settings/SMSSettings';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { PlanSettings } from '@/components/settings/PlanSettings';
import type { AddictionType, PlanId } from '@/types';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [modulesResult, smsResult, profileResult, subscriptionResult] =
    await Promise.all([
      supabase
        .from('modules')
        .select('addiction_type, active')
        .eq('user_id', user.id),
      supabase
        .from('sms_schedules')
        .select('craving_start, craving_end, active, timezone')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('users')
        .select('phone, email')
        .eq('id', user.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('plan, status, trial_ends_at, stripe_customer_id')
        .eq('user_id', user.id)
        .single(),
    ]);

  const activeModules = (modulesResult.data ?? [])
    .filter((m) => m.active)
    .map((m) => m.addiction_type as AddictionType);

  const sms = smsResult.data;
  const profile = profileResult.data;
  const subscription = subscriptionResult.data;

  async function handleSignOut() {
    'use server';
    const supabaseServer = await createClient();
    await supabaseServer.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="page-container pt-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Modules */}
        <ModuleSettings
          activeModules={activeModules}
          plan={subscription?.plan ?? 'solo'}
        />

        {/* SMS schedule */}
        {sms ? (
          <SMSSettings
            cravingStart={sms.craving_start}
            cravingEnd={sms.craving_end}
            active={sms.active}
            timezone={sms.timezone}
          />
        ) : (
          <div className="card">
            <p className="text-text-muted text-sm">No SMS schedule configured.</p>
            <p className="text-text-muted text-xs mt-1">
              Complete onboarding to set up craving alerts.
            </p>
          </div>
        )}

        {/* Profile */}
        <ProfileSettings
          phone={profile?.phone ?? null}
          email={profile?.email ?? user.email ?? ''}
        />

        {/* Subscription */}
        {subscription && (
          <PlanSettings
            plan={subscription.plan as PlanId}
            status={subscription.status}
            trialEndsAt={subscription.trial_ends_at}
            hasStripeCustomer={Boolean(subscription.stripe_customer_id)}
          />
        )}

        {/* Sign out */}
        <div className="pt-2">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full text-text-muted hover:text-text-secondary text-sm
                         min-h-[44px] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
