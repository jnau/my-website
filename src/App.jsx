import { useCallback } from "react";
import { C } from "./tokens";
import { useScreen } from "./hooks/useScreen";
import { useActiveSection } from "./hooks/useActiveSection";
import { TopNav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Experience } from "./components/Experience";
import { Projects } from "./components/Projects";
import { Publications } from "./components/Publications";
import { Gallery } from "./components/Gallery";
import { Footer } from "./components/Footer";

export default function App() {
  const { w, mobile, tablet } = useScreen();
  const { active, refs } = useActiveSection();
  const scrollTo = useCallback((i) => { refs.current[i]?.scrollIntoView({ behavior: "smooth" }); }, []);
  const reg = (i) => (el) => { refs.current[i] = el; };

  const pad = mobile ? 20 : 60;
  const sectionStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
    scrollMarginTop: mobile ? 54 : 60,
  };
  const innerStyle = (maxW = 680) => ({
    maxWidth: maxW,
    padding: `${mobile ? 60 : 80}px ${pad}px`,
    width: "100%",
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, position: "relative" }}>
      <TopNav active={active} onNav={scrollTo} mobile={mobile} />

      {/* ambient glow */}
      {!mobile && (
        <div style={{ position: "fixed", top: "20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${C.accentDim},transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      )}

      {/* Hero */}
      <section ref={reg(0)} style={sectionStyle}>
        <Hero mobile={mobile} tablet={tablet} pad={pad} />
      </section>

      {/* About */}
      <section ref={reg(1)} style={sectionStyle}>
        <About mobile={mobile} innerStyle={innerStyle} />
      </section>

      {/* Experience */}
      <section ref={reg(2)} style={{ ...sectionStyle, alignItems: "center" }}>
        <Experience mobile={mobile} screenW={w} pad={pad} />
      </section>

      {/* Projects */}
      <section ref={reg(3)} style={{ ...sectionStyle, alignItems: "center" }}>
        <Projects mobile={mobile} pad={pad} />
      </section>

      {/* Publications */}
      <section ref={reg(4)} style={sectionStyle}>
        <Publications mobile={mobile} innerStyle={innerStyle} />
      </section>

      {/* Gallery / Beyond the Lab */}
      <section ref={reg(5)} style={sectionStyle}>
        <Gallery mobile={mobile} innerStyle={innerStyle} />
      </section>

      <Footer mobile={mobile} pad={pad} />
    </div>
  );
}
