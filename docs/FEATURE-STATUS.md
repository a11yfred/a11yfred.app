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
| Detail Panel | ✅ | 85 | 1 |
| Ratings (Upvote / Star / Archive) | ✅ | 100 | 1 |
| Pinned Findings | ✅ | 100 | 1 |
| Settings Panel | ✅ | 95 | 1 |
| Session Persistence | ✅ | 100 | 1 |
| Debug Tools | ✅ | 100 | 1 |
| Internationalization | 🟡 | 80 | 1 |
| Corpus / Finding Data | 🟡 | 65 | 1 |
| Animations & Transitions | ✅ | 100 | 1 |
| Responsive Design | ✅ | 100 | 1 |
| AI Assist (single-shot) | 🟡 | 85 | 2 |
| AI Agent (agentic mode) | 🔧 | 40 | 2 |
| User Findings (custom) | 🔧 | 30 | 2 |
| Multilingual Edit Flow | 🔧 | 40 | 2 |
| Export Findings | 🔧 | 10 | 2 |
| Frequent Findings (implicit signal) | ✅ | 100 | 2 |
| Advanced Search Syntax | 🔲 | 0 | 2 |
| How To Use | 🔲 | 0 | 2 |
| Ko-fi Integration | 🟡 | 70 | 2 |
| Import / Custom Data Source | 🔧 | 20 | 2 |
| Authentication | 💤 | 10 | 3 |
| Cloud Sync | 💤 | 5 | 3 |
| PWA / Offline | ✅ | 100 | 3 |
| Analytics (Umami) | 💤 | 5 | 3 |
| Ad Tiles | 🔲 | 0 | 3 |
| Party Mode | ✅ | 100 | 1 |

---

## Phase 1 — Shipped

### Core Search — 95%

Done:

- Fuse.js fuzzy search with platform filter, WCAG version+level filter, live search toggle
- Result sorting (score DESC → starred first → archived last)
- `performance.now()` profiling (logs warnings >20 ms in dev)

Missing:

- Advanced query syntax (boolean `+term/-term` operators; see TODO)

---

### Result List — 95%

Done:

- Cards with priority/source/WCAG badges (full text on desktop, short on mobile)
- Upvote / downvote / star / archive buttons per card
- Score display, archived visual state
- Card fold on select — non-selected cards collapse to title-only (CSS `:has()`)
- Skip link (WCAG 2.4.1) — slides in on focus
- No-results empty state with SVG illustration
- Badge click filter — click any priority/source/WCAG badge to filter by it
- Shareable search URLs — `?q=` param synced via `history.replaceState`
- Copy link button in results header copies `?q=` URL to clipboard

Missing:

- Arrow-key / J-K keyboard navigation between cards
- Per-result "skip to next result" link
- Composite relevance boost: ratings + frequency not yet fed back into Fuse.js sort

---

### Detail Panel — 75%

Done:

- Full finding display: title, priority badge, WCAG SC links, source, related findings
- Copy / Reset desc + rem (individual and "Copy all / Reset all")
- Related findings navigation with back button history
- Reset confirmation modal when >70% of text changed
- Edit distance guard; `aria-busy` + spinner on AI refine
- `exportFinding.js` utility (text / markdown / csv) — data layer only

Missing:

- Export UI — multi-select, format picker, Download/Email delivery options
- Save changes button (triggers multilingual edit flow)
- Personal override indicator badge (`_hasOverride` flag exists, badge missing)

---

### Ratings (Upvote / Star / Archive) — 85%

Done:

- `useFindingRatings.js` — localStorage-backed per-finding `{ score, starred, archived }`
- Upvote / downvote / star / archive in result list UI
- Archive moves item to bottom of sorted list instantly
- Star disables when archived; focus moves to adjacent card on archive

Missing:

- Composite relevance score — ratings not yet boosting Fuse.js results
- Cloud sync (Phase 3, prereq: auth)

---

### Settings Panel — 95%

Done:

- Theme: Light / Auto / Dark / Party
- Language: 50+ locales
- Platform filter: Web / Native App / Both
- Live search toggle
- WCAG version (2.0 / 2.1 / 2.2) + level (A / AA) radio filters
- AI Assist: toggle, provider, API key validation, model selector
- Reset All as BottomSheet with explicit lists (what gets deleted, what resets to defaults with values shown)
- Privacy & Storage disclosure sheet

Missing:

- Reset All does not yet clear `userOverrides` or `pendingContributions` (edit flow not wired; Phase 2 feature)

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

### Corpus / Finding Data — 65%

Done:

- 76 entries with full schema (title, desc, rem, priority, platform, WCAG SC, keywords, related)
- Platform classification: web 32, both 42, native 2; 44/76 (58%) native-relevant
- Source and WCAG version/level metadata per entry
- Public corpus (`corpus.json`) separate from private (`personal-corpus.json`, gitignored)

Missing:

- Editorial pass on ATH-004 – ATH-070 (16 entries added 2026-04-26, not yet reviewed)
- Keyword audit (imported entries need synonym expansion)
- Native-specific gaps: only 2 native-only entries; 4 gap areas identified (Dynamic Type, contentDescription, announce notifications, custom accessibility actions)
- 200-entry target not reached (currently 76)

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

### AI Agent (Agentic Mode) — 40%

Files: `src/services/agenticAiService.js`, `src/services/searchCorpusTool.js`

Done:

- `agenticAiService.js` — multi-turn tool-use loop (Anthropic only)
- `searchCorpusTool.js` — `SEARCH_CORPUS_TOOL_SCHEMA` + Fuse.js `searchCorpus()` handler
- System prompt: always call `search_corpus` first, preserve auditor voice, exact output format
- `MAX_TOOL_TURNS = 5` guard; dev logging for each turn

Missing:

- Not wired into `DetailPanel` — no UI toggle to switch single-shot → agentic
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
- Supabase-backed personal corpus (Phase 3, prereq: auth)

---

### Ko-fi Integration — 70%

Files: `src/components/KofiWidget.jsx`

Done:

- Widget code extracted to KofiWidget.jsx
- A11y patches (aria-label on trigger, role/aria-modal on popup, Escape handler, label injection, contrast override)
- `LETTER_TO_KOFI.md` documenting all 6 patched issues

Missing:

- Widget currently disabled — third-party script caused console reload loop; needs selector re-verification against live DOM
- Ko-fi link fallback in footer (for when widget is off)

---

## Phase 2 — Not Started

### Frequent Findings (Implicit Signal) — 0%

Track organic behavior (opens + copies) to pair with upvote/downvote explicit signal for a composite relevance boost.

Needs: open-count increment on panel open, copy-count increment on copy, `frequentFindings` in localStorage, composite score wired to Fuse.js sort, privacy statement update.

---

### Advanced Search Syntax — 0%

Support `+term` (require) and `-term` (exclude) operators, e.g. `keyboard -wcag2.2`.

Needs: query parser pre-step before Fuse.js, syntax hint near search bar, i18n keys.

---

### How To Use — 0%

Onboarding modal on first visit + Help button in header.

Needs: `showHowToUse` localStorage flag, modal component with 4-step workflow, "Show on startup" checkbox, Help button wired to panel, agentic AI workflow documentation once that ships.

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

### PWA / Offline — 0%

Needs: `vite-plugin-pwa` or hand-rolled Service Worker caching app shell + corpus JSON, Web App Manifest for install prompt, mobile Chrome testing.

Note: Electron build (in `electron/`) gives offline as a side effect of bundling — no SW needed for that path.

---

### Analytics (Umami) — 5%

Done:

- Script placeholder commented in `index.html`

Missing:

- Umami account + website ID
- Verify zero-cookie, zero-personal-data before enabling (`[launch-blocker]`)

---

### Ad Tiles — 0%

Needs: sponsored result tile component matching corpus card dimensions, `[Sponsored]` aria-label, frequency placement (every 8 results), `debug ads on|off` toggle, ad delivery infrastructure, documentation in DebugHelp.

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
