# Changelog

All significant changes to A11yTextHelper, newest first.

---

## 2026-04-23 — Router plugin, focus management, corpus rename, font migration

### Router plugin (`src/plugins/router/`)

- New self-contained hash-routing + focus-management plugin; zero deps beyond React
- `Router` / `useRouter` — hash-based SPA routing; `navigate(path)` sets `window.location.hash`; `hashchange` event drives re-renders; browser Back button works natively
- `OffCanvas` — slide-in panel with trigger-focus save/restore, Escape handler, `inert` attribute when closed, and built-in `useFocusTrap`
- `useFocusOnMount` — returns a ref; on mount, calls `.focus()` on the attached element (for headings with `tabIndex={-1}` and modal close buttons)
- `useReturnFocus` — saves `document.activeElement` on mount, restores it on unmount; handles "return to trigger" for all panel and modal close events
- `useFocusTrap` — restricts Tab / Shift+Tab to a container while `active`; cycles wrap-around; skips elements inside `[inert]` subtrees; used by `OffCanvas` internally
- `useMediaQuery` — reactive `window.matchMedia` wrapper; re-renders on breakpoint change
- `src/plugins/router/README.md` — full plugin documentation with focus-management rules and SPA integration guide
- `src/plugins/router/index.js` — exports all hooks and components from a single entry point

### Settings as page / off-canvas panel

- `src/App.jsx` — wraps `<Router>`; uses `useRouter` and `useMediaQuery` to render settings as a full-page replacement on desktop (≥ 768px) or as an off-canvas slide from the left on mobile
- `src/App.jsx` — `navigate('/settings')` / `navigate('/')` replaces the previous modal toggle; browser Back button closes settings automatically
- Modal classes and `<SettingsModal>` wrapper removed; SettingsPanel renders as a plain block

### Focus management

- `src/components/DetailPanel.jsx` — `useFocusOnMount` added; defect title `<h2>` receives `ref={titleRef}` and `tabIndex={-1}`; focus moves here whenever a result is selected so keyboard and screen reader users don't have to hunt for new content
- `src/components/SettingsPanel.jsx` — `useFocusOnMount` on Settings heading; `useReturnFocus` restores focus to the ⚙ button on close

### Font scale — final token migration

- `src/index.css` — `html { font-size: 100% }` (revised from 14pt); respects user's browser font-size preferences (WCAG 1.4.4); rem base is typically 16px
- `src/tokens.css` — font scale reduced from 7 tokens to 4: `--fs-small` (0.75rem/12px), `--fs-body` (1rem/16px), `--fs-sub` (1.125rem/18px), `--fs-heading` (1.5rem/24px); old `--fs-xs/sm/base/md/lg/xl/2xl` removed
- `src/App.jsx` — h1 uses `clamp(1.75rem, 10.5vw, 2.667rem)`; fills ~85% of a 390px screen, caps at ~32pt on desktop; does not use a token (unique one-off)
- `src/components/DetailPanel.jsx` — all literal `fontSize: 11/13/14/18` replaced with `var(--fs-small/body/sub)`
- `src/components/SettingsPanel.jsx` — all `var(--fs-xs/sm/base/md)` replaced with `var(--fs-small/body/sub)`

### Corpus rename

- `src/data/defects.json` renamed to `src/data/mikeys-corpus.json`; Mikey's personal corpus is never exposed in the public deployment
- `src/data/corpus.json` created as a placeholder for the public/generic corpus with a single example entry documenting the schema
- `src/services/dataService.js` — import updated to `mikeys-corpus.json`

---

## 2026-04-23 — Branding, settings overhaul, accessibility pass, and UX polish

### Settings overhaul

- `src/components/SettingsPanel.jsx` — three `<h3>` section headers added: **Search**, **Appearance**, **AI Assist**; each visually separated with a top border
- `src/components/SettingsPanel.jsx` — theme moved from footer button to Appearance section; `ThemeChip` component renders Light / Auto / Dark radio inputs styled as pill chips; `<fieldset>`+`<legend class="sr-only">` for screen reader grouping
- `src/components/SettingsPanel.jsx` — `theme` and `onThemeChange` props added; all font-size values migrated to `var(--fs-*)` tokens
- `src/App.jsx` — theme state now supports `'auto'` (default); `useEffect` resolves to light/dark via `prefers-color-scheme` and adds a media query listener so the UI updates instantly if the OS theme changes while Auto is active
- `src/App.jsx` — footer theme toggle removed; `Footer` component no longer receives theme props

### Search input

- `src/components/SearchBar.jsx` — outer `<div>` replaced with `<search aria-label="Defect search">` (HTML5 search landmark)
- `src/components/SearchBar.jsx` — "Describe the defect" extracted from placeholder to a visible `<label htmlFor="defect-search">`; placeholder is now only the e.g. example text
- `src/components/SearchBar.jsx` — input `min-height: 3rem`, `padding: var(--space-3) var(--space-4)`, `font-size: var(--fs-md)` (14pt); text is vertically centered by default `<input>` behavior
- `src/components/SearchBar.jsx` — `outline: none` removed; border-color change on focus retained as a supplementary cue

### Accessibility

- `src/index.css` — global `:focus-visible` rule added: `2px solid var(--focus)`, `outline-offset: 2px`; applies to all interactive elements including inputs, textareas, and buttons
- `src/index.css` — `.sr-only` utility class added (clip-path, 1×1px, overflow hidden) for visually hidden accessible text
- `src/tokens.css` — `--focus: #5548c8` (light, 6.4:1 vs white) and `--focus: #a09ce8` (dark, 4.6:1 vs #111) tokens added
- `src/components/DetailPanel.jsx` — `outline: 'none'` removed from all input/textarea inline styles

### Contrast corrections

- `src/tokens.css` — `--text-faint` corrected from `#999999` (2.76:1, failing) to `#767676` (4.54:1, passing) in light mode
- `src/tokens.css` — `--text-faint` corrected from `#555555` (2.01:1, failing) to `#909090` (5.0:1, passing) in dark mode; hierarchy is preserved: --text-muted (#999) has higher contrast than --text-faint (#909) against the dark bg

### Typography and font size

- `src/index.css` — `html { font-size: 14pt }` sets the rem base; browser font-size preferences are respected (WCAG 1.4.4)
- `src/tokens.css` — all `--fs-*` tokens converted from `px` to `rem` (e.g. `--fs-md: 1rem` = 14pt); `body { font-size: var(--fs-md) }` unchanged

### Nothing Found empty state

- `src/components/ResultList.jsx` — `NoResults` component added; renders an SVG magnifying glass with dashed scan lines, a "No results for …" heading, and a search-tip paragraph; shown when `results.length === 0`
- `src/App.jsx` — `query={activeQuery}` prop passed to `ResultList` for the empty-state label

### Linting fixes (CSS)

- `src/index.css` — `rgba(…)` → `rgb(… / alpha)` (stylelint `color-function-alias-notation`)
- `src/index.css` — `(min-width: 768px)` → `(width >= 768px)` (stylelint `media-feature-range-notation`)
- `src/index.css` — deprecated `clip: rect(…)` removed from `.sr-only`; `clip-path: inset(50%)` is sufficient

---

## 2026-04-23 — Header redesign, footer, font, and contribution setup

### Header and footer

- `src/App.jsx` — header redesigned: title and subtitle centered, platform toggle moved below subtitle, settings gear anchored top-right via `position: absolute` so centering stays true; `<main>` wrapper added with `flex: 1`
- `src/App.jsx` — `Footer` component added: divider line, theme toggle left, "Made by Mikey Ilagan" credit center, "Fork on GitHub ↗" link right; theme toggle removed from header
- `src/index.css` — `.app-container` gains `display: flex; flex-direction: column` to support footer pinning

### Font stack

- `src/main.jsx` — self-hosted `@fontsource/noto-sans` (400/500/600/700) and `@fontsource/cantarell` (400/700) imported; no external CDN dependency
- `src/tokens.css` — `--font` updated to `'Noto Sans', 'Cantarell', 'Inter', 'Ubuntu', system-ui, -apple-system, sans-serif`; `--mono` adds `'Fira Code'`
- `package.json` — `@fontsource/noto-sans` and `@fontsource/cantarell` added as dependencies

### Title scale

- `src/App.jsx` — h1 uses `clamp(22px, 5vw, 32px)` for fluid scaling; subtitle upgraded to `--fs-md` / `--text-muted`

### Open source

- `LICENSE` *(new)* — MIT license, copyright Mikey Ilagan 2026
- `CONTRIBUTING.md` *(new)* — fork/clone/run instructions, defect entry schema, PR process, scope note on private corpus

---

## 2026-04-23 — CSS architecture: tokens, typography, and mobile-first layout

### Design tokens

- `src/tokens.css` *(new)* — all design tokens in one place: surface and text colors, accent, semantic (`--success`), priority badge colors (`--priority-critical-*` through `--priority-low-*`), font families, type scale (`--fs-xs` through `--fs-2xl`), spacing (`--space-1` through `--space-8`), border radius variants (`--radius-sm`, `--radius`, `--radius-full`)
- `src/index.css` — `:root` and `[data-theme="dark"]` blocks removed; now live in `tokens.css`

### Type scale utilities

- `src/typography.css` *(new)* — type scale utility classes (`.text-xs` through `.text-2xl`), weight utilities, color utilities, `.line-clamp-2` helper; components use inline styles today, classes available for gradual adoption

### Responsive layout

- `src/index.css` — `.app-container`: mobile base padding `var(--space-5) var(--space-4)` (1.25rem 1rem); at `≥ 768px` centers at `max-width: 720px` with `var(--space-8) var(--space-6)` padding; spacing references tokens throughout
- `src/index.css` — `.btn-icon`: 44×44px minimum tap target for icon-only buttons (WCAG 2.5.5)
- `src/App.jsx` — container uses `.app-container` class; icon buttons use `.btn-icon`; platform toggle padding bumped to `6px 12px` for touch comfort

### Build order

- `src/main.jsx` — CSS import order: `tokens.css` → `typography.css` → `index.css`

---

## 2026-04-23 — Project started

- Vite + React 18 + Fuse.js scaffold
- `src/data/defects.json` — 50 starter defect entries
- `src/services/dataService.js` — JSON data layer with migration stub
- `src/services/aiService.js` — AI provider abstraction; Anthropic (Claude) implemented, OpenAI / Google / Microsoft stubbed
- `src/hooks/useDefectSearch.js` — Fuse.js search with platform filter (`web` / `native` / `both`)
- `src/components/` — SearchBar, ResultList, DetailPanel, SettingsPanel
- Light/dark theme toggle with `localStorage` persistence and `prefers-color-scheme` default
- Platform toggle (Web / Native) in header
- AI assist toggle; API keys stored in `localStorage` only, never sent to any server other than the provider
- Location prefix field in DetailPanel — prepends site/page scope to defect description before copy
- Copy button with 2-second "Copied" feedback on description and remediation fields
- AI refinement: describe the change, Claude rewrites description and remediation in place
- `README.md` with setup, defect schema, and architecture docs
