# About This Build

A11yFred started as a clipboard tool. Type an accessibility defect ID, copy the description and remediation, paste it into a bug report. That's the whole pitch. But somewhere along the way it became a peculiar little project.

---

## The Easter Eggs

### Silly Languages

Type `pirate`, `pig latin`, `klingon`, or `valyrian` into the search box and the entire UI switches to that language. Every label, button, heading, and WCAG explanation changes to match. The pirate locale calls its theme section "The Ship's Hull." The settings panel is "Captain's Quarters." These don't persist to localStorage (you'd be annoyed if you came back the next day and couldn't read the app), so they vanish the moment you save settings or refresh.

To switch back, type `pig latin off`, `pirate off`, `klingon off`, or `valyrian off` into the search bar, or just save any setting.

The logic for detecting Easter egg input is intentionally asymmetric: if live search is on it fires while you type; if live search is off, it only fires when you hit the search button. That way you can think before committing to Klingon.

Any active search results and the open detail panel are preserved when an Easter egg fires. You don't lose your work.

### Party Mode

There's a theme called Party. It generates a random accessible color palette on every activation: six semantic color tokens derived from a random hue, computed in HSL so the foreground/background contrast ratios are always at least 4.5:1. While active, every button click plays a sound (a small synthesized blip via the Web Audio API), and typing generates confetti. The confetti and sounds are suppressed when `prefers-reduced-motion` is set.

The party palette is generated fresh each time you switch to it. No two sessions look the same. Type `party mode off` to restore the Auto theme.

---

## Feature Highlights

### Dialogs, Sheets, and Drawers Stay in the Viewport

The settings panel is a Drawer that slides in via CSS `translateX`. Any Dialog (formerly Modal) or Sheet opened from within the Drawer could render in the wrong position: sometimes offscreen, sometimes overlapping incorrectly. The root cause is a CSS quirk: `position: fixed` is calculated relative to the nearest transformed ancestor, not the viewport. Once an ancestor has a `transform`, it becomes the containing block. The fix was `createPortal`, rendering every Dialog and Sheet directly at `document.body`, outside the Drawer's transform context entirely.

### Sheet Swipe Gesture

On mobile, you can drag the Sheet (bottom panel) down and release to dismiss it. The gesture only activates if the touch starts within the top 56px of the panel (the chrome area with the handle and close button). During the drag, the sheet translates downward in real time with no CSS transition. If the drag delta exceeds 100px when the finger lifts, the sheet closes. Otherwise it snaps back.

It's about 40 lines of touch event handling. It works like native iOS bottom sheets because it's doing exactly what native iOS bottom sheets do: tracking Y position, translating, checking threshold.

---

## The Reset Confirmation Threshold

When you edit a defect description and then hit Reset, the app checks whether your edits are significant enough to warrant a confirmation modal. It runs a Levenshtein edit distance calculation and compares the result against the original string length. If more than 70% of the original has been changed, you get a "are you sure?" prompt. Minor typo fixes reset silently.

---

## 50+ Languages, Including Some You've Probably Never Heard Of

The app ships UI translations for 50+ languages. The obvious ones (Spanish, French, German, Japanese, Chinese) are there. But also:

- **Palawa kani**: a reconstructed language for Tasmanian Aboriginal peoples, developed from records of seven extinct languages
- **Nāhuatlahtōlli**: Classical Nahuatl, the language of the Aztec empire
- **Nêhiyawêwin**: Plains Cree, written in Canadian Aboriginal Syllabics
- **Diné bizaad**: Navajo
- **Anishinaabemowin**: Ojibwe
- **Ruáingga**: Rohingya. This one gets a special warning modal when selected, because the Rohingya people have endured genocide and forced displacement, the translation was AI-generated without native speaker review, and that's worth naming directly.

Activating a language changes the entire app, not just the chrome. The corpus entries (defect titles, descriptions, remediations) load a locale-specific overlay at runtime. English keywords are preserved on each record in a hidden field so that typing "button" in the Japanese locale still finds the right defects. This enables cross-language Fuse.js search.

### Language Capitalization Philosophy

Across 50+ locales the app follows language-appropriate title case conventions rather than applying one rule everywhere. English variants (en, en-GB, en-AU, en-IN, en-ZA) and Filipino (tl) use NYT-style title case for headings and labels. Romance and Germanic languages follow sentence case (capitalizing only the first word and proper nouns), which is the grammatically correct convention for those languages. Scripts that don't have a capitalization distinction at all (Japanese, Korean, Chinese, Arabic, Uyghur, Tamil, Devanagari-script languages) are left untouched.

### Right-to-Left Layout

Two locales, Palestinian Arabic (`ar-PS`) and Uyghur (`ug`), are right-to-left scripts. When either is active the app sets `document.documentElement.dir = "rtl"` and the entire layout mirrors: the settings drawer slides in from the right instead of the left, the back chevron points the other way, the selected-chip border radii flip corners, and the toggle thumb repositions. All of it is CSS-driven via `[dir="rtl"]` overrides co-located with their base rules. A `useDir` plugin hook gives any component that needs to make structural decisions in JS a reactive `dir` value to work from.

---

## Accessibility Details

### Overlay Aria Hiding

When any overlay is open (Drawer, Sheet, or Dialog), the app automatically sets `aria-hidden="true"` on every sibling of the overlay via `useAriaHide` hook. It uses a `data-overlay-aria-hidden` attribute as a marker to track which elements were hidden, so it can restore exactly those elements when the overlay closes. This prevents screen reader users from navigating to content beneath an open overlay.

---

## Architectural Choices Worth Noting

The app uses hash-based routing with no library dependencies. The routes `#/` and `#/settings` are the only valid routes, and route changes are just `window.location.hash` assignments. The `<a href="#/settings">` pattern keeps the Back button and accessibility tree working without any framework magic.

All theming is done with CSS custom properties, not inline styles or CSS-in-JS. A single `tokens.css` file defines every color, spacing step, and radius. Dark mode is a `[data-theme="dark"]` attribute toggle; Party Mode swaps a handful of those tokens at runtime by writing directly to `document.documentElement.style`. No full style recalculation required.

The corpus translation overlay system is designed so that when the app eventually moves to Supabase (Phase 2), only `dataService.js` changes. Everything else (the search hook, the UI, the translation cache) stays the same.

The AI provider abstraction in `aiService.js` follows the same pattern: one `getAiRefinement(provider, key, payload)` function dispatches to provider-specific implementations. Adding a new provider means adding one case, not changing call sites.

Dev-only tools are all guarded by an `IS_DEV` check (`hostname === 'localhost'`) and render nothing in production. They're extracted into a self-contained debug plugin that can be dropped into any React project.

### 404 for Unknown Routes

The router provides primitives (`useRouter`, `useRouteMatch`, `Route`) but not a 404 concept. The 404 check (`const isNotFound = !KNOWN_ROUTES.has(route) && !entryMatch`) is app-level logic in `AppContent`, using the router's `route` value against a local `Set` of valid paths. Anything not in that set renders a `NotFoundPage` with a "Back to Home" link. It's a few lines of app code, not a router plugin feature, and it's intentionally kept that way. The set of valid routes is app-specific, not something a portable router should own.

### Framework packages

A11yFred is built on the ulam accessibility framework, developed alongside the app. Each package has a barrel export. See [ULAM.md](ULAM.md) for full documentation.

- **@ulam/ube** (v0.3.0): UI component library: ButtonText, Dialog, Drawer, Sheet, FormInputSearch, FormInputWithClear, Screen, and 15+ others. Pure CSS with minimal dependencies.
- **@ulam/taho**: ARIA live region announcer. Call `announce(message)` from anywhere. Announcer React component in `@ulam/taho/react`.
- **@ulam/sili** (v0.3.0): Focus management: OverlayManager for orchestrating Dialog/Sheet/Drawer transitions, focus trap, return focus, aria-hide, escape key handling.
- **@ulam/calamansi** (`src/calamansi/`): i18n, locale-aware hooks, and text utilities.
- **@ulam/halohalo** (`src/halohalo/`): AI integration layer with connectivity checks.
- **@ulam/sawsawan** (`src/sawsawan/`): Integration bridge wiring the packages together.
- **@a11yfred/rogers** (`tools/rogers/`): Dev-only a11y diagnostics: focus debugger, names debugger, heading map, tab stops, deploy banner. Renders nothing in production.
- **@a11yfred/neighbor** (`tools/neighbor/`): ESLint and Stylelint a11y rules including ARIA nuance rules and ulam-specific patterns.

---

Built by Mikey Ilagan.
