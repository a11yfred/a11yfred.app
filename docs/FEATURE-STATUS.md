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
| UI Component Library (consolidated) | ✅ | 100 | 1 |
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

### Phase 1 — Complete (May 6, 2026)

- 20 features shipped and stable; SEO enabled; UI component library consolidated and portable
- ✅ Core search, result list, detail panel, ratings, pinned findings
- ✅ Full corpus (133 entries), all linters passing, responsive design
- ✅ Session persistence, debug tools, animations, Party Mode
- ✅ SEO infrastructure (robots.txt, sitemap.xml, meta tags, structured data)
- ✅ UI component library (100% — 2 base button components + 12 core primitives: Toggle, RadioChip, Select, InputWithClear, Badge, Field, PanelShell, BackButton, Modal, Announcer, Drawer, BottomSheet; deprecated StateButton and IconStateButton removed). Cleaned for portability and ready for npm publishing via feature/ui-library branch
- ✅ CSS tokenization — all outline offsets, widths, spacing, and motion values use design tokens
- ✅ Button consolidation — 70+ usages collapsed from 5 component types (Button, StateButton, IconButton, IconStateButton, BackButton) into 2 base types (Button, IconButton) with variant/active patterns
- ✅ Zero dead code — all unused code removed, all imports verified
- 🟡 Internationalization (80% — 50+ locales, ~60 keys pending translation)
- Remaining for public launch: Ko-fi donations, GitHub badges, production domain

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

Status as of May 6, 2026: All Phase 1 features shipped and stable. 133-entry public corpus fully sourced and WCAG-mapped. Button components consolidated from 5 types (Button, StateButton, IconButton, IconStateButton, BackButton) into 2 base types (Button, IconButton) with clean variant/active patterns. All hardcoded CSS values tokenized. All linters passing (ESLint 9.x with jsx-a11y compatibility, Stylelint, Markdownlint). UI component library extracted to `feature/ui-library` branch — clean, portable, zero dead code, ready for npm publishing. All unused code removed; zero unused imports across entire codebase. ESLint 9.x toolchain finalized with React 18 JSX transform support and outdated rules disabled. Ready for Phase 2 backend completion and Phase 3 public launch.

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

- 50+ locale files with full RTL support (Arabic, Uyghur)
- `en.json` source of truth; placeholders auto-propagate
- ~60 keys still pending translation, tracked in i18n-edits.md

Missing:

- Corpus pre-translation (`corpus.{lang}.json` files)
- AI refinement in active locale

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

- 4 provider configs (Anthropic, OpenAI, Google, Azure) with model selector in Settings
- Refine note rewrites finding desc + rem in auditor voice
- Typed errors + localhost API key bypass

Missing:

- Azure endpoint untested
- System prompt tuning (20+ finding test pass needed)

---

### AI Agent (Agentic Mode) — 65%

Files: `src/services/agenticAiService.js`, `src/services/searchCorpusTool.js`, `src/components/DetailPanel.jsx`, `src/components/SettingsPanel.jsx`

Done:

- Multi-turn tool-use loop with 5-turn guard (Anthropic only)
- Search corpus tool with Fuse.js handler
- Agentic toggle in Refine section (Claude only)
- i18n support in settings and detail panel

Missing:

- Multi-turn conversation UI (history, clear button)
- Corpus array passed to service

---

### User Findings (Custom Findings) — 30%

Done:

- localStorage CRUD with `USR-NNN` IDs
- reactive hook for add/edit/delete
- merged transparently in search

Missing:

- Add/edit/delete UI
- Personal vs. public corpus toggle

---

### Multilingual Edit Flow — 40%

Done:

- localStorage CRUD for locale overrides
- contribution queue with status tracking
- `apply-contributions.mjs` maintainer script for approval workflow
- 46 i18n keys in dialogs

Missing:

- Save button in DetailPanel
- Edit target dialog (Personal vs. Contribute)
- Edit scope dialog (lang_only / lang_and_en / all_langs)
- Personal override indicator badge
- Contributions review panel in settings

---

### Export Findings — 10%

Done:

- Blob download in text / markdown / csv formats

Missing:

- Multi-select UI in result list
- Format picker (Download vs. Email)
- Email delivery

---

### Import / Custom Data Source — 20%

Done:

- `importFromUrl(url)` for public JSON corpus

Missing:

- Settings UI (URL input, load button)
- Supabase-backed sync (Phase 3)

---

### Ko-fi Integration — 50%

Done:

- `KofiWidget.jsx` with a11y patches (aria-label, role/aria-modal, Escape handler)
- `LETTER_TO_KOFI.md` documenting 6 accessibility issues

Missing:

- Widget disabled pending console error resolution
- Selector re-verification vs. live Ko-fi DOM
- Ko-fi link fallback in footer

---

## Phase 2 — Complete / Partial

### Platform Variant Display — 100%

Done:

- Platform badges on result cards and detail panel with filter integration
- Styling and i18n support across 8+ locales
- Complete and tested

---

## Phase 2 — Partial/Complete

### Narrow Results Mode — 100%

Done:

- Secondary Fuse.js search on title/desc/keywords/sources
- Context-sensitive labels and "Clear and reset" button
- Filter icon, repositioned below search input
- Keyboard accessible, responsive design
- X icon exit button, focus restoration
- i18n support with placeholder propagation

---

## Phase 2 — Not Started

### Frequent Findings (Implicit Signal) — 100%

Done:

- Open/copy counts tracked via `recentFindings` array
- Boosts relevance score in sort logic
- Privacy disclosure updated

---

### Advanced Search Syntax — 0%

Support `+term` (require) and `-term` (exclude) operators, e.g. `keyboard -wcag2.2`.

Needs: query parser, syntax hint, i18n keys.

---

### How To Use / Onboarding — 100%

Done:

- 3-slide paginated workflow (Find, Refine, Copy)
- Auto-launches on first visit; re-launchable from Help
- Drawer on mobile, inline on desktop
- Help panel with keyboard shortcuts, search tips, locales
- Escape confirmation modal before final slide

---

## Phase 3 — Stubbed / Not Started

### Authentication — 10%

Done:

- Stubs with OAuth provider slugs, DB schema SQL, `.env` instructions

Missing:

- Supabase installation + env vars
- Sign-in UI in SettingsPanel
- Accuracy review vs. JS v2 SDK docs

---

### Cloud Sync — 5%

Done:

- CRUD stubs for findings and settings

Missing:

- Activation (prereq: auth)
- Sync on sign-in and every change

---

### PWA / Offline — 100%

Done:

- Service Worker caches app shell + corpus JSON
- Web App Manifest configured for install
- Installable to home screen (mobile & desktop)
- Electron build provides offline as side effect

---

### Analytics (Umami) — 20%

Done:

- Script placeholder in `index.html` (disabled)

Missing:

- Umami account + website ID
- Zero-cookie verification before enabling

---

### Ad Tiles — 100% (Infrastructure) / 0% (Live Delivery)

Done:

- `SponsoredTile.jsx` with admin toggle
- Sponsored badge with aria-label
- Injection after every nth result

Missing:

- Real ad delivery source integration
- Phase 3 deferred to v2.0+

---

## Distribution Targets

### Chrome Extension — 60%

Branch: `feature/chrome-extension`

Done:

- Manifest V3 with `side_panel` permission
- Vite build config, `build:extension` script
- Hash-based router works in side panel context

Missing:

- PNG icons (16 / 48 / 128px)
- Smoke test; layout check at ~400px
- Merge to main

---

### Firefox Extension — 60%

Branch: `feature/firefox-extension`

Done:

- Manifest V3 with `sidebar_action`
- No background script needed
- Vite build config, `build:extension:firefox` script

Missing:

- PNG icons (16 / 48 / 96px)
- Smoke test via about:debugging
- AMO account + extension ID registration
- Merge to main

---

### Electron Desktop — 80%

Branch: `feature/electron-app`

Done:

- IPC handlers with `safeStorage` encryption
- Context bridge for API keys, theme, version
- API key reads guarded with window.electronAPI check
- Dev and production build scripts

Missing:

- App icons (icns, ico, png)
- End-to-end test on macOS and Windows
- macOS code signing
- Merge to main

---

## What "Phase 3 Launch" Requires

Items tagged `[launch-blocker]` in TODO.md:

1. **Umami analytics** — account + ID + zero-cookie verification
2. **GDPR disclosure** — `docs/GDPR-DRAFT.md` exists; needs legal review + publish
3. **Google / GitHub OAuth** — Supabase stubs must be activated + tested
