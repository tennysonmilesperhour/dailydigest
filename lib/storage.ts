import { supabase } from "./supabaseClient";

/**
 * Drop-in replacement for the Claude artifact `window.storage` API.
 *
 * Interface kept identical so the ported component needs no changes:
 *   storage.get(key, shared)  -> { key, value } | null
 *   storage.set(key, value, shared)
 *
 * Model:
 *   shared === true   -> one global row in `kv_store`, keyed by `key`.
 *                        This is the friends-wide feed. Everyone reads/writes it.
 *   shared === false  -> per-device value stored in localStorage (byline, snake best).
 *                        These are personal and never need to sync across people.
 */

type KV = { key: string; value: string } | null;

async function getShared(key: string): Promise<KV> {
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { key, value: data.value as string };
}

async function setShared(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

function getLocal(key: string): KV {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(key);
  return v === null ? null : { key, value: v };
}

function setLocal(key: string, value: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export const storage = {
  async get(key: string, shared = false): Promise<KV> {
    return shared ? getShared(key) : getLocal(key);
  },
  async set(key: string, value: string, shared = false): Promise<void> {
    if (shared) return setShared(key, value);
    return setLocal(key, value);
  },
};
