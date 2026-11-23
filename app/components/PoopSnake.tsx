"use client";

import { useState, useEffect, useRef } from "react";
import { INK, PAPER, SEPIA, RED, rule, Btn } from "./ui";

/* ========================= POOP SNAKE ========================= */
export function PoopSnake({ onClose }) {
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
    // High score is a per-device value — localStorage, no backend needed.
    try {
      const v = typeof window !== "undefined" ? window.localStorage.getItem("sp-snake-best") : null;
      if (v) setBest(Number(v) || 0);
    } catch {}
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
            if (nb > b) { try { window.localStorage.setItem("sp-snake-best", String(nb)); } catch {} }
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
