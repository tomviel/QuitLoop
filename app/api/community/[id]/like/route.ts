import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// ── POST /api/community/:id/like — increment like count ──────────────────────
// Authenticated users can like any post. We use admin client because RLS only
// allows users to UPDATE their own posts.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await createAdminClient();

  // Fetch current likes then increment
  const { data: post, error: fetchErr } = await admin
    .from('community_posts')
    .select('likes')
    .eq('id', params.id)
    .single();

  if (fetchErr || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const { error: updateErr } = await admin
    .from('community_posts')
    .update({ likes: (post.likes as number) + 1 })
    .eq('id', params.id);

  if (updateErr) {
    console.error('[community/like] error:', updateErr);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }

  return NextResponse.json({ success: true, likes: (post.likes as number) + 1 });
}
