"use client";

import { useState, useEffect } from "react";
import { fetchFeed, setPostVisibility, toggleReaction, addComment } from "../../lib/db";
import { SEPIA, RED, SectionHead } from "./ui";
import { Composer } from "./Composer";
import { Post } from "./Post";

/** The front page: the composer, then every dispatch with its reactions and letters. */
export function Feed({ me, userId, jump, onGoldenSnake }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});

  const load = async () => {
    try { setPosts(await fetchFeed()); setError(""); }
    catch { setError("Could not reach the presses. Check the wire and try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    // Renew five-minute photo links while reading and refresh on returning.
    const refresh = () => { if (!document.hidden) load(); };
    const timer = window.setInterval(refresh, 240_000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);

  const toggleVisibility = async (p) => {
    const next = p.visibility === "private" ? "public" : "private";
    try { await setPostVisibility(p.id, next); await load(); } catch { setError("Could not change circulation."); }
  };

  const react = async (p, emoji) => {
    const mine = (p.reactions || []).some((r) => r.emoji === emoji && r.user_id === userId);
    try { await toggleReaction(p.id, userId, emoji, !mine); await load(); } catch {}
  };

  const comment = async (p) => {
    const text = (commentDrafts[p.id] || "").trim();
    if (!text) return;
    setCommentDrafts((d) => ({ ...d, [p.id]: "" }));
    try { await addComment(p.id, userId, text); await load(); } catch { setError("Your letter would not print."); }
  };

  return (
    <>
      <Composer me={me} userId={userId} onError={setError} onPosted={async (postedType) => { await load(); if (postedType === 4) onGoldenSnake(); }} />

      {error && (
        <p style={{ textAlign: "center", fontFamily: "'Courier Prime', monospace", fontSize: 11.5, color: RED, margin: "12px 0 0" }}>{error}</p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "28px 0 0" }}>
        <SectionHead>Latest Dispatches</SectionHead>
      </div>
      <div style={{ textAlign: "center", marginTop: -8, marginBottom: 18 }}>
        <button onClick={load} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.1em", color: SEPIA }}>
          ↻ CHECK THE WIRE
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", fontStyle: "italic" }}>The presses are warming up...</p>}
      {!loading && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 0 10px" }}>
          <p style={{ fontFamily: "'Old Standard TT', serif", fontSize: 22, margin: 0 }}>Nothing to Report.</p>
          <p style={{ fontStyle: "italic", fontSize: 14, color: SEPIA, margin: "6px 0 0" }}>A slow news day at the bowl. Someone must go first.</p>
        </div>
      )}

      {posts.map((p, idx) => (
        <Post key={p.id} p={p} idx={idx} userId={userId} jump={jump}
          commentDraft={commentDrafts[p.id]}
          onCommentDraft={(text) => setCommentDrafts((d) => ({ ...d, [p.id]: text }))}
          onToggleVisibility={toggleVisibility} onReact={react} onComment={comment} />
      ))}
    </>
  );
}
