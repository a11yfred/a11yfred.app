# A11yTextHelper

> Audit defect descriptions, fast.

A personal accessibility audit writing assistant. Search your corpus of past defect write-ups by natural language, pick a match, add a location prefix, refine it, and copy it straight into your spreadsheet.

---

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

1. Set `base` in `vite.config.js` to match your repo name (e.g. `'/a11ytexthelper/'`)
2. Build: `npm run build`
3. Push `dist/` to your `gh-pages` branch, or use the `gh-pages` package:

```bash
npm install --save-dev gh-pages
# Add to package.json scripts: "deploy": "gh-pages -d dist"
npm run deploy
```

---

## Project structure

```
src/
  data/
    defects.json        # Defect corpus. Add entries here.
  services/
    dataService.js      # Data layer. Migration seam for Phase 2.
    aiService.js        # AI provider abstraction. Anthropic implemented, others stubbed.
  hooks/
    useDefectSearch.js  # Fuse.js search logic, platform-filtered.
  components/
    SearchBar.jsx
    ResultList.jsx
    DetailPanel.jsx
    SettingsPanel.jsx
  App.jsx
  tokens.css            # All design tokens: colors, type scale, spacing, radius.
  typography.css        # Type scale utilities and base text treatment.
  index.css             # Reset, base, and layout classes.
```

---

## Adding defects to the corpus

Each entry in `defects.json` follows this schema:

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

**Keywords** are the most important factor for search relevance. Include the element name, component, issue type, and any terms an auditor would naturally type.

---

## AI assist

With AI assist toggled on, the Refine field rewrites the description and remediation based on your note. AI is **off by default**.

Open Settings (⚙) to select a provider and add your API key. Keys are stored in your browser's `localStorage` only — never sent to any server other than the provider's own API. You supply your own key; usage is billed directly to your account.

Currently implemented: **Anthropic (Claude)**
Stubbed (ready to wire up): OpenAI, Google Gemini, Microsoft Copilot

---

## Phases

| Phase | Description | Status |
| ----- | ----------- | ------ |
| 1 | Personal snippet library — static JSON corpus, GitHub Pages | Current |
| 2 | AI assist on any model of choice | Partial (Anthropic done) |
| 3 | Public version with public data (WAI, WebAIM, Deque, axe) | Planned |

Mikey's private corpus is never part of the public version.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to fork, run locally, add defect entries, and submit a pull request.

---

## Docs

| File | Purpose |
| ---- | ------- |
| [CHANGELOG.md](CHANGELOG.md) | Technical record of all code changes |
| [UPDATES.md](UPDATES.md) | Plain-language summary of what changed and why |
| [TODO.md](TODO.md) | Personal backlog |
| [MAINTENANCE.md](MAINTENANCE.md) | Recurring sweep checklists |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

---

## License

[MIT](LICENSE) — Mikey Ilagan, 2026
