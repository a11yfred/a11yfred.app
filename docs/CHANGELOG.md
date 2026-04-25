# Changelog

All significant changes to A11yTextHelper, newest first.

---

## 2026-04-24 — GitHub link, docs folder, disabled control styling, h1 focus fix

### Footer

- `src/App.jsx` — GitHub link updated from placeholder to actual repository URL: `https://github.com/mikeyil/a11ytexthelper`

### Docs reorganization

- `CHANGELOG.md`, `UPDATES.md`, `TODO.md`, `MAINTENANCE.md`, `CONTRIBUTING.md` moved to `docs/`; `README.md` stays at repo root (GitHub convention)
- `README.md` — contributing link and Docs table updated to reference `docs/` paths
- `docs/MAINTENANCE.md` — Docs section updated to reference `docs/` paths
- `docs/TODO.md` — "Create GitHub repo" and new resolved items moved to Resolved section

### Disabled form control consistency

- `src/tokens.css` — `--text-disabled` token added (light: `#b5b5b5`, dark: `#505050`); intentionally below 4.5:1 — disabled controls are exempt per WCAG 1.4.3
- `src/index.css` — `select:disabled { opacity: 1 }` added; overrides browser-applied opacity on disabled `<select>` so its border and text color are fully controlled by component styles
- `src/components/SettingsPanel.jsx` — provider `<select>` and API key `<input>` disabled text color changed from `var(--text-faint)` to `var(--text-disabled)`; both controls now show consistent text color and border when AI assist is off

### Focus ring

- `src/App.jsx` — `outline: none` added to h1 inline style; removes the focus-visible ring from the page title (programmatic focus target, not user-navigable)

---

## 2026-04-24 — Maintenance run: bug fixes and full checklist pass

### Bug fixes

- `src/App.jsx` — `typeahead` was never persisted to `localStorage`; initialized with hardcoded `true`; now reads `localStorage.getItem('typeahead') !== 'false'` on mount and a `useEffect` writes the value on every change
- `src/App.jsx` — `platform` was never persisted to `localStorage`; initialized with hardcoded `'web'`; now reads `localStorage.getItem('platform') || 'web'` on mount and a `useEffect` writes the value on every change
- `src/components/SettingsPanel.jsx` — privacy disclosure stated "four things in localStorage" and listed typeahead; corrected to five items with platform added: theme, platform, typeahead, active AI provider, API key(s)
- `src/components/SearchBar.jsx` — clear button `fontSize: 14` (raw px) replaced with `var(--fs-body)`
- `src/components/SettingsPanel.jsx` — back button `fontSize: 20` (raw px) replaced with `var(--fs-sub)`

### Maintenance checklist findings (2026-04-24)

- Build: clean, 76 kB total gzipped; vendor chunks confirmed (react 45 kB, fuse 9 kB, app 20 kB)
- `npm audit`: 2 moderate vulns in esbuild/vite (dev-server CORS, not production); fix deferred (requires Vite 8 breaking upgrade)
- `npm outdated`: all updates are major version bumps (React 18→19, Vite 5→8, ESLint 9→10); deferred
- `innerHTML`: none found
- `rel="noreferrer"`: verified on all `target="_blank"` links
- `localStorage` inventory: 5 keys confirmed after bug fix (theme, typeahead, platform, ai_provider, apikey_*)
- WCAG code checks: all aria-labels, landmarks, role/aria-checked, announce wiring, lang attr — passed
- Docs: all files verified current

---

## 2026-04-24 — Sweeps: accessibility, security, privacy, performance, SEO, code cleanup, docs overhaul

### Accessibility (WCAG 2.2)

- `src/components/DetailPanel.jsx` — imported `announce` from the announce plugin; copy buttons now call `announce('Defect description: Copied to clipboard')` and `announce('Possible remediation steps: Copied to clipboard')` on success (WCAG 4.1.3 Status Messages)
- `src/components/DetailPanel.jsx` — reset buttons now call `announce('Defect description: Reset to original')` and `announce('Possible remediation steps: Reset to original')` (WCAG 4.1.3)
- `src/components/DetailPanel.jsx` — close button (×) gained `className="btn-icon"`; now meets the 44×44px minimum touch target requirement (WCAG 2.5.5)
- `src/tokens.css` — dark mode priority badge token overrides added: `--priority-critical/high/medium/low-text/bg` now have dark-mode values that pass ≥ 4.5:1 contrast (badge text on badge bg) and ≥ 3:1 (badge bg on card bg)
- `src/tokens.css` — `@media (prefers-contrast: more)` block added; increases `--text-muted`, `--text-faint`, `--border-control`, and `--border` in both light and dark themes (WCAG 1.4.6)
- `src/index.css` — `body { font-size: var(--fs-md) }` corrected to `var(--fs-body)`; `--fs-md` was never defined so body text was silently falling back to the browser default without the correct token

### Token system cleanup

- `src/tokens.css` — full rewrite with shorthand hex throughout (`#ffffff` → `#fff`, etc.) to satisfy the `color-hex-length` stylelint rule
- `src/tokens.css` — stale comment referencing `ResultList.jsx migration is tracked in TODO.md` removed; migration is now complete
- `src/tokens.css` — spacing comment updated to remove the inaccurate `14pt base` reference

### Priority badge colors — migration complete

- `src/components/ResultList.jsx` — removed hardcoded `PRIORITY_COLORS` JS object; component now reads `var(--priority-*-text)` and `var(--priority-*-bg)` directly; dark mode automatically applies via the new token overrides

### Security

- `netlify.toml` *(new)* — Netlify configuration with security response headers: `Content-Security-Policy` (restricts scripts to `self`, styles to `self` + Google Fonts, connect to `self` + four AI provider APIs), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disables camera, microphone, geolocation, payment)
- `netlify.toml` — SPA fallback redirect (`/*` → `/index.html` 200) for hash router compatibility on hard reload and direct links

### Privacy

- `src/components/SettingsPanel.jsx` — privacy disclosure expanded; now lists all four `localStorage` keys (theme, typeahead, provider, API keys) explicitly and states that no personal data, usage data, or corpus content is collected or transmitted
- `public/robots.txt` *(new)* — `Disallow: /` blocks all crawlers on the dev Netlify deployment; replace with a permissive file before Phase 3 launch
- `public/` *(new directory)* — created as the Vite static assets root

### Performance

- `vite.config.js` — `build.rollupOptions.output.manualChunks` added; splits React/React-DOM (`react` chunk) and Fuse.js (`fuse` chunk) into separately cached vendor chunks; reduces re-download size on app updates

### SEO (all commented out — dev deployment)

- `index.html` — full SEO block added inside an HTML comment: `<meta name="description">`, Open Graph (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:locale`, `og:site_name`), Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`), JSON-LD `WebApplication` structured data, canonical link, sitemap link reference
- `index.html` — `<meta name="robots" content="noindex, nofollow">` active for the dev deployment
- `index.html` — `<meta name="theme-color">` added for light and dark themes (progressive enhancement; Chrome/Edge/Safari mobile only — Firefox ignores gracefully)
- `index.html` — `<!-- <link rel="icon"> -->` placeholder commented in for favicon; create `public/favicon.svg` to activate

### Code cleanup

- `src/index.css` — `.modal-overlay`, `.modal-content`, `@keyframes slide-up`, and the `@media (prefers-reduced-motion)` override for the modal animation were all dead code left over from the settings modal; removed
- `src/typography.css` — scale utilities rewritten; old classes (`.text-xs/sm/base/md/lg/xl/2xl`) referenced the removed 7-token scale; replaced with `.text-small/body/sub/heading` aligned to the current 4-token system
- `src/App.jsx` — stale `/* TODO: update href … */` comment removed from footer; the GitHub link TODO is tracked in `TODO.md`
- `src/App.jsx` — verbose focus-management comment on the settings `useEffect` condensed to one line

### Docs

- `README.md` — complete rewrite: corrects `defects.json` → `mikeys-corpus.json`, expands project structure to include `plugins/` and `public/`, adds plugin sections (router, announce), updates deployment section to cover Netlify as the primary target with GitHub Pages as an alternative, adds build and plugin documentation
- `TODO.md` — full overhaul: all shorthand/paraphrased items expanded into complete actionable statements; new **AI Agent Support** section added with 6 items covering tool use, multi-turn conversation, and model selection; **Internationalization** section expanded and re-tagged; 16 new items resolved and moved to the Resolved section; redundant or duplicate items consolidated
- `CHANGELOG.md` — this entry
- `UPDATES.md` — plain-language entry added for this session

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
