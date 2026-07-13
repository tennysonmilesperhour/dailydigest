import { storage } from "./storage";

/**
 * Lightweight account layer for The Daily Dump.
 *
 * Trust model (read this before trusting "private"):
 *   There is no password yet. Logging in means claiming a byline — anyone who
 *   types a username becomes that user. Accounts and posts live in the shared
 *   Supabase `kv_store`, which the anon key can read. "Private" posts are hidden
 *   from the rendered feed for everyone but their author, but they are NOT
 *   cryptographically secret. For a small trusted friend group that's the point;
 *   flip PASSWORD_REQUIRED on (and wire up Supabase Auth + RLS) when it grows.
 *
 * Storage:
 *   ACCOUNTS_KEY  -> shared registry of every account (so a byline is recognized
 *                    on any device, and posts follow the account across sessions).
 *   SESSION_KEY   -> this device's currently signed-in username (localStorage).
 */

// Passwords are intentionally off for now. Set this to true and start writing
// `password` on the Account below to require them later — login() already reads it.
export const PASSWORD_REQUIRED = false;

const ACCOUNTS_KEY = "sp-accounts-v1";
const SESSION_KEY = "sp-session-v1";
const MAX_NAME = 24;

export type Account = {
  username: string; // the display form the user typed (preserves their casing)
  createdAt: number;
  // password?: string; // reserved for when PASSWORD_REQUIRED is turned on
};

type AccountMap = Record<string, Account>; // keyed by username.toLowerCase()

export type LoginResult = { ok: boolean; username?: string; error?: string };

export async function loadAccounts(): Promise<AccountMap> {
  try {
    const r = await storage.get(ACCOUNTS_KEY, true);
    return r ? (JSON.parse(r.value) as AccountMap) : {};
  } catch {
    return {};
  }
}

async function saveAccounts(map: AccountMap): Promise<boolean> {
  try {
    await storage.set(ACCOUNTS_KEY, JSON.stringify(map), true);
    return true;
  } catch {
    return false;
  }
}

/**
 * Log in with a username. Registers the account on first use. No password today.
 * `password` is accepted so the call site never has to change when PASSWORD_REQUIRED flips.
 */
export async function login(rawUsername: string, password?: string): Promise<LoginResult> {
  const username = (rawUsername || "").trim().slice(0, MAX_NAME);
  if (!username) return { ok: false, error: "Enter a byline to sign in." };

  const key = username.toLowerCase();
  const accounts = await loadAccounts();
  const existing = accounts[key];

  if (PASSWORD_REQUIRED) {
    // Placeholder for the future: verify or set a password here.
    if (existing && (existing as any).password && (existing as any).password !== password) {
      return { ok: false, error: "That byline is spoken for." };
    }
  }

  if (!existing) {
    accounts[key] = { username, createdAt: Date.now() };
    const ok = await saveAccounts(accounts);
    if (!ok) return { ok: false, error: "Could not reach the presses. Try again." };
  }

  const canonical = accounts[key].username;
  await setSession(canonical);
  return { ok: true, username: canonical };
}

export async function getSession(): Promise<string> {
  try {
    const r = await storage.get(SESSION_KEY, false);
    return r ? r.value : "";
  } catch {
    return "";
  }
}

export async function setSession(username: string): Promise<void> {
  try {
    await storage.set(SESSION_KEY, username, false);
  } catch {
    /* localStorage unavailable — session just won't persist this device */
  }
}

export async function logout(): Promise<void> {
  await setSession("");
}
