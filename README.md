# A11yTextHelper

> Audit finding descriptions, fast.

A personal accessibility audit writing assistant. Search a corpus of WCAG-aligned finding write-ups by natural language, pick a match, optionally add a location prefix, refine the text with AI, and copy it straight into your spreadsheet.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## Status

**Phase 1 (Personal Library)**: Complete ,  133-entry corpus, all linters passing, UI library complete (2 base button components + 12 primitives), agentic AI wired, full component consolidation done.

**Phase 2 (AI + Sharing)**: Partial ,  Agentic AI working, user overrides done, multilingual editing UI deferred.

**Phase 3 (Public Launch)**: Planning ,  Auth/analytics infrastructure stubbed.

---

## Project Structure

Key directories:

- `src/data/` ,  133-entry public corpus + personal corpus (gitignored)
- `src/services/` ,  Data layer, AI integration, localStorage utilities
- `src/hooks/` ,  Search, ratings, pinning, user findings, overrides
- `src/components/` ,  UI components; `ui/` subfolder has 14 reusable primitives (consolidated Button, IconButton, + 12 others)
- `src/plugins/` ,  Router, Announcer, Debug tools (each with README)
- `docs/` ,  Deployment, architecture, contributing

---

## Finding Schema

Each corpus entry:

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
  "sourceCredits": ["Adrian Roselli"],
  "links": [{ "text": "Source Title", "url": "https://..." }],
  "keywords": ["keyboard", "label"],
  "desc": "Problem description.",
  "rem": "How to fix it."
}
```

---

## Deployment

See [docs/DEPLOYING.md](docs/DEPLOYING.md) for full instructions.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT
