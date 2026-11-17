/* ─── Design Tokens ───
   Two palettes, one set of names. Components use `C.*`, which are CSS variables, so switching
   themes is just flipping <html data-theme="light|dark"> (see theme.js). Canvas code can't read
   CSS variables, so it reads the raw hex from PALETTES[theme] instead. */
export const PALETTES = {
  dark: {
    bg: "#080d18",
    bgAlt: "#0c1322",
    surface: "#111b2e",
    surfaceHov: "#162038",
    border: "#1a2744",
    muted: "#475b7a",
    text: "#8a9ab5",
    bright: "#cad5e8",
    heading: "#e0e7f3",
    accent: "#6db89f",
    wc: ["#c9a96e", "#88b89a", "#a990c0", "#c98e8e", "#78aec8", "#c4b55e"],
    teal: "#78c8b4",
    tan: "#d4a574",
    sbs: ["#78aec8", "#cad5e8", "#c98e8e", "#8a9ab5", "#88b89a", "#d4a5b8"],
    futureBg: "#1a1a2e",
    futureBg2: "#2a1a3e",
    navBg: "rgba(8,13,24,0.92)",
    overlayBg: "rgba(8,13,24,0.95)",
    scrim: "rgba(8,13,24,0.92)",
    scrimSoft: "rgba(8,13,24,0.5)",
    lightbox: "rgba(4,6,12,0.92)",
    shadow: "rgba(0,0,0,0.3)",
    shadowStrong: "rgba(0,0,0,0.35)",
    logoGlow: "rgba(255,255,255,0.3)",
    cardBorder: "#1a2744",
    accentSoft: "rgba(109,184,159,0.07)",
    accentDim: "rgba(109,184,159,0.12)",
    accentMid: "rgba(109,184,159,0.3)",
    glow: "rgba(109,184,159,0.15)",
    scrimMid: "rgba(8,13,24,0.6)",
  },
  light: {
    bg: "#ffffff",
    bgAlt: "#f3f6fa",
    surface: "#f7f9fc",
    surfaceHov: "#f7f9fc",
    border: "#d5dce6",
    muted: "#7a8699",
    text: "#475266",
    bright: "#2a3242",
    heading: "#121a2b",
    accent: "#2f8a6c",
    wc: ["#9a7434", "#3f8a5c", "#7a5ea0", "#b05a5a", "#2f74a0", "#8c7a1c"],
    teal: "#2a8f7c",
    tan: "#a86a2c",
    sbs: ["#2f74a0", "#3a4658", "#b05a5a", "#7a8699", "#3f8a5c", "#b5628a"],
    futureBg: "#fbf8f1",
    futureBg2: "#f6efe0",
    navBg: "rgba(255,255,255,0.9)",
    overlayBg: "rgba(255,255,255,0.97)",
    scrim: "rgba(255,255,255,0.97)",
    scrimSoft: "rgba(255,255,255,0.7)",
    lightbox: "rgba(250,251,253,0.96)",
    shadow: "rgba(15,30,60,0.08)",
    shadowStrong: "rgba(15,30,60,0.14)",
    logoGlow: "rgba(15,30,60,0.15)",
    cardBorder: "#c5cedb",
    accentSoft: "rgba(47,138,108,0.10)",
    accentDim: "rgba(47,138,108,0.15)",
    accentMid: "rgba(47,138,108,0.6)",
    glow: "rgba(47,138,108,0.28)",
    scrimMid: "rgba(255,255,255,0.85)",
  },
};

const v = (k) => `var(--c-${k})`;

/** A color at `pct`% strength over transparent. Works with CSS variables and hex alike. */
export const mix = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

const D = PALETTES.dark;
export const C = {
  ...Object.fromEntries(Object.keys(D).filter((k) => typeof D[k] === "string").map((k) => [k, v(k)])),
  wc: D.wc.map((_, i) => v(`wc${i}`)),
  sbs: D.sbs.map((_, i) => v(`sbs${i}`)),
  gold: v("wc0"),
};

/* Content files (e.g. gallery.json) name colors by their dark-theme hex. This swaps a known
   palette hex for its theme variable so it adapts too; unknown colors pass through. */
const HEX_TO_VAR = {};
Object.entries(D).forEach(([k, val]) => {
  if (Array.isArray(val)) val.forEach((h, i) => { HEX_TO_VAR[h.toLowerCase()] ??= v(`${k}${i}`); });
  else if (val.startsWith("#")) HEX_TO_VAR[val.toLowerCase()] ??= v(k);
});
export const tc = (color) => (color && HEX_TO_VAR[color.toLowerCase()]) || color;

/** CSS that defines every --c-* variable for both themes. */
export function themeCss() {
  const block = (p) => Object.entries(p)
    .flatMap(([k, val]) => (Array.isArray(val) ? val.map((h, i) => `--c-${k}${i}:${h}`) : [`--c-${k}:${val}`]))
    .join(";");
  return `:root,:root[data-theme="dark"]{${block(PALETTES.dark)};color-scheme:dark}`
    + `:root[data-theme="light"]{${block(PALETTES.light)};color-scheme:light}`;
}
