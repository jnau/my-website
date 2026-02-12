import { useState } from "react";
import { C } from "../tokens";
import { Reveal } from "../primitives/Reveal";
import { SecHead } from "../primitives/SecHead";
import pubsData from "../data/publications.json";

function PubItem({ pub, delay = 0 }) {
  const [h, setH] = useState(false);

  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          padding: "14px 16px", borderRadius: 10,
          borderLeft: `2px solid ${h ? C.accent : C.border}`,
          background: h ? C.accentDim : "transparent",
          transition: "all .3s", cursor: "pointer", marginBottom: 8,
        }}
      >
        <div style={{ fontFamily: "'DM Sans'", fontSize: 15, fontWeight: 500, color: h ? C.heading : C.bright }}>{pub.title}</div>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.text, marginTop: 4 }}>{pub.authors}</div>
        <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: C.muted, marginTop: 3 }}>
          <span style={{ fontStyle: "italic" }}>{pub.journal}</span> · {pub.year}
        </div>
      </div>
    </Reveal>
  );
}

export function Publications({ mobile, innerStyle }) {
  return (
    <div style={innerStyle(680)}>
      <SecHead num="04" title="Publications" mobile={mobile} />
      {pubsData.items.map((pub, i) => (
        <PubItem key={i} pub={pub} delay={0.05 + i * 0.07} />
      ))}
      <Reveal delay={0.35}>
        <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: C.muted, marginTop: 24, fontStyle: "italic", cursor: "pointer" }}>
          <a href={pubsData.scholarUrl} style={{ color: "inherit", textDecoration: "none" }}>
            Full publication list on Google Scholar →
          </a>
        </p>
      </Reveal>
    </div>
  );
}
