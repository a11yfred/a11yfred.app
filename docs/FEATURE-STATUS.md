# Feature Status

Living tracker of every feature in A11yFred, what is shipped, what is half-done, and what has not started.

Status key: ✅ Complete · 🟡 Partial · 🔧 Backend only · 💤 Stubbed · 🔲 Not started

---

## Phase 1: Complete (17/17 features, 1 pre-launch remaining)

**Status:** All Phase 1 features shipped and stable. Public corpus fully sourced and WCAG-mapped. Button consolidation complete (5 types → 2 base). All three linters passing with zero errors (ESLint, Stylelint, Markdownlint). prefers-reduced-motion and prefers-reduced-transparency fallback blocks added across all UI components. UI component library fully portable with 20 components, zero app-specific dependencies. ulam framework published as `@ulam/*` npm packages; rogers and neighbor published as standalone `@a11yfred/*` packages.

**Pre-launch remaining (1):**

| Feature | Status | % |
| --- | --- | --- |
| Analytics (Umami) | 💤 | 20 |

**Shipped (17/17):**

| Feature | Status | % |
| --- | --- | --- |
| Result List | ✅ | 100 |
| Ratings (Rank / Star / Archive) | ✅ | 100 |
| Pinned Results | ✅ | 100 |
| Session Persistence | ✅ | 100 |
| Debug Tools | ✅ | 100 |
| Corpus / Finding Data | ✅ | 100 |
| Corpus Quality Standards | ✅ | 100 |
| Platform Variant Display | ✅ | 100 |
| Animations & Transitions | ✅ | 100 |
| Responsive Design | ✅ | 100 |
| Party Mode | ✅ | 100 |
| UI Component Library (portable) | ✅ | 100 |
| Panel Component Unification | ✅ | 100 |
| Core Search | ✅ | 95 |
| Detail Panel | ✅ | 95 |
| Settings Panel | ✅ | 90 |
| Internationalization | 🟡 | 80 |

## Phase 2: In Progress

**Complete (8):**

| Feature | Status | % |
| --- | --- | --- |
| Frequent Findings (implicit signal) | ✅ | 100 |
| Narrow Results Mode | ✅ | 100 |
| How To Use / Onboarding | ✅ | 100 |
| PWA / Offline | ✅ | 100 |
| Advanced Search Syntax | ✅ | 100 |
| ulam framework: taho, sili, calamansi, halohalo, sawsawan | ✅ | 100 |
| ulam framework: vanilla route announcer + focus manager | ✅ | 100 |
| ulam framework: neighbor lint rules (JSX a11y gaps + 3 ulam-specific) | ✅ | 100 |

**Partial (2):**

| Feature | Status | % |
| --- | --- | --- |
| AI Assist (single-shot) | 🟡 | 85 |
| AI Agent (Match Existing Style) | 🔧 | 65 |

**Backend Only (3):**

| Feature | Status | % |
| --- | --- | --- |
| Multilingual Edit Flow | 🔧 | 40 |
| User Findings (custom) | 🔧 | 30 |
| Import / Custom Data Source | 🔧 | 20 |

**Not Started (3):**

| Feature | Status | % |
| --- | --- | --- |
| Corpus Guide Page (/corpus-guide) | 🔲 | 0 |
| Add / Edit / Delete Entry UI | 🔲 | 0 |
| Export Findings (UI + Email) | 🔲 | 10 |

**Distribution Targets:**

| Target | Status | % |
| --- | --- | --- |
| Electron Desktop | 🟡 | 80 |
| Chrome Extension | 🟡 | 60 |
| Firefox Extension | 🟡 | 60 |

## Phase 3: Planned

**Complete (1):**

| Feature | Status | % |
| --- | --- | --- |
| Ad Tiles (infrastructure) | ✅ | 100 |

**Stubbed (2):**

| Feature | Status | % |
| --- | --- | --- |
| Authentication | 💤 | 10 |
| Cloud Sync | 💤 | 5 |

## Deferred Indefinitely

Features parked with no active timeline. Revisit post-launch.

| Feature | Status | Notes |
| --- | --- | --- |
| Ko-fi Integration | 💤 | Widget disabled pending console error resolution; Ko-fi link in footer as fallback |
| SCSS Migration | 💤 | CSS custom properties sufficient; migrate only if specificity/mixin complexity grows |
| Compare Mode | 💤 | Side-by-side finding comparison; no user demand yet |
| GitHub Sponsors | 💤 | Activate once public launch is stable |

---

## Phase 1 Feature Details

### Core Search ,  95%

Done:

- Fuse.js fuzzy search with platform filter, WCAG version+level filter, live search toggle
- Result sorting (score DESC → starred first → archived last)
- `performance.now()` profiling (logs warnings >20 ms in dev)

Missing:

- (None; advanced query syntax with boolean `+term/-term` operators is complete)

---

### Result List ,  100%

Done:

- Cards with severity/source/WCAG badges (full text on desktop, short on mobile)
- Platform badge display showing Web/iOS/Android/Both
- Rank up / rank down / star / archive buttons per card
- Score display, archived visual state
- Card fold on select ,  non-selected cards collapse to title-only (CSS `:has()`)
- Skip link (WCAG 2.4.1) ,  slides in on focus
- No-results empty state with SVG illustration
- Badge click filter ,  click any severity/source/WCAG badge to filter by it
- Shareable search URLs ,  `?q=` param synced via `history.replaceState`
- Copy link button in results header copies `?q=` URL to clipboard
- Pinned results section above main results with clear pins option
- Narrow results mode with count display (`X of Y`)
- Skip-to-next button on each result card (ranking sort mode only)
- Sponsored tile preview with admin toggle (dev only)
- Sort and actions consolidated into one row; sort controls in `results-sort-group` (max-width 20rem); rank hint above the row

---

### Detail Panel ,  95%

Done:

- Full finding display: title, severity badge, WCAG SC links, source, related findings
- Copy / Reset desc + fix (individual and "Copy all / Reset all")
- Related findings navigation with back button history
- Reset confirmation modal when >70% of text changed
- Edit distance guard; `aria-busy` + spinner on AI refine
- `exportFinding.js` utility (text / markdown / csv) ,  data layer only
- **Copy button next to title** ,  copy just the finding name
- **Copy buttons for SCs** ,  copy primary success criterion and related criteria separately
- Location prefix field with **dynamic "(optional)" label** ,  disappears when field has value
- **Clear button for location prefix** ,  × positioned inside field (matches search clear button UX)
- Reset button renamed to **"Reset content"**
- All copy buttons show Check icon for 2 seconds on success, with accessibility announcements
- Platform badge display with clickable filter integration
- Severity badge positioning below h2 for visual clarity
- Related findings displayed with singular/plural labels
- Sources displayed inline (single) or as bullet list (multiple)

Missing:

- Export UI ,  multi-select from result list, format picker, Download/Email delivery options
- Save changes button (triggers multilingual edit flow; Phase 2)
- Personal override indicator badge (`_hasOverride` flag exists, badge missing; Phase 2)
- Edit scope and target dialogs (Phase 2)
- Location prefix value persistence between findings

---

### Ratings (Rank / Star / Archive) ,  100%

Done:

- `useFindingRatings.js` ,  localStorage-backed per-finding `{ score, starred, archived }`
- Rank up / rank down / star / archive in result list UI
- Archive moves item to bottom of sorted list instantly
- Star disables when archived; focus moves to adjacent card on archive
- Ratings influence sort order (starred > archived suppressed)
- Open/copy counts tracked implicitly in `recentFindings` and finding frequency signals
- Ratings persisted in `defect_ratings` localStorage key

Missing:

- Cloud sync for ratings (Phase 3, prereq: auth)

---

### Settings Panel ,  90%

Done:

- Theme: Light / Auto / Dark / Party
- Language: 50+ locales
- Platform filter: Web / Native App / Both
- Live search toggle
- WCAG version (2.0 / 2.1 / 2.2) + level (A / AA) radio filters
- AI Assist: toggle, provider, API key validation, model selector
- Reset All as BottomSheet with explicit lists (what gets deleted, what resets to defaults with values shown)
- Privacy & Storage disclosure sheet
- Rank up/rank down ratings restore on reload
- Pinned findings display with clear option

Missing:

- Reset All does not yet clear `userOverrides` or `pendingContributions` (multilingual edit flow not yet wired; Phase 2 feature)
- Sign-in UI section (Phase 3 feature, blocked on Supabase activation)

---

### Session Persistence ,  100%

Done:

- `lastSelectedId` in sessionStorage; restored on mount when URL is bare `#/`
- `recentFindings` array (max 10, newest-first) in localStorage

---

### Debug Tools ,  100%

Done:

- `FocusDebugger` ,  visible focus ring overlay
- `NamesDebugger` ,  cursor tooltip showing accessible name + source
- `AiDebugToast` ,  AI on/off indicator
- `DeployBanner` ,  deployment status badge
- `DebugHelp` ,  full command reference panel
- `DebugLauncher` ,  FAB + spotlight command input (runtime-toggled via `debug fab` / `debug fab off` search commands)
- Unified command dispatcher: `debug all/names/deploy/ai assist/skeleton on|off`, party/language off commands
- Admin panel restyled with UI library components (Toggle, IconButton, btn--primary/secondary); dataset tabs split into Public (ACC) and Legacy (ATH); bespoke CSS stripped, space tokens used throughout
- rogers (formerly adobo) and neighbor extracted as standalone `@a11yfred/*` packages; adobo renamed to rogers throughout

---

### Pinned Results ,  100%

Done:

- Pin button on every result tile (absolutely positioned inside card)
- `usePinnedFindings.js` ,  localStorage-backed `Set` of pinned IDs
- Pinned section above main results, visible across home / search / badge filter / view-all
- Persists until unpinned or Reset All; Clear Pins button in Settings (shown only when pins exist)
- Pin hint shown in search bar hint text when pins are active
- Accessible announce strings for pin / unpin; RTL-safe layout

---

### Party Mode ,  100%

Done:

- Random complementary palette; Comic Sans font; magic wand cursor
- Confetti canvas (110 particles, 5 s)
- Web Audio music player (Blur "Song 2" approximation)
- Sound effects (honk / meow / fart / horn / whistle / snare)
- Sparkle burst on click
- `prefers-reduced-motion` respected everywhere

---

## Phase 2 Feature Details

### Internationalization ,  80%

Done:

- 50+ locale files with full RTL support (Arabic, Uyghur)
- `en.json` source of truth; placeholders auto-propagate
- ~60 keys still pending translation (run `npm run translate` to sync)

Missing:

- Corpus pre-translation (`corpus.{lang}.json` files)
- AI refinement in active locale

---

### Corpus / Finding Data ,  100%

Done:

- Public corpus entries with full schema (title, desc, fix, severity, platform, WCAG SC, keywords, related)
- Platform classification across web-only, web & mobile, iOS, Android, and other variants
- All entries 100% sourced with minimum 2 expert sources each
- Sources deep-linked where available (e.g., Roselli's "Where to Put Focus When Opening a Modal Dialog")
- 10-expert consensus: Adrian Roselli, Scott O'Hara, Eric Bailey, Marco Zehe, Scott Vinkle, Kat Holmes, Eric Eggert, Karl Groves, Steve Faulkner, Patrick H. Lauke
- All titles standardized: AP title case, qualifier vocabulary normalized ("Missing" canonical form), consistent noun-phrase structure
- Desc normalization complete: defect-first order, no speculative language, WCAG terminology, platform framing rules, they/them pronouns, AT names imply platform
- Fix normalization complete: direct imperatives, no "Ensure" or "should" openers, "focus order"/"focus indicator" terminology, SC citation format
- SC cross-reference keywords: SC numbers cited in desc/fix added as keywords for cross-referencing in search
- Corpus fully validated: zero broken links, zero root domain links, proper WCAG prefix formatting, clean source credits structure

Missing (future enhancements):

- Keyword synonym expansion (optional optimization)
- Document platform (PDF, Word, PPT) entries: currently zero coverage; planned additions
- Native-specific gaps: Dynamic Type, contentDescription, announce notifications, custom accessibility actions

---

### AI Assist (Single-Shot) ,  85%

Files: `src/services/aiService.js`

Done:

- 4 provider configs (Anthropic, OpenAI, Google, Azure) with model selector in Settings
- Refine note rewrites finding desc + rem in auditor voice
- Typed errors + localhost API key bypass

Missing:

- Azure endpoint untested
- System prompt tuning (20+ finding test pass needed)

---

### AI Agent (Match Existing Style / Agentic AI) ,  65%

Files: `src/services/agenticAiService.js`, `src/services/searchCorpusTool.js`, `src/components/DetailPanel.jsx`, `src/components/SettingsPanel.jsx`

Done:

- Multi-turn tool-use loop with 5-turn guard (Anthropic only)
- Search corpus tool with Fuse.js handler
- Match Existing Style (Agentic AI) toggle in Refine section (Claude only)
- i18n support in settings and detail panel

Missing:

- Multi-turn conversation UI (history, clear button)
- Corpus array passed to service

---

### User Findings (Custom Findings) ,  30%

Done:

- localStorage CRUD with `USR-NNN` IDs
- reactive hook for add/edit/delete
- merged transparently in search

Missing:

- Add/edit/delete UI
- Personal vs. public corpus toggle

---

### Multilingual Edit Flow ,  40%

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

### Export Findings ,  10%

Done:

- `exportFinding.js` utility: blob download in text, markdown, and csv formats (data layer only)

Missing:

- Multi-select UI in result list (checkboxes or shift-click)
- Format picker dialog (Markdown / Plain Text / CSV / Excel)
- Excel export format (requires SheetJS or similar)
- Download trigger and file naming
- Email delivery option: compose to current mail client (mailto:) or send via SendGrid/Resend API
- Google Drive export: upload exported file directly to user's Drive (requires Google OAuth; available when authenticated via Phase 3 auth)

---

### Add / Edit / Delete Entry UI ,  0%

The data layer is complete (`userFindingsService.js`, `useUserFindings` hook, CRUD with `USR-NNN` IDs, merged transparently in search results). Only the UI is missing.

Missing:

- New entry form (title, desc, fix, sc, severity, platform, keywords)
- Edit mode in DetailPanel for user-owned entries
- Delete confirmation in DetailPanel
- Personal vs. public corpus toggle visible in Settings
- Corpus Guide page (/corpus-guide) as companion reference for entry authoring conventions

---

### Import / Custom Data Source ,  20%

Done:

- `importFromUrl(url)` for public JSON corpus

Missing:

- Settings UI (URL input, load button)
- Supabase-backed sync (Phase 3)

---

### Ko-fi Integration ,  50%

Done:

- `KofiWidget.jsx` with a11y patches (aria-label, role/aria-modal, Escape handler)
- `LETTER_TO_KOFI.md` documenting 6 accessibility issues

Missing:

- Widget disabled pending console error resolution
- Selector re-verification vs. live Ko-fi DOM
- Ko-fi link fallback in footer

---

---

### Corpus Guide Page ,  0%

A dedicated `/corpus-guide` route documenting the corpus for contributors and power users.

Missing:

- React component: `CorpusGuidePanel.jsx` (Panel pattern, same as AboutPanel)
- Route registration in router plugin
- en.json keys for all content sections
- Content sections:
  - Entry structure (schema fields and their purpose)
  - Title conventions (AP title case, qualifier vocabulary, noun-phrase, (Native App) suffix)
  - desc writing rules (defect-first, no speculative language, WCAG terminology, platform framing, they/them)
  - fix writing rules (direct imperatives, no Ensure/should openers, focus order/indicator, SC citations)
  - Severity model (Critical / High / Medium / Best Practice with definitions)
  - Platform field values and when to use each
  - SC cross-reference keyword rule
  - Contributing placeholder (template for external contributors)

---

### Platform Variant Display ,  100%

Done:

- Platform badges on result cards and detail panel with filter integration
- Styling and i18n support across 8+ locales
- Complete and tested

---

### Narrow Results Mode ,  100%

Done:

- Secondary Fuse.js search on title/desc/keywords/sources
- Context-sensitive labels and "Clear and reset" button
- Filter icon, repositioned below search input
- Keyboard accessible, responsive design
- X icon exit button, focus restoration
- i18n support with placeholder propagation

---

### Frequent Findings (Implicit Signal) ,  100%

Done:

- Open/copy counts tracked via `recentFindings` array
- Boosts relevance score in sort logic
- Privacy disclosure updated

---

### Advanced Search Syntax ,  100%

Done:

- `+term` (require) and `-term` (exclude) query operators
- Fuse.js query parser wired into `useFindingSearch`
- Syntax hint visible in search bar

---

### How To Use / Onboarding ,  100%

Done:

- 3-slide paginated workflow (Find, Refine, Copy)
- Auto-launches on first visit; re-launchable from Help
- Drawer on mobile, inline on desktop
- Help panel with keyboard shortcuts, search tips, locales
- Escape confirmation modal before final slide

---

## Phase 3 ,  Stubbed / Not Started

### Authentication ,  10%

Done:

- Stubs with OAuth provider slugs, DB schema SQL, `.env` instructions

Missing:

- Supabase installation + env vars
- Sign-in UI in SettingsPanel
- Accuracy review vs. JS v2 SDK docs

---

### Cloud Sync ,  5%

Done:

- CRUD stubs for findings and settings

Missing:

- Activation (prereq: auth)
- Sync on sign-in and every change

---

### PWA / Offline ,  100%

Done:

- Service Worker caches app shell + corpus JSON
- Web App Manifest configured for install
- Installable to home screen (mobile & desktop)
- Electron build provides offline as side effect

---

### Analytics (Umami) ,  20%

Done:

- Script placeholder in `index.html` (disabled)

Missing:

- Umami account + website ID
- Zero-cookie verification before enabling

---

### Ad Tiles ,  100% (Infrastructure) / 0% (Live Delivery)

Done:

- `SponsoredTile.jsx` with admin toggle
- Sponsored badge with aria-label
- Injection after every nth result

Missing:

- Real ad delivery source integration
- Phase 3 deferred to v2.0+

---

## Distribution Targets

### Chrome Extension ,  60%

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

### Firefox Extension ,  60%

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

### Electron Desktop ,  80%

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

1. **Umami analytics** ,  account + ID + zero-cookie verification
2. **GDPR disclosure** ,  `docs/GDPR-DRAFT.md` exists; needs legal review + publish
3. **Google / GitHub OAuth** ,  Supabase stubs must be activated + tested
