-- ProgressFolio initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push` once you
-- have the CLI + a linked project). Safe to re-run: uses IF NOT EXISTS /
-- CREATE OR REPLACE where practical.

-- ---------------------------------------------------------------------
-- profiles: one row per app user, public-readable (it backs /u/[username])
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  github_login text,
  streak_weeks integer not null default 0,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  billing_interval text check (billing_interval is null or billing_interval in ('month', 'year')),
  polar_customer_id text,
  polar_subscription_id text,
  polar_product_id text,
  plan_status text check (plan_status is null or plan_status in ('active', 'canceled', 'past_due', 'revoked')),
  plan_current_period_end timestamptz,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- github_accounts: linked GitHub identity + encrypted-at-rest token
-- ---------------------------------------------------------------------
create table if not exists public.github_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  github_user_id bigint not null unique,
  github_login text not null,
  access_token text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.github_accounts enable row level security;

create policy "Users manage their own github account"
  on public.github_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- tracked_repos: repos selected for auto-import (free plan: max 1)
-- ---------------------------------------------------------------------
create table if not exists public.tracked_repos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  github_repo_id bigint not null,
  full_name text not null,
  is_private boolean not null default false,
  webhook_id bigint,
  created_at timestamptz not null default now(),
  unique (user_id, github_repo_id)
);

alter table public.tracked_repos enable row level security;

create policy "Users manage their own tracked repos"
  on public.tracked_repos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- raw_commits: raw GitHub data kept for AI context / re-generation
-- ---------------------------------------------------------------------
create table if not exists public.raw_commits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  repo_id uuid not null references public.tracked_repos (id) on delete cascade,
  sha text not null,
  message text not null,
  committed_at timestamptz not null,
  additions integer not null default 0,
  deletions integer not null default 0,
  files_changed text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (repo_id, sha)
);

alter table public.raw_commits enable row level security;

create policy "Users manage their own raw commits"
  on public.raw_commits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- timeline_entries: the public-facing shipping log (AI or manual)
-- ---------------------------------------------------------------------
create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  repo_id uuid references public.tracked_repos (id) on delete set null,
  source text not null check (source in ('github', 'manual')),
  entry_date date not null,
  title text not null,
  summary text not null,
  skills text[] not null default '{}',
  lessons text,
  screenshot_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.timeline_entries enable row level security;

create policy "Published entries are viewable by everyone"
  on public.timeline_entries for select
  using (status = 'published' or auth.uid() = user_id);

create policy "Users manage their own timeline entries"
  on public.timeline_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists timeline_entries_user_date_idx
  on public.timeline_entries (user_id, entry_date desc);

-- ---------------------------------------------------------------------
-- weekly_posts: cached AI-generated share text per ISO week
-- ---------------------------------------------------------------------
create table if not exists public.weekly_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  iso_week text not null, -- e.g. '2026-W38'
  post_text text not null,
  created_at timestamptz not null default now(),
  unique (user_id, iso_week)
);

alter table public.weekly_posts enable row level security;

create policy "Users manage their own weekly posts"
  on public.weekly_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Storage: bucket for manual-log screenshots
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('entry-media', 'entry-media', true)
on conflict (id) do nothing;

create policy "Entry media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'entry-media');

create policy "Users upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'entry-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users manage files in their own folder"
  on storage.objects for update using (
    bucket_id = 'entry-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete files in their own folder"
  on storage.objects for delete using (
    bucket_id = 'entry-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.timeline_entries;
create trigger set_updated_at before update on public.timeline_entries
  for each row execute function public.set_updated_at();

create index if not exists profiles_polar_customer_id_idx
  on public.profiles (polar_customer_id);

create index if not exists profiles_polar_subscription_id_idx
  on public.profiles (polar_subscription_id);

-- Billing columns: readable (public page branding). Writable only by
-- the service role (Polar webhook). Logged-in users cannot self-upgrade.
create or replace function public.protect_profile_billing()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' or current_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.plan := 'free';
    new.billing_interval := null;
    new.polar_customer_id := null;
    new.polar_subscription_id := null;
    new.polar_product_id := null;
    new.plan_status := null;
    new.plan_current_period_end := null;
    return new;
  end if;

  new.plan := old.plan;
  new.billing_interval := old.billing_interval;
  new.polar_customer_id := old.polar_customer_id;
  new.polar_subscription_id := old.polar_subscription_id;
  new.polar_product_id := old.polar_product_id;
  new.plan_status := old.plan_status;
  new.plan_current_period_end := old.plan_current_period_end;
  return new;
end;
$$;

drop trigger if exists protect_profile_billing on public.profiles;
create trigger protect_profile_billing
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_billing();
