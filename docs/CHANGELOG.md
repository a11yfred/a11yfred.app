# Changelog

All significant changes to A11yFred, newest first. Pre-launch history is in [docs/archive/prelaunch/CHANGELOG-prelaunch.md](archive/prelaunch/CHANGELOG-prelaunch.md).

Versions follow [Semantic Versioning](https://semver.org/). Each production deploy gets a version tag. Releases are batched -- at most one per day.

---

## 2026-05-16 -- Post-Launch Cleanup

### Component refactoring

- `A11yListResults.jsx` (869 lines) split into `A11yListResultCard.jsx`, `ResultsMetaHeader.jsx`, `ResultsActiveFilterBar.jsx`
- `A11yPanelSettings.jsx` (857 lines) split into `SettingsSectionAppearance.jsx`, `SettingsSectionSearch.jsx`, `SettingsSectionAi.jsx`, `SettingsModals.jsx`

### Code quality

- Label formatters extracted to `src/utils/labelFormatters.js` (`getPlatformLabel()`, `getViewAllPlatformLabel()`)
- Entry terminology standardized throughout codebase (replacing "finding" for corpus items)
- Context API consolidation completed (SettingsContext, SearchContext, RatingsContext removing ~140 prop slots)

### Theming and infrastructure

- Neighborly theme (warm Mr. Rogers/Daniel Tiger palette) completed on feature/neighborly-theme branch with full WCAG AA contrast compliance
- feature/ulam branch deleted; all @ulam packages now imported from npm only
- Verified mikeyil/ulam, a11yfred/neighbor, a11yfred/rogers repos are current with latest fixes
- v0.1.0 GitHub release created with CHANGELOG notes

---

## v0.2.0 -- 2026-05-14

### UI polish and icon updates

- Back-to-top button now uses `ArrowUp` icon (was `ChevronUp`)
- Skip-to-main and skip-to-next-result links now use `ArrowDown` icon (was `ChevronDown` SVG)
- `SkipLink.jsx` renamed to `LinkSkipTo.jsx`; function name, barrel export, and all three import sites updated
- Tertiary buttons with an icon no longer add left padding (`.btn--tertiary:has(.btn-icon) { padding-left: 0 }`)

### WCAG badge split

- WCAG version and conformance level are now separate badges (cyan = version, emerald = level)
- List view shows compact values (`2.1`, `AA`); detail panel shows full labels (`WCAG version: 2.1`, `Level: AA`)
- Both badges are filterable; clicking either filters to all entries with that tag
- New design tokens: `--wcag-level-bg`, `--wcag-level-text` (light + dark)

### Active filters and clear controls

- "Clear All Filters" button added to results toolbar and no-results state; uses `Trash2` icon
- Clearing filters no longer clears the search query or narrow results value
- Badge filter and URL sync now handles `wcag` and `wcag-level` types separately
- Narrow filter tag no longer shows "Narrow:" prefix

### Ranking and result interactions

- Archiving or unarchiving the last visible result now transitions colors in place instead of flying off screen
- Star active state: white icon and underline when starred; underline disappears on hover, icon stays white

### Settings panel

- Unstar All, Reset Rankings, and Unarchive All buttons now use the `OctagonX` icon (consistent with Stop Narrowing)

### Privacy modal (navigation context)

- When opening Privacy & Storage without a finding open, modal body now reads "Opening this will discard your collapsed panel and any unsaved changes."
- Buttons read "OK" / "Cancel" instead of "Open New Finding" / "Keep Current"

### Copy and label text

- All buttons: title case. All input labels: sentence case. All `aria-label` values: sentence case.
- Detail panel: "Include description title when copied" / "Include suggested fix title when copied" (sentence case, no period)

---

## v0.1.0 -- 2026-05-13

Initial public launch at a11yfred.app.

- 106-entry public corpus (ACC prefix), all linters passing, zero vulnerabilities
- Full search with narrow mode, badge filters, shareable URLs
- Ratings: rank up/down, star, archive, pin
- Detail panel with AI Assist (Anthropic, OpenAI, Google), Match Existing Style (Claude only)
- 65 languages; easter egg locale modes
- PWA / offline support
- Accessibility-first: WCAG 2.2 AA, full keyboard navigation, live regions, reduced motion
- Party Mode

---

## Pre-launch History

Development history from April 23 -- May 13, 2026, before the public launch. See [docs/archive/prelaunch/CHANGELOG-prelaunch.md](archive/prelaunch/CHANGELOG-prelaunch.md) for the full log.

**2026-05-13:** `@ulam/*` migration: all 6 packages published to npm (ube, taho, sili, calamansi, halohalo, sawsawan), ~45 vendor files removed from source, CSS class rename (`detail-*` to `panel-detail-*`), JSDoc audit, dependency updates. UI component library extraction complete: 20 portable components with zero app-specific dependencies, full button unification (5→2), cross-project reusability verified, monorepo published.

**2026-05-12:** Full lint clean pass -- zero JS, CSS, and Markdown errors.

**2026-05-11:** @ulam framework extraction: ube (20 components), taho (announcer), sili (focus/routing), calamansi (i18n), halohalo (AI), sawsawan (bridge). neighbor (lint rules) and rogers (debug tools) extracted separately. Monorepo structure (mikeyil/ulam) scaffolded.

**2026-05-10:** Multiple code quality and CSS refactor passes (mobile-first, token consolidation, dead code removal, i18n translate run across 59 locales).

**2026-05-09:** Corpus split (ACC public / ATH legacy / personal), UI polish pass, doc cleanup, distribution plan.

**2026-05-07:** Personal corpus full normalization pass (169 entries -- titles, descs, fixes, keywords).

**2026-05-06:** UI library decoupled from app logic, Panel component unified, deprecated StateButton/IconStateButton removed.

**2026-05-05:** Comprehensive code review, magic numbers extracted, UI component library finalized, agentic AI wired.

**May 1:** Corpus 100% sourced (2+ expert references per entry), platform badge filtering live.

**April 29:** Chrome extension, Firefox extension, and Electron scaffold on feature branches.

**April 28 -- April 24:** Badge filters, shareable URLs, export utility, user entries data layer, focus management, party mode, multi-language support, bottom sheet, debug tools, accessibility audit, initial build.
