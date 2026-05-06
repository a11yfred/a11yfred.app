# UI Library Branch Sync Guide

The `feature/ui-library` branch contains a portable, reusable component library that can be synced bidirectionally with this project using git subtree.

## Current Setup (Option 1: Git Subtree)

The library lives in `src/components/ui/` and `src/plugins/` (Announce, Router, Debug) with:

- **tokens.css** — Design system (colors, spacing, sizing, motion)
- **index.css** — Component styles
- **14+ Components** — Button, IconButton, Toggle, Badge, Modal, Field, etc.
- **3 Plugins** — Announce (screen reader), Router (navigation), Debug (dev tools)

## Syncing Workflow

### From main → feature/ui-library (Bring in A11yTextHelper updates)

```bash
git checkout feature/ui-library
git merge main  # Brings in all main branch changes
# Resolve conflicts if any
git push origin feature/ui-library
```

### From feature/ui-library → main (Contribute library improvements)

```bash
git checkout main
git merge feature/ui-library  # Brings in library enhancements
# Resolve conflicts if any
git push origin main
```

## Future: Upgrade to Option 2 (npm Package)

When the library is mature:

1. **Create separate repo:**
   ```bash
   mkdir a11y-ui-library && cd a11y-ui-library
   git init
   git config user.name "Your Name"
   git config user.email "you@example.com"
   ```

2. **Extract from subtree:**
   ```bash
   git subtree split --prefix=src/components/ui/ --branch=extracted-lib
   git push ../a11y-ui-library extracted-lib:main
   ```

3. **Add to a11ytexthelper as npm package:**
   ```bash
   npm install ../a11y-ui-library
   ```

4. **Continue syncing** during transition period via git subtree push/pull

## Maintenance Rules

- **Components** live in `src/components/ui/` — keep self-contained, no app-specific logic
- **Plugins** live in `src/plugins/` — utilities for routing, announcements, debugging
- **Tokens** in `src/tokens.css` — single source of truth for all design values
- **Styles** in `src/index.css` — all component CSS here, token-driven
- **No external deps** beyond React and lucide-react (for icons)

## What NOT to Sync

- App-specific components (SearchBar, ResultList, DetailPanel, etc.) stay on main
- App-specific hooks (useSearch, useFindingRatings) stay on main
- App-specific services (aiService, storage) stay on main
- App configuration and build setup stay on main

## Checking Library Scope

Run this to see what's currently in the library:

```bash
git diff main feature/ui-library -- src/components/ui/ src/plugins/ src/tokens.css src/index.css | grep "^+" | grep -E "(\.jsx|\.js|\.css)" | head -20
```

## Branch Protection

- **main** — Production code for A11yTextHelper app
- **feature/ui-library** — Reusable component library (can be extracted independently)

Both should stay in sync for most changes. Divergences happen when:
- Library gets improvements that should go to npm
- App-specific code stays on main only
- Tokens/styles are updated (synced to both)

---

See `src/components/ui/README.md` for full library documentation.
