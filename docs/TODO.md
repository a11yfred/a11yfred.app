# TODO

Personal backlog for A11yTextHelper. Completed items are deleted — see [docs/CHANGELOG.md](CHANGELOG.md) for the record.

Category tags: `[corpus]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[claude]`

`[claude]` = suggested by Claude during a review or sweep session (not a user-originated request)

---

## Immediate

- [ ] **Populate finding corpus** `[corpus]` — import from audit spreadsheets; target 150–200 entries across web and native; review existing starters for accuracy and voice consistency
- [ ] **Offline-first PWA** `[infra]` — add a Service Worker that caches the app shell and corpus JSON so the app works fully without an internet connection after the first load; use Vite's `vite-plugin-pwa` or a hand-rolled `service-worker.js`; add a Web App Manifest so it can be installed to the home screen; test on mobile Chrome
- [ ] **Verify Ko-fi a11y patch selectors** `[a11y]` — `patchKofiA11y` in `App.jsx` uses CSS selectors that were guessed from Ko-fi's known class conventions; open the deployed app with Ko-fi loaded, inspect the actual injected DOM in DevTools, and update the selectors and Escape-key close-button targeting to match the real markup
- [ ] **Revisit animations** `[ux]` `[a11y]` — several transitions are missing or inconsistent: the BottomSheet has a slide-up entrance but no slide-down exit animation; the result list appears instantly with no stagger; SettingsPanel on desktop switches without any transition; bundle all animation improvements into one pass and verify every new animation is disabled under `prefers-reduced-motion: reduce`
- [ ] **Result list keyboard navigation** `[ux]` `[a11y]` — the result list uses `role="listbox"` / `role="option"` but does not implement Up/Down/Home/End arrow key navigation; add `onKeyDown` handler to the list container to complete the ARIA listbox keyboard contract (WCAG 2.1.1)
- [ ] **Search results heading and count** `[a11y]` `[ux]` — add a visually present `<h2>` above the result list that reads "X results" (e.g. "12 results") when results are shown; move keyboard focus to this heading when a new result set appears so screen reader users hear the count without having to navigate into the list; the heading should disappear when the query is cleared

---

## Corpus

- [ ] **Review new corpus entries ATH-004 through ATH-070** `[corpus]` — 16 entries added 2026-04-26; wording, remediation advice, keywords, and priority assignments need an editorial pass before treating them as final; compare voice and specificity against ATH-001–063
- [ ] **Batch import tooling** `[corpus]` `[claude]` — write a small Node.js or Python script that reads rows from a CSV or Excel export of your audit spreadsheets and converts them to the corpus JSON schema; run once, review the output for voice consistency and keyword coverage, then delete the script
- [ ] **Keyword audit** `[corpus]` — after the batch import, review the `keywords` array on every entry; keywords drive Fuse.js relevance more than any other field, and imported entries from spreadsheets often need additional synonyms and component names added
- [ ] **Platform coverage** `[corpus]` — verify that native-only findings are flagged `"platform": "native"` and that `"both"` entries make sense on each platform; aim for roughly 40% native or both entries to make the Native filter useful
- [ ] **Related SC links** `[corpus]` — spot-check the `related` arrays for accuracy; some starter entries are missing secondary success criteria that are commonly cited alongside the primary SC
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` — add a toggle in Settings to switch between the private corpus and the generic public corpus (`corpus.json`); the two files are already separate; the toggle should persist to `localStorage` and only appear if both files are available
- [ ] **Public corpus bootstrap** `[corpus]` — seed the generic public corpus from WAI Understanding docs, axe-core rules, and Deque University entries; target 200+ entries before any Phase 3 public launch; same JSON schema as the personal corpus
- [ ] **Corpus provenance field** `[corpus]` `[claude]` — add a `source` field to each finding entry indicating origin (e.g. `"personal"`, `"WAI"`, `"axe"`, `"Deque"`); helps contributors understand where an entry came from and what style to follow when adding similar entries
- [ ] **Custom data source** `[corpus]` `[ux]` — allow Settings to accept a URL or file path pointing to a user-supplied JSON corpus; validate the schema on load, fall back to the built-in corpus if the source is unreachable or malformed; document the expected schema in a help tooltip

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

- [ ] **Corpus pre-translation script** `[i18n]` `[corpus]` `[claude]` — write a Node.js script that calls an AI provider to translate all `corpus.json` `desc` and `rem` fields into each supported locale; output as `corpus.{lang}.json` files; update `dataService.js` to accept a `locale` param and load the appropriate file; run once, review for WCAG terminology accuracy before committing
- [ ] **AI refinement locale pass** `[i18n]` `[ai]` `[claude]` — after `getAiRefinement` rewrites `desc` and `rem`, if the active locale is not English, have the AI respond in the active locale directly (update the system prompt to instruct the model to reply in `{locale}`) rather than post-translating

---

## AI

- [ ] **Wire Microsoft Copilot** `[ai]` — requires `VITE_AZURE_OPENAI_ENDPOINT` env var set to a full Azure OpenAI deployment URL; implemented in `aiService.js` but untested; add the env var and verify the response parses correctly
- [ ] **AI error surface** `[ai]` `[ux]` — refinement failures currently show a generic "Revision Failed" modal; parse HTTP status codes to show specific messages: 401 = invalid key, 429 = rate limit exceeded, 503 = service unavailable; network failures (no connection) should be distinguished from API errors; include the provider name in the message
- [ ] **System prompt tuning** `[ai]` `[claude]` — test AI refinements across at least 20 different finding types covering a variety of SCs, priorities, and platforms; adjust the tone, length, and format instructions in `buildPrompt` in `aiService.js` if the output drifts from the established voice
- [ ] **AI refinement loading state** `[ux]` `[a11y]` — replace the "Revising…" button text with an animated spinner using CSS; add `aria-busy="true"` to the button during the request; respect `prefers-reduced-motion` by disabling the spin animation and showing text only instead

---

## AI Agent Support

Agent support means upgrading the single-shot AI refinement call into a multi-step, tool-using workflow. The goals are: more accurate rewrites, corpus-aware suggestions, and eventually autonomous finding research.

- [ ] **Evaluate tool use approach** `[agent]` `[ai]` `[claude]` — prototype replacing the `buildPrompt` + single API call in `aiService.js` with an Anthropic tool use call; define a `search_corpus` tool that the model can invoke to look up related findings before rewriting; compare output quality against the current single-prompt approach before committing
- [ ] **`search_corpus` tool definition** `[agent]` `[ai]` `[claude]` — define a JSON tool schema that accepts a natural-language query string and returns the top 3 matching corpus entries (using the existing Fuse.js `useFindingSearch` logic); expose this as a callable function that the Anthropic API can invoke during an agentic turn
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` — extend the Refine section of `DetailPanel` to support a short back-and-forth conversation; store turn history in local component state as an array of `{ role, content }` objects; pass the full history in each subsequent API call; add a "Clear conversation" button that resets the history without closing the panel
- [ ] **Agentic error and loop handling** `[agent]` `[ai]` `[claude]` — when using tool use, add a turn limit (e.g. 5 tool calls max) to prevent runaway loops; surface a clear error message if the limit is reached; log each tool call result to the browser console in development for debugging
- [ ] **System prompt for agentic mode** `[agent]` `[ai]` `[claude]` — write a separate system prompt for the agentic workflow that instructs the model to always search the corpus before rewriting, to preserve the auditor's established voice, and to format the final output as two labeled lines (Description: / Remediation:); keep this separate from the single-shot `buildPrompt` in `aiService.js`
- [ ] **Model selection for agent mode** `[agent]` `[ai]` `[claude]` — tool use and multi-turn workflows are better served by larger models; default to `claude-opus-4-7` when agent mode is active; make this configurable in Settings alongside the existing provider/key inputs

---

## UX / Interaction

- [ ] **Result list arrow key navigation** `[ux]` `[a11y]` — the result list uses `role="listbox"` and `role="option"` but does not yet implement arrow key navigation; add `onKeyDown` handlers to the list container so that pressing Down/Up moves focus between options, and pressing Home/End jumps to the first/last option; this completes the ARIA listbox keyboard contract (WCAG 2.1.1)
- [ ] **WCAG version filter** `[ux]` `[corpus]` — add a filter option (alongside the Platform toggle) to narrow results by WCAG version: "2.1 only", "2.2 only", and "All"; requires a `wcagVersion` field on each corpus entry; see also WCAG version tagging in Competitive / Differentiators
- [ ] **How to use page** `[ux]` — add an onboarding modal or help page that explains the workflow: search → select → add location prefix → refine → copy; trigger it on first visit (check a `localStorage` flag) or via a Help button in the header; the content should be brief enough to read in under 30 seconds
- [ ] **About / data sources page** `[ux]` `[corpus]` — when an About or How-to page is created, include a section describing how the public corpus was compiled and the sources used: WCAG 2.2 Understanding docs (W3C/WAI), axe-core rule descriptions (Deque), WebAIM articles, and Deque University; explain that entries are written in plain language and near-duplicates are consolidated; this gives users confidence in the data and gives proper credit to the source organizations
- [ ] **Email results** `[ux]` — add a button to email the selected finding description and remediation to yourself using a `mailto:` link with a pre-populated subject and body; no server required; useful for quickly forwarding a finding write-up from a phone
- [ ] **Persist last selected finding** `[ux]` — save the selected finding's `id` to `sessionStorage` when it is selected; restore the selection on page reload so the user does not lose their place mid-session; clear on tab close (session scoped, not persistent)
- [ ] **Copy both fields at once** `[ux]` — add a single "Copy all" button to the `DetailPanel` header that copies the description and remediation together as formatted plain text (e.g. `Description: …\n\nRemediation: …`); useful for pasting into email or a report
- [ ] **Bookmarks / favorites** `[ux]` — allow marking frequently used findings as favorites by clicking a star icon on the result card; persist favorites to `localStorage` as a Set of finding IDs; show a "Starred" section above search results when any favorites exist
- [ ] **Recent findings** `[ux]` — keep a running list of the last 10 selected findings in `localStorage`; display them as a "Recent" list below the search field when the query is empty and no result is selected; clear individual entries with a dismiss button
- [ ] **Export findings to formats** `[ux]` — let users export the currently selected finding (or a multi-select batch) to CSV, Markdown, or a plain text block; implement as a download via a Blob URL; no server required
- [ ] **Audit report builder** `[ux]` — multi-select multiple findings from the result list, add occurrence counts and severity overrides, and export a formatted accessibility audit report in Markdown or plain text; this is the primary deliverable format for most audit engagements
- [ ] **Component-level filtering** `[ux]` — add a secondary filter (in addition to the Platform toggle) that narrows results by UI component type (modal, form, button, heading, image, etc.); this requires adding a `component` field to the corpus schema and updating `useFindingSearch`
- [ ] **Upvote / downvote results** `[ux]` `[corpus]` — add thumbs up/down buttons to each result card; store ratings in `localStorage` keyed by finding ID; use ratings to boost or demote entries in Fuse.js scoring so frequently used findings surface higher; if authentication is added later, sync ratings to Supabase so they persist across devices

---

## Accessibility and Design

- [ ] **`prefers-reduced-motion` in JS animations** `[a11y]` `[claude]` — CSS transitions already honor `prefers-reduced-motion: reduce`; add a `window.matchMedia('(prefers-reduced-motion: reduce)')` check for any future JS-driven animations (e.g. the planned loading spinner on AI refinement)
- [ ] **Toggle design** `[design]` `[a11y]` — the current Toggle component uses a thin bar and circle; replace with a clearer on/off design using a power-button-style indicator symbol inside the thumb; ensure the focus ring is visible at all zoom levels
- [ ] **Gear icon replacement** `[design]` — the ⚙️ emoji renders differently across OSes and is not ideal for a refined UI; replace with an SVG gear icon that uses `currentColor` so it inherits the button's color and respects dark mode
- [ ] **Monospace result description** `[design]` `[claude]` — consider rendering the `desc` preview in the result list using the mono font stack to more closely match how it will look when copied into a spreadsheet; evaluate whether it improves or hurts scannability
- [ ] **Visible selection indicator** `[design]` `[a11y]` `[claude]` — the selected result card uses an accent border; add a secondary visual cue (e.g. a filled accent left-edge bar or a checkmark) so the selection is unmistakable, especially for users with color vision deficiencies
- [ ] **Empty state before search** `[design]` — the pre-search state (before any query is entered) shows only the search label and a help hint; add a short prompt, illustration, or sample query to make the tool feel more inviting and explain what to type
- [ ] **Ko-fi link in footer** `[ux]` — add a Ko-fi link in the footer as a fallback for when the floating widget is disabled
- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` — open deployed app, confirm selector matches for tooltip icons and overlay inputs

---

## Privacy and Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` — when the public Phase 3 version launches, add a brief privacy statement page explaining what data is and is not collected; Umami analytics (if enabled) collects no personal data and uses no cookies; API keys go only to the AI provider; no user data is retained by this app

---

## Performance and Optimization

- [ ] **Fuse.js profiling** `[perf]` `[claude]` — measure search latency with a corpus of 500+ entries using `performance.now()` around the `fuse.search()` call; if it exceeds 50ms, tune the `threshold`, `minMatchCharLength`, or `keys` weights in `useFindingSearch.js`

---

## Competitive / Differentiators

- [ ] **Bug tracker integration** `[ux]` `[infra]` — add pre-populated deep links to Jira and Linear that open a new ticket with the finding description and remediation already filled in; no API key or auth required for deep links; document the URL format for each tracker
- [ ] **WCAG version tagging** `[corpus]` — add a `wcagVersion` field to each corpus entry (`"2.1"` or `"2.2"`); display the version tag on the result card and in DetailPanel; useful when auditing against a specific version requirement
- [ ] **Compare mode** `[ux]` — allow the user to open two finding entries side by side to decide which fits better; implement as a split view in the main content area; useful when multiple success criteria could apply to the same observation
- [ ] **GitHub Sponsors** `[infra]` — set up GitHub Sponsors as a secondary tip option alongside the Ko-fi widget for Phase 3

---

## Authentication and User Data

- [ ] **Phase 2 stubs review** `[infra]` `[claude]` — before activating Supabase, re-read `src/services/authService.js` and `src/services/supabaseClient.js` comments against the current Supabase SDK docs; confirm OAuth provider slugs, table names, and RLS policy examples are still accurate
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` — stubs live in `src/services/authService.js` and `src/services/supabaseClient.js`; activate by installing `@supabase/supabase-js`, setting `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and uncommenting the implementation blocks; Supabase project setup instructions and DB schema (SQL) are in `supabaseClient.js`
- [ ] **Settings sync** `[infra]` `[ux]` — `syncSettings()` and `getRemoteSettings()` stubs in `dataService.js`; on sign-in, load remote settings and merge with localStorage; on any setting change, push to Supabase; API keys intentionally excluded from sync (localStorage only)
- [ ] **User-owned custom findings** `[corpus]` `[ux]` — `getUserFindings()`, `saveUserFinding()`, `deleteUserFinding()` stubs in `dataService.js`; DB schema in `supabaseClient.js`; UI: add/edit/delete controls in DetailPanel or a dedicated "My Findings" panel; IDs use `USR-*` prefix; mixed into search results alongside public corpus
- [ ] **Language-specific edit warning** `[ux]` `[i18n]` — when users can save custom edits to a finding entry, show a notice that edits apply only to the currently active language and will not persist if the user switches to a different locale; display this warning in the edit UI before the user saves
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` — when a user is signed in, sync upvote/downvote ratings to a `ratings` table (`user_id`, `finding_id`, `vote`); merge with any existing `localStorage` ratings on sign-in; `dataService.js` already abstracts the data layer, so this is a localized change
- [ ] **User-owned remote corpus** `[corpus]` `[infra]` — let signed-in users point the app at their own Supabase table or a remote JSON URL as a corpus source; add a URL/connection string field in Settings; fall back to the built-in corpus if the source is unreachable; private sources require auth so the key is never in the URL
- [ ] **Auth-gated personal corpus** `[corpus]` `[privacy]` — in the Phase 3 public deployment, serve Mikey's private corpus from a Supabase RLS-protected table rather than a bundled JSON file; unauthenticated users get `corpus.json` (public data) only; the private corpus never ships in any public build
- [ ] **Sign-in UI** `[ux]` — add a minimal sign-in section at the bottom of SettingsPanel (below AI Assist); show avatar and display name when signed in, "Sign in with Google / GitHub" buttons when not; sign-out option inline; no dedicated auth page needed

---

## Infrastructure

- [ ] **Electron desktop app — activate** `[infra]` — scaffold is in `electron/`; to activate: `npm install --save-dev electron electron-builder concurrently`, then `npm run electron:dev`; wire `window.electronAPI.keys.*` in SettingsPanel so API keys use `safeStorage` instead of `localStorage`; test on macOS and Windows; package with `npm run electron:build`
- [ ] **Umami analytics** `[infra]` — create an account at umami.is or self-host, add the site, replace `YOUR_WEBSITE_ID` in `index.html`, and uncomment the script tag; verify that Umami reports zero cookies and no personal data in the dashboard before enabling on any deployment
- [ ] **Version tagging** `[infra]` — create git tags for stable milestones once the corpus is stable enough to track; use semantic versioning (`v0.1.0` for Phase 1 launch, `v0.2.0` for Phase 2 AI, `v1.0.0` for Phase 3 public)
- [ ] **Phase 3 public corpus** `[infra]` `[corpus]` — compile static JSON from WAI Understanding docs, WebAIM articles, Deque University, and axe-core rule descriptions; curation task, not infrastructure; same JSON schema as Phase 1; this corpus is never mixed with Mikey's personal corpus
- [ ] **Phase 3 hosting** `[infra]` — set up a separate Netlify site from a separate repo for the Phase 3 public deployment; the personal corpus never appears in that repo

---

## Plugins

- [ ] **Ko-fi a11y patch as standalone plugin** `[code]` `[a11y]` `[claude]` — extract `patchKofiA11y` from `App.jsx` into `src/plugins/kofi/KofiWidget.jsx` and `src/plugins/kofi/index.js`; the plugin should be drop-in for any React project that embeds the Ko-fi overlay widget; include a self-contained CSS file (`kofi.css`) that applies accessible styling patches — focus ring on the trigger button, visible outline on the popup container, improved close-button target size — since Ko-fi's widget is visually styled outside our control and CSS patches are the safest lever we have; document selectors used and note they may need updating if Ko-fi changes its markup

---

## Code Quality

- [ ] **Button system unification** `[code]` `[design]` `[claude]` — the codebase has `.btn-accent` (primary), `.btn-ghost` (secondary/back-compat), `.btn-secondary` (new named alias), `.btn-icon`, `.btn-icon-accent`, and `.field-btn` (compact field actions); consolidate into a clean two-tier system: `.btn` base + `.btn--primary`, `.btn--secondary`, `.btn--icon`, and `.btn--field` variants; migrate all uses; this enables the system to be extracted as a standalone UI plugin; `.btn-ghost` can be kept as a back-compat alias during migration
- [ ] **UI component library extraction** `[code]` `[claude]` — the SPA patterns developed here (router, announcer, focus management, button system, form controls, modal/drawer/bottom-sheet) are strong candidates for a standalone React component library; document the extraction path; consider a monorepo setup with `packages/ui` alongside the main app
- [ ] **Migrate inline spacing to tokens** `[code]` `[claude]` — audit all components for raw pixel or rem values in inline styles that are not referencing `var(--space-*)`; replace with the nearest token; this is the last major inline-value migration after font sizes (done) and priority colors (done)
- [ ] **CSS Modules** `[code]` `[claude]` — evaluate migrating from inline styles to CSS Modules as the component count grows; CSS Modules give better tooling (autocomplete, dead-code detection) without adding a CSS-in-JS runtime; not urgent while the component set is small
