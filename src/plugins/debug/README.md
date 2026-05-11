# @ulam/adobo

Vanilla-first accessibility debug panel with a thin React wrapper. The savory layer of the [ulam](../../../docs/ulam.md) framework.

The React Query DevTools of accessibility. Drop it into any project, see focus, names, and contrast in real time.

## Packages

Adobo is one of four ulam packages:

```text
ulam
├── @ulam/ube          sweet   — UI, components, CSS, theming, router, announce
├── @ulam/calamansi    sour    — i18n, hooks, utilities, logic
├── @ulam/adobo        savory  — a11y debug panel, vanilla-first  ← you are here
└── @ulam/sawsawan     bridge  — wires the three together
```

## Architecture

Vanilla-first: core inspection logic has no framework dependency. React is a thin mount/unmount wrapper.

```text
@ulam/adobo
├── core/       vanilla JS — focus detection, accessible name computation (planned)
├── overlay/    vanilla JS + HTML/CSS panel UI, self-contained dark styles (planned)
└── react/      thin React wrapper — useEffect calls init/destroy
```

Current state: React components live here before the vanilla extraction happens. The boundary is documented so the refactor is a move, not a rewrite.

## Exports (portable — part of @ulam/adobo)

| Export | Description |
| ------ | ----------- |
| `FocusDebugger` | Keyboard focus toast + element flash on every focus event |
| `NamesDebugger` | Cursor-following tooltip showing accessible name of hovered element |
| `DeployBanner` | Fixed bottom-left banner showing active deployment target |
| `DebugHelp` | Full command reference panel triggered by `debug help` |
| `DebugLauncher` | FAB + spotlight input for projects without a built-in command field |

## App-specific exports (not part of @ulam/adobo)

These live in this folder but are a11yhelper-specific:

| Export | Description |
| ------ | ----------- |
| `AiDebugToast` | Toast for AI assist toggle (wired to a11yhelper AI service) |
| `useAiDebugToast` | State + timer logic for AiDebugToast |
| `AdminPanel` | Admin corpus management panel (a11yhelper data wiring) |

## Debug commands

Type in the search bar (live search on) or submit (live search off):

| Command | Effect |
| ------- | ------ |
| `debug help` | Show the full command reference panel |
| `debug all on` | Enable focus toast and announce visualization |
| `debug all off` | Disable focus toast and announce visualization |
| `debug names on` | Show accessible name tooltip on hover |
| `debug names off` | Hide accessible name tooltip |

## Components

### `FocusDebugger`

Shows a blue toast pill on every keyboard focus event. Displays HTML tag + CSS classes of focused element, plus `:focus` and `:focus-visible` status checks.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `enabled` | boolean | Show or suppress the toast |

### `NamesDebugger`

Cursor-following tooltip showing the accessible name of the element under the pointer, plus the source (`aria-label`, `aria-labelledby`, `label[for]`, `alt`, text content, etc.).

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `enabled` | boolean | Show or hide the tooltip |

### `DeployBanner`

Fixed bottom-left, pointer-events none. Shows active deployment target.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `target` | `'netlify' \| 'pages' \| 'vercel' \| 'off' \| null` | `null` = hidden |

### `DebugHelp`

Full command reference panel. Pass project-specific sections via `customCommands`.

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `open` | boolean | Whether the panel is visible |
| `onClose` | function | Called when closed |
| `customCommands` | `[{ heading, rows: [{ cmd, desc }] }]` | Project-specific sections |

### `DebugLauncher`

Floating action button (bottom-right) + spotlight command input for projects without a built-in command field.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `enabled` | boolean | `false` | Show the FAB |
| `position` | string | `'bottom-right'` | FAB placement |
| `onCommand` | function | — | Called with submitted command string |

## CSS

All styles live in `debug.css`. Mounting `FocusDebugger` activates the stylesheet for all other debug components.

Adobo CSS is self-contained and opinionated (dark, high contrast). No ube token dependency — looks the same regardless of host app theme.

## Future: Fork to @ulam/adobo

At fork time, the vanilla extraction happens first:

1. Move core DOM inspection logic to `core/` as plain JS
2. Move overlay panel UI to `overlay/` as vanilla HTML/CSS
3. React wrapper in `react/` calls `adobo.init()` / `adobo.destroy()`
4. Ships as both a script tag drop-in and an npm package

## License

MIT
