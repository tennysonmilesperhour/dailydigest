"use client";

import { SEPIA, rule, SectionHead, Btn } from "./ui";
import { PROTOCOLS } from "./content";

/* ========================== CLASSIFIEDS ========================== */
export function Protocols({ filter, clearFilter }) {
  const list = filter ? PROTOCOLS.filter((p) => p.id === filter) : PROTOCOLS;
  return (
    <>
      <div style={{ textAlign: "center", margin: "30px 0 4px" }}>
        <SectionHead>Classifieds · Protocols & Remedies</SectionHead>
        <p style={{ fontStyle: "italic", fontSize: 14.5, margin: "-6px 0 10px" }}>
          Choose your course based on what the bowl reported.
        </p>
        {filter && (
          <Btn small onClick={clearFilter} style={{ marginBottom: 14 }}>← All Listings</Btn>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: filter ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {list.map((p) => (
          <div key={p.id} style={{ border: rule(1), padding: "16px 18px 18px", background: "rgba(255,255,255,0.25)" }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", margin: "0 0 2px", borderBottom: rule(1), paddingBottom: 8 }}>
              {p.name}
            </p>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, textAlign: "center", color: SEPIA, letterSpacing: "0.06em", margin: "6px 0 10px" }}>
              {p.target.toUpperCase()} · {p.days.toUpperCase()}
            </p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {p.steps.map((s, i) => (
                <li key={i} style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 6 }}>{s}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </>
  );
}
