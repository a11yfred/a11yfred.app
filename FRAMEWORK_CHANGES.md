# Framework Changes Pending Upstream

## Design Token Consolidation

Complete refactor from old naming convention to unified new naming. All changes apply to:

- `@ulam/ube/base-tokens.css` (framework token definitions)
- `@ulam/sili/base.css` (sheet/drawer/modal styling)
- `src/tokens-overrides.css` (a11yfred temporary overrides and mappings)

### Naming Convention Changes

Old naming → New naming

**Spacing (Size) Tokens:**

- `--space-*` → `--size-*` (consistent prefix across all sizing)

**Color Tokens:**

- `--bg` → `--color-bg`
- `--bg-subtle` → `--color-bg-subtle`
- `--border` → `--color-border`
- `--border-control` → `--color-border-control`
- `--border-control-accent` → `--color-border-control-accent`
- `--text-heading` → `--color-text-heading`
- `--text-body` → `--color-text-body`
- `--text-muted` → `--color-text-muted`
- `--text-disabled` → `--color-text-disabled`
- `--accent` → `--color-accent`
- `--accent-bg` → `--color-accent-bg`
- `--accent-text` → `--color-accent-text`
- `--focus` → `--color-focus`
- `--focus-disabled` → `--color-focus-disabled`
- `--success` → `--color-success`
- `--error` → `--color-error`

**Component Sizing:**

- `--touch-target` → `--size-touch-target`
- `--control-size` → `--size-control`
- `--input-big` → `--size-input-big`
- `--modal-max-width` → `--size-modal-max-width`
- `--modal-max-height-mobile` → `--size-modal-max-height-mobile`
- `--panel-width-mobile` → `--size-panel-width-mobile`

**Border Widths:**

- `--border-width-control` → `--size-border-width-normal` (1.5px → 2px)
- Added: `--size-border-width-thin` (1px)
- Added: `--size-border-width-thick` (3px)

**Focus Ring:**

- `--focus-outline-width` → `--size-border-width-normal`
- `--focus-outline-offset` → `--size-outline-offset-normal`
- Added: `--size-outline-offset-thin`, `--size-outline-offset-thick`

### New Tokens Added

| Token                 | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| `--size-7`            | 1.75rem                                                         |
| `--size-9`            | 2.25rem                                                         |
| `--size-11`           | 2.75rem                                                         |
| `--size-12`           | 3rem                                                            |
| `--font-mono`         | ui-monospace, Cascadia Code, Source Code Pro, menlo, monospace |
| `--letter-spacing-sm` | 0.1em                                                           |

### Component-Specific Changes

**Sheet/Drawer/Modal:**

- `.sheet-panel` and `.modal-panel`: Added `max-width: var(--size-modal-max-width)` 
- `.sheet-panel`: Added `border-top` and `border-inline` (previously no side borders)
- `.sheet-panel`: Changed `border-radius` from top corners only to all corners
- `.sheet-panel.is-collapsed`: Added `.btn-close { display: none; }` rule

**Form Controls:**
- Focus behavior unified to `:focus-visible` (keyboard-only) across framework
- Input/textarea outline styling updated to use `--size-border-width-normal`

### Backward Compatibility (in tokens-overrides.css)

Aliases created to allow framework to reference old names while app uses new names:

```css
--border: var(--color-border);
--bg: var(--color-bg);
--text-heading: var(--color-text-heading);
--accent: var(--color-accent);
--touch-target: var(--size-touch-target);
/* ... etc */
```

## Migration Guide

When syncing changes upstream to `@ulam/ube` and `@ulam/sili`:

1. Replace all `--space-*` with `--size-*` in token definitions and references
2. Replace all `--bg*`, `--text-*`, `--border*`, `--accent*`, `--focus*` with `--color-*` equivalents
3. Replace component sizing tokens with `--size-*` prefix
4. Update `border-width-control` from 1.5px to 2px (now `--size-border-width-normal`)
5. Expand border-width tokens: add `--size-border-width-thin` (1px) and `--size-border-width-thick` (3px)
6. Add sheet panel styling: max-width, borders, and all-corners border-radius
7. Update all CSS files to use new naming (search-replace on `--space-`, `--bg`, `--text-`, `--border`, `--accent`, `--focus`, `--touch-target`, `--control-size`)
