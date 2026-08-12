import { supabase } from "./supabaseClient";

/**
 * Data layer for the feed. Every read is filtered by Row Level Security in the
 * database (see supabase.sql), so private posts — and their reactions, comments,
 * and photos — never reach a reader who isn't the author. The client does not
 * filter by visibility itself; it only renders what RLS returns.
 */

const BUCKET = "evidence";
const FEED_LIMIT = 100;

export type FeedPost = {
  id: string;
  author_id: string;
  type: number;
  note: string | null;
  image_path: string | null;
  use_placeholder: boolean;
  visibility: "public" | "private";
  created_at: string;
  author: { byline: string } | null;
  reactions: { emoji: string; user_id: string }[];
  comments: { id: string; text: string; created_at: string; author: { byline: string } | null }[];
  imageUrl: string | null; // resolved signed URL, or null
};

const SELECT = `
  id, author_id, type, note, image_path, use_placeholder, visibility, created_at,
  author:profiles(byline),
  reactions(emoji,user_id),
  comments(id,text,created_at,author:profiles(byline))
`;

export async function fetchFeed(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);
  if (error) throw error;
  const posts = (data as any[]) || [];

  // Resolve short-lived signed URLs for photos (RLS-gated at signing time).
  const paths = posts.map((p) => p.image_path).filter(Boolean) as string[];
  const signed: Record<string, string> = {};
  if (paths.length) {
    const { data: urls } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    (urls || []).forEach((u: any) => {
      if (u?.path && u?.signedUrl) signed[u.path] = u.signedUrl;
    });
  }

  return posts.map((p) => ({
    ...p,
    comments: (p.comments || []).slice().sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)),
    imageUrl: p.image_path ? signed[p.image_path] ?? null : null,
  })) as FeedPost[];
}

export async function createPost(opts: {
  userId: string;
  type: number;
  note: string;
  visibility: "public" | "private";
  usePlaceholder: boolean;
  imageBlob: Blob | null;
}): Promise<void> {
  let image_path: string | null = null;
  if (!opts.usePlaceholder && opts.imageBlob) {
    const fileId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    image_path = `${opts.userId}/${fileId}.jpg`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(image_path, opts.imageBlob, { contentType: "image/jpeg", upsert: false });
    if (upErr) throw upErr;
  }
  const { error } = await supabase.from("posts").insert({
    author_id: opts.userId,
    type: opts.type,
    note: opts.note ? opts.note.slice(0, 240) : null,
    visibility: opts.visibility,
    use_placeholder: opts.usePlaceholder,
    image_path,
  });
  if (error) throw error;
}

export async function setPostVisibility(postId: string, visibility: "public" | "private"): Promise<void> {
  const { error } = await supabase.from("posts").update({ visibility }).eq("id", postId);
  if (error) throw error;
}

export async function toggleReaction(postId: string, userId: string, emoji: string, on: boolean): Promise<void> {
  if (on) {
    const { error } = await supabase.from("reactions").insert({ post_id: postId, user_id: userId, emoji });
    if (error && error.code !== "23505") throw error; // 23505 = already reacted, ignore
  } else {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .match({ post_id: postId, user_id: userId, emoji });
    if (error) throw error;
  }
}

export async function addComment(postId: string, userId: string, text: string): Promise<void> {
  const clean = text.trim().slice(0, 300);
  if (!clean) return;
  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: userId, text: clean });
  if (error) throw error;
}
