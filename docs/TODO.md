# TODO

Personal backlog for A11yTextHelper. Completed items are deleted — see [docs/CHANGELOG.md](CHANGELOG.md) for the record.

Items are ordered **high value + low effort first** within each section, and sections are ordered the same way overall.

Category tags: `[priority]` `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[claude]` `[manual]` `[dormant]` `[phase3]` `[launch-blocker]`

`[corpus]` and `[data]` are interchangeable — use either
`[priority]` = currently the most important; keep at the top of the backlog
`[claude]` = suggested by Claude during a review or sweep session (not a user-originated request)
`[manual]` = requires human judgment or action; Claude cannot complete this alone
`[dormant]` = not currently being worked on; keep for reference but do not prioritize
`[phase3]` = requires authentication, public launch, or infrastructure that doesn't exist yet; do not schedule until Phase 3 scope is defined
`[launch-blocker]` = must be completed before any public Phase 3 launch; prioritize above all other phase3 items

---

## Priority

- [ ] **Populate finding corpus** `[priority]` `[corpus]` — import from audit spreadsheets; target 150–200 entries across web and native; review existing starters for accuracy and voice consistency
- [ ] **Result list keyboard navigation (Gmail-style)** `[priority]` `[ux]` `[a11y]` `[claude]` — implement keyboard shortcuts for result navigation and actions; supported keys: `J` = next result, `K` = previous result, `E` = archive current, `S` = star current, `^`/`↑` = upvote current (suggest Shift+↑), `V`/`↓` = downvote current (suggest Shift+↓), `U` = unarchive current; focus must be on result list; shortcuts disabled when typing in search field (detect if input is focused); add help text to header or Settings explaining shortcuts; reference Gmail docs for precedent
- [x] **Revisit animations** `[priority]` `[ux]` `[a11y]` — several transitions are missing or inconsistent: the BottomSheet has a slide-up entrance but no slide-down exit animation; the result list appears instantly with no stagger; SettingsPanel on desktop switches without any transition; bundle all animation improvements into one pass and verify every new animation is disabled under `prefers-reduced-motion: reduce`
- [x] **Offline-first PWA** `[priority]` `[infra]` — add a Service Worker that caches the app shell and corpus JSON so the app works fully without an internet connection after the first load; use Vite's `vite-plugin-pwa` or a hand-rolled `service-worker.js`; add a Web App Manifest so it can be installed to the home screen; test on mobile Chrome

---

## Data & Content

### Corpus & Findings

- [ ] **Review new corpus entries ATH-004 through ATH-070** `[corpus]` `[manual]` — 16 entries added 2026-04-26; wording, remediation advice, keywords, and priority assignments need an editorial pass before treating them as final; compare voice and specificity against ATH-001–063
- [ ] **Keyword audit** `[corpus]` `[manual]` — after the batch import, review the `keywords` array on every entry; keywords drive Fuse.js relevance more than any other field, and imported entries from spreadsheets often need additional synonyms and component names added
- [ ] **Add native-specific corpus entries** `[corpus]` — only 2 native-only entries (ATH-071, ATH-074) exist against 42 "both"; the Native filter works but lacks platform-unique findings; priority gaps to fill: (1) Large Text / Dynamic Type not supported (iOS Dynamic Type, Android font scale — web equiv is ATH-054/ATH-026), (2) Custom native view missing accessibility label (UIAccessibilityLabel / contentDescription — native-specific depth beyond ATH-001), (3) Accessibility announcements not implemented on native (UIAccessibilityPostNotification / View.announceForAccessibility — native equiv of ATH-059 aria-live), (4) Custom accessibility actions not provided (UIAccessibilityCustomAction / AccessibilityAction — no current equiv); current native-relevant count: 44/76 (57.9%), already above the 40% target
- [ ] **Related SC links** `[corpus]` `[manual]` — spot-check the `related` arrays for accuracy; some starter entries are missing secondary success criteria that are commonly cited alongside the primary SC; use debug panel for verification
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` `[manual]` — switching is already available via debug command (internal only); add public-facing toggle to Settings UI and document in feature docs / README; auth prereq — see Accounts & Cloud Sync
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` — Phase 1: `importFromUrl` in importService handles public JSON URLs; Phase 2 (auth required): signed-in users point app at their own Supabase table via `dataService.getUserFindings()`; Settings UI + fallback behavior pending; prereq: Authentication (Accounts & Cloud Sync)
- [ ] **Public corpus bootstrap** `[corpus]` `[phase3]` — seed the generic public corpus from WAI Understanding docs, axe-core rules, and Deque University entries; target 80–100 well-sourced entries at launch; same JSON schema as Phase 1; the `source` badge field enables clear attribution per entry; this corpus is never mixed with Mikey's personal corpus
- [ ] **Auth-gated personal corpus** `[corpus]` `[privacy]` `[phase3]` — serve Mikey's private corpus from a Supabase RLS-protected table; unauthenticated users get `corpus.json` only; the private corpus never ships in any public build; prereq: Authentication

### Competitive / Differentiators

- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` — add pre-populated deep links to Jira and Linear that open a new ticket with the finding description and remediation already filled in; no API key or auth required for deep links; document the URL format for each tracker
- [ ] **Compare mode** `[ux]` `[enhancement]` — allow the user to open two finding entries side by side to decide which fits better; implement as a split view in the main content area; useful when multiple success criteria could apply to the same observation

---

## User Experience Design

### UX

- [ ] **Email results** `[ux]` `[enhancement]` — part of the shared report-generation pipeline with Export findings (above); the "Email" action takes the same report output and sends it via an email provider (server-side); the UI presents "Download" and "Email" as two delivery options from the same export dialog; useful for quickly forwarding a finding write-up without leaving the app
- [x] **Frequent findings** `[ux]` `[privacy]` — track **implicit** usage (organic behavior): increment open count when a finding's panel is opened, copy count when a copy button is used; persist per-finding `{ opens, copies }` to `localStorage` as `frequentFindings`; pair with Upvote / downvote (below) as the **explicit** signal; combine both into a composite relevance score used to boost Fuse.js results; settings option to show a "Frequent" section above results (followed by "Starred" from ratings); update privacy statement to document the new storage key
- [x] **Pin results to home page** `[ux]` `[privacy]` — add a pin toggle button inside each result tile (top-right, visible on hover/focus); pinned findings appear in a "Pinned" section on the home page before any search; persist as `pinnedFindings` (array of IDs) in `localStorage`; reset all clears pins; update privacy statement; clarification: pin = task-scoped / "keep on screen right now", star = permanent saved favourite
- [ ] **How to use page & Help button** `[ux]` `[a11y]` `[claude]` — onboarding modal on first visit (check `localStorage` flag `showHowToUse`); workflow: search → select → add location prefix → refine → copy; "Show this on startup" checkbox defaults checked; add Help button (?) to the header next to Info and Settings icons; Help button opens the same content as a Drawer/BottomSheet panel (not a Modal) with room for more detail and keyboard shortcut documentation; Settings toggle to re-enable the startup modal; brief modal (under 30 seconds), expanded drawer can include shortcut ref and more detail; placeholder for additional help content
- [ ] **Pinned result handling in search** `[ux]` — when a result is pinned, it should not appear in the regular search results list; instead, show a subtle placeholder or unavailable state with a message like "Unpin to include in search results"; keeps the pinned section visually distinct and prevents duplication between pinned and search areas
- [ ] **Single source compact display** `[ux]` — when a finding has only one source, display it inline on a single line (e.g., "Source: ATH-001" or "From: WebAIM") instead of as a bullet-list block; reduces visual clutter for single-source entries
- [ ] **Multiple sources bullet list** `[ux]` — when a finding has multiple sources, display them as a bulleted list on separate lines; improves scanability and makes the attribution clear
- [x] **Singular/plural label for related findings** `[ux]` — when there is only one related or similar finding, use singular "Related issue" instead of plural "Related issues" and display it inline on one continuous line; when multiple, use plural and stack them as needed
- [ ] **Copy / add / edit / delete findings** `[ux]` `[enhancement]` — data layer wired: `src/services/userFindingsService.js` (localStorage CRUD, USR-NNN IDs), `src/hooks/useUserFindings.js`, merged into `useFindingSearch` alongside corpus; UI (forms, inline edit, copy button) pending; auth prereq for cloud persistence
- [ ] **Advanced search syntax** `[ux]` `[search]` — support boolean and exclude operators in the search field: `+term` requires the term, `-term` excludes it (e.g. `keyboard +screen reader -wcag2.2`); display a collapsible syntax hint or tooltip near the search bar; parse the query before passing to Fuse.js using a pre-filter step; operators should work alongside the current natural-language fuzzy search
- [ ] **Narrow results mode** `[ux]` — when results are showing, display a toggle to enter "narrow" mode; the search input switches label and placeholder to reflect narrowing-within-results; the clear button becomes "Clear and reset" (clears the narrow filter and returns to the initial empty state); live-search setting governs whether narrowing updates in real time or on submit; show a count of narrowed vs. total results; replaced the original corpus `component` field approach
- [x] **Upvote / downvote results** `[ux]` `[corpus]` — add thumbs up/down buttons to each result card; store ratings in `localStorage` keyed by finding ID; this is the **explicit signal** (user-expressed preference); pair with Frequent findings as the **implicit signal** (organic usage behavior); combine both scores into a composite relevance boost in Fuse.js so the list self-organizes around a user's actual workflow; if authentication is added later, sync ratings to Supabase so they persist across devices
- [ ] **Export findings** `[ux]` — multi-select findings from the result list, add occurrence counts and severity overrides, and export a formatted accessibility audit report; **integrate with Email results** (below) — both use the same report-generation pipeline, with the export action choosing between "Download" (Markdown/plain text) or "Email" (send via provider); primary deliverable format for most audit engagements

### Multilingual Edit Flow

Backend complete. UI dialogs pending. All i18n keys are in `en.json`; hooks and services are wired; personal overrides are applied in `useFindingSearch` and visible in search results.

- [ ] **Save changes button in DetailPanel** `[ux]` `[i18n]` — add a "Save changes" button that triggers the edit-flow dialog when the active locale is non-English; when locale is English, save directly as a personal override without the dialog
- [ ] **Edit target dialog** `[ux]` `[i18n]` — modal shown when user saves in a non-English locale; two choices: "Save to my personal entries" (calls `useUserOverrides.saveOverride`) or "Suggest to shared corpus" (routes to scope dialog then `useContributionQueue.submitContribution`); i18n keys: `edit.target_dialog_title`, `edit.target_dialog_body`, `edit.save_as_personal`, `edit.contribute_to_base`
- [ ] **Edit scope dialog** `[ux]` `[i18n]` — follow-on dialog after choosing a save target; three radio options: `lang_only`, `lang_and_en`, `all_langs`; for personal saves show `edit.personal_ai_warning` when scope is `lang_only`; i18n keys: `edit.scope_label`, `edit.scope_lang_only/lang_and_en/all_langs`, `edit.scope_all_langs_desc`
- [ ] **English switch transition (lang_and_en flow)** `[ux]` `[design]` — after saving the non-English version, animate the bottom sheet closed and reopen it showing the English version of the same finding; show `edit.en_switch_dialog_title/body` dialog first giving the user a chance to skip; do not change the app-wide locale — only the finding content in the panel switches to English for this edit step
- [ ] **Personal override indicator in DetailPanel** `[ux]` `[design]` — when a finding has a personal override for the active locale (`finding._hasOverride`), show a small badge or label near the title; i18n key: `edit.override_indicator`; include "last edited" timestamp from `_overrideEditedAt`
- [ ] **Contributions review panel (maintainer)** `[ux]` `[manual]` — a section in SettingsPanel (or a dedicated route) listing pending contributions with approve/reject/export controls; uses `useContributionQueue`; export button calls `exportJson()` and triggers a file download; i18n keys: `contributions.*`; the actual merge still runs via `scripts/apply-contributions.mjs`
- [ ] **Reset All includes personal overrides and contributions** `[ux]` `[privacy]` — the comprehensive Reset All modal should list and clear `userOverrides` and `pendingContributions`; call `clearAllOverrides()` from `userOverridesService` and `clearContributions()` from `contributionService`
- [x] **Reset All description copy in settings** `[ux]` `[design]` — redesigned as BottomSheet with detailed explicit lists of what gets cleared and what resets to defaults (theme, language, platform, AI settings, live search); added 18 new i18n keys; users now understand full scope before confirming
- [ ] **Ko-fi link in footer** `[ux]` `[dormant]` — add a Ko-fi link in the footer as a fallback for when the floating widget is disabled

### Visual Design

- [x] **Visible selection indicator** `[design]` `[a11y]` `[claude]` — the selected result card uses an accent border and a dot indicator; this visual-only treatment has been superseded by the result card fold behavior (shipped 2026-04-28) with a dedicated non-color selection indicator
- [x] **Severity badge placement** `[ux]` `[design]` — detail panel badges moved below h2 into `detail-badges` div; result card badges remain inline with title (different layout context, intentional)
- [x] **Tiles responsive to vertical height** `[ux]` `[design]` — result cards now account for short viewports; uses result card fold behavior for responsive display at 568px viewport height (iPhone SE landscape)
- [ ] **Button system unification** `[priority]` `[design]` `[code]` `[claude]` — consolidate `.btn-accent`, `.btn-ghost`, `.btn-secondary`, `.btn-icon`, `.btn-icon-accent`, `.field-btn` into a clean two-tier system: `.btn` base + `.btn--primary`, `.btn--secondary`, `.btn--icon`, `.btn--field` variants; migrate all uses; prerequisite for extracting as a standalone UI component library

---

## Accessibility (A11Y)

- [ ] **Per-result skip-to-next button** `[a11y]` `[ux]` `[claude]` — add "Skip to next" button inside each result card container; normally hidden/dimmed; on focus or hover, becomes visible with primary button styling; button is centered vertically and horizontally on the card, positioned above all interactive elements (z-index); clicking skips over all controls (pin, rating buttons, title) and moves focus to the next result card's "Skip to next" button or to the first result if at end of list; use `aria-label="Skip to next result"` to describe the action
- [ ] **Move sort/priority controls** `[ux]` `[a11y]` `[priority]` — relocate the sort/priority controls out of the tab order before the result list; current placement forces keyboard users to tab through all controls to reach results; consider moving them to a collapsed/expandable panel, a toolbar above the results with a single tab stop (roving tabindex), or after the results in DOM order with CSS repositioning; ties into result list keyboard navigation (priority item)
- [x] **Visible selection indicator** `[a11y]` `[design]` `[claude]` — the selected result card now includes a non-color indicator (left-edge accent bar from fold behavior) alongside the color so the selection is perceivable without relying on color alone (WCAG 1.4.1)
- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` `[dormant]` — open deployed app, confirm selector matches for tooltip icons and overlay inputs

---

## AI

### AI Assist

- [ ] **Wire Microsoft Copilot** `[ai]` — requires `VITE_AZURE_OPENAI_ENDPOINT` env var set to a full Azure OpenAI deployment URL; implemented in `aiService.js` but untested; add the env var and verify the response parses correctly
- [ ] **System prompt tuning** `[ai]` `[claude]` — test AI refinements across at least 20 different finding types covering a variety of SCs, priorities, and platforms; adjust the tone, length, and format instructions in `buildPrompt` in `aiService.js` if the output drifts from the established voice

### AI Agent Support

Agent support means upgrading the single-shot AI refinement call into a multi-step, tool-using workflow. The goals are: more accurate rewrites, corpus-aware suggestions, and eventually autonomous finding research.

- [ ] **Wire agentic AI in DetailPanel** `[agent]` `[ai]` `[ux]` — `agenticAiService.js` (tool use + `search_corpus` + system prompt + MAX_TOOL_TURNS error handling) is implemented; wire it into the Refine section of `DetailPanel` so users can toggle between single-shot (`getAiRefinement`) and agentic mode (`getAgenticRefinement`); pass `allFindings` as `corpus`; expose the mode toggle in Settings under AI Assist; document the agentic workflow in the How-To-Use page when it ships
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` — extend the Refine section of `DetailPanel` to support a short back-and-forth conversation; store turn history in local component state as an array of `{ role, content }` objects; pass the full history in each subsequent API call; add a "Clear conversation" button that resets the history without closing the panel

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

- [ ] **AI refinement locale pass** `[i18n]` `[ai]` `[claude]` `[enhancement]` — after `getAiRefinement` rewrites `desc` and `rem`, if the active locale is not English, have the AI respond in the active locale directly (update the system prompt to instruct the model to reply in `{locale}`) rather than post-translating; high API cost — enhancement only
- [ ] **Corpus pre-translation script** `[i18n]` `[corpus]` `[claude]` `[enhancement]` — write a Node.js script that calls an AI provider to translate all `corpus.json` `desc` and `rem` fields into each supported locale; output as `corpus.{lang}.json` files; update `dataService.js` to accept a `locale` param and load the appropriate file; run once, review for WCAG terminology accuracy before committing

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` — extract the 18 Easter egg locale JSON files (`pig`, `pir`, `tlh`, `val`, `blt`, `dot`, `tok`, `nav`, `qya`, `sjn`, `hod`, `dov`, `nds`, `nws`, `mnd`, `csp`, `sim`, `ali`) and the `EASTER_EGGS` / `EASTER_EGG_LOCALES` constants from `App.jsx` into a self-contained package (`src/plugins/easter-eggs/` or a standalone npm package); the bundle would export the locale map, the trigger→code map, and the heading-font CSS block so other React projects can drop in the same Easter egg language experience; prerequisite: lazy-loading strategy for locale JSON so the 18 files don't bloat the main bundle
- [ ] **Ko-fi a11y patch as standalone plugin** `[code]` `[a11y]` `[dormant]` — extract `patchKofiA11y` from `App.jsx` into `src/plugins/kofi/KofiWidget.jsx` and `src/plugins/kofi/index.js`; the plugin should be drop-in for any React project that embeds the Ko-fi overlay widget; include a self-contained CSS file (`kofi.css`) that applies accessible styling patches — focus ring on the trigger button, visible outline on the popup container, improved close-button target size — since Ko-fi's widget is visually styled outside our control and CSS patches are the safest lever we have; document selectors used and note they may need updating if Ko-fi changes its markup

---

## DevOps

### Code Quality

- [ ] **Migrate inline spacing to tokens** `[code]` `[claude]` — audit all components for raw pixel or rem values not referencing `var(--space-*)`; replace with the nearest token; last major inline-value migration after font sizes (done) and priority colors (done); overlaps with the recurring Token Audit in MAINTENANCE.md — run both together
- [ ] **UI component library extraction** `[code]` `[claude]` — this app has built a solid set of accessible, self-contained SPA primitives that could ship as a standalone React library: the hash router (`src/plugins/router/`) handles navigation, modals, drawers, bottom sheets, focus management, and page-title sync; the announcer (`src/plugins/announce/`) is a live-region wrapper; the focus and names debuggers are dev-only overlays; form controls (Toggle, chip groups, checkboxes) are already tokenized; button system unification is a prerequisite — extraction path: (1) complete button unification, (2) extract `src/plugins/` into `packages/core`, (3) extract UI components into `packages/ui`, (4) set up a pnpm or npm workspaces monorepo with the main app as `packages/app`; this is also like a combination of all the plugins in this codebase — router, announcer, focus debugger — plus a component layer on top; complexity is high, defer until the component API is stable (post button unification)
- [ ] **CSS Modules / SCSS evaluation** `[code]` `[claude]` `[manual]` — re-evaluated 2026-04-28: CSS Modules ruled out — BEM naming + CSS custom properties already give effective scoping and dead-code is auditable at this scale; SCSS nesting (via `vite-plugin-sass`) would reduce repetition in the flat `index.css` and is the most likely migration path if the file grows past ~4,000 lines; current position: defer SCSS until the button system unification and component library extraction are complete, then evaluate nesting as part of that work; do not migrate now

### Infrastructure

- [ ] **Version tagging** `[infra]` — create git tags for stable milestones once the corpus is stable enough to track; use semantic versioning (`v0.1.0` for Phase 1 launch, `v0.2.0` for Phase 2 AI, `v1.0.0` for Phase 3 public); to tag: `git tag -a v0.1.0 -m "Phase 1 launch — personal tool, N corpus entries"` then `git push origin v0.1.0`; tags are listed on the GitHub releases page and can be used as deployment targets
- [ ] **Chrome extension — validate and merge** `[infra]` — scaffold complete on `feature/chrome-extension`; load unpacked from `dist-extension/` in Chrome, smoke-test search / copy / settings / AI refine, check layout at ~400px side panel width; add PNG icons (16 / 48 / 128px); merge when layout confirmed
- [ ] **Firefox extension — validate and merge** `[infra]` — scaffold complete on `feature/firefox-extension`; load via `about:debugging` → Load Temporary Add-on, smoke-test same flow; add PNG icons; confirm sidebar behaves correctly; merge when confirmed
- [ ] **Electron desktop app — icons, test, merge** `[infra]` — functionally complete on `feature/electron-app`; remaining: add app icons (`build/icon.icns/.ico/.png`), test end-to-end on macOS and Windows (safeStorage key persistence across restarts, AI refine), code-sign macOS build before distribution; merge when icons are ready
- [ ] **Umami analytics** `[infra]` `[dormant]` `[manual]` `[launch-blocker]` — requires signing up at umami.is; create an account, add the site, replace `YOUR_WEBSITE_ID` in `index.html`, and uncomment the script tag; verify that Umami reports zero cookies and no personal data in the dashboard before enabling on any deployment
- [ ] **Phase 3 hosting strategy** `[infra]` `[dormant]` `[phase3]` — deployment strategy for a public Phase 3 launch is undecided; options include a separate Netlify/Vercel site from a separate repo (personal corpus never in that repo), a subdomain of an existing site, or self-hosted; defer until Phase 3 scope is clearer

### Privacy & Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` `[dormant]` `[phase3]` `[launch-blocker]` — draft written at `docs/GDPR-DRAFT.md` (gitignored); covers localStorage keys, AI API calls, no-cookies, no-tracking, contribution flow, offline use; review and publish as a linked page before any public Phase 3 launch

---

## Accounts & Cloud Sync

### Authentication

- [ ] **Sign-in UI** `[ux]` `[phase3]` — add a minimal sign-in section at the bottom of SettingsPanel (below AI Assist); show avatar and display name when signed in, "Sign in with Google / GitHub" buttons when not; sign-out option inline; no dedicated auth page needed
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` `[launch-blocker]` — stubs live in `src/services/authService.js` and `src/services/supabaseClient.js`; activate by installing `@supabase/supabase-js`, setting `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, and uncommenting the implementation blocks; Supabase project setup instructions and DB schema (SQL) are in `supabaseClient.js`; required before GDPR disclosure can be published (login = personal data)
- [ ] **Phase 2 stubs review** `[infra]` `[claude]` `[manual]` — before activating Supabase, re-read `src/services/authService.js` and `src/services/supabaseClient.js` comments against the current Supabase JS v2 SDK docs; confirm OAuth provider slugs (`'google'`, `'github'`), table names, and RLS policy examples are still accurate; the stubs were written against an earlier SDK version

### Cloud Data Sync

- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` — `syncSettings()` and `getRemoteSettings()` stubs in `dataService.js`; on sign-in, load remote settings and merge with localStorage; on any setting change, push to Supabase; API keys intentionally excluded from sync (localStorage only)
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` `[phase3]` — Phase 1 localStorage layer is wired (`userFindingsService.js`, `useUserFindings.js`); Phase 2: activate `getUserFindings()`, `saveUserFinding()`, `deleteUserFinding()` stubs in `dataService.js` via Supabase; DB schema in `supabaseClient.js`
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` — when a user is signed in, sync upvote/downvote ratings to a `ratings` table (`user_id`, `finding_id`, `vote`); merge with any existing `localStorage` ratings on sign-in; `dataService.js` already abstracts the data layer, so this is a localized change
- [ ] **GitHub Sponsors** `[infra]` `[phase3]` — set up GitHub Sponsors as a secondary tip option alongside the Ko-fi widget for Phase 3

---

## Monetization

- [ ] **Ad tiles in result list** `[ux]` `[design]` `[phase3]` `[manual]` — create a sponsored result tile that matches the exact dimensions and layout of a corpus result card so ads sit naturally in the list; define placement frequency (e.g. every 8 results, or always first in list); label clearly as "Sponsored" per advertising standards and accessibility guidelines (`aria-label` on the tile); consider what ad content is relevant (accessibility tools, audit services, training); requires ad delivery infrastructure — see ad services item below
- [ ] **Free vs. premium feature tiers** `[phase3]` `[manual]` — define what is free and what requires a paid plan; areas to think through: AI Assist (tokens per month, model tier), corpus size limits for custom findings, cloud sync, export formats (e.g. CSV/Markdown free, DOCX premium), team/multi-user access, priority corpus updates; also think through usage limits and how to enforce them (rate limiting, localStorage vs. server-side counters, grace periods)
- [ ] **Ad services, pricing, and what's included** `[phase3]` `[manual]` — research ad insertion options (Carbon Ads, EthicalAds, self-served direct buys); for each: starting CPM/CPC price points, minimum traffic requirements, what reporting is bundled, targeting options, payment terms; also think through: how many ad slots per page, what a "starter package" for direct buyers would include, whether to offer sponsorships (fixed monthly fee) vs. impression-based; decide on a network vs. direct-sell model before Phase 3 launch
