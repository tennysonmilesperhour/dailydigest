"use client";

import { useState, useEffect, useRef } from "react";
import { storage } from "../lib/storage";

/* ==============================================================
   THE DAILY DUMP · All the News That's Fit to Flush
   A broadsheet for the bowels. Feed + Field Guide + Classifieds
   ============================================================== */

const INK = "#241C14";
const PAPER = "#F3ECDC";
const PAPER_DK = "#EAE1CC";
const SEPIA = "#83694A";
const RED = "#A63325";
const FAINT = "rgba(36,28,20,0.14)";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

const TYPE_META = {
  1: { label: "Rabbit Pellets", tone: "#6B4A26", status: "Backed Up" },
  2: { label: "The Lumpy Log", tone: "#5F4123", status: "Sluggish" },
  3: { label: "Cracked Classic", tone: "#54391E", status: "Nearly There" },
  4: { label: "The Golden Snake", tone: "#47301A", status: "Front Page Material" },
  5: { label: "Soft Serve Blobs", tone: "#6E5330", status: "Running Loose" },
  6: { label: "Mushy Business", tone: "#7B5E38", status: "Gut In Dispute" },
  7: { label: "The Flood", tone: "#8A7048", status: "State of Emergency" },
};

/* ---------- Illustrated plates, Bristol types 1-7 ---------- */
function Specimen({ type, size = 88 }) {
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

/* ---------- Field guide ---------- */
const GUIDE = [
  { type: 1, means: "Hard separate lumps signaling long transit time. The usual culprits: dehydration, low fiber, or stress clamping the system shut.", flags: "Regular straining warrants the Plumber's Protocol.", protocol: "plumber" },
  { type: 2, means: "Lumpy and compacted. Mild constipation. Fiber and water are running behind schedule.", flags: "Same remedy as Type 1, applied with less urgency.", protocol: "plumber" },
  { type: 3, means: "A sausage bearing surface cracks. Functional but dry. The subject stands one water bottle from greatness.", flags: "Raise hydration, hold everything else steady.", protocol: "hydration" },
  { type: 4, means: "Smooth, soft, serpentine. The gold standard. Gut flora thriving, transit time ideal. Suitable for framing.", flags: "Maintain the regimen. Pride is permitted.", protocol: "maintain" },
  { type: 5, means: "Soft blobs with defined edges. Passage adequate but hasty. Frequently a shortage of soluble fiber.", flags: "Add oats, chia, cooked vegetables. Audit the caffeine.", protocol: "soluble" },
  { type: 6, means: "Fluffy, ragged, mushy. Rapid transit. May indicate irritation, a food sensitivity, stress, or a passing bug.", flags: "Two consecutive days demands the Gut Reset.", protocol: "reset" },
  { type: 7, means: "Entirely liquid. Nothing absorbed. Acute irritation, infection, or an emergency evacuation of last night's decisions.", flags: "Hydrate aggressively. Past 48 hours, or with fever or blood, consult a physician rather than this publication.", protocol: "flood" },
];

const COLOR_NOTES = [
  { c: "#47301A", name: "Brown", note: "Normal. The bile has done its duty." },
  { c: "#4E5A2C", name: "Green", note: "Fast transit or an abundance of leafy greens. Rarely cause for alarm." },
  { c: "#B08A3A", name: "Yellow, greasy", note: "Possible fat malabsorption. Recurring cases merit a physician." },
  { c: "#17130E", name: "Black, tarry", note: "Iron supplements may be responsible. Otherwise, see a doctor promptly." },
  { c: "#77241D", name: "Red streaks", note: "Beets are innocent until proven guilty. Blood is not. When in doubt, get checked." },
];

/* ---------- Classifieds (protocols) ---------- */
const PROTOCOLS = [
  { id: "plumber", name: "The Plumber's Protocol", target: "For Types 1 & 2", days: "Runs 5 to 7 days",
    steps: ["16 to 24 oz water within 30 minutes of waking, pinch of salt or electrolytes added", "2 kiwis or 4 to 5 prunes daily. Both outperform psyllium in constipation trials.", "Fiber ladder: add 5g per day until reaching 30 to 35g. Slow ramp spares the bloat.", "Magnesium citrate, 200 to 400mg, taken in the evening", "10 to 15 minute walk following the largest meal", "Feet on a stool during proceedings. Knees above hips. Physics is undefeated."] },
  { id: "hydration", name: "Hydration Bump", target: "For Type 3", days: "Runs 3 days",
    steps: ["Add 20 to 30 oz water to current daily intake", "One electrolyte serving mid-day for proper absorption", "Alcohol halved. Caffeine ends at noon.", "One water-dense food per meal: cucumber, melon, soup, citrus"] },
  { id: "maintain", name: "Golden Snake Maintenance", target: "For Type 4", days: "Runs indefinitely",
    steps: ["30+ distinct plants weekly. Diversity feeds diverse bacteria.", "One fermented food daily: kefir, kimchi, sauerkraut, yogurt", "Fiber held at 30g+, protein kept consistent", "Publish your Type 4s on the front page. Assert dominance."] },
  { id: "soluble", name: "Soluble Fiber Stack", target: "For Type 5", days: "Runs 7 days",
    steps: ["Breakfast of oats or chia pudding. Soluble fiber gels and slows transit.", "Cooked vegetables in place of raw for the week", "Green banana or cooled rice daily for resistant starch", "Coffee capped at one cup. It speeds motility."] },
  { id: "reset", name: "The Gut Reset", target: "For Type 6", days: "Runs 5 to 10 days",
    steps: ["Simplify: cooked proteins, cooked vegetables, rice, bone broth. Boring by design.", "Suspend the usual suspects for 7 days: alcohol, fried food, artificial sweeteners, and dairy if under suspicion", "Keep a food and stool journal. Reintroduce one suspect every 2 to 3 days and watch the record.", "Ginger or peppermint tea after meals", "Sleep prioritized. Poor sleep alone can wreck motility."] },
  { id: "flood", name: "Flood Response", target: "For Type 7", days: "Runs 24 to 48 hours",
    steps: ["Electrolytes every few hours. Small sips beat chugging.", "Bananas, rice, applesauce, toast, plain crackers", "Dairy, fat, fiber, and caffeine suspended until conditions firm up", "Fermented foods reintroduced after 24 solid hours", "Fever, blood, severe pain, or 48+ hours without improvement: a doctor, immediately. This publication loves you but cannot prescribe."] },
  { id: "cleanse", name: "7-Day Whole Food Cleanse", target: "Open to all readers", days: "Runs 7 days",
    steps: ["No packaged food exceeding 5 ingredients", "Cruciferous vegetables daily for liver support", "2 to 3 liters of water, front-loaded in the morning", "One meal daily is a large salad or vegetable soup", "A daily sweat: walk, sauna, or training"] },
  { id: "fermentation", name: "Fermented Food Rotation", target: "For microbiome construction", days: "Runs 14 days",
    steps: ["Weekly rotation: kefir, kimchi, sauerkraut, miso, yogurt, kombucha, tempeh", "Newcomers start at 1 to 2 tbsp and ramp to full servings", "Paired with prebiotic fiber: garlic, onion, leeks, asparagus, oats", "Stool type logged daily. Expect gas in week one, improvement in week two."] },
];

/* ---------- Storage ---------- */
const FEED_KEY = "sp-feed-v1";
const ME_KEY = "sp-me-v1";
const MAX_POSTS = 30;

async function loadFeed() {
  try { const r = await storage.get(FEED_KEY, true); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
}
async function saveFeed(posts) {
  try { await storage.set(FEED_KEY, JSON.stringify(posts.slice(0, MAX_POSTS)), true); return true; }
  catch { return false; }
}

function compressImage(file) {
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
        resolve(cv.toDataURL("image/jpeg", 0.62));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const timeAgo = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min. ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr. ago`;
  return `${Math.floor(h / 24)} days ago`;
};

const REACTIONS = ["💩", "🔥", "👏", "😬", "🚽"];
const todayLine = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();

/* ---------- Shared UI atoms ---------- */
const rule = (w = 1) => `${w}px solid ${INK}`;
const doubleRule = { borderTop: rule(1), borderBottom: rule(3), height: 3, margin: "0 0 2px" };

function SectionHead({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "34px 0 18px" }}>
      <span style={{ flex: 1, borderTop: rule(1) }} />
      <h2 style={{ margin: 0, fontFamily: "'Oswald', sans-serif", fontWeight: 500, fontSize: 15, letterSpacing: "0.28em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</h2>
      <span style={{ flex: 1, borderTop: rule(1) }} />
    </div>
  );
}

function Stamp({ children, color = RED, rotate = -4, style }) {
  return (
    <span style={{
      display: "inline-block", border: `2px solid ${color}`, color, borderRadius: 3,
      padding: "3px 10px", fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 11,
      letterSpacing: "0.18em", textTransform: "uppercase", transform: `rotate(${rotate}deg)`,
      opacity: 0.88, mixBlendMode: "multiply", ...style,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, disabled, primary, small, style }) {
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

const inputStyle = {
  width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.45)",
  border: rule(1), fontFamily: "'Old Standard TT', serif", fontSize: 15, color: INK,
};

/* ============================ APP ============================ */
export default function App() {
  const [tab, setTab] = useState("feed");
  const [me, setMe] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [protoFilter, setProtoFilter] = useState(null);
  const [storageDown, setStorageDown] = useState(false);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await storage.get(ME_KEY, false); if (r) setMe(r.value); } catch {}
      setPosts(await loadFeed());
      setLoading(false);
    })();
  }, []);

  const saveName = async () => {
    const n = nameInput.trim().slice(0, 24);
    if (!n) return;
    setMe(n);
    try { await storage.set(ME_KEY, n, false); } catch { setStorageDown(true); }
  };

  const refresh = async () => setPosts(await loadFeed());
  const addPost = async (post) => {
    const latest = await loadFeed();
    const next = [post, ...latest].slice(0, MAX_POSTS);
    setPosts(next);
    const ok = await saveFeed(next);
    if (!ok) setStorageDown(true);
  };
  const mutatePost = async (id, fn) => {
    const latest = await loadFeed();
    const next = latest.map((p) => (p.id === id ? fn({ ...p }) : p));
    setPosts(next);
    const ok = await saveFeed(next);
    if (!ok) setStorageDown(true);
  };
  const jumpToProtocol = (pid) => { setProtoFilter(pid); setTab("protocols"); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: `${GRAIN}, radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.5), transparent 60%)`, color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;500;600&family=Courier+Prime:ital@0;1&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${RED}; outline-offset: 2px; }
        ::selection { background: ${RED}; color: ${PAPER}; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 18px 0", fontFamily: "'Old Standard TT', serif" }}>

        {/* Ear line */}
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.08em", padding: "4px 0" }}>
          <span>VOL. I · NO. 2</span>
          <span>PRICE: ONE FLUSH</span>
        </div>
        <div style={doubleRule} />

        {/* Masthead */}
        <header style={{ textAlign: "center", padding: "18px 0 10px" }}>
          <h1 style={{ fontFamily: "'UnifrakturMaguntia', serif", fontWeight: 400, fontSize: "clamp(44px, 10vw, 72px)", margin: 0, lineHeight: 1 }}>
            The Daily Dump
          </h1>
        </header>

        <div style={{ borderTop: rule(1), borderBottom: rule(1), padding: "5px 0", textAlign: "center", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.1em" }}>
          {todayLine()} · GUT CONDITIONS: VARIABLE
        </div>

        {storageDown && (
          <div style={{ border: `2px solid ${RED}`, margin: "10px 0 0", padding: "10px 14px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'Courier Prime', monospace", fontSize: 11.5, lineHeight: 1.6, color: RED, letterSpacing: "0.04em" }}>
              CORRECTION: SUBMISSIONS ARE NOT SAVING. If you are viewing this inside Claude, it must be published first. Open the published link to file reports that stick.
            </p>
          </div>
        )}

        {/* Section nav */}
        <nav style={{ display: "flex", justifyContent: "center", borderBottom: rule(3), marginBottom: 6 }}>
          {[["feed", "Front Page"], ["guide", "Field Guide"], ["protocols", "Classifieds"]].map(([id, label], i) => (
            <button key={id} onClick={() => { setTab(id); if (id !== "protocols") setProtoFilter(null); }} style={{
              background: "none", border: "none", borderLeft: i > 0 ? rule(1) : "none", cursor: "pointer",
              padding: "12px 14px 10px", fontFamily: "'Oswald', sans-serif", fontWeight: tab === id ? 600 : 400,
              fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap",
              color: tab === id ? RED : INK,
              borderBottom: tab === id ? `3px solid ${RED}` : "3px solid transparent",
              marginBottom: -3,
            }}>{label}</button>
          ))}
        </nav>

        <main style={{ paddingBottom: 40 }}>
          {tab === "feed" && (
            <Feed me={me} nameInput={nameInput} setNameInput={setNameInput} saveName={saveName}
              posts={posts} loading={loading} addPost={addPost} mutatePost={mutatePost} refresh={refresh} jump={jumpToProtocol}
              onGoldenSnake={() => setShowGame(true)} />
          )}
          {tab === "guide" && <Guide jump={jumpToProtocol} />}
          {tab === "protocols" && <Protocols filter={protoFilter} clearFilter={() => setProtoFilter(null)} />}
        </main>

        {/* Colophon */}
        <footer style={{ borderTop: rule(3), padding: "16px 0 44px", textAlign: "center" }}>          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, lineHeight: 1.7, color: SEPIA, maxWidth: 520, margin: "0 auto" }}>
            THE DAILY DUMP is published for laughs and loose wellness direction among friends and constitutes no medical advice whatsoever.
            Blood, black tarry stool, persistent changes, unexplained weight loss, or pain: consult an actual physician.
            All submissions are visible to every reader of this publication. Govern yourselves accordingly.
          </p>
        </footer>
      </div>

      {showGame && <PoopSnake onClose={() => setShowGame(false)} />}
    </div>
  );
}

/* ============================ FEED ============================ */
function Feed({ me, nameInput, setNameInput, saveName, posts, loading, addPost, mutatePost, refresh, jump, onGoldenSnake }) {
  const [imgData, setImgData] = useState(null);
  const [type, setType] = useState(4);
  const [note, setNote] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const fileRef = useRef(null);

  if (!me) {
    return (
      <div style={{ border: rule(1), outline: `1px solid ${INK}`, outlineOffset: 3, padding: "28px 24px", margin: "34px auto", maxWidth: 480, textAlign: "center" }}>
        <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 8px", color: RED }}>Public Notice</p>
        <h2 style={{ fontFamily: "'Old Standard TT', serif", fontSize: 26, margin: "0 0 8px" }}>Correspondents Wanted</h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "0 0 18px", fontStyle: "italic" }}>
          Every report needs a byline. Choose yours. Note that all submissions run in full public view of every reader.
        </p>
        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveName()}
          placeholder="The LogFather, Scoop Dogg, Editor-in-Relief..." style={{ ...inputStyle, textAlign: "center", marginBottom: 12 }} />
        <Btn primary onClick={saveName}>Join the Press Corps</Btn>
      </div>
    );
  }

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setImgData(await compressImage(f)); } catch { alert("That photograph could not be developed. Try another."); }
  };

  const submit = async () => {
    if (!imgData) return;
    setPosting(true);
    const postedType = type;
    await addPost({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: me, ts: Date.now(), img: imgData, type, note: note.trim().slice(0, 240),
      reactions: {}, comments: [],
    });
    setImgData(null); setNote(""); setType(4); setPosting(false);
    if (fileRef.current) fileRef.current.value = "";
    if (postedType === 4) onGoldenSnake();
  };

  const react = (post, emoji) => mutatePost(post.id, (p) => {
    const r = { ...(p.reactions || {}) };
    const key = `${emoji}:${me}`;
    r[key] ? delete r[key] : (r[key] = 1);
    p.reactions = r;
    return p;
  });

  const comment = (post) => {
    const text = (commentDrafts[post.id] || "").trim();
    if (!text) return;
    mutatePost(post.id, (p) => {
      p.comments = [...(p.comments || []), { author: me, text: text.slice(0, 300), ts: Date.now() }];
      return p;
    });
    setCommentDrafts((d) => ({ ...d, [post.id]: "" }));
  };

  const reactionCounts = (p) => {
    const counts = {};
    Object.keys(p.reactions || {}).forEach((k) => { const e = k.split(":")[0]; counts[e] = (counts[e] || 0) + 1; });
    return counts;
  };

  return (
    <>
      {/* Composer */}
      <div style={{ border: rule(1), outline: `1px solid ${INK}`, outlineOffset: 3, padding: "20px 20px 22px", margin: "26px 0 8px" }}>
        <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 12px", color: RED, textAlign: "center" }}>
          Submit a Story · Byline: {me}
        </p>

        {!imgData ? (
          <button onClick={() => fileRef.current?.click()} style={{
            width: "100%", padding: "30px 14px", background: "rgba(255,255,255,0.35)",
            border: `1px dashed ${INK}`, cursor: "pointer", fontFamily: "'Old Standard TT', serif",
            fontStyle: "italic", fontSize: 15, color: INK,
          }}>
            Attach photographic evidence †
          </button>
        ) : (
          <div style={{ position: "relative", marginBottom: 4 }}>
            <img src={imgData} alt="Evidence, awaiting publication" style={{ width: "100%", display: "block", border: rule(1), filter: "sepia(0.15) contrast(1.02)" }} />
            <button onClick={() => { setImgData(null); if (fileRef.current) fileRef.current.value = ""; }}
              style={{ position: "absolute", top: 8, right: 8, background: PAPER, border: rule(1), padding: "3px 9px", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: 12 }}>KILL</button>
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
        <div style={{ textAlign: "center" }}>
          <Btn primary onClick={submit} disabled={!imgData || posting} style={{ minWidth: 220 }}>
            {posting ? "Going to press..." : "Run It on the Front Page"}
          </Btn>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "28px 0 0" }}>
        <SectionHead>Latest Dispatches</SectionHead>
      </div>
      <div style={{ textAlign: "center", marginTop: -8, marginBottom: 18 }}>
        <button onClick={refresh} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.1em", color: SEPIA }}>
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

      {posts.map((p, idx) => {
        const meta = TYPE_META[p.type] || TYPE_META[4];
        const counts = reactionCounts(p);
        return (
          <article key={p.id} style={{ borderTop: idx === 0 ? "none" : rule(1), padding: "24px 0 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <h3 style={{ fontFamily: "'Old Standard TT', serif", fontWeight: 700, fontSize: "clamp(21px, 4.6vw, 27px)", lineHeight: 1.15, margin: "0 0 6px" }}>
                  Type {p.type} Reported: {meta.label}
                </h3>
                <p style={{ margin: 0, fontFamily: "'Courier Prime', monospace", fontSize: 11.5, letterSpacing: "0.06em" }}>
                  By <span style={{ fontWeight: 700 }}>{p.author.toUpperCase()}</span>, Staff Correspondent · {timeAgo(p.ts)}
                </p>
              </div>
              <Stamp rotate={p.type === 4 ? -6 : 4} color={p.type === 7 ? RED : p.type === 4 ? "#3E6B45" : RED} style={{ flexShrink: 0, marginTop: 4 }}>
                {meta.status}
              </Stamp>
            </div>

            {p.img && (
              <figure style={{ margin: "14px 0 4px" }}>
                <img src={p.img} alt={`Type ${p.type} evidence filed by ${p.author}`}
                  style={{ width: "100%", display: "block", border: rule(1), filter: "sepia(0.18) contrast(1.03)" }} />
                <figcaption style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, color: SEPIA, marginTop: 5, letterSpacing: "0.04em" }}>
                  PHOTOGRAPHIC EVIDENCE · SUBMITTED BY THE CORRESPONDENT · UNRETOUCHED
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

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {REACTIONS.map((e) => (
                <button key={e} onClick={() => react(p, e)} style={{
                  border: rule(1), background: counts[e] ? PAPER_DK : "transparent", cursor: "pointer",
                  padding: "5px 12px", fontSize: 14, fontFamily: "'Courier Prime', monospace",
                }}>
                  {e}{counts[e] ? ` ${counts[e]}` : ""}
                </button>
              ))}
            </div>

            {(p.comments || []).length > 0 && (
              <div style={{ margin: "16px 0 0", paddingLeft: 16, borderLeft: `3px solid ${FAINT}` }}>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: SEPIA, margin: "0 0 8px" }}>Letters to the Editor</p>
                {p.comments.map((c, i) => (
                  <p key={i} style={{ margin: "0 0 7px", fontSize: 14, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>{c.author}:</span> <span style={{ fontStyle: "italic" }}>"{c.text}"</span>
                  </p>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input value={commentDrafts[p.id] || ""} onChange={(e) => setCommentDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && comment(p)} placeholder="Write to the editor..."
                style={{ ...inputStyle, fontSize: 13.5, padding: "8px 12px" }} />
              <Btn small onClick={() => comment(p)}>Print It</Btn>
            </div>
          </article>
        );
      })}
    </>
  );
}

/* ========================= POOP SNAKE ========================= */
function PoopSnake({ onClose }) {
  const GRID = 15;
  const CELL = 20;
  const SPEED = 190;
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("ready"); // ready | playing | dead
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const stateRef = useRef({
    snake: [{ x: 7, y: 7 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 11, y: 7 },
    wobble: 0,
  });

  useEffect(() => {
    (async () => {
      try { const r = await storage.get("sp-snake-best", false); if (r) setBest(Number(r.value) || 0); } catch {}
    })();
  }, []);

  const placeFood = (snake) => {
    let f;
    do { f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (snake.some((s) => s.x === f.x && s.y === f.y));
    return f;
  };

  const reset = () => {
    stateRef.current = {
      snake: [{ x: 7, y: 7 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: placeFood([{ x: 7, y: 7 }]),
      wobble: 0,
    };
    setScore(0);
    setStatus("playing");
  };

  const steer = (x, y) => {
    const s = stateRef.current;
    if (s.dir.x === -x && s.dir.y === -y) return; // no reversing
    s.nextDir = { x, y };
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      };
      if (e.key === "Escape") return onClose();
      const m = map[e.key];
      if (m) { e.preventDefault(); if (status === "playing") steer(m[0], m[1]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, onClose]);

  // Swipe
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let sx = 0, sy = 0;
    const start = (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; };
    const end = (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 1 : -1, 0);
      else steer(0, dy > 0 ? 1 : -1);
    };
    cv.addEventListener("touchstart", start, { passive: true });
    cv.addEventListener("touchend", end, { passive: true });
    return () => { cv.removeEventListener("touchstart", start); cv.removeEventListener("touchend", end); };
  }, []);

  // Game loop
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      const s = stateRef.current;
      s.dir = s.nextDir;
      s.wobble += 1;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

      if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID || s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setStatus("dead");
        setScore((sc) => {
          setBest((b) => {
            const nb = Math.max(b, sc);
            if (nb > b) { try { storage.set("sp-snake-best", String(nb), false); } catch {} }
            return nb;
          });
          return sc;
        });
        return;
      }

      const newSnake = [head, ...s.snake];
      if (head.x === s.food.x && head.y === s.food.y) {
        s.food = placeFood(newSnake);
        setScore((sc) => sc + 1);
      } else {
        newSnake.pop();
      }
      s.snake = newSnake;
    }, SPEED);
    return () => clearInterval(id);
  }, [status]);

  // Render
  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      const s = stateRef.current;
      const size = GRID * CELL;

      // paper background
      ctx.fillStyle = "#EFE6D2";
      ctx.fillRect(0, 0, size, size);
      // faint grid
      ctx.strokeStyle = "rgba(36,28,20,0.06)";
      ctx.lineWidth = 1;
      for (let i = 1; i < GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(size, i * CELL); ctx.stroke();
      }

      // food: smiley circle
      const fx = s.food.x * CELL + CELL / 2;
      const fy = s.food.y * CELL + CELL / 2;
      const fr = CELL * 0.38;
      ctx.fillStyle = "#F2C84B";
      ctx.strokeStyle = "#241C14";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#241C14";
      ctx.beginPath(); ctx.arc(fx - fr * 0.35, fy - fr * 0.2, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fx + fr * 0.35, fy - fr * 0.2, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(fx, fy + fr * 0.1, fr * 0.55, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 1.4; ctx.stroke();

      // snake: golden-brown poop segments
      s.snake.forEach((seg, i) => {
        const cx = seg.x * CELL + CELL / 2;
        const cy = seg.y * CELL + CELL / 2;
        const t = i / Math.max(1, s.snake.length);
        const shade = 60 - t * 18;
        ctx.fillStyle = `hsl(28, 45%, ${shade}%)`;
        ctx.strokeStyle = "#3A2A18";
        ctx.lineWidth = 1.2;
        const r = CELL * (i === 0 ? 0.46 : 0.42);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (i === 0) {
          // face on the head
          const look = s.dir;
          const ex = look.x * 3, ey = look.y * 3;
          ctx.fillStyle = "#FFF6E6";
          ctx.beginPath(); ctx.arc(cx - 3 + ex, cy - 2 + ey, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + 3 + ex, cy - 2 + ey, 2.4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#241C14";
          ctx.beginPath(); ctx.arc(cx - 3 + ex, cy - 2 + ey, 1.1, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + 3 + ex, cy - 2 + ey, 1.1, 0, Math.PI * 2); ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const size = GRID * CELL;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,15,10,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: PAPER, border: `2px solid ${INK}`, outline: `1px solid ${INK}`, outlineOffset: 3, padding: "18px 18px 20px", maxWidth: size + 40, width: "100%", fontFamily: "'Old Standard TT', serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: RED }}>Bonus Edition</span>
          <button onClick={onClose} style={{ background: "none", border: rule(1), padding: "2px 9px", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: 12 }}>CLOSE</button>
        </div>
        <h2 style={{ fontFamily: "'UnifrakturMaguntia', serif", fontWeight: 400, fontSize: 34, margin: "0 0 2px", textAlign: "center", lineHeight: 1 }}>The Golden Snake</h2>
        <p style={{ textAlign: "center", fontStyle: "italic", fontSize: 12.5, margin: "0 0 12px", color: SEPIA }}>
          A Type 4 has been filed. Feed the snake. Mind the walls.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Courier Prime', monospace", fontSize: 12, margin: "0 0 8px", padding: "0 2px" }}>
          <span>SCORE: {score}</span>
          <span>BEST: {best}</span>
        </div>

        <div style={{ position: "relative", width: size, maxWidth: "100%", margin: "0 auto" }}>
          <canvas ref={canvasRef} width={size} height={size}
            style={{ width: "100%", height: "auto", border: rule(1), display: "block", touchAction: "none", imageRendering: "auto" }} />

          {status !== "playing" && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(239,230,210,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
              {status === "ready" ? (
                <>
                  <p style={{ fontFamily: "'Old Standard TT', serif", fontSize: 19, margin: "0 0 10px", lineHeight: 1.4 }}>
                    Guide the golden snake into the smiling morsels. Every bite makes it grow.
                  </p>
                  <Btn primary onClick={reset}>Start Playing</Btn>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: "'Old Standard TT', serif", fontWeight: 700, fontSize: 24, margin: "0 0 2px" }}>The Snake Has Passed.</p>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, margin: "0 0 14px", color: SEPIA }}>
                    Final length: {score}{score === best && score > 0 ? " · NEW RECORD" : ""}
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn primary onClick={reset}>Play Again</Btn>
                    <Btn onClick={onClose}>Back to Paper</Btn>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Touch controls */}
        {status === "playing" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 54px)", gridTemplateRows: "repeat(2, 46px)", gap: 6, justifyContent: "center", marginTop: 14 }}>
            <span />
            <DPad label="▲" onClick={() => steer(0, -1)} />
            <span />
            <DPad label="◀" onClick={() => steer(-1, 0)} />
            <DPad label="▼" onClick={() => steer(0, 1)} />
            <DPad label="▶" onClick={() => steer(1, 0)} />
          </div>
        )}
        <p style={{ textAlign: "center", fontFamily: "'Courier Prime', monospace", fontSize: 10, color: SEPIA, margin: "12px 0 0", letterSpacing: "0.06em" }}>
          ARROW KEYS · WASD · OR SWIPE
        </p>
      </div>
    </div>
  );
}

function DPad({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: rule(1), background: "rgba(255,255,255,0.4)", cursor: "pointer",
      fontSize: 18, color: INK, display: "flex", alignItems: "center", justifyContent: "center",
    }}>{label}</button>
  );
}


function Guide({ jump }) {
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

/* ========================== CLASSIFIEDS ========================== */
function Protocols({ filter, clearFilter }) {
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
