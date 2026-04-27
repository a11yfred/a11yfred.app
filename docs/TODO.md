# TODO

Personal backlog for A11yTextHelper. Completed items are deleted — see [docs/CHANGELOG.md](CHANGELOG.md) for the record.

Items are ordered **high value + low effort first** within each section, and sections are ordered the same way overall.

Category tags: `[priority]` `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[claude]` `[manual]` `[dormant]`

`[corpus]` and `[data]` are interchangeable — use either
`[priority]` = currently the most important; keep at the top of the backlog
`[claude]` = suggested by Claude during a review or sweep session (not a user-originated request)
`[manual]` = requires human judgment or action; Claude cannot complete this alone
`[dormant]` = not currently being worked on; keep for reference but do not prioritize

---

## Priority

- [ ] **Populate finding corpus** `[priority]` `[corpus]` — import from audit spreadsheets; target 150–200 entries across web and native; review existing starters for accuracy and voice consistency
- [ ] **Result list keyboard navigation** `[priority]` `[ux]` `[a11y]` — add Up/Down/Home/End arrow key navigation to the result list; result cards are currently plain buttons in a list (listbox/option pattern was removed); consider a roving tabindex approach or a dedicated keyboard shortcut (e.g. J/K) to move between cards without Tab
- [ ] **Revisit animations** `[priority]` `[ux]` `[a11y]` — several transitions are missing or inconsistent: the BottomSheet has a slide-up entrance but no slide-down exit animation; the result list appears instantly with no stagger; SettingsPanel on desktop switches without any transition; bundle all animation improvements into one pass and verify every new animation is disabled under `prefers-reduced-motion: reduce`
- [ ] **Offline-first PWA** `[priority]` `[infra]` — add a Service Worker that caches the app shell and corpus JSON so the app works fully without an internet connection after the first load; use Vite's `vite-plugin-pwa` or a hand-rolled `service-worker.js`; add a Web App Manifest so it can be installed to the home screen; test on mobile Chrome

---

## Data & Content

### Corpus & Findings

- [ ] **Review new corpus entries ATH-004 through ATH-070** `[corpus]` `[manual]` — 16 entries added 2026-04-26; wording, remediation advice, keywords, and priority assignments need an editorial pass before treating them as final; compare voice and specificity against ATH-001–063
- [ ] **Keyword audit** `[corpus]` `[manual]` — after the batch import, review the `keywords` array on every entry; keywords drive Fuse.js relevance more than any other field, and imported entries from spreadsheets often need additional synonyms and component names added
- [ ] **Platform coverage** `[corpus]` — verify that native-only findings are flagged `"platform": "native"` and that `"both"` entries make sense on each platform; aim for roughly 40% native or both entries to make the Native filter useful
- [ ] **Related SC links** `[corpus]` — spot-check the `related` arrays for accuracy; some starter entries are missing secondary success criteria that are commonly cited alongside the primary SC
- [x] **Corpus provenance field** `[corpus]` `[claude]` — `source` field added to all 76 corpus entries (`"ATH"` = Mikey's original entries); indigo source badge displayed in ResultList and DetailPanel alongside priority badge; tokens `--source-text`/`--source-bg` in light + dark mode (both ≥ 4.5:1)
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` — switching is already available via debug command (internal only); public-facing toggle requires authentication as a prerequisite — see Accounts & Cloud Sync
- [x] **Batch import tooling** `[corpus]` `[claude]` — `src/services/importService.js` handles .csv/.xlsx/.xls/.json; fuzzy column-name mapping; priority + platform normalization; USR-NNN ID generation; `importFromFile` + `importFromUrl` exposed on `useUserFindings` hook; SheetJS (xlsx) lazy-loaded as a separate chunk; file upload UI pending
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` — Phase 1: `importFromUrl` in importService handles public JSON URLs; Phase 2 (auth required): signed-in users point app at their own Supabase table via `dataService.getUserFindings()`; Settings UI + fallback behavior pending; prereq: Authentication (Accounts & Cloud Sync)
- [ ] **Public corpus bootstrap** `[corpus]` — seed the generic public corpus from WAI Understanding docs, axe-core rules, and Deque University entries; target 200+ entries before any Phase 3 public launch; same JSON schema as Phase 1; the `source` badge field enables clear attribution per entry; this corpus is never mixed with Mikey's personal corpus
- [ ] **Auth-gated personal corpus** `[corpus]` `[privacy]` — Phase 3: serve Mikey's private corpus from a Supabase RLS-protected table; unauthenticated users get `corpus.json` only; the private corpus never ships in any public build; prereq: Authentication (Accounts & Cloud Sync)

### Competitive / Differentiators

- [x] **WCAG version tagging** `[corpus]` `[claude]` — `wcagVersion` + `wcagLevel` added to all 76 corpus entries (2.0/2.1/2.2 mapped from SC number; Level A/AA/AAA per spec); teal WCAG badge (`--wcag-text`/`--wcag-bg`, light + dark, both ≥ 4.5:1) displayed alongside source badge in ResultList and DetailPanel; N/A entries left blank
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` — add pre-populated deep links to Jira and Linear that open a new ticket with the finding description and remediation already filled in; no API key or auth required for deep links; document the URL format for each tracker
- [ ] **Compare mode** `[ux]` `[enhancement]` — allow the user to open two finding entries side by side to decide which fits better; implement as a split view in the main content area; useful when multiple success criteria could apply to the same observation

---

## User Experience Design

### UX

- [ ] **Email results** `[ux]` `[enhancement]` — add a button to send the selected finding description and remediation via an email provider (server-side); useful for quickly forwarding a finding write-up
- [ ] **Copy both fields at once + reset** `[ux]` — add a "Copy all" button (below the refine textarea, right side) that copies description and remediation together as formatted plain text (`Description: …\n\nRemediation: …`); also add a "Reset all" button beside it that resets both text areas to original values; useful for pasting into email or a report
- [x] **Persist last selected finding** `[ux]` — `sessionStorage.setItem('lastSelectedId')` wired in `handleSelectFinding`; restore-on-mount `useEffect` fires once after data loads when URL is bare; cleared on deselect and tab close
- [x] **Recent findings** `[ux]` — `localStorage` key `recentFindings` (max 10, deduped, newest first) updated on every selection in `handleSelectFinding`; display UI pending
- [ ] **Frequent findings** `[ux]` `[privacy]` — track implicit usage: increment open count when a finding's panel is opened, copy count when a copy button is used; persist per-finding `{ opens, copies }` to `localStorage` as `frequentFindings`; settings option to show a "Frequent" section above results (followed by "Starred" from ratings); update privacy statement to document the new storage key
- [ ] **Pin results to home page** `[ux]` `[privacy]` — add a pin toggle button inside each result tile (top-right, visible on hover/focus); pinned findings appear in a "Pinned" section on the home page before any search; persist as `pinnedFindings` (array of IDs) in `localStorage`; reset all clears pins; update privacy statement
- [ ] **How to use page** `[ux]` — onboarding modal on first visit (check `localStorage` flag `showHowToUse`); workflow: search → select → add location prefix → refine → copy; "Show this on startup" checkbox defaults checked; Help button in the header can also open it as a panel (same content, more detail); settings toggle to re-enable the startup modal; brief enough to read in under 30 seconds
- [ ] **About / data sources** `[ux]` `[corpus]` — add a data sources section to the existing About page describing how the public corpus was compiled: WCAG 2.2 Understanding docs (W3C/WAI), axe-core rule descriptions (Deque), WebAIM articles, and Deque University; entries are written in plain language and near-duplicates are consolidated; allow About to scroll as content grows
- [ ] **WCAG version filter** `[ux]` `[corpus]` — add checkboxes in the SettingsPanel (alongside Platform toggle) to narrow results by WCAG version: "2.1 only", "2.2 only", and "All"; uses the `wcagVersion` field now present on all corpus entries
- [x] **Export findings to formats** `[ux]` — `exportFinding(finding, format)` utility complete in `src/utils/exportFinding.js`; supports `text`, `markdown`, `csv`; button UI pending
- [ ] **Copy / add / edit / delete findings** `[ux]` `[enhancement]` — data layer wired: `src/services/userFindingsService.js` (localStorage CRUD, USR-NNN IDs), `src/hooks/useUserFindings.js`, merged into `useFindingSearch` alongside corpus; UI (forms, inline edit, copy button) pending; auth prereq for cloud persistence
- [ ] **Narrow results mode** `[ux]` — when results are showing, display a toggle to enter "narrow" mode; the search input switches label and placeholder to reflect narrowing-within-results; the clear button becomes "Clear and reset" (clears the narrow filter and returns to the initial empty state); live-search setting governs whether narrowing updates in real time or on submit; show a count of narrowed vs. total results; replaced the original corpus `component` field approach
- [ ] **Upvote / downvote results** `[ux]` `[corpus]` — add thumbs up/down buttons to each result card; store ratings in `localStorage` keyed by finding ID; use ratings to boost or demote entries in Fuse.js scoring so frequently used findings surface higher; if authentication is added later, sync ratings to Supabase so they persist across devices
- [ ] **Audit report builder** `[ux]` — multi-select multiple findings from the result list, add occurrence counts and severity overrides, and export a formatted accessibility audit report in Markdown or plain text; this is the primary deliverable format for most audit engagements
- [ ] **Language-specific edit warning** `[ux]` `[i18n]` — when users can save custom edits to a finding entry, show a notice that edits apply only to the currently active language and will not persist if the user switches to a different locale; display this warning in the edit UI before the user saves
- [ ] **Ko-fi link in footer** `[ux]` `[dormant]` — add a Ko-fi link in the footer as a fallback for when the floating widget is disabled

### Visual Design

- [ ] **Gear icon replacement** `[design]` — the ⚙️ emoji renders differently across OSes and is not ideal for a refined UI; replace with an SVG gear icon that uses `currentColor` so it inherits the button's color and respects dark mode
- [ ] **Empty state before search** `[design]` — the pre-search state (before any query is entered) shows only the search label and a help hint; add a short prompt, illustration, or sample query to make the tool feel more inviting and explain what to type
- [ ] **Toggle design** `[design]` `[a11y]` — the current Toggle component uses a thin bar and circle; replace with a clearer on/off design using a power-button-style indicator symbol inside the thumb; ensure the focus ring is visible at all zoom levels
- [ ] **Visible selection indicator** `[design]` `[a11y]` `[claude]` — the selected result card uses an accent border; add a secondary visual cue (e.g. a filled accent left-edge bar or a checkmark) so the selection is unmistakable, especially for users with color vision deficiencies
- [ ] **Monospace result description** `[design]` `[claude]` — consider rendering the `desc` preview in the result list using the mono font stack to more closely match how it will look when copied into a spreadsheet; evaluate whether it improves or hurts scannability
- [ ] **Priority control placement** `[ux]` `[design]` — revisit where the priority badge and any future priority-setting control lives in the result card and detail panel; currently badge is top-right of card header; consider whether it belongs in a metadata row below the title alongside SC and platform for better scannability
- [ ] **Button system unification** `[design]` `[code]` `[claude]` — the codebase has `.btn-accent`, `.btn-ghost`, `.btn-secondary`, `.btn-icon`, `.btn-icon-accent`, and `.field-btn`; consolidate into a clean two-tier system: `.btn` base + `.btn--primary`, `.btn--secondary`, `.btn--icon`, `.btn--field` variants; migrate all uses; enables extraction as a standalone UI plugin

---

## Accessibility (A11Y)

- [ ] **Skip links** `[a11y]` — add a visually-hidden "Skip to main content" link as the first focusable element in the page; on keyboard focus it becomes visible; target is the `<main>` element; also evaluate a "Skip to results" link when results are visible; WCAG 2.4.1 Bypass Blocks (Level A)
- [ ] **Visible selection indicator** `[a11y]` `[design]` `[claude]` — see Visual Design; listed here for a11y tracking
- [ ] **Toggle design** `[a11y]` `[design]` — see Visual Design; focus ring visibility is the a11y concern
- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` `[dormant]` — open deployed app, confirm selector matches for tooltip icons and overlay inputs
- ~~**`prefers-reduced-motion` in JS animations** `[a11y]` `[claude]` — CSS transitions already honor `prefers-reduced-motion: reduce`; add a `window.matchMedia('(prefers-reduced-motion: reduce)')` check for any future JS-driven animations~~

---

## AI

### AI Assist

- [ ] **AI error surface** `[ai]` `[ux]` — refinement failures currently show a generic "Revision Failed" modal; parse HTTP status codes to show specific messages: 401 = invalid key, 429 = rate limit exceeded, 503 = service unavailable; network failures (no connection) should be distinguished from API errors; include the provider name in the message
- [ ] **Wire Microsoft Copilot** `[ai]` — requires `VITE_AZURE_OPENAI_ENDPOINT` env var set to a full Azure OpenAI deployment URL; implemented in `aiService.js` but untested; add the env var and verify the response parses correctly
- [ ] **System prompt tuning** `[ai]` `[claude]` — test AI refinements across at least 20 different finding types covering a variety of SCs, priorities, and platforms; adjust the tone, length, and format instructions in `buildPrompt` in `aiService.js` if the output drifts from the established voice
- ~~**AI refinement loading state** `[ux]` `[a11y]` — replace the "Revising…" button text with an animated spinner using CSS; add `aria-busy="true"` to the button during the request; respect `prefers-reduced-motion` by disabling the spin animation and showing text only instead~~

### AI Agent Support

Agent support means upgrading the single-shot AI refinement call into a multi-step, tool-using workflow. The goals are: more accurate rewrites, corpus-aware suggestions, and eventually autonomous finding research.

- [ ] **Evaluate tool use approach** `[agent]` `[ai]` `[claude]` — prototype replacing the `buildPrompt` + single API call in `aiService.js` with an Anthropic tool use call; define a `search_corpus` tool that the model can invoke to look up related findings before rewriting; compare output quality against the current single-prompt approach before committing
- [ ] **`search_corpus` tool definition** `[agent]` `[ai]` `[claude]` — define a JSON tool schema that accepts a natural-language query string and returns the top 3 matching corpus entries (using the existing Fuse.js `useFindingSearch` logic); expose this as a callable function that the Anthropic API can invoke during an agentic turn
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` — extend the Refine section of `DetailPanel` to support a short back-and-forth conversation; store turn history in local component state as an array of `{ role, content }` objects; pass the full history in each subsequent API call; add a "Clear conversation" button that resets the history without closing the panel
- [ ] **Agentic error and loop handling** `[agent]` `[ai]` `[claude]` — when using tool use, add a turn limit (e.g. 5 tool calls max) to prevent runaway loops; surface a clear error message if the limit is reached; log each tool call result to the browser console in development for debugging
- [ ] **System prompt for agentic mode** `[agent]` `[ai]` `[claude]` — write a separate system prompt for the agentic workflow that instructs the model to always search the corpus before rewriting, to preserve the auditor's established voice, and to format the final output as two labeled lines (Description: / Remediation:); keep this separate from the single-shot `buildPrompt` in `aiService.js`
- [ ] **Model selection for agent mode** `[agent]` `[ai]` `[claude]` — tool use and multi-turn workflows are better served by larger models; default to `claude-opus-4-7` when agent mode is active; make this configurable in Settings alongside the existing provider/key inputs

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

- [ ] **AI refinement locale pass** `[i18n]` `[ai]` `[claude]` — after `getAiRefinement` rewrites `desc` and `rem`, if the active locale is not English, have the AI respond in the active locale directly (update the system prompt to instruct the model to reply in `{locale}`) rather than post-translating
- [ ] **Corpus pre-translation script** `[i18n]` `[corpus]` `[claude]` — write a Node.js script that calls an AI provider to translate all `corpus.json` `desc` and `rem` fields into each supported locale; output as `corpus.{lang}.json` files; update `dataService.js` to accept a `locale` param and load the appropriate file; run once, review for WCAG terminology accuracy before committing

---

## Plugins

- [ ] **Ko-fi a11y patch as standalone plugin** `[code]` `[a11y]` `[dormant]` — extract `patchKofiA11y` from `App.jsx` into `src/plugins/kofi/KofiWidget.jsx` and `src/plugins/kofi/index.js`; the plugin should be drop-in for any React project that embeds the Ko-fi overlay widget; include a self-contained CSS file (`kofi.css`) that applies accessible styling patches — focus ring on the trigger button, visible outline on the popup container, improved close-button target size — since Ko-fi's widget is visually styled outside our control and CSS patches are the safest lever we have; document selectors used and note they may need updating if Ko-fi changes its markup

---

## DevOps

### Code Quality

- [ ] **Migrate inline spacing to tokens** `[code]` `[claude]` — audit all components for raw pixel or rem values in inline styles that are not referencing `var(--space-*)`; replace with the nearest token; this is the last major inline-value migration after font sizes (done) and priority colors (done)
- [ ] **UI component library extraction** `[code]` `[claude]` — the SPA patterns developed here (router, announcer, focus management, button system, form controls, modal/drawer/bottom-sheet) are strong candidates for a standalone React component library; document the extraction path; consider a monorepo setup with `packages/ui` alongside the main app
- [ ] **CSS Modules** `[code]` `[claude]` — evaluate migrating from inline styles to CSS Modules as the component count grows; CSS Modules give better tooling (autocomplete, dead-code detection) without adding a CSS-in-JS runtime; not urgent while the component set is small

### Infrastructure

- [ ] **Version tagging** `[infra]` — create git tags for stable milestones once the corpus is stable enough to track; use semantic versioning (`v0.1.0` for Phase 1 launch, `v0.2.0` for Phase 2 AI, `v1.0.0` for Phase 3 public)
- [ ] **Electron desktop app — activate** `[infra]` `[dormant]` — scaffold is in `electron/`; to activate: `npm install --save-dev electron electron-builder concurrently`, then `npm run electron:dev`; wire `window.electronAPI.keys.*` in SettingsPanel so API keys use `safeStorage` instead of `localStorage`; test on macOS and Windows; package with `npm run electron:build`
- [ ] **Umami analytics** `[infra]` `[dormant]` — create an account at umami.is or self-host, add the site, replace `YOUR_WEBSITE_ID` in `index.html`, and uncomment the script tag; verify that Umami reports zero cookies and no personal data in the dashboard before enabling on any deployment
- [ ] **Phase 3 hosting** `[infra]` `[dormant]` — set up a separate Netlify site from a separate repo for the Phase 3 public deployment; the personal corpus never appears in that repo

### Performance & Optimization

- [ ] **Fuse.js profiling** `[perf]` `[claude]` — measure search latency with a corpus of 500+ entries using `performance.now()` around the `fuse.search()` call; if it exceeds 50ms, tune the `threshold`, `minMatchCharLength`, or `keys` weights in `useFindingSearch.js`

### Privacy & Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` `[dormant]` — when the public Phase 3 version launches, add a brief privacy statement page explaining what data is and is not collected; Umami analytics (if enabled) collects no personal data and uses no cookies; API keys go only to the AI provider; no user data is retained by this app

---

## Accounts & Cloud Sync

### Authentication

- [ ] **Sign-in UI** `[ux]` — add a minimal sign-in section at the bottom of SettingsPanel (below AI Assist); show avatar and display name when signed in, "Sign in with Google / GitHub" buttons when not; sign-out option inline; no dedicated auth page needed
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` — stubs live in `src/services/authService.js` and `src/services/supabaseClient.js`; activate by installing `@supabase/supabase-js`, setting `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and uncommenting the implementation blocks; Supabase project setup instructions and DB schema (SQL) are in `supabaseClient.js`
- [ ] **Phase 2 stubs review** `[infra]` `[claude]` — before activating Supabase, re-read `src/services/authService.js` and `src/services/supabaseClient.js` comments against the current Supabase SDK docs; confirm OAuth provider slugs, table names, and RLS policy examples are still accurate
- [ ] **Auth-gated personal corpus** `[corpus]` `[privacy]` — see Data & Content; listed here as an auth enforcement concern

### Cloud Data Sync

- [ ] **Settings sync** `[infra]` `[ux]` — `syncSettings()` and `getRemoteSettings()` stubs in `dataService.js`; on sign-in, load remote settings and merge with localStorage; on any setting change, push to Supabase; API keys intentionally excluded from sync (localStorage only)
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` — Phase 1 localStorage layer is wired (`userFindingsService.js`, `useUserFindings.js`); Phase 2: activate `getUserFindings()`, `saveUserFinding()`, `deleteUserFinding()` stubs in `dataService.js` via Supabase; DB schema in `supabaseClient.js`
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` — when a user is signed in, sync upvote/downvote ratings to a `ratings` table (`user_id`, `finding_id`, `vote`); merge with any existing `localStorage` ratings on sign-in; `dataService.js` already abstracts the data layer, so this is a localized change
- [ ] **GitHub Sponsors** `[infra]` `[dormant]` — set up GitHub Sponsors as a secondary tip option alongside the Ko-fi widget for Phase 3
