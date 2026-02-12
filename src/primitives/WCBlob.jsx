export function WCBlob({ color, size = 110, seed = 0, style = {} }) {
  const r = size / 2;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const j = 0.65 + Math.sin(seed * 4.1 + i * 2.3) * 0.35;
    return [r + Math.cos(a) * r * j, r + Math.sin(a) * r * j];
  });

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i <= pts.length; i++) {
    const [px, py] = pts[(i - 1) % pts.length];
    const [x, y] = pts[i % pts.length];
    d += ` Q ${(px + x) / 2 + Math.sin(seed + i) * 14} ${(py + y) / 2 + Math.cos(seed + i) * 14} ${x} ${y}`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "blur(1.2px)", ...style }}>
      <defs>
        <radialGradient id={`wcb${seed}`} cx="38%" cy="38%">
          <stop offset="0%" stopColor={color} stopOpacity=".75" />
          <stop offset="55%" stopColor={color} stopOpacity=".35" />
          <stop offset="100%" stopColor={color} stopOpacity=".08" />
        </radialGradient>
      </defs>
      <path d={`${d} Z`} fill={`url(#wcb${seed})`} />
    </svg>
  );
}
