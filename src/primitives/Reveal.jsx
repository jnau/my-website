import { useReveal } from "../hooks/useReveal";

export function Reveal({ children, delay = 0, dir = "up", style = {} }) {
  const [ref, v] = useReveal(0.1);
  const t = {
    up: "translateY(32px)",
    down: "translateY(-32px)",
    left: "translateX(-32px)",
    right: "translateX(32px)",
    none: "none",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "none" : t[dir],
        transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
