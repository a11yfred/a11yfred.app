# Maintenance Checklist

Recurring sweeps to run before releases, after major changes, or on a regular schedule.

---

## Run log

Run history lives in [docs/MAINT-LOG.md](MAINT-LOG.md). Add a row there after every sweep.

---

## DevOps

### Code Quality

- [ ] **Linters** ,  run `npm run lint` (ESLint), `npm run lint:css` (Stylelint), and `markdownlint docs/ README.md` (Markdown); fix all errors and warnings before committing; new rule overrides should be justified in a comment
- [ ] **Token audit** ,  grep `index.css` and all JSX for hardcoded color values (`#fff`, `#111`, `rgba`, `hsl`), hardcoded sizes that repeat 3+ times (px or em values), and anything that could be a named token; add tokens for values that have clear semantic meaning; update `tokens.css` first, then replace all instances; check that examples in this item stay current after any token additions
- [ ] **Dead CSS** ,  search for CSS classes defined in `index.css` that are no longer referenced in any JSX file; look for overwritten rules where a later declaration always wins (specificity or cascade); remove both the dead rule and any workaround selectors that exist only to defeat it; check for commented-out blocks that have not been removed
- [ ] **DRY pass** ,  look for repeated inline style patterns that could move to utility classes; three or more identical property+value pairs across unrelated selectors is the threshold
- [ ] **Unused tokens** ,  check `tokens.css` for custom properties no longer referenced anywhere in `index.css` or JSX; distinguish between truly dead tokens and tokens reserved for planned features (`--duration-slow`, `--ease-in`, `--mono` are intentional placeholders ,  do not remove without checking TODO)
- [ ] **SCSS evaluation** ,  assess whether CSS custom properties are still sufficient for the current theming and component complexity; if repeated nesting patterns, complex selectors, or mixins would meaningfully reduce duplication, add a TODO item to evaluate SCSS migration; do not migrate without a dedicated session

### Performance & Functionality

- [ ] **CSS minification** ,  confirm `css: { transformer: 'lightningcss' }` is still present in `vite.config.js`; verify the CSS output in `dist/` is minified after `npm run build` (JS is minified by default via esbuild)
- [ ] **Bundle size** ,  `npm run build`; total < 200 kB gzipped; note individual chunk sizes
- [ ] **Cold load** ,  incognito + Slow 3G; search is usable within 3 seconds
- [ ] **No console errors** ,  production build in DevTools; zero errors, zero unexpected warnings
- [ ] **Search accuracy** ,  test 10 representative queries; expected defects appear in top 3 results
- [ ] **Platform filter** ,  Web excludes `native`-only entries; Native excludes `web`-only; `both` appears in both
- [ ] **Copy behavior** ,  description and suggested fix copy correctly; location prefix included when set; `announce()` fires
- [ ] **Reset behavior** ,  restores original corpus text; `announce()` fires
- [ ] **AI refinement** ,  valid key rewrites text; invalid key fails gracefully
- [ ] **Persistence** ,  theme, typeahead, and platform all restore correctly after reload

### Privacy & Security

- [ ] **API key handling** ,  keys in `localStorage` only; never logged; never in any fetch body except the provider's own endpoint
- [ ] **`rel` audit** ,  all `target="_blank"` links have `rel="noreferrer"`
- [ ] **No `innerHTML`** ,  search codebase; all DOM content goes through React JSX
- [ ] **`localStorage` inventory** ,  keys: `theme`, `language`, `liveSearch`, `platform`, `ai_provider`, `wcagFilter`, `recentFindings`, `userFindings`, `userOverrides`, `pendingContributions`, `pinnedResults`, plus one `apikey_<provider>` per configured AI provider; `sessionStorage` key: `lastSelectedId`; verify count in SettingsPanel privacy disclosure matches reality
- [ ] **Privacy disclosure** ,  SettingsPanel disclosure accurately lists all stored keys; update `settings.privacy_body_2` in `en.json` (and propagate to all locale files) whenever storage changes
- [ ] **No analytics** ,  no third-party tracking scripts or pixels; Umami placeholder remains commented out; GitHub Sponsors link active in footer
- [ ] **Dependency audit** ,  run `npm audit`; resolve high/critical before release
- [ ] **Outdated packages** ,  run `npm outdated`; apply non-breaking minor/patch updates; read changelogs for anything touching a11y, security, or CSP before upgrading
- [ ] **Dead dependencies** ,  check `package.json` against actual `import` usage in `src/`; remove any package that is no longer imported anywhere; verify the removal does not break the build

### Deployment

> **⚠ All auto-deploys currently suspended (2026-04-27).** `netlify.toml` has `ignore = "exit 0"` so no build triggers on push. Vercel and GitHub Pages were already dormant. Skip the live-deployment checks below until deploys are re-enabled; run only the local build check.

Three targets are configured (all currently paused). See `docs/DEPLOYING.md` for switching instructions. To re-enable Netlify, remove the `ignore = "exit 0"` line from `netlify.toml`.

- [ ] **Build succeeds** ,  `npm run build` locally; no Vite errors; chunk sizes within expected ranges *(run this even while deploys are paused)*
- [ ] **SPA redirect** ,  *(skip while deploys are paused)* navigate directly to `/#/settings` in a new tab; page loads (not a 404)
- [ ] **Security headers** ,  *(skip while deploys are paused)* confirm `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` all present in response headers on the active deployment
- [ ] **`robots.txt` served** ,  *(skip while deploys are paused)* verify `robots.txt` returns the correct content for the current deployment phase (dev: `Disallow: /`; Phase 3 public: `Allow: /`)
- [ ] **Active target only** ,  *(skip while deploys are paused)* ensure only one platform is deploying on each push; if switching targets, confirm the previous one is paused or its trigger is disabled (see `docs/DEPLOYING.md`)
- [ ] **Electron wiring check** ,  if the Electron build has been activated, verify `SettingsPanel` is writing API keys to `window.electronAPI.keys` (via `safeStorage`) and not `localStorage`; if Electron is not yet active, confirm the scaffold in `electron/` is still intact (`main.js`, `preload.js`, `electron-builder.json`)

---

## Accessibility (A11Y)

- [ ] **axe-core sweep** ,  run `npm run dev` and open DevTools; `@axe-core/react` runs automatically in development and logs all violations to the console; fix every violation before release; axe covers WCAG 2.0, 2.1, and 2.2 (Level A and AA) plus best practices
- [ ] **Manual: keyboard** ,  tab through the entire interface; search, selection, copy, reset, refine, and settings must all be reachable and operable without a mouse; tab order follows visual reading order
- [ ] **Manual: zoom** ,  zoom to 200% (text readable, no content hidden or truncated) and 400% (no horizontal scrolling required)
- [ ] **Manual: screen reader** ,  test with NVDA + Firefox and VoiceOver + Safari; verify: result list announcements when a search fires, BottomSheet heading focus on select, copy/reset announcements via `announce()`, Settings open/close focus return, Drawer focus trap on mobile; `<html lang>` updates correctly when user switches language
- [ ] **Manual: dark mode** ,  toggle dark theme; inspect all states: empty, results, selected defect, settings, AI active, all four priority badge levels
- [ ] **Manual: responsive** ,  test at 375px, 768px, and 1280px; layout, text, and controls hold at each width
- [ ] **Manual: prefers-contrast** ,  emulate `prefers-contrast: more`; contrast tokens apply without breaking layout
- [ ] **Manual: text spacing** ,  apply WCAG text spacing bookmarklet; no content loss

---

## Internationalization (i18n)

> **⚠ Hold off on translate runs during active content-editing periods.** Running `npm run translate` while English content is still changing wastes the effort ,  edits to existing keys require re-translation of all 64 locales, not just additions. Keep logging changes in `docs/i18n-edits.md` and do one batch translate run when the English content has stabilized. Do not prompt for a translate run unless there is a clear content freeze or the user explicitly asks.

The custom i18n system (`src/i18n/`) is live with 50+ locale files and `useT()` wired into all components. `en.json` is the source of truth. RTL locales (`ar-PS`, `ug`) automatically set `dir="rtl"` on `<html>`.

- [ ] **String coverage** ,  any new UI text must use `t('key')` from `src/i18n/en.json`; never hardcode English strings in components
- [ ] **Translate new UI strings** ,  after adding any new keys to `en.json`, run `ANTHROPIC_API_KEY=... npm run translate` to fill in proper translations for all 49 non-English locale files; the script detects keys still holding English fallback values and translates them in one pass; apply capitalization conventions afterward (sentence case for Romance/Germanic, no change for caseless scripts); this must run as part of every maintenance pass when `en.json` was modified since the last pass
- [ ] **Track `en.json` edits** ,  every time a key is added or updated in `en.json`, note the key and old/new value in `docs/i18n-edits.md`; do not try to propagate immediately ,  batch them and run the translate workflow below; failing to track means stale translations silently exist across 50+ locales with no record of what changed
- [ ] **Full translate workflow** ,  run this whenever `docs/i18n-edits.md` has unresolved entries, using `es.json` (most reliably translated locale) as the reference for what keys exist and what translated values look like:

  **Step 1 ,  Parity (no API needed):** Compare `es.json` keys against all other locale files. For every key present in `es.json` that is missing from another locale file, add it with the English value from `en.json` as a placeholder. Commit: `i18n: add missing keys as English placeholders`.

  **Step 2 ,  Retranslate stale keys:** Find keys whose English source changed since `scripts/en-snapshot.json` was last written (the snapshot records the English value at translation time). For each such key, update all locale files that still hold the old translation by retranslating from the new English. Run `ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs` ,  the script auto-detects changed keys by comparing `en.json` against the snapshot. Commit: `i18n: retranslate stale keys ,  English source changed`.

  **Step 3 ,  Translate English placeholders:** Find all values in non-English locale files that are identical to their `en.json` counterpart (i.e. still an English placeholder). Run `ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs` ,  same script, picks up any remaining placeholders. Commit: `i18n: translate remaining English placeholder values`.

  After all three steps, update `docs/i18n-edits.md` to mark resolved entries and verify parity is clean.

- [ ] **Locale file parity (CRITICAL)** ,  every key added to `en.json` must be added to all 49+ other locale files immediately, using the English value as a placeholder; do not wait for a translation run; a missing key falls back to the key literal at runtime, which is visible to users; run the parity check after every session that modified `en.json`:

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

- [ ] **Announce string audit** ,  verify that all `announce()` call strings are pulled from `t()` and that every locale file has the corresponding key translated (not just English fallback)
- [ ] **Corpus translation coverage** ,  defect descriptions and remediation steps in `corpus.json` should have locale-specific overlays; run `npm run translate` whenever entries are added or edited; WCAG SC names and codes (`1.1.1`, `aria-label`, etc.) should remain in English in all locales
- [ ] **Technical term review** ,  after any machine translation batch, flag corpus entries using WCAG-specific terms (accessible name, focus trap, landmark, live region, ARIA role) for human review; machine translation of these terms is unreliable
- [ ] **Capitalization conventions** ,  English variants use NYT title case; Romance/Germanic use sentence case; caseless scripts (CJK, Arabic, Uyghur, Tamil, Devanagari) receive no capitalization changes; apply this when adding keys or updating existing ones
- [ ] **`lang` attribute** ,  `<html lang>` updates correctly when user switches language; verify with screen reader after any changes to `App.jsx` language effect

---

## Plugins

Plugins (`src/plugins/router/`, `src/plugins/announce/`, `src/plugins/debug/`) are designed to be portable ,  usable outside this project with no changes.

- [ ] **Import isolation** ,  verify no plugin file imports from app-level code (`../../App`, `../../hooks`, `../../services`, `../../i18n`, `../../data`); plugins may only import from React, react-dom, and declared external packages
- [ ] **External dependency audit** ,  list any non-React external packages imported by plugins (currently: `lucide-react` in `router/`); document these in the plugin's `README.md` under a "Dependencies" heading so any project adopting the plugin knows what to install
- [ ] **Plugin README accuracy** ,  verify the export lists and API docs in `src/plugins/router/README.md`, `src/plugins/announce/README.md`, and `src/plugins/debug/README.md` match current exported symbols; update if hooks or components were added, renamed, or removed

---

## SEO (Phase 3 ,  before public launch)

- [ ] **Uncomment SEO block** ,  remove HTML comment wrapper in `index.html`; fill in canonical URL and OG image URL
- [ ] **Remove `noindex`** ,  replace with `<meta name="robots" content="index, follow">`
- [ ] **`robots.txt`** ,  replace with permissive version (`Allow: /`); add sitemap reference
- [ ] **`sitemap.xml`** ,  generate `public/sitemap.xml`; add `<link rel="sitemap">` in `index.html`
- [ ] **OG image** ,  create 1200×630 `public/og-image.png`; update `og:image` and `twitter:image` URLs
- [ ] **JSON-LD** ,  fill in real URLs in the `WebApplication` structured data block in `index.html`

---

## Docs

- [ ] **docs/CHANGELOG.md** ,  entry added for any meaningful code change
- [ ] **docs/UPDATES.md** ,  plain-language entry for anything user-facing
- [ ] **docs/TODO.md** ,  move any `[x]` items to the bottom of their section with `~~strikethrough~~`; fully retired backlog items go to `## Resolved`; recurring sweep tasks that belong in MAINTENANCE.md should be removed from TODO; one-time project tasks that do not recur should not appear in MAINTENANCE.md
- [ ] **All docs accuracy** ,  review every file in `docs/` and `README.md`; feature descriptions must match current implementation; remove stale content; deploy section in README must reflect all configured targets; project structure must list actual files with accurate descriptions
- [ ] **Debug command accuracy** ,  open `src/App.jsx` and read the `runCommand()` function; every command it handles must appear in the README Dev/Debug table and in `DebugHelp.jsx`'s `customCommands` prop; remove any documented commands that no longer exist in `runCommand()`; note that debug commands **always require ENTER** and never fire during live typing ,  the README must state this clearly
- [ ] **Easter egg list accuracy** ,  open `src/App.jsx` and read the `EASTER_EGGS` object; every key must appear in the README Easter Eggs table; remove any table entries whose key is no longer in the object
- [ ] **Finding schema accuracy** ,  open `src/data/corpus.json` and read the fields of any entry; the schema block in README must list every field with its type, allowed values, and a note on blank/N/A behavior; update whenever a field is added or renamed (recent additions: `wcagVersion`, `wcagLevel`, `source`)
- [ ] **Corpus entry count** ,  README project structure lists the corpus entry count; run `node -e "console.log(require('./src/data/corpus.json').length)"` and update the count whenever entries are added
- [ ] **Hooks and services list** ,  `ls src/hooks/` and `ls src/services/`; every file must appear in the README project structure with an accurate one-line description; add new files when they are created, remove entries when files are deleted
- [ ] **Phase table** ,  README Phases table must reflect the actual current state of each phase; update status column after any major feature lands or is deferred
- [ ] **docs/CONTRIBUTING.md** ,  defect schema example matches `corpus.json` fields exactly; update if fields are added or renamed
- [ ] **docs/MAINT-LOG.md** ,  add a row after every sweep; keep newest first
- [ ] **TODO ↔ MAINT sync** ,  scan `docs/TODO.md` for any recurring sweep-style tasks that belong in MAINTENANCE.md instead; scan MAINTENANCE.md for any one-time project tasks that belong in TODO.md; recurring items (audits, checks, reviews) live here; one-time items (build a feature, migrate a system, wire a provider) live in TODO
- [ ] **User-facing content accuracy** ,  open the About panel and read every section (What Is This, How to Use It, Notable Features, Coming Soon); verify descriptions match shipped behavior; remove Coming Soon items that have shipped; update the Privacy & Storage modal to list all `localStorage` keys accurately (theme, language, platform, liveSearch, showVoting, ai_provider, apikey_\*, defect ratings); run this check whenever a new feature stores data or a Coming Soon item ships
