# A11yTextHelper

> Audit defect descriptions, fast.

A personal accessibility audit writing assistant. Search a corpus of WCAG-aligned defect write-ups by natural language, pick a match, optionally add a location prefix, refine the text with AI, and copy it straight into your spreadsheet.

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

## Deploy to Netlify

Connect the GitHub repo to a Netlify site. The `netlify.toml` in the project root handles:

- Build command (`npm run build`) and publish directory (`dist`)
- Security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- SPA fallback redirect so hash routes work on hard reload

No other Netlify configuration is required.

### GitHub Pages (alternative)

1. Uncomment and set `REPO_NAME` in `vite.config.js`
2. Build: `npm run build`
3. Push `dist/` to your `gh-pages` branch or use the `gh-pages` npm package:

```bash
npm install --save-dev gh-pages
# Add to package.json: "deploy": "gh-pages -d dist"
npm run deploy
```

---

## Project structure

```text
src/
  data/
    mikeys-corpus.json  # Personal defect corpus (private — never ships in public build)
    corpus.json         # Public corpus — 54 plain-language entries; default data source
  i18n/
    index.jsx           # I18nProvider + useT() hook (zero-dep, React Context)
    en.json             # Source of truth (~93 keys)
    es.json fr.json de.json nl.json sv.json
    zh.json ko.json ja.json tl.json
  services/
    dataService.js      # Data layer abstraction; migration seam for Supabase (Phase 2+)
    aiService.js        # AI provider abstraction; Anthropic implemented, others stubbed
  hooks/
    useDefectSearch.js  # Fuse.js search with platform filter
  utils/
    partySounds.js        # Web Audio API SFX: goose honk, cat sounds, fart, ahooga, wolf whistle, snare
    partySongs.js         # Web Audio API music: looping Song 2 (Blur) approximation
  components/
    SearchBar.jsx
    ResultList.jsx
    DetailPanel.jsx
    SettingsPanel.jsx
    Confetti.jsx          # Party mode canvas confetti animation (5 s, rAF loop)
    PartySparkles.jsx     # Party mode click sparkles — burst of stars/circles from cursor
    PartyMusicPlayer.jsx  # Party mode floating play/pause button; random position per route
  plugins/
    router/             # Hash-based SPA router + focus-management hooks (zero deps)
      Router.jsx        # <Router> provider and useRouter hook
      Route.jsx         # Conditional render by current route
      Link.jsx          # Hash navigation anchor
      Drawer.jsx        # Slide-in panel with focus trap, Escape, inert
      BottomSheet.jsx   # Slide-up sheet with focus trap, Escape, inert
      Modal.jsx         # Centered dialog; stacks above Drawer/BottomSheet
      useFocusOnMount.js
      useReturnFocus.js
      useFocusTrap.js
      useMediaQuery.js
      usePageTitle.js
      usePaginationFocus.js
      index.js          # Barrel export
      README.md         # Focus management rules and plugin documentation
    announce/           # ARIA live region pub/sub (zero deps)
      Announcer.jsx     # Mounts polite + assertive aria-live regions
      announce.js       # announce(message, { priority }) — call from anywhere
      useAnnounce.js    # Hook wrapper
      index.js          # Barrel export
      README.md         # Usage guide and screen reader behavior notes
  App.jsx
  main.jsx
  tokens.css            # Design tokens: colors, type scale, spacing, radius, dark mode, party mode
  typography.css        # Type scale utility classes (available for adoption)
  index.css             # Reset, base styles, layout, off-canvas, focus ring, sr-only

public/
  robots.txt            # Disallow all crawlers (dev deployment — replace before launch)

index.html              # App shell; SEO meta tags included but commented out for dev
netlify.toml            # Build settings, security headers, SPA redirect rule
vite.config.js          # Vite config; vendor chunk splitting for long-term caching
```

---

## Defect schema

Each entry in `mikeys-corpus.json` follows this schema:

```json
{
  "id": "ATH-051",
  "title": "Defect Title",
  "sc": "1.1.1",
  "scLabel": "1.1.1 Non-text Content (Level A)",
  "related": ["4.1.2 Name, Role, Value (Level A)"],
  "priority": "Critical",
  "platform": "web",
  "keywords": ["keyword1", "keyword2", "element name", "component"],
  "desc": "Defect description text.",
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

With AI assist toggled on, the Refine field rewrites the description and remediation based on a short note. AI is **off by default**.

Open Settings (⚙) to select a provider and add your API key. Keys are stored in `localStorage` only — never sent to any server other than the provider's own API. You supply your own key; usage is billed directly to your account.

Currently implemented: **Anthropic (Claude)**  
Stubbed (ready to wire up): OpenAI, Google Gemini, Microsoft Copilot

## Themes

Settings includes Light, Auto, Dark, and **Party Mode?** theme options. Party Mode generates a random complementary color palette on each activation, switches the font to Comic Sans, shows a 5-second confetti animation (skipped when `prefers-reduced-motion` is on), and changes the cursor to a magic wand. Screen readers receive a full description of the changes via `announce()`.

## Language

Settings includes a Language selector (defaults to your browser's language). 10 languages are fully translated: English, Español, Français, Deutsch, Nederlands, Svenska, 中文（简体）, 日本語, 한국어, Filipino (Tagalog).

Translations were generated with AI and may contain errors. No user-entered data is sent anywhere for translation. The `src/i18n/` directory contains one flat-key JSON file per locale; `src/i18n/en.json` is the source of truth.

---

## Plugins

### router (`src/plugins/router/`)

Self-contained hash-based SPA router with full WCAG 2.2 focus-management support. Zero dependencies beyond React. Reusable across projects.

Key exports: `Router`, `useRouter`, `Route`, `Link`, `Drawer`, `BottomSheet`, `Modal`, `useFocusOnMount`, `useReturnFocus`, `useFocusTrap`, `useMediaQuery`, `usePageTitle`, `usePaginationFocus`.

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

Mikey's private corpus (`mikeys-corpus.json`) is never part of the public version.

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for how to fork, run locally, add defect entries, and submit a pull request.

---

## Docs

| File | Purpose |
| ---- | ------- |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Technical record of all code changes |
| [docs/UPDATES.md](docs/UPDATES.md) | Plain-language summary of what changed and why |
| [docs/TODO.md](docs/TODO.md) | Personal backlog |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md) | Recurring sweep checklists |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute |

---

## License

[MIT](LICENSE) — Mikey Ilagan, 2026
