# dominat8.io — Architecture & Design Focus

**Goal:** Get the Engine (dominat8.io) right — both structure and visuals. Design will take time; this doc tracks the plan.

---

## Architecture (Structure)

### Current Layout
1. **Toolbar** (top-right) — Many buttons: Cinematic, Vercel Status, Self-Healing, Obsidian/Cloud, Global Launch, Blueprint Store, Developer View, Sitemap, vercel.json, Tickets, Social Lab, User View, DNS, Team Status
2. **Logo** (top-left) — Dominat8 "8" with heartbeat
3. **Main content** — Hero → BentoStats → DeploymentCard → InteractiveDock (vertical stack)
4. **Sidebars** — Agency Intelligence, Concierge, Ticket panel (on demand)
5. **Night shift feed** (bottom) — When there's activity

### Issues to Address
- **Toolbar overload** — Too many primary actions; feels cluttered
- **First paint** — Staggered block animations can feel like "parts" loading
- **Visual hierarchy** — Hero, Bento, Deployments need clearer separation

### Architecture Changes (In Progress)
- [ ] Collapse secondary toolbar actions into "More" dropdown
- [ ] Add subtle loading/skeleton for first paint (no flash of partial content)
- [ ] Tighten stagger timing so blocks feel like one cohesive reveal
- [ ] Ensure main content has clear section spacing

---

## Design (Visuals)

### Palette: Obsidian (Default)
From `PALETTES.md` — understated premium:
- Background: `#0a0a0f`
- Mesh Primary: `#0d0d14`
- Mesh Accent: Warm White 8%
- Creative: Soft Rose `#fda4af`
- Dev: Ice Blue `#7dd3fc`
- QA: Sage `#86efac`
- Marketing: Cream `#fde68a`
- Card Border: White 8%

### Design Changes (In Progress)
- [ ] Apply Obsidian palette consistently (CSS variables)
- [ ] Hero input: cleaner glass, better placeholder contrast
- [ ] Deployment cards: consistent border/glow from palette
- [ ] Dock: frosted glass aligned with Obsidian
- [ ] Typography: ensure headings and body have clear hierarchy

---

## Designer Handoff Notes

- **Single file:** All Engine UI lives in `ai-command-center/src/App.js` (per .cursorrules)
- **Palettes:** `ai-command-center/PALETTES.md` — 8 presets (Cyberpunk + Minimalist Luxury)
- **Vibe toggle:** Obsidian vs Cloud (light) — in toolbar
- **Custom vibe:** Drag image or say "warmer"/"cooler" to override

---

## Priority Order

1. **First paint** — No "parts" feeling; smooth, cohesive load
2. **Toolbar** — Simplify; keep primary actions visible
3. **Obsidian palette** — Apply across Engine
4. **Hero + content flow** — Clear sections, spacing, typography
