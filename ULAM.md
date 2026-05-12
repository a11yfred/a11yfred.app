# ulam

Accessible React component framework. Named for the Filipino word for the dish that goes with rice — the meaningful part of the meal.

Purple-first. Keyboard-first. No external dependencies beyond React and your bundler.

---

## Packages

Each package is a named Filipino food term. Install with the `@ulam/` scope or use npm aliases to rename locally.

```text
ulam
├── UI Layer
│   ├── @ulam/ube            sweet   — components, tokens, theming, CSS
│   ├── @ulam/sili                   — headless focus primitives (vanilla JS)
│   ├── @ulam/siling-labuyo          — React router + focus hooks
│   └── @ulam/siling-mahaba          — Preact / vanilla adapter (planned)
│
├── Announce Layer
│   ├── @ulam/taho                   — headless ARIA live region core (vanilla JS)
│   ├── @ulam/taho-bayabas           — React adapter (Announcer, useAnnounce)
│   └── @ulam/taho-pandan            — Preact / vanilla adapter (planned)
│
├── Logic Layer
│   ├── @ulam/calamansi    sour    — i18n, hooks, utilities
│   └── @ulam/sawsawan     bridge  — wires all packages together
│
├── AI Layer
│   └── @ulam/halohalo               — AI service adapters, model config, prefs
│
├── Debug Layer
│   └── @ulam/meryenda        savory  — a11y debug panel, dependency-free
│
└── Linting
    └── @ulam/palaman                — ESLint + Stylelint a11y rules
```

---

## Dependency rules

The packages form a strict one-way graph. No cycles.

```text
palaman        ── zero runtime deps (dev-only linting tool)

sili           ── zero runtime deps (vanilla JS)
siling-labuyo  ── sili + react
siling-mahaba  ── sili (planned)

taho           ── zero runtime deps (vanilla JS)
taho-bayabas   ── taho + react
taho-pandan    ── taho (planned)

ube            ── sili + siling-labuyo + taho + taho-bayabas + react
calamansi      ── zero runtime deps
halohalo       ── zero runtime deps
meryenda          ── react only (no other ulam packages)

sawsawan       ── ube + calamansi + meryenda + halohalo (the only cross-importer)
```

Neither `ube`, `meryenda`, nor `calamansi` import from each other. `sawsawan` is the only package that wires them together.

---

## @ulam/ube — UI components

`src/components/ui/` · `src/tokens.css` · `src/app-tokens.css`

Accessible React component library. Every component meets WCAG 2.2 AA. Token-driven theming, 44px touch targets, RTL-aware layout, and motion-respectful animations built in.

**Components:** `Button`, `IconButton`, `ButtonLink`, `Toggle`, `RadioChip`, `Radio`, `Select`, `SearchInput`, `InputWithClear`, `Badge`, `Field`, `InfoBox`, `Panel`, `PanelShell`, `BackButton`, `NoResults`, `DataError`, `ResultListSkeleton`, `LinkTitle`, `SourceLinks`

**Tokens:** color, spacing (`--space-1` → `--space-10`), typography, motion, focus

**Theme:** `useThemeManager` — sets `data-theme` on `<html>`, supports dark / light / auto / fiesta

```jsx
import { Button, Toggle, SearchInput } from '@ulam/ube'
import '@ulam/ube/tokens.css'
import '@ulam/ube/ui.css'
```

See [src/components/ui/README.md](src/components/ui/README.md) for full component API.

---

## @ulam/sili — Headless focus primitives

`src/sili/`

Vanilla JS. Zero dependencies. The low-level layer everything else builds on.

| Module | Description |
|--------|-------------|
| `escapeKey` | Register / unregister an Escape keydown handler |
| `focusTrap` | Constrain Tab to a container while active |
| `ariaHide` | Set `inert` on background content while an overlay is open |
| `returnFocus` | Restore focus to a trigger element on cleanup |
| `scrollLock` | Prevent body scroll while an overlay is open |

```js
import { onEscapeKey } from '@ulam/sili'

const cleanup = onEscapeKey(() => closeModal())
// later:
cleanup()
```

---

## @ulam/siling-labuyo — React router + hooks

`src/siling-labuyo/`

Hash-based router and focus management hooks for React. Wraps `@ulam/sili` primitives in `useEffect` lifecycle.

**Router components:** `Router`, `Link`, `Route`, `Drawer`, `Modal`, `BottomSheet`

**Focus hooks:**

| Hook | Description |
|------|-------------|
| `useEscapeKey(active, handler)` | Escape handler, cleans up automatically |
| `useFocusTrap(ref, active)` | Restrict Tab to container |
| `useFocusOnMount(ref?)` | Move focus on mount (headings, modal open) |
| `useFocusOnChange(ref, dep)` | Move focus when a dependency changes |
| `useReturnFocus()` | Restore focus to trigger on unmount |
| `usePaginationFocus(ref, page)` | Re-focus heading on page change |
| `useAriaHide(ref, active)` | Background inert while overlay is open |

**Utility hooks:**

| Hook | Description |
|------|-------------|
| `useDir()` | Reactive `html[dir]` — `'ltr'` or `'rtl'` |
| `useMediaQuery(query)` | Reactive `window.matchMedia` |
| `usePageTitle(title)` | Sets `document.title = "App \| title"` |

```jsx
import { Router, Modal, useFocusTrap } from '@ulam/siling-labuyo'
```

---

## @ulam/taho — Headless ARIA live region core

`src/taho/`

Vanilla JS. Zero dependencies. Two always-in-DOM live regions with auto-clear and reliable duplicate re-announcement.

```js
import { announce } from '@ulam/taho'

announce('Settings saved')
announce('Error: invalid key', { priority: 'assertive' })
```

---

## @ulam/taho-bayabas — React announce adapter

`src/taho-bayabas/`

React wrapper for `@ulam/taho`. Mount `<Announcer />` once at the app root, then call `announce()` from anywhere.

```jsx
import { Announcer, useAnnounce } from '@ulam/taho-bayabas'

// Once at root:
<Announcer />

// Anywhere in the tree:
const announce = useAnnounce()
announce('Copy: Copied to clipboard')
```

**Message format:** prefix with context — `"Settings: Saved"` not `"Saved"`. Bare messages are ambiguous to screen reader users.

**Priority:** `'polite'` (default) waits for a natural pause. `'assertive'` interrupts immediately — use only for errors.

---

## @ulam/calamansi — i18n + utilities

`src/calamansi/`

Named for the iconic Filipino sour citrus — small, essential, full of character.

Data-agnostic i18n: pass any `{ key: value }` object as locale data. No opinions about loaders, caches, or source format.

```jsx
import { I18nProvider, useT } from '@ulam/calamansi'

<I18nProvider locale="en">
  <App />
</I18nProvider>

const t = useT()
t('hello', { name: 'Mikey' }) // → "Hello, Mikey"
```

- Interpolation, fallback to `en`, 59 production locale files included
- No dependency on `ube` or any other ulam package
- `usePref` — typed user preference hook backed by `@ulam/sawsawan` storage

See [src/calamansi/README.md](src/calamansi/README.md) for full API.

---

## @ulam/sawsawan — Integration bridge

`src/sawsawan/`

Named for sawsawan, the Filipino dipping sauce — no purpose alone, exists only to bring other things together.

The only package that imports from the others. Wires locale changes into `announce()`, sets `html[lang]` and `html[dir]`, and provides a runtime-agnostic storage adapter.

```jsx
import { useSawsawan } from '@ulam/sawsawan'

useSawsawan(locale, t, 'locale.switched')
```

**Storage adapter:** `useSawsawan` exposes a platform-agnostic key/value store. Works with `localStorage`, `sessionStorage`, or any injected backend — no direct storage calls in consumer packages.

See [src/sawsawan/README.md](src/sawsawan/README.md) for full API.

---

## @ulam/halohalo — AI layer

`src/halohalo/`

Named for halo-halo, the layered Filipino dessert — many things mixed together.

AI service adapters, model configuration, and user preference management. Zero runtime dependencies outside the host app's AI SDK.

| Module | Description |
|--------|-------------|
| `aiService` | Standard request/response AI calls |
| `agenticAiService` | Multi-step agentic AI calls |
| `models` | Model catalog and capability flags |
| `prefs` | User AI preferences (model choice, toggles) |
| `constants` | Shared AI-layer constants |

---

## @ulam/meryenda — A11y debug panel

`tools/meryenda/`

Named for the Filipino braised dish — deeply flavored, goes with everything.

The React Query DevTools of accessibility. Drop it into any project in dev mode. Zero dependencies beyond React — no other ulam packages required.

**Portable components (part of `@ulam/meryenda`):**

| Component | Description |
|-----------|-------------|
| `FocusDebugger` | Toast + flash overlay on every keyboard focus event. Shows element, `:focus` and `:focus-visible` status. |
| `NamesDebugger` | Cursor-following tooltip showing the accessible name of the hovered element and its source. |
| `TabStopsDebugger` | Recording mode — activate, then Tab through the page. Renders numbered circles + SVG connecting lines showing focus order. |
| `HeadingMapDebugger` | Overlays every heading with a color-coded level badge. Floating panel shows the full heading hierarchy. |
| `DebugLauncher` | FAB + two modes: clickable command menu, or spotlight text input (press `/`). `onCommand` prop hooks into any external input. |
| `DeployBanner` | Fixed bottom-left banner showing active deployment target. |
| `DebugHelp` | Full command reference panel. |

```jsx
import { FocusDebugger, TabStopsDebugger, HeadingMapDebugger, DebugLauncher } from '@ulam/meryenda'

// All components are dev-only and aria-hidden
{import.meta.env.DEV && <>
  <FocusDebugger enabled={devEnabled} />
  <TabStopsDebugger enabled={tabStopsEnabled} />
  <HeadingMapDebugger enabled={headingMapEnabled} />
  <DebugLauncher enabled onCommand={runCommand} />
</>}
```

All styles live in `debug.css` — self-contained, high-contrast dark, no ube token dependency.

See [tools/meryenda/README.md](tools/meryenda/README.md) for full API.

---

## @ulam/palaman — Linting

`palaman/`

ESLint and Stylelint plugins enforcing the accessibility patterns that ulam components implement. Dev-only — no runtime footprint.

**ESLint — 31 rules across 3 adapters (JSX, Vue, Angular):**

- 22 errors: phantom controls, missing accessible names, broken ARIA patterns, mouse-only events, keyboard gaps
- 9 warnings: discouraged patterns with legitimate overrides (`role="application"`, `aria-roledescription`, `prefer-aria-disabled`, etc.)

**Stylelint — 2 rules:**

- `ulam/user-preferences` — motion, transparency, or alpha-channel colors without `@media (prefers-*)` fallbacks
- `ulam/no-outline-none` — bare `outline: none` outside `:focus` selectors

```js
// eslint.config.js
import palaman from '@ulam/palaman/eslint'
export default [palaman.configs.recommended]

// .stylelintrc.json
{ "plugins": ["@ulam/palaman"], "rules": { "ulam/user-preferences": true, "ulam/no-outline-none": true } }
```

See [tools/palaman/RULES.md](tools/palaman/RULES.md) for the full rule catalog with sources and rationale.

---

## Design principles

**Accessible by default.** Every component meets WCAG 2.2 AA. Keyboard navigation, focus management, and screen reader semantics are built in, not bolted on.

**Headless core, thin React wrapper.** `sili` and `taho` are vanilla JS. React packages are lifecycle wrappers — the logic is portable.

**Token-driven.** No hardcoded colors, sizes, or spacing in component code. Override a token, retheme everything.

**Mobile-first.** All CSS uses `min-width` breakpoints. Base styles target small screens; larger screens layer on top.

**Motion-respectful.** All animations and transitions are suppressed under `prefers-reduced-motion: reduce`.

**RTL-aware.** Direction-sensitive components respond to `html[dir="rtl"]` automatically.

**Zero cross-package dependencies.** `ube`, `calamansi`, and `meryenda` do not import from each other. `sawsawan` is the only wiring layer.

---

## Naming

All packages are named for Filipino food — the framework's origin story.

| Package | Food | Role |
|---------|------|------|
| ube | Purple yam — sweet, foundational | UI components |
| sili | Chili — small, sharp, essential | Focus primitives |
| siling labuyo | Bird's eye chili — tiny but powerful | React hooks |
| siling mahaba | Long green chili — mild adapter | Preact adapter |
| taho | Silken tofu — soft, structured | Live region core |
| taho-bayabas | Taho with guava — React flavored | React announce |
| taho-pandan | Taho with pandan — alternate flavor | Preact announce |
| calamansi | Sour citrus — essential accent | i18n + logic |
| sawsawan | Dipping sauce — brings it all together | Integration bridge |
| halohalo | Mixed dessert — many layers | AI layer |
| meryenda | Braised dish — savory, goes with everything | Debug panel |
| palaman | Sandwich filling — completes the stack | Linting |

---

## License

MIT
