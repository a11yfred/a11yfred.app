# Ulam Framework Sync Guide

The `feature/ulam` branch tracks the ulam framework boundary inside a11yhelper. It stays in sync with main and exists to mark what will become the standalone `ulam` monorepo at fork time.

## Framework boundary

These paths are ulam — they will move to the ulam repo at fork time:

```text
src/components/ui/      @ulam/ube — components, CSS, theme
src/taho/               @ulam/taho — vanilla live region announcer
src/taho-bayabas/       @ulam/taho-bayabas — React wrapper for taho
src/taho-pandan/        @ulam/taho-pandan — Remix adapter for taho
src/sili/               @ulam/sili — vanilla focus management core
src/siling-labuyo/      @ulam/siling-labuyo — React hooks for sili
src/siling-mahaba/      @ulam/siling-mahaba — Remix adapter for sili
src/calamansi/          @ulam/calamansi — i18n, hooks, utilities
src/sawsawan/           @ulam/sawsawan — integration bridge
src/halohalo/           @ulam/halohalo — AI layer
src/sawsawan/           @ulam/sawsawan — integration bridge
src/tokens.css                       @ulam/ube — design primitives
src/components/ui/user-preferences.css  @ulam/ube — OS/browser user preference overrides
src/app-tokens.css                   @ulam/ube — sizing tokens
src/typography.css      @ulam/ube — structural baseline
src/UlamMenu.jsx        ulam — component gallery (the menu)
src/UlamMenu.css        ulam — component gallery styles
```

Note: `tools/meryenda/` and `tools/palaman/` are dev tooling, not framework packages. They are not extracted at fork time.

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
- Comments in `src/components/ui/index.js` and `tools/meryenda/index.js` marking app-specific exports
- This document

## What NOT to include in the ulam package

These files live near the boundary but are a11yhelper-specific:

- `src/components/A11yLinkSc.jsx` — WCAG success criterion link
- `src/components/A11yListRelated.jsx` — related findings list
- `src/components/A11yPanelAdmin.jsx` — corpus admin panel
- `src/components/A11yToastAiDebug.jsx` — AI assist toggle toast

## Future fork

When a11yhelper is close to webapp launch:

1. Create `ulam` monorepo at `github.com/mikeyfyi/ulam`
2. Extract each package folder using git subtree split
3. Publish to npm under `@ulam/*` (org owned by mikeyil)
4. A11yhelper replaces local imports with `npm install @ulam/ube @ulam/calamansi @ulam/meryenda @ulam/sawsawan @ulam/halohalo`

See `src/components/ui/README.md` for full framework documentation.
