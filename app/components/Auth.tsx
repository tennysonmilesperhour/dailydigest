"use client";

import { useState } from "react";
import { sendMagicLink, signInWithPassword, setMyByline } from "../../lib/auth";
import { INK, RED, rule, Btn, inputStyle } from "./ui";

/* ============================ SIGN IN ============================ */
// These auth screens render as <section> (not <div>) so React doesn't try to
// reuse their <input> nodes as the composer's inputs when you cross the sign-in
// boundary (which would trip a controlled→uncontrolled warning).
const authCard = { border: rule(1), outline: `1px solid ${INK}`, outlineOffset: 3, padding: "28px 24px", margin: "34px auto", maxWidth: 480, textAlign: "center" } as const;
const kicker = { fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", margin: "0 0 8px", color: RED } as const;
const errLine = { fontFamily: "'Courier Prime', monospace", fontSize: 11.5, color: RED, margin: "0 0 12px" } as const;

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("password");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (sending || !email.trim()) return;
    setSending(true); setErr("");
    try {
      if (mode === "password") await signInWithPassword(email, password);
      else { await sendMagicLink(email); setSent(true); }
    }
    catch (e) { setErr(e?.message || "Could not sign in. Try again."); }
    finally { setSending(false); }
  };

  if (sent) {
    return (
      <section style={authCard}>
        <p style={kicker}>Press Credentials</p>
        <h2 style={{ fontFamily: "'Old Standard TT', serif", fontSize: 26, margin: "0 0 8px" }}>Check Your Inbox</h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "0 0 18px", fontStyle: "italic" }}>
          We wired a one-time link to <span style={{ fontWeight: 700 }}>{email}</span>. Open it on this device to take up your desk. You may close this page.
        </p>
        <Btn onClick={() => { setSent(false); setErr(""); }}>Use a different email</Btn>
      </section>
    );
  }
  return (
    <section style={authCard}>
      <p style={kicker}>Press Credentials</p>
      <h2 style={{ fontFamily: "'Old Standard TT', serif", fontSize: 26, margin: "0 0 8px" }}>Sign In to File Reports</h2>
      <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="you@example.com" aria-label="Email" style={{ ...inputStyle, textAlign: "center", marginBottom: 12 }} />
      {mode === "password" && <input type="password" autoComplete="current-password" value={password}
        onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Your password" aria-label="Password" style={{ ...inputStyle, textAlign: "center", marginBottom: 12 }} />}
      {err && <p role="alert" style={errLine}>{err}</p>}
      <Btn primary onClick={submit} disabled={sending || !email.trim() || (mode === "password" && !password)}>
        {sending ? "Checking credentials..." : mode === "password" ? "Sign In" : "Email Me a Magic Link"}
      </Btn>
      <p style={{ margin: "16px 0 0" }}><Btn small disabled={sending} onClick={() => {
        setMode(mode === "password" ? "link" : "password"); setErr("");
      }}>{mode === "password" ? "Use an email link" : "Use my account password"}</Btn></p>
    </section>
  );
}

/* ========================= BYLINE SETUP ========================= */
export function BylineSetup({ onDone }) {
  const [byline, setByline] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (saving || !byline.trim()) return;
    setSaving(true); setErr("");
    try { onDone(await setMyByline(byline)); }
    catch (e) { setErr(e?.message || "Could not save your byline. Try again."); setSaving(false); }
  };
  return (
    <section style={authCard}>
      <p style={kicker}>Press Credentials</p>
      <h2 style={{ fontFamily: "'Old Standard TT', serif", fontSize: 26, margin: "0 0 8px" }}>Choose Your Byline</h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "0 0 18px", fontStyle: "italic" }}>
        Every report needs a name. This is how you'll run on the front page. You can retire it later.
      </p>
      <input value={byline} onChange={(e) => setByline(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="The LogFather, Scoop Dogg, Editor-in-Relief..." aria-label="Byline" maxLength={24}
        style={{ ...inputStyle, textAlign: "center", marginBottom: 12 }} />
      {err && <p style={errLine}>{err}</p>}
      <Btn primary onClick={submit} disabled={saving || !byline.trim()}>
        {saving ? "Claiming..." : "Claim This Byline"}
      </Btn>
    </section>
  );
}
