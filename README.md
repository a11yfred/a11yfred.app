# A11yFred

> Audit entry descriptions, fast.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.2.1-blue.svg)](https://github.com/a11yfred/a11yfred/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

Fast, consistent defect descriptions for accessibility entries, the kind that hold up in a ticket, a report, or a handoff. Search a library built on real audits, fact-checked against WCAG and accessibility practitioners, copy the text, paste it in. Built for auditors, testers, specialists and anyone doing manual accessibility testing and reviews.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## Status

**Launched.** Live at [a11yfred.app](https://a11yfred.app). Version [v0.2.1](https://github.com/a11yfred/a11yfred/releases/tag/v0.2.1).

**Phase 1 (Feature Complete):** Done (May 13).
**Phase 2A (Code Quality):** Done (May 17).
**Phase 3 (Theme + Extensions):** In progress.

See [DONE.md](DONE.md) for detailed phase summaries and [TODO.md](TODO.md) for remaining work.

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

**Framework packages:**

Built on @ulam (ulam accessibility framework). See [ABOUT.md](ABOUT.md) for full framework documentation.

---

## Component naming convention

All components in `src/components/` follow a strict two-tier naming convention based on their purpose:

**`App*` prefix** — Components that wrap or compose @ulam framework components.

Examples:

- `AppScreenHeader.jsx` — wraps @ulam/ube `ButtonIcon`, `LinkSkipTo`
- `AppDrawerPanelSettings.jsx` — wraps @ulam/ube `Panel`
- `AppSheetDetail.jsx` — wraps @ulam/sili `Sheet`, @ulam/ube form controls, Dialog
- `AppBadges.jsx` — wraps @ulam/ube `Badge`

**`A11y*` prefix** — Components that are custom to a11yfred and not simple wrappers of framework components.

Examples:

- `A11yResultAd.jsx` — custom ad tile component unique to a11yfred
- `A11yThemeEffectFiestaSparkles.jsx` — custom canvas-based sparkle effect
- `A11yResultsActiveFilterBar.jsx` — custom filter bar UI
- `A11ySettingsSectionAi.jsx` — custom settings panel section

This convention keeps the codebase clear: framework integrations (App*) are distinct from custom features (A11y*), making it easy to identify what each component does at a glance.

---

---

## Architecture & Limitations

See [ABOUT.md](ABOUT.md) for architectural patterns, technical decisions, and design rationale.

**Key framework limitations:**

- Only one overlay active at a time (Dialog/Sheet/Drawer); z-order: Screen < Drawer < Sheet < Dialog
- Hash-based routing; no native search params (use localStorage/state management)
- No form validation in @ulam/ube (use React Hook Form or Formik)

See [docs/archive/ULAM.md](docs/archive/ULAM.md) for framework details.

---

---

## Deployment

See [docs/DEPLOYING.md](docs/DEPLOYING.md) for full instructions.

---

## Documentation Map

| Document | Purpose |
| --- | --- |
| [README.md](README.md) | You are here: project overview, quick start, component conventions |
| [ABOUT.md](ABOUT.md) | Technical deep-dive: architecture, design choices, easter eggs |
| [DONE.md](DONE.md) | Completed features by phase (reference archive) |
| [TODO.md](TODO.md) | Remaining work and roadmap (Phase 3 & 4) |
| [UPDATES.md](UPDATES.md) | Dated snapshots of recent work (plain language) |
| [CHANGELOG.md](CHANGELOG.md) | Technical changes and breaking changes by version |

## Questions & Support

**How do I use this tool?** Start with the built-in "How to Use" onboarding (auto-launches on first visit, re-launchable from Help).

**What just changed?** See [UPDATES.md](UPDATES.md) for recent work snapshots, or [CHANGELOG.md](CHANGELOG.md) for technical details.

**Found a bug?** Open a [GitHub issue](https://github.com/a11yfred/a11yfred/issues) with the `bug:` prefix. Include minimal reproduction steps, browser/OS, and expected vs actual behavior.

**Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT

---

*Built with help from Claude.*
