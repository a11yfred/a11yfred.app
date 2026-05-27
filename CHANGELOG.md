# Changelog

All notable technical changes to this project will be documented in this file.

## [Unreleased] - 2026-05-27

### Added

- **Infinite Scroll Chunking:** Implemented `IntersectionObserver` in `AppScreenResults.jsx` to render large lists in chunks of 50, preventing DOM lag during "View All" mode.
- **Search Debouncing:** Added a `useDebounce` hook to delay Fuse.js execution by 250ms while typing, significantly improving main thread responsiveness.
- **Lazy Loading:** `AppSheetDetail` is now lazy-loaded using `React.lazy()` and `<Suspense>`, keeping heavy markdown and AI components out of the initial bundle.
- **Search History Backend:** Added `searchHistory` state to `useAppSearch` and `useSearchManager`; records last 10 unique queries to `localStorage` on submit.
- **Audit Report Builder:** New `ContextReport` context, `useAppReport` hook (`addDefect`, `removeDefect`, `updateDefect`, `clearReport`), and `reportBuilder.js` utility generating structured Markdown reports with executive summary tables.
- **Component-Level Filtering:** Added `ALLOWED_COMPONENTS` enum (28 types) in `constants.js`, `filterByComponent` in `entrySearchService.js`, `componentFilter` state with URL sync in `useSearchManager`.
- **Compare Mode Backend:** Added `compareIds` state (max 2) with `addToCompare`, `removeFromCompare`, `clearCompare` helpers in `useSearchManager`.
- **Batch Import Script:** New `scripts/import-audit.mjs` Node.js CLI tool using `exceljs` to convert CSV/XLSX audit exports to corpus-compatible JSON.
- **Dynamic Corpus Import:** Refactored `dataService.js` and `AppDrawerPanelAdmin.jsx` to use dynamic imports for `corpus.json` and local variants, spinning them out into separate vendor chunks and reducing initial bundle size by ~166kB.

### Changed

- **Fuse.js Tuning:** Adjusted weights in `entrySearchService.js` and `useSearchManager.js`, increased `minMatchCharLength` to 3, and lowered `threshold` to 0.3 for faster, stricter matching.
- **Memoization:** Wrapped expensive filtering and sorting computations in `useSearchManager.js` and `useEntrySearch.js` with `useMemo` to prevent synchronous blocking on render.
- **Personal Corpus Validation:** Validated `personal-corpus.json` to ensure 100% complete coverage of WCAG 2.1 and WCAG 2.2 Level A/AA criteria.

### Fixed

- Fixed lagging interface rendering when returning more than 1000 search results.
