# Maintenance Checklist

Recurring sweeps to run before releases, after major changes, or on a regular schedule.

---

## Run log

| Date | Passed | Failed | Deferred | N/A | Notes |
| ---- | ------ | ------ | -------- | --- | ----- |
| 2026-04-24 | 14 | 0 | 2 | — | typeahead/platform persist bug fixed; 2 esbuild vulns deferred (Vite 8 breaking change) |

---

## Code quality

- [ ] **Token audit** — search for hardcoded values (`#fff`, `14px`, `1rem`) not using `var(--*)` tokens
- [ ] **Dead code** — remove unused CSS classes, commented-out markup, dead component props, orphaned imports
- [ ] **DRY pass** — look for repeated inline style patterns that could move to utility classes
- [ ] **Unused tokens** — check `tokens.css` for custom properties no longer referenced anywhere

---

## Accessibility (WCAG 2.2)

- [ ] **1.1.1** — icon buttons have descriptive `aria-label`; decorative SVGs are `aria-hidden`
- [ ] **1.3.1** — page landmarks present: `<header>`, `<main>`, `<footer>`, `<search>`; result list uses `role="listbox"` / `role="option"`
- [ ] **1.4.3** — all text/background pairs ≥ 4.5:1 (AA); check light and dark themes
- [ ] **1.4.4** — zoom to 200%; text readable, no content hidden or truncated
- [ ] **1.4.6** — emulate `prefers-contrast: more`; contrast tokens apply without breaking layout
- [ ] **1.4.10** — zoom to 400%; no horizontal scrolling required
- [ ] **1.4.11** — UI borders and focus rings ≥ 3:1 against adjacent color
- [ ] **1.4.12** — apply WCAG text spacing bookmarklet; no content loss
- [ ] **2.1.1** — tab through entire interface; search, selection, copy, reset, refine, settings all reachable
- [ ] **2.4.3** — tab order follows logical visual reading order
- [ ] **2.4.7** — focus indicator visible on all focusable elements in both themes
- [ ] **2.5.3** — visible label text matches or is contained in the accessible name
- [ ] **2.5.5** — interactive controls ≥ 44×44px (AAA); verify Reset and Copy buttons in DetailPanel
- [ ] **2.5.8** — all controls ≥ 24×24px (AA, WCAG 2.2); clear search button is 24×24
- [ ] **3.1.1** — `<html lang="en">` present
- [ ] **4.1.2** — Toggle has `role="switch"` and `aria-checked`; RadioChip hides native input via `.sr-only`
- [ ] **4.1.3** — copy and reset fire `announce()`; verify screen reader hears confirmations
- [ ] **Dark mode** — toggle dark theme; inspect all states: empty, results, selected defect, settings, AI active, all four priority badge levels
- [ ] **Responsive** — test at 375px, 768px, and 1280px; layout, text, and controls hold at each width

---

## Security & privacy

- [ ] **API key handling** — keys in `localStorage` only; never logged; never in any fetch body except the provider's own endpoint
- [ ] **`rel` audit** — all `target="_blank"` links have `rel="noreferrer"`
- [ ] **No `innerHTML`** — search codebase; all DOM content goes through React JSX
- [ ] **`localStorage` inventory** — exactly five keys: `theme`, `typeahead`, `platform`, `ai_provider`, `apikey_<provider>`
- [ ] **Privacy disclosure** — SettingsPanel disclosure lists all five keys accurately
- [ ] **No analytics** — no third-party scripts, pixels, or beacons; Umami placeholder remains commented out
- [ ] **Dependency audit** — run `npm audit`; resolve high/critical before release
- [ ] **Outdated packages** — run `npm outdated`; apply non-breaking minor/patch updates

---

## Performance & functionality

- [ ] **CSS minification** — enable `css: { transformer: 'lightningcss' }` in `vite.config.js` build options; confirm output is minified (JS is already minified via esbuild by default)
- [ ] **Bundle size** — `npm run build`; total < 200 kB gzipped; note individual chunk sizes
- [ ] **Cold load** — incognito + Slow 3G; search is usable within 3 seconds
- [ ] **No console errors** — production build in DevTools; zero errors, zero unexpected warnings
- [ ] **Search accuracy** — test 10 representative queries; expected defects appear in top 3 results
- [ ] **Platform filter** — Web excludes `native`-only entries; Native excludes `web`-only; `both` appears in both
- [ ] **Copy behavior** — description and remediation copy correctly; location prefix included when set; `announce()` fires
- [ ] **Reset behavior** — restores original corpus text; `announce()` fires
- [ ] **AI refinement** — valid key rewrites text; invalid key fails gracefully
- [ ] **Persistence** — theme, typeahead, and platform all restore correctly after reload

---

## Deployment (Netlify)

- [ ] **Build succeeds** — `npm run build` locally; no Vite errors; chunk sizes within expected ranges
- [ ] **SPA redirect** — navigate directly to `/#/settings` in a new tab; page loads (not a 404)
- [ ] **Security headers** — confirm `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` all present in response headers
- [ ] **`robots.txt` served** — `https://your-site.netlify.app/robots.txt` returns the file with `Disallow: /`

---

## SEO (Phase 3 — before public launch)

- [ ] **Uncomment SEO block** — remove HTML comment wrapper in `index.html`; fill in canonical URL and OG image URL
- [ ] **Remove `noindex`** — replace with `<meta name="robots" content="index, follow">`
- [ ] **`robots.txt`** — replace with permissive version (`Allow: /`); add sitemap reference
- [ ] **`sitemap.xml`** — generate `public/sitemap.xml`; add `<link rel="sitemap">` in `index.html`
- [ ] **Favicon** — create `public/favicon.svg`; uncomment `<link rel="icon">` in `index.html`
- [ ] **OG image** — create 1200×630 `public/og-image.png`; update `og:image` and `twitter:image` URLs
- [ ] **JSON-LD** — fill in real URLs in the `WebApplication` structured data block in `index.html`

---

## i18n (future — once react-i18next is wired up)

- [ ] **String coverage** — all new UI text uses `t('key')`, not hardcoded English strings
- [ ] **Locale file parity** — all keys in `en/translation.json` exist in every other locale file
- [ ] **Corpus translation sync** — new/edited corpus entries re-translated across all target languages
- [ ] **Technical term review** — machine-translated WCAG terminology flagged for human review
- [ ] **`lang` attribute** — `<html lang>` updates correctly when user switches language

---

## Docs

- [ ] **docs/CHANGELOG.md** — entry added for any meaningful code change
- [ ] **docs/UPDATES.md** — plain-language entry for anything user-facing
- [ ] **docs/TODO.md** — resolved items closed and moved to Resolved section; shorthand expanded before filing
- [ ] **README.md** — project structure matches actual files; phase table updated if status changes
- [ ] **docs/CONTRIBUTING.md** — defect schema matches `corpus.json`; update if fields are added or renamed
- [ ] **docs/MAINTENANCE.md** — add a row to the run log above; add/retire sections as systems change
