-- Run this in the Supabase SQL editor (Dashboard > SQL > New query).
-- Creates the single shared key-value table the app reads and writes.

create table if not exists public.kv_store (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.kv_store enable row level security;

-- Friends-only app with no login: the anon key can read and write the feed.
-- This is intentionally open. Anyone with your Supabase anon key + URL can
-- write to kv_store. That's fine for a small private friend group. If you
-- later add real auth, tighten these policies to authenticated users only.

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
