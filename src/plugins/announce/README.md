# announce plugin

A self-contained ARIA live region plugin for React SPAs. Lets any component or
service push a status message that screen readers will announce — without prop
drilling, context wiring, or extra DOM noise. Zero dependencies beyond React.

Perfect for confirming user actions ("Copy: Copied", "Settings: Saved"), async results ("Search: 12 results"), background state changes (theme/language switches), and errors. Works from anywhere: components, hooks, services, event handlers.

Drop it into any project under `src/plugins/announce/`.

---

## What's in the box

| Export | Type | Purpose |
| --- | --- | --- |
| `Announcer` | component | Mounts the live regions. Mount once in your app. |
| `announce` | function | Pushes a message. Call it anywhere — no hooks required. |
| `useAnnounce` | hook | Returns `announce`. Convenience alias for hook-style codebases. |

---

## Quick start

### 1. Copy the plugin folder

```text
src/
  plugins/
    announce/       ← drop this whole folder in
```

### 2. Mount `<Announcer />` once

Place it near the top of your app tree, as a sibling to your main layout
wrapper. It renders nothing visible — two `aria-live` divs with `.sr-only`
styling.

```jsx
// App.jsx
import { Announcer } from './plugins/announce/index.js'

export default function App() {
  return (
    <div className="app-container">
      <Announcer />
      {/* rest of your app */}
    </div>
  )
}
```

`<Announcer />` must be mounted before any `announce()` call fires. Mounting it
in the root component satisfies this for all app-level flows.

### 3. Call `announce()` from anywhere

```jsx
// Inside a component
import { announce } from './plugins/announce/index.js'

function SettingsPanel() {
  const handleSave = () => {
    // ... save logic ...
    announce('Settings: Saved')
  }
}
```

```js
// Outside React — a service file, async callback, etc.
import { announce } from './plugins/announce/index.js'

export async function submitForm(data) {
  await api.post('/form', data)
  announce('Form: Submitted')
}
```

---

## The message format — `"Context: Action"`

Screen reader announcements are read without visual context. A bare "Saved"
tells the user something was saved, but not what. Prefix every message with
the name of the component or section that produced it:

```text
"Settings: Saved"         ✓  clear
"Saved"                   ✗  ambiguous — saved what?

"Search: 12 results"      ✓
"12 results"              ✗  results for what?

"API key: Cleared"        ✓
"Cleared"                 ✗
```

The colon-space separator is a convention. Use whatever prefix scheme makes
sense for your project — just be consistent.

---

## Polite vs. assertive priority

```js
announce('Settings: Saved')                          // polite (default)
announce('Error: API key is invalid', { priority: 'assertive' })
```

| Priority | aria-live value | Behaviour |
| --- | --- | --- |
| `'polite'` | `polite` | Waits for a natural pause in the current utterance, then reads. |
| `'assertive'` | `assertive` | Interrupts the current utterance immediately. |

**Use `assertive` sparingly.** Interrupting mid-sentence is disorienting.
Reserve it for errors, destructive action confirmations, and time-sensitive
alerts where the delay of `polite` would cause confusion.

Good candidates for `assertive`:

- Validation errors after form submission
- Session expiry warnings
- Network errors that prevent the current action from completing

Everything else — success confirmations, counts, status changes — should be
`polite`.

---

## Auto-clear after announcement

After each message is read, `Announcer` clears the live region ~1 second later.
This prevents stale announcement text from sitting in the DOM where a screen
reader user navigating the page might encounter it out of context.

You do not need to call anything to trigger the clear — it is automatic.

---

## Announcing the same message twice

A screen reader ignores a live region update if the text hasn't changed.
The `Announcer` handles this automatically: it clears the region, waits one
paint (50 ms), then sets the new text. Repeated identical messages are
re-announced reliably.

```js
// These will both be announced even though they're the same string
announce('Copy: Copied')
// (user copies again a moment later)
announce('Copy: Copied')   // also announced
```

---

## Timing — when does the announcement fire?

`announce()` is synchronous from the caller's perspective — the DOM update
happens on the next React render, which is typically within the same frame.
The screen reader itself decides when to read the announcement based on its
own speech queue.

For messages triggered by async operations (e.g. after an API call resolves),
call `announce()` inside the `.then()` / `await` block, not before:

```js
// ✓ announce after the operation completes
const result = await save(data)
announce('Settings: Saved')

// ✗ do not announce before you know it succeeded
announce('Settings: Saving...')  // skip this
const result = await save(data)
```

"Saving…" progress messages are rarely useful; users expect brief operations
to just complete. If your operation takes more than ~3 seconds, consider an
inline spinner with an `aria-busy` attribute on the affected region rather than
a live announcement.

---

## Hooking into a component

If you prefer to follow the hooks-only import pattern in your component files:

```jsx
import { useAnnounce } from './plugins/announce/index.js'

function CopyButton({ text }) {
  const announce = useAnnounce()

  return (
    <button onClick={() => {
      navigator.clipboard.writeText(text)
      announce('Copy: Copied to clipboard')
    }}>
      Copy
    </button>
  )
}
```

`useAnnounce()` returns the same `announce` function — there is no functional
difference between the hook and the direct import. Choose based on style
consistency within each file.

---

## When NOT to use `announce()`

Not every state change needs a live region announcement. Over-announcing is
disorienting — it creates speech noise that competes with the content the user
is actually navigating.

### Focus management already handles these

When UI moves focus, the screen reader follows. No announcement is needed for:

- **Panel open/close** — `<Drawer>`, `<BottomSheet>`, and `<Modal>` use
  `useFocusOnMount` to move focus to the panel heading when they open. The
  dialog role (`role="dialog"`) causes screen readers to announce the dialog
  label automatically. When the panel closes, focus returns to the trigger
  element — the user hears the button label and knows where they are.
- **Page/view transitions** — if focus is moved to the new view's `<h1>` or
  heading, the screen reader reads it. Add `announce()` only if the view change
  is backgrounded and focus does not move.
- **Toggle buttons** — `aria-pressed` / `aria-checked` / `aria-expanded` on
  the button itself update the spoken state on activation. Calling `announce()`
  on top of this double-announces.

**Rule of thumb:** if focus is moving to somewhere that describes the change,
you don't need `announce()`. Use it for changes that happen in the background,
at a distance from the current focus position, or with no accessible label
of their own.

### Use `announce()` for

- **Action confirmations** — "Settings: Saved", "Copy: Copied", "Reset: Complete"
- **Async results** — search counts, AI rewrite completion, form submission outcomes
- **Background changes** — theme switch, language change (the visual result is
  not near the toggle)
- **Errors** — validation failures, network errors (use `assertive`)

---

## What `<Announcer />` renders

Two visually-hidden `<div>` elements placed in the DOM:

```html
<div role="status" aria-live="polite"    aria-atomic="true"> … </div>
<div role="alert"  aria-live="assertive" aria-atomic="true"> … </div>
```

Both are styled with the `.sr-only` pattern (1×1 px, clipped, off-screen).
`aria-atomic="true"` tells screen readers to read the entire region content as
a single unit rather than announcing individual DOM mutations — important when
the message is replaced rather than appended.

---

## Accessibility notes

- `role="status"` is equivalent to `aria-live="polite"` but also carries the
  implicit semantics of a status container, which some screen readers use to
  categorize their history of announcements.
- `role="alert"` is equivalent to `aria-live="assertive"` — it both sets the
  politeness and marks the region as an alert.
- The regions are **always in the DOM**. Content is injected and removed
  dynamically. This is intentional: inserting a live region and simultaneously
  setting text is unreliable in some screen readers (NVDA, JAWS) — the region
  may not be noticed in time.

---

## Known screen reader behaviour

| Screen reader | `polite` | `assertive` | Notes |
| --- | --- | --- | --- |
| NVDA + Firefox | ✓ | ✓ | Most reliable combination for testing. |
| JAWS + Chrome | ✓ | ✓ | May delay polite announcements by 1–2 words. |
| VoiceOver + Safari (macOS) | ✓ | ✓ | — |
| VoiceOver + Safari (iOS) | ✓ | ✓ | Test on device; emulator behavior differs. |
| TalkBack + Chrome (Android) | ✓ | ✓ | — |

The 50 ms clear-then-set cycle resolves the duplicate-message problem across
all the combinations listed above.
