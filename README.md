# The Daily Dump

A private broadsheet-themed gut-health app for you and your friends. Share photos, tag Bristol types, react and comment, browse the field guide and protocols, and unlock the Golden Snake game on a Type 4.

This is the Next.js version, built to run on your own domain via Vercel so you control the link preview, favicon, and access.

## What it does

- Runs as a real Next.js app instead of a Claude artifact.
- **Passwordless sign-in** via Supabase Auth (email magic link). No passwords to remember; sign in on any device and your dispatches follow you.
- **Real accounts.** Your byline (display name) lives in a `profiles` row. Posts, reactions, and comments are relational tables — no single shared blob.
- **Public / private posts.** Each post is public (every signed-in reader sees it) or private (only you). Toggle any of your posts at any time.
- **Enforced privacy.** Visibility is enforced in the database by Row Level Security — a private post and its reactions, comments, and photo are unreadable by anyone but the author, not just hidden in the UI.
- **Illustrated plate option.** Post the house cartoon for a Bristol type instead of uploading a photo. Photos go into a private Supabase Storage bucket and are served through short-lived signed URLs.
- Your snake high score lives in the browser's localStorage, so it stays per-device.
- The text-message link preview is controlled by the metadata in `app/layout.tsx`, currently set to show only "The Daily Dump".

## Setup

### 1. Install

```bash
npm install
```

### 2. Create the schema

In your Supabase project, open the SQL editor and run the contents of `supabase.sql`. It is idempotent and creates the `profiles`, `posts`, `reactions`, and `comments` tables, all Row Level Security policies, and the private `evidence` storage bucket with its policies.

### 3. Turn on magic-link auth

In the Supabase dashboard:

- **Authentication → Providers → Email**: enable it, and enable "magic link" (email OTP). You can leave "Confirm email" on.
- **Authentication → URL Configuration**: set the **Site URL** to where the app runs (e.g. `http://localhost:3000` for local dev, or your Vercel domain), and add both to **Redirect URLs**. The magic link returns users to `window.location.origin`, so this must match.

### 4. Add your keys

Copy the example env file and fill it in with values from Supabase (Project Settings > API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, import the repo.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Add your custom domain if you want (thedailydump... etc).
5. Back in Supabase, add your Vercel/custom domain to **Authentication → URL Configuration** (Site URL + Redirect URLs) so magic links work in production.

The link preview will read "The Daily Dump" and nothing else. To change it, edit `app/layout.tsx`.

## Privacy model

Privacy is enforced by the database, not just the interface. Every read and write goes through Row Level Security keyed on the signed-in user (`auth.uid()`):

- A **private** post — and its reactions, comments, and photo — is readable only by its author.
- A **public** post is readable by any signed-in reader.
- You can only post, react, comment, or upload as yourself, and only change your own posts.

The photo bucket is private; images are fetched through short-lived signed URLs that are themselves RLS-gated, so a signed URL can only be minted for a photo you're allowed to see.

### Verifying the privacy rules

The RLS policies are checked against real Postgres (via PGlite) with two simulated users:

```bash
npm run test:rls
```

It proves that private posts, reactions, comments, and photos stay invisible to non-authors and that authorship/folder ownership can't be spoofed. See `supabase/rls.test.mjs`.

## Files worth knowing

- `app/page.tsx` — the whole UI (sign-in, byline setup, feed, composer, field guide, classifieds, snake game).
- `app/layout.tsx` — metadata and link-preview title.
- `lib/auth.ts` — magic-link sign-in, session, and profile (byline).
- `lib/db.ts` — the feed data layer (posts, reactions, comments, photo upload + signed URLs).
- `lib/supabaseClient.ts` — Supabase connection (resilient to missing env vars).
- `supabase.sql` — database schema, RLS policies, and storage setup.
- `supabase/rls.test.mjs` — reproducible RLS privacy test.

## Next ideas

- Realtime feed updates via Supabase channels instead of the "Check the wire" button.
- Rate limiting / abuse controls if the group grows beyond friends.
- An invite-code or allow-list gate on sign-up so not just anyone with the link can join.
