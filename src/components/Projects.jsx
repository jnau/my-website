import { Fragment, useState, useRef, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { C } from "../tokens";
import { SecHead } from "../primitives/SecHead";
import { useReveal } from "../hooks/useReveal";
import projectsData from "../data/projects.json";

const PROJECTS = projectsData.featured;
// The walkthrough game (public/demo-game) reads this from its parent window, so it stays in sync.
if (typeof window !== "undefined") window.__projectsForGame = PROJECTS;
const ARCHIVE = projectsData.archived;
const ALL_PROJECTS = [...PROJECTS, ...ARCHIVE].sort((a, b) => (b.year || "0").localeCompare(a.year || "0"));

/* ─── Type colors ─── */
const TYPE_COLORS = {
  Research: "#78aec8",
  Professional: "#6db89f",
  Personal: "#c9a96e",
};
const getTypeColor = (type) => TYPE_COLORS[type] || C.accent;

/* ─── Topic colors ─── */
const TOPIC_COLORS = {
  "Computational Biology": "#6db89f",
  Engineering: "#78aec8",
  Mathematics: "#c9a96e",
  "Data Science": "#a990c0",
  Bioinformatics: "#78c8b4",
  Biophysics: "#c98e8e",
  Physics: "#d4a574",
  Design: "#c98e8e",
};
const getTopicColor = (topic) => TOPIC_COLORS[topic] || C.accent;

/* ─── Mini Demos ─── */
// A reading window steps along a sequence, mutates the centre base and spells out its trinucleotide
// context (e.g. A[C>T]G), which lands in a 96-channel spectrum grouped into the six SBS classes.
const SBS_CLASSES = ["C>A", "C>G", "C>T", "T>A", "T>C", "T>G"];
const SBS_COLORS = ["#78aec8", "#cad5e8", "#c98e8e", "#8a9ab5", "#88b89a", "#d4a5b8"];
const SBS_WEIGHTS = [0.13, 0.08, 0.38, 0.09, 0.2, 0.12]; // roughly SBS-like: C>T heavy
const BASES = "ACGT";
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const pickSbsClass = () => { let r = Math.random(); for (let i = 0; i < 5; i++) { r -= SBS_WEIGHTS[i]; if (r <= 0) return i; } return 5; };

function makeSbsContextScene() {
  const S = 11, STEP = 1.1, seq = [], parts = [];
  const get = (i) => { while (seq.length <= i) seq.push({ b: BASES[(Math.random() * 4) | 0] }); return seq[i]; };
  // Counts ease toward their target and halve when they get big, so the loop never overflows.
  const counts = new Array(96).fill(0), shown = new Array(96).fill(0);
  const frac = (b) => shown[b] / Math.max(3, ...shown);
  let n = 20, stepStart = 0, label = null;
  return (ctx, w, h, t, dt) => {
    // Step two bases at a time so a mutation's neighbours (its context) are never mutated themselves.
    if (t - stepStart > STEP) { stepStart = t; n += 2; label = null; }
    const u = t - stepStart, p = n - 2 + 2 * easeInOut(clamp01(u / 0.35)), cx = w / 2, ly = 14;
    if (u > 0.35 && !label) {
      const c = pickSbsClass(), [ref, alt] = SBS_CLASSES[c].split(">"), o = get(n);
      o.b = ref; o.mut = { alt, c };
      const five = get(n - 1).b, three = get(n + 1).b;
      label = { c, text: `${five}[${ref}>${alt}]${three}` };
      parts.push({ c, bin: c * 16 + BASES.indexOf(five) * 4 + BASES.indexOf(three), t0: t + 0.2 });
    }
    ctx.strokeStyle = rgba(C.accent, 0.7); ctx.lineWidth = 1;
    ctx.strokeRect(cx - S * 1.5, ly - 9, S * 3, 18);
    ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = Math.max(0, Math.floor(p - w / 2 / S) - 1); i < p + w / 2 / S + 1; i++) {
      const o = get(i), x = cx + (i - p) * S, fade = clamp01(Math.min(x, w - x) / 30);
      ctx.fillStyle = o.mut ? rgba(SBS_COLORS[o.mut.c], fade) : rgba(C.text, fade * (Math.abs(x - cx) < S * 1.6 ? 1 : 0.6));
      ctx.fillText(o.mut && !(i === n && u < 0.45) ? o.mut.alt : o.b, x, ly);
    }
    if (label) {
      ctx.font = "10px ui-monospace, Menlo, monospace"; ctx.fillStyle = SBS_COLORS[label.c];
      ctx.globalAlpha = clamp01((u - 0.35) / 0.2); ctx.fillText(label.text, cx, ly + 19); ctx.globalAlpha = 1;
    }
    const gap = 4, bw = (w - 5 * gap) / 96, base = h - 13, maxH = base - 46;
    const binX = (b) => b * bw + Math.floor(b / 16) * gap;
    for (let j = parts.length - 1; j >= 0; j--) {
      const q = parts[j], k = (t - q.t0) / 0.6;
      if (k < 0) continue;
      if (k >= 1) {
        counts[q.bin]++;
        if (Math.max(...counts) > 12) for (let b = 0; b < 96; b++) counts[b] *= 0.5;
        parts.splice(j, 1); continue;
      }
      const e = easeInOut(k);
      ctx.fillStyle = SBS_COLORS[q.c]; ctx.beginPath();
      ctx.arc(cx + (binX(q.bin) + bw / 2 - cx) * e, ly + 26 + (base - frac(q.bin) * maxH - ly - 26) * e, 2.2, 0, 7); ctx.fill();
    }
    for (let b = 0; b < 96; b++) shown[b] += (counts[b] - shown[b]) * clamp01(dt * 6);
    for (let b = 0; b < 96; b++) {
      const bh = Math.max(1, frac(b) * maxH);
      ctx.fillStyle = rgba(SBS_COLORS[(b / 16) | 0], 0.85); ctx.fillRect(binX(b), base - bh, Math.max(1, bw - 0.6), bh);
    }
    ctx.font = "8px 'DM Sans', sans-serif"; ctx.textBaseline = "alphabetic";
    SBS_CLASSES.forEach((cls, c) => {
      const x0 = binX(c * 16), x1 = binX(c * 16 + 15) + bw;
      ctx.fillStyle = SBS_COLORS[c]; ctx.fillRect(x0, base + 2, x1 - x0, 2);
      ctx.fillStyle = C.text; ctx.fillText(cls, (x0 + x1) / 2, h - 1);
    });
  };
}

// Submitted files slide into a schema check; valid ones drop into the portal's file table and go
// from "in progress" to "released", invalid ones are bounced. Counters tally both.
const INGEST_FORMATS = [["fastq", C.wc[4]], ["bam", C.wc[2]], ["bigWig", C.wc[0]], ["bed", C.wc[5]]];
const REJECT = C.wc[3];
// Human cell lines and mouse tissues as sample labels; no accessions, so it stays a toy table.
const SAMPLES = ["HepG2", "K562", "WTC11", "GM12878", "HCT116", "A549", "MCF-7", "IMR-90", "mouse_liver", "mouse_heart", "mouse_brain", "mouse_lung"];
const randSample = () => SAMPLES[(Math.random() * SAMPLES.length) | 0];

function makeIngestScene() {
  const SPAWN = 1.4, RH = 12, laneY = 11, headY = 36, rowY0 = 49, chips = [], rows = [];
  for (let i = 0; i < 4; i++) { const [fmt, col] = INGEST_FORMATS[i % 4]; rows.push({ name: randSample(), fmt, col, t0: -10, rel: true }); }
  let nextSpawn = 0.2, n = 0, released = 0, rejected = 0, check = null;
  const chip = (ctx, x, y, label, col, a, border) => {
    const cw = ctx.measureText(label).width + 10;
    ctx.globalAlpha = a; ctx.fillStyle = rgba(col, 0.15); ctx.strokeStyle = border || col; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - cw / 2, y - 7, cw, 14, 4) : ctx.rect(x - cw / 2, y - 7, cw, 14);
    ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.fillText(label, x, y + 0.5); ctx.globalAlpha = 1;
  };
  return (ctx, w, h, t) => {
    const gx = w / 2;
    // Every fifth file fails validation, so the check reads as a real gate.
    if (t >= nextSpawn) { nextSpawn += SPAWN; const [fmt, col] = INGEST_FORMATS[(Math.random() * 4) | 0]; chips.push({ fmt, col, t0: t, ok: ++n % 5 !== 0 }); }

    // Gate: braces around the lane, coloured by the latest verdict.
    const flash = check && t - check.t < 0.5 ? (check.ok ? C.accent : REJECT) : null;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "17px ui-monospace, Menlo, monospace"; ctx.fillStyle = flash || C.muted;
    ctx.fillText("{", gx - 28, laneY); ctx.fillText("}", gx + 28, laneY);
    ctx.font = "8px 'DM Sans', sans-serif"; ctx.fillStyle = flash || C.muted;
    ctx.fillText(flash ? (check.ok ? "schema ✓" : "schema ✗") : "schema", gx, laneY + 15);

    ctx.font = "9px ui-monospace, Menlo, monospace";
    for (let j = chips.length - 1; j >= 0; j--) {
      const c = chips[j], u = t - c.t0;
      if (u < 0.8) { const x = -20 + (gx + 20) * easeInOut(u / 0.8); chip(ctx, x, laneY, c.fmt, c.col, clamp01(x / 30)); continue; }
      if (u < 1.1) {
        if (u >= 0.95 && !c.checked) { c.checked = true; check = { t, ok: c.ok }; }
        chip(ctx, gx, laneY, c.fmt, c.col, 1, c.checked ? (c.ok ? C.accent : REJECT) : null); continue;
      }
      const k = clamp01((u - 1.1) / 0.5), e = easeInOut(k);
      if (c.ok) {
        if (k >= 1) { chips.splice(j, 1); rows.unshift({ name: randSample(), fmt: c.fmt, col: c.col, t0: t }); if (rows.length > 5) rows.pop(); continue; }
        chip(ctx, gx, laneY + (rowY0 - laneY) * e, c.fmt, c.col, 1 - 0.8 * e, C.accent);
      } else {
        if (k >= 1) { chips.splice(j, 1); rejected++; continue; }
        chip(ctx, gx + Math.sin(u * 40) * 3 * (1 - k), laneY + 8 * e, c.fmt, REJECT, 1 - k);
      }
    }

    // File table: header, then rows that slide down as each new one lands on top.
    ctx.font = "7.5px 'DM Sans', sans-serif"; ctx.fillStyle = C.muted;
    ctx.textAlign = "left"; ctx.fillText("SAMPLE", 0, headY);
    ctx.textAlign = "center"; ctx.fillText("FORMAT", gx, headY);
    ctx.textAlign = "right"; ctx.fillText("STATUS", w, headY);
    ctx.fillStyle = C.border; ctx.fillRect(0, headY + 5, w, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(0, headY + 6, w, rowY0 + 3.5 * RH - headY - 6); ctx.clip();
    const slide = easeInOut(clamp01((t - rows[0].t0) / 0.35));
    rows.forEach((r, i) => {
      const y = rowY0 + (i - 1 + slide) * RH;
      if (!r.rel && t - r.t0 > 0.8) { r.rel = true; released++; }
      ctx.globalAlpha = (i === 0 ? slide : 1) * clamp01((rowY0 + 3.5 * RH - y) / RH);
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left"; ctx.fillStyle = C.bright; ctx.fillText(r.name, 0, y);
      ctx.textAlign = "center"; ctx.fillStyle = r.col; ctx.fillText(r.fmt, gx, y);
      const col = r.rel ? C.accent : C.wc[0], label = r.rel ? "released" : "in progress";
      ctx.font = "8.5px 'DM Sans', sans-serif"; ctx.textAlign = "right"; ctx.fillStyle = col; ctx.fillText(label, w, y);
      ctx.beginPath(); ctx.arc(w - ctx.measureText(label).width - 5, y, 2, 0, 7); ctx.fill();
    });
    ctx.restore(); ctx.globalAlpha = 1;

    ctx.font = "8px 'DM Sans', sans-serif"; ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left"; ctx.fillStyle = C.accent; ctx.fillText(`✓ ${released} released`, 0, h - 1);
    ctx.textAlign = "right"; ctx.fillStyle = rejected ? REJECT : C.muted; ctx.fillText(`✗ ${rejected} rejected`, w, h - 1);
  };
}

function CanvasDemo({ makeScene, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d"), H = 104;
    let draw = makeScene(), w = 0, t = 0, last = performance.now(), raf = 0;
    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      w = cv.clientWidth; cv.width = w * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const render = (dt) => { t += dt; ctx.clearRect(0, 0, w, H); draw(ctx, w, H, t, dt); };
    size();
    const ro = new ResizeObserver(() => { size(); draw = makeScene(); t = 0; });
    ro.observe(cv);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      // Run the scene forward off screen and leave a filled-in still frame.
      for (let i = 0; i < 600; i++) render(1 / 60);
    } else {
      const frame = (now) => { render(Math.min(0.05, (now - last) / 1000)); last = now; raf = requestAnimationFrame(frame); };
      raf = requestAnimationFrame(frame);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [makeScene]);
  return <canvas ref={ref} role="img" aria-label={label} style={{ display: "block", width: "100%", height: 104 }} />;
}

const SbsContextDemo = () => <CanvasDemo makeScene={makeSbsContextScene} label="Animation: mutations read from a DNA sequence with their trinucleotide context, tallied into a 96-channel spectrum grouped into six substitution classes" />;
const IngestDemo = () => <CanvasDemo makeScene={makeIngestScene} label="Animation: submitted sequencing files pass a schema check and are added to the portal's file table as released, while invalid files are rejected" />;

// Agent (robot) does the reading, a human curates, then it's published.
const ICON_PATHS = {
  robot: "M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM12 2v4M9 11v1M15 11v1M10 15h4M2 11v2M22 11v2",
  person: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2",
  book: "M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13",
};
function PipelineDemo() {
  const steps = [
    { icon: "robot", label: "search · read · check · draft", color: C.accent },
    { icon: "person", label: "curate", color: C.wc[0] },
    { icon: "book", label: "publish", color: C.accent },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, fontFamily: "'DM Sans'", fontSize: 10.5, color: C.text }}>
      {steps.map((s, i) => (
        <Fragment key={s.icon}>
          {i > 0 && <span style={{ color: C.accent, animation: `arrP 1.5s ease ${i * 0.3}s infinite` }}>→</span>}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON_PATHS[s.icon]} /></svg>
            <span style={{ textAlign: "center" }}>{s.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// Types "eggs" into a toy search box, then shows matches scored by meaning and by words. Click opens Sparky's kitchen.
const RECIPE_HITS = [
  { title: "Egg fried rice", meaning: 0.9, words: 0.85, color: "#c9a96e" },
  { title: "Tomato & egg stir-fry", meaning: 0.75, words: 0.6, color: "#c98e8e" },
];
function RecipeSearchDemo({ onPlay }) {
  const query = "eggs";
  const [step, setStep] = useState(0); // 0..4 typing, 5 results, 6 hold
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setStep(6); return; }
    const delays = [600, 180, 180, 180, 450, 2800, 0];
    const t = setTimeout(() => setStep((s) => (s >= 5 ? 0 : s + 1)), delays[step]);
    return () => clearTimeout(t);
  }, [step]);
  const typed = query.slice(0, Math.min(step, 4));
  const shown = step >= 5;
  return (
    <button onClick={onPlay} aria-label="Try the recipe book demo in Sparky's kitchen" style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", fontFamily: "'DM Sans'" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, color: C.bright }}>
        <span style={{ color: C.muted }}>⌕</span>
        <span>{typed || <span style={{ color: C.muted }}>What are you craving?</span>}</span>
        {step < 5 && typed && <span style={{ width: 1, height: 11, background: C.accent, animation: "arrP 1s step-end infinite" }} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 7, minHeight: 34 }}>
        {RECIPE_HITS.map((r, i) => (
          <div key={r.title} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: C.text, opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(4px)", transition: `opacity .35s ease ${i * 0.15}s, transform .35s ease ${i * 0.15}s` }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, opacity: 0.8, flex: "none" }} />
            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</span>
            {[["meaning", r.meaning], ["words", r.words]].map(([k, v]) => (
              <div key={k} title={k} style={{ width: 34, height: 5, borderRadius: 3, background: `${C.accent}33`, overflow: "hidden", flex: "none" }}>
                <div style={{ height: "100%", width: shown ? `${v * 100}%` : 0, borderRadius: 3, background: C.accent, opacity: 0.75, transition: `width .6s ease ${0.2 + i * 0.15}s` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 10, color: C.muted }}>
        <span>meaning · words</span>
        <span style={{ color: C.accent }}>▶ Try it in Sparky's kitchen</span>
      </div>
    </button>
  );
}

function ComingSoonDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, fontFamily: "'Caveat'", fontSize: 15, color: C.accent, letterSpacing: 1.5, opacity: 0.7, animation: "sigP 2s ease-in-out infinite alternate" }}>
      coming soon ✨
    </div>
  );
}

/* ─── Pixel game demo (public/demo-game) ─── */
function GameModal({ src, onClose, mobile }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    // The game posts this when Esc is pressed inside the iframe.
    const onMsg = (e) => e.origin === window.location.origin && e.data?.type === "sparky-close" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMsg);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("message", onMsg);
    };
  }, [onClose]);
  // Portal to <body> so the fixed overlay sits above the nav, outside the section's stacking context.
  // Full screen on phones; the header keeps Close visible no matter what the game is showing.
  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: mobile ? 0 : 12 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Project walkthrough game" style={{ width: mobile ? "100%" : "min(860px, 100%)", height: mobile ? "100dvh" : "min(680px, 92vh)", display: "flex", flexDirection: "column", borderRadius: mobile ? 0 : 12, overflow: "hidden", background: "#2b2233" }}>
        <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 10px 8px 14px", background: "#3b2414", color: "#fff8e7", fontFamily: "'DM Sans'", fontSize: 13 }}>
          <span>🐾 Sparky's project walk</span>
          <button onClick={onClose} aria-label="Close game" style={{ border: "none", borderRadius: 14, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, background: "#fff8e7", color: "#3b2414" }}>Close ✕</button>
        </div>
        <iframe src={src} title="Project walkthrough game" style={{ flex: 1, width: "100%", border: 0 }} />
      </div>
    </div>,
    document.body
  );
}

function GameButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, color: C.accent, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 14, padding: "5px 12px", cursor: "pointer" }}>
      {label}
    </button>
  );
}

const DEMO_MAP = { sbscontext: SbsContextDemo, pipeline: PipelineDemo, ingest: IngestDemo, recipesearch: RecipeSearchDemo, comingsoon: ComingSoonDemo };

/* ─── Filter Pill ─── */
function FilterPill({ label, color, active, onClick, mobile }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'DM Sans'",
        fontSize: mobile ? 10 : 11,
        fontWeight: 500,
        color: active ? color : hov ? C.bright : C.muted,
        background: active ? `${color}18` : "transparent",
        border: `1px solid ${active ? `${color}44` : hov ? C.border : "transparent"}`,
        borderRadius: 14,
        padding: mobile ? "3px 9px" : "4px 11px",
        cursor: "pointer",
        transition: "all .25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ proj, index, mobile, onPlayGame }) {
  const [ref, vis] = useReveal(0.1);
  const [open, setOpen] = useState(false);
  const w = mobile ? 280 : 340;
  const DemoComp = proj.demo ? DEMO_MAP[proj.demo] : null;
  const hasLinks = proj.github || proj.url || proj.explainer || proj.details;

  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: `opacity .6s ease ${index * 0.06}s, transform .6s ease ${index * 0.06}s` }}>
      <div
        style={{
          width: w, borderRadius: 14, border: `1px solid ${C.border}`,
          background: C.surface,
          padding: mobile ? 20 : 24, display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden", minHeight: mobile ? 180 : 220,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: mobile ? 18 : 20, fontWeight: 600, color: C.heading, margin: 0, flex: 1 }}>{proj.title}{proj.explainer && <span aria-hidden="true" style={{ fontSize: "0.85em", marginLeft: 6 }}>📖</span>}</h3>
          <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: C.muted, marginLeft: 8 }}>{proj.year}</span>
        </div>
        <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.text, lineHeight: 1.7, marginTop: 8, flex: 1 }}>{proj.desc}</p>
        {DemoComp && (
          <div style={{ marginTop: 12, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
            <DemoComp onPlay={onPlayGame} />
          </div>
        )}
        {hasLinks && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: proj.url || proj.github ? "flex-start" : "center", gap: mobile ? 12 : 16, marginTop: 12 }}>
            {proj.url && (
              <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans'", fontSize: 11, color: C.accent, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>↗</span> Demo
              </a>
            )}
            {proj.github && (
              <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans'", fontSize: 11, color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>↗</span> GitHub
              </a>
            )}
            {proj.explainer && (
              <a href={proj.explainer} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans'", fontSize: 11, color: C.accent, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                How it works
              </a>
            )}
            {proj.details && (
              <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ all: "unset", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 11, color: C.accent, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, display: "inline-block", transition: "transform .2s", transform: open ? "rotate(90deg)" : "none" }}>▸</span> {open ? "Less" : "More"}
              </button>
            )}
          </div>
        )}
        {proj.details && open && (
          <ul style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.text, lineHeight: 1.6, margin: "10px 0 0", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            {proj.details.map((d) => <li key={d}>{d}</li>)}
          </ul>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: hasLinks ? 10 : 12 }}>
          {proj.tags.map((t) => (
            <span key={t} style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: C.accent, background: C.accentDim, borderRadius: 20, padding: "3px 9px" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Archive Table ─── */
function ArchiveTable({ mobile }) {
  const [typeFilter, setTypeFilter] = useState(null);
  const [topicFilter, setTopicFilter] = useState(null);

  /* derive unique types & topics from data */
  const allTypes = useMemo(() => {
    const set = new Set();
    ALL_PROJECTS.forEach((p) => { if (p.type) set.add(p.type); });
    return [...set].sort();
  }, []);

  const allTopics = useMemo(() => {
    const set = new Set();
    ALL_PROJECTS.forEach((p) => { (p.topics || []).forEach((t) => set.add(t)); });
    return [...set].sort();
  }, []);

  /* filtered list */
  const filtered = useMemo(() => {
    return ALL_PROJECTS.filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (topicFilter && !(p.topics || []).includes(topicFilter)) return false;
      return true;
    });
  }, [typeFilter, topicFilter]);

  return (
    <div style={{ animation: "fadeUp .4s ease both" }}>
      {/* ── Filter row ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: mobile ? 6 : 8, marginBottom: mobile ? 12 : 16 }}>
        {/* type filters */}
        <span style={{ fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>Type</span>
        <FilterPill label="All" color={C.accent} active={typeFilter === null} onClick={() => setTypeFilter(null)} mobile={mobile} />
        {allTypes.map((t) => (
          <FilterPill key={t} label={t} color={getTypeColor(t)} active={typeFilter === t} onClick={() => setTypeFilter((prev) => prev === t ? null : t)} mobile={mobile} />
        ))}

        {/* divider */}
        <div style={{ width: 1, height: 16, background: C.border, margin: mobile ? "0 2px" : "0 6px" }} />

        {/* topic filters */}
        <span style={{ fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>Topic</span>
        <FilterPill label="All" color={C.accent} active={topicFilter === null} onClick={() => setTopicFilter(null)} mobile={mobile} />
        {allTopics.map((t) => (
          <FilterPill key={t} label={t} color={getTopicColor(t)} active={topicFilter === t} onClick={() => setTopicFilter((prev) => prev === t ? null : t)} mobile={mobile} />
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans'", minWidth: mobile ? 600 : "auto" }}>
          <thead>
            <tr>
              {["Year", "Project", "Type", "Topic", "Built with", "Links"].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 600,
                  color: C.muted, letterSpacing: 1, textTransform: "uppercase",
                  borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={i}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.accentDim)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Year */}
                <td style={{ padding: "10px 12px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{p.year}</td>

                {/* Project */}
                <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: C.bright }}>{p.title}</td>

                {/* Type — single colored badge */}
                <td style={{ padding: "10px 12px" }}>
                  {p.type && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: getTypeColor(p.type),
                      background: `${getTypeColor(p.type)}15`,
                      border: `1px solid ${getTypeColor(p.type)}30`,
                      borderRadius: 10, padding: "2px 8px",
                      whiteSpace: "nowrap",
                    }}>{p.type}</span>
                  )}
                </td>

                {/* Topics — multiple tags */}
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(p.topics || []).map((t) => (
                      <span key={t} style={{
                        fontSize: 10,
                        color: getTopicColor(t),
                        background: `${getTopicColor(t)}15`,
                        borderRadius: 10, padding: "2px 7px",
                        whiteSpace: "nowrap",
                      }}>{t}</span>
                    ))}
                  </div>
                </td>

                {/* Built with */}
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(p.tags || []).map((t) => (
                      <span key={t} style={{ fontSize: 10, color: C.accent, background: C.accentDim, borderRadius: 10, padding: "2px 7px" }}>{t}</span>
                    ))}
                  </div>
                </td>

                {/* Links */}
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: C.accent, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 11 }}>↗</span> Demo
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: C.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 11 }}>↗</span> GitHub
                      </a>
                    )}
                    {p.explainer && (
                      <a href={p.explainer} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: C.accent, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 11 }}>📖</span> How it works
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 12px", fontSize: 13, color: C.muted, textAlign: "center" }}>
                  No projects match those filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* result count */}
      <div style={{ marginTop: 8, fontFamily: "'DM Sans'", fontSize: 11, color: C.muted }}>
        {filtered.length} of {ALL_PROJECTS.length} projects
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export function Projects({ mobile, pad }) {
  const [showArchive, setShowArchive] = useState(false);
  const [gameSrc, setGameSrc] = useState(null);
  const [hintVisible, setHintVisible] = useState(true);
  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const mounted = useRef(false);

  const CARD_W = mobile ? 280 : 340;
  const CARD_GAP = mobile ? 12 : 16;
  const sidePad = containerW ? containerW / 2 - CARD_W / 2 : 0;

  /* ── measure container on mount + resize ── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ── card centers ── */
  const getCardCenter = (i) => sidePad + i * (CARD_W + CARD_GAP) + CARD_W / 2;

  /* ── track active card on scroll ── */
  const handleScroll = useCallback(() => {
    if (mounted.current && hintVisible) setHintVisible(false);
    const el = scrollRef.current;
    if (!el || !sidePad) return;
    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    PROJECTS.forEach((_, i) => {
      const d = Math.abs(getCardCenter(i) - scrollCenter);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setActiveIdx(closest);
  }, [hintVisible, sidePad, CARD_W, CARD_GAP]);

  /* ── initialize active index ── */
  useEffect(() => {
    if (!sidePad) return;
    const timer = setTimeout(() => {
      handleScroll();
      setTimeout(() => { mounted.current = true; }, 250);
    }, 150);
    return () => clearTimeout(timer);
  }, [handleScroll, sidePad]);

  /* ── click dot → scroll to card ── */
  const scrollToCard = (i) => {
    const el = scrollRef.current;
    if (!el || !sidePad) return;
    const target = getCardCenter(i) - el.clientWidth / 2;
    el.scrollTo({ left: target, behavior: "smooth" });
    if (hintVisible) setHintVisible(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: 1100, padding: `${mobile ? 40 : 50}px 0` }}>
      <div style={{ padding: `0 ${pad}px` }}>
        <SecHead num="03" title="Projects" mobile={mobile} />
        <div style={{ display: "flex", justifyContent: "center", marginTop: mobile ? -16 : -28, marginBottom: mobile ? 16 : 24 }}>
          <GameButton label="🎮 Interactive game to walk through my projects" onClick={() => setGameSrc("/demo-game/index.html")} />
        </div>
      </div>
      {gameSrc && <GameModal src={gameSrc} onClose={() => setGameSrc(null)} mobile={mobile} />}

      {/* horizontal scroll */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="hide-scroll"
        style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", padding: "8px 0 20px" }}
      >
        <div style={{ display: "flex", gap: mobile ? 12 : 16, paddingLeft: sidePad, paddingRight: sidePad, width: "max-content" }}>
          {PROJECTS.map((proj, i) => (
            <ProjectCard key={i} proj={proj} index={i} mobile={mobile} onPlayGame={() => setGameSrc("/demo-game/index.html?open=recipe")} />
          ))}
        </div>
      </div>

      {/* ── dot indicators ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: mobile ? 8 : 10,
        marginTop: 2,
      }}>
        {PROJECTS.map((_, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`Go to project ${i + 1}`}
              style={{
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                borderRadius: "50%",
                background: isActive ? C.accent : C.border,
                boxShadow: isActive ? `0 0 8px rgba(109,184,159,0.4)` : "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all .3s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            />
          );
        })}
      </div>

      {/* scroll hint */}
      <div style={{ textAlign: "center", marginTop: 16, opacity: hintVisible ? 1 : 0, transition: "opacity .8s", pointerEvents: "none" }}>
        <span style={{ fontFamily: "'Caveat'", fontSize: 15, color: C.accent, background: C.accentDim, padding: "5px 16px", borderRadius: 20 }}>
          ← scroll to explore more →
        </span>
      </div>

      {/* archive */}
      <div style={{ padding: `0 ${pad}px`, marginTop: 16 }}>
        <button
          onClick={() => setShowArchive(!showArchive)}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, color: C.accent, padding: "8px 0", borderBottom: `1px dashed ${C.accentMid}` }}
        >
          {showArchive ? "Hide" : "View Full"} Project Archive →
        </button>

        {showArchive && (
          <div style={{ marginTop: 16 }}>
            <ArchiveTable mobile={mobile} />
          </div>
        )}
      </div>
    </div>
  );
}