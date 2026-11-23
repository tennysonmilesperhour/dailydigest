"use client";

import { SEPIA, RED, FAINT, TYPE_META, Specimen, rule, SectionHead } from "./ui";
import { GUIDE, COLOR_NOTES } from "./content";


export function Guide({ jump }) {
  return (
    <>
      <div style={{ textAlign: "center", margin: "30px 0 6px" }}>
        <SectionHead>The Illustrated Field Guide</SectionHead>
        <p style={{ fontStyle: "italic", fontSize: 14.5, margin: "-6px auto 8px", maxWidth: 440, lineHeight: 1.6 }}>
          Seven known species of specimen, rendered by our staff illustrator. Learn them by sight. Fig. 4 remains the trophy.
        </p>
      </div>

      {GUIDE.map((g) => {
        const meta = TYPE_META[g.type];
        return (
          <article key={g.type} style={{ borderTop: rule(1), padding: "22px 0", display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            <figure style={{ margin: 0, flexShrink: 0, textAlign: "center" }}>
              <div style={{ border: rule(1), padding: 8, background: "rgba(255,255,255,0.3)" }}>
                <Specimen type={g.type} />
              </div>
              <figcaption style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, marginTop: 5, letterSpacing: "0.08em" }}>FIG. {g.type}.</figcaption>
            </figure>
            <div style={{ flex: 1, minWidth: 230 }}>
              <h3 style={{ fontFamily: "'Old Standard TT', serif", fontWeight: 700, fontSize: 21, margin: "0 0 2px" }}>
                {meta.label}
              </h3>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: "0.24em", textTransform: "uppercase", color: g.type === 4 ? "#3E6B45" : RED, margin: "0 0 8px" }}>
                Bristol Type {g.type} · {meta.status}
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "0 0 6px" }}>{g.means}</p>
              <p style={{ fontSize: 13.5, fontStyle: "italic", color: SEPIA, margin: "0 0 10px" }}>Editor's note: {g.flags}</p>
              <button onClick={() => jump(g.protocol)} style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                color: RED, textDecoration: "underline", textUnderlineOffset: 4,
              }}>Matching Classified →</button>
            </div>
          </article>
        );
      })}

      <SectionHead>The Color Report</SectionHead>
      <div style={{ border: rule(1), padding: "18px 20px", marginBottom: 10 }}>
        {COLOR_NOTES.map((c, i) => (
          <div key={c.name} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "8px 0", borderTop: i > 0 ? `1px solid ${FAINT}` : "none" }}>
            <span style={{ width: 16, height: 16, background: c.c, border: rule(1), flexShrink: 0, transform: "translateY(2px)" }} />
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>
              <span style={{ fontWeight: 700 }}>{c.name}.</span> {c.note}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
