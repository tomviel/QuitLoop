import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BottomNav } from '@/components/BottomNav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check onboarding
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, trial_ends_at')
    .eq('user_id', user.id)
    .single();

  if (!subscription) {
    redirect('/onboarding');
  }

  // Trial expired and no active subscription
  const trialExpired =
    subscription.status === 'trialing' &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date();

  if (trialExpired && subscription.status !== 'active') {
    redirect('/pricing?reason=trial_expired');
  }

  return (
    <div className="min-h-screen bg-bg">
      {children}
      <BottomNav plan={subscription.plan} />
    </div>
  );
}
