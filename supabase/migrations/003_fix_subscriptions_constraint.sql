-- Promote the unique index on subscriptions.user_id to a proper UNIQUE CONSTRAINT.
-- PostgREST (Supabase) upsert with onConflict requires a constraint, not just an index.
-- This uses the existing index so no data rebuild is needed.

alter table public.subscriptions
  add constraint subscriptions_user_id_key
  unique using index subscriptions_user_id_unique;
