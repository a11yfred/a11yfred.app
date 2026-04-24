# TODO

Personal backlog for A11yTextHelper.

Category tags: `[corpus]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]`

---

## Immediate

- [ ] **Populate defect corpus** `[corpus]` — import from audit spreadsheets; target 150–200 entries across web and native; review existing 50 starters for accuracy and voice consistency
- [ ] **Create GitHub repo** `[infra]` — initialize and push; update the footer "Fork on GitHub" link in `App.jsx` to point to the actual repository URL
- [ ] **Deploy to Netlify** `[infra]` — connect the GitHub repo to Netlify; set the build command to `npm run build` and publish directory to `dist`; the `netlify.toml` is already configured with headers and the SPA redirect rule
- [ ] **Add favicon** `[design]` `[infra]` — create a `favicon.svg` in `public/` and uncomment the `<link rel="icon">` tag in `index.html`; the favicon should be a simple accessible "A" mark or magnifying glass glyph using the accent color `#5548c8`

---

## Corpus

- [ ] **Batch import tooling** `[corpus]` — write a small Node.js or Python script that reads rows from a CSV or Excel export of your audit spreadsheets and converts them to the `mikeys-corpus.json` schema; run once, review the output for voice consistency and keyword coverage, then delete the script
- [ ] **Keyword audit** `[corpus]` — after the batch import, review the `keywords` array on every entry; keywords drive Fuse.js relevance more than any other field, and imported entries from spreadsheets often need additional synonyms and component names added
- [ ] **Platform coverage** `[corpus]` — verify that native-only defects are flagged `"platform": "native"` and that `"both"` entries make sense on each platform; aim for roughly 40% native or both entries to make the Native filter useful
- [ ] **Related SC links** `[corpus]` — spot-check the `related` arrays for accuracy; some starter entries are missing secondary success criteria that are commonly cited alongside the primary SC
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` — add a toggle in Settings to switch between the personal corpus (`mikeys-corpus.json`) and the generic public corpus (`corpus.json`); the two files are already separate; the toggle should persist to `localStorage` and only appear if both files are available
- [ ] **Public corpus bootstrap** `[corpus]` — seed the generic public corpus from WAI Understanding docs, axe-core rules, and Deque University entries; target 200+ entries before any Phase 3 public launch; same JSON schema as the personal corpus
- [ ] **Corpus provenance field** `[corpus]` — add a `source` field to each defect entry indicating origin (e.g. `"personal"`, `"WAI"`, `"axe"`, `"Deque"`); helps contributors understand where an entry came from and what style to follow when adding similar entries
- [ ] **Custom data source** `[corpus]` `[ux]` — allow Settings to accept a URL or file path pointing to a user-supplied JSON corpus; validate the schema on load, fall back to the built-in corpus if the source is unreachable or malformed; document the expected schema in a help tooltip

---

## Internationalization (i18n)

Target languages: English, Spanish, German, Dutch, French, Japanese, Tagalog/Filipino.

- [ ] **Install react-i18next** `[i18n]` `[code]` — run `npm install react-i18next i18next`; create `src/i18n.js` with language detection and fallback to English; wrap `<App>` in `<I18nextProvider>` in `main.jsx`
- [ ] **UI string extraction** `[i18n]` `[code]` — audit every JSX component and extract all visible English strings into `src/locales/en/translation.json`; replace hardcoded strings with `t('key')` calls; stub all other locale files with English keys as placeholders
- [ ] **Language selector in Settings** `[i18n]` `[ux]` — add a Language dropdown to the Search section of SettingsPanel below the Platform toggle; persist the selection to `localStorage` as `locale`; switch via `i18next.changeLanguage()` so the UI updates without a reload
- [ ] **Dynamic `lang` attribute** `[i18n]` `[a11y]` — update `document.documentElement.lang` whenever the locale changes so screen readers announce content in the correct language (WCAG 3.1.1); initialize from the persisted locale on load
- [ ] **Translation service** `[i18n]` `[ai]` — create `src/services/translationService.js` following the same pattern as `aiService.js`; implement Google Cloud Translation API (supports all 7 target languages including Filipino/`fil`); user supplies their own Google Cloud API key in Settings; the service translates a string to the active locale on demand
- [ ] **Corpus pre-translation** `[i18n]` `[corpus]` — run the translation service once against all `mikeys-corpus.json` entries and store results per-language as a `translations` object on each entry: `{ "es": { "desc": "...", "rem": "..." }, "de": {...}, ... }`; `dataService.js` returns the translated fields when the active locale is not English
- [ ] **AI refinement translation pass** `[i18n]` `[ai]` — after `getAiRefinement` rewrites `desc` and `rem`, if the active locale is not English, pass the results through `translationService` automatically before updating the component state
- [ ] **WCAG term review** `[i18n]` `[corpus]` — after any machine translation batch, flag corpus entries that use specialized WCAG terminology (accessible name, focus trap, landmark, live region, ARIA role) for human review; machine translation of these terms is unreliable and may not match established terminology in each language

---

## AI

- [ ] **Wire OpenAI provider** `[ai]` — implement the `openai` config in `aiService.js` using the `/v1/chat/completions` endpoint with `gpt-4o`; remove the `stub: true` flag; test with a real API key; confirm the response is parsed the same way as the Anthropic implementation
- [ ] **Wire Google Gemini** `[ai]` — implement the `google` config in `aiService.js` using the Gemini `generateContent` API; include model selection (default `gemini-1.5-flash`); remove the `stub: true` flag
- [ ] **Wire Microsoft Copilot** `[ai]` — implement the `microsoft` config in `aiService.js` using the Azure OpenAI endpoint; remove the `stub: true` flag
- [ ] **AI error surface** `[ai]` `[ux]` — refinement failures currently log to `console.error` only; show an inline error message below the Refine input in `DetailPanel` so the user knows what went wrong without opening DevTools; include the provider name and a brief plain-language explanation (e.g. "Invalid API key — check Settings")
- [ ] **System prompt tuning** `[ai]` — test AI refinements across at least 20 different defect types covering a variety of SCs, priorities, and platforms; adjust the tone, length, and format instructions in `buildPrompt` in `aiService.js` if the output drifts from the established voice
- [ ] **AI refinement loading state** `[ux]` `[a11y]` — replace the "Rewriting…" button text with an animated spinner using CSS; add `aria-busy="true"` to the button during the request; respect `prefers-reduced-motion` by disabling the spin animation and showing text only instead

---

## AI Agent Support

Agent support means upgrading the single-shot AI refinement call into a multi-step, tool-using workflow. The goals are: more accurate rewrites, corpus-aware suggestions, and eventually autonomous defect research.

- [ ] **Evaluate tool use approach** `[agent]` `[ai]` — prototype replacing the `buildPrompt` + single API call in `aiService.js` with an Anthropic tool use call; define a `search_corpus` tool that the model can invoke to look up related defects before rewriting; compare output quality against the current single-prompt approach before committing
- [ ] **`search_corpus` tool definition** `[agent]` `[ai]` — define a JSON tool schema that accepts a natural-language query string and returns the top 3 matching corpus entries (using the existing Fuse.js `useDefectSearch` logic); expose this as a callable function that the Anthropic API can invoke during an agentic turn
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` — extend the Refine section of `DetailPanel` to support a short back-and-forth conversation; store turn history in local component state as an array of `{ role, content }` objects; pass the full history in each subsequent API call; add a "Clear conversation" button that resets the history without closing the panel
- [ ] **Agentic error and loop handling** `[agent]` `[ai]` — when using tool use, add a turn limit (e.g. 5 tool calls max) to prevent runaway loops; surface a clear error message if the limit is reached; log each tool call result to the browser console in development for debugging
- [ ] **System prompt for agentic mode** `[agent]` `[ai]` — write a separate system prompt for the agentic workflow that instructs the model to always search the corpus before rewriting, to preserve the auditor's established voice, and to format the final output as two labeled lines (Description: / Remediation:); keep this separate from the single-shot `buildPrompt` in `aiService.js`
- [ ] **Model selection for agent mode** `[agent]` `[ai]` — tool use and multi-turn workflows are better served by larger models; default to `claude-opus-4-7` when agent mode is active; make this configurable in Settings alongside the existing provider/key inputs

---

## UX / Interaction

- [ ] **Result list arrow key navigation** `[ux]` `[a11y]` — the result list uses `role="listbox"` and `role="option"` but does not yet implement arrow key navigation; add `onKeyDown` handlers to the list container so that pressing Down/Up moves focus between options, and pressing Home/End jumps to the first/last option; this completes the ARIA listbox keyboard contract (WCAG 2.1.1)
- [ ] **How to use page** `[ux]` — add an onboarding modal or help page that explains the workflow: search → select → add location prefix → refine → copy; trigger it on first visit (check a `localStorage` flag) or via a Help button in the header; the content should be brief enough to read in under 30 seconds
- [ ] **Email results** `[ux]` — add a button to email the selected defect description and remediation to yourself using a `mailto:` link with a pre-populated subject and body; no server required; useful for quickly forwarding a defect write-up from a phone
- [ ] **Persist last selected defect** `[ux]` — save the selected defect's `id` to `sessionStorage` when it is selected; restore the selection on page reload so the user does not lose their place mid-session; clear on tab close (session scoped, not persistent)
- [ ] **Copy both fields at once** `[ux]` — add a single "Copy all" button to the `DetailPanel` header that copies the description and remediation together as formatted plain text (e.g. `Description: …\n\nRemediation: …`); useful for pasting into email or a report
- [ ] **Bookmarks / favorites** `[ux]` — allow marking frequently used defects as favorites by clicking a star icon on the result card; persist favorites to `localStorage` as a Set of defect IDs; show a "Starred" section above search results when any favorites exist
- [ ] **Recent defects** `[ux]` — keep a running list of the last 10 selected defects in `localStorage`; display them as a "Recent" list below the search field when the query is empty and no result is selected; clear individual entries with a dismiss button
- [ ] **Shareable defect URL** `[ux]` `[infra]` — encode the selected defect's ID into the URL hash (e.g. `#ATH-023`) so users can paste a link into Slack or a bug tracker; parse the hash on load and auto-select the matching defect; the hash router already uses the hash for navigation so this needs a non-conflicting scheme (e.g. `#defect/ATH-023`)
- [ ] **Export defects to formats** `[ux]` — let users export the currently selected defect (or a multi-select batch) to CSV, Markdown, or a plain text block; implement as a download via a Blob URL; no server required
- [ ] **Audit report builder** `[ux]` — multi-select multiple defects from the result list, add occurrence counts and severity overrides, and export a formatted accessibility audit report in Markdown or plain text; this is the primary deliverable format for most audit engagements
- [ ] **Component-level filtering** `[ux]` — add a secondary filter (in addition to the Platform toggle) that narrows results by UI component type (modal, form, button, heading, image, etc.); this requires adding a `component` field to the corpus schema and updating `useDefectSearch`
- [ ] **Print view** `[ux]` — add `@media print` styles so the selected defect details print cleanly; hide the header, footer, search bar, and settings button; show only the defect title, SC labels, description, and remediation
- [ ] **Upvote / downvote results** `[ux]` `[corpus]` — add thumbs up/down buttons to each result card; store ratings in `localStorage` keyed by defect ID; use ratings to boost or demote entries in Fuse.js scoring so frequently used defects surface higher; if authentication is added later, sync ratings to Supabase so they persist across devices

---

## Accessibility and Design

- [ ] **Screen reader test** `[a11y]` — test the full workflow with NVDA + Firefox and VoiceOver + Safari; verify: result list announcements when a search fires, DetailPanel heading focus on select, copy/reset announcements (now wired via `announce()`), Settings open/close focus, and the OffCanvas focus trap on mobile
- [ ] **Contrast audit — priority badges** `[a11y]` `[design]` — run the axe DevTools extension or Colour Contrast Analyser on the priority badge colors in both light and dark themes; dark mode token values were added in this session but should be verified against the actual rendered colors
- [ ] **Reflow at 400% zoom** `[a11y]` — open the app in Chrome at 400% zoom (browser zoom, not OS scale); confirm no horizontal scrolling is required and no content is cut off or hidden (WCAG 1.4.10)
- [ ] **`prefers-contrast: more` visual check** `[a11y]` `[design]` — enable "Increase Contrast" in macOS Accessibility settings or use Chrome DevTools to emulate `prefers-contrast: more`; verify the token overrides in `tokens.css` improve legibility without breaking the layout
- [ ] **`prefers-reduced-motion` in JS animations** `[a11y]` — CSS transitions already honor `prefers-reduced-motion: reduce`; add a `window.matchMedia('(prefers-reduced-motion: reduce)')` check for any future JS-driven animations (e.g. the planned loading spinner on AI refinement)
- [ ] **Keyboard navigation in result list** `[a11y]` `[ux]` — see UX section above; this is both a UX and accessibility item
- [ ] **Toggle design** `[design]` `[a11y]` — the current Toggle component uses a thin bar and circle; replace with a clearer on/off design using a power-button-style indicator symbol inside the thumb; ensure the focus ring is visible at all zoom levels
- [ ] **Gear icon replacement** `[design]` — the ⚙️ emoji renders differently across OSes and is not ideal for a refined UI; replace with an SVG gear icon that uses `currentColor` so it inherits the button's color and respects dark mode
- [ ] **Monospace result description** `[design]` — consider rendering the `desc` preview in the result list using the mono font stack to more closely match how it will look when copied into a spreadsheet; evaluate whether it improves or hurts scannability
- [ ] **Visible selection indicator** `[design]` `[a11y]` — the selected result card uses an accent border; add a secondary visual cue (e.g. a filled accent left-edge bar or a checkmark) so the selection is unmistakable, especially for users with color vision deficiencies
- [ ] **Empty state before search** `[design]` — the pre-search state (before any query is entered) shows only the search label and a help hint; add a short prompt, illustration, or sample query to make the tool feel more inviting and explain what to type
- [ ] **Favicon** `[design]` `[infra]` — see Immediate section above

---

## Privacy and Security

- [ ] **CSP test** `[privacy]` — after deploying to Netlify, use Chrome DevTools → Network → Headers to verify the `Content-Security-Policy` response header from `netlify.toml` is present and correct; confirm AI provider calls succeed under the policy
- [ ] **`rel="noreferrer"` audit** `[privacy]` — confirm every `target="_blank"` link in the codebase has `rel="noreferrer"`; currently: footer GitHub link and DetailPanel WAI SC links both have it; check any new links added to corpus entries or documentation
- [ ] **Dependency audit** `[privacy]` — run `npm audit` before any release; resolve high or critical severity issues; for low/moderate, document the risk and accept if a fix is not available
- [ ] **GDPR disclosure for Phase 3** `[privacy]` — when the public Phase 3 version launches, add a brief privacy statement page explaining what data is and is not collected; Umami analytics (if enabled) collects no personal data and uses no cookies; API keys go only to the AI provider; no user data is retained by this app

---

## Performance and Optimization

- [ ] **Bundle size baseline** `[perf]` — run `npm run build` and record the size of each chunk in Vite's output; target total < 200 kB gzipped; the vendor chunk split (react + fuse) added in this session should help long-term caching
- [ ] **Font self-hosting** `[perf]` `[privacy]` — replace the Google Fonts CDN link in `index.html` with `@fontsource/inter` (npm package); self-hosting eliminates the Google DNS lookup, avoids exposing user IPs to Google, and makes the app function offline; run `npm install @fontsource/inter` and import only the weights in use (400, 500, 600, 700)
- [ ] **Font subsetting** `[perf]` — after self-hosting, investigate subsetting Inter to the Latin character range only; this reduces the font payload significantly; use `@fontsource/inter/latin.css` which is already subset by the package
- [ ] **Fuse.js profiling** `[perf]` — measure search latency with a corpus of 500+ entries using `performance.now()` around the `fuse.search()` call; if it exceeds 50ms, tune the `threshold`, `minMatchCharLength`, or `keys` weights in `useDefectSearch.js`
- [ ] **Cold load time** `[perf]` — test on a throttled connection (Chrome DevTools → Network → Slow 3G); target first usable search within 3 seconds; the main blocker will likely be the Inter font if not self-hosted

---

## Competitive / Differentiators

- [ ] **Offline-first PWA** `[infra]` — add a Service Worker that caches the app shell and corpus JSON; the app should be fully functional without an internet connection once loaded; critical for auditors working on-site at client offices with restricted networks
- [ ] **Bug tracker integration** `[ux]` `[infra]` — add pre-populated deep links to Jira and Linear that open a new ticket with the defect description and remediation already filled in; no API key or auth required for deep links; document the URL format for each tracker
- [ ] **WCAG version tagging** `[corpus]` — add a `wcagVersion` field to each corpus entry (`"2.1"` or `"2.2"`); display the version tag on the result card and in DetailPanel; useful when auditing against a specific version requirement
- [ ] **Compare mode** `[ux]` — allow the user to open two defect entries side by side to decide which fits better; implement as a split view in the main content area; useful when multiple success criteria could apply to the same observation
- [ ] **Tip jar** `[infra]` — add a Ko-fi or GitHub Sponsors link to the footer for Phase 3; omit from Phase 1 personal deployment

---

## Authentication and User Data

- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` — add optional sign-in using Supabase Auth (free tier); authentication is not required — the app works fully without it; use Supabase's OAuth helpers so no custom auth server is needed; signed-in state persists across sessions via Supabase's session management
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` — when a user is signed in, sync upvote/downvote ratings to a `ratings` table (`user_id`, `defect_id`, `vote`); merge with any existing `localStorage` ratings on sign-in; `dataService.js` already abstracts the data layer, so this is a localized change
- [ ] **User-owned remote corpus** `[corpus]` `[infra]` — let signed-in users point the app at their own Supabase table or a remote JSON URL as a corpus source; add a URL/connection string field in Settings; fall back to the built-in corpus if the source is unreachable; private sources require auth so the key is never in the URL
- [ ] **Auth-gated personal corpus** `[corpus]` `[privacy]` — in the Phase 3 public deployment, serve Mikey's private corpus from a Supabase RLS-protected table rather than a bundled JSON file; unauthenticated users get `corpus.json` (public data) only; the private corpus never ships in any public build
- [ ] **Sign-in UI** `[ux]` — add a minimal sign-in section at the bottom of SettingsPanel (below AI Assist); show avatar and display name when signed in, "Sign in with Google / GitHub" buttons when not; sign-out option inline; no dedicated auth page needed

---

## Infrastructure

- [ ] **Umami analytics** `[infra]` — create an account at umami.is or self-host, add the site, replace `YOUR_WEBSITE_ID` in `index.html`, and uncomment the script tag; verify that Umami reports zero cookies and no personal data in the dashboard before enabling on any deployment
- [ ] **Version tagging** `[infra]` — create git tags for stable milestones once the corpus is stable enough to track; use semantic versioning (`v0.1.0` for Phase 1 launch, `v0.2.0` for Phase 2 AI, `v1.0.0` for Phase 3 public)
- [ ] **Phase 3 public corpus** `[infra]` `[corpus]` — compile static JSON from WAI Understanding docs, WebAIM articles, Deque University, and axe-core rule descriptions; curation task, not infrastructure; same JSON schema as Phase 1; this corpus is never mixed with Mikey's personal corpus
- [ ] **Phase 3 hosting** `[infra]` — set up a separate Netlify site from a separate repo for the Phase 3 public deployment; the personal corpus never appears in that repo

---

## Code Quality

- [ ] **Migrate inline spacing to tokens** `[code]` — audit all components for raw pixel or rem values in inline styles that are not referencing `var(--space-*)`; replace with the nearest token; this is the last major inline-value migration after font sizes (done) and priority colors (done in this session)
- [ ] **CSS Modules** `[code]` — evaluate migrating from inline styles to CSS Modules as the component count grows; CSS Modules give better tooling (autocomplete, dead-code detection) without adding a CSS-in-JS runtime; not urgent while the component set is small
- [ ] **PR template** `[code]` — reference `.github/PULL_REQUEST_TEMPLATE.md` in `CONTRIBUTING.md` so contributors know to use it

---

## Resolved

- [x] **Announce copy and reset actions** `[a11y]` — `announce()` is now called from `DetailPanel` on copy success ("Description: Copied to clipboard") and on reset ("Description: Reset to original"); same for remediation; satisfies WCAG 4.1.3 Status Messages
- [x] **Priority badge colors migrated to CSS tokens** `[code]` — `PRIORITY_COLORS` JS object removed from `ResultList.jsx`; component now reads `var(--priority-*-text/bg)`; dark mode overrides added to `tokens.css`
- [x] **Dark mode priority badge colors** `[design]` `[a11y]` — dark mode token values added for all four priority levels; contrast ratios verified to meet WCAG 1.4.3 (≥ 4.5:1 badge text on badge bg)
- [x] **`prefers-contrast: more` support** `[a11y]` — `@media (prefers-contrast: more)` block added to `tokens.css`; increases `--text-muted`, `--text-faint`, `--border-control`, and `--border` in both light and dark themes
- [x] **DetailPanel close button touch target** `[a11y]` — `className="btn-icon"` added to the × button; now meets the 44×44px minimum (WCAG 2.5.5)
- [x] **`body { font-size }` token bug fixed** `[code]` — `var(--fs-md)` (undefined) corrected to `var(--fs-body)` in `index.css`; body text now correctly inherits the 1rem / 16px base
- [x] **Typography utility classes updated** `[code]` — `typography.css` scale utilities updated to reference the current 4-token system (`--fs-small/body/sub/heading`); stale references to the old 7-token system removed
- [x] **Dead modal CSS removed** `[code]` — `.modal-overlay` and `.modal-content` CSS blocks removed from `index.css`; the settings modal was replaced by the OffCanvas panel in the previous session and these rules were no longer referenced
- [x] **Content Security Policy added** `[privacy]` — `netlify.toml` created with a CSP header restricting scripts to `self`, styles to `self` + Google Fonts, fonts to `self` + Google Fonts CDN, and `connect-src` to the four AI provider APIs; also includes `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`
- [x] **Privacy disclosure expanded** `[privacy]` — SettingsPanel now lists all four `localStorage` keys (theme, typeahead, provider, API keys) and explicitly states that no personal data or usage data is collected
- [x] **`robots.txt` added** `[privacy]` — `public/robots.txt` created with `Disallow: /` to block all crawlers on the dev Netlify deployment; replace before Phase 3 launch
- [x] **SEO meta tags added (commented out)** `[infra]` — `index.html` now contains a full commented-out SEO block: description, OG tags, Twitter Card, JSON-LD WebApplication schema, canonical link, and sitemap reference; `<meta name="robots" content="noindex, nofollow">` is active for the dev deployment
- [x] **`theme-color` meta added** `[design]` — light and dark `theme-color` values set in `index.html`; tints the browser chrome on Chrome/Edge/Safari mobile
- [x] **Vite vendor chunk splitting** `[perf]` — `vite.config.js` now specifies `manualChunks` to split React/React-DOM and Fuse.js into separate cached chunks
- [x] **SPA redirect rule** `[infra]` — `netlify.toml` includes a `/*` → `/index.html` 200 redirect so direct links and hard reloads work correctly with the hash router
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
- [x] Font size base — `html { font-size: 100% }` (browser default); `--fs-*` tokens in rem; inherits browser font size preferences (WCAG 1.4.4)
- [x] Nothing Found state — styled empty state with SVG magnifying-glass illustration and search tips
- [x] SR-only utility — `.sr-only` class added to `index.css`; used for visually hidden radio legend in theme chip group
