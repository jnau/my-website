import { useState } from "react";
import { C } from "../tokens";
import { SecHead } from "../primitives/SecHead";
import { useReveal } from "../hooks/useReveal";
import projectsData from "../data/projects.json";

const PROJECTS = projectsData.featured;
const ARCHIVE = projectsData.archived;

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

/* ─── Project Card ─── */
function ProjectCard({ proj, index, mobile }) {
  const [h, setH] = useState(false);
  const [ref, vis] = useReveal(0.1);
  const w = mobile ? 280 : 340;
  const DemoComp = proj.demo ? DEMO_MAP[proj.demo] : null;

  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: `opacity .6s ease ${index * 0.06}s, transform .6s ease ${index * 0.06}s` }}>
      <div
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: w, borderRadius: 14, border: `1px solid ${h ? C.accentMid : C.border}`,
          background: h ? C.surfaceHov : C.surface,
          padding: mobile ? 20 : 24, display: "flex", flexDirection: "column",
          transition: "all .35s ease", transform: h ? "translateY(-6px)" : "none",
          boxShadow: h ? "0 12px 36px rgba(0,0,0,.3)" : "none",
          cursor: "pointer", position: "relative", overflow: "hidden", minHeight: mobile ? 180 : 220,
        }}
      >
        <div style={{ position: "absolute", top: -40, right: -40, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${C.accentDim},transparent 70%)`, opacity: h ? 1 : 0, transition: "opacity .4s" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: mobile ? 18 : 20, fontWeight: 600, color: C.heading, margin: 0, flex: 1 }}>{proj.title}</h3>
          <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: C.muted, marginLeft: 8 }}>{proj.year}</span>
        </div>
        <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.text, lineHeight: 1.7, marginTop: 8, flex: 1, position: "relative" }}>{proj.desc}</p>
        {DemoComp && (
          <div style={{ marginTop: 12, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, padding: 12, position: "relative" }}>
            <DemoComp />
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12, position: "relative" }}>
          {proj.tags.map((t) => (
            <span key={t} style={{ fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 500, color: C.accent, background: C.accentDim, borderRadius: 20, padding: "3px 9px" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export function Projects({ mobile, pad }) {
  const [showArchive, setShowArchive] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: 1100, padding: `${mobile ? 40 : 50}px 0` }}>
      <div style={{ padding: `0 ${pad}px` }}>
        <SecHead num="03" title="Projects" mobile={mobile} />
      </div>

      {/* horizontal scroll */}
      <div className="hide-scroll" style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", padding: "8px 0 20px" }}>
        <div style={{ display: "flex", gap: mobile ? 12 : 16, paddingLeft: pad, paddingRight: pad, width: "max-content" }}>
          {PROJECTS.map((proj, i) => (
            <ProjectCard key={i} proj={proj} index={i} mobile={mobile} />
          ))}
        </div>
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
          <div style={{ marginTop: 16, overflowX: "auto", animation: "fadeUp .4s ease both" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans'", minWidth: mobile ? 500 : "auto" }}>
              <thead>
                <tr>
                  {["Year", "Project", "Built with"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...PROJECTS, ...ARCHIVE]
                  .sort((a, b) => (b.year || "0").localeCompare(a.year || "0"))
                  .map((p, i) => (
                    <tr key={i} onMouseEnter={(e) => (e.currentTarget.style.background = C.accentDim)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{p.year}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: C.bright }}>{p.title}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {(p.tags || []).map((t) => (
                            <span key={t} style={{ fontSize: 10, color: C.accent, background: C.accentDim, borderRadius: 10, padding: "2px 7px" }}>{t}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        
      </div>
    </div>
  );
}
