-- Run this in the Supabase SQL editor (Dashboard > SQL > New query).
-- Creates the single shared key-value table the app reads and writes.
--
-- Keys the app stores here:
--   sp-feed-v1     -> the whole feed (JSON array of posts, each with a
--                     visibility flag of "public" | "private")
--   sp-accounts-v1 -> the account registry (JSON map of byline -> account)
-- Per-device values (session byline, snake high score) live in localStorage,
-- not here.

create table if not exists public.kv_store (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.kv_store enable row level security;

-- Friends-only app with byline-only sign-in (no password yet): the anon key can
-- read and write the feed. This is intentionally open. Anyone with your Supabase
-- anon key + URL can read/write kv_store, so "private" posts are hidden in the UI
-- but not truly secret. That's fine for a small private friend group. When you add
-- real auth (see PASSWORD_REQUIRED in lib/accounts.ts), tighten these policies to
-- authenticated users only.

drop policy if exists "public read" on public.kv_store;
create policy "public read"
  on public.kv_store for select
  using (true);

drop policy if exists "public insert" on public.kv_store;
create policy "public insert"
  on public.kv_store for insert
  with check (true);

drop policy if exists "public update" on public.kv_store;
create policy "public update"
  on public.kv_store for update
  using (true)
  with check (true);
