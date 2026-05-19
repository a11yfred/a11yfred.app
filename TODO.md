# A11yFred Roadmap & Work Items

See [UPDATES.md](docs/UPDATES.md) for what's been completed, and [README.md](README.md) for known limitations.

Category tags: `[corpus]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]`

---

## Phase 1: Core App (Complete — May 13)

106-entry public corpus (ACC prefix), full search and filter, AI Assist, 65+ languages, PWA/offline, WCAG 2.2 AA.

---

## Phase 2: Code Quality & Hooks (Complete — May 17)

`useRouteHandler` and `useSearchManager` hooks integrated (1336 >> 730 lines, 602 lines removed). Component splits (A11yListResults, A11yPanelSettings) complete. Form controls accessibility refactored: aria-disabled pattern with keyboard prevention (new useAriaDisabledKeydown hook). Five DRY optimization passes completed.

---

## Phase 3: Theme + Extensions (In Progress)

### UX / Interaction

- [ ] **Settings for search debounce/live search toggle** `[ux]` — move debounce timing to Settings; allow users to switch between live (instant) and on-demand (Enter key) search
- [ ] **Keyboard shortcut help dialog** `[ux]` `[a11y]` — trigger with `?` or `Ctrl+/`; display current keyboard shortcuts (j/k for nav, etc); non-modal overlay
- [ ] **Search history** `[ux]` — show last 10 searches in `localStorage` below search field when empty; include recent defects list
- [ ] **Bookmarks/favorites system** `[ux]` — star icon on result cards; persist to `localStorage`; show starred section above results
- [ ] **How to use onboarding** `[ux]` — brief modal or help page on first visit explaining: search → select → add location → refine → copy; trigger on `localStorage` flag
- [ ] **Shareable defect URLs** `[ux]` `[infra]` — encode selected defect ID into hash (e.g., `#defect/ACC-023`); parse on load and auto-select matching defect
- [ ] **Export to formats** `[ux]` — CSV, Markdown, or plain text export (single defect or multi-select batch); implement as Blob download
- [ ] **Audit report builder** `[ux]` — multi-select defects, add occurrence counts/severity overrides, export formatted report in Markdown/plain text
- [ ] **Component-level filtering** `[ux]` `[corpus]` — secondary filter (modal, form, button, heading, image, etc); add `component` field to schema; update `useDefectSearch`
- [ ] **Print view** `[ux]` `[design]` — @media print styles for clean printing; hide header/footer/search/settings; show only defect title, SC labels, desc, remediation
- [ ] **Email results** `[ux]` — mailto: link with pre-populated subject and body for quick sharing
- [ ] **Compare mode** `[ux]` — open two defects side-by-side in split view; useful for choosing which SC fits best

### Corpus & Localization

- [ ] **Expand public corpus** `[corpus]` — target 150+ entries beyond ACC prefix; source from WAI Understanding docs, axe-core, Deque University
- [ ] **Batch import tooling** `[corpus]` `[code]` — Node.js script to convert CSV/Excel audit exports to schema; run once, review, delete
- [ ] **Keyword audit** `[corpus]` — review `keywords` array on every imported entry; add synonyms and component names for search coverage
- [ ] **Platform coverage audit** `[corpus]` — verify native-only defects flagged correctly; balance native vs web entries
- [ ] **Related SC links** `[corpus]` — spot-check `related` arrays for accuracy; add missing secondary SCs
- [ ] **Corpus provenance field** `[corpus]` — add `source` field (personal, WAI, axe, Deque) to each entry; helps contributors follow the right style
- [ ] **Custom data source support** `[corpus]` `[ux]` — allow Settings to accept URL or file path to user-supplied JSON corpus; validate schema on load; fall back to built-in if unreachable
- [ ] **i18n expansion** `[i18n]` — add more languages via @ulam/calamansi beyond current 65+
- [ ] **WCAG version tagging** `[corpus]` — add `wcagVersion` field (`"2.1"` or `"2.2"`); display on result card and in DetailPanel
- [ ] **Machine translation pass** `[i18n]` `[corpus]` — translate corpus to all supported languages; flag WCAG terminology for human review

### Accessibility & Design

- [ ] **Verify overlay transitions in screen readers** `[a11y]` — test with NVDA + Firefox and VoiceOver + Safari; confirm DetailPanel announcements, Settings focus, focus trap
- [ ] **Check Sheet collapse on mobile** `[a11y]` `[ux]` — verify animation timing and behavior on small screens
- [ ] **Keyboard trap implementation audit** `[a11y]` — review focus trap in all overlays; ensure Escape key works correctly everywhere
- [ ] **Visible selection indicator** `[design]` `[a11y]` — add secondary cue (left-edge bar or checkmark) to selected result card; improves CVD accessibility
- [ ] **Empty state before search** `[design]` — add prompt, illustration, or sample query to pre-search state; make tool feel more inviting
- [ ] **Responsive design for tablets** `[design]` `[ux]` — improve tablet UX; adjust layout for 768–1024px breakpoint
- [ ] **Dark mode theming** `[design]` — Neighborly theme on feature/neighborly-theme branch (WCAG AA verified); ready to merge
- [ ] **Reflow at 400% zoom test** `[a11y]` — verify no horizontal scrolling required (WCAG 1.4.10)
- [ ] **prefers-contrast: more test** `[a11y]` — enable high contrast mode; verify token overrides improve legibility
- [ ] **Skip links** `[a11y]` — add "Skip to Main Content" and navigation landmarks
- [ ] **Keyboard navigation tests** `[a11y]` — full keyboard-only pass; no mouse required
- [ ] **Contrast ratio audit** `[a11y]` `[design]` — run axe DevTools; fix any WCAG 1.4.3 violations (≥ 4.5:1)
- [ ] **User accessibility testing** `[a11y]` — test with actual disabled users (external validation)

### Performance & Optimization

- [ ] **Performance optimization for 100K+ entries** `[perf]` — profile and optimize search latency; consider reducing corpus size or caching strategies
- [ ] **Lazy load detail panels** `[perf]` — load on demand instead of rendering when selected
- [ ] **Virtual scrolling for large lists** `[perf]` — implement windowing for result lists with 1000+ entries
- [ ] **Debounce tuning** `[perf]` — adjust Fuse.js `threshold`, `minMatchCharLength`, or `keys` weights
- [ ] **Memoize expensive computations** `[perf]` `[code]` — optimize sorting, filtering, and rating aggregations
- [ ] **CSS optimization** `[perf]` `[code]` — remove unused classes, consolidate media queries, migrate remaining inline values to tokens
- [ ] **Bundle size baseline** `[perf]` — record chunk sizes; target < 200 kB gzipped (with vendor splitting already in place)
- [ ] **Cold load time** `[perf]` — test on throttled connection (Slow 3G); target first usable search within 3 seconds
- [ ] **Font self-hosting** `[perf]` `[privacy]` — replace Google Fonts CDN with @fontsource/inter npm package; add subsetting to Latin range

### Testing Gaps

#### Unit Tests

- [ ] A11yOverlayManager focus management `[code]` `[a11y]`
- [ ] A11yListResults filtering logic `[code]` `[ux]`
- [ ] A11yInputSearchHero debouncing `[code]` `[perf]`
- [ ] Focus restoration across overlay types `[code]` `[a11y]`

#### Integration Tests

- [ ] Complete workflow: search → select → details → close `[code]` `[ux]`
- [ ] Overlay transitions: dialog → sheet → drawer → close `[code]` `[a11y]`
- [ ] Keyboard-only navigation of entire app `[code]` `[a11y]`
- [ ] Screen reader navigation of all major sections `[code]` `[a11y]`

#### Accessibility Tests

- [ ] axe-core automated checks `[a11y]`
- [ ] Keyboard navigation (no mouse) `[a11y]`
- [ ] VoiceOver (macOS) `[a11y]`
- [ ] NVDA (Windows) `[a11y]`
- [ ] High contrast mode `[a11y]`
- [ ] Reduced motion mode `[a11y]`

### Documentation

- [ ] **Architecture overview** `[code]` — document how components fit together
- [ ] **Focus flow diagram** `[code]` `[a11y]` — visual representation of focus movement through app
- [ ] **Keyboard shortcuts documentation** `[ux]` `[a11y]` — document all j/k/?, etc shortcuts
- [ ] **Contributing guide** `[code]` — guidelines for external contributors
- [ ] **Development setup instructions** `[infra]` — how to clone, install, and run locally
- [ ] **Component API docs** `[code]` — reusable component prop documentation

---

## Phase 4+: Extended Features & Ecosystem

### AI & Agentic Features

- [ ] **Evaluate tool use approach** `[agent]` `[ai]` — prototype agentic refinement with `search_corpus` tool; compare quality vs. single-prompt
- [ ] **`search_corpus` tool** `[agent]` `[ai]` — define JSON schema for corpus search; return top 3 matches
- [ ] **Multi-turn refinement** `[agent]` `[ux]` — extend Refine section to support back-and-forth conversation; store turn history in state
- [ ] **Agentic error handling** `[agent]` `[ai]` — add turn limit (5 max); surface clear error if limit reached
- [ ] **System prompt for agents** `[agent]` `[ai]` — separate prompt for agentic mode; instruct model to search corpus before rewriting
- [ ] **Model selection for agent mode** `[agent]` `[ai]` — default to `claude-opus-4-7`; make configurable in Settings
- [ ] **Wire OpenAI provider** `[ai]` — implement GPT-4o via `/v1/chat/completions`; test with real API key
- [ ] **Wire Google Gemini** `[ai]` — implement Gemini API; include model selection
- [ ] **Wire Microsoft Copilot** `[ai]` — implement Azure OpenAI endpoint
- [ ] **AI error surface** `[ai]` `[ux]` — inline error messages in DetailPanel instead of console.error only
- [ ] **System prompt tuning** `[ai]` — test across 20+ defect types; adjust tone/length/format
- [ ] **AI loading state** `[ai]` `[ux]` `[a11y]` — animated spinner with aria-busy; respect prefers-reduced-motion

### Authentication & User Data

- [ ] **Google/GitHub OAuth via Supabase** `[infra]` `[privacy]` — optional sign-in (app works fully without it); use Supabase Auth free tier
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` — sync upvote/downvote ratings across devices when signed in
- [ ] **User-owned remote corpus** `[corpus]` `[infra]` — allow signed-in users to point to their own Supabase table or remote JSON URL
- [ ] **Auth-gated personal corpus** `[corpus]` `[infra]` `[privacy]` — serve personal corpus from Supabase RLS table; unauthenticated users get public only
- [ ] **Sign-in UI** `[ux]` — minimal sign-in section in Settings (avatar, display name, Sign Out); no dedicated auth page

### Infrastructure & Distribution

- [ ] **Offline-first PWA** `[infra]` — Service Worker caching app shell and corpus JSON; fully functional without internet
- [ ] **Bug tracker integration** `[ux]` `[infra]` — Jira and Linear deep links with pre-filled defect data
- [ ] **Browser extensions** `[infra]` — Chrome and Firefox extensions (scaffolds ready on feature branches)
- [ ] **Electron desktop app** `[infra]` — cross-platform desktop version (scaffold empty, no timeline)
- [ ] **Umami analytics** `[infra]` `[privacy]` — privacy-first analytics (zero cookies, no personal data)
- [ ] **Version tagging** `[infra]` — semantic versioning: v0.1.0 (Phase 1), v0.2.0 (Phase 2), v1.0.0 (Phase 3)
- [ ] **Phase 3 public corpus** `[corpus]` `[infra]` — separate repo with 150+ entries; never mixed with personal corpus
- [ ] **Phase 3 public hosting** `[infra]` — separate Netlify site for public deployment
- [ ] **GDPR privacy disclosure** `[privacy]` `[infra]` — brief statement for Phase 3 public launch
- [ ] **Tip jar** `[infra]` — Ko-fi or GitHub Sponsors link (Phase 3 only)

### Community & Accessibility

- [ ] **Contribution guidelines** `[code]` `[a11y]` — how to improve accessibility or suggest features
- [ ] **Community translations** `[i18n]` `[corpus]` — crowdsourced translations beyond current coverage
- [ ] **Accessibility audit documentation** `[a11y]` — how this app was made accessible
- [ ] **Case studies** `[a11y]` — accessibility-first design case studies

### Code Quality & Maintenance

- [ ] **Migrate to CSS Modules** `[code]` — evaluate migration as component count grows; better tooling without runtime cost
- [ ] **Performance profiling suite** `[code]` `[perf]` — automated measurements for search latency, bundle size, paint times
- [ ] **Component story documentation** `[code]` — Storybook or similar for component prop documentation

---

## Ongoing / Recurring

These are continuous maintenance tasks, not one-off features.

### Dependency Monitoring

- [ ] Monitor @ulam packages for updates
- [ ] Review breaking changes before upgrading
- [ ] Update CHANGELOG when upgrading dependencies

