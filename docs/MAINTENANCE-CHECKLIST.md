# Maintenance Checklist

Recurring checks before releases or on a regular schedule. See [MAINTENANCE-WORKFLOWS.md](MAINTENANCE-WORKFLOWS.md) for detailed guidance on each section.

Add a row to [MAINT-LOG.md](MAINT-LOG.md) after every sweep.

---

## DevOps

### Code Quality

- [ ] **Linters** ,  `npm run lint` (all three: eslint, stylelint, markdownlint)
- [ ] **Token audit** ,  grep for hardcoded colors/sizes; add tokens, update `tokens.css`
- [ ] **Severity badge contrast** ,  verify all 5 badge pairs pass 4.5:1 (text/bg); re-verify after any token color changes
- [ ] **Dead CSS** ,  remove unreferenced classes and overwritten rules
- [ ] **DRY pass** ,  move repeated inline style patterns to utility classes
- [ ] **Unused tokens** ,  remove tokens not referenced in `index.css` or JSX (check TODO for placeholders)
- [ ] **SCSS evaluation** ,  CSS custom properties still sufficient for current complexity?

### Performance & Functionality

- [ ] **CSS minification** ,  verify `css: { transformer: 'lightningcss' }` is set in `vite.config.js`
- [ ] **Bundle size** ,  `npm run build` under 200 kB gzipped
- [ ] **Cold load** ,  incognito + Slow 3G; search usable within 3 seconds
- [ ] **No console errors** ,  production build zero errors/warnings
- [ ] **Search accuracy** ,  test 10 queries; expected results in top 3
- [ ] **Platform filter** ,  Web/Native/Both platforms filter correctly
- [ ] **Copy behavior** ,  desc/fix copy with location prefix, `announce()` fires
- [ ] **Reset behavior** ,  restores original text, `announce()` fires
- [ ] **AI refinement** ,  valid key rewrites, invalid key fails gracefully
- [ ] **Persistence** ,  theme/language/platform restore after reload

### Privacy & Security

- [ ] **API key handling** ,  keys in `localStorage` only, never logged
- [ ] **`rel` audit** ,  all `target="_blank"` links have `rel="noreferrer"`
- [ ] **No `innerHTML`** ,  all DOM via React JSX
- [ ] **`localStorage` inventory** ,  matches SettingsPanel privacy disclosure
- [ ] **Privacy disclosure** ,  update `settings.privacy_body_2` in `en.json` if storage changes
- [ ] **No analytics** ,  no tracking scripts; Umami placeholder commented out
- [ ] **Dependency audit** ,  `npm audit` resolves high/critical issues
- [ ] **Outdated packages** ,  `npm outdated` for non-breaking updates
- [ ] **Dead dependencies** ,  remove unused packages; verify build succeeds

### Deployment

- [ ] **Build succeeds** ,  `npm run build` locally, no Vite errors
- [ ] **SPA redirect** ,  navigate to `/#/settings` in new tab (loads, not 404)
- [ ] **Security headers** ,  CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy present
- [ ] **`robots.txt` served** ,  correct content for current phase
- [ ] **Active target only** ,  one platform deploying per push
- [ ] **Electron wiring** ,  API keys via `window.electronAPI.keys` (safeStorage), not `localStorage`
- [ ] **BottomSheet collapse** ,  desktop collapse button visible, collapses/expands correctly, focus stays in chrome when collapsed
- [ ] **Admin panel counts** ,  Public (ACC) and Legacy (ATH) tabs show separate counts, no combined totals

See [DEPLOYING.md](DEPLOYING.md) for deployment target details.

---

## Accessibility (A11Y)

- [ ] **axe-core sweep** ,  run `npm run dev`, fix all violations in console
- [ ] **Manual: keyboard** ,  tab through entire UI; all interactions reachable without mouse
- [ ] **Manual: zoom** ,  200% (readable, no truncation); 400% (no horizontal scroll)
- [ ] **Manual: screen reader** ,  NVDA+Firefox, VoiceOver+Safari; announcements fire correctly
- [ ] **Manual: dark mode** ,  toggle theme; all states (empty, results, settings, AI)
- [ ] **Manual: responsive** ,  375px, 768px, 1280px; layout holds at each width
- [ ] **Manual: prefers-contrast** ,  emulate `prefers-contrast: more`; contrast tokens apply
- [ ] **Manual: text spacing** ,  WCAG text spacing bookmarklet; no content loss

---

## Internationalization (i18n)

See [i18n-WORKFLOW.md](i18n-WORKFLOW.md) for detailed translation procedures.

- [ ] **String coverage** ,  new UI text uses `t('key')`, never hardcoded
- [ ] **Key parity** ,  every key in `en.json` exists in all 65 locale files in `src/calamansi/` (run parity script)
- [ ] **Translate new keys** ,  after `en.json` changes, run `npm run translate` to fill all locales
- [ ] **Track edits** ,  note all `en.json` key additions/changes in `docs/UPDATES.md` session entry
- [ ] **Announce audit** ,  `announce()` strings pulled from `t()` and translated
- [ ] **Corpus translation** ,  descriptions and fixes have locale overlays where needed
- [ ] **Technical term review** ,  flag WCAG terms (accessible name, live region, etc.) for human review
- [ ] **Capitalization** ,  English: NYT title case; Romance/Germanic: sentence case; CJK/Arabic: no change
- [ ] **`lang` attribute** ,  `<html lang>` updates when user switches language

---

## Plugins

`@a11yfred/neighbor` and `@a11yfred/rogers` are published npm packages (standalone repos). `src/halohalo/` and `src/sawsawan/` are app-local modules. Verify all remain app-agnostic.

- [ ] **Import isolation** ,  `src/halohalo/` and `src/sawsawan/` import only from each other; no imports from `../../App`, `../../hooks`, `../../services`, `../../data`
- [ ] **External dependencies** ,  list any non-React external packages in the module's README under "Dependencies"
- [ ] **README accuracy** ,  exports and hook signatures in `src/halohalo/` and `src/sawsawan/` match current code

---

## Documentation

- [ ] **CHANGELOG.md** ,  entry added for meaningful code changes; no duplicate date headers (one `## YYYY-MM-DD` per day)
- [ ] **UPDATES.md** ,  plain-language entry for user-facing changes; no duplicate date headers (one `## Month DD, YYYY` per day)
- [ ] **TODO.md** ,  completed items marked with strikethrough, moved to Resolved
- [ ] **README.md** ,  feature descriptions, structure, phase table match current state
- [ ] **Debug commands** ,  open `src/App.jsx`, verify `runCommand()` matches README table
- [ ] **Easter eggs** ,  open `src/App.jsx`, verify `EASTER_EGGS` object matches README table
- [ ] **Finding schema** ,  open `src/data/corpus.json`, verify schema block in README accurate
- [ ] **Corpus count** ,  `node --input-type=module -e "import c from './src/data/corpus.json' with { type: 'json' }; console.log(c.length)"` and update README if changed
- [ ] **Hooks/services list** ,  verify every file in `src/hooks/` and `src/services/` appears in README
- [ ] **Package READMEs** ,  verify READMEs in `src/sawsawan/` and `src/halohalo/` match current exports
- [ ] **CONTRIBUTING.md** ,  defect schema example matches `corpus.json` fields exactly
- [ ] **MAINT-LOG.md** ,  add row after every sweep; keep newest first
- [ ] **Privacy disclosure** ,  About panel lists all `localStorage` keys accurately

---

## SEO (Phase 3 Before Public Launch)

- [ ] **Uncomment SEO block** ,  remove comment wrapper in `index.html`; fill in canonical/OG image
- [ ] **Remove `noindex`** ,  replace with `<meta name="robots" content="index, follow">`
- [ ] **`robots.txt`** ,  permissive version (`Allow: /`) with sitemap reference
- [ ] **`sitemap.xml`** ,  generate at `public/sitemap.xml`; add `<link rel="sitemap">` in `index.html`
- [ ] **OG image** ,  create 1200×630 `public/og-image.png`; update URLs
- [ ] **JSON-LD** ,  fill in real URLs in WebApplication structured data block
