-- Daily Digest / The Daily Dump. Additive: never changes Vibe Check's profiles.
create table public.digest_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  byline text not null check (char_length(btrim(byline)) between 1 and 24),
  created_at timestamptz not null default now()
);
create table public.digest_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.digest_profiles(id) on delete cascade,
  type smallint not null check (type between 1 and 7),
  note text check (char_length(note) <= 240),
  image_path text,
  use_placeholder boolean not null default false,
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now(),
  -- A reader must not attach somebody else's private photo to a public post.
  constraint digest_image_owner check (
    image_path is null or (split_part(image_path, '/', 1) = author_id::text
      and array_length(string_to_array(image_path, '/'), 1) = 2
      and image_path like '%/%.jpg')
  )
);
create table public.digest_reactions (
  post_id uuid not null references public.digest_posts(id) on delete cascade,
  user_id uuid not null references public.digest_profiles(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);
create table public.digest_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.digest_posts(id) on delete cascade,
  author_id uuid not null references public.digest_profiles(id) on delete cascade,
  text text not null check (char_length(btrim(text)) between 1 and 300),
  created_at timestamptz not null default now()
);
create index digest_posts_created_idx on public.digest_posts(created_at desc);
create index digest_posts_author_idx on public.digest_posts(author_id);
create index digest_posts_image_idx on public.digest_posts(image_path) where image_path is not null;
create index digest_reactions_user_idx on public.digest_reactions(user_id);
create index digest_comments_post_idx on public.digest_comments(post_id, created_at);
create index digest_comments_author_idx on public.digest_comments(author_id);

alter table public.digest_profiles enable row level security;
alter table public.digest_posts enable row level security;
alter table public.digest_reactions enable row level security;
alter table public.digest_comments enable row level security;

-- Only bylines live here, never emails or Vibe Check profile fields.
create policy "digest read bylines" on public.digest_profiles for select to authenticated using (true);
create policy "digest create own byline" on public.digest_profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "digest update own byline" on public.digest_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Shared-account users join this publication by choosing a byline first.
create policy "digest read visible posts" on public.digest_posts for select to authenticated
  using (author_id = (select auth.uid()) or (visibility = 'public' and
    exists(select 1 from public.digest_profiles where id = (select auth.uid()))));
create policy "digest create own posts" on public.digest_posts for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "digest update own posts" on public.digest_posts for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "digest delete own posts" on public.digest_posts for delete to authenticated
  using (author_id = (select auth.uid()));

-- Subqueries reuse the posts' RLS; no exposed SECURITY DEFINER helper is needed.
create policy "digest read visible reactions" on public.digest_reactions for select to authenticated
  using (exists(select 1 from public.digest_posts where id = post_id));
create policy "digest create own reactions" on public.digest_reactions for insert to authenticated
  with check (user_id = (select auth.uid()) and exists(select 1 from public.digest_posts where id = post_id));
create policy "digest delete own reactions" on public.digest_reactions for delete to authenticated
  using (user_id = (select auth.uid()));
create policy "digest read visible comments" on public.digest_comments for select to authenticated
  using (exists(select 1 from public.digest_posts where id = post_id));
create policy "digest create own comments" on public.digest_comments for insert to authenticated
  with check (author_id = (select auth.uid()) and exists(select 1 from public.digest_posts where id = post_id));
create policy "digest delete own comments" on public.digest_comments for delete to authenticated
  using (author_id = (select auth.uid()));

revoke all on public.digest_profiles, public.digest_posts, public.digest_reactions, public.digest_comments from public, anon, authenticated;
grant select on public.digest_profiles, public.digest_posts, public.digest_reactions, public.digest_comments to authenticated;
grant insert(id, byline), update(id, byline) on public.digest_profiles to authenticated;
grant insert(author_id, type, note, image_path, use_placeholder, visibility),
  update(type, note, image_path, use_placeholder, visibility), delete on public.digest_posts to authenticated;
grant insert(post_id, user_id, emoji), delete on public.digest_reactions to authenticated;
grant insert(post_id, author_id, text), delete on public.digest_comments to authenticated;
grant all on public.digest_profiles, public.digest_posts, public.digest_reactions, public.digest_comments to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('digest-evidence', 'digest-evidence', false, 5242880, array['image/jpeg']);
create policy "digest read visible photos" on storage.objects for select to authenticated
  using (bucket_id = 'digest-evidence' and (
    (storage.foldername(name))[1] = (select auth.uid())::text or
    exists(select 1 from public.digest_posts where image_path = storage.objects.name)
  ));
create policy "digest upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'digest-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists(select 1 from public.digest_profiles where id = (select auth.uid())));
create policy "digest delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'digest-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
