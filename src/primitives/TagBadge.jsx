import { useState } from "react";
import { C } from "../tokens";

export function TagBadge({ tag, color: colorProp, size = "sm", onClick, active = true, dim = false }) {
  const [hov, setHov] = useState(false);
  const color = colorProp || C.accent;
  const isBtn = !!onClick;
  const sz = size === "sm" ? { fs: 10, px: 8, py: 2 } : { fs: 12, px: 10, py: 3 };

  return (
    <span
      onClick={isBtn ? (e) => { e.stopPropagation(); onClick(tag); } : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'DM Sans'",
        fontSize: sz.fs,
        fontWeight: 500,
        color: dim ? C.muted : active ? color : C.muted,
        background: dim ? `${C.muted}10` : active ? (hov && isBtn ? `${color}28` : `${color}18`) : `${C.muted}12`,
        borderRadius: 20,
        padding: `${sz.py}px ${sz.px}px`,
        letterSpacing: 0.3,
        cursor: isBtn ? "pointer" : "default",
        transition: "all .25s ease",
        border: `1px solid ${dim ? "transparent" : active && hov && isBtn ? `${color}44` : "transparent"}`,
        whiteSpace: "nowrap",
      }}
    >
      {tag}
    </span>
  );
}
