# A11yFred Completed Work

Persistent record of completed features, fixes, and improvements. This is complementary to [UPDATES.md](docs/UPDATES.md) (recurring snapshots of work by date) and [CHANGELOG.md](docs/CHANGELOG.md) (technical changes). See [TODO.md](TODO.md) for remaining work.

---

## Phase 1: Core App (Complete)

### Accessibility

- [x] Announce copy and reset actions — `announce()` called on copy/reset with screen reader feedback (WCAG 4.1.3 Status Messages)
- [x] A11y fixes — label associations, keyboard navigation on result list, dialog ARIA, Escape key via document listener
- [x] Focus trap — `useFocusTrap` hook restricts Tab to open modals and panels (WCAG 2.1.2)
- [x] Result-click focus management — DetailPanel h2 gets `useFocusOnMount`; focus moves there on every selection
- [x] Settings focus management — heading focus on open; trigger-button focus restored on close
- [x] DetailPanel close button touch target — 44×44px minimum (WCAG 2.5.5)
- [x] Focus ring — global `:focus-visible` rule using `--focus` token (6.4:1 light, 4.6:1 dark)
- [x] Text contrast — all body text ≥ 4.5:1; `--text-faint` corrected for WCAG 1.4.3
- [x] Font size base — `html { font-size: 100% }` (browser default); inherits browser font size preferences (WCAG 1.4.4)
- [x] SR-only utility — `.sr-only` class for visually hidden content (e.g., radio legend)
- [x] `prefers-contrast: more` support — token overrides for increased contrast in both light and dark themes
- [x] Dark mode priority badge colors — contrast ratios verified (≥ 4.5:1 text on badge background)
- [x] Skip links — LinkSkipTo component with "Skip to Main Content" navigation landmark

### Design & Layout

- [x] Design token system — `tokens.css` with colors, spacing, typography, shadows, focus states
- [x] Typography file — `typography.css` with 4-token scale (`--fs-small/body/sub/heading`)
- [x] Font scale simplified — 7 tokens → 4; h1 uses `clamp(1.75rem, 10.5vw, 2.667rem)`
- [x] Mobile-first layout — `.app-container` class, 768px tablet breakpoint, responsive breakpoint structure
- [x] Touch targets — `.btn-icon` 44×44px minimum, platform toggle padding bumps for mobile
- [x] Semantic HTML — `<search>` wrapper on SearchBar, `<section>` on NoResults, `<fieldset>`/`<legend>` on theme chips
- [x] `theme-color` meta tags — light and dark values set; tints browser chrome on Chrome/Edge/Safari mobile
- [x] Icon sizing — gear 22px, close 24px (iOS-appropriate scale)
- [x] Nothing Found state — styled empty state with SVG magnifying-glass illustration and search tips
- [x] Empty state before search — pre-search and no-results states use unified Screen component with actionable guidance
- [x] Settings mobile bottom sheet — slides up from bottom, drag handle, Escape dismissal

### Code Quality & Architecture

- [x] Priority badge colors migrated to CSS tokens — `PRIORITY_COLORS` JS object removed; component reads `var(--priority-*-text/bg)`
- [x] Font token migration — all inline literal px values replaced across all components
- [x] Typography utility classes updated — 4-token system; stale 7-token references removed
- [x] `body { font-size }` bug fixed — `var(--fs-md)` corrected to `var(--fs-body)`
- [x] Dead modal CSS removed — `.modal-overlay` and `.modal-content` cleaned up
- [x] Router plugin — `src/plugins/router/` with hash routing, OffCanvas, useFocusOnMount, useReturnFocus, useFocusTrap, useMediaQuery
- [x] Settings as own page / off-canvas panel — desktop: full-page swap; mobile: slide-in from left; Back button closes
- [x] Toggle component extracted — reusable across AI assist, typeahead, and other boolean toggles
- [x] Linting — ESLint 9 + jsx-a11y + react-hooks + Stylelint + `@axe-core/react` fully passing

### Features

- [x] Search functionality — Fuse.js full-text search with keyword, SC, and platform matching
- [x] Result filtering — platform (web/native/both), WCAG level (A/AA/AAA), severity badges
- [x] Narrow mode — secondary search within results
- [x] Result list — ARIA listbox with keyboard navigation (j/k), selection, pinning, ranking
- [x] Detail panel — full defect view with description, remediation, related SCs, source links
- [x] WAI SC links — ScBadge in DetailPanel links to WCAG 2.2 Understanding pages
- [x] AI Assist (single-shot) — rewrite description/remediation using Anthropic API
- [x] AI loading state — animated spinner with aria-busy attribute; respects prefers-reduced-motion
- [x] Theme toggle — Light / Auto / Dark radio chips in Settings; Auto follows `prefers-color-scheme`
- [x] Typeahead toggle — on by default; off mode shows Search button and requires Enter/click
- [x] Model selection for agent mode — configurable in SettingsSectionAi; supports Anthropic, OpenAI, Google, Azure providers via @ulam/halohalo
- [x] Wire OpenAI provider — GPT-4o via /v1/chat/completions; integrated in @ulam/halohalo
- [x] Wire Google Gemini — Gemini API integrated in @ulam/halohalo with model selection
- [x] Wire Microsoft Copilot — Azure OpenAI endpoint integrated in @ulam/halohalo (SettingsSectionSearch)
- [x] Settings for search debounce/live search toggle — toggle in Settings to switch between live (instant) and on-demand (Enter key) search
- [x] Copy to clipboard — description and remediation with success announcement
- [x] Corpus — 106-entry public corpus (ACC prefix), fully sourced with 2+ references
- [x] Keyword audit — keywords array populated with synonyms and component names for search coverage
- [x] WCAG version tagging — wcagVersion field in corpus; displayed as badge on result cards and in DetailPanel
- [x] Internationalization — 65+ languages via @ulam/calamansi
- [x] PWA/Offline — Service Worker caching app shell and corpus JSON; fully functional without internet
- [x] Shareable defect URLs — hash routing with `#/entry/:id/:slug` for direct defect linking
- [x] How to use onboarding — CarouselOnboarding component with localStorage flag for first-visit modal
- [x] Bookmarks/favorites system — star icon on result cards; persist to localStorage; show starred section (PinnedSection) above results

### Privacy & Security

- [x] Content Security Policy — `netlify.toml` with restrictive CSP headers, X-Frame-Options, Referrer-Policy, Permissions-Policy
- [x] Privacy disclosure — SettingsPanel lists localStorage keys; states no personal/usage data collected
- [x] `robots.txt` — blocks crawlers on dev deployment (to be replaced before Phase 3)
- [x] `rel="noreferrer"` audit — all `target="_blank"` links have noreferrer

### Performance & Privacy

- [x] Font self-hosting — @fontsource/inter with latin-ext subsetting; replaces Google Fonts CDN

### Infrastructure

- [x] Vite vendor chunk splitting — React/React-DOM and Fuse.js in separate cached chunks
- [x] SPA redirect rule — `netlify.toml` includes `/*` → `/index.html` 200 redirect for hash router
- [x] SEO meta tags (prepared) — description, OG tags, Twitter Card, JSON-LD WebApplication schema (commented out for dev)
- [x] GitHub repository — initialized, public, linked to Netlify
- [x] Netlify deployment — connected, auto-deploy on push, production live at a11yfred.app
- [x] Umami analytics — privacy-first analytics script configured in index.html (zero cookies, no personal data)

---

## Phase 2: Code Quality & Hooks (Complete)

### Hooks & State Management

- [x] `useRouteHandler` hook — centralized route management, entry history, focus restoration (extracted 400+ lines)
- [x] `useSearchManager` hook — search state, filtering, sorting, URL sync (extracted 200+ lines)
- [x] `useAriaDisabledKeydown` hook — reusable keyboard prevention for aria-disabled controls

### Refactoring & Code Quality

- [x] App.jsx cleanup — reduced from 1336 to 730 lines (602 lines removed)
- [x] COMMANDS map consolidation — eliminated 18 if-statements in runCommand logic
- [x] Rating handlers factory — consolidated rating/archival/pinning handlers
- [x] Template formatting helpers — `countRatingsByField()`, `formatCountTemplate()`
- [x] URL parameter parsing — `getInitUrlParams()` utility extracted to storage.js
- [x] Platform announcements — unified formatting with i18n support

### Component Refactoring

- [x] A11yListResults split — extracted A11yListResultCard, ResultsMetaHeader, ResultsActiveFilterBar
- [x] A11yPanelSettings split — extracted SettingsSectionAppearance, SettingsSectionSearch, SettingsSectionAi
- [x] Label formatters extracted — `src/utils/labelFormatters.js` for reusable formatting logic
- [x] Related Entries upgrade — semantic HTML (`<section>`, `<h3>` headings)
- [x] Sources list upgrade — semantic HTML with proper heading structure
- [x] Entry terminology standardized — consistent naming across all components

### Accessibility Improvements

- [x] Form controls refactored — aria-disabled pattern instead of HTML disabled
- [x] Keyboard prevention — Space/Enter blocked on aria-disabled controls via onKeyDown
- [x] Disabled focus visibility — disabled controls remain focusable, show focus outline
- [x] Select/Toggle updates — use aria-disabled with mouse/keyboard handlers
- [x] Settings validation — provider selection, API key, model auto-population

### Documentation

- [x] README.md updated — Phase 2 completion, v0.1.0 release, Phase 3 direction
- [x] PRIVACY.md verified — storage keys, data handling accuracy
- [x] SECURITY.md verified — terminology, security practices
- [x] CHANGELOG.md expanded — detailed hook integration, optimization notes
- [x] Keyboard shortcuts documentation — documented in Help panel (j/k/s/e/u/Shift+↑/Shift+↓)

---

## Styling & Theming

- [x] Neighborly color theme — warm Mr. Rogers/Daniel Tiger palette, WCAG AA compliance verified (ready on feature/neighborly-theme branch)
- [x] Light/Dark mode support — token-based theming with prefers-color-scheme
- [x] High contrast support — `prefers-contrast: more` media query with enhanced token values
- [x] Reduced motion support — CSS transitions respect `prefers-reduced-motion: reduce`
- [x] Focus states — visible focus indicators meeting WCAG 2.4.7 standards

---

## Package & Framework Work

- [x] @ulam/ube — UI components, buttons, panels, inputs (20 reusable primitives)
- [x] @ulam/taho — ARIA live region announcer
- [x] @ulam/sili — focus management, modal/drawer handling, escape key
- [x] @ulam/calamansi — i18n, locale management
- [x] @ulam/halohalo — AI provider abstraction
- [x] @ulam/sawsawan — integration bridge
- [x] @a11yfred/neighbor — ESLint and Stylelint a11y plugins
- [x] @a11yfred/rogers — accessibility debug tools
- [x] Monorepo structure — scaffolded at mikeyil/ulam with npm package exports

---

## Component & UI Updates

- [x] Button unification — 5 types → 2 base (ButtonText, ButtonIcon)
- [x] Modal → Dialog migration — semantic HTML5 dialog element
- [x] DataError/NoResults → Screen consolidation — unified error/empty state component
- [x] ManagerModalsSheets → A11yOverlayManager refactor — centralized overlay management
- [x] Automatic focus restoration — across overlay transitions
- [x] Page title management — for overlays and route changes
- [x] Overlay z-order — fixed hierarchy: Screen(0) < Drawer(1) < Sheet(2) < Dialog(3)

---

## Recent Improvements (May 18)

### @ulam Framework v0.3.0 Breaking Change Compliance

- [x] @ulam/ube v0.3.0 component naming updates — migrated to semantic naming conventions
  - `FormControlInputSearch` → `FormInputSearch` (more precise: styles text inputs, not all form controls)
  - `FormControlInputWithClear` → `FormInputWithClear`
  - Form input CSS: `form-control-input*` → `form-input*`
  - CSS consolidation: merged `form-control-field.css` into `form-input.css`
  - All 7 component files updated
- [x] @ulam/sili v0.3.0 component naming — migrated to semantic HTML5 dialog semantics
  - `Modal` → `Dialog` (aligns with HTML `<dialog>` and ARIA `role="dialog"`)
  - `DataError`, `NoResults` → `Screen` with variants (`variant="error"`, `variant="no-results"`)
  - Focus management improvements: automatic focus strategy (heading → first focusable → container)
  - OverlayManager enhancements: orchestrates 23 transition scenarios with automatic focus restoration
- [x] Breaking change audit — comprehensive review of a11yfred against v0.3.0 changes
  - All component migrations verified and completed
  - ESLint compliance: 10 errors resolved to 0 errors
  - All imports updated across codebase
- [x] Documentation updates — UPDATES.md, CHANGELOG.md, README.md, docs/* all reflect v0.3.0 breaking changes
- [x] Markdown linting — all documentation passing markdownlint (0 errors)
- [x] Build verification — ESLint and npm run lint:js fully passing with 0 errors

---

## Documentation & Organization

- [x] README.md — project overview, quick start, structure, status
- [x] CHANGELOG.md — technical changes by date
- [x] UPDATES.md — plain-language work summaries by phase
- [x] CONTRIBUTING.md — contribution guidelines
- [x] TODO.md — roadmap organized by Phase with category tags
- [x] DONE.md (this file) — persistent record of completed work

---

## Known Completed Patterns

These patterns have been implemented and validated:

- Keyboard navigation in list components (ARIA listbox)
- Focus management for overlays (trap, restore, move)
- CSS token system (colors, spacing, typography, states)
- Form controls with aria-disabled pattern
- Semantic HTML structure (search, section, fieldset/legend)
- i18n integration (@ulam/calamansi)
- PWA service worker setup
- Privacy-first design (no tracking, transparent data handling)
- WCAG 2.2 AA compliance verification
- Responsive design mobile-first approach
- Dark/Light/High-contrast mode support
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
