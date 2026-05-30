import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check plan — leaderboard requires community or elite
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  if (!sub || sub.plan === 'solo') {
    return NextResponse.json({ error: 'Upgrade to access the leaderboard' }, { status: 403 });
  }

  // Current week start (Monday)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun,1=Mon,...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - daysToMonday);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Top 100 by weekly_score for this week
  const { data: rows, error } = await supabase
    .from('mastery_scores')
    .select('user_id, weekly_score, total_score, week_start')
    .eq('week_start', weekStart.toISOString().split('T')[0])
    .order('weekly_score', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[leaderboard] error:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }

  const entries = rows ?? [];
  const totalParticipants = entries.length;

  // Find current user's position
  const myIndex = entries.findIndex((e) => e.user_id === user.id);
  const myRank = myIndex === -1 ? null : myIndex + 1;
  const isTopTenPct =
    myRank !== null && totalParticipants > 0
      ? myRank / totalParticipants <= 0.1
      : false;

  // Anonymize: replace user_ids with "User #N", highlight current user
  const leaderboard = entries.slice(0, 25).map((entry, i) => ({
    rank: i + 1,
    label: entry.user_id === user.id ? 'You' : `User #${i + 1}`,
    weeklyScore: entry.weekly_score,
    totalScore: entry.total_score,
    isMe: entry.user_id === user.id,
  }));

  return NextResponse.json({
    leaderboard,
    myRank,
    totalParticipants,
    isTopTenPct,
    weekStart: weekStart.toISOString().split('T')[0],
  });
}
