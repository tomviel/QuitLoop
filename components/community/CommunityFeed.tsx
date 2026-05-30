'use client';

import { useState, useOptimistic, useTransition } from 'react';

interface Post {
  id: string;
  content: string;
  streak_count: number;
  likes: number;
  created_at: string;
  user_id: string;
}

interface CommunityFeedProps {
  initialPosts: Post[];
  currentUserId: string;
  partnerId: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CommunityFeed({ initialPosts, currentUserId, partnerId }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [, startTransition] = useTransition();

  async function handlePost() {
    const text = draft.trim();
    if (!text || text.length > 500) return;

    setPosting(true);
    setPostError('');

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        setPostError(data.error ?? 'Failed to post. Try again.');
        return;
      }

      const { post } = await res.json();
      setPosts((prev) => [post, ...prev]);
      setDraft('');
    } catch {
      setPostError('Network error. Try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    // Optimistically increment
    startTransition(() => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
      );
    });

    try {
      await fetch(`/api/community/${postId}/like`, { method: 'POST' });
    } catch {
      // Revert on failure
      startTransition(() => {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: p.likes - 1 } : p))
        );
      });
    }
  }

  async function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    try {
      await fetch(`/api/community/${postId}`, { method: 'DELETE' });
    } catch {
      // Silently ignore — post already removed from UI
    }
  }

  return (
    <div className="space-y-4">
      {/* Accountability partner banner */}
      {partnerId && (
        <div className="card border-primary/30 bg-primary/5">
          <p className="text-sm font-semibold text-primary mb-0.5">
            🤝 Accountability partner assigned
          </p>
          <p className="text-xs text-text-secondary">
            You have a partner rooting for you. Keep your streak going — they can see your wins.
          </p>
        </div>
      )}

      {/* Compose */}
      <div className="card">
        <p className="text-sm font-semibold text-text-primary mb-2">Share a win</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="I just resisted a craving for the 5th time today..."
          className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm
                     text-text-primary placeholder-text-muted resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">{draft.length}/500</span>
          <button
            onClick={handlePost}
            disabled={posting || draft.trim().length === 0}
            className="btn-primary px-5 py-2 text-sm rounded-xl min-h-[36px]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
        {postError && <p className="text-red-400 text-xs mt-1">{postError}</p>}
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted text-sm">No posts yet. Be the first to share a win!</p>
        </div>
      ) : (
        posts.map((post) => {
          const isOwn = post.user_id === currentUserId;
          const isPartner = post.user_id === partnerId;

          return (
            <div key={post.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isPartner && (
                    <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      Partner
                    </span>
                  )}
                  {isOwn && (
                    <span className="text-xs bg-bg border border-border text-text-muted px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {post.streak_count > 0 && (
                    <span className="text-xs text-warning font-semibold">
                      🔥 {post.streak_count} day streak
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {timeAgo(post.created_at)}
                </span>
              </div>

              <p className="text-sm text-text-primary leading-relaxed">{post.content}</p>

              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1 text-xs text-text-muted
                             hover:text-primary transition-colors active:scale-95"
                >
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </button>

                {isOwn && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs text-text-muted hover:text-red-400 transition-colors ml-auto"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
