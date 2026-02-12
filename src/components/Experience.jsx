import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../tokens";
import { SecHead } from "../primitives/SecHead";
import EXPERIENCES from "../data/experiences.json";

export function Experience({ mobile, screenW, pad }) {
  return (
    <div style={{ width: "100%", maxWidth: 1100, padding: `${mobile ? 60 : 80}px 0` }}>
      <div style={{ padding: `0 ${pad}px` }}>
        <SecHead num="02" title="Experience" mobile={mobile} />
      </div>
      <DockTimeline mobile={mobile} screenW={screenW} />
    </div>
  );
}

function DockTimeline({ mobile, screenW }) {
  const trackRef = useRef(null);
  const [cardCenters, setCardCenters] = useState([]);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const mounted = useRef(false);

  const CARD_W = mobile ? 270 : 320;
  const CARD_GAP = mobile ? 14 : 20;
  const sidePad = screenW / 2 - CARD_W / 2;
  const totalTrackW = sidePad * 2 + EXPERIENCES.length * (CARD_W + CARD_GAP) - CARD_GAP;

  useEffect(() => {
    const centers = EXPERIENCES.map((_, i) => sidePad + i * (CARD_W + CARD_GAP) + CARD_W / 2);
    setCardCenters(centers);
  }, [screenW, mobile]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      const recentIdx = EXPERIENCES.length - 2;
      const center = sidePad + recentIdx * (CARD_W + CARD_GAP) + CARD_W / 2;
      el.scrollLeft = center - el.clientWidth / 2;
      setScrollLeft(el.scrollLeft);
      setTrackWidth(el.clientWidth);
      setTimeout(() => { mounted.current = true; }, 250);
    }, 120);
    return () => clearTimeout(timer);
  }, [screenW]);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setScrollLeft(el.scrollLeft);
    setTrackWidth(el.clientWidth);
    if (mounted.current && hintVisible) setHintVisible(false);
  }, [hintVisible]);

  const getScale = (i) => {
    if (!trackWidth || !cardCenters[i]) return 1;
    const dist = Math.abs(cardCenters[i] - (scrollLeft + trackWidth / 2));
    const t = Math.max(0, 1 - dist / (CARD_W * 2));
    const e = t * t * (3 - 2 * t);
    return 0.78 + e * 0.27;
  };

  const getOpacity = (i) => {
    if (!trackWidth || !cardCenters[i]) return 0.6;
    const dist = Math.abs(cardCenters[i] - (scrollLeft + trackWidth / 2));
    return 0.25 + Math.max(0, 1 - dist / (CARD_W * 2.2)) * 0.75;
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div ref={trackRef} onScroll={handleScroll} className="hide-scroll" style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", padding: "40px 0 24px", cursor: "grab" }}>
        <div style={{ width: totalTrackW, position: "relative", height: mobile ? 330 : 370 }}>
          {/* timeline bar */}
          <div style={{ position: "absolute", top: "50%", left: sidePad, right: sidePad, height: 1, background: `linear-gradient(90deg, transparent, ${C.border} 5%, ${C.border} 95%, transparent)`, transform: "translateY(-50%)", zIndex: 0 }}>
            {EXPERIENCES.map((_, i) => (
              <div key={i} style={{ position: "absolute", left: i * (CARD_W + CARD_GAP) + CARD_W / 2 - 3, top: -3, width: 7, height: 7, borderRadius: "50%", background: C.border, border: `1px solid ${C.muted}` }} />
            ))}
          </div>

          {/* cards */}
          {EXPERIENCES.map((exp, i) => {
            const scale = getScale(i);
            const opacity = getOpacity(i);
            const isNearest = scale > 1.0;
            const isFuture = exp.isFuture;

            return (
              <div key={i} style={{ position: "absolute", left: sidePad + i * (CARD_W + CARD_GAP), top: "50%", width: CARD_W, transform: `translateY(-50%) scale(${scale})`, opacity, transition: "transform .2s ease-out, opacity .25s ease-out", zIndex: isNearest ? 10 : 1 }}>
                <div style={{
                  borderRadius: 14,
                  border: `1px solid ${isFuture && isNearest ? "#c9a96e55" : isNearest ? C.accentMid : C.border}`,
                  background: isFuture ? `linear-gradient(135deg, ${C.surface}, #1a1a2e)` : isNearest ? C.surfaceHov : C.bg,
                  overflow: "hidden",
                  boxShadow: isNearest ? (isFuture ? "0 12px 48px rgba(201,169,110,0.12)" : `0 12px 48px rgba(109,184,159,0.15)`) : "0 2px 8px rgba(0,0,0,.3)",
                  transition: "border .3s, background .3s, box-shadow .3s",
                }}>
                  <div style={{ height: 56, background: isFuture ? "linear-gradient(135deg,#1a1a2e,#2a1a3e)" : `linear-gradient(135deg,${C.bgAlt},${C.surface})`, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {exp.img ? (
                      <img src={exp.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "'Caveat'", fontSize: isFuture ? 18 : 13, color: isFuture ? "#c9a96e" : C.border }}>{isFuture ? "✨" : "optional image"}</span>
                    )}
                  </div>
                  <div style={{ padding: mobile ? "14px 16px 16px" : "18px 22px 20px" }}>
                    <span style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 600, color: isFuture ? "#c9a96e" : C.accent, letterSpacing: 1, textTransform: "uppercase" }}>{exp.period}</span>
                    <h3 style={{ fontFamily: isFuture ? "'Caveat'" : "'Cormorant Garamond'", fontSize: isFuture ? 20 : 18, fontWeight: 600, color: isNearest ? C.heading : C.bright, marginTop: 5, lineHeight: 1.25 }}>{exp.role}</h3>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: isFuture ? "#c9a96e" : C.accent, marginTop: 2 }}>{exp.org}</div>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.text, lineHeight: 1.6, marginTop: 8, fontStyle: isFuture ? "italic" : "normal" }}>{exp.desc}</p>
                    {exp.tags && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                        {exp.tags.map((tag) => (
                          <span key={tag} style={{ fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 500, color: isFuture ? "#c9a96e" : C.accent, background: isFuture ? "rgba(201,169,110,0.1)" : C.accentDim, borderRadius: 12, padding: "2px 7px" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 4, opacity: hintVisible ? 1 : 0, transition: "opacity .8s", pointerEvents: "none" }}>
        <span style={{ fontFamily: "'Caveat'", fontSize: 15, color: C.accent, background: C.accentDim, padding: "5px 16px", borderRadius: 20 }}>← scroll to explore more →</span>
      </div>
    </div>
  );
}
