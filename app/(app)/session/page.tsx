import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SessionFlow } from '@/components/session/SessionFlow';
import type { AddictionType } from '@/types';

// This page is cached by the service worker — keep it lightweight
export default async function SessionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch triggers and active modules in parallel
  const [triggersResult, modulesResult] = await Promise.all([
    supabase
      .from('triggers')
      .select('trigger_type')
      .eq('user_id', user.id),
    supabase
      .from('modules')
      .select('addiction_type')
      .eq('user_id', user.id)
      .eq('active', true),
  ]);

  const userTriggers = (triggersResult.data ?? []).map((t) => t.trigger_type);
  const activeModules = (modulesResult.data ?? []).map(
    (m) => m.addiction_type as AddictionType
  );

  // Fallback if something went wrong
  if (activeModules.length === 0) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-bg px-4 pt-6 pb-12">
      <div className="max-w-lg mx-auto">
        {/* Welcome line — always visible immediately, no spinner */}
        <div className="mb-8">
          <p className="text-text-muted text-sm mb-1">Craving intervention</p>
          <h1 className="text-2xl font-bold text-text-primary leading-snug">
            You&apos;ve got this.{' '}
            <span className="text-text-secondary font-normal">
              Answer 3 quick questions.
            </span>
          </h1>
        </div>

        <SessionFlow
          modules={activeModules}
          userTriggers={userTriggers}
        />
      </div>
    </main>
  );
}
