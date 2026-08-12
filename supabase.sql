-- The Daily Dump — database schema
-- Run this in the Supabase SQL editor (Dashboard > SQL > New query), or apply it
-- with the Supabase CLI. It is idempotent: safe to run more than once.
--
-- Model (real accounts + enforced privacy):
--   profiles  — one row per authenticated user, holds their byline (display name)
--   posts     — one row per dispatch, with a visibility of 'public' | 'private'
--   reactions — one row per (post, user, emoji)
--   comments  — one row per letter to the editor
--   storage   — a private 'evidence' bucket for photos
--
-- Privacy is enforced by Row Level Security, not just the UI: a private post and
-- its reactions/comments/photo are readable only by their author. Public ones are
-- readable by any signed-in reader. Sign-in is passwordless (magic link) via
-- Supabase Auth, so every request carries a real user identity (auth.uid()).

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  byline     text not null check (char_length(byline) between 1 and 24),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- POSTS
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles (id) on delete cascade,
  type            smallint not null check (type between 1 and 7),
  note            text check (char_length(note) <= 240),
  image_path      text,                       -- path in the 'evidence' bucket; null when using the plate
  use_placeholder boolean not null default false,
  visibility      text not null default 'public' check (visibility in ('public', 'private')),
  created_at      timestamptz not null default now()
);
alter table public.posts enable row level security;
create index if not exists posts_created_at_idx on public.posts (created_at desc);

drop policy if exists "read public or own posts" on public.posts;
create policy "read public or own posts"
  on public.posts for select to authenticated
  using (visibility = 'public' or author_id = auth.uid());

drop policy if exists "insert own posts" on public.posts;
create policy "insert own posts"
  on public.posts for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "update own posts" on public.posts;
create policy "update own posts"
  on public.posts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "delete own posts" on public.posts;
create policy "delete own posts"
  on public.posts for delete to authenticated using (author_id = auth.uid());

-- Can the current user see this post? SECURITY DEFINER so the reactions/comments
-- policies can check post visibility without needing their own RLS grant on posts
-- (and without recursive policy evaluation). auth.uid() still resolves to the caller.
create or replace function public.can_see_post(p_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.posts p
    where p.id = p_id and (p.visibility = 'public' or p.author_id = auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- REACTIONS
-- ---------------------------------------------------------------------------
create table if not exists public.reactions (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);
alter table public.reactions enable row level security;

drop policy if exists "read reactions on visible posts" on public.reactions;
create policy "read reactions on visible posts"
  on public.reactions for select to authenticated using (public.can_see_post(post_id));

drop policy if exists "insert own reactions" on public.reactions;
create policy "insert own reactions"
  on public.reactions for insert to authenticated
  with check (user_id = auth.uid() and public.can_see_post(post_id));

drop policy if exists "delete own reactions" on public.reactions;
create policy "delete own reactions"
  on public.reactions for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  text       text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create index if not exists comments_post_idx on public.comments (post_id, created_at);

drop policy if exists "read comments on visible posts" on public.comments;
create policy "read comments on visible posts"
  on public.comments for select to authenticated using (public.can_see_post(post_id));

drop policy if exists "insert own comments" on public.comments;
create policy "insert own comments"
  on public.comments for insert to authenticated
  with check (author_id = auth.uid() and public.can_see_post(post_id));

drop policy if exists "delete own comments" on public.comments;
create policy "delete own comments"
  on public.comments for delete to authenticated using (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- GRANTS (Supabase pattern: broad table grants, RLS decides which rows)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete
  on public.profiles, public.posts, public.reactions, public.comments
  to authenticated;
grant execute on function public.can_see_post(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- STORAGE: private 'evidence' bucket for photographs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('evidence', 'evidence', false)
  on conflict (id) do nothing;

-- Read an image only if you can see its post (public, or yours).
drop policy if exists "read evidence for visible posts" on storage.objects;
create policy "read evidence for visible posts"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'evidence'
    and exists (
      select 1 from public.posts p
      where p.image_path = storage.objects.name
        and (p.visibility = 'public' or p.author_id = auth.uid())
    )
  );

-- Upload only into your own folder: evidence/<your-uid>/<file>.jpg
drop policy if exists "upload evidence to own folder" on storage.objects;
create policy "upload evidence to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "delete own evidence" on storage.objects;
create policy "delete own evidence"
  on storage.objects for delete to authenticated
  using (bucket_id = 'evidence' and owner = auth.uid());
