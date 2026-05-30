import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let sessionId: string, resisted: boolean;
  try {
    ({ sessionId, resisted } = (await req.json()) as { sessionId: string; resisted: boolean });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!sessionId || resisted === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Update the session outcome — scoped to this user to prevent spoofing
  const { data: session, error: updateError } = await supabase
    .from('craving_sessions')
    .update({ resisted })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select('addiction_type')
    .single();

  if (updateError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Update streak via the Postgres function
  const today = new Date().toISOString().split('T')[0];
  const { error: streakError } = await supabase.rpc('update_streak_after_session', {
    p_user_id: user.id,
    p_type: session.addiction_type,
    p_resisted: resisted,
    p_session_date: today,
  });

  if (streakError) {
    console.error('[outcome] streak update error:', streakError);
  }

  // Return updated streak so client can show it immediately
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', user.id)
    .eq('addiction_type', session.addiction_type)
    .single();

  // Award mastery points: +10 for resisting, +5 per streak day milestone
  if (resisted) {
    const streakBonus = (streak?.current_streak ?? 0) > 0 ? 5 : 0;
    const points = 10 + streakBonus;
    const { error: masteryError } = await supabase.rpc('upsert_mastery_points', {
      p_user_id: user.id,
      p_points: points,
    });
    if (masteryError) {
      console.error('[outcome] mastery points error:', masteryError);
    }
  }

  return NextResponse.json({
    success: true,
    newStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
  });
}
