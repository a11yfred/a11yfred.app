# Changelog

All notable technical changes to this project will be documented in this file.

## [Unreleased] - 2026-05-27

### Added
- **Infinite Scroll Chunking:** Implemented `IntersectionObserver` in `AppScreenResults.jsx` to render large lists in chunks of 50, preventing DOM lag during "View All" mode.
- **Search Debouncing:** Added a `useDebounce` hook to delay Fuse.js execution by 250ms while typing, significantly improving main thread responsiveness.
- **Lazy Loading:** `AppSheetDetail` is now lazy-loaded using `React.lazy()` and `<Suspense>`, keeping heavy markdown and AI components out of the initial bundle.
- **Dynamic Corpus Import:** Refactored `dataService.js` and `AppDrawerPanelAdmin.jsx` to use dynamic imports for `corpus.json` and local variants, spinning them out into separate vendor chunks and reducing initial bundle size by ~166kB.

### Changed
- **Fuse.js Tuning:** Adjusted weights in `entrySearchService.js` and `useSearchManager.js`, increased `minMatchCharLength` to 3, and lowered `threshold` to 0.3 for faster, stricter matching.
- **Memoization:** Wrapped expensive filtering and sorting computations in `useSearchManager.js` and `useEntrySearch.js` with `useMemo` to prevent synchronous blocking on render.
- **Personal Corpus Validation:** Validated `personal-corpus.json` to ensure 100% complete coverage of WCAG 2.1 and WCAG 2.2 Level A/AA criteria.

### Fixed
- Fixed lagging interface rendering when returning more than 1000 search results.
