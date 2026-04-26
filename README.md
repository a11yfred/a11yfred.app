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
    mikeys-corpus.json    # Private corpus — personal audit findings (not committed to public repo)
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

---

## Phases

| Phase | Description | Status |
| ----- | ----------- | ------ |
| 1 | Personal snippet library — static JSON corpus, Netlify | Current |
| 2 | AI assist on any model of choice | Partial (Anthropic done) |
| 3 | Public version with public data (WAI, WebAIM, Deque, axe) | Planned |

---

## Dev / Debug

These commands work in the running app during development.

### Search field triggers

Type any of the following exactly into the search bar and the action fires immediately (live search on) or on submit (live search off):

| Input | Effect |
| ----- | ------ |
| `debug skeleton` | Shows the skeleton loading state using the current result count |
| `pig latin` | Switches UI language to Pig Latin (Easter egg — not persisted) |
| `pirate` | Switches to Pirate English |
| `klingon` | Switches to tlhIngan Hol (Klingon) |
| `valyrian` | Switches to High Valyrian |

### AI revision triggers (detail panel, requires AI enabled)

| Input in note field | Effect |
| ------------------- | ------ |
| `debug wrong` | Forces the "Revision Failed" error modal |

### Visual ARIA monitor

When running on `localhost`, every `announce()` call renders a large toast at the bottom of the screen showing the message text and priority level (`polite` or `assertive`). Assertive toasts use a red background. This is dev-only — the toast is not rendered in production.

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
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute |
| [docs/DEPLOYING.md](docs/DEPLOYING.md) | Deployment options and switching guide |

---

## License

[MIT](LICENSE) — 2026
