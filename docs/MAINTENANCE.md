# Maintenance Checklist

Recurring sweeps to run before releases, after major changes, or on a regular schedule.

---

## Run log

| Date | Passed | Failed | Deferred | N/A | Notes |
| ---- | ------ | ------ | -------- | --- | ----- |
| 2026-04-25 | — | — | — | — | Renamed "defect" to "finding" throughout: hooks (useDefectSearch/Ratings → useFindingSearch/Ratings), services (getDefects → getFindings), components, and all i18n user-facing strings; returnFocus utility added to router plugin; [data-focus-return]:focus CSS rule added; Modal/BottomSheet/Drawer wired to returnFocus; `npm run translate` pending (run with ANTHROPIC_API_KEY to propagate new i18n keys to all locales) |
| 2026-04-25 | — | — | — | — | Fixed Reset All not clearing view-all state — focusCount=true on the stale result list was landing focus on "N results" heading instead of idle home screen; handleResetAll now resets setViewAll/setViewAllConfirmOpen/setViewAllLoading |
| 2026-04-26 | — | — | — | — | Corpus edits: ATH-002 → "Focus Not Managed", ATH-006 → "Flashing Content", new ATH-076/ATH-085 "Visible Heading Not Marked as Heading"; About panel rewrite + WCAG link + example nav links + X close on desktop; i18n: steps 3/5 fixed across all locales, about.what_body_2 added + translated, en-* variants patched (12 keys each), parity gaps filled (39 placeholders); eslint react-hooks/immutability suppressed on intentional ref mutations; linters clean; full parity confirmed |
| 2026-04-26 | — | — | — | — | Maint checklist overhauled: expanded token audit, dead CSS, SCSS eval, plugin isolation, all-docs accuracy, user-facing content, dependency cleanup, Markdown linting, locale parity (CRITICAL), TODO/MAINT sync; privacy disclosure updated (showVoting added); TODO.md [x] items reordered to section bottoms; deployment section updated for 3 targets |
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

- [ ] **Linters** — run `npm run lint` (ESLint), `npm run lint:css` (Stylelint), and `markdownlint docs/ README.md` (Markdown); fix all errors and warnings before committing; new rule overrides should be justified in a comment
- [ ] **Token audit** — grep `index.css` and all JSX for hardcoded color values (`#fff`, `#111`, `rgba`, `hsl`), hardcoded sizes that repeat 3+ times (px or em values), and anything that could be a named token; add tokens for values that have clear semantic meaning; update `tokens.css` first, then replace all instances; check that examples in this item stay current after any token additions
- [ ] **Dead CSS** — search for CSS classes defined in `index.css` that are no longer referenced in any JSX file; look for overwritten rules where a later declaration always wins (specificity or cascade); remove both the dead rule and any workaround selectors that exist only to defeat it; check for commented-out blocks that have not been removed
- [ ] **DRY pass** — look for repeated inline style patterns that could move to utility classes; three or more identical property+value pairs across unrelated selectors is the threshold
- [ ] **Unused tokens** — check `tokens.css` for custom properties no longer referenced anywhere in `index.css` or JSX; distinguish between truly dead tokens and tokens reserved for planned features (`--duration-slow`, `--ease-in`, `--mono` are intentional placeholders — do not remove without checking TODO)
- [ ] **SCSS evaluation** — assess whether CSS custom properties are still sufficient for the current theming and component complexity; if repeated nesting patterns, complex selectors, or mixins would meaningfully reduce duplication, add a TODO item to evaluate SCSS migration; do not migrate without a dedicated session

---

## Accessibility

- [ ] **axe-core sweep** — run `npm run dev` and open DevTools; `@axe-core/react` runs automatically in development and logs all violations to the console; fix every violation before release; axe covers WCAG 2.0, 2.1, and 2.2 (Level A and AA) plus best practices
- [ ] **Manual: keyboard** — tab through the entire interface; search, selection, copy, reset, refine, and settings must all be reachable and operable without a mouse; tab order follows visual reading order
- [ ] **Manual: zoom** — zoom to 200% (text readable, no content hidden or truncated) and 400% (no horizontal scrolling required)
- [ ] **Manual: screen reader** — test with NVDA + Firefox and VoiceOver + Safari; verify: result list announcements when a search fires, BottomSheet heading focus on select, copy/reset announcements via `announce()`, Settings open/close focus return, Drawer focus trap on mobile; `<html lang>` updates correctly when user switches language
- [ ] **Manual: dark mode** — toggle dark theme; inspect all states: empty, results, selected defect, settings, AI active, all four priority badge levels
- [ ] **Manual: responsive** — test at 375px, 768px, and 1280px; layout, text, and controls hold at each width
- [ ] **Manual: prefers-contrast** — emulate `prefers-contrast: more`; contrast tokens apply without breaking layout
- [ ] **Manual: text spacing** — apply WCAG text spacing bookmarklet; no content loss

---

## Security & privacy

- [ ] **API key handling** — keys in `localStorage` only; never logged; never in any fetch body except the provider's own endpoint
- [ ] **`rel` audit** — all `target="_blank"` links have `rel="noreferrer"`
- [ ] **No `innerHTML`** — search codebase; all DOM content goes through React JSX
- [ ] **`localStorage` inventory** — keys: `theme`, `language`, `liveSearch`, `platform`, `ai_provider`, plus one `apikey_<provider>` per configured AI provider; total count grows with providers; verify count in SettingsPanel privacy disclosure matches reality
- [ ] **Privacy disclosure** — SettingsPanel disclosure accurately lists all stored keys; update `settings.privacy_body_2` in `en.json` (and propagate to all locale files) whenever storage changes
- [ ] **No analytics** — no third-party tracking scripts or pixels; Umami placeholder remains commented out; Ko-fi overlay widget is currently disabled; re-enable only when console errors are resolved and selector patches are verified against live DOM
- [ ] **Dependency audit** — run `npm audit`; resolve high/critical before release
- [ ] **Outdated packages** — run `npm outdated`; apply non-breaking minor/patch updates; read changelogs for anything touching a11y, security, or CSP before upgrading
- [ ] **Dead dependencies** — check `package.json` against actual `import` usage in `src/`; remove any package that is no longer imported anywhere; verify the removal does not break the build

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

## Deployment

Three targets are configured (Netlify active, Vercel and GitHub Pages dormant). See `docs/DEPLOYING.md` for switching instructions.

- [ ] **Build succeeds** — `npm run build` locally; no Vite errors; chunk sizes within expected ranges
- [ ] **SPA redirect** — navigate directly to `/#/settings` in a new tab; page loads (not a 404)
- [ ] **Security headers** — confirm `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` all present in response headers on the active deployment
- [ ] **`robots.txt` served** — verify `robots.txt` returns the correct content for the current deployment phase (dev: `Disallow: /`; Phase 3 public: `Allow: /`)
- [ ] **Active target only** — ensure only one platform is deploying on each push; if switching targets, confirm the previous one is paused or its trigger is disabled (see `docs/DEPLOYING.md`)

---

## SEO (Phase 3 — before public launch)

- [ ] **Uncomment SEO block** — remove HTML comment wrapper in `index.html`; fill in canonical URL and OG image URL
- [ ] **Remove `noindex`** — replace with `<meta name="robots" content="index, follow">`
- [ ] **`robots.txt`** — replace with permissive version (`Allow: /`); add sitemap reference
- [ ] **`sitemap.xml`** — generate `public/sitemap.xml`; add `<link rel="sitemap">` in `index.html`
- [ ] **OG image** — create 1200×630 `public/og-image.png`; update `og:image` and `twitter:image` URLs
- [ ] **JSON-LD** — fill in real URLs in the `WebApplication` structured data block in `index.html`

---

## i18n

The custom i18n system (`src/i18n/`) is live with 50+ locale files and `useT()` wired into all components. `en.json` is the source of truth. RTL locales (`ar-PS`, `ug`) automatically set `dir="rtl"` on `<html>`.

- [ ] **String coverage** — any new UI text must use `t('key')` from `src/i18n/en.json`; never hardcode English strings in components
- [ ] **Translate new UI strings** — after adding any new keys to `en.json`, run `ANTHROPIC_API_KEY=... npm run translate` to fill in proper translations for all 49 non-English locale files; the script detects keys still holding English fallback values and translates them in one pass; apply capitalization conventions afterward (sentence case for Romance/Germanic, no change for caseless scripts); this must run as part of every maintenance pass when `en.json` was modified since the last pass
- [ ] **Locale file parity (CRITICAL)** — every key added to `en.json` must be added to all 49+ other locale files immediately, using the English value as a placeholder; do not wait for a translation run; a missing key falls back to the key literal at runtime, which is visible to users; run the parity check after every session that modified `en.json`:

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
- [ ] **Corpus translation coverage** — defect descriptions and remediation steps in `corpus.json` should have locale-specific overlays; run `npm run translate` whenever entries are added or edited; WCAG SC names and codes (`1.1.1`, `aria-label`, etc.) should remain in English in all locales
- [ ] **Technical term review** — after any machine translation batch, flag corpus entries using WCAG-specific terms (accessible name, focus trap, landmark, live region, ARIA role) for human review; machine translation of these terms is unreliable
- [ ] **Capitalization conventions** — English variants use NYT title case; Romance/Germanic use sentence case; caseless scripts (CJK, Arabic, Uyghur, Tamil, Devanagari) receive no capitalization changes; apply this when adding keys or updating existing ones
- [ ] **`lang` attribute** — `<html lang>` updates correctly when user switches language; verify with screen reader after any changes to `App.jsx` language effect

---

## Plugins

Plugins (`src/plugins/router/`, `src/plugins/announce/`) are designed to be portable — usable outside this project with no changes.

- [ ] **Import isolation** — verify no plugin file imports from app-level code (`../../App`, `../../hooks`, `../../services`, `../../i18n`, `../../data`); plugins may only import from React, react-dom, and declared external packages
- [ ] **External dependency audit** — list any non-React external packages imported by plugins (currently: `lucide-react` in `router/`); document these in the plugin's `README.md` under a "Dependencies" heading so any project adopting the plugin knows what to install
- [ ] **Plugin README accuracy** — verify the export lists and API docs in `src/plugins/router/README.md` and `src/plugins/announce/README.md` match current exported symbols; update if hooks or components were added, renamed, or removed

---

## Docs

- [ ] **docs/CHANGELOG.md** — entry added for any meaningful code change
- [ ] **docs/UPDATES.md** — plain-language entry for anything user-facing
- [ ] **docs/TODO.md** — move any `[x]` items to the bottom of their section with `~~strikethrough~~`; fully retired backlog items go to `## Resolved`; recurring sweep tasks that belong in MAINTENANCE.md should be removed from TODO; one-time project tasks that do not recur should not appear in MAINTENANCE.md
- [ ] **All docs accuracy** — review every file in `docs/` and `README.md`; feature descriptions must match current implementation; remove stale content; deploy section in README must reflect all configured targets; project structure must list actual files with accurate descriptions
- [ ] **docs/CONTRIBUTING.md** — defect schema example matches `corpus.json` fields exactly; update if fields are added or renamed
- [ ] **docs/MAINTENANCE.md** — add a row to the run log; add or retire sections as systems change; verify all checklist items are still relevant and actionable
- [ ] **TODO ↔ MAINT sync** — scan `docs/TODO.md` for any recurring sweep-style tasks that belong in MAINTENANCE.md instead; scan MAINTENANCE.md for any one-time project tasks that belong in TODO.md; recurring items (audits, checks, reviews) live here; one-time items (build a feature, migrate a system, wire a provider) live in TODO
- [ ] **User-facing content accuracy** — open the About panel and read every section (What Is This, How to Use It, Notable Features, Coming Soon); verify descriptions match shipped behavior; remove Coming Soon items that have shipped; update the Privacy & Storage modal to list all `localStorage` keys accurately (theme, language, platform, liveSearch, showVoting, ai_provider, apikey_\*, defect ratings); run this check whenever a new feature stores data or a Coming Soon item ships
