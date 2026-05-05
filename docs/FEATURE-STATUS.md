# Feature Status

Living tracker of every feature in A11yTextHelper — what's shipped, what's half-done, and what hasn't started.

Status key: ✅ Complete · 🟡 Partial · 🔧 Backend only · 💤 Stubbed · 🔲 Not started

---

## Summary

| Feature | Status | % | Phase |
| --- | --- | --- | --- |
| Chrome Extension | 🟡 | 60 | — |
| Firefox Extension | 🟡 | 60 | — |
| Electron Desktop | 🟡 | 80 | — |
| Core Search | ✅ | 95 | 1 |
| Result List | ✅ | 100 | 1 |
| Detail Panel | ✅ | 95 | 1 |
| Ratings (Upvote / Star / Archive) | ✅ | 100 | 1 |
| Pinned Findings | ✅ | 100 | 1 |
| Settings Panel | ✅ | 90 | 1 |
| Session Persistence | ✅ | 100 | 1 |
| Debug Tools | ✅ | 100 | 1 |
| Internationalization | 🟡 | 80 | 1 |
| Corpus / Finding Data | ✅ | 100 | 1 |
| Corpus Quality Standards | ✅ | 100 | 1 |
| Platform Variant Display | ✅ | 100 | 1 |
| Animations & Transitions | ✅ | 100 | 1 |
| Responsive Design | ✅ | 100 | 1 |
| Party Mode | ✅ | 100 | 1 |
| AI Assist (single-shot) | 🟡 | 85 | 2 |
| AI Agent (agentic mode) | 🔧 | 40 | 2 |
| User Findings (custom) | 🔧 | 30 | 2 |
| Multilingual Edit Flow | 🔧 | 40 | 2 |
| Export Findings | 🔧 | 10 | 2 |
| Frequent Findings (implicit signal) | ✅ | 100 | 2 |
| Narrow Results Mode | ✅ | 100 | 2 |
| Advanced Search Syntax | 🔲 | 0 | 2 |
| How To Use / Onboarding | ✅ | 100 | 2 |
| Ko-fi Integration | 🟡 | 50 | 2 |
| Import / Custom Data Source | 🔧 | 20 | 2 |
| Authentication | 💤 | 10 | 3 |
| Cloud Sync | 💤 | 5 | 3 |
| PWA / Offline | ✅ | 100 | 2 |
| Analytics (Umami) | 💤 | 20 | 3 |
| Ad Tiles | ✅ | 100% (infra) | 3 |

---

## Summary by Phase

### Phase 1 — Nearly Complete (May 5, 2026)

- 19 features shipped and stable; SEO enabled; UI component library extraction started
- ✅ Core search, result list, detail panel, ratings, pinned findings
- ✅ Full corpus (89 entries), all linters passing, responsive design
- ✅ Session persistence, debug tools, animations, Party Mode
- ✅ SEO infrastructure (robots.txt, sitemap.xml, meta tags, structured data)
- ✅ UI primitives (Toggle, RadioChip, Select) extracted to `src/components/ui/`
- 🟡 Internationalization (80% — 50+ locales, ~60 keys pending translation)
- 🟡 UI component library (30% — 3/9 components extracted; 6 additional patterns identified)
- Remaining Phase 1: Ko-fi donations, GitHub badges, production domain

### Phase 2 — In Progress

- 10 features in development, 4 features complete
- ✅ Complete: Frequent findings, narrow results mode, how-to-use/onboarding, PWA/offline
- 🟡 Partial: AI Assist (85%), Ko-fi integration (50%)
- 🔧 Backend only: AI Agent (40%), user findings (30%), multilingual edit (40%), import (20%)
- 🔲 Not started: Advanced search syntax (0%)

### Phase 3 — Planned

- 5 features stubbed or not started
- 💤 Stubbed: Authentication (10%), Cloud Sync (5%), Analytics (20%)
- ✅ Ad tiles infrastructure complete (live delivery Phase 3+)
- 🟡 Extensions: Chrome (60%), Firefox (60%), Electron (80%)

---

## Phase 1 — Complete

Status as of May 5, 2026: All Phase 1 features shipped and stable. 89-entry public corpus fully sourced and WCAG-mapped. All linters passing (ESLint, Stylelint, Markdownlint). Test coverage complete. Ready for Phase 2 backend completion and Phase 3 public launch.

---

## Phase 1 Feature Details — Shipped

### Core Search — 95%

Done:

- Fuse.js fuzzy search with platform filter, WCAG version+level filter, live search toggle
- Result sorting (score DESC → starred first → archived last)
- `performance.now()` profiling (logs warnings >20 ms in dev)

Missing:

- Advanced query syntax (boolean `+term/-term` operators; see TODO)

---

### Result List — 100%

Done:

- Cards with priority/source/WCAG badges (full text on desktop, short on mobile)
- Platform badge display showing Web/iOS/Android/Both
- Upvote / downvote / star / archive buttons per card
- Score display, archived visual state
- Card fold on select — non-selected cards collapse to title-only (CSS `:has()`)
- Skip link (WCAG 2.4.1) — slides in on focus
- No-results empty state with SVG illustration
- Badge click filter — click any priority/source/WCAG badge to filter by it
- Shareable search URLs — `?q=` param synced via `history.replaceState`
- Copy link button in results header copies `?q=` URL to clipboard
- Pinned findings section above main results with clear pins option
- Narrow results mode with count display (`X of Y`)
- Skip-to-next button on each result card (priority sort mode only)
- Sponsored tile preview with admin toggle (dev only)

---

### Detail Panel — 95%

Done:

- Full finding display: title, priority badge, WCAG SC links, source, related findings
- Copy / Reset desc + rem (individual and "Copy all / Reset all")
- Related findings navigation with back button history
- Reset confirmation modal when >70% of text changed
- Edit distance guard; `aria-busy` + spinner on AI refine
- `exportFinding.js` utility (text / markdown / csv) — data layer only
- **Copy button next to title** — copy just the finding name
- **Copy buttons for SCs** — copy primary success criterion and related criteria separately
- Location prefix field with **dynamic "(optional)" label** — disappears when field has value
- **Clear button for location prefix** — × positioned inside field (matches search clear button UX)
- Reset button renamed to **"Reset content"**
- All copy buttons show Check icon for 2 seconds on success, with accessibility announcements
- Platform badge display with clickable filter integration
- Severity badge positioning below h2 for visual clarity
- Related findings displayed with singular/plural labels
- Sources displayed inline (single) or as bullet list (multiple)

Missing:

- Export UI — multi-select from result list, format picker, Download/Email delivery options
- Save changes button (triggers multilingual edit flow; Phase 2)
- Personal override indicator badge (`_hasOverride` flag exists, badge missing; Phase 2)
- Edit scope and target dialogs (Phase 2)
- Location prefix value persistence between findings

---

### Ratings (Upvote / Star / Archive) — 100%

Done:

- `useFindingRatings.js` — localStorage-backed per-finding `{ score, starred, archived }`
- Upvote / downvote / star / archive in result list UI
- Archive moves item to bottom of sorted list instantly
- Star disables when archived; focus moves to adjacent card on archive
- Ratings influence sort order (starred > archived suppressed)
- Open/copy counts tracked implicitly in `recentFindings` and finding frequency signals
- Ratings persisted in `defect_ratings` localStorage key

Missing:

- Cloud sync for ratings (Phase 3, prereq: auth)

---

### Settings Panel — 90%

Done:

- Theme: Light / Auto / Dark / Party
- Language: 50+ locales
- Platform filter: Web / Native App / Both
- Live search toggle
- WCAG version (2.0 / 2.1 / 2.2) + level (A / AA) radio filters
- AI Assist: toggle, provider, API key validation, model selector
- Reset All as BottomSheet with explicit lists (what gets deleted, what resets to defaults with values shown)
- Privacy & Storage disclosure sheet
- Upvote/downvote ratings restore on reload
- Pinned findings display with clear option

Missing:

- Reset All does not yet clear `userOverrides` or `pendingContributions` (multilingual edit flow not yet wired; Phase 2 feature)
- Sign-in UI section (Phase 3 feature, blocked on Supabase activation)

---

### Session Persistence — 100%

Done:

- `lastSelectedId` in sessionStorage; restored on mount when URL is bare `#/`
- `recentFindings` array (max 10, newest-first) in localStorage

---

### Debug Tools — 100%

Done:

- `FocusDebugger` — visible focus ring overlay
- `NamesDebugger` — cursor tooltip showing accessible name + source
- `AiDebugToast` — AI on/off indicator
- `DeployBanner` — deployment status badge
- `DebugHelp` — full command reference panel
- `DebugLauncher` — FAB + spotlight command input
- Unified command dispatcher: `debug all/names/deploy/ai assist/skeleton on|off`, party/language off commands

---

### Pinned Findings — 100%

Done:

- Pin button on every result tile (absolutely positioned inside card)
- `usePinnedFindings.js` — localStorage-backed `Set` of pinned IDs
- Pinned section above main results, visible across home / search / badge filter / view-all
- Persists until unpinned or Reset All; Clear Pins button in Settings (shown only when pins exist)
- Pin hint shown in search bar hint text when pins are active
- Accessible announce strings for pin / unpin; RTL-safe layout

---

### Party Mode — 100%

Done:

- Random complementary palette; Comic Sans font; magic wand cursor
- Confetti canvas (110 particles, 5 s)
- Web Audio music player (Blur "Song 2" approximation)
- Sound effects (honk / meow / fart / horn / whistle / snare)
- Sparkle burst on click
- `prefers-reduced-motion` respected everywhere

---

## Phase 2 — In Progress

### Internationalization — 80%

Done:

- 50+ locale files (Latin, CJK, RTL, indigenous, constructed, Easter egg)
- All UI strings in `en.json` (source of truth); placeholders propagate automatically
- Priority labels translated; RTL layout (Arabic, Uyghur)
- `translate` script detects and fills missing keys with `[TODO: translate]` prefix
- i18n-edits.md tracks pending translation runs

Missing:

- ~60 keys across non-English files still have `[TODO: translate]` placeholder; translate run needed
- Corpus pre-translation (`corpus.{lang}.json` files; no API key available)
- AI refinement in active locale (instructs model to reply in `{locale}`) — high cost, enhancement only

---

### Corpus / Finding Data — 100%

Done:

- 89 public corpus entries with full schema (title, desc, rem, priority, platform, WCAG SC, keywords, related)
- Platform classification: 47 web-only, 68 web & mobile (both), 3 iOS, 3 Android, 3 other platform variants
- All entries 100% sourced with minimum 2 expert sources each
- Sources deep-linked where available (e.g., Roselli's "Where to Put Focus When Opening a Modal Dialog")
- 10-expert consensus: Adrian Roselli, Scott O'Hara, Eric Bailey, Marco Zehe, Scott Vinkle, Kat Holmes, Eric Eggert, Karl Groves, Steve Faulkner, Patrick H. Lauke
- All titles standardized to consistent pattern
- Corpus fully validated: zero broken links, zero root domain links, proper WCAG prefix formatting, clean source credits structure

Missing (future enhancements):

- Keyword audit (entries could use synonym expansion; optional optimization)
- Native-specific gaps: 4 area gaps identified (Dynamic Type, contentDescription, announce notifications, custom accessibility actions; addressed via platform classification)

---

### AI Assist (Single-Shot) — 85%

Files: `src/services/aiService.js`

Done:

- Anthropic / OpenAI / Google / Microsoft (Azure) provider configs
- Per-provider model selector in Settings (persisted to localStorage)
- Refine note → rewrites desc + rem in established auditor voice
- `AiApiError` typed errors (invalid_key, rate_limit, service_error, network_error, api_error)
- localhost API key bypass for development

Missing:

- Microsoft/Azure endpoint untested (requires `VITE_AZURE_OPENAI_ENDPOINT`)
- System prompt tuning (needs 20+ finding test pass)

---

### AI Agent (Agentic Mode) — 65%

Files: `src/services/agenticAiService.js`, `src/services/searchCorpusTool.js`, `src/components/DetailPanel.jsx`, `src/components/SettingsPanel.jsx`

Done:

- `agenticAiService.js` — multi-turn tool-use loop (Anthropic only)
- `searchCorpusTool.js` — `SEARCH_CORPUS_TOOL_SCHEMA` + Fuse.js `searchCorpus()` handler
- System prompt: always call `search_corpus` first, preserve auditor voice, exact output format
- `MAX_TOOL_TURNS = 5` guard; dev logging for each turn
- `DetailPanel.jsx` — Agentic mode toggle wired in Refine section; visible only when Claude is active; dispatches to `getAgenticRefinement` when enabled
- `SettingsPanel.jsx` — Agentic mode configuration exposed; toggle disabled for non-Claude providers; state persisted to localStorage
- `App.jsx` — Passes agentic mode state from localStorage to DetailPanel
- 5 i18n keys added for UI strings (settings label/description, detail label/help/hint)

Missing:

- Multi-turn conversation UI (turn history, Clear conversation button)
- `corpus` (allFindings array) not yet passed through from App to DetailPanel to the service

---

### User Findings (Custom Findings) — 30%

Files: `src/services/userFindingsService.js`, `src/hooks/useUserFindings.js`

Done:

- `userFindingsService.js` — localStorage CRUD with `USR-NNN` IDs
- `useUserFindings.js` — reactive hook (`addFinding`, `editFinding`, `deleteFinding`, `copyFinding`)
- `useFindingSearch` merges user findings with corpus transparently

Missing:

- Add / edit / delete UI — no form, no inline edit
- Copy finding button in DetailPanel
- Personal vs. public corpus toggle (visible in UI; currently debug-only)

---

### Multilingual Edit Flow — 40%

Files: `src/services/userOverridesService.js`, `src/services/contributionService.js`, `src/hooks/useUserOverrides.js`, `src/hooks/useContributionQueue.js`, `scripts/apply-contributions.mjs`

Done:

- `userOverridesService.js` — localStorage CRUD for locale overrides per finding
- `contributionService.js` — contribution queue with status lifecycle constants
- `useUserOverrides` + `useContributionQueue` hooks wired in App.jsx
- `useFindingSearch` applies overrides; sets `_hasOverride`, `_overrideLocale`, `_overrideEditedAt`
- `apply-contributions.mjs` — maintainer approval script patches corpus.json and translation files per scope
- 46 i18n keys in `en.json` for all dialogs (pending translation in locale files)

Missing:

- Save changes button in DetailPanel
- Edit target dialog (Personal vs. Contribute)
- Edit scope dialog (lang_only / lang_and_en / all_langs)
- English switch transition animation
- Personal override indicator badge in DetailPanel
- Contributions review panel in SettingsPanel (maintainer)
- Reset All does not yet call `clearAllOverrides()` or `clearContributions()`

---

### Export Findings — 10%

Files: `src/utils/exportFinding.js`

Done:

- `exportFinding(finding, format)` — Blob download in text / markdown / csv formats

Missing:

- Multi-select UI in result list
- Format picker (Download vs. Email)
- Email delivery (server-side, Phase 2+)
- Occurrence counts and severity overrides in the export

---

### Import / Custom Data Source — 20%

Files: `src/services/importService.js`

Done:

- `importFromUrl(url)` — fetches and validates a public JSON corpus URL

Missing:

- Settings UI (URL input, load button, error handling)
- Supabase-backed custom findings sync (Phase 3, prereq: auth)

---

### Ko-fi Integration — 50%

Files: `src/components/KofiWidget.jsx`

Done:

- Widget code extracted to `KofiWidget.jsx`
- A11y patches (aria-label on trigger, role/aria-modal on popup, Escape handler, label injection, contrast override)
- `LETTER_TO_KOFI.md` documenting all 6 patched issues
- Selectors extracted to standalone plugin structure for reusability

Missing:

- Widget currently disabled pending console error resolution
- Selector re-verification against live Ko-fi DOM (selectors may drift with Ko-fi updates)
- Ko-fi link fallback in footer (nice-to-have when widget is off)

---

## Phase 2 — Complete / Partial

### Platform Variant Display — 100%

Files: `src/components/ResultList.jsx`, `src/components/DetailPanel.jsx`, `src/index.css`, `src/i18n/*.json`

Done:

- Platform badge displays on every result card showing platform type (Web, iOS, Android, Web & Mobile)
- Badge placed inline with priority and source badges in result-item__badges section
- Clickable platform badge in detail panel with filter handler
- Platform filter integrates with existing badge-click filter logic
- Platform badge styling with neutral blue colors (`--platform-bg`, `--platform-text`)
- i18n support across 8 major language files (en, de, es, fr, ja, pt, zh, nl, sv)
- Platform badge included in archived state and unified badge styling

Missing:

- None — feature complete and tested

---

## Phase 2 — Partial/Complete

### Narrow Results Mode — 100%

Files: `src/App.jsx`, `src/components/SearchBar.jsx`, `src/components/ResultList.jsx`

Done:

- "Narrow" button appears next to results count when search results are showing
- Search input label, placeholder, and clear button change context-sensitively
- Results filtered via secondary Fuse.js search on title, desc, keywords, sources
- Count display shows "{narrowed} of {total} Results" in narrow mode
- Clear button becomes "Clear and reset" — clears narrow filter and returns to base search
- Live-search setting governs filter updates (real-time vs. on-submit)
- Responsive: works on mobile and desktop, narrow mode accessible via keyboard
- **UI refinements (2026-04-30 evening)**:
  - **Filter icon** next to narrow button for visual clarity
  - **Button repositioned below search input**, left-aligned (distinct from search submit controls)
  - **Focus restoration** — clicking Narrow button returns focus to search input automatically
  - **Label changed** from "Narrow results" to "Narrowing results" when in narrow mode
  - **Removed badge pill** — cleaner visual; state is now communicated through label and button placement
  - **Exit button redesigned** from text to **X icon** (matches reset icon style for consistency)
- All i18n keys added and updated in `en.json`; placeholders propagate automatically

---

## Phase 2 — Not Started

### Frequent Findings (Implicit Signal) — 100%

Done:

- Open/copy counts tracked implicitly via `recentFindings` array in localStorage
- Frequent findings boost composite relevance score (wired through sort logic)
- Privacy disclosure updated to include frequency tracking
- Data persisted in `recentFindings` and finding access patterns

---

### Advanced Search Syntax — 0%

Support `+term` (require) and `-term` (exclude) operators, e.g. `keyboard -wcag2.2`.

Needs: query parser pre-step before Fuse.js, syntax hint near search bar, i18n keys.

---

### How To Use / Onboarding — 100%

Done:

- Onboarding panel (`OnboardingPanel.jsx`) — 3-slide paginated workflow (Find, Refine, Copy)
- Auto-launches on first visit via `onboardingSeen` localStorage flag
- Drawer on mobile, inline on desktop
- Step headings receive focus on navigation via `usePaginationFocus`
- Escape before last slide shows confirm modal (prevents accidental close)
- Re-launchable from Help panel via "Take a tour" button
- Help panel (`HelpPanel.jsx`) — keyboard shortcuts, search tips, locale instructions
- Help panel includes corpus sourcing details and finding schema documentation

---

## Phase 3 — Stubbed / Not Started

### Authentication — 10%

Files: `src/services/authService.js`, `src/services/supabaseClient.js`

Done:

- Full stubs with activation comments, OAuth provider slugs, DB schema SQL, `.env` instructions

Missing:

- `@supabase/supabase-js` install + `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars
- Sign-in UI in SettingsPanel (Google / GitHub buttons, avatar, sign-out)
- Supabase stubs need accuracy review against current JS v2 SDK docs before activation

---

### Cloud Sync — 5%

Files: `src/services/dataService.js` (stubs only)

Done:

- `getUserFindings`, `saveUserFinding`, `deleteUserFinding`, `syncSettings`, `getRemoteSettings` stubs

Missing:

- Activation (prereq: auth)
- Ratings sync to `ratings` table
- Settings sync on sign-in + on every change

---

### PWA / Offline — 100%

Done:

- Service Worker caches app shell + corpus JSON for offline access
- Web App Manifest configured for install prompt
- Offline-first architecture enabled
- Installable to home screen on mobile and desktop

Note: Electron build (in `electron/`) also gives offline as a side effect of bundling — no additional SW setup needed for that path.

---

### Analytics (Umami) — 20%

Done:

- Script placeholder in `index.html` (currently disabled)
- Integration point established with `YOUR_WEBSITE_ID` placeholder

Missing (Phase 3):

- Umami account + website ID setup
- Verify zero-cookie, zero-personal-data in dashboard before enabling
- Uncomment and activate only when verified (`[launch-blocker]` for Phase 3 public launch)

---

### Ad Tiles — 100% (Infrastructure) / 0% (Live Delivery)

Done:

- `SponsoredTile.jsx` — placeholder tile matching corpus card dimensions
- Sponsored badge with `aria-label="Sponsored content"`
- `AdminPanel.jsx` — ON/OFF toggle + configurable "Every N results" frequency input
- `ResultList.jsx` — injects tiles after every nth result via Fragment wrapper
- Admin state wired through App props (`showAds` / `adFrequency`)

Missing (Phase 3 only):

- Real ad delivery source integration (Carbon Ads, EthicalAds, direct-sold)
- Replace placeholder copy with actual ad copy
- Finalize placement rules and frequency defaults
- Phase 3 blocker: ship v1.0/v1.1 without ads; infrastructure work deferred to v2.0+

---

## Distribution Targets

### Chrome Extension — 60%

Branch: `feature/chrome-extension`

Done:

- Manifest V3 with `side_panel` and `sidePanel` permission
- Minimal service worker wires action icon to open the side panel
- Vite extension build config (`base: './'`, relative asset paths, `dist-extension/` output)
- `build:extension` npm script
- Hash-based router and `localStorage` work unchanged in side panel context
- Build verified clean

Missing:

- PNG icons at 16 / 48 / 128px (Chrome shows generic icon without them)
- Smoke test: load unpacked, verify search / copy / settings / AI in Chrome
- Side panel layout check at ~400px width
- Merge to `main`

---

### Firefox Extension — 60%

Branch: `feature/firefox-extension`

Done:

- Manifest V3 with `sidebar_action` and `browser_specific_settings.gecko` ID
- No background script needed — Firefox opens sidebar automatically
- Vite Firefox build config (`dist-extension-firefox/` output)
- `build:extension:firefox` npm script
- Build verified clean

Missing:

- PNG icons at 16 / 48 / 96px
- Smoke test via `about:debugging` → Load Temporary Add-on
- AMO account + extension ID registration
- Merge to `main`

---

### Electron Desktop — 80%

Branch: `feature/electron-app`

Done:

- `electron`, `electron-builder`, `concurrently` installed as devDependencies
- `electron/main.js` — `keys:set` / `keys:get` / `keys:delete` IPC handlers complete with `safeStorage` encryption and `fs` persistence to `app.getPath('userData')`
- `electron/preload.js` — context bridge fully wired (`window.electronAPI.keys`, `theme`, `version`)
- `src/services/aiService.js` and `agenticAiService.js` — API key reads guarded with `window.electronAPI` check
- `src/components/SettingsPanel.jsx` — key init and save routed through `electronAPI.keys` in Electron context
- Dev and production build scripts in place

Missing:

- App icons (`build/icon.icns`, `build/icon.ico`, `build/icon.png`) — required by `electron-builder`
- End-to-end test on macOS and Windows
- macOS code signing (required for distribution outside the App Store)
- Merge to `main`

---

## What "Phase 3 Launch" Requires

Items tagged `[launch-blocker]` in TODO.md:

1. **Umami analytics** — account + ID + zero-cookie verification
2. **GDPR disclosure** — `docs/GDPR-DRAFT.md` exists; needs legal review + publish
3. **Google / GitHub OAuth** — Supabase stubs must be activated + tested
