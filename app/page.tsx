"use client";

import { useState, useEffect } from "react";
import { getUserId, onAuthChange, signOut, getMyProfile, isSupabaseConfigured } from "../lib/auth";
import { INK, PAPER, SEPIA, RED, GRAIN, todayLine, rule, doubleRule } from "./components/ui";
import { SignIn, BylineSetup } from "./components/Auth";
import { Feed } from "./components/Feed";
import { PoopSnake } from "./components/PoopSnake";
import { Guide } from "./components/Guide";
import { Protocols } from "./components/Protocols";

/* ==============================================================
   THE DAILY DUMP · All the News That's Fit to Flush
   A broadsheet for the bowels. Feed + Field Guide + Classifieds
   ============================================================== */

/* ============================ APP ============================ */
export default function App() {
  const [tab, setTab] = useState("feed");
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [protoFilter, setProtoFilter] = useState(null);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    let active = true;
    let revision = 0;
    const updateSession = async (uid) => {
      const current = ++revision;
      const nextProfile = uid ? await getMyProfile() : null;
      if (!active || current !== revision) return;
      setUserId(uid);
      setProfile(nextProfile);
      setAuthLoading(false);
    };
    const unsub = onAuthChange(updateSession);
    getUserId().then((uid) => { if (active && revision === 0) updateSession(uid); });
    return () => { active = false; unsub(); };
  }, []);

  const me = profile?.byline || "";
  const doSignOut = async () => {
    try { await signOut(); setUserId(null); setProfile(null); }
    catch { window.alert("Could not sign out. Please try again."); }
  };
  const jumpToProtocol = (pid) => { setProtoFilter(pid); setTab("protocols"); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: "100vh", background: PAPER, backgroundImage: `${GRAIN}, radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.5), transparent 60%)`, color: INK }}>
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

        {me && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "6px 0 0", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.06em", color: SEPIA }}>
            <span>FILED UNDER THE BYLINE: <span style={{ fontWeight: 700, color: INK }}>{me.toUpperCase()}</span></span>
            <button onClick={doSignOut} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.06em", color: RED, textDecoration: "underline", textUnderlineOffset: 3, padding: 0 }}>
              SIGN OUT
            </button>
          </div>
        )}

        {!isSupabaseConfigured && (
          <div style={{ border: `2px solid ${RED}`, margin: "10px 0 0", padding: "10px 14px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'Courier Prime', monospace", fontSize: 11.5, lineHeight: 1.6, color: RED, letterSpacing: "0.04em" }}>
              CORRECTION: THE PRESSES ARE OFFLINE. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then reload to sign in and file reports.
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
            authLoading ? (
              <p style={{ textAlign: "center", fontStyle: "italic", padding: "30px 0" }}>Checking your press credentials...</p>
            ) : !userId ? (
              <SignIn />
            ) : !profile ? (
              <BylineSetup onDone={setProfile} />
            ) : (
              <Feed me={me} userId={userId} jump={jumpToProtocol} onGoldenSnake={() => setShowGame(true)} />
            )
          )}
          {tab === "guide" && <Guide jump={jumpToProtocol} />}
          {tab === "protocols" && <Protocols filter={protoFilter} clearFilter={() => setProtoFilter(null)} />}
        </main>

        {/* Colophon */}
        <footer style={{ borderTop: rule(3), padding: "16px 0 44px", textAlign: "center" }}>          <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10.5, lineHeight: 1.7, color: SEPIA, maxWidth: 520, margin: "0 auto" }}>
            THE DAILY DUMP is published for laughs and loose wellness direction among friends and constitutes no medical advice whatsoever.
            Blood, black tarry stool, persistent changes, unexplained weight loss, or pain: consult an actual physician.
            Public submissions run for every reader of this publication; private ones stay on your own desk. Govern yourselves accordingly.
          </p>
        </footer>
      </div>

      {showGame && <PoopSnake onClose={() => setShowGame(false)} />}
    </div>
  );
}
