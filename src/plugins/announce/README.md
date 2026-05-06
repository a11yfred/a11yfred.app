# announce plugin

ARIA live region plugin for React. Call `announce()` from anywhere to push screen reader messages without prop drilling or context.

## Setup

Mount `<Announcer />` once in your app root:

```jsx
import { Announcer, announce } from './plugins/announce/index.js'

export default function App() {
  return (
    <>
      <Announcer />
      {/* rest of app */}
    </>
  )
}
```

## Usage

```jsx
import { announce } from './plugins/announce/index.js'

// Polite (default)
announce('Settings: Saved')

// Assertive (interrupts)
announce('Error: Invalid API key', { priority: 'assertive' })
```

## Message format

Prefix messages with context: `"Context: Action"` (e.g., "Settings: Saved", "Search: 12 results"). Bare messages like "Saved" are ambiguous.

## Priority levels

- `'polite'` — waits for natural pause (default, for confirmations/results)
- `'assertive'` — interrupts immediately (for errors/alerts only)

## When to use

Use `announce()` for:

- Action confirmations: "Settings: Saved", "Copy: Copied"
- Async results: "Search: 12 results", "Rewrite: Complete"
- Background changes: theme/language switches
- Errors: validation failures, network errors (use assertive)

**Don't announce:** focus-managed changes (modals, page transitions) — screen readers announce focus targets automatically.

## Hook style

```jsx
import { useAnnounce } from './plugins/announce/index.js'

function MyComponent() {
  const announce = useAnnounce()
  return <button onClick={() => announce('Done')}>Save</button>
}
```

## Implementation

Two always-in-DOM regions with auto-clearing (~1 second after announcement). Duplicate messages re-announce reliably (clear-then-set cycle). All screen readers tested (NVDA, JAWS, VoiceOver, TalkBack).
