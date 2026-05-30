import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeText } from '@/lib/sanitize';

// ── GET: list recent posts ────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: posts, error } = await supabase
    .from('community_posts')
    .select('id, content, streak_count, likes, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[community/GET] error:', error);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }

  return NextResponse.json({ posts: posts ?? [] });
}

// ── POST: create a new post ───────────────────────────────────────────────────
export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let content: string;
  try {
    ({ content } = (await req.json()) as { content: string });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const trimmed = sanitizeText(content ?? '', 500);
  if (!trimmed) {
    return NextResponse.json(
      { error: 'Content must be between 1 and 500 characters' },
      { status: 400 }
    );
  }

  // Get the user's highest current streak to attach to the post
  const { data: streakData } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .order('current_streak', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: post, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: user.id,
      content: trimmed,
      streak_count: streakData?.current_streak ?? 0,
    })
    .select('id, content, streak_count, likes, created_at, user_id')
    .single();

  if (error) {
    console.error('[community/POST] error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }

  return NextResponse.json({ post }, { status: 201 });
}
