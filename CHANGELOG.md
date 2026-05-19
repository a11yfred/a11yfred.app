# Changelog

All notable changes to A11yFred are documented here.

## May 19, 2026 -- Codebase Cleanup & DRY Audit (Session 8)

### Documentation Consolidation

#### Pass 1: Link Verification & Correction

- Fixed 18 stale component name references across DONE.md, TODO.md, REMIX-MIGRATION.md (A11yListResults -> AppScreenResults, A11yPanelSettings -> AppDrawerPanelSettings, etc.)
- Verified all markdown links are valid and point to existing files
- Updated CONTRIBUTING.md: fixed "src/components/ui/README.md" reference to README.md component naming section

#### Pass 2-3: Content Consolidation

- README.md: removed duplicate framework packages section (moved to ABOUT.md only)
- README.md: condensed status section from detailed descriptions to brief pointers to DONE.md/TODO.md
- README.md: removed redundant entry schema documentation (technical detail not needed in quick start)
- README.md: added documentation map table explaining purpose of each markdown file
- README.md: reduced from ~203 lines to 133 lines while maintaining clarity

#### Pass 4: Redundancy Removal

- MAINTENANCE.md: identified as redundant wrapper/index file duplicating MAINTENANCE-CHECKLIST.md guidance
- Moved MAINTENANCE.md to untracked archive (removed from tracked files)
- All maintenance guidance consolidated in MAINTENANCE-CHECKLIST.md and MAINTENANCE-WORKFLOWS.md

#### Pass 5-6: Accuracy & Consistency

- Verified UPDATES.md uses consistent plain-language summaries with CHANGELOG.md for detailed info
- Verified DONE.md serves as complementary archive to UPDATES.md, CHANGELOG.md, TODO.md
- Verified all doc cross-references match current file organization

### Code Quality & DRY Improvements

#### Constant Consolidation

- `hooks/useRouteHandler.js`: removed duplicate LS_LAST_SELECTED constant definition
- Imported LS_LAST_SELECTED from utils/constants.js (single source of truth)
- Verified all localStorage key names centralized in constants.js

#### Storage Abstraction

- `utils/storage.js`: verified re-exports storage functions from sawsawan/storage.js
- Added clarifying comment: "Storage helpers -- internal to @ulam/sawsawan but re-exported here for app use"
- Attempted consolidation: confirmed @ulam/sawsawan barrel export does NOT include storage functions
- **Decision**: sawsawan/storage.js must remain locally (not a duplication issue)

### Framework Code Audit

Comprehensive pass to ensure no inappropriate framework code duplication:

- Router logic: All using @ulam/sili/react hooks (useRouter, navigate) -- correct
- Focus management: All using @ulam/sili hooks (useFocus, returnFocus) -- correct
- Overlay handling: All using @ulam/sili components (Dialog, Sheet, Drawer) -- correct
- Announcements: All using @ulam/taho announce() -- correct
- Keyboard handling: App-specific handlers only (Enter to search, etc.) -- correct
- i18n: All using @ulam/calamansi useT() -- correct
- Storage: One necessary local copy (sawsawan/storage.js) due to export limitation

**Finding**: No significant framework code duplication found. One local copy necessary due to @ulam/sawsawan export constraints.

### File Archival

- `test-phase2.sh`: moved to untracked archive (deprecated Phase 2 testing guide from commit 7303c21)
- No longer referenced anywhere; superseded by current integration testing in useRouteHandler and useSearchManager

### Quality Assurance

- ESLint: 0 errors, 0 warnings
- Stylelint: 0 errors
- Markdownlint: 0 errors
- Build: successful, no warnings
- Git: clean working directory

---

## May 19, 2026 -- Component Naming & File Reorganization (Session 7)

### Component Naming Convention Established

**Purpose**: Distinguish framework-wrapping components (App*) from custom a11yfred components (A11y*), making codebase intent immediately clear.

**Naming rules:**

- **App* prefix** (15 components) — wrap or compose @ulam framework components (ButtonIcon, LinkSkipTo, Panel, Dialog, Sheet, etc.)
- **A11y* prefix** (18 components) — custom to a11yfred, not simple framework wrappers (ResultAd, FiestaSparkles, SettingsSectionAi, etc.)

**Component renames for consistency:**

- AppPanelDetail → AppSheetDetail (uses Sheet, clarifies interface type)
- AppPanelAdmin → AppDrawerPanelAdmin (consistent with AppDrawerPanel* naming)
- A11yTileAd → A11yResultAd (semantic context: ad in results)
- ResultsActiveFilterBar → A11yResultsActiveFilterBar (custom a11yfred component)
- A11yAppTitle → A11yTitle (cleaner naming)

**CSS file renames:**

- user-preferences.css → a11y-user-prefs.css (custom user preference overrides)
- app-panel-detail.css → app-sheet-detail.css
- app-panel-admin.css → app-drawer-panel-admin.css

**Config and utility file renames:**

- ai-config.js → config-ai.js
- i18n-locales.js → locales-i18n.js
- rtl-locales.js → locales-rtl.js
- theme.js → theming.js

**Documentation:**

- Added "Component naming convention" section to README.md with examples and rationale
- All 33 components now follow strict two-tier naming (App\* vs A11y\*)

### Linting & Quality Checks

**Fixed issues:**

- AppScreenResults: A11yListResults → AppScreenResults (self-reference in PinnedSection)
- AppScreenResults: A11yListResultCard → AppListResultCard (corrected component reference)

**Verification:**

- All imports and references updated across codebase
- ESLint: 0 errors, 0 warnings
- Stylelint: 0 errors
- Markdownlint: 0 errors
- Build: successful
- All 33 components follow naming convention

---

## May 18, 2026

### Breaking change compliance: ulam 0.3.0

**Component migration:**

- FormControlInputSearch to FormInputSearch (UlamMenu.jsx, A11yInputSearchHero.jsx, ResultsMetaHeader.jsx)
- FormControlInputWithClear to FormInputWithClear (A11yInputSearchHero.jsx, A11yPanelDetail.jsx, ResultsMetaHeader.jsx, UlamMenu.jsx)
- Form input CSS imports updated: `form-control-input*` to `form-input*`

**ESLint errors resolved (10 to 0):**

- Added missing `lazy` import in App.jsx
- Fixed Button to ButtonText in A11yDrawerPanelHelp.jsx
- Fixed Toggle to FormControlToggle in UlamMenu.jsx
- Removed unused FormControlCheckbox imports from A11yOverlayManager.jsx and A11yTextareaCopyable.jsx
- Prefixed unused parameters with underscore: viewAllDontAsk, onViewAllDontAskChange in A11yOverlayManager.jsx

**Documentation updates:**

- `src/components/ui/README.md`: Updated component references (Modal to Dialog, BottomSheet to Sheet)
- Added @ulam/sili/react package references for focus management hooks
- Removed outdated DataError and NoResults documentation sections
- Updated Quick start example imports to current component names

---

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
- `useEntrySearch.js`: Removed stale `eslint-disable react-hooks/exhaustive-deps` comment
- `entrySearchService.js`: Renamed unused `searchKey` parameter to `_searchKey`
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
- `@ulam/calamansi/relevance`: relevance scoring and entry search logic
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
- "Results" (search/list context) vs. "Entries" (individual items) distinction confirmed intentional
