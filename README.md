# A11yHelper

> Audit finding descriptions, fast.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/mikeyil/A11yHelper/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

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

**Phase 1 (Personal Library)**: Complete ,  106-entry public corpus (ACC prefix), all linters passing (ESLint 9.x + jsx-a11y), UI library complete (2 base button components + 19 additional components), agentic AI wired, full component consolidation done, CSS tokens, zero dead code.

**Phase 2 (AI + Sharing)**: In Progress ,  Agentic AI working, user overrides done, multilingual editing UI deferred, PWA/offline complete, frequent findings signal working. Corpus guide page planned.

**Phase 3 (Public Launch)**: Planning ,  Auth/analytics infrastructure stubbed, ad tiles ready for Phase 3+ delivery.

---

## Project Structure

Key directories:

- `src/data/` ,  106-entry public corpus (ACC prefix), 107-entry legacy corpus (ATH prefix, admin-only)
- `src/services/` ,  Data layer, AI integration, localStorage utilities
- `src/hooks/` ,  Search, ratings, pinning, user findings, overrides
- `src/components/` ,  UI components; `ui/` subfolder has 21 reusable components (Button, IconButton, + 19 others)
- `src/plugins/` ,  Router, Announcer, Debug tools (each with README)
- `docs/` ,  Deployment, maintenance, contributing

---

## Finding Schema

Each corpus entry:

```json
{
  "id": "ACC-079",
  "sc": "2.4.6",
  "title": "Finding Title",
  "wcagLevel": "AA",
  "wcagVersion": "2.1",
  "severity": "High",
  "platform": "web",
  "desc": "Problem description.",
  "fix": "How to fix it.",
  "sourceCredits": ["Adrian Roselli"],
  "keywords": ["keyboard", "label"],
  "related": ["1.3.1 Info and Relationships (Level A)"],
  "scLabel": "2.4.6 Headings and Labels (Level AA)",
  "links": [{ "text": "Source Title", "url": "https://..." }]
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
