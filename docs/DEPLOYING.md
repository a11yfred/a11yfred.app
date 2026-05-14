# Deploying A11yFred

A11yFred is live at **[a11yfred.app](https://a11yfred.app)** and deploys to GitHub Pages via GitHub Actions on every push to `main`.

---

## Workflow

Every push to `main` triggers a build and deploy automatically.

```bash
git push origin main
# -> GitHub Actions builds and deploys to https://a11yfred.app
```

The workflow is at `.github/workflows/deploy-pages.yml`.

---

## Versioning

Releases follow [Semantic Versioning](https://semver.org/). Before pushing to `main`:

1. Update the version in `package.json`.
2. Update the version badge in `README.md`.
3. Add a version entry to `docs/CHANGELOG.md` and `docs/UPDATES.md`.

At most one release per day. Batch changes rather than pushing repeatedly.

There is no separate release branch. `main` is the production branch. Version tags are applied after each release push:

```bash
git tag v0.2.0
git push origin v0.2.0
```

---

## Setup (one-time, already done)

1. Repository is public (required for GitHub Pages on the free plan).
2. GitHub: **Settings > Pages > Source > GitHub Actions**.
3. `CNAME` file in `public/` contains `a11yfred.app`.
4. DNS: CNAME record pointing `a11yfred.app` to `a11yfred.github.io`.
5. GitHub: **Settings > Pages > Custom domain** set to `a11yfred.app`, HTTPS enabled.
6. `vite.config.js` `base` is `'/'`.

---

## Security headers

GitHub Pages does not support custom response headers. Security headers are set via `<meta http-equiv>` tags in `index.html`. Note: `frame-ancestors` (clickjacking protection) cannot be set via a meta tag -- it requires a response header. This is an accepted limitation of GitHub Pages hosting.

---

## Netlify / Vercel

Both were previously configured and have been removed. Neither is needed while the app has no server functions or edge middleware. Revisit if those requirements arise.
