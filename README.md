# A11yFred

> Audit entry descriptions, fast.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/a11yfred/a11yfred/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

Fast, consistent defect descriptions for accessibility findings, the kind that hold up in a ticket, a report, or a handoff. Search a library built on real audits, fact-checked against WCAG and accessibility practitioners, copy the text, paste it in. Built for auditors, testers, specialists and anyone doing manual accessibility testing and reviews.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## Status

**Launched.** Live at [a11yfred.app](https://a11yfred.app).

**Phase 1 (Personal Library):** Complete. 106-entry public corpus (ACC prefix), all linters passing, ulam framework published as `@ulam/*` npm packages, full component consolidation, CSS tokens, zero dead code. AI Assist complete (single-shot); Match Existing Style (agentic AI) 65% complete.

**Phase 2 (AI + Sharing):** In progress. Narrow results mode, frequent findings signal, PWA/offline, agentic AI (partial), and context API consolidation all complete. User entries UI, multilingual editing UI, and export/sharing pending.

**Phase 3 (Public Launch):** Partially started. Analytics (Umami) complete. Auth and cloud sync not started.

---

## Project structure

```text
src/
├── data/           public corpus (ACC prefix), legacy corpus (ATH prefix, admin-only)
├── services/       data layer, AI integration, localStorage utilities
├── hooks/          search, ratings, pinning, user entries, overrides
├── components/     UI components; ui/ has reusable primitives (from @ulam/ube)
├── calamansi/      i18n locale JSON files (logic via @ulam/calamansi npm package)
├── sawsawan/       integration layer (logic via @ulam/sawsawan npm package)
├── UlamMenu.jsx    test/development UI for ulam packages
└── App.jsx         main app (routes, contexts, state management)
```

**npm packages** (in package.json):

- `@ulam/ube` — UI components, buttons, panels, inputs (20 reusable primitives)
- `@ulam/taho` — ARIA live region announcer
- `@ulam/sili` — focus management, modal/drawer handling, escape key
- `@ulam/calamansi` — i18n, locale management, search relevance
- `@ulam/halohalo` — AI provider abstraction (Anthropic, OpenAI, Google, Azure)
- `@ulam/sawsawan` — integration bridge wiring packages together
- `@a11yfred/neighbor` — ESLint and Stylelint a11y plugins
- `@a11yfred/rogers` — accessibility debug tools

---

## Entry schema

Each corpus entry:

```json
{
  "id": "ACC-079",
  "sc": "2.4.6",
  "title": "Entry Title",
  "wcagLevel": "AA",
  "wcagVersion": "2.1",
  "severity": "High",
  "platform": "web",
  "desc": "Problem description.",
  "fix": "How to fix it.",
  "creditNames": ["Adrian Roselli"],
  "keywords": ["keyboard", "label"],
  "relatedSC": ["1.3.1 Info and Relationships (Level A)"],
  "primarySC": "2.4.6 Headings and Labels (Level AA)",
  "creditLinks": [{ "text": "Source Title", "url": "https://..." }],
  "note": "Optional clarifying note."
}
```

---

## Tools

| Package | Description |
| --- | --- |
| [`@a11yfred/neighbor`](https://github.com/a11yfred/neighbor) | ESLint and Stylelint accessibility linting plugin |
| [`@a11yfred/rogers`](https://github.com/a11yfred/rogers) | Accessibility debug panel for development |

---

## Changelog

See [docs/CHANGELOG.md](docs/CHANGELOG.md).

---

## Deployment

See [docs/DEPLOYING.md](docs/DEPLOYING.md) for full instructions.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT

---

*Built with help from Claude.*
