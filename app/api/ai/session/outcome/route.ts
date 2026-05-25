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

  const { sessionId, resisted } = (await req.json()) as {
    sessionId: string;
    resisted: boolean;
  };

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

  return NextResponse.json({
    success: true,
    newStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
  });
}
