import { useState, useEffect } from "react";

export function useScreen() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  return { w, mobile: w < 768, tablet: w >= 768 && w < 1024 };
}
