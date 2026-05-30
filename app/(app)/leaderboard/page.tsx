import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient';

interface LeaderboardEntry {
  rank: number;
  label: string;
  weeklyScore: number;
  totalScore: number;
  isMe: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
  totalParticipants: number;
  isTopTenPct: boolean;
  weekStart: string;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  if (!sub || sub.plan === 'solo') {
    redirect('/pricing?reason=leaderboard_locked');
  }

  // Fetch leaderboard data server-side
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - daysToMonday);
  weekStart.setUTCHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: rows } = await supabase
    .from('mastery_scores')
    .select('user_id, weekly_score, total_score, week_start')
    .eq('week_start', weekStartStr)
    .order('weekly_score', { ascending: false })
    .limit(100);

  const entries = rows ?? [];
  const totalParticipants = entries.length;
  const myIndex = entries.findIndex((e) => e.user_id === user.id);
  const myRank = myIndex === -1 ? null : myIndex + 1;
  const isTopTenPct =
    myRank !== null && totalParticipants > 0 ? myRank / totalParticipants <= 0.1 : false;

  const leaderboard: LeaderboardEntry[] = entries.slice(0, 25).map((entry, i) => ({
    rank: i + 1,
    label: entry.user_id === user.id ? 'You' : `Warrior #${i + 1}`,
    weeklyScore: entry.weekly_score,
    totalScore: entry.total_score,
    isMe: entry.user_id === user.id,
  }));

  const data: LeaderboardData = {
    leaderboard,
    myRank,
    totalParticipants,
    isTopTenPct,
    weekStart: weekStartStr,
  };

  return (
    <main className="pb-24 bg-bg min-h-screen">
      <div className="page-container pt-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Leaderboard</h1>
        <p className="text-text-secondary text-sm mb-6">
          Weekly mastery points · Resets every Monday
        </p>
        <LeaderboardClient data={data} />
      </div>
    </main>
  );
}
