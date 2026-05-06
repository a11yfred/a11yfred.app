# TODO

Personal backlog for A11yTextHelper. Active items only. Remaining scope is listed explicitly for partial items.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[phase3]` `[launch-blocker]`

---

## Code Quality & Refactoring (May 5, 2026)

**Completed in this session:**

- [x] **Comprehensive code review and refactoring** `[code]` — First-pass and second-pass refactoring complete. Eliminated ~90 lines of duplicate code, replaced ~30 magic numbers with named constants, extracted utility hooks and functions. All linters passing, zero unused imports.

**Identified for future work (lower priority):**

- [ ] **Decompose App.jsx** `[code]` `[refactor]` — 1303 lines. Extract theme manager, search manager, party mode into hooks.
- [ ] **Refactor SettingsPanel** `[code]` `[refactor]` — 734 lines, 16+ state variables. Split into AiSettingsSection, SearchSettingsSection, LanguageSettingsSection, ResetDataSection.
- [ ] **Standardize locale/language naming** `[code]` `[i18n]` — Mixed usage across hooks; standardize throughout.
- [ ] **Add JSDoc to complex hooks** `[code]` — useFindingSearch.js and useContributionQueue.js need parameter/return type docs.

---

## Phase 1 — Launch Day Essentials

**Day 1 for Phase 1 public release** (ship with these):

- [ ] **Ko-fi donations live** `[infra]` `[manual]` — Create account, add username to footer, test widget.
- [ ] **GitHub README badges** `[docs]` `[manual]` — Add build status, license, version, Netlify deploy badges.
- [ ] **Production domain configured** `[infra]` `[manual]` — Confirm domain, configure DNS, enable HTTPS, update canonical URL.

---

## Phase 2 — In Progress

### AI Assist & Agent

- [x] **Wire agentic AI in DetailPanel** `[agent]` `[ai]` `[ux]` — Backend fully wired: (1) toggle added in Refine section of DetailPanel, (2) mode toggle exposed in Settings under AI Assist (Claude only), (3) agentic refinement uses searchCorpus tool via getAgenticRefinement; i18n keys and placeholders added for translation
- [x] **Document AI provider privacy comparison in README** `[privacy]` `[ai]` — Comparison table added showing training data policies, retention, and privacy commitments for all 4 providers (Anthropic, OpenAI, Google, Microsoft)
- [x] **Complete UI component library extraction for boilerplate** `[code]` `[enhancement]` — All 9 primitives extracted and tested: StateButton, InputWithClear, Badge, Field, PanelShell, BackButton (+ Toggle, RadioChip, Select from Phase 1), plus Modal/Announcer re-exports. Integrated across SearchBar, DetailPanel, ResultList, About/Help/Settings panels. All linters passing, dev server fully functional.
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` — Add `refinementHistory` state, pass full history to `getAgenticRefinement`, display turn history, add "Clear conversation" button, test corpus search per turn.
- [ ] **System prompt tuning** `[ai]` `[claude]` `[phase2]` — Test across 20+ corpus entries, verify tone/length/format, adjust `buildPrompt()`, document final prompt, iterate on feedback.

### User Findings & Editing

- [ ] **Copy / add / edit / delete findings** `[ux]` `[phase2]` — Data layer wired locally. Phase 1: UI forms. Phase 2: Supabase backend, cloud sync.
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` `[manual]` — Works via debug command. Add Settings UI toggle, document behavior.

### Multilingual Edit Flow

Backend complete. UI dialogs pending. All i18n keys are in `en.json`; hooks and services are wired; personal overrides are applied in `useFindingSearch` and visible in search results.

- [ ] **Save changes button in DetailPanel** `[ux]` `[i18n]` `[phase2]` — Add button (shows when edited), check locale, save via `useUserOverrides` or trigger edit-scope dialog.
- [ ] **Edit target dialog** `[ux]` `[i18n]` — Modal: "Personal entries" vs. "Shared corpus"; wire hooks.
- [ ] **Edit scope dialog** `[ux]` `[i18n]` `[phase2]` — Three options: `lang_only`, `lang_and_en`, `all_langs`; show warning for personal saves.
- [ ] **English switch transition (lang_and_en flow)** `[ux]` `[design]` — Animate bottom sheet, show skip dialog, preserve app locale.
- [ ] **Personal override indicator in DetailPanel** `[ux]` `[design]` — Show badge near title with timestamp when `_hasOverride` is true.
- [ ] **Contributions review panel (maintainer)** `[ux]` `[manual]` — Add section in SettingsPanel for pending contributions with approve/reject/export.
- [ ] **Reset All excludes personal overrides and contributions** `[ux]` `[privacy]` `[design]` — Separate overrides/contributions from Reset All, require explicit user action to clear.

### Search & Results

- [x] **Advanced search syntax** `[ux]` `[search]` — Query parser implemented for `+term` (required) and `-term` (excluded) operators; filters applied post-Fuse.js; syntax hint displayed in SearchBar hint text with working example

### Export & Sharing

- [ ] **Export findings** `[ux]` — Multi-select UI, report generation (Markdown/plain text), test formatting.
- [ ] **Email results** `[ux]` `[enhancement]` — Complete Export, add Email delivery option, wire SendGrid/Resend, test end-to-end.
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` — Implement Jira/Linear URL generation, test deep links, document format.

### Data & Content

- [ ] **Add native-specific corpus entries** `[corpus]` `[phase2]` — Add 4 entries: Dynamic Type sizing, accessibility labels, announcements, custom actions.
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` `[phase2]` — Settings UI for URL input/load, activate Supabase backend.

### Design & Polish

- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` — Audit layout consistency, empty states, keyboard nav, spacing.

---

## Accessibility (A11Y)

- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` — Confirm selectors match live Ko-fi DOM (selectors may drift), adjust if needed.

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` — 18 locales built and functional; extraction to standalone package pending. **Remaining**: (1) extract locale JSONs and `EASTER_EGG_LOCALES` map to `src/plugins/easter-eggs/`, (2) implement lazy-loading for locale files to avoid bloating main bundle, (3) document plugin API for drop-in usage in other React projects
- [ ] **Ko-fi a11y patch as standalone plugin** `[code]` `[a11y]` — Patch is working in `App.jsx`; extraction to plugin pending. **Remaining**: (1) extract `patchKofiA11y` to `src/plugins/kofi/KofiWidget.jsx` and `index.js`, (2) include self-contained `kofi.css`, (3) document selectors and note maintenance burden if Ko-fi's markup changes

---

## DevOps

### Code Quality

- [x] **Extract inline UI primitives to `src/components/ui/`** `[code]` — Toggle, RadioChip, and Select extracted from SettingsPanel.jsx private functions into `src/components/ui/`. Barrel export at `src/components/ui/index.js`. SettingsPanel updated to import from `../ui/`.
- [x] **Complete UI component library extraction for boilerplate** `[code]` `[enhancement]` — All 6 additional components extracted and integrated: (1) StateButton (copy/success/reset pattern) — 14+ uses across DetailPanel/SettingsPanel/ResultList, (2) InputWithClear (input+clear-button pattern) — SearchBar/DetailPanel, (3) Badge (clickable/display variants) — DetailPanel/ResultList, (4) Field (complex textarea) — DetailPanel, (5) PanelShell (panel header wrapper) — About/Help/Settings, (6) BackButton (RTL-aware chevron) — all panels. Modal and Announcer re-exported in ui/index.js. All linters passing, app fully functional on dev server.
- [ ] **UI component library extraction (npm publishing)** `[code]` `[enhancement]` `[deferred]` — Accessible SPA primitives fully built and in production (router, announcer, focus/names debuggers, BottomSheet, Drawer, Modal, form controls, button system). **Rationale for deferral**: (1) extraction requires monorepo setup and package management complexity, (2) component APIs are stable but not yet battle-tested in multiple projects, (3) publishing adds maintenance burden for minimal v1.0 gain. **Recommendation**: Defer to v1.1 or later (post-launch). If extraction becomes important, (1) confirm button unification complete, (2) audit component APIs for cross-project reusability, (3) scaffold monorepo structure, (4) publish to npm

### Infrastructure

- [ ] **Version tagging** `[infra]` — Decide corpus threshold, create `v0.1.0` tag, push to GitHub releases.
- [ ] **Chrome extension — validate and merge** `[infra]` — Add PNG icons, load unpacked, smoke-test at ~400px, merge.
- [ ] **Firefox extension — validate and merge** `[infra]` — Add PNG icons, load via about:debugging, confirm sidebar, merge.
- [ ] **Electron desktop app — icons, test, merge** `[infra]` — Add icons, test on macOS/Windows, code-sign macOS, merge.
- [ ] **Umami analytics activation** `[infra]` `[manual]` — Create account, add site, replace WEBSITE_ID, verify zero cookies, enable at launch.

### Privacy & Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` `[phase3]` `[launch-blocker]` — Finalize GDPR-DRAFT.md, move to GDPR.md, publish before launch, cover localStorage/API/tracking/contributions.

---

## Phase 3 — Planned

### AI Assist & Agent

- [ ] **Extend agentic AI to remaining providers** `[ai]` `[agent]` `[enhancement]` — Keep Claude-only (tool use provider-specific). Standard AI Assist works for all 4 providers without corpus search.

### Authentication

- [ ] **Sign-in UI** `[ux]` `[phase3]` — Add SettingsPanel footer section with avatar/name + Google/GitHub buttons + sign-out.
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` `[launch-blocker]` — Install Supabase JS, set env vars, uncomment, verify OAuth slugs and RLS policies.
- [x] **Phase 2 stubs review** `[infra]` `[claude]` `[manual]` — All stubs verified against Supabase JS v2 SDK docs (May 5).

### Cloud Data Sync

- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` — Activate `syncSettings()` and `getRemoteSettings()`, merge on sign-in, push on change.
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` `[phase3]` — Activate CRUD stubs via Supabase, verify schema.
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` — Wire rank up/rank down sync, merge on sign-in.

### Search & Visibility

- [ ] **Search Console setup** `[infra]` `[seo]` `[manual]` — Verify domain, submit sitemap, monitor indexing.
- [ ] **Update canonical URL to production domain** `[seo]` `[code]` — Confirm domain, update canonical/OG/Twitter URLs.

### Analytics & Monitoring

- [ ] **Error tracking / crash reporting** `[infra]` `[monitoring]` — Evaluate Sentry, add error boundary, capture unhandled rejections.
- [ ] **GitHub releases page** `[infra]` `[manual]` — Create v0.1.0 release, add notes, attach artifacts.

### Monetization & Growth

- [ ] **Monetization strategy** `[phase3]` `[manual]` — Decide free/premium/ad-supported, define limits, rate limiting for AI.
- [ ] **Ad network integration** `[infra]` `[manual]` — Research Carbon/EthicalAds/Splitrocket, evaluate CPM/CPC/placement.
- [ ] **Social proof & community** `[growth]` `[manual]` — Submit to Product Hunt, post to a11y communities, reach out to influencers.
- [ ] **Feedback collection** `[growth]` `[ux]` — Add feedback widget, monitor GitHub Issues, establish feedback loop.

### Launch Readiness

- [ ] **Pre-launch checklist** `[infra]` `[manual]` `[launch-blocker]` — GDPR/privacy/terms, SEO tags, Umami/error tracking, GitHub releases, social prep, domain/DNS, CDN, backup.
- [ ] **Post-launch monitoring** `[infra]` `[manual]` — Daily error logs, Search Console, Umami, respond to feedback <24h, weekly status, collect features.

---

## Archived

Completed or obsolete items have been cleaned from the active list. See CHANGELOG.md and UPDATES.md for documentation.

**Completed (Phase 1 Day-One Essentials):**

- 89-entry public corpus — Fully sourced, WCAG-mapped, keywords complete (May 5)
- All linters passing — ESLint, Stylelint, Markdownlint clean (May 5)
- Privacy & security baseline — No cookies, no third-party tracking, localStorage inventory documented (May 5)
- Offline-first support — Service Worker caching, PWA manifest, full search works offline (Phase 1)
- Accessibility verified — axe-core integration, WCAG 2.2 AA baseline, keyboard + screen reader tested (Phase 1)
- Documentation complete — README, CONTRIBUTING, SECURITY, DEPLOYING, CHANGELOG, UPDATES (May 5)
- robots.txt configured — Allows crawlers with 1s crawl-delay, references sitemap.xml (May 5)
- Sitemap.xml generated — Single-page app sitemap (one root URL entry) at public/sitemap.xml (May 5)
- SEO meta tags uncommented — Core meta, OG, Twitter card, JSON-LD structured data all active (May 5)
- Agentic AI wired — DetailPanel toggle, SettingsPanel config, full corpus-search integration (May 5)
- AI provider privacy comparison — README table with training data policies for all 4 providers (May 5)

**Completed (Phase 1 Pre-Launch):**

- Keyword audit — 89 public corpus entries fully populated
- Related SC links — all entries have `related` arrays, 54 entries with same-WCAG-SC cross-references documented in May 5 updates
- Migrate inline spacing to tokens — 222+ usages tokenized, fully documented
- CSS Modules / SCSS evaluation — decision confirmed (CSS Modules ruled out, SCSS deferred)
- Ad tiles in result list — `SponsoredTile.jsx` and `AdminPanel.jsx` fully built and wired (documented May 2)

**Obsolete (documented in CHANGELOG/UPDATES):**

- Public corpus bootstrap — exceeded target with 89 entries (May 5)
- Compare mode — split-view design deferred to Phase 2+ if user feedback warrants (documented in comprehensive updates)
- AI refinement locale pass — high API cost, deferred to v1.2+
- Corpus pre-translation script — deferred to Phase 2 when corpus is stable
- Ko-fi link in footer — discoverability achieved via widget
- Phase 3 hosting strategy — deferred by design until Phase 3 planning
- GitHub Sponsors — nice-to-have alternative to Ko-fi, deferred to Phase 3
