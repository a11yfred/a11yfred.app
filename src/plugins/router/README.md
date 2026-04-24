# router plugin

A self-contained hash-based routing and focus-management plugin for React SPAs.
Zero dependencies beyond React itself. Drop it into any project under `src/plugins/router/`.

---

## What's in the box

| Export | Type | Purpose |
|---|---|---|
| `Router` | component | Context provider; wraps your app |
| `useRouter` | hook | `{ route, navigate }` |
| `Route` | component | Renders children only when `route` matches |
| `Link` | component | Hash-link anchor |
| `OffCanvas` | component | Slide-in panel with built-in focus management |
| `useFocusOnMount` | hook | Move focus to an element when it mounts |
| `useReturnFocus` | hook | Restore focus to the triggering control on unmount |
| `useFocusTrap` | hook | Restrict Tab focus to a container |
| `useMediaQuery` | hook | Reactive `window.matchMedia` |

---

## Quick start — bolt onto an existing SPA

### 1. Copy the plugin folder

```
src/
  plugins/
    router/         ← drop this whole folder in
```

### 2. Wrap your app in `<Router>`

```jsx
// main.jsx or App.jsx
import { Router } from './plugins/router/index.js'

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}
```

### 3. Navigate and read the current route

```jsx
import { useRouter } from './plugins/router/index.js'

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

Routes are hash fragments: `example.com/#/settings`. The browser back button works natively.

---

## Focus management rules

These rules implement WCAG 2.4.3 (Focus Order) and related success criteria. Every hook below
enforces one or more of them. The rules are written as implementation guidance — the hooks
do the work for you; you wire up the correct one for each pattern.

---

### Rule 1 — New page content: focus the heading

**When:** Navigating to a new "page" within a SPA, or any time a significant new section of
content replaces the previous view.

**Do:** Move focus to the first heading of the new content using `tabIndex={-1}`. The element
does not enter the tab order; it receives focus programmatically so the user starts reading
from the top of the new content.

```jsx
import { useFocusOnMount } from './plugins/router/index.js'

function SettingsPage() {
  const headingRef = useFocusOnMount()

  return (
    <section>
      <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>
        Settings
      </h2>
      {/* ... */}
    </section>
  )
}
```

---

### Rule 2 — New inline content: focus the content heading

**When:** Content is added to the page without a full navigation (e.g. clicking a result card
reveals a detail panel below the list).

**Do:** Same as Rule 1 — `useFocusOnMount` on the heading of the newly revealed content.
This prevents keyboard and screen reader users from having to hunt for the new content.

```jsx
function DetailPanel({ defect }) {
  const titleRef = useFocusOnMount()

  return (
    <div>
      <h2 ref={titleRef} tabIndex={-1} style={{ outline: 'none' }}>
        {defect.title}
      </h2>
      {/* ... */}
    </div>
  )
}
```

**Rule:** Any time focus is placed on an element that is not natively focusable (headings,
divs, spans, paragraphs), use `tabIndex={-1}`. Never use `tabIndex={0}` on non-interactive
elements — that inserts the element into the tab order unexpectedly.

---

### Rule 3 — Modal open: focus the first focusable element

**When:** A modal dialog opens.

**Do:** Move focus to the first focusable element inside the modal. Usually that is the close
button (placed first in DOM order for keyboard users). Use `useFocusOnMount` on the close
button, or on the modal heading if there is no close button.

```jsx
function Modal({ onClose, children }) {
  const closeRef = useFocusOnMount()

  return (
    <div role="dialog" aria-modal="true" aria-label="Confirm action">
      <button ref={closeRef} onClick={onClose} aria-label="Close">×</button>
      {children}
    </div>
  )
}
```

---

### Rule 4 — Modal / panel close: return focus to the triggering control

**When:** A modal or panel closes — whether by Escape, a close button, or a backdrop click.

**Do:** Return focus to whatever control the user activated to open the panel. Use
`useReturnFocus` inside the modal component; it saves `document.activeElement` on mount
and restores it on unmount automatically.

```jsx
function Modal({ onClose, children }) {
  useReturnFocus()           // saves opener focus; restores on unmount
  const closeRef = useFocusOnMount()  // focuses close button on open

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeRef} onClick={onClose} aria-label="Close">×</button>
      {children}
    </div>
  )
}
```

**Rule — modal opened from a bottom sheet:** If a modal is triggered by a control inside a
bottom sheet, focus must return to that control on the bottom sheet, not to wherever focus
was before the sheet opened. `useReturnFocus` handles this automatically because it captures
`document.activeElement` at the moment the modal mounts.

**Rule — modal opened without a user trigger** (e.g. a session timeout alert): No trigger
exists to return to, so do not attempt to restore focus. Allow default browser behavior —
focus moves to the document body as it would after a page refresh.

---

### Rule 5 — Focus trap: restrict Tab to the open layer

**When:** A modal dialog or bottom sheet / off-canvas panel is open.

**Do:** Prevent Tab from escaping the overlay. Use `useFocusTrap` with a ref pointing to
the container element.

```jsx
import { useFocusTrap } from './plugins/router/index.js'

function Modal({ open, onClose, children }) {
  const containerRef = useRef(null)
  useFocusTrap(containerRef, open)

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
```

`useFocusTrap` cycles Tab forward through focusable elements and Shift+Tab backward. When
the user reaches the last (or first) focusable element, the next Tab wraps around instead of
leaving the container. It is a no-op when `active` is false.

The `OffCanvas` component uses `useFocusTrap` internally — you do not need to add it again.

---

### Rule 6 — Accordions: keep focus on the trigger

**When:** An accordion item expands or collapses.

**Do:** Nothing — leave focus on the accordion trigger button. Focus should not jump to the
revealed content; the user will Tab into it naturally. This is the expected behavior per the
ARIA Accordion pattern.

**Do not** use `useFocusOnMount` inside accordion content panels.

---

## The `OffCanvas` component

`OffCanvas` bundles Rules 3, 4, and 5 for the common off-canvas / slide-in panel pattern.
You do not need to wire the hooks manually.

```jsx
import { OffCanvas } from './plugins/router/index.js'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open panel</button>
      <OffCanvas open={open} onClose={() => setOpen(false)} label="Navigation">
        <NavPanel onClose={() => setOpen(false)} />
      </OffCanvas>
    </>
  )
}
```

`OffCanvas` requires two CSS classes in your stylesheet (see `index.css` for the reference
implementation):

```css
.offcanvas-backdrop   /* fixed overlay behind the panel */
.offcanvas-panel      /* the panel itself; slides from left */

.offcanvas-backdrop.is-open  /* opacity 1, pointer-events auto */
.offcanvas-panel.is-open     /* translateX(0) */
```

Children are only mounted while `open` is true, which means `useFocusOnMount` inside a
child component fires fresh on every open — no stale ref or manual reset needed.

---

## `useMediaQuery`

Reactive wrapper around `window.matchMedia`. Re-renders the component when the media
condition changes (e.g. viewport crosses a breakpoint).

```jsx
const isDesktop = useMediaQuery('(width >= 768px)')
```

---

## Adding a modal to an existing component

Minimal checklist:

1. Wrap modal content in `<div role="dialog" aria-modal="true" aria-label="…">`
2. Put the close button first in DOM order
3. Add `useFocusOnMount` to the close button ref
4. Add `useReturnFocus()` at the top of the modal component
5. Add `useFocusTrap(containerRef, isOpen)` with a ref on the container
6. Add an Escape key listener that calls the close handler
7. Suppress focus ring on `tabIndex={-1}` elements with `style={{ outline: 'none' }}`

---

## Routing

Hash-based: routes are stored in `window.location.hash` (e.g. `#/settings`). Works with
static hosting (GitHub Pages, Netlify, S3) without server-side redirect configuration.

```jsx
const { route, navigate } = useRouter()

navigate('/settings')   // sets window.location.hash = '/settings'
navigate('/')           // back to root
```

The browser's Back button updates the hash and re-renders automatically via the
`hashchange` event listener in `Router.jsx`.
