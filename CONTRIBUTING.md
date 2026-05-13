# Contributing

Guidelines for working on A11yFred (during development and for open source contributors).

## Branch Protection

The `main` branch is protected. Direct pushes are blocked by a pre-push hook. All changes must go through pull requests.

### Workflow

1. **Create a feature branch** from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

2. **Work on your branch** and commit:

   ```bash
   git add src/components/ui/Button.jsx
   git commit -m "feat: update button styling"
   ```

3. **Push your branch** to origin:

   ```bash
   git push origin feature/your-feature
   ```

4. **Open a pull request** on GitHub with:
   - Clear title (what changed)
   - Summary of why
   - Test plan (how to verify it works)

5. **After review and merge**, `main` is updated automatically. Pull the latest:

   ```bash
   git checkout main
   git pull origin main
   ```

### Branch Types

- **main** — Production code (protected, PR-only)
- **feature/\*** — Active development (chrome-extension, firefox-extension, electron-app, etc.)

### Syncing Feature Branches

Feature branches stay independent but get updates from main:

```bash
git checkout feature/your-feature
git merge main  # Bring in latest main changes
git push origin feature/your-feature
```

## Pre-Push Hook

A local hook prevents accidental direct pushes to `main`:

```bash
# This will be blocked:
git push origin main

# Error message:
# ❌ ERROR: Direct push to 'main' is blocked.
# Use a pull request instead.

# To override (NOT recommended):
git push --no-verify
```

## Linting & Commits

All code must pass linting before committing:

```bash
npm run lint  # Check ESLint, Stylelint, Markdownlint
```

Commits should be clear and descriptive:

```bash
# Good
git commit -m "feat: add Button component with icon support

Adds new Button base component to replace StateButton and IconStateButton.
Supports primary/secondary/tertiary/warning variants with optional
decorative icons and state transitions via active prop + activeIcon.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Avoid
git commit -m "fixes"
git commit -m "WIP"
```

## Code Style

- Use JSX for React components (project is plain JavaScript, no TypeScript)
- Use CSS custom properties (tokens) — no hardcoded colors/spacing
- All UI changes must meet WCAG 2.2 Level AA — keyboard operable, screen reader compatible, sufficient contrast, reduced motion respected

## Before Pushing

1. **Lint:** `npm run lint` (must pass)
2. **Test:** Verify your changes work in the browser
3. **Commit:** Clear, descriptive commit message
4. **Push:** `git push origin feature/your-feature`
5. **PR:** Open on GitHub with context and test plan

## Questions?

- For UI library questions, see `src/components/ui/README.md`
- For maintenance, see `MAINTENANCE.md`
- For deployment, see `docs/DEPLOYING.md`
