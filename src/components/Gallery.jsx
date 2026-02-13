import { useState, useEffect } from "react";
import { C } from "../tokens";
import { Reveal } from "../primitives/Reveal";
import { SecHead } from "../primitives/SecHead";
import { TagBadge } from "../primitives/TagBadge";
import { WCBlob } from "../primitives/WCBlob";
import { useReveal } from "../hooks/useReveal";
import galleryData from "../data/gallery.json";

const CATEGORIES = galleryData.categories;
const ITEMS = galleryData.items;
const INITIAL_COUNT = 9;

/* ─── color lookups ─── */
const TAG_COLOR_MAP = {};
CATEGORIES.forEach((cat) => cat.tags.forEach((t) => { TAG_COLOR_MAP[t] = cat.color; }));
const getTagColor = (tag) => TAG_COLOR_MAP[tag] || C.accent;
const getCategoryForTag = (tag) => CATEGORIES.find((c) => c.tags.includes(tag)) || null;

/* ─── Tier 1: Category toggle ─── */
function CatButton({ name, active, color, onClick, mobile }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "'DM Sans'", fontSize: mobile ? 13 : 14, fontWeight: 500,
        color: active ? color : hov ? C.bright : C.muted,
        padding: mobile ? "8px 10px" : "8px 16px",
        position: "relative", transition: "color .3s", letterSpacing: 0.3,
      }}
    >
      {name}
      <span style={{
        position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
        width: active ? "60%" : 0, height: 2, borderRadius: 1,
        background: color, transition: "width .35s ease",
      }} />
    </button>
  );
}

function CategoryToggle({ activeCategory, onSelect, mobile }) {
  return (
    <Reveal delay={0.08}>
      <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 4 : 6, marginBottom: 0, flexWrap: "wrap" }}>
        <CatButton name="All" active={activeCategory === null} color={C.accent} onClick={() => onSelect(null)} mobile={mobile} />
        {CATEGORIES.map((cat) => (
          <CatButton key={cat.name} name={cat.name} active={activeCategory === cat.name} color={cat.color} onClick={() => onSelect(cat.name)} mobile={mobile} />
        ))}
      </div>
    </Reveal>
  );
}

/* ─── Tier 2: Hashtag row ─── */
function HashtagRow({ activeCategory, activeTag, onTagClick, mobile }) {
  if (!activeCategory) return null;
  const cat = CATEGORIES.find((c) => c.name === activeCategory);
  if (!cat) return null;
  const relevantTags = cat.tags.filter((t) => ITEMS.some((item) => item.tags.includes(t)));

  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: mobile ? 6 : 8, marginTop: mobile ? 8 : 12, animation: "fadeUp .35s ease both" }}>
      {relevantTags.map((tag) => (
        <TagBadge
          key={tag}
          tag={tag}
          color={getTagColor(tag)}
          size="md"
          active={activeTag === null || activeTag === tag}
          dim={activeTag !== null && activeTag !== tag}
          onClick={onTagClick}
        />
      ))}
    </div>
  );
}

/* ─── Gallery Image ─── */
function GalleryImage({ item, index, onClick, mobile, activeTag }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useReveal(0.1);
  const maxH = mobile ? 300 : 420;
  const placeholderH = mobile ? [160, 220, 180, 200, 170, 210][index % 6] : [240, 320, 260, 290, 250, 300][index % 6];
  const primaryColor = getTagColor(item.tags[0]);

  return (
    <div ref={ref} style={{ breakInside: "avoid", marginBottom: mobile ? 10 : 16, opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(28px)", transition: `opacity .6s ease ${index * 0.06}s, transform .6s ease ${index * 0.06}s` }}>
      <div
        onClick={() => onClick(index)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer",
          border: `1px solid ${hov ? primaryColor + "66" : C.border}`,
          transition: "all .4s ease",
          transform: hov ? "translateY(-4px)" : "none",
          boxShadow: hov ? "0 12px 36px rgba(0,0,0,.35)" : "0 2px 8px rgba(0,0,0,.2)",
        }}
      >
        {item.src ? (
          <img src={item.src} alt={item.caption} style={{ width: "100%", height: "auto", maxHeight: maxH, objectFit: "cover", display: "block", transition: "transform .5s ease", transform: hov ? "scale(1.04)" : "scale(1)" }} />
        ) : (
          <div style={{ width: "100%", height: placeholderH, background: `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}06, ${C.surface})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WCBlob color={primaryColor} size={mobile ? 70 : 100} seed={index + 20} />
          </div>
        )}

        {/* overlay: caption + tags */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mobile ? "32px 12px 10px" : "40px 16px 14px", background: "linear-gradient(transparent, rgba(8,13,24,0.92))", transition: "opacity .35s ease", opacity: hov ? 1 : 0.75 }}>
          <p style={{ fontFamily: "'DM Sans'", fontSize: mobile ? 12 : 13, color: C.bright, lineHeight: 1.5, marginBottom: 8, opacity: hov ? 1 : 0, maxHeight: hov ? 60 : 0, transition: "all .35s ease", overflow: "hidden" }}>
            {item.caption}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {item.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} color={getTagColor(tag)} size="sm" active={activeTag === null || activeTag === tag} />
            ))}
          </div>
        </div>

        {/* expand icon */}
        <div style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: 8, background: "rgba(8,13,24,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", opacity: hov ? 1 : 0, transition: "opacity .3s" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke={C.bright} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Show More pill ─── */
function ShowMoreBtn({ remaining, expanded, onClick, mobile }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: mobile ? 12 : 16 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          fontFamily: "'DM Sans'", fontSize: mobile ? 13 : 14, fontWeight: 500,
          color: hov ? C.bright : C.muted,
          background: hov ? "rgba(255,255,255,0.06)" : "transparent",
          border: `1px solid ${hov ? "rgba(255,255,255,0.15)" : C.border}`,
          borderRadius: 20, padding: mobile ? "8px 20px" : "10px 24px",
          cursor: "pointer", transition: "all .3s ease",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        {expanded ? "Show less" : `Show more (${remaining})`}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: "transform .3s", transform: expanded ? "rotate(180deg)" : "none" }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Lightbox ─── */
function Lightbox({ items, activeIndex, onClose, onPrev, onNext, onTagClick, mobile }) {
  const item = items[activeIndex];
  const [closeHov, setCloseHov] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose, onPrev, onNext]);

  const imgStyle = { display: "block", maxWidth: mobile ? "88vw" : "min(720px, 80vw)", maxHeight: mobile ? "52vh" : "58vh", width: "auto", height: "auto", objectFit: "contain" };
  const primaryColor = getTagColor(item.tags[0]);

  /* ── navigation arrow ── */
  const arrowBtn = (side, onClick) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        [side]: mobile ? 8 : 20,
        width: mobile ? 44 : 40, height: mobile ? 44 : 40,
        borderRadius: "50%",
        border: "1.5px solid rgba(255,255,255,0.15)",
        cursor: "pointer",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10010, WebkitTapHighlightColor: "transparent",
        transition: "background .2s ease",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {side === "left"
          ? <path d="M15 18l-6-6 6-6" stroke={C.bright} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M9 6l6 6-6 6" stroke={C.bright} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(4,6,12,0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp .25s ease both" }}>

      {/* ── Close button ── positioned below header ── */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        onMouseEnter={() => setCloseHov(true)}
        onMouseLeave={() => setCloseHov(false)}
        aria-label="Close lightbox"
        style={{
          position: "fixed",
          top: mobile ? 70 : 80,
          right: mobile ? 16 : 28,
          width: mobile ? 48 : 40, height: mobile ? 48 : 40,
          borderRadius: "50%",
          border: `1.5px solid rgba(255,255,255,${closeHov ? 0.35 : 0.2})`,
          cursor: "pointer",
          background: closeHov ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10010,
          WebkitTapHighlightColor: "transparent",
          transition: "background .2s ease, border-color .2s ease",
          padding: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke={C.bright} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* ── Prev / Next arrows ── */}
      {activeIndex > 0 && arrowBtn("left", onPrev)}
      {activeIndex < items.length - 1 && arrowBtn("right", onNext)}

      {/* ── Content ── */}
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: mobile ? 12 : 0 }}>
        <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
          {item.src ? (
            <img src={item.src} alt={item.caption} style={imgStyle} />
          ) : (
            <div style={{ width: mobile ? 280 : 480, height: mobile ? 240 : 360, background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}06, ${C.surface})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WCBlob color={primaryColor} size={mobile ? 120 : 180} seed={activeIndex + 30} />
            </div>
          )}
        </div>

        <p style={{ fontFamily: "'DM Sans'", fontSize: mobile ? 13 : 15, color: C.bright, marginTop: 16, lineHeight: 1.6, textAlign: "center", maxWidth: mobile ? "85vw" : 500 }}>{item.caption}</p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 10 }}>
          {item.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} color={getTagColor(tag)} size="md" onClick={(t) => { onClose(); onTagClick(t); }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {items.map((_, i) => (
            <div key={i} style={{ width: i === activeIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === activeIndex ? primaryColor : C.border, transition: "all .3s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Gallery Export ─── */
export function Gallery({ mobile, innerStyle }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [expanded, setExpanded] = useState(false);

  /* reset expand when filters change */
  useEffect(() => { setExpanded(false); }, [activeCategory, activeTag]);

  const filteredGallery = (() => {
    if (!activeCategory) return ITEMS;
    const cat = CATEGORIES.find((c) => c.name === activeCategory);
    if (!cat) return ITEMS;
    const catItems = ITEMS.filter((item) => item.tags.some((t) => cat.tags.includes(t)));
    if (!activeTag) return catItems;
    return catItems.filter((item) => item.tags.includes(activeTag));
  })();

  const initialCount = mobile ? 6 : INITIAL_COUNT;
  const visibleItems = expanded ? filteredGallery : filteredGallery.slice(0, initialCount);
  const remaining = filteredGallery.length - initialCount;

  const handleCategorySelect = (name) => {
    setActiveCategory((prev) => (prev === name ? null : name));
    setActiveTag(null);
    setLightboxIdx(null);
  };

  const handleTagClick = (tag) => {
    const cat = getCategoryForTag(tag);
    if (cat) {
      setActiveCategory(cat.name);
      setActiveTag((prev) => (prev === tag ? null : tag));
    }
    setLightboxIdx(null);
  };

  return (
    <>
      <div style={innerStyle(880)}>
        <SecHead num="05" title="Beyond the Lab" mobile={mobile} />
        <Reveal delay={0.05}>
          <p style={{ fontFamily: "'Caveat'", fontSize: mobile ? 17 : 20, color: C.muted, textAlign: "center", marginBottom: mobile ? 16 : 24, lineHeight: 1.5, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
            Paintings, plants, and everything in between — a few things that keep me grounded outside work.
          </p>
        </Reveal>

        <CategoryToggle activeCategory={activeCategory} onSelect={handleCategorySelect} mobile={mobile} />
        <HashtagRow activeCategory={activeCategory} activeTag={activeTag} onTagClick={handleTagClick} mobile={mobile} />

        <div style={{ marginTop: mobile ? 20 : 28 }} />

        {/* ─── Masonry grid (capped at 9, expandable) ─── */}
        <div key={`${activeCategory}-${activeTag}`} style={{ columnCount: mobile ? 2 : 3, columnGap: mobile ? 10 : 16 }}>
          {visibleItems.map((item, i) => (
            <GalleryImage key={item.caption} item={item} index={i} mobile={mobile} activeTag={activeTag} onClick={(idx) => setLightboxIdx(idx)} />
          ))}
        </div>

        {remaining > 0 && (
          <ShowMoreBtn
            remaining={remaining}
            expanded={expanded}
            onClick={() => setExpanded((p) => !p)}
            mobile={mobile}
          />
        )}

        {filteredGallery.length === 0 && (
          <p style={{ fontFamily: "'DM Sans'", fontSize: 14, color: C.muted, textAlign: "center", padding: "40px 0" }}>
            No images with that tag yet — stay tuned!
          </p>
        )}

        {!mobile && (
          <>
            <div style={{ position: "absolute", top: "12%", right: "6%", opacity: 0.2, animation: "float 6s ease infinite", pointerEvents: "none" }}><WCBlob color={C.wc[2]} size={70} seed={10} /></div>
            <div style={{ position: "absolute", bottom: "15%", left: "4%", opacity: 0.15, animation: "float 7s ease 1s infinite", pointerEvents: "none" }}><WCBlob color={C.wc[0]} size={55} seed={11} /></div>
          </>
        )}
      </div>

      {lightboxIdx !== null && visibleItems[lightboxIdx] && (
        <Lightbox
          items={visibleItems}
          activeIndex={lightboxIdx}
          mobile={mobile}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((p) => Math.max(0, p - 1))}
          onNext={() => setLightboxIdx((p) => Math.min(visibleItems.length - 1, p + 1))}
          onTagClick={handleTagClick}
        />
      )}
    </>
  );
}