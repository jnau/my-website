import { useState, useEffect, useRef } from "react";

export function useActiveSection() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = refs.current.indexOf(e.target);
            if (i !== -1) setActive(i);
          }
        }),
      { threshold: 0.35 }
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return { active, refs };
}
