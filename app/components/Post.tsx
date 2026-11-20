"use client";

import { INK, PAPER_DK, SEPIA, RED, FAINT, TYPE_META, Specimen, timeAgo, REACTIONS, rule, Stamp, Btn, inputStyle } from "./ui";
import { GUIDE } from "./content";

/** One dispatch in the feed: headline, evidence, note, reactions and letters to the editor. */
export function Post({ p, idx, userId, jump, commentDraft, onCommentDraft, onToggleVisibility, onReact, onComment }) {
  const reactionCounts = (p) => {
    const counts = {};
    (p.reactions || []).forEach((r) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
    return counts;
  };
  const iReacted = (p, emoji) => (p.reactions || []).some((r) => r.emoji === emoji && r.user_id === userId);
  const isMine = (p) => p.author_id === userId;

  const meta = TYPE_META[p.type] || TYPE_META[4];
  const counts = reactionCounts(p);
  const priv = p.visibility === "private";
  const author = p.author?.byline || "Anonymous";
  return (
    <article style={{ borderTop: idx === 0 ? "none" : rule(1), padding: "24px 0 26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: "'Old Standard TT', serif", fontWeight: 700, fontSize: "clamp(21px, 4.6vw, 27px)", lineHeight: 1.15, margin: "0 0 6px" }}>
            Type {p.type} Reported: {meta.label}
          </h3>
          <p style={{ margin: 0, fontFamily: "'Courier Prime', monospace", fontSize: 11.5, letterSpacing: "0.06em" }}>
            By <span style={{ fontWeight: 700 }}>{author.toUpperCase()}</span>, Staff Correspondent · {timeAgo(new Date(p.created_at).getTime())}
          </p>
          {priv && (
            <p style={{ margin: "4px 0 0", fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: RED }}>
              ● Private · Not Circulated
            </p>
          )}
        </div>
        <Stamp rotate={p.type === 4 ? -6 : 4} color={p.type === 7 ? RED : p.type === 4 ? "#3E6B45" : RED} style={{ flexShrink: 0, marginTop: 4 }}>
          {meta.status}
        </Stamp>
      </div>

      {p.imageUrl ? (
        <figure style={{ margin: "14px 0 4px" }}>
          <img src={p.imageUrl} alt={`Type ${p.type} evidence filed by ${author}`}
            style={{ width: "100%", display: "block", border: rule(1), filter: "sepia(0.18) contrast(1.03)" }} />
          <figcaption style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, color: SEPIA, marginTop: 5, letterSpacing: "0.04em" }}>
            PHOTOGRAPHIC EVIDENCE · SUBMITTED BY THE CORRESPONDENT · UNRETOUCHED
          </figcaption>
        </figure>
      ) : (
        <figure style={{ margin: "14px 0 4px" }}>
          <div style={{ border: rule(1), background: "rgba(255,255,255,0.3)", padding: "22px 0", display: "flex", justifyContent: "center" }}>
            <Specimen type={TYPE_META[p.type] ? p.type : 4} size={150} />
          </div>
          <figcaption style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, color: SEPIA, marginTop: 5, letterSpacing: "0.04em" }}>
            ILLUSTRATED PLATE · NO PHOTOGRAPH ON FILE · RENDERED BY OUR STAFF ARTIST
          </figcaption>
        </figure>
      )}

      {p.note && (
        <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "12px 0 4px" }}>
          <span style={{ float: "left", fontFamily: "'UnifrakturMaguntia', serif", fontSize: 44, lineHeight: 0.8, paddingRight: 8, paddingTop: 6 }}>
            {p.note.charAt(0)}
          </span>
          {p.note.slice(1)}
        </p>
      )}

      <button onClick={() => jump(GUIDE.find((g) => g.type === p.type)?.protocol)} style={{
        background: "none", border: "none", cursor: "pointer", padding: 0, margin: "10px 0 12px", clear: "both", display: "block",
        fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: RED, textDecoration: "underline", textUnderlineOffset: 4,
      }}>
        See Classified Remedy for Type {p.type} →
      </button>

      {isMine(p) && (
        <button onClick={() => onToggleVisibility(p)} style={{
          background: "none", border: rule(1), cursor: "pointer", padding: "5px 12px", margin: "0 0 12px", display: "inline-block",
          fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: INK,
        }}>
          {priv ? "↑ Make Public" : "↓ Make Private"}
        </button>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {REACTIONS.map((e) => (
          <button key={e} onClick={() => onReact(p, e)} style={{
            border: rule(1), background: iReacted(p, e) ? PAPER_DK : "transparent", cursor: "pointer",
            padding: "5px 12px", fontSize: 14, fontFamily: "'Courier Prime', monospace",
          }}>
            {e}{counts[e] ? ` ${counts[e]}` : ""}
          </button>
        ))}
      </div>

      {(p.comments || []).length > 0 && (
        <div style={{ margin: "16px 0 0", paddingLeft: 16, borderLeft: `3px solid ${FAINT}` }}>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: SEPIA, margin: "0 0 8px" }}>Letters to the Editor</p>
          {p.comments.map((c) => (
            <p key={c.id} style={{ margin: "0 0 7px", fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>{c.author?.byline || "Anonymous"}:</span> <span style={{ fontStyle: "italic" }}>"{c.text}"</span>
            </p>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input value={commentDraft || ""} onChange={(e) => onCommentDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onComment(p)} placeholder="Write to the editor..."
          style={{ ...inputStyle, fontSize: 13.5, padding: "8px 12px" }} />
        <Btn small onClick={() => onComment(p)}>Print It</Btn>
      </div>
    </article>
  );
}
