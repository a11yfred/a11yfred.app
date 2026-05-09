# router plugin

Hash-based routing and focus management for React SPAs. Zero dependencies.

## Setup

Wrap your app in `<Router>`:

```jsx
import { Router, useRouter } from './plugins/router/index.js'

export default function App() {
  return <Router><AppShell /></Router>
}

function AppShell() {
  const { route, navigate } = useRouter()
  return (
    <>
      <button onClick={() => navigate('/settings')}>Settings</button>
      {route === '/settings' ? <SettingsPage /> : <HomePage />}
    </>
  )
}
```

Routes are hash fragments: `example.com/#/settings`. Browser back button works natively.

## Components

- **`Router`**: Context provider, wrap your app
- **`Drawer`**: Slide-in panel from left, focus management built in
- **`BottomSheet`**: Slide-up sheet from bottom, focus management built in
- **`Modal`**: Centered dialog, stacks above overlays (z-index 301)

## Hooks

**Focus management:**

- `useFocusOnMount(ref?)`: Move focus to element when it mounts (for page/panel headings, modal open)
- `useReturnFocus()`: Restore focus to triggering element on unmount
- `useFocusTrap(containerRef, active)`: Restrict Tab to container (overlays use this)
- `usePaginationFocus(headingRef, pageIndex)`: Re-focus heading on page change within modal/sheet

**Layout:**

- `useAriaHide(panelRef, active)`: Hide background from screen readers while overlay is open
- `useDir()`: Returns reactive `document.documentElement.dir` value
- `useMediaQuery(query)`: Reactive `window.matchMedia`
- `usePageTitle(title)`: Sets `document.title` to `"AppName | title"`

## Focus rules (WCAG 2.4.3)

1. **New page:** focus the main heading (`tabIndex={-1}`)
2. **Modal open:** focus first focusable element (usually close button, then heading)
3. **Modal close:** restore focus to trigger element (use `useReturnFocus`)
4. **Background open:** set `inert` on background (overlays do this automatically via `useAriaHide`)
5. **Escape:** each layer handles its own (overlays built-in)
6. **Paginated content:** use `usePaginationFocus` to refocus heading on page change
7. **Accordion:** leave focus on trigger (don't use `useFocusOnMount` on content)

## CSS classes

```css
.overlay-backdrop, .overlay-backdrop.is-open
.drawer-panel, .drawer-panel.is-open
.sheet-panel, .sheet-panel.is-open
.modal-backdrop, .modal-backdrop.is-open
.modal-panel, .modal-panel.is-open
```

See `index.css` for reference implementation with transitions and `prefers-reduced-motion`.
