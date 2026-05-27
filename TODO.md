# A11yFred Roadmap & Work Items

See [UPDATES.md](UPDATES.md) for what's been completed, and [README.md](README.md) for known limitations.

Category tags: `[corpus]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]`

---

## Phase 1: Core App (Complete — May 13)

106-entry public corpus (ACC prefix), full search and filter, AI Assist, 65+ languages, PWA/offline, WCAG 2.2 AA.

---

## Phase 2: Code Quality & Hooks (Complete — May 17)

`useRouteHandler` and `useSearchManager` hooks integrated (1336 >> 730 lines, 602 lines removed). Component refactors: AppScreenResults (renamed from A11yListResults), AppDrawerPanelSettings (renamed from A11yPanelSettings) complete. Form controls accessibility refactored: aria-disabled pattern with keyboard prevention (new useAriaDisabledKeydown hook). Five DRY optimization passes completed.

---

## Phase 2A: Cleanup & Maintenance (Complete — May 19)

Six-pass documentation and code audit: consolidated duplicate README content, fixed 18 stale component name references across docs, corrected outdated file paths, removed redundant MAINTENANCE.md wrapper, consolidated LS_LAST_SELECTED constant to single source, verified no inappropriate framework code duplication. Completed @ulam framework extraction strategy: swipe/touch gestures to @ulam/sili, data export/relevance utilities kept in a11yfred. All linting passes; build succeeds.

---

## Phase 3: Theme + Extensions (In Progress)

### UX / Interaction

- [x] **Keyboard shortcut help dialog** `[ux]` `[a11y]` — Help panel exists with keyboard shortcuts documented; `?` and `Ctrl+/` hotkeys implemented
- [ ] **Search history** `[ux]` — show last 10 searches in `localStorage` below search field when empty; include recent defects list
- [x] **Export to formats** `[ux]` — CSV, Markdown, or plain text export (data layer implemented); awaits UI for multi-select batch export
- [ ] **Audit report builder** `[ux]` — multi-select defects, add occurrence counts/severity overrides, export formatted report in Markdown/plain text
- [ ] **Component-level filtering** `[ux]` `[corpus]` — secondary filter (modal, form, button, heading, image, etc); add `component` field to schema; update `useDefectSearch`
- [x] **Print view** `[ux]` `[design]` — @media print styles for clean printing; hides app shell, shows defect details formatted for audit reports
- [x] **Email results** `[ux]` — mailto: link with pre-populated subject and body for quick sharing of defect details
- [ ] **Compare mode** `[ux]` — open two defects side-by-side in split view; useful for choosing which SC fits best

### Corpus & Localization

- [ ] **Expand public corpus** `[corpus]` — target 150+ entries beyond ACC prefix; source from WAI Understanding docs, axe-core, Deque University
- [ ] **Batch import tooling** `[corpus]` `[code]` — Node.js script to convert CSV/Excel audit exports to schema; run once, review, delete
- [ ] **Platform coverage audit** `[corpus]` — verify native-only defects flagged correctly; balance native vs web entries
- [ ] **Related SC links** `[corpus]` — spot-check `related` arrays for accuracy; add missing secondary SCs
- [ ] **Corpus provenance field** `[corpus]` — add `source` field (personal, WAI, axe, Deque) to each entry; helps contributors follow the right style
- [ ] **Custom data source support** `[corpus]` `[ux]` — allow Settings to accept URL or file path to user-supplied JSON corpus; validate schema on load; fall back to built-in if unreachable
- [ ] **i18n expansion** `[i18n]` — add more languages via @ulam/calamansi beyond current 65+
- [ ] **Machine translation pass** `[i18n]` `[corpus]` — translate corpus to all supported languages; flag WCAG terminology for human review

### Accessibility & Design

- [ ] **Responsive design for tablets** `[design]` `[ux]` — improve tablet UX; adjust layout for 768–1024px breakpoint
- [x] **Dark mode theming** `[design]` — Neighborly theme on feature/neighborly-theme branch (WCAG AA verified, warm color palette); ready to merge to main
- [ ] **Reflow at 400% zoom test** `[a11y]` — verify no horizontal scrolling required (WCAG 1.4.10)
- [ ] **prefers-contrast: more test** `[a11y]` — enable high contrast mode; verify token overrides improve legibility

### Performance & Optimization

- [ ] **Performance optimization for 100K+ entries** `[perf]` — profile and optimize search latency; consider reducing corpus size or caching strategies
- [ ] **Lazy load detail panels** `[perf]` — load on demand instead of rendering when selected
- [ ] **Virtual scrolling for large lists** `[perf]` — implement windowing for result lists with 1000+ entries
- [ ] **Debounce tuning** `[perf]` — adjust Fuse.js `threshold`, `minMatchCharLength`, or `keys` weights
- [ ] **Memoize expensive computations** `[perf]` `[code]` — optimize sorting, filtering, and rating aggregations
- [ ] **Bundle size baseline** `[perf]` — record chunk sizes; target < 200 kB gzipped (with vendor splitting already in place)

---

## Phase 4+: Extended Features & Ecosystem

### AI & Agentic Features

- [ ] **Evaluate tool use approach** `[agent]` `[ai]` — prototype agentic refinement with `search_corpus` tool; compare quality vs. single-prompt
- [ ] **Multi-turn refinement** `[agent]` `[ux]` — extend Refine section to support back-and-forth conversation; store turn history in state
- [ ] **Agentic error handling** `[agent]` `[ai]` — add turn limit (5 max); surface clear error if limit reached
- [ ] **System prompt for agents** `[agent]` `[ai]` — separate prompt for agentic mode; instruct model to search corpus before rewriting
- [ ] **AI error surface** `[ai]` `[ux]` — inline error messages in DetailPanel instead of console.error only
- [ ] **System prompt tuning** `[ai]` — test across 20+ defect types; adjust tone/length/format

### Authentication & User Data

- [ ] **Google/GitHub OAuth via Supabase** `[infra]` `[privacy]` — optional sign-in (app works fully without it); use Supabase Auth free tier
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` — sync upvote/downvote ratings across devices when signed in
- [ ] **User-owned remote corpus** `[corpus]` `[infra]` — allow signed-in users to point to their own Supabase table or remote JSON URL
- [ ] **Auth-gated personal corpus** `[corpus]` `[infra]` `[privacy]` — serve personal corpus from Supabase RLS table; unauthenticated users get public only
- [ ] **Sign-in UI** `[ux]` — minimal sign-in section in Settings (avatar, display name, Sign Out); no dedicated auth page

### Infrastructure & Distribution

- [ ] **Bug tracker integration** `[ux]` `[infra]` — Jira and Linear deep links with pre-filled defect data
- [ ] **Browser extensions** `[infra]` — Chrome and Firefox extensions (in progress on feature branches)
- [ ] **Electron desktop app** `[infra]` — cross-platform desktop version (scaffold empty, no timeline)
- [ ] **Phase 3 public corpus** `[corpus]` `[infra]` — separate repo with 150+ entries; never mixed with personal corpus
- [ ] **GDPR privacy disclosure** `[privacy]` `[infra]` — brief statement for Phase 3 public launch
- [ ] **Tip jar** `[infra]` — GitHub Sponsors link wired; Ko-fi deferred

### Community & Accessibility

- [ ] **Contribution guidelines** `[code]` `[a11y]` — how to improve accessibility or suggest features
- [ ] **Community translations** `[i18n]` `[corpus]` — crowdsourced translations beyond current coverage
- [ ] **Accessibility audit documentation** `[a11y]` — how this app was made accessible
- [ ] **Case studies** `[a11y]` — accessibility-first design case studies

### Code Quality & Maintenance

- [ ] **Performance profiling suite** `[code]` `[perf]` — automated measurements for search latency, bundle size, paint times

---

## Ongoing / Recurring

These are continuous maintenance tasks, not one-off features.

### Dependency Monitoring

- [x] Monitor @ulam packages for updates (synced to 0.4.x / 0.3.x on May 27)
- [x] Review breaking changes before upgrading
- [x] Update CHANGELOG when upgrading dependencies

### Code Quality & Performance

- [ ] CSS optimization — remove unused classes, consolidate media queries, migrate remaining inline values to tokens
- [ ] Memoize expensive computations — optimize sorting, filtering, and rating aggregations
- [ ] Cold load time — test on throttled connection (Slow 3G); target first usable search within 3 seconds
- [ ] Bundle size baseline — record chunk sizes; target < 200 kB gzipped (with vendor splitting already in place)

### Documentation & Community

- [ ] Contributing guide — review CONTRIBUTING.md for accuracy; keep branch types, workflow, and linting guidelines current
- [ ] Development setup instructions — review README.md quick start and docs/DEPLOYING.md for accuracy; keep npm scripts and local dev workflow current
- [ ] Version tagging — maintain semantic versioning (v0.1.0 Phase 1, v0.2.0 Phase 2, v1.0.0 Phase 3 per phase completion)
- [ ] PWA Service Worker validation — regularly test offline functionality; verify app shell and corpus JSON caching still working

### Testing & QA

Manual testing covers the full app lifecycle and runs throughout development, not phase-gated.

**Unit Tests:**

- [ ] A11yOverlayManager focus management — trap, restore, escape key handling
- [ ] AppScreenResults filtering logic — badge filters, narrow mode, clear all
- [ ] A11yInputSearchHero debouncing — typeahead on/off, live vs. on-demand modes
- [ ] Focus restoration across overlay types — screen/drawer/sheet/dialog transitions

**Integration Tests:**

- [ ] Complete workflow — search → select → details → copy/edit → close
- [ ] Overlay transitions — open/close animations, focus movement, backdrop interactions
- [ ] Keyboard-only navigation — Tab/Shift+Tab, j/k, ?, Enter, Escape (no mouse)
- [ ] Screen reader navigation — VoiceOver, NVDA, announcements on every state change

**Accessibility Tests:**

- [ ] axe-core automated checks — run before each release
- [ ] Keyboard navigation tests — full keyboard-only pass; no mouse required
- [ ] Keyboard trap implementation audit — review focus trap in all overlays; ensure Escape key works correctly everywhere
- [ ] Contrast ratio audit — run axe DevTools; fix any WCAG 1.4.3 violations (≥ 4.5:1)
- [ ] VoiceOver (macOS) — overlay transitions, DetailPanel announcements, Settings focus, focus trap
- [ ] NVDA (Windows) — overlay transitions, DetailPanel announcements, Settings focus, focus trap
- [ ] High contrast mode — all text ≥ 4.5:1, focus indicators visible
- [ ] Reduced motion mode — animations respect `prefers-reduced-motion`
- [ ] Sheet collapse on mobile — verify animation timing and behavior on small screens
- [ ] User accessibility testing — test with actual disabled users (external validation)
