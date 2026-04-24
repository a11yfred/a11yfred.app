# TODO

Personal backlog for A11yTextHelper.

Category tags: `[corpus]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]`

---

## Immediate

- [ ] **Populate defect corpus** `[corpus]` — import from audit spreadsheets; target 150–200 entries across web and native; review existing 50 starters for accuracy and voice consistency
- [ ] **Create GitHub repo** `[infra]` — initialize and push; update the footer "Fork on GitHub" link in `App.jsx`
- [ ] **Deploy to GitHub Pages** `[infra]` — set base path in `vite.config.js`, build, push `dist/` to `gh-pages` branch

---

## Corpus

- [ ] **Batch import tooling** `[corpus]` — small script (Node or Python) to convert rows from a CSV/spreadsheet into the `mikeys-corpus.json` schema; run once, review output, delete script
- [ ] **Custom data source support** `[corpus]` `[ux]` — allow loading a user-supplied JSON file as the corpus; provide a guide in Settings explaining the expected format and schema; useful for contributors running a fork
- [ ] **Keyword audit** `[corpus]` — after import, review keywords on each entry; these drive Fuse.js relevance more than anything else
- [ ] **Platform coverage** `[corpus]` — ensure native-only defects are present and flagged correctly (`"platform": "native"`); verify `"both"` entries make sense on each platform
- [ ] **Related SC links** `[corpus]` — spot-check `related` arrays for accuracy; some starters may be missing secondary SCs
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` — UI toggle in Settings to switch between Mikey's personal corpus and a generic public corpus; the two data sources are separate JSON files; personal corpus is never exposed in the public deployment
- [ ] **Public corpus bootstrap** `[corpus]` — seed the generic public corpus from WAI Understanding docs, axe-core rules, and Deque University entries; target 200+ entries before public launch; same JSON schema as Phase 1
- [ ] **Corpus provenance field** `[corpus]` — add a `source` field to each defect entry indicating origin (personal, WAI, axe, Deque); helps users understand where the entry came from and how to contribute similar entries

---

## Internationalization (i18n)

Target languages: English, Spanish, German, Dutch, French, Japanese, Tagalog/Filipino.

- [ ] **Install react-i18next** `[code]` — `npm install react-i18next i18next`; configure in `src/i18n.js`; wrap app in `<I18nextProvider>`
- [ ] **UI string locale files** `[code]` — create `src/locales/{en,es,de,nl,fr,ja,fil}/translation.json`; extract all UI strings from components into the EN baseline; stub other languages with EN keys
- [ ] **Language selector in Settings** `[ux]` — add language dropdown to SettingsPanel; persist selection to `localStorage`; switch locale via `i18next.changeLanguage()`
- [ ] **Translation service** `[ai]` — create `src/services/translationService.js` following the `aiService.js` pattern; implement Google Cloud Translation API (covers all 7 languages including Filipino — `fil`); user supplies their own key in Settings
- [ ] **Corpus pre-translation** `[corpus]` — run Google Translate API once against all `mikeys-corpus.json` entries; store results per-language in a `translations` object on each entry: `{ "es": { "desc": "...", "rem": "..." }, ... }`; data service returns the right language based on active locale
- [ ] **Runtime translation of AI refinements** `[ai]` — after an AI refinement rewrites desc/rem, pass the result through the translation service if the active locale is not English
- [ ] **`lang` attribute on `<html>`** `[a11y]` — update dynamically when locale changes (WCAG 3.1.1)
- [ ] **Translation review** `[corpus]` — machine translation of WCAG technical terms (accessible name, focus trap, landmark, live region) may not match established a11y terminology in each language; flag entries that use specialized vocabulary for human review

---

## AI

- [ ] **Wire OpenAI provider** `[ai]` — implement `openai` config in `aiService.js` (`/v1/chat/completions`, `gpt-4o`); remove the `stub: true` flag
- [ ] **Wire Google Gemini** `[ai]` — implement `google` config in `aiService.js`
- [ ] **Wire Microsoft Copilot** `[ai]` — implement `microsoft` config in `aiService.js`
- [ ] **AI error surface** `[ai]` `[ux]` — refinement failures currently go to `console.error` only; show an inline error message in the Refine section so the user knows something went wrong
- [ ] **System prompt tuning** `[ai]` — test refinements across a variety of defect types; adjust tone, length, and format instructions in `buildPrompt` as needed
- [ ] **AI refinement loading spinner** `[ux]` — replace the "Rewriting…" button text with an animated spinner; use `prefers-reduced-motion` to suppress the animation

---

## UX / Interaction

- [ ] **How to use page** `[ux]` — onboarding modal or help page explaining the workflow: search → select → prefix → refine → copy; trigger on first visit or via a Help button
- [ ] **Email results** `[ux]` — button to email yourself the selected defect description and remediation; implement via `mailto:` link with a pre-populated subject and body; no server required
- [ ] **Keyboard navigation in result list** `[ux]` `[a11y]` — arrow keys to move between results, Enter to select; the list has `role="listbox"` / `role="option"` but no keyboard handler yet
- [x] **Focus management on select** `[ux]` `[a11y]` — `useFocusOnMount` added to DetailPanel; defect `<h2>` receives focus on every result selection
- [ ] **Clear button on search** `[ux]` — small × to clear the query field without reaching for backspace
- [ ] **Persist last selected defect** `[ux]` — restore the selected defect if the user refreshes mid-session (sessionStorage)
- [ ] **Copy both fields at once** `[ux]` — single button that copies description + remediation as formatted text (e.g. for pasting into a report)
- [ ] **Contact form** `[ux]` `[infra]` — feedback/contact form for the public Phase 3 version; use Web3Forms or similar for GitHub Pages compatibility; no server required
- [ ] **Bookmarks / favorites** `[ux]` — save frequently used defects to a quick-access list in `localStorage`; display a "Starred" tab or section above search results
- [ ] **Recent defects** `[ux]` — remember the last 10 defects used; show them as a "Recent" list before the user types anything; persist in `localStorage`
- [ ] **Shareable defect URL** `[ux]` — unique URL per defect via hash routing (`#ATH-023`); paste into Slack, Jira, or email to link directly to an entry
- [ ] **Export to formats** `[ux]` — export selected or filtered defects to CSV, Markdown, or a formatted text block for pasting into a report
- [ ] **Audit report builder** `[ux]` — multi-select defects, add counts and severity, export a formatted accessibility audit report (Markdown or plain text)
- [ ] **Component-level filtering** `[ux]` — filter by UI component type (modal, form, button, heading, etc.) in addition to platform
- [ ] **Print view** `[ux]` — print-friendly CSS (`@media print`) for physical handoffs
- [ ] **Customizable results view** `[ux]` `[code]` — let users control how results are displayed: number of visible results, which fields appear in the list (title only, title + SC label, title + description preview), and sort order (relevance, priority, SC number); persist preferences in `localStorage`

---

## Accessibility and Design

- [ ] **Screen reader test** `[a11y]` — test with NVDA + Firefox and VoiceOver + Safari; confirm result list announcements, DetailPanel heading sequence, copy button feedback, and Settings dialog
- [ ] **Contrast audit** `[a11y]` — run axe or Colour Contrast Analyser on both light and dark themes; priority badge colors not yet formally checked in dark mode
- [ ] **Reflow at 400% zoom** `[a11y]` — verify no horizontal scroll or content loss at 400% (WCAG 1.4.10)
- [ ] **`prefers-contrast`** `[a11y]` — add `@media (prefers-contrast: more)` block; increase border and text contrast for users who need it
- [ ] **`prefers-reduced-motion` in JS** `[a11y]` — CSS already respects it; add a `window.matchMedia('(prefers-reduced-motion: reduce)')` check for any future JS-driven animation
- [ ] **Language detection** `[a11y]` `[i18n]` — read `navigator.languages[0]` on first load; set the matching locale if supported, otherwise default to English
- [ ] **Dark mode priority badge colors** `[design]` `[a11y]` — current badge colors are light-mode only; verify contrast in dark theme after CSS token migration
- [ ] **Focus ring design** `[design]` `[a11y]` — explicit `--focus` token is now wired; verify all interactive elements (including custom components like Toggle) show a visible ring on keyboard focus
- [ ] **Empty state illustration** `[design]` — the pre-search state (before any query is entered) has no visual cue; add a short prompt or illustration explaining what to type

---

## Privacy and Security

- [ ] **localStorage audit** `[privacy]` — confirm only `theme`, `ai_provider`, `apikey_<provider>`, and `typeahead` are stored; document each key and its purpose in `MAINTENANCE.md`
- [ ] **API key masking in UI** `[privacy]` — password inputs already mask keys; confirm no key values are ever logged to the console or included in error messages
- [ ] **Content Security Policy** `[privacy]` — add `<meta http-equiv="Content-Security-Policy">` to restrict script/style sources; allowed origins include the AI provider APIs
- [ ] **`rel="noreferrer"` audit** `[privacy]` — all `target="_blank"` links must have `rel="noreferrer"`; WAI links and footer GitHub link already have it; check any new links added
- [ ] **No tracking by default** `[privacy]` — Umami analytics placeholder is commented out in `index.html`; document that analytics must be explicitly enabled and configured by a site operator, not included by default
- [ ] **GDPR disclosure** `[privacy]` — when Phase 3 goes public, add a brief privacy statement explaining what data is and is not collected; Umami is cookie-free and collects no personal data by default

---

## Performance and Optimization

- [ ] **Bundle size baseline** `[perf]` — run `npm run build` and record initial bundle size; set a target (< 200kB gzipped total); revisit when adding i18n and other libraries
- [ ] **Font subsetting** `[perf]` — `@fontsource` loads full Noto Sans weights; consider limiting to only the characters and weights actually used to reduce the font payload
- [ ] **Fuse.js weight tuning** `[perf]` — profile search latency with a large corpus (500+ entries); adjust Fuse.js `threshold`, `minMatchCharLength`, and field weights if relevance or speed suffers
- [ ] **Code splitting** `[perf]` — Vite bundles everything into one chunk by default; consider lazy-loading SettingsPanel since it's only shown on demand
- [ ] **Cold load time** `[perf]` — test on throttled connection (Chrome DevTools Slow 3G); target < 3 seconds to first usable search
- [ ] **`prefers-reduced-data`** `[perf]` — if supported, skip loading non-critical font weights when the user has data-saving mode on

---

## Competitive / Differentiators

Features that would set A11yTextHelper apart from other a11y resources:

- [ ] **Offline-first PWA** `[infra]` — cache corpus + UI via Service Worker; fully functional without internet connection; critical for auditors on-site at client offices
- [ ] **Integration with bug trackers** `[ux]` `[infra]` — pre-populate Jira or Linear tickets with defect description and remediation via deep links or browser extensions
- [ ] **Version tracking for WCAG** `[corpus]` — tag each entry with the WCAG version it applies to (2.1 vs 2.2); future-proof for WCAG 2.x and 3.0 when relevant SCs change
- [ ] **Quick compare mode** `[ux]` — view two defect entries side by side to choose which one fits better; useful when multiple SCs could apply
- [ ] **Contribution via GitHub** `[corpus]` `[infra]` — "Suggest an edit" link per entry that opens a pre-filled GitHub issue; lowers the barrier for community contribution without requiring a fork

---

## Infrastructure

- [ ] **Umami analytics** `[infra]` — create an account at umami.is, add the site, replace `YOUR_WEBSITE_ID` in `index.html`, and uncomment the script tag
- [ ] **Version tagging** `[infra]` — tag releases in git once the corpus is stable enough to track
- [ ] **Phase 3 public corpus** `[infra]` — compile static JSON from WAI, WebAIM, Deque, and axe-core rule descriptions; curation task, not infrastructure; same architecture as Phase 1
- [ ] **Phase 3 hosting** `[infra]` — separate repo/deployment from Phase 1; Mikey's private corpus is never included or exposed

---

## Code Quality

- [ ] **Migrate priority colors to CSS tokens** `[code]` — `ResultList.jsx` uses a hardcoded `PRIORITY_COLORS` JS object; tokens are defined in `tokens.css`; update to use `var(--priority-*-text/bg)`
- [x] **Migrate inline font sizes to tokens** `[code]` — all literal `11`–`18` px values replaced with `var(--fs-small/body/sub/heading)` across DetailPanel, SettingsPanel, SearchBar, ResultList, App
- [ ] **Migrate inline spacing to tokens** `[code]` — spacing values scattered in inline styles; replace with `var(--space-*)`
- [ ] **CSS Modules or utility classes** `[code]` — inline styles work for now; consider migrating to CSS Modules for better tooling (autocomplete, dead-code detection) as the component count grows
- [ ] **PR template** `[code]` — `.github/PULL_REQUEST_TEMPLATE.md` created; reference it in README

---

## Resolved

- [x] Router plugin — `src/plugins/router/` with hash routing, OffCanvas, useFocusOnMount, useReturnFocus, useFocusTrap, useMediaQuery; reusable across future projects; documented in `src/plugins/router/README.md`
- [x] Settings as own page / off-canvas panel — desktop: full-page swap; mobile: slide-in from left; browser Back button closes; no modal
- [x] Focus trap — `useFocusTrap` hook restricts Tab to open modals and panels (WCAG 2.1.2); used internally by OffCanvas
- [x] Result-click focus management — DetailPanel h2 gets `useFocusOnMount`; focus moves there on every selection
- [x] Settings focus management — heading focus on open; trigger-button focus restored on close
- [x] Font scale simplified — 7 tokens → 4 (`--fs-small/body/sub/heading`); `html { font-size: 100% }` (browser default); h1 uses `clamp(1.75rem, 10.5vw, 2.667rem)`
- [x] Font token migration — all inline literal px values replaced across all components
- [x] Corpus renamed — `defects.json` → `mikeys-corpus.json`; public placeholder `corpus.json` created
- [x] Mobile-first layout — `.app-container` class, 768px breakpoint
- [x] Touch targets — `.btn-icon` (44×44px), platform toggle padding bump
- [x] Design token system — `tokens.css`
- [x] Typography file — `typography.css`
- [x] Linting — ESLint 9 + jsx-a11y + react-hooks + Stylelint + `@axe-core/react`
- [x] A11y fixes — label associations, keyboard on result list, dialog ARIA, Escape via document listener
- [x] Settings mobile bottom sheet — slides up, drag handle, Escape dismissal
- [x] Icon sizing — gear 22px, close 24px (iOS scale)
- [x] Typeahead toggle — on by default; off mode shows Search button and requires Enter/click
- [x] WAI SC links — ScBadge in DetailPanel links to WCAG 2.2 Understanding pages
- [x] Toggle component extracted from SettingsPanel — reused for AI assist and typeahead
- [x] Theme moved to Settings — Light / Auto / Dark radio chips; Auto follows prefers-color-scheme and updates live
- [x] Settings section headers — Search, Appearance, AI Assist (h3 within h2 dialog)
- [x] Search input — visible label "Describe the defect"; placeholder is now just the e.g. example; input is two lines tall (3rem min-height) for comfort
- [x] Semantic HTML — `<search>` wrapper on SearchBar; `<section>` on NoResults; `<fieldset>`/`<legend>` on theme chip group
- [x] Focus ring — global `:focus-visible` rule using `--focus` token (6.4:1 light, 4.6:1 dark); no more `outline: none` on inputs
- [x] Text contrast — `--text-faint` corrected to #767676 (light, 4.5:1) and #909090 (dark, 5.0:1); all body text now ≥ 4.5:1
- [x] Font size base — `html { font-size: 14pt }`; `--fs-*` tokens converted from px to rem; inherits browser font size preferences (WCAG 1.4.4)
- [x] Nothing Found state — styled empty state with SVG magnifying-glass illustration and search tips
- [x] SR-only utility — `.sr-only` class added to `index.css`; used for visually hidden radio legend in theme chip group
