# Recent Updates

Plain-language snapshots of what changed and why (by date). For detailed technical changes, see [CHANGELOG.md](CHANGELOG.md). For completed features by phase, see [DONE.md](DONE.md). For remaining work, see [TODO.md](TODO.md).

## May 23, 2026 -- Stability Fixes

Fixed a bug where the Settings Privacy sheet and the Details sheet opened again after you tried to close them. This happened because the app tried to match the URL before the close animation finished. We added checks to make sure the sheets stay closed.

## May 19, 2026 -- Framework Extraction & Cleanup (Session 9)

Completed @ulam framework extraction strategy: swipe/touch gestures moved to @ulam/sili (with React, Vue, Angular, and Remix 3 adapters); data export and relevance utilities kept in a11yfred as domain-specific features. Decision: @ulam provides accessibility infrastructure (focus management, keyboard handling, UI gestures, components); a11yfred provides domain-specific accessibility tooling. Removed export utilities from @ulam/ube, verified swipe gestures remain in @ulam/sili, pushed changes to origin.

---

## May 19, 2026 -- Quick-Win Features (Session 8b)

Added three high-value Phase 3 features in quick succession: keyboard hotkeys (`?` and `Ctrl+/`) to open Help panel from anywhere; print view styles (@media print) for clean audit report printing with formatted defect details; email sharing button to send defect via mailto with pre-populated subject and body. All linting clean; all pushed to origin.

---

## May 19, 2026 -- Cleanup & DRY Audit (Session 8)

Completed six-pass documentation and code audit: consolidated duplicate README content (status section, framework packages), fixed 18 stale component name references across DONE.md/TODO.md/REMIX-MIGRATION.md, fixed outdated file paths in CONTRIBUTING.md, removed redundant MAINTENANCE.md wrapper, consolidated LS_LAST_SELECTED constant to single source, and verified no framework code duplication (sawsawan/storage.js must remain local). All linting passes; build succeeds.

---

## May 19, 2026 -- Component Naming Convention & File Organization (Session 7)

Established App\* (15 framework wrappers) and A11y\* (18 custom) naming convention. Renamed 8 components, 7 config/utility files. Fixed 2 component reference bugs. All imports updated, linting passes, build succeeds. See [CHANGELOG.md](CHANGELOG.md) for technical details.

---

## May 18, 2026 -- Breaking Change Audit and README Updates

### ulam 0.3.0 Breaking Change Compliance

**Completed audit** of a11yfred against ulam 0.3.0 breaking changes:

**Component Migration:**

- All `FormControlInputSearch` → `FormInputSearch` (3 files)
- All `FormControlInputWithClear` → `FormInputWithClear` (4 files)
- All `Modal` → `Dialog` from @ulam/sili/react (already done)
- All `DataError`, `NoResults` to `Screen` with variants (already done)

**CSS Import Updates:**

- All `form-control-input*` imports to `form-input*` in component files

**ESLint Compliance:**

- Fixed missing `lazy` import in App.jsx
- Fixed Button to ButtonText in A11yDrawerPanelHelp.jsx
- Fixed Toggle to FormControlToggle in UlamMenu.jsx
- Removed unused FormControlCheckbox imports
- Prefixed unused parameters with underscore
- All 10 ESLint errors resolved, 1 warning remains (non-blocking)

**Documentation Updates:**

- Updated `src/components/ui/README.md` to reflect new component names and imports
- Updated component reference section: Modal to Dialog, BottomSheet to Sheet
- Added @ulam/sili/react package references in focus management hooks section
- Removed outdated DataError and NoResults documentation sections
- Updated Quick start imports to use current component names

## Major Changes

### Modal to Dialog Migration

**Change**: All `Modal` components updated to `Dialog` per upstream @ulam/sili changes.

**Impact**: Improved semantic accuracy and consistency with HTML `<dialog>` standards.

**Files Updated**:

- `src/App.jsx`: Updated pendingEntry and pendingPrivacy overlays
- All imports updated from `Modal` to `Dialog`

**No app-logic changes required** — dialog behavior is identical to modal.

### Screen Component Consolidation

**Change**: DataError and NoResults components removed. Using new `Screen` component from @ulam/ube.

**Impact**: Unified screen-state handling across the app. Single component for errors, empty states, and filters.

**Files Updated**:

- `src/App.jsx`: Error state now uses `Screen variant="error"`
- `src/components/A11yListResults.jsx`: No-results states now use `Screen variant="no-results"`

**Benefits**:

- Fewer imports and components
- Consistent API for all screen states
- Filter display and clear/settings actions built-in

### A11yOverlayManager Integration with OverlayManager

**Change**: `ManagerModalsSheets` renamed to `A11yOverlayManager` and moved to app level. Now uses @ulam/sili's `OverlayManager` as its base for focus management.

**Impact**: Automatic focus management across all overlay transitions (dialog ↔ sheet, sheet ↔ drawer, etc.).

**Files Updated**:

- `src/components/A11yOverlayManager.jsx`: New app-level overlay orchestrator
- `src/components/A11yDrawerPanelSettings.jsx`: Updated imports
- `src/App.jsx`: Centralized overlay management

**Benefits**:

- Automatic focus restoration on overlay close
- Focus management across 23 transition scenarios
- Page title management for sheets and drawers
- Per-overlay focus overrides available

### Improved Focus Management

**Change**: Overlays now implement WCAG 2.4.3 best practices for initial focus.

**Strategy**:

1. Focus heading with `tabIndex={-1}` (if present)
2. Fall back to first focusable element (buttons, inputs, etc.)
3. Fall back to container as last resort

**Special Override for a11yfred**:

- Privacy sheet: `initialFocusContainer={true}` (focuses container due to content-heavy panel)
- Reset sheet: `initialFocusContainer={true}` (focuses container for scrollable content)
- All dialogs: Use default (focus heading or first button)

**Files Updated**:

- `src/components/A11yOverlayManager.jsx`: Added initialFocusContainer overrides

### Component Naming Clarifications

**Change**: Better naming alignment with actual component purposes.

**Files Updated**:

- All references to "Modal" to "Dialog"
- All references to component names verified for accuracy

## Updated Dependencies

- @ulam/sili: 0.3.0 (Dialog component, OverlayManager enhancements, focus improvements)
- @ulam/ube: 0.3.0 (Screen component, DataError/NoResults removal)

## Migration Checklist

If you're updating a11yfred locally:

- [ ] Update imports: `Modal` → `Dialog`
- [ ] Update imports: `DataError`, `NoResults` → `Screen`
- [ ] Update `ManagerModalsSheets` imports to `A11yOverlayManager`
- [ ] Verify overlay transitions work (especially dialog → sheet → drawer)
- [ ] Test focus behavior with keyboard (Tab through overlays)
- [ ] Test with screen reader (verify focus announcements)
- [ ] Check return focus works correctly when closing overlays

## Testing Recommendations

### Keyboard Navigation

1. Open search, get no results
2. Verify focus is at a natural entry point (not forced to container)
3. Open a result details
4. Close details, verify focus returns to results
5. Open settings from results
6. Close settings, verify focus returns to results

### Screen Reader Testing

1. Open dialog: verify heading announcement
2. Tab through dialog buttons: verify labels
3. Close dialog with Escape: verify focus moved back
4. Open sheet, then dialog from sheet: verify focus on dialog heading
5. Close dialog: verify focus returns to sheet
6. Close sheet: verify focus returns to screen

### Overlay Transitions

- Dialog → Sheet: Sheet opens on top
- Sheet → Dialog: Dialog opens on top (dialog is higher layer)
- Drawer → Sheet: Sheet opens on top
- Any overlay → Same type: Previous closes, new opens (not stacking)

## Questions?

- **How do overlays work?**: See [A11yOverlayManager.jsx](src/components/A11yOverlayManager.jsx)
- **What changed in sili?**: See [@ulam/sili UPDATES](../ulam/UPDATES.md)
- **What changed in ube?**: See [@ulam/ube CHANGELOG](../ulam/packages/ube/CHANGELOG.md)
