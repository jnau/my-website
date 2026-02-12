import { C } from "../tokens";
import { Reveal } from "../primitives/Reveal";
import { SecHead } from "../primitives/SecHead";
import siteData from "../data/site.json";

export function About({ mobile, innerStyle }) {
  const { paragraphs, photoPlaceholder } = siteData.about;

  const photoStyle = (w, h) => ({
    width: w, height: h, borderRadius: 12,
    background: `linear-gradient(135deg,${C.surface},${C.bgAlt})`,
    border: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Caveat'", fontSize: mobile ? 14 : 16, color: C.muted,
    position: "relative", overflow: "hidden",
  });

  return (
    <div style={innerStyle(680)}>
      <SecHead num="01" title="About" mobile={mobile} />
      <div style={{ display: mobile ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: "1fr 200px", gap: mobile ? 24 : 40, alignItems: "start" }}>
        {mobile && (
          <Reveal>
            <div style={{ ...photoStyle(140, 180), marginLeft: "auto", marginRight: "auto" }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${C.accentDim},transparent)` }} />
              <span style={{ position: "relative" }}>{photoPlaceholder}</span>
            </div>
          </Reveal>
        )}
        <div>
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 + i * 0.1}>
              <p
                style={{ fontFamily: "'DM Sans'", fontSize: mobile ? 14 : 15, lineHeight: 1.85, color: C.text, marginTop: i > 0 ? 16 : 0 }}
                dangerouslySetInnerHTML={{ __html: p.replace(/<strong>/g, `<span style="color:${C.bright}">`).replace(/<\/strong>/g, "</span>") }}
              />
            </Reveal>
          ))}
        </div>
        {!mobile && (
          <Reveal delay={0.3} dir="right">
            <div style={photoStyle(200, 260)}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${C.accentDim},transparent)` }} />
              <span style={{ position: "relative" }}>{photoPlaceholder}</span>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
