import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey);
} else {
  // Helps you catch a missing .env.local before anything else breaks.
  console.warn(
    "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

/**
 * When the env vars are absent, `createClient("")` throws synchronously at import,
 * which used to crash `next build` (static prerender) and the browser on a
 * misconfigured deploy. Instead we hand back a proxy: importing never throws, and
 * any actual call rejects, which the storage layer catches and surfaces as the
 * "submissions are not saving" notice rather than a white screen.
 */
function notConfigured(): never {
  throw new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase: SupabaseClient =
  client ??
  (new Proxy({}, { get: () => () => notConfigured() }) as unknown as SupabaseClient);
