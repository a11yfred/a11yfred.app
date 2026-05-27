# Accessibility Audit & Implementation Document

This document outlines the accessibility strategies, architecture, and standards used to design, build, and test A11yFred. As an accessibility audit tool, A11yFred aims to exceed WCAG 2.2 Level AA compliance.

---

## 1. Core Accessibility Features

### Focus Management & Trapping (`@ulam/sili`)

- All overlays (Settings drawer, Onboarding sheet, Detail dialogs) use `@ulam/sili` for automatic focus management.
- **Initial Focus Strategy (WCAG 2.4.3)**: When an overlay opens, focus is directed to:
  1. The primary heading (`tabIndex={-1}`) so screen readers announce the panel context.
  2. The first interactive control if no heading exists.
  3. The container itself (using `initialFocusContainer={true}`) for content-heavy or scrollable screens (e.g., the Privacy policy sheet).
- **Focus Restoration**: Closing an overlay automatically restores focus to the triggering element.
- **Tab Trapping**: Active dialogs contain keyboard focus, preventing users from accidentally tabbing into background content.

### Skip Links & Keyboard Landmarks (WCAG 2.4.1)

- A skip link (`<LinkSkipTo href="#main-content">`) is positioned at the top of the DOM. It is visually hidden but slides into view on focus.
- Main sections are wrapped in semantic landmarks (`<header>`, `<main>`, `<aside>`, `<footer>`) to allow screen reader users to jump between page areas.

### Live Announcements (`@ulam/taho`)

- State changes (such as search results filtering, copying findings, pinning/unpinning items, and resetting text) trigger polite live region announcements using `@ulam/taho`.
- Announcements are pulled dynamically from translated keys to support RTL and multilingual speech output.

### Interactive Controls & `aria-disabled`

- Custom form controls use `aria-disabled="true"` rather than the native `disabled` attribute to keep them discoverable in the tab sequence (helping keyboard-only users inspect form structure).
- Action blocks (like Enter/Space keydown and click event listeners) are intercepted and stopped via `useAriaDisabled` when the control is disabled.
- Focus rings on disabled elements are styled with a dashed border to denote they are focusable but inactive.

---

## 2. Visual & Motion Adaptations

### Media Query Fallbacks

- **`prefers-reduced-motion`**: All transitions and canvas sparkle effects respect system-level motion preferences, reverting to instant jumps when motion is reduced.
- **`prefers-reduced-transparency`**: Overlays and modal backdrops replace semi-transparent styling with high-contrast opaque background colors when transparency is disabled.

### High Contrast & High Contrast Mode (HCM)

- Stylesheets use CSS Custom Properties for all color tokens.
- We implement `@media (forced-colors)` media queries (via `@a11yfred/neighbor` linter compliance) to ensure borders and outlines remain visible when Windows High Contrast Mode is active.

---

## 3. Testing Methodology

- **Automated Scanning**: Automated audits are performed before each release using `@axe-core/react` and ESLint static analysis.
- **Keyboard-only Validation**: The entire app flow (Search -> Filter -> Inspect -> Copy -> Reset -> Settings -> Close) is validated using only the Tab, Enter, Space, Escape, and arrow keys.
- **Screen Reader Verification**: Tested manually using NVDA (Windows) and VoiceOver (macOS/iOS) to verify route transitions, title changes, focus redirection, and announcement polite cues.
