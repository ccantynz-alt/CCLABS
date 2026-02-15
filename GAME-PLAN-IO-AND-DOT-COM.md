# Game Plan: Finishing dominat8.io + dominat8.com

**Branch:** `cursor/io-dot-com-website-completion-ea05`  
**Last updated:** Feb 15, 2025

---

## TL;DR — What You Have

| Site | Purpose | Status |
|------|---------|--------|
| **dominat8.io** | Engine (Immersive Dashboard) | ✅ Code complete, host-based routing ready |
| **dominat8.com** | Showroom (Luxury Hero landing) | ✅ Code complete, same app, host-based routing ready |

**Both sites are served from the same codebase** (`ai-command-center`). The app detects the hostname and shows:
- **dominat8.com** → ShowroomView (hero, Hyper-Drive CTA, Autonomous Blog)
- **dominat8.io** → Full Engine dashboard (deployments, Agency Intelligence, etc.)

---

## Phase 1: Deployment & Domain Setup (Vercel)

### 1.1 Add Both Domains to Vercel

1. Go to [vercel.com](https://vercel.com) → your CCLABS project → **Settings** → **Domains**
2. Add:
   - `dominat8.io`
   - `www.dominat8.io` (optional)
   - `dominat8.com`
   - `www.dominat8.com` (optional)
3. Vercel will show DNS instructions (A/CNAME records). Add them at your registrar.
4. SSL is automatic once DNS propagates.

**No code changes needed** — host-based logic is already in `App.js` (`getIsShowroomDomain()`).

### 1.2 Verify Build Pipeline

- **Build Health** (`.github/workflows/build-health.yml`): Runs on every push/PR to `main`. Verifies `build/index.html` exists.
- **Aura Deploy** (`.github/workflows/aura-deploy.yml`): Optional. Needs `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in repo secrets to deploy via CLI.

**Action:** Push to `main` and confirm Build Health passes. If Aura Deploy is configured, deployment will run automatically.

---

## Phase 2: Code Polish (Optional, Can Run Autonomously)

### 2.1 PWA Icons (Low Priority)

- `manifest.json` references `logo192.png` and `logo512.png` — these don't exist.
- `icons-README.md` explains how to generate them from `logo-8.svg`.
- **Impact:** PWA install may show a generic icon. Not blocking.

### 2.2 SEO for Showroom

- `index.html` has a single meta description. Consider:
  - Open Graph tags for dominat8.com (social sharing)
  - Dynamic `<title>` per domain (e.g. "Dominat8 Lab · Showroom" vs "Dominat8 Lab · AI Command Center")
- **Impact:** Better social previews and SEO. Nice-to-have.

### 2.3 robots.txt

- Current: `User-agent: *` only (allows all crawlers).
- Consider adding `Sitemap: https://dominat8.io/sitemap.xml` (if you add a static sitemap route) or keep as-is.

---

## Phase 3: Testing Checklist (When You're Back)

| Test | How |
|------|-----|
| dominat8.io loads Engine | Visit https://dominat8.io — should see full dashboard |
| dominat8.com loads Showroom | Visit https://dominat8.com — should see Luxury Hero + Hyper-Drive |
| Hyper-Drive redirects to .io | On .com, click Hyper-Drive → should redirect to dominat8.io |
| ?showroom=1 on .io | Visit dominat8.io?showroom=1 — should show Showroom (until "entered lab") |
| Mobile responsive | Test both views on phone |
| SSL valid | Check padlock in browser for both domains |

---

## Phase 4: What Can Run While You're Away

### Autonomous Tasks (AI/Agent Can Do)

1. **Add domain-specific meta tags** — Update `index.html` or add a small runtime title/description based on hostname.
2. **Generate PWA icons** — Create `logo192.png` and `logo512.png` from `logo-8.svg` (if sharp/ImageMagick available).
3. **Update DEPLOY doc** — Add dominat8.com to the deployment instructions.
4. **Add sitemap.xml** — Static file or route for SEO (if desired).

### Tasks That Need You

1. **Vercel domain setup** — You must add domains in Vercel dashboard and configure DNS at your registrar.
2. **Repo secrets** — If using Aura Deploy, you add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
3. **Final QA** — You verify both sites live and working.

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `ai-command-center/src/App.js` | Single source: Showroom + Engine, `getIsShowroomDomain()` |
| `ai-command-center/public/index.html` | Meta, title, favicon |
| `vercel.json` (root) | Build command, output dir, rewrites |
| `package.json` (root) | `vercel-build` script |
| `DEPLOY-DOMINAT8-IO.md` | Deployment instructions |

---

## Suggested Order of Work

1. **Before you leave:** Commit and push any in-progress work to `cursor/io-dot-com-website-completion-ea05`.
2. **While away:** Agent can run Phase 2 polish (meta tags, icons, doc updates).
3. **When you return:** Do Phase 1 (Vercel domains + DNS) and Phase 3 (testing).

---

## Branch Note

You're on `cursor/io-dot-com-website-completion-ea05`. When ready to deploy:

- Merge to `main` (or open a PR), or
- Configure Vercel to deploy from this branch for preview.

Production deploy typically uses `main`.
