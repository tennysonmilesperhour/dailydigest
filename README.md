# The Daily Dump (Daily Digest)

A broadsheet-themed gut-health app for friends: private or shared dispatches, photos or illustrated plates, Bristol types, reactions, letters to the editor, a field guide, and the Golden Snake game.

**Live:** https://dailydigest-pi.vercel.app/

## Shared backend

Daily Digest uses the active Vibe Check Supabase project `xyhbuqsxglfjbounogdz`, alongside Campground, Dialogue, and AI Catch Up. Each app keeps its own data and access rules.

- `digest_profiles`: bylines only, separate from Vibe Check's private `profiles`.
- `digest_posts`, `digest_reactions`, `digest_comments`: relational dispatches and conversation.
- `digest-evidence`: private photo bucket, JPEG only, maximum 5 MiB.
- Shared Supabase Auth: existing Vibe Check / Campground users can sign in with the same email and password. Signing out here only ends this app's session.

Readers choose a byline before entering the publication. New dispatches start **private**. A public dispatch is visible to any signed-in account that has joined Daily Digest; there is no invitation gate. Private dispatches, comments, reactions and photos remain visible only to their author. Photos cannot be exposed by attaching another author's path to a public post.

Photo URLs last five minutes. Visibility changes prevent new URLs from being issued to other readers; a previously issued URL can remain usable until it expires. The snake high score stays in browser storage, per device.

## Local development

```sh
npm ci
cp .env.local.example .env.local
# Add the shared project's publishable key to NEXT_PUBLIC_SUPABASE_ANON_KEY.
npm run dev
```

Open http://localhost:3000. Only public browser credentials belong in these variables. Never use a service-role key in the app.

## Database migrations

The hosted migration is already applied. For a new shared environment:

1. Apply `supabase/migrations/20260908150701_daily_digest_shared_backend.sql`.
2. Apply Vibe Check's `20260908151011_preserve_daily_digest_identity.sql` after its existing shared-account protection migration. This extends Vibe Check deletion protection to Daily Digest bylines and uploads.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the deployment.
4. Add the deployment's origin to Supabase Auth redirect URLs. Preserve Vibe Check's existing Site URL and other app callbacks.

Do **not** apply `supabase/legacy/standalone.sql` to the shared project: its generic `profiles` table conflicts with Vibe Check. The file is retained only as a reference for historical imports.

## Deployment

The Vercel project is `dailydigest`, connected to this GitHub repository. Its production, preview, and development environments have the shared public Supabase connection. `work/`, `.env*`, SQL and local test artifacts are excluded from uploads.

```sh
vercel link --project dailydigest
vercel deploy --prod --skip-domain
# Verify the candidate, then:
vercel promote <candidate-url>
```

Preview builds currently use the shared live backend. Use disposable test accounts and remove their data after verification.

## Verification

```sh
npm run check
npm audit
```

The RLS suite runs the actual migration in PGlite (Postgres), with different identities. It covers private/public posts, comments and reactions, photo access and path spoofing, anonymous access, publication membership, and preservation of an existing Vibe Check profile. Type checking and a production Next.js build complete the check.

Hosted verification additionally exercises real Auth, PostgREST relationship joins, profile upserts, Storage uploads and signing, and the deployed Vibe Check deletion endpoint. Browser verification covers shared-password sign-in, byline setup and publishing. Tests use synthetic records and never send real sign-in emails.

## Outstanding recovery and email setup

The old Daily Digest project `mblmmfguqwwwszfvawtw` remains paused and untouched. Its database, users, and photos have **not** been imported. The Management API lists no available backup records; historical recovery requires an accessible database export and Storage export. Preserve old user IDs or build an explicit identity mapping before importing foreign keys and photo folders.

The shared project has no custom SMTP sender yet. Password access for existing confirmed shared accounts works. Magic-link/new-account delivery remains dependent on finishing the shared email configuration; the interface explains this limitation.

The health reference content and newspaper styling are retained from the original app. This consolidation does not medically validate that content.
