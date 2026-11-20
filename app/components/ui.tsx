// Shared look of the paper: ink and paper colors, the Bristol plates and the small UI atoms.

export const INK = "#241C14";
export const PAPER = "#F3ECDC";
export const PAPER_DK = "#EAE1CC";
export const SEPIA = "#83694A";
export const RED = "#A63325";
export const FAINT = "rgba(36,28,20,0.14)";

export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

export const TYPE_META = {
  1: { label: "Rabbit Pellets", tone: "#6B4A26", status: "Backed Up" },
  2: { label: "The Lumpy Log", tone: "#5F4123", status: "Sluggish" },
  3: { label: "Cracked Classic", tone: "#54391E", status: "Nearly There" },
  4: { label: "The Golden Snake", tone: "#47301A", status: "Front Page Material" },
  5: { label: "Soft Serve Blobs", tone: "#6E5330", status: "Running Loose" },
  6: { label: "Mushy Business", tone: "#7B5E38", status: "Gut In Dispute" },
  7: { label: "The Flood", tone: "#8A7048", status: "State of Emergency" },
};

/* ---------- Illustrated plates, Bristol types 1-7 ---------- */
export function Specimen({ type, size = 88 }) {
  if (!TYPE_META[type]) type = 4; // guard against stored/invalid types
  const t = TYPE_META[type].tone;
  const face = (x, y, mood) => (
    <g>
      <circle cx={x - 5} cy={y} r={1.7} fill={PAPER} />
      <circle cx={x + 5} cy={y} r={1.7} fill={PAPER} />
      {mood === "happy" && <path d={`M ${x - 5} ${y + 6} Q ${x} ${y + 11} ${x + 5} ${y + 6}`} stroke={PAPER} strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      {mood === "flat" && <line x1={x - 4} y1={y + 7} x2={x + 4} y2={y + 7} stroke={PAPER} strokeWidth="1.6" strokeLinecap="round" />}
      {mood === "strain" && <path d={`M ${x - 5} ${y + 9} Q ${x} ${y + 4} ${x + 5} ${y + 9}`} stroke={PAPER} strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      {mood === "wavy" && <path d={`M ${x - 6} ${y + 7} q 3 -3 6 0 q 3 3 6 0`} stroke={PAPER} strokeWidth="1.5" fill="none" strokeLinecap="round" />}
    </g>
  );
  const shapes = {
    1: (<g><circle cx="28" cy="34" r="11" fill={t} /><circle cx="56" cy="26" r="10" fill={t} /><circle cx="70" cy="52" r="11" fill={t} /><circle cx="40" cy="62" r="10" fill={t} />{face(56, 24, "strain")}</g>),
    2: (<g><path d="M14 48 q6 -18 22 -16 q8 -12 22 -6 q16 -4 22 10 q10 8 2 20 q-4 14 -22 12 q-14 8 -26 0 q-18 2 -20 -20 z" fill={t} />{face(48, 42, "strain")}</g>),
    3: (<g><rect x="10" y="30" width="72" height="30" rx="15" fill={t} /><path d="M26 32 l4 8 M44 58 l4 -8 M62 32 l4 8" stroke={PAPER} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />{face(46, 42, "flat")}</g>),
    4: (<g><path d="M12 56 q0 -22 24 -22 l 24 0 q22 0 22 20 q0 8 -8 8 l-46 0 q-16 0 -16 -6 z" fill={t} /><path d="M20 40 q10 -6 24 -6" stroke={PAPER} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.4" />{face(58, 46, "happy")}<path d="M70 30 l3 -6 M78 34 l6 -3" stroke={t} strokeWidth="2.4" strokeLinecap="round" /></g>),
    5: (<g><ellipse cx="30" cy="36" rx="15" ry="11" fill={t} /><ellipse cx="62" cy="42" rx="13" ry="10" fill={t} /><ellipse cx="44" cy="62" rx="14" ry="10" fill={t} />{face(30, 34, "flat")}</g>),
    6: (<g><path d="M16 50 q-4 -14 12 -14 q2 -12 16 -8 q10 -10 20 -2 q14 -2 14 12 q10 6 2 16 q0 12 -16 10 q-8 8 -18 2 q-12 6 -18 -4 q-14 0 -12 -12 z" fill={t} />{face(46, 44, "wavy")}</g>),
    7: (<g><path d="M10 58 q10 -10 22 -4 q8 -12 22 -6 q12 -8 22 2 q10 4 8 12 q-2 8 -14 8 l-50 0 q-12 0 -10 -12 z" fill={t} opacity="0.85" /><path d="M30 34 q2 -8 6 -10 M52 30 q0 -8 5 -12 M70 36 q3 -7 8 -9" stroke={t} strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.6" />{face(48, 58, "wavy")}</g>),
  };
  return <svg width={size} height={size} viewBox="0 0 92 84" aria-label={`Fig. ${type}, Bristol type ${type}`}>{shapes[type]}</svg>;
}

export const timeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min. ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr. ago`;
  return `${Math.floor(h / 24)} days ago`;
};

export const REACTIONS = ["💩", "🔥", "👏", "😬", "🚽"];
export const todayLine = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();


/* ---------- Shared UI atoms ---------- */
export const rule = (w = 1) => `${w}px solid ${INK}`;
export const doubleRule = { borderTop: rule(1), borderBottom: rule(3), height: 3, margin: "0 0 2px" };

export function SectionHead({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "34px 0 18px" }}>
      <span style={{ flex: 1, borderTop: rule(1) }} />
      <h2 style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 15, letterSpacing: "0.28em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</h2>
      <span style={{ flex: 1, borderTop: rule(1) }} />
    </div>
  );
}

export function Stamp({ children, color = RED, rotate = -4, style }) {
  return (
    <span style={{
      display: "inline-block", border: `2px solid ${color}`, color, borderRadius: 3,
      padding: "3px 10px", fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 11,
      letterSpacing: "0.18em", textTransform: "uppercase", transform: `rotate(${rotate}deg)`,
      opacity: 0.88, mixBlendMode: "multiply", ...style,
    }}>{children}</span>
  );
}

export function Btn({ children, onClick, disabled, primary, small, style }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: "'Oswald', sans-serif", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase",
      fontSize: small ? 11 : 13, padding: small ? "7px 14px" : "12px 22px",
      background: disabled ? PAPER_DK : primary ? INK : "transparent",
      color: disabled ? SEPIA : primary ? PAPER : INK,
      border: rule(1), cursor: disabled ? "default" : "pointer", ...style,
    }}>{children}</button>
  );
}

export const inputStyle = {
  width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.45)",
  border: rule(1), fontFamily: "'Old Standard TT', serif", fontSize: 15, color: INK,
};
