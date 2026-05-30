import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { TopBar } from '@/components/dashboard/TopBar';
import { CravingButton } from '@/components/dashboard/CravingButton';
import { DashboardModuleCard } from '@/components/dashboard/DashboardModuleCard';
import { MasteryCard } from '@/components/dashboard/MasteryCard';
import { WeeklyGraph } from '@/components/dashboard/WeeklyGraph';
import { OnboardedBanner } from '@/components/dashboard/OnboardedBanner';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import { getWeekStart, dayIndex, DAY_LABELS } from '@/lib/utils';
import type { AddictionType, Module, Streak } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const now = new Date();
  const weekStart = getWeekStart(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  // Fetch all dashboard data in parallel
  const [modulesResult, streaksResult, subscriptionResult, thisWeekResult, lastWeekResult, masteryResult] =
    await Promise.all([
      supabase.from('modules').select('*').eq('user_id', user.id).eq('active', true),
      supabase.from('streaks').select('*').eq('user_id', user.id),
      supabase
        .from('subscriptions')
        .select('plan, status, trial_ends_at')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('craving_sessions')
        .select('addiction_type, resisted, created_at')
        .eq('user_id', user.id)
        .gte('created_at', weekStart.toISOString()),
      supabase
        .from('craving_sessions')
        .select('addiction_type, resisted, created_at')
        .eq('user_id', user.id)
        .gte('created_at', lastWeekStart.toISOString())
        .lt('created_at', weekStart.toISOString()),
      supabase
        .from('mastery_scores')
        .select('total_score, weekly_score')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

  const modules = (modulesResult.data ?? []) as Module[];
  const streaks = (streaksResult.data ?? []) as Streak[];
  const subscription = subscriptionResult.data;
  const thisWeekSessions = thisWeekResult.data ?? [];
  const lastWeekSessions = lastWeekResult.data ?? [];
  const mastery = masteryResult.data;

  // Total current streak = sum across all active modules
  const totalCurrentStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0);

  // Build weekly graph data (7 days, Mon–Sun)
  const thisWeekByDay = Array(7).fill(0);
  const lastWeekByDay = Array(7).fill(0);

  for (const s of thisWeekSessions) {
    thisWeekByDay[dayIndex(new Date(s.created_at))]++;
  }
  for (const s of lastWeekSessions) {
    lastWeekByDay[dayIndex(new Date(s.created_at))]++;
  }

  const graphData = DAY_LABELS.map((day, i) => ({
    day,
    thisWeek: thisWeekByDay[i],
    lastWeek: lastWeekByDay[i],
  }));

  // Per-module stats
  const moduleStats = modules.map((mod) => {
    const streak = streaks.find((s) => s.addiction_type === mod.addiction_type);
    const weekSessions = thisWeekSessions.filter(
      (s) => s.addiction_type === mod.addiction_type
    );
    const weekResisted = weekSessions.filter((s) => s.resisted === true).length;

    return {
      module: mod,
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      weekResisted,
      weekTotal: weekSessions.length,
    };
  });

  // Trial expiry banner
  const trialEndsAt = subscription?.trial_ends_at;
  const daysLeft = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <main className="pb-24 bg-bg min-h-screen">
      <TopBar currentStreak={totalCurrentStreak} />

      {/* Trial ending soon banner */}
      {subscription?.status === 'trialing' && daysLeft !== null && daysLeft <= 1 && (
        <TrialBanner trialEndsAt={trialEndsAt!} daysLeft={daysLeft} />
      )}

      {/* PWA install / welcome banner — reads ?onboarded=true from URL client-side */}
      <Suspense fallback={null}>
        <OnboardedBanner />
      </Suspense>

      {/* Big craving button */}
      <section className="px-4">
        <CravingButton />
      </section>

      {/* Module cards */}
      {moduleStats.length > 0 ? (
        <section className="px-4 space-y-3 mb-4">
          {moduleStats.map(({ module, currentStreak, longestStreak, weekResisted, weekTotal }) => (
            <DashboardModuleCard
              key={module.id}
              type={module.addiction_type as AddictionType}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              weekResisted={weekResisted}
              weekTotal={weekTotal}
            />
          ))}
        </section>
      ) : (
        <section className="px-4 mb-4">
          <div className="card text-center py-8">
            <p className="text-text-muted text-sm">No active modules.</p>
            <a href="/settings" className="text-primary text-sm mt-2 inline-block">
              Add a module →
            </a>
          </div>
        </section>
      )}

      {/* Mastery score */}
      <section className="px-4 mb-4">
        <MasteryCard
          totalScore={mastery?.total_score ?? 0}
          weeklyScore={mastery?.weekly_score ?? 0}
        />
      </section>

      {/* Weekly graph */}
      <section className="px-4">
        <WeeklyGraph
          data={graphData}
          totalThisWeek={thisWeekSessions.length}
          totalLastWeek={lastWeekSessions.length}
        />
      </section>
    </main>
  );
}
