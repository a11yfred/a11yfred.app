# Deploying A11yTextHelper

Three deployment targets are configured. Only one should be active at a time.

---

## Netlify (current default)

**Config file:** `netlify.toml`

**Deployment strategy:** Auto-deploy on all branches (previews) + tag-based releases (production).

### Setup

1. Connect your GitHub repository to Netlify via the dashboard
2. `netlify.toml` is already configured for all contexts
3. Configure Netlify dashboard:
   - Site settings → **Build & Deploy → Deploy contexts**
   - `main` branch: **Not production**
   - `deploy-preview`: Enabled (auto on branches/PRs)
   - `branch-deploy`: Enabled (auto on any branch)

### Deployment workflow

```bash
# Development — preview deploy on branch push
git checkout -b feature/new-search
git commit -am "Add fuzzy search"
git push origin feature/new-search
# → Netlify builds automatically to https://deploy-preview-1--a11ytexthelper.netlify.app

# Test the preview, then merge
git checkout main
git merge feature/new-search
git push origin main
# → Branch deploy (preview of main)

# Release day — tag and push to production
git tag v0.1.0
git push origin v0.1.0
# → Netlify builds and deploys to https://a11ytexthelper.com (or your domain)
```

**Rate limit:** ~20-30 builds/month (2-3 per feature + 1 per release) vs. 300/month limit. Safe.

### To disable auto-deploy

If you need to pause Netlify temporarily:

- **Netlify dashboard → Site settings → Danger zone → Pause site publishing**

### To re-enable

Unpause in the Netlify dashboard. Next push will trigger a build.

---

## Vercel

**Config file:** `vercel.json`

Vercel works with private repos on the free Hobby plan.

### To enable

1. Go to [vercel.com](https://vercel.com) and import the repository.
2. Vercel auto-detects Vite — no framework preset changes needed.
3. The `vercel.json` in this repo handles the SPA fallback and security headers.
4. Disable Netlify (see above) so both aren't deploying on the same push.

### To disable

In the Vercel dashboard: **Project settings → Git → Disconnect** or pause deployments.
There is no code-only way to skip Vercel builds (unlike Netlify's `ignore` command).

---

## GitHub Pages

**Config file:** `.github/workflows/deploy-pages.yml`

Currently set to **manual trigger only** — it will not run on push until you opt in.
Requires the repository to be **public** (GitHub free plan restriction).

### To enable auto-deploy

1. Make the repository public.
2. In GitHub: **Settings → Pages → Source → GitHub Actions**.
3. In `vite.config.js`: uncomment the `REPO_NAME` lines and set the name if deploying
   to a subpath (`https://user.github.io/a11ytexthelper/`). Leave `base: '/'` for a
   custom domain at the root.
4. In `.github/workflows/deploy-pages.yml`: uncomment the `push` trigger block
   and comment out `workflow_dispatch`.
5. Disable Netlify (see above).

### To disable

Re-comment the `push` trigger (revert to `workflow_dispatch` only), or disable the
workflow in GitHub → Actions → the workflow → ⋯ menu → Disable workflow.

---

## Switching between providers

| Step | Netlify → Vercel | Netlify → GH Pages |
| ---- | ---------------- | ------------------ |
| Stop Netlify | Add `ignore = "exit 0"` or pause in dashboard | Same |
| Enable target | Import repo in Vercel dashboard | Make repo public, enable Pages in GH Settings |
| Config change | None needed | Uncomment `push` trigger in workflow |
| Base path | `base: '/'` in vite.config (no change) | Set `REPO_NAME` if using subpath |
