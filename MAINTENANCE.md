# Maintenance Checklist

Recurring sweeps to run before releases, after major changes, or on a regular schedule. Most require judgment — automated checks are noted where available.

---

## CSS and design tokens

- [ ] **Token audit** — search for hardcoded values (`#fff`, `14px`, `1rem`, `6px`) not using `var(--*)` tokens; update to reference `tokens.css`
- [ ] **DRY pass** — look for repeated inline style patterns across components that could become utility classes in `typography.css` or `index.css`
- [ ] **Dark mode check** — toggle to dark theme and visually inspect every screen state: empty, search results, selected defect, settings panel, AI refine active, priority badges for all four levels
- [ ] **Responsive check** — resize browser at three widths: 375px (mobile), 768px (tablet / breakpoint), 1280px (desktop); confirm layout, text, and controls hold at each
- [ ] **Unused tokens** — check `tokens.css` for any custom properties no longer referenced anywhere
- [ ] **Dead code removal** — search for unused CSS classes, commented-out markup, and unreachable JS (dead component props, stubbed functions, orphaned imports); remove rather than leave in place

---

## WCAG 2.2 compliance

- [ ] **1.1.1 Non-text content** — all icon buttons (settings ⚙️, close ×, clear ✕) have descriptive `aria-label`; SVG illustrations are `aria-hidden`
- [ ] **1.3.1 Info and relationships** — page has correct landmark structure: `<header>`, `<main>`, `<footer>`, `<search>`; result list uses `role="listbox"` / `role="option"`
- [ ] **1.4.3 Contrast (AA)** — all text/background pairs ≥ 4.5:1 normal, ≥ 3:1 large text; check both light and dark themes; verify priority badge colors in dark mode (tokens added, but verify rendered values)
- [ ] **1.4.4 Resize text** — zoom browser to 200%; confirm text readable and no content hidden or truncated
- [ ] **1.4.6 Contrast (Enhanced)** — enable OS "Increase Contrast" (or emulate `prefers-contrast: more` in DevTools); confirm `tokens.css` overrides improve legibility without breaking layout
- [ ] **1.4.10 Reflow** — zoom to 400%; confirm no horizontal scrolling required
- [ ] **1.4.11 Non-text contrast** — UI component borders and focus rings ≥ 3:1 against adjacent color; check `--border-control` on both surfaces
- [ ] **1.4.12 Text spacing** — apply WCAG text spacing bookmarklet; verify no content loss (line-height 1.5×, letter-spacing 0.12em, word-spacing 0.16em)
- [ ] **2.1.1 Keyboard** — tab through entire interface without a mouse; test search, result selection, copy, reset, refine, settings open/close
- [ ] **2.4.3 Focus order** — tab order follows logical visual reading order
- [ ] **2.4.7 Focus visible** — focus indicator visible on every focusable element in both themes; check Toggle and RadioChip components
- [ ] **2.5.3 Label in name** — visible label text matches or is contained in the accessible name of interactive elements
- [ ] **2.5.5 Target size (AAA)** — interactive controls ≥ 44×44px; `.btn-icon` class handles icon buttons; verify the small Reset and Copy buttons in DetailPanel
- [ ] **2.5.8 Target size (AA, WCAG 2.2)** — minimum 24×24px for all controls; clear search button is 24×24
- [ ] **3.1.1 Language** — `<html lang="en">` present; update dynamically when i18n is implemented
- [ ] **4.1.2 Name, role, value** — all interactive elements properly labeled; Toggle has `role="switch"` and `aria-checked`; RadioChip hides native input via `.sr-only` and manages focus ring on the label
- [ ] **4.1.3 Status messages** — copy and reset actions now call `announce()` from the announce plugin; AI refine loading state still uses button text only (spinner + `aria-busy` is a TODO); verify screen reader hears copy/reset confirmations

---

## Security and privacy

- [ ] **API key handling** — keys stored in `localStorage` only, never logged, never in any fetch body other than the provider's own endpoint; audit `aiService.js` on every change
- [ ] **`rel` audit** — all `target="_blank"` links must have `rel="noreferrer"`; currently: footer GitHub link and DetailPanel WAI SC badge links; check any new links
- [ ] **No `innerHTML`** — search codebase for `innerHTML` assignments; all DOM content must go through React JSX
- [ ] **`localStorage` inventory** — exactly four keys should be stored: `theme`, `typeahead`, `ai_provider`, `apikey_<provider>`; audit for any unintended additions
- [ ] **CSP headers** — after a Netlify deploy, use DevTools → Network → Headers to confirm the `Content-Security-Policy` response header from `netlify.toml` is present; confirm AI API calls succeed under the policy
- [ ] **No analytics or tracking** — confirm no third-party scripts, pixels, or beacons have been added; Umami placeholder in `index.html` must remain commented out
- [ ] **GDPR / privacy** — no personal data is collected or transmitted by the app itself; user-supplied API keys go only to the chosen AI provider; the privacy disclosure in SettingsPanel lists all localStorage keys
- [ ] **Dependency audit** — `npm audit`; high or critical severity issues must be resolved before release
- [ ] **`npm outdated`** — review outdated packages; apply non-breaking minor/patch updates

---

## SEO

All SEO infrastructure is in place in `index.html` — it is entirely commented out for the current dev Netlify deployment. Before Phase 3 public launch:

- [ ] **Uncomment SEO block** — remove the outer HTML comment wrapper in `index.html`; fill in the real canonical URL and OG image URL
- [ ] **Remove `noindex` meta** — replace `<meta name="robots" content="noindex, nofollow">` with `<meta name="robots" content="index, follow">` (or remove it and rely on `robots.txt`)
- [ ] **Update `robots.txt`** — replace `public/robots.txt` with a permissive version (`Allow: /`); add a sitemap reference
- [ ] **Generate `public/sitemap.xml`** — single-URL sitemap for the SPA; add the `<link rel="sitemap">` tag in `index.html`
- [ ] **Add favicon** — create `public/favicon.svg`; uncomment `<link rel="icon">` in `index.html`
- [ ] **OG image** — create a 1200×630 `og-image.png` in `public/`; update the `og:image` and `twitter:image` URLs in `index.html`
- [ ] **`<title>` relevance** — confirm the `<title>` text is accurate and descriptive for the public audience
- [ ] **`lang` attribute** — update dynamically when i18n is implemented (WCAG 3.1.1)
- [ ] **JSON-LD review** — the `WebApplication` structured data in `index.html` uses placeholder URLs; fill in real values before launch

---

## Netlify / deployment

- [ ] **Build succeeds** — run `npm run build` locally; confirm Vite outputs without errors and all chunks are within expected size ranges
- [ ] **SPA redirect** — after deploy, navigate directly to `/#/settings` in a new tab; confirm the page loads (not a 404); the `netlify.toml` redirect rule handles this
- [ ] **Security headers live** — check one page response in DevTools → Network → Headers; confirm `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` are all present
- [ ] **`robots.txt` served** — confirm `https://your-site.netlify.app/robots.txt` returns the file with `Disallow: /`

---

## Functionality and performance

- [ ] **Search accuracy** — test 10 representative queries; confirm expected defects surface in top 3 results; if relevance is off, review Fuse.js weights and keyword coverage in `useDefectSearch.js`
- [ ] **Platform filter** — confirm Web results exclude `native`-only entries; Native results exclude `web`-only; `both` entries appear in both modes
- [ ] **Copy behavior** — confirm description and remediation copy correctly in Chrome, Firefox, and Safari; verify location prefix is included when set; verify `announce()` fires audibly in NVDA/VoiceOver
- [ ] **Reset behavior** — confirm reset restores original corpus text and `announce()` fires
- [ ] **AI refinement** — with a valid Anthropic API key, submit a refinement note; confirm description and remediation update; confirm the call fails gracefully if the key is invalid
- [ ] **Theme persistence** — toggle theme, reload; confirm preference is restored from `localStorage`
- [ ] **Bundle size** — run `npm run build`; note the size of each Vite chunk; target total < 200 kB gzipped (react + fuse chunks are cached separately via `manualChunks`)
- [ ] **Cold load time** — incognito window, Chrome DevTools → Slow 3G; confirm search is usable within 3 seconds
- [ ] **No console errors** — production build in DevTools; zero errors, zero unexpected warnings

---

## Localization (i18n — not yet implemented)

Once react-i18next is wired up, add these checks before each release:

- [ ] **String coverage** — all new UI text uses `t('key')` rather than a hardcoded English string
- [ ] **Locale file parity** — all keys in `en/translation.json` exist in every other locale file; missing keys fall back to English silently — catch them before release
- [ ] **Corpus translation sync** — when entries are added or edited in `mikeys-corpus.json`, re-run the translation pass and update the `translations` object for all target languages
- [ ] **Technical term review** — after any machine translation batch, flag entries containing WCAG terminology (accessible name, focus trap, landmark, live region, ARIA) for human review
- [ ] **`lang` attribute** — confirm `<html lang>` updates correctly when the user switches language
- [ ] **RTL readiness** — note any languages added in future that require right-to-left layout (current target set is all LTR)

---

## Documentation

- [ ] **CHANGELOG.md** — add an entry for any meaningful code change; use date-first headers; group by area
- [ ] **UPDATES.md** — add a plain-language entry for anything user-facing
- [ ] **TODO.md** — close resolved items; move to Resolved section; expand any shorthand notes before filing
- [ ] **README.md** — confirm project structure section matches actual files; update phase table if status changes
- [ ] **CONTRIBUTING.md** — confirm defect schema matches `corpus.json`; update if fields are added or renamed
- [ ] **MAINTENANCE.md** (this file) — add new sweep sections when new systems are introduced (i18n, Supabase, auth, Phase 3 public data); retire checks that no longer apply
