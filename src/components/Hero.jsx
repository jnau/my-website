import { C } from "../tokens";
import { ScrollIndicator } from "../primitives/ScrollIndicator";
import siteData from "../data/site.json";

export function Hero({ mobile, tablet, pad }) {
  return (
    <div style={{ maxWidth: 700, padding: `0 ${pad}px` }}>
      <div style={{ animation: "fadeUp .8s ease both" }}>
        <p style={{ fontFamily: "'DM Sans'", fontSize: mobile ? 13 : 15, fontWeight: 500, color: C.accent, letterSpacing: 2, marginBottom: mobile ? 12 : 16 }}>
          {siteData.greeting}
        </p>
      </div>
      <div style={{ animation: "fadeUp .8s ease .15s both" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: mobile ? 42 : tablet ? 56 : 72, fontWeight: 300, color: C.heading, lineHeight: 1.05, margin: 0 }}>
          {siteData.name}
        </h1>
      </div>
      <div style={{ animation: "fadeUp .8s ease .3s both" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: mobile ? 22 : tablet ? 32 : 40, fontWeight: 300, color: C.muted, lineHeight: 1.2, marginTop: 8 }}>
          {siteData.tagline.split("\n").map((line, i) => (
            <span key={i}>{line}{i === 0 && !mobile ? <br /> : " "}</span>
          ))}
        </h2>
      </div>
      <div style={{ animation: "fadeUp .8s ease .5s both" }}>
        <p
          style={{ fontFamily: "'DM Sans'", fontSize: mobile ? 14 : 16, lineHeight: 1.8, color: C.text, marginTop: mobile ? 16 : 24, maxWidth: 520 }}
          dangerouslySetInnerHTML={{ __html: siteData.intro.replace(/<strong>/g, `<span style="color:${C.bright}">`).replace(/<\/strong>/g, "</span>") }}
        />
      </div>
      <div style={{ animation: "fadeUp .8s ease .65s both", display: "flex", gap: mobile ? 16 : 20, marginTop: mobile ? 24 : 36 }}>
        {Object.entries(siteData.links).map(([label, href]) => (
          <a
            key={label}
            href={href}
            style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, color: C.muted, textDecoration: "none", letterSpacing: 0.5, borderBottom: "1px solid transparent", transition: "all .3s" }}
            onMouseEnter={(e) => { e.target.style.color = C.accent; e.target.style.borderBottomColor = C.accent; }}
            onMouseLeave={(e) => { e.target.style.color = C.muted; e.target.style.borderBottomColor = "transparent"; }}
          >
            {label}
          </a>
        ))}
      </div>
      <ScrollIndicator />
    </div>
  );
}
