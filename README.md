# A11yFred

> Audit entry descriptions, fast.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/a11yfred/a11yfred/releases)
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

**Launched.** Live at [a11yfred.app](https://a11yfred.app). Version [v0.2.0](https://github.com/a11yfred/a11yfred/releases/tag/v0.2.0).

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

**npm packages** (in package.json):

- `@ulam/ube` (v0.3.0) — UI components: FormInputSearch, FormInputWithClear, ButtonText, ButtonIcon, FormControlToggle, FormControlRadio(Chip/Group), FormControlSelect, FormControlCheckbox, Screen, Panel, Badge, FadeTransition, etc.
- `@ulam/taho` — ARIA live region announcer and Announcer React component
- `@ulam/sili` (v0.3.0) — Dialog, Sheet, Drawer with focus management, OverlayManager, escape key handling
- `@ulam/calamansi` — i18n, locale management, search relevance scoring
- `@ulam/halohalo` — AI provider abstraction (Anthropic, OpenAI, Google, Azure)
- `@ulam/sawsawan` — storage adapters (localStorage, sessionStorage, memory) with platform detection
- `@a11yfred/neighbor` — ESLint and Stylelint a11y plugins
- `@a11yfred/rogers` — accessibility debug tools

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

## Known limitations

### Overlay Management (@ulam/sili)

Only one overlay (dialog/sheet/drawer) can be active at a time (by design per @ulam/sili OverlayManager architecture). Screen z-order is fixed: Screen(0) < Drawer(1) < Sheet(2) < Dialog(3). Nested overlays are not supported; workaround is to convert nested overlays to dialogs stacked on top.

### Navigation & Routing (@ulam/sili)

Uses @ulam/sili hash router. No native search param support (workaround: use state management or localStorage). Migrate to Remix router if moving to Remix, or React Router for more features. See [ULAM.md](docs/archive/ULAM.md) for framework details.

### UI Components (@ulam/ube v0.3.0)

@ulam/ube v0.3.0 renamed form input components for semantic accuracy: `FormInputSearch` and `FormInputWithClear` (replacing FormControlInputSearch/FormControlInputWithClear). All components import their own CSS; `ui.css` is the foundational stylesheet containing tokens, reset, typography, user preferences, and print styles.

### Forms (@ulam/ube)

No built-in form validation (implement using standard React patterns). No form state library; use React Hook Form or Formik for complex forms.

### Accessibility

Most animations respect `prefers-reduced-motion`, but some transition speeds should be reviewed for edge cases. High contrast mode is mostly supported, but custom styles in A11yDrawerPanel* components may need review.

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
  "creditNames": ["Mikey Ilagan"],
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

## Dependencies

### Current Versions

- React 18.x
- @ulam/sili 0.3.0+
- @ulam/ube 0.2.2+
- @ulam/calamansi (latest)
- @ulam/taho (latest)
- @ulam/halohalo (latest)
- @ulam/sawsawan (latest)
- @a11yfred/neighbor (latest)
- @a11yfred/rogers (latest)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## Deployment

See [docs/DEPLOYING.md](docs/DEPLOYING.md) for full instructions.

---

## Questions & Support

**How do I use this tool?** Start with the built-in "How to Use" onboarding (auto-launches on first visit, re-launchable from Help). Check [README.md](README.md) for general questions.

**What just changed?** See [UPDATES.md](UPDATES.md) for plain-language snapshots of recent work, or [CHANGELOG.md](CHANGELOG.md) for technical changes.

**Found a bug?** Open a [GitHub issue](https://github.com/a11yfred/a11yfred/issues) with the `bug:` prefix. Include:

1. Minimal reproduction steps
2. Browser, OS, and screen reader (if a11y-related)
3. Expected vs actual behavior

**Want to improve accessibility?** See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT

---

*Built with help from Claude.*
