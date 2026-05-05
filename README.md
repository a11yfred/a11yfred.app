# A11yTextHelper

> Audit finding descriptions, fast.

A personal accessibility audit writing assistant. Search a corpus of WCAG-aligned finding write-ups by natural language, pick a match, optionally add a location prefix, refine the text with AI, and copy it straight into your spreadsheet.

---

## Project Status

As of May 5, 2026:

- **Phase 1 (Personal Library)**: Complete — 89-entry public corpus, all linters passing, documentation reorganized
- **Phase 2 (AI + Sharing)**: Partial — AI assist working, user overrides infrastructure complete, multilingual edit flow designed but UI deferred
- **Phase 3 (Public Launch)**: Not started — requires auth (Supabase), GDPR review, analytics setup
- **All tests and linters**: Passing (ESLint, Stylelint, Markdownlint; 34 markdown files validated)
- **Documentation**: Organized into active docs (`docs/`) and archive (`docs/archive/`); TODO cleaned up

---

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # output → dist/
```

## Deploy

Three deployment targets are configured. See [docs/DEPLOYING.md](docs/DEPLOYING.md) for full instructions on enabling/disabling each.

| Platform | Config | Status |
| -------- | ------ | ------ |
| **Netlify** | `netlify.toml` | Active — auto-deploys on push |
| **Vercel** | `vercel.json` | Ready — connect repo in Vercel dashboard |
| **GitHub Pages** | `.github/workflows/deploy-pages.yml` | Dormant — manual trigger, requires public repo |

---

## Project structure

```text
src/
  data/
    corpus.json           # Public corpus — 89 entries; fully sourced with links and credits
  i18n/
    index.jsx             # I18nProvider + useT() hook (zero-dep, React Context)
    en.json               # Source of truth (~240 keys)
    es.json fr.json de.json nl.json sv.json  # Romance/Germanic
    zh.json yue.json ko.json ja.json tl.json # CJK + Filipino
    ar-PS.json ug.json    # RTL locales — sets dir="rtl" on <html>
    # + 50+ more locale files (see src/i18n/ for full list; 18 are Easter egg locales)
  services/
    dataService.js        # Data layer; merges corpus + user findings + overrides
    aiService.js          # AI provider abstraction; Anthropic implemented, others stubbed
    agenticAiService.js   # Agentic AI backend with corpus search tool
    searchCorpusTool.js   # Fuse-based corpus search tool for agentic AI
    userFindingsService.js  # localStorage-backed user-created findings
    userOverridesService.js # localStorage-backed per-finding text overrides
    contributionService.js  # Queue for corpus contributions pending review
    importService.js      # XLSX/CSV finding import with column-mapping heuristics
    supabaseClient.js     # Supabase client stub — Phase 2; see file for setup + schema
    authService.js        # Auth stub — Google + GitHub OAuth via Supabase; Phase 2
  hooks/
    useFindingSearch.js   # Fuse.js search with platform/WCAG filter, rating-based sort
    useFindingRatings.js  # localStorage-backed per-finding votes, stars, archive state
    usePinnedFindings.js  # localStorage-backed pinned findings with reorder support
    useUserFindings.js    # User-created findings wired into search
    useUserOverrides.js   # Per-finding text overrides applied at render time
    useContributionQueue.js # Pending contributions queue
  components/
    SearchBar.jsx
    ResultList.jsx
    DetailPanel.jsx
    SettingsPanel.jsx
    AboutPanel.jsx
    Confetti.jsx
    PartySparkles.jsx
    PartyMusicPlayer.jsx
    KofiWidget.jsx        # Ko-fi donation widget + a11y patch (currently disabled)
  plugins/
    router/               # Hash-based SPA router + focus-management hooks (zero deps)
      Router.jsx          # <Router> provider and useRouter hook
      Route.jsx           # Conditional render by current route
      Link.jsx            # Hash navigation anchor
      Drawer.jsx          # Slide-in panel with focus trap, Escape, inert
      BottomSheet.jsx     # Slide-up sheet with focus trap, Escape, inert
      Modal.jsx           # Centered dialog; stacks above Drawer/BottomSheet
      useFocusOnMount.js
      useReturnFocus.js
      useFocusTrap.js
      useMediaQuery.js
      usePageTitle.js
      usePaginationFocus.js
      index.js            # Barrel export
      README.md           # Focus management rules and plugin documentation
    announce/             # ARIA live region pub/sub (zero deps)
      Announcer.jsx       # Mounts polite + assertive aria-live regions
      announce.js         # announce(message, { priority }) — call from anywhere
      useAnnounce.js      # Hook wrapper
      index.js            # Barrel export
      README.md           # Usage guide and screen reader behavior notes
    debug/                # Dev-only diagnostic tools (renders nothing in production)
      FocusDebugger.jsx   # KB focus toast + element flash on every focus event
      NamesDebugger.jsx   # Accessible name tooltip on hover
      DeployBanner.jsx    # Fixed bottom-left deployment status banner
      AiDebugToast.jsx    # AI assist toggle toast + useAiDebugToast hook
      DebugHelp.jsx       # Full command reference panel (debug help)
      DebugLauncher.jsx   # Optional floating FAB + spotlight input (disabled by default)
      debug.css           # All debug-only styles
      index.js            # Barrel export
      README.md           # Command reference and usage guide
  App.jsx
  main.jsx
  tokens.css              # Design tokens: colors, type scale, spacing, radius, dark mode
  typography.css          # Type scale utility classes (available for adoption)
  index.css               # Reset, base styles, layout, off-canvas, focus ring, sr-only

scripts/
  translate-missing.mjs   # Translates missing/stale i18n keys via Anthropic API
  en-snapshot.json        # Last-translated English values; drives stale-detection
  tag-wcag.mjs            # Script that added wcagVersion/wcagLevel to all corpus entries

electron/                 # Electron desktop app (active on feature/electron-app)
  main.js                 # Main process: BrowserWindow, safeStorage IPC handlers (complete)
  preload.js              # Context bridge: exposes window.electronAPI to renderer
  electron-builder.json   # Packaging config (macOS/Windows/Linux)

public/
  robots.txt              # Disallow all crawlers (dev deployment — replace before launch)
  favicon.svg             # SVG favicon with dark mode support

index.html                # App shell; SEO meta tags included but commented out for dev
netlify.toml              # Build settings, security headers, SPA redirect rule
vercel.json               # Build settings, security headers, SPA rewrite rule
vite.config.js            # Vite 8 config; LightningCSS, vendor chunk splitting
```

---

## Finding schema

Each entry in `corpus.json` follows this schema:

```json
{
  "id": "ATH-079",
  "title": "Finding Title",
  "sc": "2.4.6",
  "scLabel": "2.4.6 Headings and Labels (Level AA)",
  "wcagVersion": "2.1",
  "wcagLevel": "AA",
  "priority": "High",
  "platform": "web",
  "related": ["1.3.1 Info and Relationships (Level A)"],
  "sourceCredits": ["Adrian Roselli", "WebAIM"],
  "links": [
    { "text": "Understanding SC 2.4.6: Headings and Labels (Level AA)", "url": "https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels" },
    { "text": "Adrian Roselli - Where to Put Focus When Opening a Modal", "url": "https://adrianroselli.com/2020/10/aria-modal-and-the-backdrop.html" }
  ],
  "keywords": ["keyboard", "form", "label", "skip link", "navigation"],
  "desc": "Finding description text.",
  "rem": "Possible remediation steps."
}
```

**`platform`** values: `"web"` / `"native"` / `"both"`

**`priority`** values: `Critical` / `High` / `Medium` / `Low` / `Best Practice`

**`sc`** — WCAG success criterion (e.g. `"1.3.1"`); use `"N/A"` for best-practice entries

**`wcagVersion`** — `"2.0"`, `"2.1"`, `"2.2"`, or empty for best-practice

**`wcagLevel`** — `"A"`, `"AA"`, `"AAA"`, or empty for best-practice

**`sourceCredits`** — array of author/entity names (e.g. `["Adrian Roselli", "WebAIM"]`)

**`links`** — array of objects with `{ "text": "...", "url": "..." }`. Deep links to WCAG Understanding pages, expert articles, or specifications.

**`keywords`** — array of searchable terms (highest-weight field); include element names, components, issue types, and terms auditors naturally type

---

## Corpus

The app includes a public corpus (`corpus.json`, 89 entries) with general accessibility findings, full sourcing, and WCAG mapping. Every entry includes WCAG mapping (success criterion, version, level), priority, platform classification (web/native/both), keywords, description, remediation, and deep-linked sources attributed to expert articles or specifications.

## AI assist

With AI assist toggled on, the Revision Notes field rewrites the description and remediation based on a short note. AI is **off by default**.

Open Settings to select a provider and add your API key. Keys are stored locally — in `localStorage` for web and extension builds, in the OS keychain (`safeStorage`) for the Electron desktop build. Keys are never sent to any server other than the provider's own API. You supply your own key; usage is billed directly to your account.

An agentic AI backend (`agenticAiService.js`) uses a corpus search tool (`searchCorpusTool.js`) to ground AI responses in real findings.

Currently implemented: **Anthropic (Claude)**
Stubbed (ready to wire up): OpenAI, Google Gemini, Microsoft Copilot

## Ratings & Discovery

Every finding card has upvote/downvote and star buttons. Ratings are stored locally and influence result ranking over time — the app learns which findings are most useful for your workflow. Upvoted findings bubble to the top; archived findings drop to the bottom.

## Pin frequently-used findings

Click the pin icon on any result to pin it to the home page. Pinned findings appear at the top in a dedicated "Pinned" section before any search results. Useful for findings you reach repeatedly across audits.

## Result frequency tracking

The app tracks implicit usage: how many times you've opened each finding panel and how many times you've copied its text. Combined with upvote/downvote signals, frequency shapes the result ranking so the list self-organizes around your actual workflow.

## Offline-first support

The Service Worker caches the app shell and corpus JSON on first load. Once cached, full search, filtering, and rating features work completely offline. The Web App Manifest lets you install the app to your phone home screen. AI Assist still requires internet (to reach the provider API), but search doesn't.

## Animations and responsive design

All transitions respect `prefers-reduced-motion: reduce`. Result cards fold on select, compressing unselected cards to title-only view. Layout adapts responsively down to 568px viewport height (iPhone SE landscape).

## Themes

Settings includes Light, Auto, and Dark theme options, plus Party Mode.

## Language

Settings includes a Language selector (defaults to your browser's language). 63 locale files ship, covering 45 real languages plus 18 Easter egg locales. Real languages include English, Español, Français, Deutsch, Nederlands, Svenska, 中文, 日本語, 한국어, Filipino, Arabic (Palestinian), Māori, Hawaiian, Navajo, Ojibwe, Plains Cree, Tibetan, Tamil, Uyghur, Rohingya, Classical Nahuatl, Esperanto, Basque, Guaraní, Quechua, and more. Selecting Palestinian Arabic or Uyghur switches the entire layout to RTL.

Translations were generated with AI and may contain errors. No user-entered data is sent anywhere for translation. The `src/i18n/` directory contains one flat-key JSON file per locale; `src/i18n/en.json` is the source of truth. Title-case conventions follow NYT rules for English variants; sentence case for Romance/Germanic languages; no capitalization changes for scripts that lack the distinction.

Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill in missing or stale translations after modifying `en.json`.

---

## Distribution targets

| Target | Branch | Build command | Output | Status |
| ------ | ------ | ------------- | ------ | ------ |
| **Web** | `main` | `npm run build` | `dist/` | Active — auto-deploys to Netlify |
| **Chrome extension** | `feature/chrome-extension` | `npm run build:extension` | `dist-extension/` | Scaffold complete — needs icons + smoke test |
| **Firefox extension** | `feature/firefox-extension` | `npm run build:extension:firefox` | `dist-extension-firefox/` | Scaffold complete — needs icons + smoke test |
| **Electron desktop** | `feature/electron-app` | `npm run electron:build` | `release/` | Nearly complete — needs icons + OS testing |

All targets build from the same React source. `localStorage` is used in web and extension contexts; Electron uses `safeStorage` (OS keychain encryption) for API keys. See `docs/FEATURE-STATUS.md` for per-target completion details and remaining tasks.

### Electron — loading the dev build

```bash
npm run electron:dev    # Vite dev server + Electron together
npm run electron:build  # Production: Vite build + electron-builder package → release/
```

The app is fully offline once built (bundled corpus JSON, no server required). AI Assist still requires internet to reach the provider API. App icons (`build/icon.icns`, `build/icon.ico`, `build/icon.png`) are required before packaging.

### Chrome extension — loading unpacked

```bash
npm run build:extension         # builds dist-extension/
# chrome://extensions → Enable Developer mode → Load unpacked → dist-extension/
```

### Firefox extension — loading temporarily

```bash
npm run build:extension:firefox # builds dist-extension-firefox/
# about:debugging → This Firefox → Load Temporary Add-on → dist-extension-firefox/manifest.json
```

---

## Plugins

### router (`src/plugins/router/`)

Self-contained hash-based SPA router with full WCAG 2.2 focus-management support. Zero dependencies beyond React. Reusable across projects.

Key exports: `Router`, `useRouter`, `Route`, `Link`, `Drawer`, `BottomSheet`, `Modal`, `useFocusOnMount`, `useReturnFocus`, `useFocusTrap`, `useAriaHide`, `useDir`, `useMediaQuery`, `usePageTitle`, `usePaginationFocus`.

See [`src/plugins/router/README.md`](src/plugins/router/README.md) for focus-management rules and usage patterns.

### announce (`src/plugins/announce/`)

ARIA live region pub/sub. Mount `<Announcer />` once at the app root, then call `announce(message)` from anywhere in the codebase — no prop drilling or context required. Supports `polite` (default) and `assertive` priorities.

See [`src/plugins/announce/README.md`](src/plugins/announce/README.md) for usage and screen reader behavior notes.

### debug (`src/plugins/debug/`)

Dev-only diagnostic tools. Renders nothing in production. Includes a KB focus toast, accessible name tooltip, announce toast visualization, AI assist toggle toast, deployment status banner, and a `debug help` command reference panel.

See [`src/plugins/debug/README.md`](src/plugins/debug/README.md) for full command reference and usage guide.

---

## Phases

| Phase | Description | Status |
| ----- | ----------- | ------ |
| 1 | Personal snippet library — static JSON corpus, Netlify | Complete |
| 2 | AI assist, user overrides, contribution queue, import, pinning, WCAG filter | Mostly complete — Supabase/auth/sync deferred |
| 3 | Public version with public corpus, shareable URLs, SEO | In progress |

---

## Dev / Debug

Full command reference lives in [`src/plugins/debug/README.md`](src/plugins/debug/README.md). Quick reference below.

**Debug commands always require pressing ENTER** — they never fire on each keystroke, even with live search enabled. Easter egg commands (below) fire on keystroke.

### Universal commands

| Command | Effect |
| ------- | ------ |
| `debug help` | Show full command reference panel |
| `debug all` / `debug all on` | Enable KB focus toast + announce toast |
| `debug all off` | Disable KB focus toast + announce toast |
| `debug names` / `debug names on` | Show accessible name tooltip on hover |
| `debug names off` | Hide accessible name tooltip |
| `debug deploy off` | Hide deployment banner |
| `debug deploy on` / `debug deploy netlify` | Show Netlify deployment banner |
| `debug deploy pages` | Show GitHub Pages deployment banner |
| `debug deploy vercel` | Show Vercel deployment banner |

### Custom commands (A11yTextHelper)

| Command | Effect |
| ------- | ------ |
| `debug skeleton` | Show skeleton loading state |
| `debug ai assist` / `debug ai assist on` | Enable AI assist + show toast |
| `debug ai assist off` | Disable AI assist + show toast |

On `localhost`, AI assist can be enabled in Settings without entering a real API key.

### Detail panel debug triggers (require a finding to be open)

Type these in the search bar with a finding selected:

| Command | Effect |
| ------- | ------ |
| `debug ok` | 1.2 s fake load, typewriter placeholder text |
| `debug wrong` | Generic Revision Failed error |
| `debug 401` | Invalid API key error |
| `debug 429` | Rate limit error |
| `debug 503` | Service unavailable error |
| `debug network` | Network error modal |

### Dev-only visual tools

All active only on `localhost`, render nothing in production.

**ARIA announcer toast** — every `announce()` call shows a pill toast with message text and a `polite` / `assertive` badge. Assertive toasts use a red background. Fades down and out after ~4 seconds.

**KB Focus toast** — whenever keyboard focus moves, a blue pill shows the target element (`<tag.class1.class2>`), whether it has a visible `:focus` outline (✓/✗), and whether `:focus-visible` is matching. The focused element briefly flashes teal.

**Names tooltip** — hovering any element shows its accessible name (from `aria-label`, `aria-labelledby`, visible text content, or `alt`). Triggered by `debug names`.

Both toasts stack vertically when visible simultaneously. Both respect `prefers-reduced-motion: reduce`.

---

## Easter Eggs

Type any of the following in the search bar. Active search results and the open detail panel are preserved when an Easter egg fires. Append `off` to any egg command (e.g. `klingon off`) to restore English.

| Command | Language |
| ------- | -------- |
| `pig latin` | Pig Latin |
| `pirate` | Pirate English |
| `klingon` | tlhIngan Hol (Klingon) |
| `valyrian` | High Valyrian (Game of Thrones) |
| `belter` | Lang Belta (The Expanse) |
| `dothraki` | Dothraki (Game of Thrones) |
| `toki pona` | Toki Pona (minimalist conlang) |
| `navi` | Na'vi (Avatar) |
| `quenya` | Quenya (Tolkien High Elvish) |
| `sindarin` | Sindarin (Tolkien Grey Elvish) |
| `hodor` | Hodor (Game of Thrones) |
| `dovahzul` | Dovahzul (Skyrim Dragon Language) |
| `nadsat` | Nadsat (A Clockwork Orange) |
| `newspeak` | Newspeak (1984) |
| `mandoa` | Mando'a (Star Wars) |
| `cityspeak` | Cityspeak (Blade Runner polyglot) |
| `simlish` | Simlish (The Sims) |
| `alienese` | Alienese / Futurama English |

Party Mode is available in Settings — turn it on to find it. `party mode off` restores the theme to Auto.

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for how to fork, run locally, add finding entries, and submit a pull request.

---

## Docs

| File | Purpose |
| ---- | ------- |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Technical record of all code changes |
| [docs/UPDATES.md](docs/UPDATES.md) | Plain-language summary of what changed and why |
| [docs/TODO.md](docs/TODO.md) | Personal backlog |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Recurring sweep checklists |
| [docs/MAINT-LOG.md](docs/MAINT-LOG.md) | Maintenance run history |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute |
| [docs/DEPLOYING.md](docs/DEPLOYING.md) | Deployment options and switching guide |
| [docs/SECURITY.md](docs/SECURITY.md) | Data storage, API keys, CSP, and vulnerability reporting |
| [docs/i18n-edits.md](docs/i18n-edits.md) | Pending en.json key changes awaiting translation run |
| [docs/FEATURE-STATUS.md](docs/FEATURE-STATUS.md) | Per-feature completion tracker including distribution targets |

---

## License

[MIT](LICENSE) — 2026
