# router plugin

A self-contained hash-based routing and focus-management plugin for React SPAs.
Zero dependencies beyond React itself. Drop it into any project under `src/plugins/router/`.

---

## What's in the box

| Export | Type | Purpose |
| --- | --- | --- |
| `Router` | component | Context provider; wraps your app |
| `useRouter` | hook | `{ route, navigate, appName }` |
| `Route` | component | Renders children only when `route` matches |
| `Link` | component | Hash-link anchor |
| `Drawer` | component | Slide-in panel from the left; full focus management built in |
| `BottomSheet` | component | Slide-up sheet from the bottom; full focus management built in |
| `Modal` | component | Centered dialog; stacks above Drawer/BottomSheet; Escape intercepts before underlying panels |
| `useFocusOnMount` | hook | Move focus to an element when it mounts |
| `useReturnFocus` | hook | Restore focus to the triggering control on unmount |
| `returnFocus` | fn | Call `el.focus()` with a guaranteed-visible focus ring |
| `useFocusTrap` | hook | Restrict Tab focus to a container |
| `useAriaHide` | hook | Hide all other body children from the AT tree while the overlay is open |
| `useDir` | hook | Returns the current `document.documentElement.dir` value, updates reactively on change |
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
function DetailPanel({ finding }) {
  const titleRef = useFocusOnMount()

  return (
    <div>
      <h2 ref={titleRef} tabIndex={-1} className="your-outline-none-class">
        {finding.title}
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

**Visible focus ring on return:** Plain `.focus()` only triggers `:focus-visible` when the
browser's keyboard-modality flag is set. When a panel was opened with a mouse click,
programmatic focus lands invisibly — no ring, no cue of where you are. `useReturnFocus`,
`Drawer`, `BottomSheet`, and `Modal` all call `returnFocus()` internally, which sets
`data-focus-return` before calling `.focus()`. The CSS rule `[data-focus-return]:focus`
ensures the ring always appears on return. If you call `returnFocus()` directly, add that
rule to your stylesheet (see `index.css`).

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

### Rule 7 — Portaled overlays must also `aria-hide` background content

**When:** A modal or bottom sheet renders via `createPortal` to `document.body`.

**Why `inert` alone is not sufficient for portaled overlays:** The `inert` attribute on `.app-background` (Rule 6) hides the app content container from AT. However, portaled panels appear as direct siblings of `#root` at the `document.body` level, outside the app container hierarchy. Screen readers that traverse the body directly — VoiceOver in some reading modes, certain NVDA cursor behaviours — may still navigate into `#root` even while the portaled overlay is open. Setting `aria-hidden="true"` on `#root` (and any other body siblings) closes that gap.

**Do:** Call `useAriaHide(panelRef, open)` inside any portaled overlay component. The hook hides all `document.body` children except the one containing the panel, then restores them on close.

```jsx
import { useFocusTrap, useAriaHide } from './plugins/router/index.js'

function MyModal({ open, onClose, children }) {
  const panelRef = useRef(null)
  useFocusTrap(panelRef, open)
  useAriaHide(panelRef, open)   // ← adds this

  return createPortal(
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label="…">
      {children}
    </div>,
    document.body
  )
}
```

`Modal`, `BottomSheet`, and `Drawer` all call `useAriaHide` internally — you do not need to add it again when using those components.

**Stacking behaviour:** If two overlays are open simultaneously, the hook only removes `aria-hidden` from elements *it personally added the marker to*. An element already hidden by an earlier overlay will not be prematurely restored when the inner overlay closes.

**Non-portaled overlays (Drawer):** The Drawer renders inside `#root`, so `el.contains(panel)` always returns `true` for `#root` — the hook itself has nothing to hide for the background. For non-portaled overlays, set `aria-hidden` directly on the background content wrapper alongside `inert`:

```jsx
<div
  className="app-background"
  inert={backgroundInert ? '' : undefined}
  aria-hidden={backgroundInert ? true : undefined}
>
  ...
</div>
```

---

### Rule 8 — Escape key: every dismissible layer handles its own

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

### Note — Accordions: keep focus on the trigger

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
| `closeLabel` | string | `'Close'` | Accessible label for the chrome close button |
| `keepMounted` | boolean | `false` | Keep children in the DOM while the sheet is visually closed. Use when you need to preserve React state (e.g. text edits) while a secondary panel covers the sheet. The sheet is still `inert` when closed; only the state is preserved. |
| `onBack` | fn \| undefined | `undefined` | When provided, renders a back-chevron button in the top-left of the chrome. Call it to navigate to a previous context; the button is hidden when `onBack` is `undefined`. |
| `backLabel` | string | `'Back'` | Accessible label for the optional back button. |
| `children` | node | — | Rendered inside the sheet only while open (unless `keepMounted` is true) |

**`keepMounted` use case — settings ↔ detail panel navigation:**

When the user opens Settings while a finding detail sheet is open, you want to hide the
sheet visually but keep the user's edits alive. Pass `keepMounted={settingsOpen && !!selected}`
so children stay mounted while settings is covering the sheet:

```jsx
<BottomSheet
  open={!!selected && !settingsOpen}
  onClose={() => setSelected(null)}
  keepMounted={settingsOpen && !!selected}
  label="Finding detail"
>
  {selected && <DetailPanel finding={selected} />}
</BottomSheet>
```

When settings closes, restore focus to the panel heading via a `focusTrigger` prop pattern
(increment a counter in state; `useEffect` in the panel watches it and calls `ref.current?.focus()`).

### BottomSheet CSS classes

```css
.overlay-backdrop          /* shared backdrop; opacity 0, pointer-events none */
.overlay-backdrop.is-open  /* opacity 1, pointer-events auto */
.sheet-panel               /* fixed panel; transform: translateX(-50%) translateY(100%) */
.sheet-panel.is-open       /* transform: translateX(-50%) translateY(0) */
.sheet-chrome              /* chrome row at top; flex row; close button at right end */
.sheet-handle              /* drag-handle pill; position:absolute centered in chrome row */
.sheet-back-btn            /* optional back button; margin-right:auto pushes close to right end */
.sheet-close-btn           /* close button; flex-shrink:0 in the chrome flow */
.sheet-content             /* scrollable content area; flex:1 overflow-y:auto */
.sheet-close-bottom        /* full-width Close button at bottom — mobile only */
.sheet-close-bottom-btn    /* button inside .sheet-close-bottom */
```

See `index.css` in this project for the reference implementation.

Like `Drawer`, `BottomSheet` sets `inert` on the panel when closed and only mounts children
while open — `useFocusOnMount` in child components fires fresh on each open (unless
`keepMounted` is true, in which case children remain mounted and focus management is driven
externally via `focusTrigger`).

---

## The `Modal` component

`Modal` is a centered dialog that stacks above both `Drawer` and `BottomSheet` (z-index 301
vs 200). It bundles its own backdrop, focus management, Escape handling, and `inert` state.

```jsx
import { Modal } from './plugins/router/index.js'

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => setOpen(false)} heading="Confirm">
        <p>Are you sure you want to do this?</p>
      </Modal>
    </>
  )
}
```

### Modal with custom action buttons

Pass an `actions` array to replace the default OK button with any combination of buttons.
Buttons are rendered stacked in the modal footer, top to bottom:

```jsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  heading="Are you sure?"
  actions={[
    {
      label: 'Yes, delete',
      onClick: () => { handleDelete(); setOpen(false) },
      className: 'btn-accent modal-ok-btn',
    },
    {
      label: 'No, cancel',
      onClick: () => setOpen(false),
      className: 'btn-ghost modal-ok-btn',
    },
  ]}
>
  <p>This action cannot be undone.</p>
</Modal>
```

When `actions` is omitted, a single "OK" button that calls `onClose` is shown by default.

### Modal props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean | — | Whether the modal is visible |
| `onClose` | fn | — | Called on Escape or backdrop click |
| `heading` | string | `'Information'` | Displayed as an `<h2>` at the top of the modal |
| `actions` | `Array<{label, onClick, className?}>` | `[{ label: 'OK', onClick: onClose, className: 'btn-accent modal-ok-btn' }]` | Footer buttons, rendered top-to-bottom |
| `children` | node | — | Modal body content |

### Modal CSS classes

```css
.modal-backdrop            /* full-viewport backdrop; z-index 300 */
.modal-backdrop.is-open    /* opacity 1, pointer-events auto */
.modal-panel               /* centered panel; transform: translate(-50%,-50%) scale(0.96) */
.modal-panel.is-open       /* scale(1), opacity 1 */
.modal-body                /* scrollable content area */
.modal-heading             /* h2 inside .modal-body */
.modal-content             /* wraps children inside .modal-body */
.modal-footer              /* flex-column button row */
.modal-ok-btn              /* full-width block button; applies to all action buttons */
```

The `.btn-ghost` class is available for secondary/cancel actions (neutral border, muted text).

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
