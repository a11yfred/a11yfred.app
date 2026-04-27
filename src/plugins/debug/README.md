# debug (`src/plugins/debug/`)

Dev-only diagnostic tools for keyboard focus, announcements, and deployment status. All components render nothing in production — they guard themselves with `IS_DEV` checks (hostname is `localhost` or `127.0.0.1`).

Zero production dependencies. Copy the folder into any React/Vite project and mount `<FocusDebugger />` at the app root.

---

## Exports

| Export | Type | Description |
| ------ | ---- | ----------- |
| `FocusDebugger` | component | KB focus toast + element flash on every focus event |
| `DeployBanner` | component | Fixed bottom-left banner showing active deployment target |
| `AiDebugToast` | component | Toast for AI assist on/off toggle (project-specific addon) |
| `useAiDebugToast` | hook | State + timer logic for `AiDebugToast` |
| `DebugHelp` | component | Full command reference panel triggered by `debug help` |
| `DebugLauncher` | component | FAB + spotlight input for projects without a built-in command field |

---

## Usage

```jsx
import { FocusDebugger, DeployBanner, AiDebugToast, useAiDebugToast, DebugHelp } from './plugins/debug'
import { Announcer } from './plugins/announce'

function App() {
  const { toast, fading, fire } = useAiDebugToast()
  const [devAllEnabled, setDevAllEnabled] = useState(true)
  const [deployTarget, setDeployTarget] = useState(null)
  const [debugHelpOpen, setDebugHelpOpen] = useState(false)

  return (
    <>
      <div className="dev-toast-stack">
        <AiDebugToast state={toast} fading={fading} />
        <FocusDebugger enabled={devAllEnabled} />
        <Announcer devEnabled={devAllEnabled} />
      </div>
      <DeployBanner target={deployTarget} />
      <DebugHelp open={debugHelpOpen} onClose={() => setDebugHelpOpen(false)} customCommands={[...]} />
    </>
  )
}
```

---

## A11y Testing Commands

Type these in the search bar (live search on) or submit them (live search off). All commands clear the search field when fired.

| Command | Effect |
| ------- | ------ |
| `debug help` | Show the full command reference panel |
| `debug all on` | Enable KB focus toast + announce toast visualization |
| `debug all off` | Disable KB focus toast + announce toast visualization |

---

## Deployment Commands

These commands control the `DeployBanner` — useful for checking banner appearance during local development.

| Command | Banner text |
| ------- | ----------- |
| `debug deploy off` | Deploying OFF |
| `debug deploy on` | Deploying to Netlify (active target alias) |
| `debug deploy netlify` | Deploying to Netlify |
| `debug deploy pages` | Deploying to GitHub Pages |
| `debug deploy vercel` | Deploying to Vercel |

---

## Custom Commands

Anything project-specific is wired up in the application layer and passed to `DebugHelp` via the `customCommands` prop. These are not part of the plugin itself.

**Example — A11yTextHelper:**

| Command | Where | Effect |
| ------- | ----- | ------ |
| `debug skeleton` | Search bar | Show skeleton loading state (uses app's own loading state hook) |
| `debug ai assist on` | Search bar | Enable AI assist + show AI toast |
| `debug ai assist off` | Search bar | Disable AI assist + show AI toast |
| `debug ai assist on` | Revision Notes (Detail Panel) | 2 s fake load, appends note to both fields |
| `debug ok` | Revision Notes | 1.2 s fake load, typewriter placeholder text |
| `debug wrong` | Revision Notes | Trigger generic Revision Failed error |
| `debug 401` | Revision Notes | Trigger invalid API key error |
| `debug 429` | Revision Notes | Trigger rate limit error |
| `debug 503` | Revision Notes | Trigger service unavailable error |
| `debug network` | Revision Notes | Trigger network error modal |

---

## Components

### `FocusDebugger`

Shows a blue toast pill whenever keyboard focus moves. Two rows:

1. HTML tag + up to 2 CSS classes of the focused element
2. `:focus` outline check (✓/✗) · `:focus-visible` match (✓/✗)

Also briefly flashes the focused element with a teal overlay so you can spot it visually.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `enabled` | boolean | `true` | Set `false` to suppress (e.g. after `debug all off`) |

### `DeployBanner`

Fixed, bottom-left, pointer-events none. Shows which deployment target is active.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `target` | `'netlify' \| 'pages' \| 'vercel' \| 'off' \| null` | — | `null` = hidden |

### `AiDebugToast` + `useAiDebugToast`

Project-specific addon. Shows a green toast when AI assist is toggled on/off via a debug command.

```jsx
const { toast, fading, fire } = useAiDebugToast()
// fire('on')  → "AI Assist ON ✓"
// fire('off') → "AI Assist OFF ✗"
```

### `DebugHelp`

Full command reference panel. Pass project-specific sections via `customCommands`.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `open` | boolean | Whether the panel is visible |
| `onClose` | fn | Called when the X button is clicked |
| `customCommands` | `[{ heading, rows: [{ cmd, desc }] }]` | Project-specific command sections |

### `DebugLauncher`

Floating Action Button (bottom-right corner) + spotlight-style command input. Intended for projects that don't have a built-in search or command field.

A pill-shaped floating button with a hex-bolt icon and a "debug tool" label. Clicking it opens a centered dark spotlight input styled to match the debug toasts. Commands are submitted with Enter; Escape or the X button closes it. A hint reads "Type `help` to get started…"

**File-level configuration** — edit the two constants near the top of `DebugLauncher.jsx`:

```js
const ENABLED  = false         // set true to show the FAB
const POSITION = 'bottom-right'
```

Supported positions: `bottom-right`, `bottom-left`, `bottom-center`, `top-right`, `top-left`, `top-center`, `middle-right`, `middle-left`.

Both constants can also be overridden at mount time via props (useful for A/B or per-environment wiring without editing the file).

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `enabled` | boolean | `ENABLED` constant | Show the FAB and spotlight |
| `position` | string | `POSITION` constant | FAB placement |
| `onCommand` | fn(cmd) | — | Called with the submitted command string |

---

## CSS

All styles live in `debug.css` in this directory. `FocusDebugger.jsx` imports it, so mounting `FocusDebugger` activates the stylesheet for all other debug components automatically.

The `.dev-toast-stack` container should be placed in your app root:

```html
<div class="dev-toast-stack">
  <!-- AiDebugToast, FocusDebugger, Announcer -->
</div>
```
