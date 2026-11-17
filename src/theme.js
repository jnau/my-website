/* ─── Light / dark theme ───
   Starts from the visitor's system setting. Pressing the toggle flips it and remembers the choice;
   flipping back to match the system forgets it, so the site follows the system again.
   index.html sets data-theme before the page paints, so there's no flash of the wrong theme. */
import { useSyncExternalStore } from "react";
import { PALETTES, themeCss } from "./tokens";

const KEY = "theme";
const root = document.documentElement;
const mq = window.matchMedia?.("(prefers-color-scheme: light)");
const systemTheme = () => (mq?.matches ? "light" : "dark");
const listeners = new Set();

const readSaved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const save = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* storage blocked */ } };

export const getTheme = () => (root.dataset.theme === "light" ? "light" : "dark");

function apply(t) {
  root.dataset.theme = t;
  root.style.background = "var(--c-bg)";
  listeners.forEach((f) => f());
}

export function initTheme() {
  const style = document.createElement("style");
  style.id = "theme-vars";
  style.textContent = themeCss();
  document.head.appendChild(style);
  const saved = readSaved();
  apply(saved === "light" || saved === "dark" ? saved : systemTheme());
  mq?.addEventListener?.("change", () => { if (!readSaved()) apply(systemTheme()); });
}

export function toggleTheme() {
  const next = getTheme() === "light" ? "dark" : "light";
  save(next === systemTheme() ? null : next);
  apply(next);
}

const subscribe = (f) => { listeners.add(f); return () => listeners.delete(f); };
export const useTheme = () => useSyncExternalStore(subscribe, getTheme);

/** Raw hex colors for the current theme, for canvas drawing. */
export const themeHex = (t = getTheme()) => PALETTES[t];
