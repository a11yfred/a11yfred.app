# @ulam/ube

Accessible React UI components, theming, routing, and screen reader announcements. The sweet layer of the [ulam](../../docs/ulam.md) framework.

Purple-first. Accessible out of the box. No external dependencies beyond React.

## Packages

Ube is one of four ulam packages:

```text
ulam
├── @ulam/ube          sweet   — UI, components, CSS, theming, router, announce  ← you are here
├── @ulam/calamansi    sour    — i18n, hooks, utilities, logic
├── @ulam/adobo        savory  — a11y debug panel, vanilla-first
└── @ulam/sawsawan     bridge  — wires the three together
```

## Components

### Interactive Controls

- **Button** — text button with icon support, state transitions, variants (primary, secondary, tertiary, warning)
- **IconButton** — icon-only button (accent, tertiary)
- **ButtonLink** — anchor styled as a button for hash navigation
- **Toggle** — binary on/off switch with accessible labels
- **RadioChip** — radio button styled as a selectable chip
- **Radio** — plain accessible radio input
- **Select** — native-enhanced dropdown with keyboard support

### Input and Feedback

- **InputWithClear** — text input with built-in clear button and focus management
- **Badge** — interactive and display badge variants with semantic colors
- **Field** — textarea with auto-sizing, copy, reset, and undo
- **InfoBox** — informational callout box

### Data Display

- **LinkTitle** — formatted source link title
- **SourceLinks** — source citation list (inline or bulleted)
- **ResultListSkeleton** — skeleton loading state for result lists

### Containers and Layouts

- **PanelShell** — header + title + content wrapper for drawer/sheet panels
- **Panel** — PanelShell with focus management and page title hooks
- **BackButton** — RTL-aware back chevron button
- **Modal** — dialog with focus trapping and Escape handling (from router plugin)
- **Drawer** — slide-in panel from left with focus management
- **BottomSheet** — slide-up panel from bottom with focus management

### States

- **NoResults** — empty state with illustration and copy
- **DataError** — error state with retry action

## Plugins

Ube ships three plugins as part of the package boundary.

### Announce (`src/plugins/announce/`)

Screen reader announcement system with assertive and polite regions.

```jsx
import { Announcer, announce, useAnnounce } from './plugins/announce'

// Render once at app root
<Announcer />

// Direct call from anywhere
announce('Settings: Saved')
announce('Error saving', { priority: 'assertive' })

// Hook style
const announce = useAnnounce()
```

### Router (`src/plugins/router/`)

Hash-based routing with focus management, RTL support, and page title updates.

```jsx
import { Router, useRouter, useFocusOnMount, useDir } from './plugins/router'

const { route, navigate } = useRouter()
const dir = useDir()  // 'ltr' or 'rtl'
const headingRef = useFocusOnMount()
```

### Theme

- **useThemeManager** — dark/light/auto/party modes as first-class feature

## Design Tokens

All components reference design tokens from `src/tokens.css` (design primitives) and `src/app-tokens.css` (app sizing).

- **Colors** — text, backgrounds, borders, semantic (success/error), focus, severity
- **Typography** — font families, scale (4 steps), line-height
- **Spacing** — consistent scale (0.25rem to 2rem)
- **Sizing** — touch targets (44px minimum), button/input heights, icon sizes
- **Focus** — outline width (2px), offset (2px)
- **Motion** — durations (150ms, 250ms, 350ms), easing

## App-specific components (not part of @ulam/ube)

These live in this folder but will not be included in the ube package when forked:

- **ScLink** — WCAG success criterion link with level badge (a11yhelper domain)
- **RelatedIssues** — related findings list (a11yhelper domain)

## Design principles

- Accessible by default — WCAG 2.2 AA, keyboard support, focus management built in
- Token-driven — change tokens, not component code
- Touch-safe — 44px minimum touch targets (WCAG 2.5.5)
- Motion-respectful — all animations respect `prefers-reduced-motion`
- Zero external dependencies — React only

## Future: Fork to @ulam/ube

This code lives in a11yhelper until closer to the webapp launch. At fork time:

1. Extract to the `ulam` monorepo
2. Publish to npm under `@ulam/ube` (org owned by mikeyil)
3. A11yhelper imports via `npm install @ulam/ube`

The boundary is maintained now by discipline: library code stays in `src/components/ui/`, `src/plugins/`, and `src/tokens/`. App-specific code does not cross in.

## License

MIT
