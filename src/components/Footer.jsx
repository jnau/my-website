import { C } from "../tokens";
import { Reveal } from "../primitives/Reveal";
import siteData from "../data/site.json";

export function Footer({ mobile, pad }) {
  return (
    <footer style={{ padding: `${mobile ? 40 : 60}px ${pad}px`, textAlign: "center", position: "relative", zIndex: 1 }}>
      <Reveal>
        <div style={{ width: 60, height: 1, background: C.border, margin: "0 auto 20px" }} />
        <p style={{ fontFamily: "'Caveat'", fontSize: 17, color: C.muted }}>{siteData.footer.credit}</p>
        <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.border, marginTop: 8 }}>{siteData.footer.sub}</p>
      </Reveal>
    </footer>
  );
}
