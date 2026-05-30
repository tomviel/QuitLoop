import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ── DELETE /api/community/:id — remove own post ───────────────────────────────
export async function DELETE(
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

  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id); // RLS enforced + extra safety

  if (error) {
    console.error('[community/DELETE] error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
