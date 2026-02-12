import { useState, useEffect, useRef } from "react";

export function useReveal(th = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          obs.unobserve(el);
        }
      },
      { threshold: th }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [th]);

  return [ref, v];
}
