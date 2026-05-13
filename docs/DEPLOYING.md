# Deploying A11yFred

A11yFred deploys to **GitHub Pages** via GitHub Actions on every push to `main`.

---

## Setup (one-time)

1. Make the repository public (required for GitHub Pages on the free plan).
2. In GitHub: **Settings → Pages → Source → GitHub Actions**.
3. That's it. The workflow at `.github/workflows/deploy-pages.yml` handles everything.

---

## Deployment workflow

Every push to `main` triggers a build and deploy automatically.

```bash
git push origin main
# → GitHub Actions builds and deploys to https://a11yfred.github.io/a11yfred/
#   (or your custom domain once configured)
```

---

## Custom domain

1. Add a `CNAME` file to the `public/` directory containing your domain (e.g. `a11yfred.app`).
2. Configure DNS: add a CNAME record pointing your domain to `a11yfred.github.io`.
3. In GitHub: **Settings → Pages → Custom domain** -- enter your domain and enable HTTPS.
4. `vite.config.js` `base` stays as `'/'` -- no change needed for a root domain.

---

## Security headers

GitHub Pages does not support custom response headers. Security headers are set via
`<meta http-equiv>` tags in `index.html`. Note: `frame-ancestors` (clickjacking
protection) cannot be set via meta tag -- it requires a response header. This is an
accepted limitation of GitHub Pages hosting.

---

## Netlify / Vercel

Both were previously configured (`netlify.toml`, `vercel.json`) and have been removed.
Netlify and Vercel add value for server functions, edge middleware, and branch preview
deploys -- none of which A11yFred currently needs. Deferred indefinitely; revisit if
those requirements arise.
