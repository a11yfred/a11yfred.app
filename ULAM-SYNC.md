# Ulam Framework Sync Guide

The `feature/ulam` branch tracks the ulam framework boundary inside a11yhelper. It stays in sync with main and exists to mark what will become the standalone `ulam` monorepo at fork time.

## Framework boundary

These paths are ulam — they will move to the ulam repo at fork time:

```text
src/components/ui/      @ulam/ube — components, CSS, theme
src/plugins/announce/   @ulam/ube — announce plugin
src/plugins/router/     @ulam/ube — router plugin
src/plugins/adobo/      @ulam/adobo — a11y debug panel
src/calamansi/          @ulam/calamansi — i18n, hooks, utilities
src/sawsawan/           @ulam/sawsawan — integration bridge
src/tokens.css          @ulam/ube — design primitives
src/app-tokens.css      @ulam/ube — sizing tokens
src/typography.css      @ulam/ube — structural baseline
src/UlamMenu.jsx        ulam — component gallery (the menu)
src/UlamMenu.css        ulam — component gallery styles
```

Everything else is a11yhelper-specific and stays in the app.

## Syncing feature/ulam with main

`feature/ulam` should always match main. After pushing commits to main:

```bash
git branch -f feature/ulam main
git push --no-verify origin feature/ulam
```

## Boundary enforcement

No file moves until the fork. The boundary is maintained by:

- `package.json` stubs inside each package folder declaring `@ulam/*` names
- Comments in `src/components/ui/index.js` and `src/plugins/adobo/index.js` marking app-specific exports
- This document

## What NOT to include in the ulam package

These files live near the boundary but are a11yhelper-specific:

- `src/components/ui/ScLink.jsx` — WCAG success criterion link
- `src/components/ui/RelatedIssues.jsx` — related findings list
- `src/plugins/adobo/AdminPanel.jsx` — corpus admin panel
- `src/plugins/adobo/AiDebugToast.jsx` — AI assist toggle toast

## Future fork

When a11yhelper is close to webapp launch:

1. Create `ulam` monorepo at `github.com/mikeyfyi/ulam`
2. Extract each package folder using git subtree split
3. Publish to npm under `@ulam/*` (org owned by mikeyil)
4. A11yhelper replaces local imports with `npm install @ulam/ube @ulam/calamansi @ulam/adobo @ulam/sawsawan`

See `src/components/ui/README.md` for full framework documentation.
