# jessicanau.com

Personal portfolio website — built with React + Vite.

---

## For someone new to UI development

Think of this project like a **recipe book** for a website.

### The big picture

When you visit a website, your browser downloads some files and turns them into the page you see. This project uses **React** (a library that builds interactive web pages from small reusable pieces called "components") and **Vite** (a tool that bundles everything together and gives you a live preview while you work).

### How the files are organized

```
src/
├── data/          ← YOUR CONTENT (edit these to change what the site says)
├── components/    ← THE SECTIONS (each file = one section of the site)
├── primitives/    ← SMALL REUSABLE PIECES (buttons, animations, blobs)
├── hooks/         ← BROWSER LISTENERS (detect screen size, scroll position)
├── tokens.js      ← THE COLOR PALETTE (change colors here)
├── global.css     ← ANIMATIONS & RESETS (usually don't need to touch)
├── App.jsx        ← THE BLUEPRINT (puts all sections in order)
└── main.jsx       ← THE IGNITION (tells the browser to start)
```

### What each folder does

**`data/`** — JSON files that hold all the text, links, and image paths. When you want to add a publication, change your bio, or add a gallery photo, you edit these files. You never have to touch code.

**`components/`** — Each section of the site lives in its own file. `Hero.jsx` is the big intro at the top, `Experience.jsx` is the horizontal timeline, `Gallery.jsx` is the photo grid at the bottom. If you want to redesign just one section, you only open that one file.

**`primitives/`** — Small building blocks that multiple sections share. `Reveal.jsx` makes things fade in as you scroll. `TagBadge.jsx` is the little colored pill that shows tags. `WCBlob.jsx` draws the watercolor blob shapes.

**`hooks/`** — These detect things about the browser: how wide the screen is (for mobile vs desktop layouts), which section is currently visible (for the nav highlight), and whether something has scrolled into view (for animations).

**`tokens.js`** — Every color in the site lives here. Change `accent` from `"#6db89f"` to any hex color and the entire site updates.

**`App.jsx`** — This file arranges all the sections in order, like a table of contents. It passes screen size info down to each section so they know whether to use mobile or desktop layouts.

### How to add content

#### Add a new gallery image
Open `src/data/gallery.json` and add to the `items` array:
```json
{ "src": "/images/gallery/my-painting.jpg", "caption": "A watercolor of the San Diego skyline.", "tags": ["#watercolor", "#art"] }
```
Put the actual image file in `public/images/gallery/`.

#### Add a new publication
Open `src/data/publications.json` and add to the `items` array:
```json
{ "title": "Your paper title", "authors": "Au, J., et al.", "journal": "Nature", "year": "2026" }
```

#### Add a new experience
Open `src/data/experiences.json` and add an object before the "Future" entry.

#### Change colors
Open `src/tokens.js` and edit the hex values.

### Common commands

```bash
npm install          # Download dependencies (run once, or after pulling changes)
npm run dev          # Start the dev server (visit http://localhost:5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview the production build locally
```

### Deploying

**Vercel** (recommended): Connect this repo to [vercel.com](https://vercel.com). It auto-deploys on every push to `main`.

**GitHub Pages**: Uncomment the `base` line in `vite.config.js`, set it to your repo name, then:
```bash
npm run build
# push the dist/ folder to a gh-pages branch
```

### The mental model

```
JSON data  →  Components read it  →  Vite bundles it  →  Browser shows it
(your content)  (the design)         (the build tool)     (the website)
```

You change the JSON, the components turn it into styled HTML, Vite packages it all up, and the browser displays it. That's the whole loop.

---

Built by Jessica, with a lot of help from Claude ☕
