-- ─────────────────────────────────────────────────────────────────────────────
-- 004_new_features.sql
-- Mastery Score, Challenges, Community, Leaderboard, Language, Plan rename
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Rename plans: starter→solo  pro→community  unlimited→elite ────────────

-- Drop the old check constraint on plan
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

-- Migrate existing rows
UPDATE public.subscriptions SET plan = 'solo'      WHERE plan = 'starter';
UPDATE public.subscriptions SET plan = 'community' WHERE plan = 'pro';
UPDATE public.subscriptions SET plan = 'elite'     WHERE plan = 'unlimited';

-- Re-add constraint with new values
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('solo', 'community', 'elite'));

-- ── 2. Add language column to users ─────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en'
  CHECK (language IN ('en', 'fr', 'es', 'de'));

-- ── 3. mastery_scores ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mastery_scores (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_score   integer NOT NULL DEFAULT 0,
  weekly_score  integer NOT NULL DEFAULT 0,
  week_start    date NOT NULL DEFAULT current_date,
  last_updated  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.mastery_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mastery score"
  ON public.mastery_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery score"
  ON public.mastery_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS mastery_scores_total_idx
  ON public.mastery_scores (total_score DESC);

CREATE INDEX IF NOT EXISTS mastery_scores_weekly_idx
  ON public.mastery_scores (week_start, weekly_score DESC);

-- ── 4. challenges ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.challenges (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_type text NOT NULL,
  level          integer NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
  start_date     date NOT NULL DEFAULT current_date,
  completed      boolean NOT NULL DEFAULT false,
  completed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_type)
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own challenges"
  ON public.challenges FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS challenges_user_idx
  ON public.challenges (user_id, level, completed);

-- ── 5. community_posts ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.community_posts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content      text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  streak_count integer NOT NULL DEFAULT 0,
  likes        integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts visible to authenticated users"
  ON public.community_posts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS community_posts_created_idx
  ON public.community_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_likes_idx
  ON public.community_posts (likes DESC);

-- ── 6. accountability_pairs ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.accountability_pairs (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id   uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user1_id <> user2_id)
);

ALTER TABLE public.accountability_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own pairs"
  ON public.accountability_pairs FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE INDEX IF NOT EXISTS accountability_user1_idx
  ON public.accountability_pairs (user1_id, active);

CREATE INDEX IF NOT EXISTS accountability_user2_idx
  ON public.accountability_pairs (user2_id, active);

-- ── 7. Function: upsert_mastery_points ───────────────────────────────────────
-- Called after every craving session or streak update.
-- Points: craving_resisted=+10, streak_day=+5, weekly resets every Monday.

CREATE OR REPLACE FUNCTION public.upsert_mastery_points(
  p_user_id uuid,
  p_points  integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start date := date_trunc('week', current_date)::date;
BEGIN
  INSERT INTO public.mastery_scores (user_id, total_score, weekly_score, week_start)
  VALUES (p_user_id, p_points, p_points, v_week_start)
  ON CONFLICT (user_id) DO UPDATE
    SET total_score  = mastery_scores.total_score + p_points,
        weekly_score = CASE
          WHEN mastery_scores.week_start = v_week_start
            THEN mastery_scores.weekly_score + p_points
          ELSE p_points
        END,
        week_start   = v_week_start,
        last_updated = now();
END;
$$;
