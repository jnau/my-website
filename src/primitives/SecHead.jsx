import { C } from "../tokens";
import { Reveal } from "./Reveal";

export function SecHead({ num, title, mobile }) {
  return (
    <Reveal>
      <div style={{ display: "flex", alignItems: "center", gap: mobile ? 10 : 14, marginBottom: mobile ? 32 : 48 }}>
        <span style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: C.accent, letterSpacing: 1.5 }}>{num}</span>
        <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: mobile ? 24 : 30, fontWeight: 600, color: C.heading }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)`, marginLeft: 8 }} />
      </div>
    </Reveal>
  );
}
