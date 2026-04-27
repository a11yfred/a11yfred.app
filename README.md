# A11yTextHelper

> Audit finding descriptions, fast.

A personal accessibility audit writing assistant. Search a corpus of WCAG-aligned finding write-ups by natural language, pick a match, optionally add a location prefix, refine the text with AI, and copy it straight into your spreadsheet.

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
    corpus.json           # Public corpus — WCAG-aligned finding entries; default data source
    translations/         # Corpus title/desc/rem overlays per locale (de, es, fr, ja, ko, pt-BR, tl, zh)
  i18n/
    index.jsx             # I18nProvider + useT() hook (zero-dep, React Context)
    en.json               # Source of truth (~235 keys)
    es.json fr.json de.json nl.json sv.json  # Romance/Germanic
    zh.json yue.json ko.json ja.json tl.json # CJK + Filipino
    ar-PS.json ug.json    # RTL locales — sets dir="rtl" on <html>
    # + 40+ more locale files (see src/i18n/ for full list)
  services/
    dataService.js        # Data layer abstraction; Phase 2 stubs: getUserFindings, syncSettings
    aiService.js          # AI provider abstraction; Anthropic implemented, others stubbed
    supabaseClient.js     # Supabase client stub — Phase 2; see file for setup + schema
    authService.js        # Auth stub — Google + GitHub OAuth via Supabase; Phase 2
  hooks/
    useFindingSearch.js   # Fuse.js search with platform filter and rating-based sort
    useFindingRatings.js  # localStorage-backed per-finding votes, stars, and archive state
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
      DeployBanner.jsx    # Fixed bottom-left deployment status banner
      AiDebugToast.jsx    # AI assist toggle toast + useAiDebugToast hook
      DebugHelp.jsx       # Full command reference panel (debug help)
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

electron/                 # Electron desktop app scaffold (deps not yet installed)
  main.js                 # Main process: BrowserWindow, safeStorage IPC handlers
  preload.js              # Context bridge: exposes window.electronAPI to renderer
  electron-builder.json   # Packaging config (macOS/Windows)

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
  "id": "ATH-077",
  "title": "Finding Title",
  "sc": "1.1.1",
  "scLabel": "1.1.1 Non-text Content (Level A)",
  "related": ["4.1.2 Name, Role, Value (Level A)"],
  "priority": "Critical",
  "platform": "web",
  "keywords": ["keyword1", "keyword2", "element name", "component"],
  "desc": "Finding description text.",
  "rem": "Possible remediation steps."
}
```

**`platform`** values:

- `"web"` — only surfaces in Web mode
- `"native"` — only surfaces in Native app mode
- `"both"` — surfaces in both modes

**`priority`** values: `Critical` / `High` / `Medium` / `Low` / `Best Practice`

**Keywords** are the highest-weight search field. Include the element name, component, issue type, and any terms an auditor would naturally type.

---

## AI assist

With AI assist toggled on, the Revision Notes field rewrites the description and remediation based on a short note. AI is **off by default**.

Open Settings to select a provider and add your API key. Keys are stored in `localStorage` only — never sent to any server other than the provider's own API. You supply your own key; usage is billed directly to your account.

Currently implemented: **Anthropic (Claude)**
Stubbed (ready to wire up): OpenAI, Google Gemini, Microsoft Copilot

## Themes

Settings includes Light, Auto, and Dark theme options, plus Party Mode.

## Language

Settings includes a Language selector (defaults to your browser's language). 50+ languages ship in UI translations, including English, Español, Français, Deutsch, Nederlands, Svenska, 中文, 日本語, 한국어, Filipino, Arabic (Palestinian), Māori, Hawaiian, Navajo, Ojibwe, Plains Cree, Tibetan, Tamil, Uyghur, Rohingya, Classical Nahuatl, Esperanto, Basque, Guaraní, Quechua, Pig Latin, Klingon, Valyrian, Pirate speak, and more. Selecting Palestinian Arabic or Uyghur switches the entire layout to RTL.

Translations were generated with AI and may contain errors. No user-entered data is sent anywhere for translation. The `src/i18n/` directory contains one flat-key JSON file per locale; `src/i18n/en.json` is the source of truth. Title-case conventions follow NYT rules for English variants; sentence case for Romance/Germanic languages; no capitalization changes for scripts that lack the distinction.

Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill in missing or stale translations after modifying `en.json`.

---

## Electron (offline desktop)

The scaffold is in `electron/`. The app is already fully offline-capable (bundled corpus JSON, no server required). To activate the Electron build:

```bash
npm install --save-dev electron electron-builder concurrently
npm run electron:dev    # Dev: Vite + Electron together
npm run electron:build  # Production: Vite build + electron-builder package
```

API keys will use `window.electronAPI.keys` (Electron `safeStorage`) instead of `localStorage`. SettingsPanel currently uses `localStorage` directly — that's the last wiring task before packaging.

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

Dev-only diagnostic tools. Renders nothing in production. Includes a KB focus toast, announce toast visualization, AI assist toggle toast, deployment status banner, and a `debug help` command reference panel.

See [`src/plugins/debug/README.md`](src/plugins/debug/README.md) for full command reference and usage guide.

---

## Phases

| Phase | Description | Status |
| ----- | ----------- | ------ |
| 1 | Personal snippet library — static JSON corpus, Netlify | Current |
| 2 | AI assist on any model of choice | Partial (Anthropic done) |
| 3 | Public version with public data (WAI, WebAIM, Deque, axe) | Planned |

---

## Dev / Debug

Full command reference lives in [`src/plugins/debug/README.md`](src/plugins/debug/README.md). Quick reference below.

Type any command exactly into the search bar — fires immediately with live search on, or on submit with live search off.

### Universal commands

| Command | Effect |
| ------- | ------ |
| `debug help` | Show full command reference panel |
| `debug all on` | Enable KB focus toast + announce toast |
| `debug all off` | Disable KB focus toast + announce toast |
| `debug names on` | Show accessible name tooltip on hover |
| `debug names off` | Hide accessible name tooltip |

### Custom commands (A11yTextHelper)

| Command | Effect |
| ------- | ------ |
| `debug skeleton` | Show skeleton loading state |
| `debug ai assist on` | Enable AI assist + show toast |
| `debug ai assist off` | Disable AI assist + show toast |

On `localhost`, AI assist can be enabled in Settings without entering a real API key.

### Detail panel revision triggers (AI assist must be enabled)

Type these in the Revision Notes field and click Save & Revise:

| Input | Effect |
| ----- | ------ |
| `debug ai assist on` | 2 s fake load, appends note to both fields |
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

Both toasts stack vertically when visible simultaneously. Both respect `prefers-reduced-motion: reduce`.

---

## Easter Eggs

Type any of the following in the search bar. Active search results and the open detail panel are preserved when an Easter egg fires.

| Command | Effect |
| ------- | ------ |
| `pig latin` | Switch UI to Pig Latin |
| `pig latin off` | Restore language to English |
| `pirate` | Switch UI to Pirate English |
| `pirate off` | Restore language to English |
| `klingon` | Switch UI to tlhIngan Hol |
| `klingon off` | Restore language to English |
| `valyrian` | Switch UI to High Valyrian |
| `valyrian off` | Restore language to English |
| `party mode off` | Restore appearance to Auto |

Party Mode is available in Settings — turn it on to find it. 🎉

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

---

## License

[MIT](LICENSE) — 2026
