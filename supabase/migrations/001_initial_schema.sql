-- QuitLoop initial schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  phone      text,
  timezone   text not null default 'UTC',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references public.users(id) on delete cascade,
  plan                   text not null check (plan in ('starter', 'pro', 'unlimited')),
  billing_cycle          text not null check (billing_cycle in ('monthly', 'yearly')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  trial_ends_at          timestamptz,
  status                 text not null default 'trialing'
                           check (status in ('trialing', 'active', 'canceled', 'past_due')),
  created_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create unique index subscriptions_user_id_unique on public.subscriptions(user_id);

-- MODULES
create table if not exists public.modules (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  addiction_type text not null check (addiction_type in ('vaping', 'junkfood')),
  start_date     date not null default current_date,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (user_id, addiction_type)
);

alter table public.modules enable row level security;

create policy "Users can manage their own modules"
  on public.modules for all
  using (auth.uid() = user_id);

-- TRIGGERS (user's saved triggers)
create table if not exists public.triggers (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  trigger_type text not null,
  created_at   timestamptz not null default now()
);

alter table public.triggers enable row level security;

create policy "Users can manage their own triggers"
  on public.triggers for all
  using (auth.uid() = user_id);

-- CRAVING SESSIONS
create table if not exists public.craving_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  addiction_type  text not null check (addiction_type in ('vaping', 'junkfood')),
  location_answer text not null,
  trigger_answer  text not null,
  nearby_answer   text not null,
  resisted        boolean,
  created_at      timestamptz not null default now()
);

alter table public.craving_sessions enable row level security;

create policy "Users can manage their own sessions"
  on public.craving_sessions for all
  using (auth.uid() = user_id);

create index craving_sessions_user_created on public.craving_sessions(user_id, created_at desc);

-- STREAKS
create table if not exists public.streaks (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  addiction_type    text not null check (addiction_type in ('vaping', 'junkfood')),
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_session_date date,
  last_updated      timestamptz not null default now(),
  unique (user_id, addiction_type)
);

alter table public.streaks enable row level security;

create policy "Users can manage their own streaks"
  on public.streaks for all
  using (auth.uid() = user_id);

-- SMS SCHEDULES
create table if not exists public.sms_schedules (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  craving_start time not null,
  craving_end   time not null,
  timezone      text not null default 'UTC',
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (user_id)
);

alter table public.sms_schedules enable row level security;

create policy "Users can manage their own SMS schedule"
  on public.sms_schedules for all
  using (auth.uid() = user_id);

-- Function: auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, timezone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger fires after user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: update streak after session
create or replace function public.update_streak_after_session(
  p_user_id      uuid,
  p_type         text,
  p_resisted     boolean,
  p_session_date date default current_date
)
returns void
language plpgsql
security definer
as $$
declare
  v_streak record;
  v_new_current integer;
  v_new_longest integer;
begin
  select * into v_streak
  from public.streaks
  where user_id = p_user_id and addiction_type = p_type;

  if not found then
    insert into public.streaks (user_id, addiction_type, current_streak, longest_streak, last_session_date)
    values (p_user_id, p_type, case when p_resisted then 1 else 0 end, case when p_resisted then 1 else 0 end, p_session_date);
    return;
  end if;

  if p_resisted then
    -- Extend streak if consecutive day
    if v_streak.last_session_date = p_session_date - 1 or v_streak.last_session_date = p_session_date then
      v_new_current := v_streak.current_streak + 1;
    else
      v_new_current := 1;
    end if;
    v_new_longest := greatest(v_new_current, v_streak.longest_streak);
  else
    -- Craving lost — reset streak
    v_new_current := 0;
    v_new_longest := v_streak.longest_streak;
  end if;

  update public.streaks
  set current_streak    = v_new_current,
      longest_streak    = v_new_longest,
      last_session_date = p_session_date,
      last_updated      = now()
  where user_id = p_user_id and addiction_type = p_type;
end;
$$;
