-- SMS send log — prevents duplicate sends within a day
create table if not exists public.sms_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  sms_type   text not null check (sms_type in ('pre_window', 'in_window')),
  sent_date  date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, sms_type, sent_date)
);

alter table public.sms_logs enable row level security;

-- Only the service role can insert (cron runs as service role)
create policy "Service role manages SMS logs"
  on public.sms_logs for all
  using (true)
  with check (true);
