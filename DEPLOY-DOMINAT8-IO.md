# Full health loop — dominat8.io

One-time setup below makes **every push to `main`** build, deploy, and (optionally) report. No manual uploads.

---

## 1. Connect repo to Vercel (one time)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. **Import** your CCLABS Git repository (e.g. `ccantynz-alt/CCLABS`).
3. Keep **Root Directory** as **`.`** (repo root).  
   Build command and output are already in `vercel.json`: `npm run vercel-build` → `build/`.
4. Click **Deploy**. You’ll get a URL like `cclabs-xxx.vercel.app`.
5. **Settings** → **Domains** → add **dominat8.io** (and **www.dominat8.io** if you want).  
   Add the A/CNAME records at your registrar; Vercel will provision SSL.

After this, **every push to `main`** triggers a Vercel build and deploy automatically.

---

## 2. What’s already automated in this repo

| Piece | What it does |
|-------|-------------------------------|
| **Vercel Git** | Push to `main` → Vercel builds and deploys (after step 1). |
| **Build Health** (`.github/workflows/build-health.yml`) | On every push/PR to `main`, runs `npm run vercel-build` and checks for `build/index.html`. No secrets; keeps the repo in a buildable state. |
| **Aura Deploy** (`.github/workflows/aura-deploy.yml`) | Optional. If you set repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, this workflow also deploys via Vercel CLI from `ai-command-center` and can report deployment status (and call `AURA_WEBHOOK_URL` on error). |

You only need **step 1** for a full health loop. The workflow gives you a green check when the build succeeds; Aura is optional for CLI-based deploy and alerts.

---

## 3. Optional: Aura CLI deploy and webhook

If you want the GitHub Action to deploy (in addition to or instead of Vercel Git):

1. Create a Vercel project linked to this repo (or use the same project with root = `ai-command-center` for the CLI path).
2. In GitHub: **Settings** → **Secrets and variables** → **Actions** → add:
   - `VERCEL_TOKEN` (from [vercel.com/account/tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (from the project’s **Settings** → **General**).
3. Optional: `AURA_WEBHOOK_URL` — if set, the workflow POSTs to it when a deployment ends in ERROR.

---

## 4. Resulting loop

- **Push to `main`** → Build Health runs (build verification) → Vercel builds and deploys (if step 1 is done).
- **dominat8.io** serves the Dominat8 dashboard (Engine).  
  For Showroom at dominat8.com, use a separate Vercel project or the same project with that domain and host-based logic in the app.

No manual uploads; the loop is automated once Vercel is connected.
