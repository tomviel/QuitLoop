import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CommunityFeed } from '@/components/community/CommunityFeed';

export default async function CommunityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Check plan — community requires community or elite
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  if (!sub || sub.plan === 'solo') {
    redirect('/pricing?reason=community_locked');
  }

  // Fetch initial posts + accountability partner SSR
  const [postsResult, partnerResult] = await Promise.all([
    supabase
      .from('community_posts')
      .select('id, content, streak_count, likes, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('accountability_pairs')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('active', true)
      .maybeSingle(),
  ]);

  const posts = postsResult.data ?? [];
  const pair = partnerResult.data;
  const partnerId = pair
    ? pair.user1_id === user.id
      ? pair.user2_id
      : pair.user1_id
    : null;

  return (
    <main className="pb-24 bg-bg min-h-screen">
      <div className="page-container pt-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Community</h1>
        <p className="text-text-secondary text-sm mb-6">
          Real wins from real people. Share yours.
        </p>

        <CommunityFeed
          initialPosts={posts}
          currentUserId={user.id}
          partnerId={partnerId}
        />
      </div>
    </main>
  );
}
