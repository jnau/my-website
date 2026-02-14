import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { C } from "../tokens";
import { SecHead } from "../primitives/SecHead";
import { useReveal } from "../hooks/useReveal";
import projectsData from "../data/projects.json";

const PROJECTS = projectsData.featured;
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
function SigBarsDemo() {
  const bars = [0.9, 0.45, 0.7, 0.25, 0.6, 0.35, 0.8, 0.15, 0.55, 0.4, 0.65, 0.3, 0.5, 0.72, 0.2, 0.85];
  const cols = ["#6db89f", "#c9a96e", "#78aec8", "#c98e8e", "#a990c0", "#6db89f"];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: "2px 2px 0 0", background: cols[i % cols.length], opacity: 0.7, animation: `sigP 2.5s ease-in-out ${i * 0.1}s infinite alternate` }} />
      ))}
    </div>
  );
}

function GenomeDotsDemo() {
  const bases = "ACGTACGATCGTAGCTACGTAGCATCGA";
  const bc = { A: "#6db89f", C: "#78aec8", G: "#c9a96e", T: "#c98e8e" };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {bases.split("").map((b, i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: bc[b], opacity: 0.6, animation: `dotF 3s ease ${i * 0.08}s infinite alternate` }} />
      ))}
    </div>
  );
}

function PipelineDemo() {
  const steps = ["Search", "→", "Classify", "→", "Extract", "→", "Chat"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans'", fontSize: 11 }}>
      {steps.map((s, i) =>
        s === "→" ? (
          <span key={i} style={{ color: C.accent, animation: `arrP 1.5s ease ${i * 0.15}s infinite` }}>→</span>
        ) : (
          <span key={i} style={{ background: C.accentDim, color: C.accent, padding: "3px 8px", borderRadius: 5, fontWeight: 500 }}>{s}</span>
        )
      )}
    </div>
  );
}

function DashboardDemo() {
  const rows = [0.7, 0.45, 0.9, 0.6, 0.35];
  const cols = ["#6db89f", "#78aec8", "#c9a96e", "#a990c0", "#c98e8e"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rows.map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: cols[i], opacity: 0.8 }} />
          <div style={{ height: 6, borderRadius: 3, background: `${cols[i]}44`, flex: 1, position: "relative", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${w * 100}%`, borderRadius: 3, background: cols[i], opacity: 0.7, animation: `sigP 2.5s ease-in-out ${i * 0.2}s infinite alternate` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ComingSoonDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, fontFamily: "'Caveat'", fontSize: 15, color: C.accent, letterSpacing: 1.5, opacity: 0.7, animation: "sigP 2s ease-in-out infinite alternate" }}>
      coming soon ✨
    </div>
  );
}

const DEMO_MAP = { sigbars: SigBarsDemo, pipeline: PipelineDemo, dots: GenomeDotsDemo, dashboard: DashboardDemo, comingsoon: ComingSoonDemo };

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
function ProjectCard({ proj, index, mobile }) {
  const [ref, vis] = useReveal(0.1);
  const w = mobile ? 280 : 340;
  const DemoComp = proj.demo ? DEMO_MAP[proj.demo] : null;
  const hasLinks = proj.github || proj.url;

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
          <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: mobile ? 18 : 20, fontWeight: 600, color: C.heading, margin: 0, flex: 1 }}>{proj.title}</h3>
          <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: C.muted, marginLeft: 8 }}>{proj.year}</span>
        </div>
        <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.text, lineHeight: 1.7, marginTop: 8, flex: 1 }}>{proj.desc}</p>
        {DemoComp && (
          <div style={{ marginTop: 12, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, padding: 12 }}>
            <DemoComp />
          </div>
        )}
        {hasLinks && (
          <div style={{ display: "flex", alignItems: "center", gap: mobile ? 12 : 16, marginTop: 12 }}>
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
          </div>
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
      </div>

      {/* horizontal scroll */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="hide-scroll"
        style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", padding: "8px 0 20px" }}
      >
        <div style={{ display: "flex", gap: mobile ? 12 : 16, paddingLeft: sidePad, paddingRight: sidePad, width: "max-content" }}>
          {PROJECTS.map((proj, i) => (
            <ProjectCard key={i} proj={proj} index={i} mobile={mobile} />
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