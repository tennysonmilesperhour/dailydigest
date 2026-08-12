import { supabase, isSupabaseConfigured } from "./supabaseClient";

export { isSupabaseConfigured };

export type Profile = { id: string; byline: string };

/** Current signed-in user id from the locally persisted session (no network). */
export async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Subscribe to sign-in/sign-out. Returns an unsubscribe function. */
export function onAuthChange(cb: (userId: string | null) => void): () => void {
  try {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      cb(session?.user?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  } catch {
    return () => {};
  }
}

/** Passwordless sign-in: emails a magic link that returns the user to this origin. */
export async function sendMagicLink(email: string): Promise<void> {
  const clean = (email || "").trim();
  if (!clean) throw new Error("Enter your email.");
  const emailRedirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await supabase.auth.signInWithOtp({ email: clean, options: { emailRedirectTo } });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    /* nothing signed in / offline */
  }
}

/** The signed-in user's profile (byline), or null if they haven't set one yet. */
export async function getMyProfile(): Promise<Profile | null> {
  try {
    const uid = await getUserId();
    if (!uid) return null;
    const { data } = await supabase
      .from("profiles")
      .select("id,byline")
      .eq("id", uid)
      .maybeSingle();
    return (data as Profile) ?? null;
  } catch {
    return null;
  }
}

/** Create or update the signed-in user's byline. */
export async function setMyByline(byline: string): Promise<Profile> {
  const uid = await getUserId();
  if (!uid) throw new Error("Not signed in.");
  const clean = (byline || "").trim().slice(0, 24);
  if (!clean) throw new Error("Enter a byline.");
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: uid, byline: clean })
    .select("id,byline")
    .single();
  if (error) throw error;
  return data as Profile;
}
