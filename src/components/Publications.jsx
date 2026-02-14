import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { C } from "../tokens";
import { Reveal } from "../primitives/Reveal";
import { SecHead } from "../primitives/SecHead";
import pubsData from "../data/publications.json";

/* ─── Publication list item ─── */
function PubItem({ pub, delay = 0, active, onClick }) {
  const [h, setH] = useState(false);
  const highlight = active || h;

  return (
    <Reveal delay={delay}>
      <div
        onClick={onClick}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          padding: "14px 16px", borderRadius: 10,
          borderLeft: `2px solid ${active ? C.accent : highlight ? C.accent : C.border}`,
          background: active ? `${C.accent}12` : highlight ? C.accentDim : "transparent",
          transition: "all .3s", cursor: "pointer", marginBottom: 8,
        }}
      >
        <div style={{ fontFamily: "'DM Sans'", fontSize: 15, fontWeight: 500, color: highlight ? C.heading : C.bright }}>{pub.title}</div>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.text, marginTop: 4 }}>{pub.authors}</div>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.muted, marginTop: 3 }}>
          <span style={{ fontStyle: "italic" }}>{pub.journal}</span> · {pub.year}
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Desktop sidebar panel ─── */
function SidePanel({ pub, onClose }) {
  const panelRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!pub.citation) return;
    navigator.clipboard.writeText(pub.citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: 360,
        minWidth: 360,
        borderLeft: `1px solid ${C.border}`,
        background: C.surface,
        padding: "28px 24px",
        overflowY: "auto",
        animation: "slidePanelIn .3s ease both",
      }}
    >
      <style>{`
        @keyframes slidePanelIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* close button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans'", fontSize: 18, color: C.muted,
            padding: "4px 8px", borderRadius: 6,
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = C.bright)}
          onMouseLeave={(e) => (e.target.style.color = C.muted)}
        >
          ×
        </button>
      </div>

      {/* title */}
      <h3 style={{
        fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 600,
        color: C.heading, lineHeight: 1.3, margin: 0,
      }}>
        {pub.title}
      </h3>

      {/* journal + year */}
      <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.muted, marginTop: 6 }}>
        <span style={{ fontStyle: "italic" }}>{pub.journal}</span> · {pub.year}
      </div>

      {/* summary */}
      {pub.summary && (
        <p style={{
          fontFamily: "'DM Sans'", fontSize: 13, color: C.text,
          lineHeight: 1.7, marginTop: 16,
        }}>
          {pub.summary}
        </p>
      )}

      {/* link */}
      {pub.url && (
        <a
          href={pub.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontFamily: "'DM Sans'", fontSize: 12, color: C.accent,
            textDecoration: "none", marginTop: 16,
          }}
        >
          <span>↗</span> View Publication
        </a>
      )}

      {/* citation */}
      {pub.citation && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <span style={{
              fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 600,
              color: C.muted, letterSpacing: 1, textTransform: "uppercase",
            }}>
              Citation
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: "none", border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                fontFamily: "'DM Sans'", fontSize: 10, color: copied ? C.accent : C.muted,
                transition: "all .2s",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{
            fontFamily: "'DM Sans'", fontSize: 12, color: C.text,
            lineHeight: 1.6, background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: 12,
          }}>
            {pub.citation}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile bottom sheet ─── */
function BottomSheet({ pub, onClose }) {
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!pub.citation) return;
    navigator.clipboard.writeText(pub.citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* lock body scroll while sheet is open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* close on backdrop click */
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        animation: "sheetBackdropIn .25s ease both",
      }}
    >
      <style>{`
        @keyframes sheetBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      <div
        ref={sheetRef}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          maxHeight: "70vh", overflowY: "auto",
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          borderRadius: "16px 16px 0 0",
          padding: "20px 20px 32px",
          animation: "sheetSlideUp .3s ease both",
        }}
      >
        {/* drag handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>

        {/* close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'DM Sans'", fontSize: 18, color: C.muted, padding: "4px 8px",
            }}
          >
            ×
          </button>
        </div>

        {/* title */}
        <h3 style={{
          fontFamily: "'Cormorant Garamond'", fontSize: 19, fontWeight: 600,
          color: C.heading, lineHeight: 1.3, margin: 0,
        }}>
          {pub.title}
        </h3>

        {/* journal + year */}
        <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.muted, marginTop: 6 }}>
          <span style={{ fontStyle: "italic" }}>{pub.journal}</span> · {pub.year}
        </div>

        {/* summary */}
        {pub.summary && (
          <p style={{
            fontFamily: "'DM Sans'", fontSize: 13, color: C.text,
            lineHeight: 1.7, marginTop: 14,
          }}>
            {pub.summary}
          </p>
        )}

        {/* link */}
        {pub.url && (
          <a
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontFamily: "'DM Sans'", fontSize: 12, color: C.accent,
              textDecoration: "none", marginTop: 14,
            }}
          >
            <span>↗</span> View Publication
          </a>
        )}

        {/* citation */}
        {pub.citation && (
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{
                fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 600,
                color: C.muted, letterSpacing: 1, textTransform: "uppercase",
              }}>
                Citation
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: "none", border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                  fontFamily: "'DM Sans'", fontSize: 10, color: copied ? C.accent : C.muted,
                  transition: "all .2s",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{
              fontFamily: "'DM Sans'", fontSize: 12, color: C.text,
              lineHeight: 1.6, background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 12,
            }}>
              {pub.citation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export function Publications({ mobile, innerStyle }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const selectedPub = selectedIdx !== null ? pubsData.items[selectedIdx] : null;

  const handleSelect = (i) => {
    setSelectedIdx((prev) => (prev === i ? null : i));
  };

  const handleClose = () => setSelectedIdx(null);

  /* close on click outside (desktop) */
  const containerRef = useRef(null);
  useEffect(() => {
    if (mobile || selectedIdx === null) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedIdx(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobile, selectedIdx]);

  return (
    <div style={innerStyle(selectedPub && !mobile ? 1060 : 680)}>
      <SecHead num="04" title="Publications" mobile={mobile} />

      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: selectedPub && !mobile ? 24 : 0,
          transition: "gap .3s ease",
        }}
      >
        {/* publication list */}
        <div style={{
          flex: 1,
          minWidth: 0,
          transition: "flex .3s ease",
        }}>
          {pubsData.items.map((pub, i) => (
            <PubItem
              key={i}
              pub={pub}
              delay={0.05 + i * 0.07}
              active={selectedIdx === i}
              onClick={() => handleSelect(i)}
            />
          ))}
          <Reveal delay={0.35}>
            <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.muted, marginTop: 24, fontStyle: "italic", cursor: "pointer" }}>
              <a href={pubsData.scholarUrl} style={{ color: "inherit", textDecoration: "none" }}>
                Full publication list on Google Scholar →
              </a>
            </p>
          </Reveal>
        </div>

        {/* desktop sidebar */}
        {selectedPub && !mobile && (
          <SidePanel pub={selectedPub} onClose={handleClose} />
        )}
      </div>

      {/* mobile bottom sheet — portaled to body */}
      {selectedPub && mobile && createPortal(
        <BottomSheet pub={selectedPub} onClose={handleClose} />,
        document.body
      )}
    </div>
  );
}