import { useState, useEffect } from "react";
import { C } from "../tokens";
import siteData from "../data/site.json";

const SECTIONS = siteData.navSections;

/* ─── Logo ─── */
function NavLogo({ scrolled }) {
  const [hov, setHov] = useState(false);
  const [src] = useState(() => {
    const imgs = siteData.logoImages;
    if (!imgs || imgs.length === 0) return null;
    return imgs[Math.floor(Math.random() * imgs.length)];
  });

  const size = scrolled ? 36 : 72;
  const radius = "50%";

  if (src) {
    return (
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: size, height: size, borderRadius: radius, overflow: "hidden",
          border: `2px solid ${hov ? C.accent : scrolled ? C.border : "transparent"}`,
          transition: "all .45s cubic-bezier(.22,1,.36,1)",
          transform: hov ? "scale(1.08)" : "scale(1)",
          boxShadow: hov
            ? `0 0 20px ${C.accentDim}`
            : scrolled ? "none" : "0 4px 24px rgba(255, 255, 255, 0.3)",
          position: "relative",
        }}
      >
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }

  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'Cormorant Garamond'", fontSize: scrolled ? 20 : 32, fontWeight: 600,
        color: hov ? C.accent : C.heading, transition: "all .45s cubic-bezier(.22,1,.36,1)",
      }}
    >JA</span>
  );
}

/* ─── Top Navigation ─── */
export function TopNav({ active, onNav, mobile }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!mobile) setMenuOpen(false);
  }, [mobile]);

  const navTo = (i) => { onNav(i); setMenuOpen(false); };

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: mobile ? "0 20px" : "0 48px", height: scrolled ? (mobile ? 54 : 60) : (mobile ? 80 : 96),
          background: scrolled || menuOpen ? "rgba(8,13,24,0.92)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(16px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(16px) saturate(1.4)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
          transition: "all .4s ease",
        }}
      >
        <button onClick={() => navTo(0)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          <NavLogo scrolled={scrolled} />
        </button>

        {mobile ? (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5, zIndex: 110 }}
          >
            <span style={{ width: 22, height: 2, background: C.bright, borderRadius: 1, transition: "all .3s", transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ width: 22, height: 2, background: C.bright, borderRadius: 1, transition: "all .3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ width: 22, height: 2, background: C.bright, borderRadius: 1, transition: "all .3s", transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        ) : (
          <nav style={{ display: "flex", gap: 8 }}>
            {SECTIONS.slice(1).map((s, i) => {
              const idx = i + 1;
              const on = idx === active;
              return (
                <button
                  key={s}
                  onClick={() => navTo(idx)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500,
                    color: on ? C.accent : C.muted, padding: "8px 14px", borderRadius: 6,
                    position: "relative", transition: "color .3s", letterSpacing: 0.3,
                  }}
                  onMouseEnter={(e) => { if (!on) e.target.style.color = C.bright; }}
                  onMouseLeave={(e) => { if (!on) e.target.style.color = C.muted; }}
                >
                  {s}
                  <span style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", width: on ? 16 : 0, height: 1.5, borderRadius: 1, background: C.accent, transition: "width .35s ease" }} />
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* mobile overlay */}
      {mobile && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99,
            background: "rgba(8,13,24,0.95)", backdropFilter: "blur(20px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none",
            transition: "opacity .3s ease",
          }}
        >
          {SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => navTo(i)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Cormorant Garamond'", fontSize: 28, fontWeight: 400,
                color: i === active ? C.accent : C.bright, padding: "12px 24px",
                transition: "color .3s", letterSpacing: 0.5,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </>
  );
}