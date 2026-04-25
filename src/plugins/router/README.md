# router plugin

A self-contained hash-based routing and focus-management plugin for React SPAs.
Zero dependencies beyond React itself. Drop it into any project under `src/plugins/router/`.

---

## What's in the box

| Export | Type | Purpose |
| --- | --- | --- |
| `Router` | component | Context provider; wraps your app |
| `useRouter` | hook | `{ route, navigate }` |
| `Route` | component | Renders children only when `route` matches |
| `Link` | component | Hash-link anchor |
| `Drawer` | component | Slide-in panel from the left; full focus management built in |
| `BottomSheet` | component | Slide-up sheet from the bottom; full focus management built in |
| `Modal` | component | Centered dialog; stacks above Drawer/BottomSheet; Escape intercepts before underlying panels |
| `useFocusOnMount` | hook | Move focus to an element when it mounts |
| `useReturnFocus` | hook | Restore focus to the triggering control on unmount |
| `useFocusTrap` | hook | Restrict Tab focus to a container |
| `useMediaQuery` | hook | Reactive `window.matchMedia` |
| `usePageTitle` | hook | Sets `document.title` to `"AppName \| Page"` while mounted |
| `usePaginationFocus` | hook | Re-focuses a heading when the page index changes inside a modal or sheet |

---

## Quick start — bolt onto an existing SPA

### 1. Copy the plugin folder

```text
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
      <h2 ref={headingRef} tabIndex={-1} className="your-outline-none-class">
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
reveals a detail panel below the list, or a bottom sheet opens with detail content).

**Do:** Same as Rule 1 — `useFocusOnMount` on the heading of the newly revealed content.
This prevents keyboard and screen reader users from having to hunt for the new content.

```jsx
function DetailPanel({ defect }) {
  const titleRef = useFocusOnMount()

  return (
    <div>
      <h2 ref={titleRef} tabIndex={-1} className="your-outline-none-class">
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

**Note on `tabIndex={-1}` and focus rings:** Suppress the browser's default focus outline on
these elements via CSS (`outline: none`) — the element is not keyboard-navigable by the user,
so showing a focus ring here is misleading. Use a CSS class rather than `style={{ outline: 'none' }}`
so the rule can be overridden by `prefers-contrast: more` if needed.

**Why children-only-when-open matters:** Both `Drawer` and `BottomSheet` only mount children
while `open` is true. This means `useFocusOnMount` inside a child fires fresh on every open
with no stale ref or manual reset — the component remounts each time.

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

**When:** A modal dialog, drawer, or bottom sheet is open.

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

`Drawer` and `BottomSheet` both use `useFocusTrap` internally — you do not need to add it again.

---

### Rule 6 — Background content must be `inert` when a panel is open

**When:** A modal, drawer, or bottom sheet is open.

**Do:** Apply the `inert` attribute to all background content — everything the user should
not be able to reach while the panel is open.

A focus trap (Rule 5) stops Tab from leaving the panel, but it does not stop screen reader
users from navigating with their **virtual/reading cursor** (arrow keys in NVDA Browse mode,
JAWS Virtual PC Cursor, VoiceOver arrow navigation). These reading modes let users move
through the accessibility tree independently of keyboard focus. Without `inert`, a screen
reader user can arrow out of the panel and read background content even though it is visually
hidden behind a dim overlay.

`inert` addresses both problems at once:

- Removes the subtree from the accessibility tree (screen reader cannot navigate into it)
- Removes it from the tab order (redundant with the focus trap, but makes the trap bulletproof)
- Blocks pointer events (clicks on background elements do nothing)

**Pattern:** wrap all background content in a single container element and set `inert` on
that wrapper. Keep the panel(s) as siblings — never inside the `inert` wrapper.

```jsx
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const backgroundInert = drawerOpen || sheetOpen

  return (
    <div className="app-container">
      {/* Announcer is always accessible — keep it outside the inert wrapper */}
      <Announcer />

      {/* Background: inert while any panel is open */}
      <div
        className="app-background"
        // eslint-disable-next-line react/no-unknown-property
        inert={backgroundInert ? '' : undefined}
      >
        <Header />
        <main>...</main>
        <Footer />
      </div>

      {/* Panels are siblings to the background — they never get inert here */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} label="Menu">
        ...
      </Drawer>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} label="Detail">
        ...
      </BottomSheet>
    </div>
  )
}
```

**Why `Announcer` stays outside the wrapper:** live regions (`aria-live`, `role="status"`,
`role="alert"`) stop working when `inert` is applied to their container. The announcer must
always be reachable by the browser's accessibility engine regardless of panel state.

**The `inert` value:** React passes the string `''` to produce the valueless HTML attribute
(`inert` with no value). `undefined` removes the attribute entirely. Do not use `true`/`false`
— HTML boolean attributes must be either present (any value) or absent.

**CSS class for the wrapper:** give the wrapper `flex: 1; display: flex; flex-direction: column`
so it acts as a transparent pass-through in a flex-column layout:

```css
.app-background {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

---

### Rule 7 — Escape key: every dismissible layer handles its own

**When:** A modal, drawer, or bottom sheet is open.

**Do:** Each dismissible component adds its own `keydown` listener for `Escape` while open,
and removes it on cleanup. This keeps each layer self-contained and independent.

```jsx
useEffect(() => {
  if (!open) return
  const handler = (e) => { if (e.key === 'Escape') onClose() }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [open, onClose])
```

`Drawer` and `BottomSheet` both handle Escape internally. You do not need to add it again
for those components.

**Double-fire is harmless.** If a content component inside a `Drawer` or `BottomSheet` also
listens for Escape independently (e.g. a `SettingsPanel` that wants to close itself), both
handlers fire on the same keypress. As long as both call the same `onClose`, this is
intentional and harmless — the panel closes once regardless.

```jsx
// SettingsPanel.jsx — adds its own Escape listener
useEffect(() => {
  const handler = (e) => { if (e.key === 'Escape') onClose() }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [onClose])

// Drawer also listens for Escape — both fire, panel closes once. Fine.
```

---

### Rule 8 — Accordions: keep focus on the trigger

**When:** An accordion item expands or collapses.

**Do:** Nothing — leave focus on the accordion trigger button. Focus should not jump to the
revealed content; the user will Tab into it naturally. This is the expected behavior per the
ARIA Accordion pattern.

**Do not** use `useFocusOnMount` inside accordion content panels.

---

### Rule 9 — Pagination within a modal or bottom sheet: focus the page heading

**When:** A modal or bottom sheet contains paginated content (e.g. a multi-step wizard, a
tabbed flow, or numbered pages) and the user manually advances or changes the page.

**Do:** Move focus to the heading at the top of the newly shown page content, within the
bounds of the existing focus trap. The container (modal/sheet) stays open and the focus
trap remains active — only the content inside changes.

Use `usePaginationFocus` with a ref on the page heading and the current page value as the
second argument. The hook fires on every page change but skips the initial mount, so it
does not conflict with `useFocusOnMount` handling the initial open.

```jsx
import { useFocusOnMount, usePaginationFocus } from './plugins/router/index.js'

function WizardModal({ onClose }) {
  const [page, setPage] = useState(1)
  const closeRef = useFocusOnMount()      // focuses close button on open
  const pageHeadingRef = useRef(null)
  usePaginationFocus(pageHeadingRef, page) // re-focuses heading on each page change

  return (
    <div role="dialog" aria-modal="true" aria-label="Setup wizard">
      <button ref={closeRef} onClick={onClose} aria-label="Close">×</button>

      <h2 ref={pageHeadingRef} tabIndex={-1} className="your-outline-none-class">
        Step {page} of 3
      </h2>

      {/* page content */}

      <button onClick={() => setPage(p => p + 1)}>Next</button>
    </div>
  )
}
```

**Why not just use `useFocusOnMount`?** `useFocusOnMount` only fires on component mount.
For pagination the modal stays mounted — only the internal state changes — so you need a
dependency-tracked alternative. `usePaginationFocus` watches the `page` value and
re-focuses on every change after the initial render.

---

## SPA route-change focus — returning to a prior page

When the user navigates *back* to a previously visited route (e.g. from Settings back to
Home), focus should land at the top of the newly shown content, not on the gear/trigger
button that originally opened the previous page.

**Pattern:** give the page's primary heading `tabIndex={-1}` and a `ref`, then drive focus
there imperatively when the route changes. Skip the initial mount so focus is not stolen on
first load.

```jsx
function AppShell() {
  const { route } = useRouter()
  const h1Ref = useRef(null)
  const didMount = useRef(false)
  const settingsOpen = route === '/settings'

  // Focus the home heading every time we return from settings
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    if (!settingsOpen) h1Ref.current?.focus()
  }, [settingsOpen])

  return (
    <>
      <h1 ref={h1Ref} tabIndex={-1}>My App</h1>
      {/* On mobile, pass focusOnClose so Drawer uses the heading
          instead of returning focus to the button that opened it */}
      <Drawer open={settingsOpen} focusOnClose={h1Ref} ...>
        <SettingsPanel />
      </Drawer>
    </>
  )
}
```

**`Drawer` — `focusOnClose` prop:** if a `focusOnClose` ref is provided, the panel
focuses that element on close instead of the trigger button that opened it. Omit it when
the default trigger-return behaviour is correct (e.g. a navigation drawer where returning
to the triggering link is the right UX).

**`useReturnFocus` in page-level panels:** do *not* add `useReturnFocus` to a settings
panel or similar full-page component when `focusOnClose`/AppShell focus management already
handles the return. `useReturnFocus` is for isolated modals (dialogs, alerts) that should
return focus exactly to their triggering control regardless of the containing route.

**Clearing state when settings opens:** if opening the drawer or sheet should dismiss another
overlay (e.g. close an open bottom sheet when the drawer opens), do it at the event source —
inside the click/navigate handler — not in a `useEffect`. Calling `setState` synchronously
inside a `useEffect` causes cascading renders and triggers linter warnings.

```jsx
// ✓ clear at the event source
<button onClick={() => { navigate('/settings'); setSelected(null) }}>Settings</button>

// ✗ do not use useEffect to react to the state change you just caused
useEffect(() => { if (settingsOpen) setSelected(null) }, [settingsOpen])
```

---

## The `Drawer` component

`Drawer` bundles Rules 3, 4, 5, and 6 for the slide-in drawer pattern.
You do not need to wire the hooks or Escape listener manually.

```jsx
import { Drawer } from './plugins/router/index.js'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open settings</button>
      <Drawer open={open} onClose={() => setOpen(false)} label="Settings">
        <SettingsPanel onClose={() => setOpen(false)} />
      </Drawer>
    </>
  )
}
```

### Drawer props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean | — | Whether the drawer is visible |
| `onClose` | fn | — | Called on Escape, backdrop click |
| `label` | string | `'Menu'` | `aria-label` for the dialog element |
| `focusOnClose` | React.RefObject | — | If provided, receives focus on close instead of the triggering element |
| `children` | node | — | Rendered inside the panel only while open |

### Drawer CSS classes

```css
.overlay-backdrop          /* shared backdrop; opacity 0, pointer-events none */
.overlay-backdrop.is-open  /* opacity 1, pointer-events auto */
.drawer-panel              /* the panel; transform: translateX(-100%) */
.drawer-panel.is-open      /* transform: translateX(0) */
```

See `index.css` in this project for the reference implementation including transitions,
`will-change`, and `prefers-reduced-motion` overrides.

Children are only mounted while `open` is true, which means `useFocusOnMount` inside a
child component fires fresh on every open — no stale ref or manual reset needed.

`Drawer` also sets `inert` on the panel element when closed, which blocks all pointer and
keyboard interaction with the hidden content without removing it from the DOM.

---

## The `BottomSheet` component

`BottomSheet` bundles Rules 3, 4, 5, and 6 for the slide-up sheet pattern. It renders its
own sticky chrome — a drag-handle pill at the top center and a close button at the top right —
so the content component only needs to handle `useFocusOnMount` on its heading.

```jsx
import { BottomSheet } from './plugins/router/index.js'

function App() {
  const [selected, setSelected] = useState(null)

  return (
    <>
      {/* result list — clicking an item sets selected */}
      <BottomSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        label={selected ? `${selected.title} — detail` : 'Detail'}
      >
        {selected && <DetailPanel item={selected} />}
      </BottomSheet>
    </>
  )
}
```

### BottomSheet props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean | — | Whether the sheet is visible |
| `onClose` | fn | — | Called on Escape, backdrop click, or the chrome close button |
| `label` | string | `'Detail'` | `aria-label` for the dialog element |
| `children` | node | — | Rendered inside the sheet only while open |

### BottomSheet CSS classes

```css
.overlay-backdrop          /* shared backdrop; opacity 0, pointer-events none */
.overlay-backdrop.is-open  /* opacity 1, pointer-events auto */
.sheet-panel               /* fixed panel; transform: translateX(-50%) translateY(100%) */
.sheet-panel.is-open       /* transform: translateX(-50%) translateY(0) */
.sheet-chrome              /* chrome row at top; position:relative anchors close button */
.sheet-handle              /* drag-handle pill (decorative) */
.sheet-close-btn           /* close button; position:absolute right */
.sheet-content             /* scrollable content area; flex:1 overflow-y:auto */
```

See `index.css` in this project for the reference implementation.

Like `Drawer`, `BottomSheet` sets `inert` on the panel when closed and only mounts children
while open — `useFocusOnMount` in child components fires fresh on each open.

---

## `useMediaQuery`

Reactive wrapper around `window.matchMedia`. Re-renders the component when the media
condition changes (e.g. viewport crosses a breakpoint).

```jsx
const isDesktop = useMediaQuery('(width >= 768px)')
```

---

## Adding a modal from scratch

Minimal checklist — use this when you need a dialog that isn't covered by `Drawer` or
`BottomSheet`:

1. Wrap modal content in `<div role="dialog" aria-modal="true" aria-label="…">`
2. Set `inert` on the modal container when closed to block pointer and keyboard interaction
3. Apply `inert` to the background content wrapper while the modal is open (Rule 6)
4. Put the close button first in DOM order
5. Add `useFocusOnMount` to the close button ref (or heading ref if no close button)
6. Add `useReturnFocus()` at the top of the modal component
7. Add `useFocusTrap(containerRef, isOpen)` with a ref on the container
8. Add an Escape key listener (see Rule 7) that calls the close handler
9. Suppress the focus ring on `tabIndex={-1}` elements via CSS (`outline: none`)

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
