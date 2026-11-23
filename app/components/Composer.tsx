"use client";

import { useState, useRef } from "react";
import { createPost } from "../../lib/db";
import { INK, PAPER, SEPIA, RED, TYPE_META, Specimen, rule, Btn, inputStyle } from "./ui";


/* ---------- Image compression (returns a JPEG Blob for Storage upload) ---------- */
function compressImage(file): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 420;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), "image/jpeg", 0.62);
      };
      img.onerror = reject;
      img.src = e.target.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** The "Submit a Story" box: photograph or house plate, classification, note and circulation. */
export function Composer({ me, userId, onPosted, onError }) {
  const [imageBlob, setImageBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [type, setType] = useState(4);
  const [note, setNote] = useState("");
  const [posting, setPosting] = useState(false);
  const [mediaMode, setMediaMode] = useState("photo"); // "photo" | "plate"
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const blob = await compressImage(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImageBlob(blob); setPreviewUrl(URL.createObjectURL(blob));
    } catch { alert("That photograph could not be developed. Try another."); }
  };
  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageBlob(null); setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const usePlaceholder = mediaMode === "plate";

  const submit = async () => {
    if (!usePlaceholder && !imageBlob) return; // a photograph is required unless using the plate
    setPosting(true);
    const postedType = type;
    try {
      await createPost({ userId, type, note: note.trim(), visibility, usePlaceholder, imageBlob });
      clearImage(); setNote(""); setType(4); setMediaMode("photo"); setVisibility("private");
      await onPosted(postedType);
    } catch {
      onError("That dispatch would not file. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ border: rule(1), outline: `1px solid ${INK}`, outlineOffset: 3, padding: "20px 20px 22px", margin: "26px 0 8px" }}>
      <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 12px", color: RED, textAlign: "center" }}>
        Submit a Story · Byline: {me}
      </p>

      {/* Choose how the story is illustrated: a real photograph, or the house plate. */}
      <div style={{ display: "flex", border: rule(1), marginBottom: 12 }}>
        {[["photo", "Photograph"], ["plate", "Use the Illustrated Plate"]].map(([mode, label], i) => (
          <button key={mode} onClick={() => setMediaMode(mode)} style={{
            flex: 1, padding: "9px 10px", cursor: "pointer", background: mediaMode === mode ? INK : "transparent",
            color: mediaMode === mode ? PAPER : INK, border: "none", borderLeft: i > 0 ? rule(1) : "none",
            fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          }}>{label}</button>
        ))}
      </div>

      {mediaMode === "photo" ? (
        !previewUrl ? (
          <button onClick={() => fileRef.current?.click()} style={{
            width: "100%", padding: "30px 14px", background: "rgba(255,255,255,0.35)",
            border: `1px dashed ${INK}`, cursor: "pointer", fontFamily: "'Old Standard TT', serif",
            fontStyle: "italic", fontSize: 15, color: INK,
          }}>
            Attach photographic evidence †
          </button>
        ) : (
          <div style={{ position: "relative", marginBottom: 4 }}>
            <img src={previewUrl} alt="Evidence, awaiting publication" style={{ width: "100%", display: "block", border: rule(1), filter: "sepia(0.15) contrast(1.02)" }} />
            <button onClick={clearImage}
              style={{ position: "absolute", top: 8, right: 8, background: PAPER, border: rule(1), padding: "3px 9px", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: 12 }}>KILL</button>
          </div>
        )
      ) : (
        <div style={{ border: `1px dashed ${INK}`, background: "rgba(255,255,255,0.35)", padding: "18px 14px", textAlign: "center" }}>
          <div style={{ display: "inline-block", border: rule(1), padding: 8, background: "rgba(255,255,255,0.4)" }}>
            <Specimen type={type} size={120} />
          </div>
          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, color: SEPIA, letterSpacing: "0.06em", margin: "10px 0 0" }}>
            THE HOUSE PLATE FOR TYPE {type} · NO PHOTOGRAPH NEEDED
          </p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: 10, margin: "14px 0", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>Classification</label>
        <select value={type} onChange={(e) => setType(Number(e.target.value))} style={{ ...inputStyle, flex: 1, minWidth: 200, width: "auto" }}>
          {Object.entries(TYPE_META).map(([n, m]) => <option key={n} value={n}>Type {n} · {m.label}</option>)}
        </select>
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
        placeholder="Statement to the press: what was consumed, how the correspondent feels, any regrets..."
        style={{ ...inputStyle, resize: "vertical", marginBottom: 14 }} />

      {/* Who gets to read it. Private stays on your desk; public runs for everyone. */}
      <div style={{ display: "flex", gap: 10, margin: "0 0 14px", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>Circulation</label>
        <div style={{ display: "flex", border: rule(1), flex: 1, minWidth: 200 }}>
          {[["public", "Public"], ["private", "Private"]].map(([v, label], i) => (
            <button key={v} onClick={() => setVisibility(v as "public" | "private")} style={{
              flex: 1, padding: "8px 10px", cursor: "pointer", background: visibility === v ? INK : "transparent",
              color: visibility === v ? PAPER : INK, border: "none", borderLeft: i > 0 ? rule(1) : "none",
              fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
            }}>{label}</button>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: SEPIA, letterSpacing: "0.04em", margin: "-8px 0 14px", textAlign: "center" }}>
        {visibility === "private" ? "Private: only you will see this in the feed. You can make it public later." : "Public: every reader of the paper can see this."}
      </p>

      <div style={{ textAlign: "center" }}>
        <Btn primary onClick={submit} disabled={(mediaMode === "photo" && !imageBlob) || posting} style={{ minWidth: 220 }}>
          {posting ? "Going to press..." : "Run It on the Front Page"}
        </Btn>
      </div>
    </div>
  );
}
