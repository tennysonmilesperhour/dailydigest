# The Daily Dump

A private broadsheet-themed gut-health app for you and your friends. Share photos, tag Bristol types, react and comment, browse the field guide and protocols, and unlock the Golden Snake game on a Type 4.

This is the Next.js version, built to run on your own domain via Vercel so you control the link preview, favicon, and access.

## What changed from the artifact version

- Runs as a real Next.js app instead of a Claude artifact.
- The shared feed is now backed by Supabase (a single `kv_store` table) instead of artifact storage.
- You sign in with just a byline (username) — no password yet. Accounts live in Supabase, so the same byline works on any device and your filed posts follow you across sessions.
- Each post can be **public** (every reader sees it) or **private** (only you see it in the feed), toggleable at any time.
- You can illustrate a post with the house **illustrated plate** for its Bristol type instead of uploading a photo.
- Your snake high score lives in the browser's localStorage, so it stays per-device.
- The text-message link preview is controlled by the metadata in `app/layout.tsx`, currently set to show only "The Daily Dump".

## Setup

### 1. Install

```bash
npm install
```

### 2. Create the Supabase table

In your Supabase project, open the SQL editor and run the contents of `supabase.sql`. That creates the `kv_store` table and its access policies.

### 3. Add your keys

Copy the example env file and fill it in with values from Supabase (Project Settings > API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, import the repo.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Add your custom domain if you want (thedailydump... etc).

The link preview will read "The Daily Dump" and nothing else. To change it, edit `app/layout.tsx`.

## Notes on privacy

Sign-in is byline-only: there is no password yet, so anyone who types a byline becomes that "account." Accounts, posts, and their public/private flags all live in the shared Supabase `kv_store`, which the anon key can read. That means **"private" is UI-level, not cryptographic**: private posts are hidden from the rendered feed for everyone but their author, but a determined person with your anon key could still read the raw row. For a small trusted friend group that's the intended trade-off.

When you want real privacy: flip `PASSWORD_REQUIRED` in `lib/accounts.ts`, wire up Supabase Auth (email magic links or an invite-code gate), and tighten the RLS policies in `supabase.sql` to authenticated users only.

## Files worth knowing

- `app/page.tsx` — the entire app (feed, field guide, classifieds, snake game).
- `app/layout.tsx` — metadata and link-preview title.
- `lib/storage.ts` — the shared/local storage layer. Shared writes go to Supabase, personal writes go to localStorage.
- `lib/supabaseClient.ts` — Supabase connection.
- `supabase.sql` — database setup.

## Next ideas

- Real accounts + invite codes for privacy.
- Move photos into Supabase Storage instead of storing compressed base64 in the row (keeps the table small and images larger).
- Relational tables (posts, reactions, comments) instead of one JSON blob, once the feed grows past a handful of people.
