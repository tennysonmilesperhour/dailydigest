// Verifies the RLS privacy model in supabase.sql against real Postgres (PGlite/WASM).
// Stubs the Supabase-provided primitives (auth.users, auth.uid(), storage.*) then
// runs the app schema and simulates two signed-in users to prove that private
// posts + their reactions/comments/photos are invisible to everyone but the author.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

const db = await PGlite.create();

// --- Stubs for what Supabase provides in a real project ---
await db.exec(`
  create schema if not exists auth;
  create schema if not exists storage;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('app.uid', true), '')::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean default false);
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text, name text, owner uuid
  );
  alter table storage.objects enable row level security;
  create function storage.foldername(n text) returns text[] language sql immutable as $$
    select string_to_array(n, '/') $$;
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema auth, storage to authenticated;
  grant select, insert, update, delete on storage.objects to authenticated;
  insert into auth.users (id, email) values ('${A}','a@x.com'), ('${B}','b@x.com');
`);

// --- The app schema under test ---
await db.exec(readFileSync(new URL("../supabase.sql", import.meta.url), "utf8"));

// Helper: run a block of statements AS a given signed-in user (authenticated role + app.uid).
async function as(uid, fn) {
  await db.exec(`set role authenticated; select set_config('app.uid', '${uid}', false);`);
  try { return await fn(); }
  finally { await db.exec(`reset role; select set_config('app.uid', '', false);`); }
}
const q = async (sql) => (await db.query(sql)).rows;

const results = [];
const check = (name, cond) => results.push(`${cond ? "PASS" : "FAIL"}  ${name}`);
let expectThrow = async (name, fn) => {
  try { await fn(); results.push(`FAIL  ${name} (expected RLS to block, but it succeeded)`); }
  catch { results.push(`PASS  ${name}`); }
};

// A creates a profile + one public and one private post.
let aPub, aPriv, bPub;
await as(A, async () => {
  await db.exec(`insert into public.profiles (id, byline) values ('${A}', 'The LogFather')`);
  aPub  = (await q(`insert into public.posts (author_id,type,note,visibility) values ('${A}',4,'gold','public')  returning id`))[0].id;
  aPriv = (await q(`insert into public.posts (author_id,type,note,visibility) values ('${A}',1,'secret','private') returning id`))[0].id;
});
// B creates a profile + one public post.
await as(B, async () => {
  await db.exec(`insert into public.profiles (id, byline) values ('${B}', 'Nurse Joy')`);
  bPub = (await q(`insert into public.posts (author_id,type,note,visibility) values ('${B}',3,'hi','public') returning id`))[0].id;
});

// --- Post visibility ---
await as(B, async () => {
  const rows = await q(`select id, visibility from public.posts`);
  check("B sees both public posts", rows.length === 2);
  check("B does NOT see A's private post", !rows.some(r => r.id === aPriv));
});
await as(A, async () => {
  const rows = await q(`select id from public.posts`);
  check("A sees own private + own public + B's public (3)", rows.length === 3);
  check("A sees own private post", rows.some(r => r.id === aPriv));
});

// --- Cannot forge authorship ---
await as(B, async () => {
  await expectThrow("B cannot insert a post as A (author_id spoof)", async () =>
    db.exec(`insert into public.posts (author_id,type,visibility) values ('${A}',4,'public')`));
  // An RLS UPDATE that matches no permitted rows does not error — it changes nothing.
  await db.exec(`update public.posts set visibility='public' where id='${aPriv}'`);
});
await as(A, async () => {
  const still = await q(`select visibility from public.posts where id='${aPriv}'`);
  check("B cannot flip A's private post to public", still[0]?.visibility === "private");
});

// --- Reactions honor post visibility ---
await as(B, async () => {
  await db.exec(`insert into public.reactions (post_id,user_id,emoji) values ('${aPub}','${B}','🔥')`); // ok: public post
  await expectThrow("B cannot react to A's private post", async () =>
    db.exec(`insert into public.reactions (post_id,user_id,emoji) values ('${aPriv}','${B}','🔥')`));
  await expectThrow("B cannot react as A (user_id spoof)", async () =>
    db.exec(`insert into public.reactions (post_id,user_id,emoji) values ('${aPub}','${A}','👏')`));
});
await as(A, async () => {
  await db.exec(`insert into public.reactions (post_id,user_id,emoji) values ('${aPriv}','${A}','💩')`); // ok: own post
  const onPriv = await q(`select 1 from public.reactions where post_id='${aPriv}'`);
  check("A sees the reaction on their own private post", onPriv.length === 1);
});
await as(B, async () => {
  const onPriv = await q(`select 1 from public.reactions where post_id='${aPriv}'`);
  check("B sees NO reactions on A's private post", onPriv.length === 0);
});

// --- Comments honor post visibility ---
await as(B, async () => {
  await db.exec(`insert into public.comments (post_id,author_id,text) values ('${aPub}','${B}','nice')`); // ok
  await expectThrow("B cannot comment on A's private post", async () =>
    db.exec(`insert into public.comments (post_id,author_id,text) values ('${aPriv}','${B}','hah')`));
});
await as(A, async () => {
  await db.exec(`insert into public.comments (post_id,author_id,text) values ('${aPriv}','${A}','mine')`);
});
await as(B, async () => {
  const c = await q(`select 1 from public.comments where post_id='${aPriv}'`);
  check("B sees NO comments on A's private post", c.length === 0);
});

// --- Storage: photo evidence honors post visibility + folder ownership ---
await as(A, async () => {
  // A uploads a photo into their own folder and attaches it to their PRIVATE post.
  await db.exec(`insert into storage.objects (bucket_id,name,owner) values ('evidence','${A}/priv.jpg','${A}')`);
  await db.exec(`update public.posts set image_path='${A}/priv.jpg' where id='${aPriv}'`);
  // ...and a photo on their PUBLIC post.
  await db.exec(`insert into storage.objects (bucket_id,name,owner) values ('evidence','${A}/pub.jpg','${A}')`);
  await db.exec(`update public.posts set image_path='${A}/pub.jpg' where id='${aPub}'`);
});
await as(B, async () => {
  await expectThrow("B cannot upload into A's storage folder", async () =>
    db.exec(`insert into storage.objects (bucket_id,name,owner) values ('evidence','${A}/steal.jpg','${B}')`));
  const pub = await q(`select 1 from storage.objects where name='${A}/pub.jpg'`);
  check("B can read the photo on A's PUBLIC post", pub.length === 1);
  const priv = await q(`select 1 from storage.objects where name='${A}/priv.jpg'`);
  check("B CANNOT read the photo on A's PRIVATE post", priv.length === 0);
});

await db.close();
console.log("\n=== RLS PRIVACY CHECKS ===\n" + results.join("\n"));
const failed = results.filter(r => r.startsWith("FAIL"));
console.log(`\n${failed.length ? "SOME CHECKS FAILED" : "ALL CHECKS PASSED"} (${results.length - failed.length}/${results.length})`);
if (failed.length) process.exit(1);
