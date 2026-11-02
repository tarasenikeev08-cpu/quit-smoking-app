-- Ember — Supabase schema
-- Run in the Supabase SQL editor (Dashboard → SQL → New query) once per project.
-- Enable "Anonymous sign-ins" under Authentication → Providers for the local-first flow.

-- ---------------------------------------------------------------------------
-- profiles: one row per user, mirrors the on-device store
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  onboarded   boolean     not null default false,
  habit       jsonb       not null default '{}'::jsonb,
  streak      jsonb       not null default '{}'::jsonb,
  equipped    text        not null default 'puff',
  is_premium  boolean     not null default false,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are self-owned" on public.profiles;
create policy "profiles are self-owned"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- journal_entries: daily check-ins
-- ---------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id         text        primary key,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  craving    int         not null check (craving between 1 and 5),
  triggers   text[]      not null default '{}',
  mood       int         not null check (mood between 1 and 5)
);

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

alter table public.journal_entries enable row level security;

drop policy if exists "journal entries are self-owned" on public.journal_entries;
create policy "journal entries are self-owned"
  on public.journal_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- subscriptions: optional ledger updated by the RevenueCat webhook
-- (the app reads entitlement from the RevenueCat SDK; this is for analytics /
--  server-side truth if you wire the webhook to an Edge Function later)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id        uuid        primary key references auth.users (id) on delete cascade,
  product_id     text,
  entitlement    text,
  is_active      boolean     not null default false,
  expires_at     timestamptz,
  updated_at     timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions readable by owner" on public.subscriptions;
create policy "subscriptions readable by owner"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);
