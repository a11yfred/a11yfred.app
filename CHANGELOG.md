# Changelog

All notable changes to A11yFred are documented here.

## May 17, 2026 -- Phase 2A Complete (Sessions 4-6)

### Session 6: Form controls accessibility with aria-disabled pattern and keyboard prevention

**Refactoring:**

- Extracted keyboard interaction prevention into reusable `useAriaDisabledKeydown` hook
- Migrated Select and Toggle components from HTML `disabled` attribute to `aria-disabled`
- This keeps disabled controls in tab order while preventing activation via Space/Enter keys
- Consolidated aria-disabled CSS rules with proper selector specificity ordering

**Component updates:**

- **Select.jsx**: Added `onMouseDown` handler to prevent dropdown opening on disabled controls
- **Toggle.jsx**: Uses new hook for keyboard prevention; maintains visual toggle appearance when disabled
- **useAriaDisabled.js** (new): Centralized Space/Enter key prevention logic for reusability

**CSS improvements:**

- Form controls (input, textarea, select) show consistent disabled state: reduced opacity, disabled cursor, gray text
- Toggle role="switch" inputs excluded from generic opacity reduction to maintain toggle appearance
- Prevented hover state changes on disabled toggles with `:not([aria-disabled="true"])` selector
- Restored keyboard focus outline for disabled form controls (accessibility requirement)
- Suppressed mouse focus-visible styling on disabled controls while preserving keyboard focus

**Settings form validation:**

- Added provider selection validation with error message display
- Fixed API key validation to use optional chaining for safety
- SettingsSectionAi now shows provider error message when required provider not selected
- Improved model select logic: shows "N/A" when provider has no available models

**Accessibility benefits:**

Disabled elements remain keyboard-focusable and in tab order, following WCAG recommendations for aria-disabled. Users can tab to disabled fields and see focus indicator, but cannot activate them via keyboard or mouse.

---

## May 14, 2026 (Session 4)

### Refactoring: Platform label extraction

**Code organization:**

- Created `src/utils/labelFormatters.js` with extracted label formatters
- Extracted `getPlatformLabel()` and `getViewAllPlatformLabel()` utility functions
- Replaced inline ternary chains with centralized label formatting

**Naming improvements:**

- Renamed `platform_` to `platformParam` in `App.jsx` for clarity

---

## May 12, 2026

### Lint clean pass (zero JS errors, zero CSS errors, zero MD errors)

**JS fixes:**

- `ulam-rules.js`: Added `useCallback` and `useMemo` to `SAFE_PARENT_CALLS`; eliminates false positives on `no-announce-in-render` for callbacks inside `useCallback`
- `ulam-rules.js`: Fixed traversal logic so nested setState callbacks inside JSX event handlers no longer bail out early
- `A11yPanelSettings.jsx`: Fixed undefined export (`export default A11yPanelSettings` now resolves correctly via `const A11yPanelSettings = SettingsPanel`)
- `useCompletion.js` / `useProviderConfig.js`: Replaced `useRef` lazy init pattern with `useState` initializer function; eliminates `react-hooks/refs` errors (reading `ref.current` during render)
- `UlamMenu.jsx`: Escaped `app's` apostrophe as `app&apos;s`
- `useFindingSearch.js`: Removed stale `eslint-disable react-hooks/exhaustive-deps` comment
- `findingSearchService.js`: Renamed unused `searchKey` parameter to `_searchKey`
- `Announcer.jsx`: Added targeted disable comment for intentional mount-once `useEffect`
- `useRouter.js`: Fixed eslint-disable namespace (`neighbor/` to `@a11yfred/neighbor/`)
- `App.jsx`: Fixed disable namespace for `no-announce-in-render` on fiesta callback

**CSS fixes:**

- `UlamMenu.css`: Updated media query to range notation (`width >= 600px`)
- `ui.css`: Added comprehensive `@media (prefers-reduced-motion: reduce)` and `@media (prefers-reduced-transparency: reduce)` blocks covering all flagged selectors
- `InputSearch.css`: Added `prefers-reduced-transparency` block; fixed `no-descending-specificity` by reordering `:focus-visible` and `:disabled` before `:hover:not(:disabled)`
- `index.css`: Renamed "Adobo plugin styles" comment to "rogers plugin styles"

**Stylelint rule improvement:**

- `neighbor-stylelint.mjs`: `ulam/user-preferences` rule now scans for existing prefers overrides in the same file and suppresses warnings when a selector is already covered; eliminates false positives when proper fallback blocks exist

**Markdown fixes:**

- `rogers-scope.md`: Added blank lines around all headings and lists, fixed table separator notation, added `text` language to fenced code block

---

## May 11, 2026

### ulam framework structure

Extracted and organized the `@ulam` monorepo packages alongside the app:

- `@ulam/halohalo`: AI connectivity layer (provider config, completions, connectivity check)
- `@ulam/calamansi/relevance`: relevance scoring and finding search logic
- `@ulam/sawsawan`: runtime-agnostic storage adapters (localStorage, sessionStorage, memory)
- `@a11yfred/neighbor`: ESLint and Stylelint plugin with custom accessibility lint rules
- `tools/neighbor/` and `tools/neighbor-stylelint.mjs`: lint rule implementations

Platform adapter pattern added to `sawsawan` so storage works across browser, extension, and Electron contexts without import changes.

---

## May 9, 2026

### Doc cleanup and distribution plan

Removed `EXTENSION-TODO.md`, `FIREFOX-EXTENSION-TODO.md`, and `ELECTRON-TODO.md` from main. All three already live on their respective feature branches and do not belong on main. Archived `i18n-edits.md` and `corpus-mapping-a11y-to-acc.md` to `docs/archive/`.

Added a detailed "Extension and Electron distribution" section to `TODO.md` under Phase 2 Infrastructure.

### Admin panel and UI polish

Fixed bloated corpus count in the admin panel (now shows Public and Legacy dataset tabs independently). Restyled admin panel using the app's UI library. Moved WCAG filter pending note directly below the filter description. Removed excess `margin-bottom` from About panel feature body paragraphs. Fixed AI revision checkbox double-spacing. Combined sort row and actions row into a single `results-actions-row`. Linked footer "Mikey Ilagan" to mikey.fyi. Fixed sponsored tile contrast. Added desktop collapse button to BottomSheet. Contrast audit verified all five severity badge pairs pass.

### AI connectivity check and overlay detector

Added AI connectivity check to AdminPanel: live ping to configured provider with status indicator. Added overlay detector utility that flags common accessibility overlay scripts on the tested page.

---

## May 8, 2026

### App renamed from A11yTextHelper to A11yHelper

All references updated across 89 files: `package.json`, `index.html`, `App.jsx`, all 64 locale JSON files, all docs, extension manifests, Electron builder config, and plugin/script files.

---

## May 7, 2026

### Personal corpus: full normalization pass (169 entries)

Completed a structured quality pass on all 169 personal corpus entries covering titles, descriptions, and suggested fixes.

**Title qualifier normalization (7 entries):** Canonical forms established: "Missing" (not "Lacks", "Has No", "Exposes No"), "Not Programmatically Determined" for state/value failures, "Not Programmatically Associated" for label relationship failures, "Not Exposed" for AT-visibility failures.

**Desc normalization (5 passes, ~40 entries):** Defect-first order (system as subject), removed speculative language, removed requirement statements from `desc`, consistent WCAG terminology (focus order, focus indicator, SC X.X.X), AT names imply platform, they/them pronouns, "on-screen" hyphenated.

**Fix normalization (4 passes, ~35 entries):** Replaced "Ensure X." openers with direct imperatives, replaced hedging "should", replaced population-level "the user" with "users", removed "note that" constructions.

**SC cross-reference keyword injection (9 entries):** SC numbers cited in desc or fix are now added as keywords for cross-referencing in search.

**A `/corpus-guide` route is planned for Phase 2** to document entry structure, title conventions, desc/fix writing rules, severity model, and contributing guide.

---

## May 6, 2026

### UI library complete decoupling and panel unification

All 6 core UI components in `src/components/ui/` are now completely decoupled from app-specific dependencies:

- **BackButton.jsx**: replaced `useDir()` router hook with `dir` prop (default: 'ltr')
- **DataError.jsx**: removed `useT` import; all strings now props; added `onMount` callback
- **NoResults.jsx**: removed `useT` import; all strings now props; added `onMount` callback
- **Field.jsx**: removed `useT` import; all button labels and ARIA strings now props
- **InputWithClear.jsx**: added `clearIcon` prop; `clearAriaLabel` now required
- **SourceLinks.jsx**: removed `useT` import; added `singleHeading` and `multipleHeading` props
- **PanelShell.jsx**: added `dir` prop for RTL support

Created `src/components/ui/Panel.jsx` to unify the panel pattern across HelpPanel, AboutPanel, SettingsPanel, and DetailPanel. Merged duplicate `.help-header`/`.about-header`/`.settings-header` into `.panel-header`, same for title classes. Removed ~40 lines of duplicate CSS.

### ESL-friendly and plain language content updates

Simplified About panel text for non-native speakers. Removed em dashes throughout all user-facing content (replaced with periods, commas, or colons). Added Oxford commas to all multi-item lists.

### Ko-fi removal and GitHub Sponsors integration

Removed Ko-fi widget and all related CSS tokens, i18n keys, and media queries. Added GitHub Sponsors link in the footer.

### Terminology standardization

- "Remediation" → "Suggested Fix" across all UI, i18n, export utilities, and documentation
- "Agentic Mode" → "Match Existing Style (Agentic AI)"
- "Prioritize" → "Rank Results" in onboarding and help text
- "Sort Priority" → "Ranking Controls" in settings
- "Results" (search/list context) vs. "Findings" (individual items) distinction confirmed intentional
