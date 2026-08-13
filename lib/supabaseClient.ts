import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // completes the magic-link redirect automatically
    },
  });
} else {
  console.warn(
    "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

/** True when the app has real Supabase credentials; the UI uses this to explain
 *  when it can't reach a backend instead of failing silently. */
export const isSupabaseConfigured = !!client;

/**
 * When env vars are absent, importing must not throw (that used to crash
 * `next build` and any misconfigured deploy). This recursive stub lets property
 * access chain freely and only throws when a method is actually called, which the
 * auth/db layers catch and surface as a friendly "backend not configured" state.
 */
function notConfigured(): never {
  throw new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}
const stub: any = new Proxy(function () {}, { get: () => stub, apply: () => notConfigured() });

export const supabase: SupabaseClient = client ?? (stub as SupabaseClient);
