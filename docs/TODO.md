# TODO

Personal backlog for A11yTextHelper.

Category tags: `[corpus]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]`

---

## Immediate

- [ ] **Populate defect corpus** `[corpus]` — import from audit spreadsheets; target 150–200 entries across web and native; review existing 50 starters for accuracy and voice consistency
- [ ] **Deploy to Netlify** `[infra]` — connect the GitHub repo to Netlify; set the build command to `npm run build` and publish directory to `dist`; the `netlify.toml` is already configured with headers and the SPA redirect rule
- [ ] **Add favicon** `[design]` `[infra]` — create a `favicon.svg` in `public/` and uncomment the `<link rel="icon">` tag in `index.html`; the favicon should be a simple accessible "A" mark or magnifying glass glyph using the accent color `#5548c8`
- [ ] **Verify Ko-fi a11y patch selectors (follow-up)** `[a11y]` — the tooltip selector `i[rel="tooltip"]` and input selectors within `.kofi-overlay-widget-overlay` were added without live DOM verification; open the deployed app with Ko-fi loaded and confirm the selectors match the real markup before shipping
- [ ] **Offline-first PWA** `[infra]` — add a Service Worker that caches the app shell and corpus JSON so the app works fully without an internet connection after the first load; use Vite's `vite-plugin-pwa` or a hand-rolled `service-worker.js`; add a Web App Manifest so it can be installed to the home screen; test on mobile Chrome
- [ ] **Verify Ko-fi a11y patch selectors** `[a11y]` — `patchKofiA11y` in `App.jsx` uses CSS selectors that were guessed from Ko-fi's known class conventions (`.floatingchat-container-wrap`, `.kofi-overlay-widget-overlay`); open the deployed app with Ko-fi loaded, inspect the actual injected DOM in DevTools, and update the selectors and Escape-key close-button targeting to match the real markup
- [ ] **Revisit animations** `[ux]` `[a11y]` — several transitions are missing or inconsistent: the BottomSheet has a slide-up entrance but no slide-down exit animation; the result list appears instantly with no stagger; SettingsPanel on desktop switches without any transition; bundle all animation improvements into one pass and verify every new animation is disabled under `prefers-reduced-motion: reduce`
- [ ] **Result list keyboard navigation** `[ux]` `[a11y]` — the result list uses `role="listbox"` / `role="option"` but does not implement Up/Down/Home/End arrow key navigation; add `onKeyDown` handler to the list container to complete the ARIA listbox keyboard contract (WCAG 2.1.1)
- [ ] **Search results heading and count** `[a11y]` `[ux]` — add a visually present `<h2>` above the result list that reads "X results" (e.g. "12 results") when results are shown; move keyboard focus to this heading when a new result set appears so screen reader users hear the count without having to navigate into the list; the heading should disappear when the query is cleared
- [x] ~~**Standardize DetailPanel action icons** `[design]` `[a11y]` — switched to Lucide `RotateCcw`, `Clipboard`, `Check`; Unicode chars stripped from all 50 locale files; mobile shows icon only, desktop shows icon + text~~
- [x] ~~**Search button height — match input** `[design]` — fixed: `align-self: stretch` on `.search-submit-btn`~~
- [x] ~~**Footer credit wording** `[design]` — changed to "A project by Mikey Ilagan"~~

---

## Corpus

- [ ] **Batch import tooling** `[corpus]` — write a small Node.js or Python script that reads rows from a CSV or Excel export of your audit spreadsheets and converts them to the corpus JSON schema; run once, review the output for voice consistency and keyword coverage, then delete the script
- [ ] **Keyword audit** `[corpus]` — after the batch import, review the `keywords` array on every entry; keywords drive Fuse.js relevance more than any other field, and imported entries from spreadsheets often need additional synonyms and component names added
- [ ] **Platform coverage** `[corpus]` — verify that native-only defects are flagged `"platform": "native"` and that `"both"` entries make sense on each platform; aim for roughly 40% native or both entries to make the Native filter useful
- [ ] **Related SC links** `[corpus]` — spot-check the `related` arrays for accuracy; some starter entries are missing secondary success criteria that are commonly cited alongside the primary SC
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` — add a toggle in Settings to switch between the private corpus and the generic public corpus (`corpus.json`); the two files are already separate; the toggle should persist to `localStorage` and only appear if both files are available
- [ ] **Public corpus bootstrap** `[corpus]` — seed the generic public corpus from WAI Understanding docs, axe-core rules, and Deque University entries; target 200+ entries before any Phase 3 public launch; same JSON schema as the personal corpus
- [ ] **Corpus provenance field** `[corpus]` — add a `source` field to each defect entry indicating origin (e.g. `"personal"`, `"WAI"`, `"axe"`, `"Deque"`); helps contributors understand where an entry came from and what style to follow when adding similar entries
- [ ] **Custom data source** `[corpus]` `[ux]` — allow Settings to accept a URL or file path pointing to a user-supplied JSON corpus; validate the schema on load, fall back to the built-in corpus if the source is unreachable or malformed; document the expected schema in a help tooltip

---

## Internationalization (i18n)

Supported languages: English, Español, Français, Deutsch, Nederlands, Svenska, 中文（简体）, 日本語, 한국어, Filipino (Tagalog).

- [ ] **Corpus pre-translation script** `[i18n]` `[corpus]` — write `scripts/translate.js` (Node.js) that calls an AI provider to translate all `corpus.json` `desc` and `rem` fields into each supported locale; output as `corpus.{lang}.json` files; update `dataService.js` to accept a `locale` param and load the appropriate file; run once, review for WCAG terminology accuracy before committing
- [ ] **AI refinement locale pass** `[i18n]` `[ai]` — after `getAiRefinement` rewrites `desc` and `rem`, if the active locale is not English, have the AI respond in the active locale directly (update the system prompt to instruct the model to reply in `{locale}`) rather than post-translating
- [ ] **WCAG term review** `[i18n]` `[corpus]` — after any corpus translation batch, flag entries that use specialized WCAG terminology (accessible name, focus trap, landmark, live region, ARIA role) for human review; machine translation of these terms is unreliable and may not match established terminology in each language
- [x] ~~**Zero-dep i18n system** `[i18n]` `[code]` — `src/i18n/index.jsx` with React Context + `useT()` hook; flat-key JSON locale files; `{placeholder}` interpolation via RegExp; double-fallback (unknown locale → en, missing key → en key → key literal); no react-i18next or i18next needed~~
- [x] ~~**UI string extraction** `[i18n]` `[code]` — all visible strings extracted to `src/i18n/en.json` (~93 keys); all components wired with `useT()`: SearchBar, ResultList, DetailPanel, SettingsPanel, Header, Footer, PartyBanner~~
- [x] ~~**10 locale files** `[i18n]` — complete translations for en, es, fr, de, nl, sv, zh, ko, ja, tl (Filipino/Tagalog); AI-generated; all include translation disclosure key~~
- [x] ~~**Language selector in Settings** `[i18n]` `[ux]` — selector added under Appearance; persists to `localStorage` as `'language'`; defaults to `navigator.language`; 10 languages listed~~
- [x] ~~**Dynamic `lang` attribute** `[i18n]` `[a11y]` — `document.documentElement.lang` updates on language change in `App.jsx`~~

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
- [ ] **WCAG version filter** `[ux]` `[corpus]` — add a filter option (alongside the Platform toggle) to narrow results by WCAG version: "2.1 only", "2.2 only", and "All"; requires a `wcagVersion` field on each corpus entry; see also WCAG version tagging in Competitive / Differentiators
- [ ] **How to use page** `[ux]` — add an onboarding modal or help page that explains the workflow: search → select → add location prefix → refine → copy; trigger it on first visit (check a `localStorage` flag) or via a Help button in the header; the content should be brief enough to read in under 30 seconds
- [ ] **About / data sources page** `[ux]` `[corpus]` — when an About or How-to page is created, include a section describing how the public corpus was compiled and the sources used: WCAG 2.2 Understanding docs (W3C/WAI), axe-core rule descriptions (Deque), WebAIM articles, and Deque University; explain that entries are written in plain language and near-duplicates are consolidated; this gives users confidence in the data and gives proper credit to the source organizations
- [ ] **Email results** `[ux]` — add a button to email the selected defect description and remediation to yourself using a `mailto:` link with a pre-populated subject and body; no server required; useful for quickly forwarding a defect write-up from a phone
- [ ] **Persist last selected defect** `[ux]` — save the selected defect's `id` to `sessionStorage` when it is selected; restore the selection on page reload so the user does not lose their place mid-session; clear on tab close (session scoped, not persistent)
- [ ] **Copy both fields at once** `[ux]` — add a single "Copy all" button to the `DetailPanel` header that copies the description and remediation together as formatted plain text (e.g. `Description: …\n\nRemediation: …`); useful for pasting into email or a report
- [ ] **Bookmarks / favorites** `[ux]` — allow marking frequently used defects as favorites by clicking a star icon on the result card; persist favorites to `localStorage` as a Set of defect IDs; show a "Starred" section above search results when any favorites exist
- [ ] **Recent defects** `[ux]` — keep a running list of the last 10 selected defects in `localStorage`; display them as a "Recent" list below the search field when the query is empty and no result is selected; clear individual entries with a dismiss button
- [ ] **Shareable defect URL** `[ux]` `[infra]` — encode the selected defect's ID into the URL hash (e.g. `#ATH-023`) so users can paste a link into Slack or a bug tracker; parse the hash on load and auto-select the matching defect; the hash router already uses the hash for navigation so this needs a non-conflicting scheme (e.g. `#defect/ATH-023`)
- [ ] **Export defects to formats** `[ux]` — let users export the currently selected defect (or a multi-select batch) to CSV, Markdown, or a plain text block; implement as a download via a Blob URL; no server required
- [ ] **Audit report builder** `[ux]` — multi-select multiple defects from the result list, add occurrence counts and severity overrides, and export a formatted accessibility audit report in Markdown or plain text; this is the primary deliverable format for most audit engagements
- [ ] **Component-level filtering** `[ux]` — add a secondary filter (in addition to the Platform toggle) that narrows results by UI component type (modal, form, button, heading, image, etc.); this requires adding a `component` field to the corpus schema and updating `useDefectSearch`
- [ ] **Upvote / downvote results** `[ux]` `[corpus]` — add thumbs up/down buttons to each result card; store ratings in `localStorage` keyed by defect ID; use ratings to boost or demote entries in Fuse.js scoring so frequently used defects surface higher; if authentication is added later, sync ratings to Supabase so they persist across devices
- [x] ~~**Toggle Enter key support** `[ux]` `[a11y]` — `onKeyDown` handler added to Toggle; Enter triggers `onChange` matching ARIA authoring practices for `role="switch"` (WCAG 2.1.1)~~
- [x] ~~**Print view** `[ux]` — `@media print` block added to `index.css`; hides header, footer, search, chrome, and action buttons; shows defect title, SC list, and field textareas cleanly~~

---

## Accessibility and Design

- [ ] **Screen reader test** `[a11y]` — test the full workflow with NVDA + Firefox and VoiceOver + Safari; verify: result list announcements when a search fires, BottomSheet heading focus on select, copy/reset announcements (via `announce()`), Settings open/close focus, and the Drawer focus trap on mobile
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
- [ ] **Search results heading and count** `[a11y]` `[ux]` — add an h2 "X results" above the list; move focus there when results appear (already in Immediate above)
- [ ] **Ko-fi link in footer or settings** `[ux]` — add a Ko-fi link alongside the Bluesky footer link or in Settings
- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` — open deployed app, confirm selector matches for tooltip icons and overlay inputs
- [x] ~~**Remove divider above defects panel** `[design]` — `border-bottom` removed from `.detail-sc-list`~~
- [x] ~~**Make both close × buttons match exactly** `[design]` — BackChevron in Settings and About aligned to `size={20}` matching BottomSheet X and header buttons~~

---

## Privacy and Security

- [ ] **CSP test** `[privacy]` — after deploying to Netlify, use Chrome DevTools → Network → Headers to verify the `Content-Security-Policy` response header from `netlify.toml` is present and correct; confirm AI provider calls succeed under the policy
- [ ] **Dependency audit** `[privacy]` — run `npm audit` before any release; resolve high or critical severity issues; for low/moderate, document the risk and accept if a fix is not available
- [ ] **GDPR disclosure for Phase 3** `[privacy]` — when the public Phase 3 version launches, add a brief privacy statement page explaining what data is and is not collected; Umami analytics (if enabled) collects no personal data and uses no cookies; API keys go only to the AI provider; no user data is retained by this app
- [x] ~~**`rel="noreferrer"` audit** `[privacy]` — all `target="_blank"` links verified: GitHub header link, LinkedIn footer link, and DetailPanel WAI SC links all have `rel="noreferrer"`~~

---

## Performance and Optimization

- [ ] **Bundle size baseline** `[perf]` — run `npm run build` and record the size of each chunk in Vite's output; target total < 200 kB gzipped; the vendor chunk split (react + fuse) added in this session should help long-term caching
- [ ] **Fuse.js profiling** `[perf]` — measure search latency with a corpus of 500+ entries using `performance.now()` around the `fuse.search()` call; if it exceeds 50ms, tune the `threshold`, `minMatchCharLength`, or `keys` weights in `useDefectSearch.js`
- [ ] **Cold load time** `[perf]` — test on a throttled connection (Chrome DevTools → Network → Slow 3G); target first usable search within 3 seconds; the main blocker will likely be the Inter font if not self-hosted
- [x] ~~**Font self-hosting** `[perf]` `[privacy]` — `@fontsource/inter` installed; `latin-ext` subsets for weights 400/500/600/700 imported in `main.jsx`; Google Fonts CDN links removed from `index.html`; CSP updated to `font-src 'self'`~~
- [x] ~~**Font subsetting** `[perf]` — using `@fontsource/inter/latin-ext-{weight}.css` (Latin + Latin Extended subset); covers accented characters for European locales without loading all scripts~~

---

## Competitive / Differentiators

- [ ] **Offline-first PWA** `[infra]` — add a Service Worker that caches the app shell and corpus JSON; the app should be fully functional without an internet connection once loaded; critical for auditors working on-site at client offices with restricted networks
- [ ] **Bug tracker integration** `[ux]` `[infra]` — add pre-populated deep links to Jira and Linear that open a new ticket with the defect description and remediation already filled in; no API key or auth required for deep links; document the URL format for each tracker
- [ ] **WCAG version tagging** `[corpus]` — add a `wcagVersion` field to each corpus entry (`"2.1"` or `"2.2"`); display the version tag on the result card and in DetailPanel; useful when auditing against a specific version requirement
- [ ] **Compare mode** `[ux]` — allow the user to open two defect entries side by side to decide which fits better; implement as a split view in the main content area; useful when multiple success criteria could apply to the same observation
- [ ] **GitHub Sponsors** `[infra]` — set up GitHub Sponsors as a secondary tip option alongside the Ko-fi widget for Phase 3

---

## Authentication and User Data

- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` — stubs live in `src/services/authService.js` and `src/services/supabaseClient.js`; activate by installing `@supabase/supabase-js`, setting `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and uncommenting the implementation blocks; Supabase project setup instructions and DB schema (SQL) are in `supabaseClient.js`
- [ ] **Settings sync** `[infra]` `[ux]` — `syncSettings()` and `getRemoteSettings()` stubs in `dataService.js`; on sign-in, load remote settings and merge with localStorage; on any setting change, push to Supabase; API keys intentionally excluded from sync (localStorage only)
- [ ] **User-owned custom defects** `[corpus]` `[ux]` — `getUserDefects()`, `saveUserDefect()`, `deleteUserDefect()` stubs in `dataService.js`; DB schema in `supabaseClient.js`; UI: add/edit/delete controls in DetailPanel or a dedicated "My Defects" panel; IDs use `USR-*` prefix; mixed into search results alongside public corpus
- [ ] **Language-specific edit warning** `[ux]` `[i18n]` — when users can save custom edits to a defect entry, show a notice that edits apply only to the currently active language and will not persist if the user switches to a different locale (since real-time translation of user-edited text is not performed); display this warning in the edit UI before the user saves
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` — when a user is signed in, sync upvote/downvote ratings to a `ratings` table (`user_id`, `defect_id`, `vote`); merge with any existing `localStorage` ratings on sign-in; `dataService.js` already abstracts the data layer, so this is a localized change
- [ ] **User-owned remote corpus** `[corpus]` `[infra]` — let signed-in users point the app at their own Supabase table or a remote JSON URL as a corpus source; add a URL/connection string field in Settings; fall back to the built-in corpus if the source is unreachable; private sources require auth so the key is never in the URL
- [ ] **Auth-gated personal corpus** `[corpus]` `[privacy]` — in the Phase 3 public deployment, serve Mikey's private corpus from a Supabase RLS-protected table rather than a bundled JSON file; unauthenticated users get `corpus.json` (public data) only; the private corpus never ships in any public build
- [ ] **Sign-in UI** `[ux]` — add a minimal sign-in section at the bottom of SettingsPanel (below AI Assist); show avatar and display name when signed in, "Sign in with Google / GitHub" buttons when not; sign-out option inline; no dedicated auth page needed

---

## Infrastructure

- [ ] **Offline-first PWA** `[infra]` `[perf]` — add a Service Worker (via `vite-plugin-pwa` or hand-rolled) that caches the app shell, corpus JSON, and translation overlays; add a `manifest.json` for home-screen installability; test on mobile Chrome; the corpus is self-contained static JSON so offline should work without any backend
- [ ] **Electron desktop app** `[infra]` — the app is a strong candidate for Electron: no server required, works fully offline, AI calls go directly from the user's machine to the provider; use a separate `electron/` feature branch to prototype; Vite builds the renderer, Electron wraps it; the AI key stored in `localStorage` (or migrated to Electron's `safeStorage`) never leaves the device; test on macOS and Windows; goal is a distributable installer via GitHub Releases
- [ ] **Umami analytics** `[infra]` — create an account at umami.is or self-host, add the site, replace `YOUR_WEBSITE_ID` in `index.html`, and uncomment the script tag; verify that Umami reports zero cookies and no personal data in the dashboard before enabling on any deployment
- [ ] **Version tagging** `[infra]` — create git tags for stable milestones once the corpus is stable enough to track; use semantic versioning (`v0.1.0` for Phase 1 launch, `v0.2.0` for Phase 2 AI, `v1.0.0` for Phase 3 public)
- [ ] **Phase 3 public corpus** `[infra]` `[corpus]` — compile static JSON from WAI Understanding docs, WebAIM articles, Deque University, and axe-core rule descriptions; curation task, not infrastructure; same JSON schema as Phase 1; this corpus is never mixed with Mikey's personal corpus
- [ ] **Phase 3 hosting** `[infra]` — set up a separate Netlify site from a separate repo for the Phase 3 public deployment; the personal corpus never appears in that repo

---

## Plugins

- [ ] **Ko-fi a11y patch as standalone plugin** `[code]` `[a11y]` — extract `patchKofiA11y` from `App.jsx` into `src/plugins/kofi/KofiWidget.jsx` and `src/plugins/kofi/index.js`; the plugin should be drop-in for any React project that embeds the Ko-fi overlay widget; include a self-contained CSS file (`kofi.css`) that applies accessible styling patches — focus ring on the trigger button, visible outline on the popup container, improved close-button target size — since Ko-fi's widget is visually styled outside our control and CSS patches are the safest lever we have; document selectors used and note they may need updating if Ko-fi changes its markup

---

## Code Quality

- [ ] **Button system unification** `[code]` `[design]` — the codebase has `.btn-accent` (primary), `.btn-ghost` (secondary/back-compat), `.btn-secondary` (new named alias), `.btn-icon`, `.btn-icon-accent`, and `.field-btn` (compact field actions); consolidate into a clean two-tier system: `.btn` base + `.btn--primary`, `.btn--secondary`, `.btn--icon`, and `.btn--field` variants; migrate all uses; this enables the system to be extracted as a standalone UI plugin; `.btn-ghost` can be kept as a back-compat alias during migration
- [ ] **UI component library extraction** `[code]` — the SPA patterns developed here (router, announcer, focus management, button system, form controls, modal/drawer/bottom-sheet) are strong candidates for a standalone React component library; document the extraction path; consider a monorepo setup with `packages/ui` alongside the main app
- [ ] **Migrate inline spacing to tokens** `[code]` — audit all components for raw pixel or rem values in inline styles that are not referencing `var(--space-*)`; replace with the nearest token; this is the last major inline-value migration after font sizes (done) and priority colors (done in this session)
- [ ] **CSS Modules** `[code]` — evaluate migrating from inline styles to CSS Modules as the component count grows; CSS Modules give better tooling (autocomplete, dead-code detection) without adding a CSS-in-JS runtime; not urgent while the component set is small
- [x] ~~**PR template** `[code]` — `.github/PULL_REQUEST_TEMPLATE.md` referenced in `CONTRIBUTING.md`~~

---

## Resolved

- [x] ~~**Zero-dep i18n system** `[i18n]` `[code]` — `src/i18n/index.jsx`: React Context + `useT()` hook; flat-key JSON; `{placeholder}` interpolation; double-fallback chain; no external library; `AppShell`/`AppContent` split so provider and consumer are separate components~~
- [x] ~~**UI string extraction** `[i18n]` `[code]` — all ~93 UI strings extracted to `src/i18n/en.json`; all components (SearchBar, ResultList, DetailPanel, SettingsPanel, Header, Footer, PartyBanner) wired with `useT()`; all `announce()` calls use translated strings~~
- [x] ~~**10 locale files** `[i18n]` — en, es, fr, de, nl, sv, zh, ko, ja, tl; complete AI-generated translations; `settings.privacy_body_translations` disclosure key in every locale~~
- [x] ~~**Privacy button layout** `[design]` `[ux]` — moved to `.settings-footer-row`; desktop: privacy left + Save right; mobile: Save on top, privacy below; privacy modal extended with AI translation disclosure paragraph~~
- [x] ~~**PR template referenced in CONTRIBUTING.md** `[code]` — "No template required" updated to reference `.github/PULL_REQUEST_TEMPLATE.md`~~

- [x] ~~**Settings ↔ defect panel navigation** `[ux]` `[a11y]` — opening Settings while a panel is selected preserves the panel state via `keepMounted`; closing Settings restores the panel with edits intact and returns keyboard focus via `focusTrigger`~~
- [x] ~~**Reset confirmation modal** `[ux]` — if >70% of a textarea's original text has changed, Reset opens a "Are you sure?" confirmation modal; uses `isSignificantlyChanged` (Levenshtein-based); stacked Yes/No buttons using `.btn-ghost` secondary style~~
- [x] ~~**BottomSheet close button layout fix** `[design]` — button was half-clipped by `overflow: hidden` at the rounded corner due to `position: absolute`; moved to normal flex flow; handle re-centered via absolute on the handle instead; mobile bottom Close button added~~
- [x] ~~**SC lines as bulleted list** `[design]` — "Fails:" and "Related:" now rendered as `<ul>` with disc bullets and indent instead of plain `<p>` elements~~
- [x] ~~**Rewrite button size fix** `[design]` — padding overrides `field-btn` to match the adjacent input height; `align-items: flex-start` on the refine row~~
- [x] ~~**"Typeahead" renamed to "Live search"** `[ux]` — code: `typeahead` → `liveSearch`; localStorage key: `typeahead` → `liveSearch`; UI labels and hint text updated~~
- [x] ~~**Language selector** `[i18n]` `[ux]` `[a11y]` — selector in Settings (Appearance section); defaults to OS/browser language; persists to localStorage; updates `html lang` attribute; 10 languages listed (en, es, fr, de, nl, sv, zh, ko, ja, tl)~~
- [x] ~~**Settings section order** `[ux]` `[design]` — Appearance (Theme, Language) moved before Search (Platform, Live search)~~
- [x] ~~**SearchBar hint text improved** `[ux]` — shows current platform and AI provider name; "Settings" is a button, not the whole hint~~
- [x] ~~**Non-AI refine hint links to Settings** `[ux]` — "Enable AI in Settings" is now a real button that navigates to Settings and preserves the defect panel~~
- [x] ~~**Modal heading line-height: 1em** `[design]`~~
- [x] ~~**Modal actions prop** `[code]` — Modal now supports a custom `actions` array for stacked footer buttons~~
- [x] ~~**Ghost button style** `[design]` `[code]` — `.btn-ghost` added; used for secondary/cancel modal buttons~~
- [x] ~~**Modal top-overflow fix** `[design]` — `max-height` formula changed so modal top is always ≥ `--space-6` from viewport top~~
- [x] ~~**Drawer bottom padding** `[design]` — `padding-bottom: 5rem` added to `.drawer-panel` so Ko-fi floating button does not cover settings content~~
- [x] ~~**Party Mode theme** `[design]` `[ux]` `[a11y]` — fourth theme chip in Settings; random complementary color palette applied as inline CSS custom properties on each activation; Comic Sans font, magic wand cursor (star tip, angled); 5-second confetti animation (Confetti.jsx); skipped when `prefers-reduced-motion: reduce`; assertive `announce()` describes all changes on activation; reduced-motion disclosure note at bottom of Settings~~
- [x] ~~**Copy guard** `[ux]` — copying an empty field now shows a "Nothing to copy" Modal instead of silently writing nothing~~
- [x] ~~**Search label color** `[design]` — "Describe the defect or observation" label changed from `--text-muted` to `--text` to match other labels~~
- [x] ~~**"AI assist is active" wording** `[ux]` — corrected from "AI assist is on" in search hint~~
- [x] ~~**Clear search icon** `[design]` — X replaced with ↺ reset symbol to match Field reset buttons~~
- [x] ~~**Rewrite button height** `[design]` — `align-self: stretch` so button matches adjacent input height; `align-items: stretch` on row~~
- [x] ~~**LinkedIn footer** `[design]` — Bluesky replaced with LinkedIn (linkedin.com/in/mikeyil)~~
- [x] ~~**Settings save button divider** `[design]` — `border-top` added above the Save button row~~
- [x] ~~**Footer: "Made by" → "A project by"** `[design]`~~
- [x] ~~**Ko-fi accessibility letter** `[a11y]` — `docs/LETTER_TO_KOFI.md` created; added to `.gitignore`~~
- [x] ~~**`.gitignore` updated** `[infra]` — added private corpus file and `docs/LETTER_TO_KOFI.md`~~
- [x] ~~**Public corpus expanded to 54 entries** `[corpus]` — 13 new entries (ATH-051–063) added from axe, WCAG Understanding docs, WebAIM; topics include captions, audio description, live regions, error suggestions, gesture alternatives, and more~~
- [x] ~~**Public corpus seeded** `[corpus]` — 41 simplified entries at middle school/ESL reading level; 9 near-duplicates consolidated; all `desc`/`rem` rewritten in plain language; `dataService.js` now points to `corpus.json` as the default~~
- [x] ~~**DetailPanel SC text links** `[design]` `[a11y]` — SC pill badges replaced with inline text links; format is "Fails: 1.1.1 …" and "Related: …, …"; `ScBadge` component removed; `.sc-badge` / `.badge-group` CSS removed~~
- [x] ~~**Priority badge in DetailPanel** `[design]` — priority badge added to title row alongside the defect heading; uses same token colors as the result list~~
- [x] ~~**Refine section hint text** `[a11y]` `[ux]` — descriptive paragraph now appears below "Refine" label; non-AI text explains manual editing; AI text explains AI behavior and links to Settings~~
- [x] ~~**Rewrite button restyled** `[design]` `[a11y]` — button now uses `field-btn` class to match Reset/Copy buttons; Lucide `Sparkles` icon added; arrow removed; height matches adjacent input via `align-self: stretch`~~
- [x] ~~**BottomSheet close button spacing** `[design]` — right padding increased from `--space-5` to `--space-6`; chrome top padding increased to `--space-4` to clear the border-radius clip zone for the focus ring~~
- [x] ~~**Privacy modal** `[ux]` `[design]` — `Modal` component added to `src/plugins/router/`; SettingsPanel inline privacy paragraphs replaced with a "Privacy & storage information" button that opens the modal; modal uses `stopImmediatePropagation` on Escape so it doesn't cascade to the underlying Drawer~~
- [x] ~~**Ko-fi tooltip keyboard access** `[a11y]` — `<i rel="tooltip">` icons patched: `tabindex`, `role="button"`, `aria-label`, `focus`/`blur` events dispatch `mouseenter`/`mouseleave` to activate existing tooltip behavior~~
- [x] ~~**Ko-fi input labels** `[a11y]` — visible `<label>` elements injected above any Ko-fi overlay input/textarea that uses only placeholder text as a label~~
- [x] ~~**Ko-fi contrast override** `[a11y]` — CSS injected at runtime forcing minimum `#1a1a1a` text color inside Ko-fi floating chat wrapper and overlay~~

- [x] ~~**Announce copy and reset actions** `[a11y]` — `announce()` is now called from `DetailPanel` on copy success ("Description: Copied to clipboard") and on reset ("Description: Reset to original"); same for remediation; satisfies WCAG 4.1.3 Status Messages~~
- [x] ~~**Priority badge colors migrated to CSS tokens** `[code]` — `PRIORITY_COLORS` JS object removed from `ResultList.jsx`; component now reads `var(--priority-*-text/bg)`; dark mode overrides added to `tokens.css`~~
- [x] ~~**Dark mode priority badge colors** `[design]` `[a11y]` — dark mode token values added for all four priority levels; contrast ratios verified to meet WCAG 1.4.3 (≥ 4.5:1 badge text on badge bg)~~
- [x] ~~**`prefers-contrast: more` support** `[a11y]` — `@media (prefers-contrast: more)` block added to `tokens.css`; increases `--text-muted`, `--text-faint`, `--border-control`, and `--border` in both light and dark themes~~
- [x] ~~**DetailPanel close button touch target** `[a11y]` — `className="btn-icon"` added to the × button; now meets the 44×44px minimum (WCAG 2.5.5)~~
- [x] ~~**`body { font-size }` token bug fixed** `[code]` — `var(--fs-md)` (undefined) corrected to `var(--fs-body)` in `index.css`; body text now correctly inherits the 1rem / 16px base~~
- [x] ~~**Typography utility classes updated** `[code]` — `typography.css` scale utilities updated to reference the current 4-token system (`--fs-small/body/sub/heading`); stale references to the old 7-token system removed~~
- [x] ~~**Dead modal CSS removed** `[code]` — `.modal-overlay` and `.modal-content` CSS blocks removed from `index.css`; the settings modal was replaced by the OffCanvas panel in the previous session and these rules were no longer referenced~~
- [x] ~~**Content Security Policy added** `[privacy]` — `netlify.toml` created with a CSP header restricting scripts to `self`, styles to `self` + Google Fonts, fonts to `self` + Google Fonts CDN, and `connect-src` to the four AI provider APIs; also includes `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`~~
- [x] ~~**Privacy disclosure expanded** `[privacy]` — SettingsPanel now lists all four `localStorage` keys (theme, typeahead, provider, API keys) and explicitly states that no personal data or usage data is collected~~
- [x] ~~**`robots.txt` added** `[privacy]` — `public/robots.txt` created with `Disallow: /` to block all crawlers on the dev Netlify deployment; replace before Phase 3 launch~~
- [x] ~~**SEO meta tags added (commented out)** `[infra]` — `index.html` now contains a full commented-out SEO block: description, OG tags, Twitter Card, JSON-LD WebApplication schema, canonical link, and sitemap reference; `<meta name="robots" content="noindex, nofollow">` is active for the dev deployment~~
- [x] ~~**`theme-color` meta added** `[design]` — light and dark `theme-color` values set in `index.html`; tints the browser chrome on Chrome/Edge/Safari mobile~~
- [x] ~~**Vite vendor chunk splitting** `[perf]` — `vite.config.js` now specifies `manualChunks` to split React/React-DOM and Fuse.js into separate cached chunks~~
- [x] ~~**GitHub repo created and linked** `[infra]` — repo live at `https://github.com/mikeyil/a11ytexthelper`; footer "Fork on GitHub" link in `src/App.jsx` updated to point to the actual URL~~
- [x] ~~**Docs reorganized into `docs/` folder** `[infra]` — CHANGELOG.md, UPDATES.md, TODO.md, MAINTENANCE.md, CONTRIBUTING.md moved to `docs/`; README.md stays at root; internal links updated~~
- [x] ~~**Disabled form control text consistency** `[design]` `[a11y]` — `--text-disabled` token added to `tokens.css`; `select:disabled { opacity: 1 }` added to `index.css` to prevent browser opacity on the select; both the provider `<select>` and API key `<input>` now use `var(--text-disabled)` when AI assist is off — same text color, same border crispness~~
- [x] ~~**SPA redirect rule** `[infra]` — `netlify.toml` includes a `/*` → `/index.html` 200 redirect so direct links and hard reloads work correctly with the hash router~~
- [x] ~~**CSS full migration** `[code]` — all inline styles removed from every component; `onMouseEnter`/`onMouseLeave` replaced by CSS `:hover`; `onFocus`/`onBlur` replaced by CSS `:focus`; disabled state by CSS `:has(:disabled)`; Toggle hover state and RadioChip focus ring both moved to CSS `:has()` selectors; BEM class naming throughout; stylelint updated with custom `selector-class-pattern` to allow `__` and `--`~~
- [x] ~~**Ko-fi floating widget embedded** `[ux]` — `KofiWidget` component added to `App.jsx`; loads the Ko-fi overlay widget script; users can support without leaving the page; a11y patches applied via `patchKofiA11y` MutationObserver~~
- [x] ~~**Ko-fi mobile footer clearance** `[design]` — `padding-bottom: 5rem` added to `.page-footer` on mobile via `@media (width < 768px)`; the floating Ko-fi button no longer overlaps the footer credit text~~
- [x] ~~**Header and footer redesign** `[design]` — GitHub link moved to header top-left (hides with h1 when settings open); footer collapsed to single line with Bluesky handle; Ko-fi widget replaced the Ko-fi footer link; all footer content centered~~
- [x] ~~**Lazy load SettingsPanel** `[perf]` — `React.lazy()` + `Suspense` wraps the settings import so the settings bundle is only fetched the first time settings opens~~
- [x] ~~**Drawer (OffCanvas rename)** `[code]` — `OffCanvas` renamed to `Drawer` across all files (component, CSS classes `.drawer-*`, index export, App.jsx, comments, README); "off-canvas" is an implementation term; "drawer" is the design-system standard~~
- [x] ~~**BottomSheet plugin** `[ux]` `[a11y]` — `BottomSheet` component added to `src/plugins/router/`; slides up from bottom on all viewports; sticky chrome with drag handle pill and Lucide X close button; full focus trap, focus save/restore, Escape, `inert`, children-only-when-open; wraps DetailPanel in `App.jsx`~~
- [x] ~~**DetailPanel heading to `--fs-h1`** `[design]` — `.detail-title` bumped from `--fs-heading` to `--fs-h1` to match page h1 and Settings heading scale; font-weight bumped to 700~~
- [x] ~~**Settings heading to `--fs-h1`** `[design]` — `.settings-title` uses `var(--fs-h1)` to match the page h1 at all viewports~~
- [x] ~~**Settings full-screen on mobile** `[ux]` — Drawer panel uses `inset: 0; width: 100%` on mobile; no partial background visible behind settings~~
- [x] ~~**Close button standardized** `[design]` `[a11y]` — both DetailPanel and Settings close buttons now use Lucide `<X size={20}>` with `btn-icon btn-icon-accent`; the old `×` character was removed from DetailPanel when the BottomSheet chrome took over~~
- [x] ~~**`--overlay-bg` design token** `[code]` — `rgb(0 0 0 / 0.45)` was hardcoded in both backdrop rules; extracted to `--overlay-bg` in `tokens.css` and referenced in both `.drawer-backdrop` and `.sheet-backdrop`~~
- [x] ~~**Dead prop removed from DetailPanel** `[code]` — `onClose` prop was accepted but never used after the BottomSheet took over close responsibility; removed from the function signature and all call sites~~
- [x] ~~**CSS specificity fix — search input** `[code]` — `input[type="text"]` selector (specificity 0,1,1) was overriding `.search-input` (0,1,0) causing unexpected margin inheritance; fixed by qualifying as `input.search-input`~~
- [x] ~~**Disabled label muting via CSS** `[design]` `[a11y]` — `.settings-provider-group:has(:disabled) .settings-field-label` and similar rules added; labels for disabled controls use `--text-faint` at reduced opacity; verified ≥ 4.5:1 contrast ratio maintained~~
- [x] ~~**Router README — complete rewrite** `[code]` — added `Drawer` and `BottomSheet` sections (props, CSS classes), new Escape key rule documenting the double-fire pattern, `inert` added to modal checklist, event-source state rule, `tabIndex={-1}` outline guidance, and children-only-when-open note~~
- [x] ~~**Announcer README updates** `[code]` — auto-clear behavior documented (messages cleared ~1 s after announcement); all lint warnings resolved (table pipe spacing, code fence language tags, list blank lines)~~
- [x] ~~Router plugin — `src/plugins/router/` with hash routing, Drawer, BottomSheet, useFocusOnMount, useReturnFocus, useFocusTrap, useMediaQuery; reusable across future projects; documented in `src/plugins/router/README.md`~~
- [x] ~~Settings as own page / drawer panel — desktop: full-page swap; mobile: slide-in from left; browser Back button closes; no modal~~
- [x] ~~Focus trap — `useFocusTrap` hook restricts Tab to open modals and panels (WCAG 2.1.2); used internally by Drawer and BottomSheet~~
- [x] ~~Result-click focus management — BottomSheet opens and DetailPanel h2 gets `useFocusOnMount`; focus moves there on every selection~~
- [x] ~~Settings focus management — heading focus on open; trigger-button focus restored on close~~
- [x] ~~Font scale simplified — 7 tokens → 4 (`--fs-small/body/sub/heading`); `html { font-size: 100% }` (browser default); h1 uses `clamp(1.75rem, 10.5vw, 2.667rem)`~~
- [x] ~~Font token migration — all inline literal px values replaced across all components~~
- [x] ~~Corpus renamed from `defects.json`; public placeholder `corpus.json` created~~
- [x] ~~Mobile-first layout — `.app-container` class, 768px breakpoint~~
- [x] ~~Touch targets — `.btn-icon` (44×44px), platform toggle padding bump~~
- [x] ~~Design token system — `tokens.css`~~
- [x] ~~Typography file — `typography.css`~~
- [x] ~~Linting — ESLint 9 + jsx-a11y + react-hooks + Stylelint + `@axe-core/react`~~
- [x] ~~A11y fixes — label associations, keyboard on result list, dialog ARIA, Escape via document listener~~
- [x] ~~Settings mobile bottom sheet — slides up, drag handle, Escape dismissal~~
- [x] ~~Icon sizing — gear 22px, close 24px (iOS scale)~~
- [x] ~~Typeahead toggle — on by default; off mode shows Search button and requires Enter/click~~
- [x] ~~WAI SC links — ScBadge in DetailPanel links to WCAG 2.2 Understanding pages~~
- [x] ~~Toggle component extracted from SettingsPanel — reused for AI assist and typeahead~~
- [x] ~~Theme moved to Settings — Light / Auto / Dark radio chips; Auto follows prefers-color-scheme and updates live~~
- [x] ~~Settings section headers — Search, Appearance, AI Assist (h3 within h2 dialog)~~
- [x] ~~Search input — visible label "Describe the defect"; placeholder is now just the e.g. example; input is two lines tall (3rem min-height) for comfort~~
- [x] ~~Semantic HTML — `<search>` wrapper on SearchBar; `<section>` on NoResults; `<fieldset>`/`<legend>` on theme chip group~~
- [x] ~~Focus ring — global `:focus-visible` rule using `--focus` token (6.4:1 light, 4.6:1 dark); no more `outline: none` on inputs~~
- [x] ~~Text contrast — `--text-faint` corrected to #767676 (light, 4.5:1) and #909090 (dark, 5.0:1); all body text now ≥ 4.5:1~~
- [x] ~~Font size base — `html { font-size: 100% }` (browser default); `--fs-*` tokens in rem; inherits browser font size preferences (WCAG 1.4.4)~~
- [x] ~~Nothing Found state — styled empty state with SVG magnifying-glass illustration and search tips~~
- [x] ~~SR-only utility — `.sr-only` class added to `index.css`; used for visually hidden radio legend in theme chip group~~
