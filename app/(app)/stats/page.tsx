import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/stats/StatCard';
import { HourHeatmap } from '@/components/stats/HourHeatmap';
import { WeeklyTrend } from '@/components/stats/WeeklyTrend';
import { MoneySaved } from '@/components/stats/MoneySaved';
import { getWeekStart } from '@/lib/utils';
import type { AddictionType, Streak } from '@/types';
import { MODULE_DISPLAY } from '@/types';

export default async function StatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const now = new Date();
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const [sessionsResult, streaksResult, modulesResult] = await Promise.all([
    supabase
      .from('craving_sessions')
      .select('addiction_type, resisted, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('streaks').select('*').eq('user_id', user.id),
    supabase
      .from('modules')
      .select('addiction_type')
      .eq('user_id', user.id)
      .eq('active', true),
  ]);

  const sessions = sessionsResult.data ?? [];
  const streaks = (streaksResult.data ?? []) as Streak[];
  const activeModules = (modulesResult.data ?? []).map(
    (m) => m.addiction_type as AddictionType
  );

  // ── All-time totals ───────────────────────────────────────────────────────
  const totalSessions = sessions.length;
  const totalResisted = sessions.filter((s) => s.resisted === true).length;

  const resistedByType: Record<AddictionType, number> = {
    vaping: sessions.filter((s) => s.addiction_type === 'vaping' && s.resisted === true).length,
    junkfood: sessions.filter((s) => s.addiction_type === 'junkfood' && s.resisted === true).length,
  };

  // ── Heatmap: cravings by hour of day ────────────────────────────────────
  const hourCounts = Array(24).fill(0) as number[];
  for (const s of sessions) {
    const hour = new Date(s.created_at).getHours();
    hourCounts[hour]++;
  }

  // ── Weekly trend: last 8 weeks ───────────────────────────────────────────
  const weekMap = new Map<string, { total: number; resisted: number; weekStart: Date }>();

  for (let i = 7; i >= 0; i--) {
    const ws = getWeekStart(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    const key = ws.toISOString().split('T')[0];
    if (!weekMap.has(key)) {
      weekMap.set(key, { total: 0, resisted: 0, weekStart: ws });
    }
  }

  for (const s of sessions) {
    const d = new Date(s.created_at);
    if (d < eightWeeksAgo) continue;
    const ws = getWeekStart(d);
    const key = ws.toISOString().split('T')[0];
    const entry = weekMap.get(key);
    if (entry) {
      entry.total++;
      if (s.resisted === true) entry.resisted++;
    }
  }

  const weeklyData = Array.from(weekMap.values()).map(({ weekStart, total, resisted }) => ({
    label: weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    total,
    resisted,
  }));

  // ── Resistance rate ───────────────────────────────────────────────────────
  const resistRate =
    totalSessions > 0 ? Math.round((totalResisted / totalSessions) * 100) : 0;

  return (
    <main className="page-container pt-6">
      <h1 className="text-2xl font-bold text-text-primary mb-1">Your stats</h1>
      <p className="text-text-secondary text-sm mb-6">All time progress</p>

      {/* Top stat grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          label="Cravings resisted"
          value={totalResisted}
          sub="all time"
          accent
        />
        <StatCard
          label="Resistance rate"
          value={`${resistRate}%`}
          sub={`${totalSessions} total cravings`}
        />
      </div>

      {/* Per-module streaks */}
      {activeModules.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {activeModules.map((type) => {
            const streak = streaks.find((s) => s.addiction_type === type);
            return (
              <div key={type} className="card">
                <p className="text-lg leading-none mb-2">{MODULE_DISPLAY[type].icon}</p>
                <p className="text-xs text-text-muted mb-1">{MODULE_DISPLAY[type].label}</p>
                <p className="text-2xl font-bold text-text-primary leading-none">
                  {streak?.current_streak ?? 0}
                  <span className="text-sm font-normal text-text-muted ml-1">day streak</span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Best: {streak?.longest_streak ?? 0} days
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Money saved */}
      <div className="mb-4">
        <MoneySaved resistedByType={resistedByType} />
      </div>

      {/* Hour heatmap */}
      <div className="mb-4">
        <HourHeatmap hourCounts={hourCounts} />
      </div>

      {/* 8-week trend */}
      <div className="mb-4">
        <WeeklyTrend weeks={weeklyData} />
      </div>

      {totalSessions === 0 && (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-text-secondary font-medium">No sessions yet</p>
          <p className="text-text-muted text-sm mt-1">
            Your stats will appear here after your first craving session.
          </p>
        </div>
      )}
    </main>
  );
}
