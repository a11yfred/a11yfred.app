# A11y UI Library

Portable, accessible React component and utility library. Built for accessibility auditing tools but reusable across any project.

## Components

### Interactive Controls (Base)

- **Button**: Text button with decorative icons, state transitions, variants (primary, secondary, tertiary, warning)
- **IconButton**: Icon-only button with variants (accent, tertiary)
- **ButtonLink**: Anchor element styled as a button (for hash-based navigation links)
- **Toggle**: Binary on/off switch with accessible labels
- **RadioChip**: Radio button styled as a selectable chip
- **Radio**: Plain accessible radio input
- **Select**: Native-enhanced dropdown with keyboard support

### Input & Feedback

- **InputWithClear**: Text input with built-in clear button and focus management
- **Badge**: Interactive and display badge variants with semantic colors
- **Field**: Complex textarea with auto-sizing, copy, reset, and undo

### Data Display

- **ScLink**: WCAG success criterion link with level badge
- **LinkTitle**: Formatted source link title
- **SourceLinks**: Source citations list (single inline or bulleted list)
- **RelatedIssues**: Related findings list with singular/plural label
- **ResultListSkeleton**: Skeleton loading state for result list

### Containers & Layouts

- **PanelShell**: Header + title + content wrapper for drawer/sheet panels
- **Panel**: PanelShell wrapper with focus management and page title hooks
- **BackButton**: RTL-aware back chevron button
- **Modal**: Dialog with focus trapping and Escape handling
- **Drawer**: Slide-in panel from left (mobile) or full page (desktop)
- **BottomSheet**: Slide-up panel from bottom with focus management and desktop collapse

### States

- **NoResults**: Empty state with illustration and copy
- **DataError**: Error state with retry action

## Utilities & Plugins

### Announce Plugin (`src/plugins/announce/`)

Screen reader announcement system with assertive and polite regions.

```jsx
import { Announcer, useAnnounce } from './plugins/announce'

// Render once at app root
<Announcer />

// In components
const announce = useAnnounce()
announce('Item copied to clipboard')  // polite (default)
announce('Error saving', 'assertive')  // urgent, interrupts
```

### Router Plugin (`src/plugins/router/`)

Hash-based routing with focus management, RTL support, and page title updates.

```jsx
import { useRouter, useDir, useFocusOnMount, usePageTitle } from './plugins/router'

const { navigate } = useRouter()
const dir = useDir()  // 'ltr' or 'rtl'
const headingRef = useFocusOnMount()  // focus target on route change
usePageTitle('Page Name')
```

Features:

- Hash-based navigation (`/#/finding/123`)
- Focus trapping in modals/panels
- Escape key handling
- RTL direction detection via `html[lang]`
- Automatic page title updates

### Debug Plugin (`src/plugins/debug/`)

Development-only accessibility debugging tools (focus visualization, accessible names, deployment status).

Features:

- Keyboard focus ring overlay
- Accessible name tooltip (`debug names on`)
- Announce toast visualization
- Deployment banner
- Command reference panel

## Design Tokens

All components reference design tokens from `src/tokens.css`:

- **Colors**: Text, backgrounds, borders, semantic (success/error), focus, badges
- **Typography**: Font families, sizes (4 scale steps), line-height
- **Spacing**: Consistent scale (0.25rem to 2rem)
- **Sizing**: Touch targets (44px), button heights, input heights, icon sizes
- **Focus & Outlines**: Outline width (2px), offset (2px)
- **Borders & Radius**: Border widths, radius scale (4px to 9999px)
- **Motion**: Durations (150ms, 250ms, 350ms), easing functions

## Usage

### Components Only

```jsx
import { Button, IconButton, Toggle, Badge, Modal } from './components/ui'
import './components/ui/index.css'

export default function App() {
  return <Button variant="primary">Click me</Button>
}
```

### With Utilities

```jsx
import { Button } from './components/ui'
import { useAnnounce } from './plugins/announce'
import { useRouter } from './plugins/router'
import './tokens.css'
import './components/ui/index.css'

export default function App() {
  const announce = useAnnounce()
  const { navigate } = useRouter()
  
  return (
    <>
      <Announcer />
      <Button onClick={() => {
        announce('Navigating to settings')
        navigate('/settings')
      }}>
        Go to Settings
      </Button>
    </>
  )
}
```

## Architecture

```text
src/
├── tokens.css                    # Design tokens (colors, spacing, sizing, etc.)
├── index.css                     # Global styles + component styles
├── components/
│   └── ui/
│       ├── Button.jsx
│       ├── IconButton.jsx
│       ├── ButtonLink.jsx
│       ├── Toggle.jsx
│       ├── Radio.jsx
│       ├── RadioChip.jsx
│       ├── Select.jsx
│       ├── Badge.jsx
│       ├── Field.jsx
│       ├── InputWithClear.jsx
│       ├── PanelShell.jsx
│       ├── Panel.jsx
│       ├── BackButton.jsx
│       ├── ScLink.jsx
│       ├── LinkTitle.jsx
│       ├── SourceLinks.jsx
│       ├── RelatedIssues.jsx
│       ├── NoResults.jsx
│       ├── DataError.jsx
│       ├── ResultListSkeleton.jsx
│       ├── index.js              # Barrel export
│       └── README.md             # This file
├── plugins/
│   ├── announce/
│   │   ├── Announcer.jsx
│   │   ├── useAnnounce.js
│   │   ├── index.jsx
│   │   └── README.md
│   ├── router/
│   │   ├── Modal.jsx             # Re-exported via ui/index.js
│   │   ├── Drawer.jsx
│   │   ├── BottomSheet.jsx
│   │   ├── useRouter.js
│   │   ├── useDir.js
│   │   ├── useFocusOnMount.js
│   │   ├── usePageTitle.js
│   │   ├── index.js
│   │   └── README.md
│   └── debug/
│       ├── AdminPanel.jsx
│       ├── Debug.jsx
│       ├── index.jsx
│       └── README.md
└── utils/
    └── constants.js              # Shared constants
```

## Component Prop Reference

### Button

```jsx
<Button
  variant="primary"              // 'primary' | 'secondary' | 'tertiary' | 'warning'
  onClick={handleClick}
  disabled={false}
  fullWidth={false}
  error={false}
  icon={<CheckIcon />}           // optional decorative icon
  activeIcon={<SuccessIcon />}   // icon when active
  active={false}                 // shows activeIcon/activeLabel
  label="Save"                   // aria-label or children
  className="custom-class"
/>
```

### IconButton

```jsx
<IconButton
  icon={<MenuIcon />}
  label="Open menu"              // aria-label (required)
  variant="accent"               // 'accent' | 'tertiary'
  onClick={handleClick}
  disabled={false}
/>
```

### Toggle

```jsx
<Toggle
  checked={false}
  onChange={(checked) => {...}}
  label="Enable feature"
  aria-label="Optional override"
/>
```

### Modal

```jsx
<Modal
  isOpen={true}
  onClose={handleClose}
  title="Confirm Action"
  description="Are you sure?"
>
  <button onClick={handleConfirm}>Yes</button>
  <button onClick={handleClose}>Cancel</button>
</Modal>
```

## Design Philosophy

- **Minimal and Opinionated**: Each component does one thing well
- **Accessible by Default**: WCAG 2.2 AA compliant, keyboard support built-in
- **Token-Driven**: All values use design tokens; change tokens, not component code
- **Touch-Safe**: 44px minimum touch targets (WCAG 2.5.5)
- **Motion-Respectful**: All animations respect `prefers-reduced-motion`
- **Portable**: No external dependencies beyond React; designed for npm packaging

## Development

### Adding a New Component

1. Create `src/components/ui/ComponentName.jsx` with `forwardRef`
2. Add styles to `src/index.css` under `/* ─── Component Name ──── */`
3. Export from `src/components/ui/index.js`
4. Add comprehensive jsdoc and prop types
5. Test keyboard navigation and screen reader announcements
6. Update this README

### Styling Standards

- Use CSS custom properties (tokens) exclusively
- Prefix component styles with `.component-name`
- Include states: `:hover`, `:active`, `:disabled`, `:focus-visible`
- Include dark mode under `[data-theme="dark"]`
- Include reduced-motion under `@media (prefers-reduced-motion: reduce)`

## Future: Graduation to npm Package

When ready to publish this as a standalone package:

1. Extract to separate repo: `a11y-ui-library`
2. Create `package.json` with peer dependencies (React, lucide-react)
3. Publish to npm under `@mikeyil/a11y-ui-library`
4. This project imports via `npm install @mikeyil/a11y-ui-library`
5. Use git subtree to keep bidirectional sync during transition period

## License

MIT
