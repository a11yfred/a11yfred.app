# Framework Changes Pending Upstream

These changes have been made to both:
- `node_modules/@ulam/ube/base-tokens.css` (for local development)
- `src/tokens-overrides.css` (a11yfred temporary overrides)

## Spacing Tokens Added

| Token | Value | Px Equiv |
|-------|-------|----------|
| --space-7 | 1.75rem | 28px |
| --space-9 | 2.25rem | 36px |
| --space-11 | 2.75rem | 44px |
| --space-12 | 3rem | 48px |

## Typography Tokens Added

| Token | Value |
|-------|-------|
| --letter-spacing-sm | 0.1em |

## Tokens Removed

| Token | Reason |
|-------|--------|
| --space-2-5 | Unused in codebase |

## Mirror to ulam/packages/ube/base-tokens.css

When updating the upstream ulam package, apply these changes to `packages/ube/base-tokens.css`.
