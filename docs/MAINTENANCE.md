# Maintenance Checklist

Recurring sweeps to run before releases, after major changes, or on a regular schedule.

---

## Run log

| Date | Passed | Failed | Deferred | N/A | Notes |
| ---- | ------ | ------ | -------- | --- | ----- |
| 2026-04-25 | 17 | 0 | 3 | 4 | About panel → Drawer pattern; settings footer Reset+Save paired; section dividers; Privacy btn in About; MAINTENANCE.md parity command + stale items fixed; N/A: font self-hosting, bundle size, Umami, favicon |
| 2026-04-25 | 16 | 0 | 3 | 4 | About panel; Settings Reset All; Phase 2 stubs (Supabase/auth); i18n parity (all 49 locales); dataService mergedCache perf; privacy text updated; btn-secondary added; ESLint argsIgnorePattern; N/A: font self-hosting, bundle size, Umami, favicon |
| 2026-04-25 | 15 | 0 | 3 | 4 | i18n: 10-language support, I18nProvider, useT(), all components wired; privacy button layout; CONTRIBUTING.md PR template reference; localStorage count updated to 6; N/A: font self-hosting, bundle size, Umami, favicon |
| 2026-04-25 | 14 | 0 | 3 | 4 | Party mode sounds (SFX), sparkles, music player, radial gradient fix, banner animation, chip stars, cursor size, assertive announce hold; N/A: font self-hosting, bundle size, Umami, favicon |
| 2026-04-25 | 14 | 0 | 3 | 4 | Party mode, confetti, copy guard, LinkedIn footer, search label/hint/icon, rewrite btn height; N/A: font self-hosting, bundle size, Umami, favicon |
| 2026-04-25 | 15 | 0 | 4 | 4 | Settings↔panel navigation; reset confirmation modal; BottomSheet chrome fix; SC bullets; liveSearch rename; language selector; corpus expanded to 54; Ko-fi letter; N/A: font self-hosting, bundle size, Umami, favicon |
| 2026-04-25 | 12 | 0 | 4 | 4 | Public corpus live; DetailPanel SC/priority/refine refactored; Modal component added; Ko-fi tooltip+label+contrast patches; close button spacing fixed; N/A: font self-hosting, bundle size, Umami, favicon |
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
- [ ] **`localStorage` inventory** — keys: `theme`, `language`, `liveSearch`, `platform`, `ai_provider`, plus one `apikey_<provider>` per configured AI provider; total count grows with providers; verify count in SettingsPanel privacy disclosure matches reality
- [ ] **Privacy disclosure** — SettingsPanel disclosure accurately lists all stored keys; update `settings.privacy_body_2` in `en.json` (and propagate to all locale files) whenever storage changes
- [ ] **No analytics** — no third-party tracking scripts or pixels; Umami placeholder remains commented out; Ko-fi overlay widget is currently disabled; re-enable only when console errors are resolved and selector patches are verified against live DOM
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

## i18n

The custom i18n system (`src/i18n/`) is live with 50+ locale files and `useT()` wired into all components. `en.json` is the source of truth. RTL locales (`ar-PS`, `ug`) automatically set `dir="rtl"` on `<html>`.

- [ ] **String coverage** — any new UI text must use `t('key')` from `src/i18n/en.json`; never hardcode English strings in components
- [ ] **Translate new UI strings** — after adding any new keys to `en.json`, provide proper translations (not English fallbacks) for all 49 non-English locale files; use the same machine-translation approach used in prior batches and apply capitalization conventions (sentence case for Romance/Germanic, no change for caseless scripts); this must run as part of every maintenance pass when `en.json` was modified since the last pass
- [ ] **Locale file parity** — all keys in `en.json` must exist in every other locale file; add missing keys with an English fallback value when adding new strings; run before release:

  ```sh
  node -e "
  const fs=require('fs'),path=require('path');
  const dir='src/i18n';
  const en=JSON.parse(fs.readFileSync(path.join(dir,'en.json'),'utf8'));
  const keys=Object.keys(en);
  fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&f!=='en.json').forEach(f=>{
    const loc=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
    const missing=keys.filter(k=>!(k in loc));
    if(missing.length) console.log(f,missing);
  });
  console.log('parity check done');
  "
  ```

- [ ] **Announce string audit** — verify that all `announce()` call strings are pulled from `t()` and that every locale file has the corresponding key translated (not just English fallback)
- [ ] **Corpus translation coverage** — defect descriptions and remediation steps in `corpus.json` should have locale-specific overlays; when `scripts/translate.js` is written, re-run it whenever entries are added or edited; WCAG SC names and codes (`1.1.1`, `aria-label`, etc.) should remain in English in all locales
- [ ] **Technical term review** — after any machine translation batch, flag corpus entries using WCAG-specific terms (accessible name, focus trap, landmark, live region, ARIA role) for human review; machine translation of these terms is unreliable
- [ ] **Capitalization conventions** — English variants use NYT title case; Romance/Germanic use sentence case; caseless scripts (CJK, Arabic, Uyghur, Tamil, Devanagari) receive no capitalization changes; apply this when adding keys or updating existing ones
- [ ] **`lang` attribute** — `<html lang>` updates correctly when user switches language; verify with screen reader after any changes to `App.jsx` language effect

---

## Docs

- [ ] **docs/CHANGELOG.md** — entry added for any meaningful code change
- [ ] **docs/UPDATES.md** — plain-language entry for anything user-facing
- [ ] **docs/TODO.md** — resolved items closed and moved to Resolved section; shorthand expanded before filing
- [ ] **README.md** — project structure matches actual files; phase table updated if status changes
- [ ] **docs/CONTRIBUTING.md** — defect schema matches `corpus.json`; update if fields are added or renamed
- [ ] **docs/MAINTENANCE.md** — add a row to the run log above; add/retire sections as systems change
- [ ] **About panel content** — verify "Coming Soon" section reflects current roadmap; remove items that have shipped; update feature descriptions as capabilities expand
- [ ] **Phase 2 stubs review** (before activating Supabase) — re-read `src/services/authService.js` and `src/services/supabaseClient.js` comments against the current Supabase SDK docs; confirm OAuth provider slugs, table names, and RLS policy examples are still accurate
