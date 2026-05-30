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

  // Block access for canceled or past-due subscriptions
  if (subscription.status === 'canceled') {
    redirect('/pricing?reason=canceled');
  }
  if (subscription.status === 'past_due') {
    redirect('/pricing?reason=past_due');
  }

  // Block access when trial has expired
  const trialExpired =
    subscription.status === 'trialing' &&
    subscription.trial_ends_at != null &&
    new Date(subscription.trial_ends_at) < new Date();

  if (trialExpired) {
    redirect('/pricing?reason=trial_expired');
  }

  return (
    <div className="min-h-screen bg-bg">
      {children}
      <BottomNav plan={subscription.plan} />
    </div>
  );
}
