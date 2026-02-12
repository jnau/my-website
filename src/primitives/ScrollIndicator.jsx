import { useState, useEffect } from "react";
import { C } from "../tokens";

export function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const h = () => setVisible(window.scrollY < 100);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity: visible ? 1 : 0,
        transition: "opacity .5s ease",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontFamily: "'Caveat'", fontSize: 14, color: C.muted, letterSpacing: 0.5 }}>scroll down</span>
      <div style={{ animation: "bounce 2s ease infinite" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 7l6 6 6-6" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
