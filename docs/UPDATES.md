# Updates

Plain-language record of what changed and why. For technical details see `CHANGELOG.md`.

---

## 2026-05-16 -- Post-Launch Cleanup

Large component refactoring pass completed: `A11yListResults` (869 lines) split into `A11yListResultCard`, `ResultsMetaHeader`, and `ResultsActiveFilterBar`; `A11yPanelSettings` (857 lines) split into `SettingsSectionAppearance`, `SettingsSectionSearch`, `SettingsSectionAi`, and `SettingsModals`. Label formatters extracted to `src/utils/labelFormatters.js`. Entry terminology standardized throughout codebase. Neighborly theme (warm Mr. Rogers/Daniel Tiger palette) completed on feature/neighborly-theme branch with full WCAG AA contrast compliance. feature/ulam branch deleted; all @ulam packages now imported from npm only. v0.1.0 GitHub release created with release notes.

---

## v0.2.0 -- 2026-05-14

### Icon and navigation polish

The back-to-top button now uses an upward arrow instead of a chevron, and both skip links (Skip to Main Content, Skip to Next Result) use a downward arrow. These are clearer directional cues than chevrons.

The `SkipLink` component was renamed to `LinkSkipTo` throughout -- file, function name, barrel export, and all imports -- to match how it was already being used everywhere.

### WCAG version and level as separate badges

WCAG version (`2.1`, `2.2`) and conformance level (`A`, `AA`, `AAA`) now show as separate color-coded badges instead of a combined one. Cyan for version, emerald for level. Clicking either filters the list to all entries with that attribute. The detail panel shows the full label ("WCAG version: 2.1", "Level: AA") while the list view stays compact.

### Clear All Filters

A "Clear All Filters" button with a trash icon now appears in the results toolbar and on the no-results screen. It clears badge filters and exits narrow mode but does not touch your search query or narrow input value. All filters clear properly now -- an earlier bug where badge filters were not cleared has been fixed.

### Starred result appearance

When a result is starred, the star icon and the underline indicator are white (same as the purple active state used by rank buttons). The underline disappears on hover so you can tell you're hovering, but the star icon stays white.

### Last-item archive animation

Archiving or unarchiving the last visible result in the list no longer animates it flying off screen. It just transitions the colors in place, which looks much cleaner when there is only one item.

### Settings panel stop icons

The Unstar All, Reset Rankings, and Unarchive All buttons in the Settings panel now use the same stop/octagon icon as the Stop Narrowing button. Consistent visual language for destructive/reset actions.

### Text casing

All buttons are now title case. All input labels are sentence case without a trailing period. `aria-label` values are sentence case. The OK button in modals is all-caps OK.

---

## v0.1.0 -- 2026-05-13

Initial public launch at a11yfred.app. 106-entry public corpus, full search and filter, AI Assist, 65 languages, PWA/offline, WCAG 2.2 AA, Party Mode.

---

## Pre-launch History

**2026-05-13:** Framework packages (`@ulam/*`) published as npm (ube, taho, sili, calamansi, halohalo, sawsawan), ~45 vendor files removed from source. Component and hook renames. exceljs replacing xlsx (security). BOM cleanup. PWA icons. UI component library extraction to npm complete: 20 portable components (zero app-specific dependencies), button unification (5 types → 2 base), cross-project reusability audited, monorepo scaffolded.

**2026-05-12:** Full lint clean pass -- zero JS, CSS, and Markdown errors across all three linters.

**2026-05-11:** `@ulam` framework extracted into standalone packages: `ube` (UI components), `taho` (announcer), `sili` (focus/routing), `calamansi` (i18n), `halohalo` (AI), `sawsawan` (bridge). `neighbor` (lint rules) and `rogers` (debug tools) extracted separately. Monorepo structure scaffolded at mikeyil/ulam.

**2026-05-10:** Multiple code quality passes -- mobile-first CSS refactor, token consolidation, dead code removal, full i18n translate run across 59 locales.

**2026-05-09:** Corpus split into public (ACC) and legacy (ATH) datasets. UI polish, doc cleanup, distribution plan for extension/Electron targets.

**2026-05-07:** Personal corpus full normalization pass: title, desc, fix, and keyword standards applied across 169 entries.

**2026-05-06:** UI component library fully decoupled from app logic. Panel component unified. Deprecated button components removed.

**2026-05-05:** Comprehensive code review and refactor. Agentic AI (Match Existing Style) wired. UI component library finalized.

**May 1:** Corpus 100% sourced with 2+ expert references per entry. Platform badge filtering live.

**April 29:** Chrome extension, Firefox extension, and Electron desktop app scaffolded on feature branches.

**April 28 -- April 24:** Badge filters, shareable search URLs, export utility, user entries data layer, focus management, party mode, multilingual support (10 languages at the time), bottom sheet panel, debug tools, initial build.
