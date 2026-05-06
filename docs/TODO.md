# TODO

Personal backlog for A11yTextHelper. Active items only. Remaining scope is listed explicitly for partial items.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[phase3]` `[launch-blocker]`

---

## Code Quality & Refactoring

**Identified for future work (lower priority):**

- [ ] **Break large components into single-responsibility pieces** `[code]` `[refactor]` ,  High-effort refactoring: DetailPanel (659 lines, 25+ useState) → extract copy/undo logic to useDetailPanelClipboard hook, AI refinement to useDetailPanelRefine hook; ResultList (515 lines) → extract keyboard nav to useResultListKeyboard hook, narrow mode to sub-component; SettingsPanel (786 lines, 16+ state variables) → split into AiSettingsSection, SearchSettingsSection, LanguageSettingsSection, ResetDataSection.
- [ ] **Consolidate prop drilling using Context API or custom hooks** `[code]` `[refactor]` ,  App.jsx AppContent receives 20+ state/setter pairs. Consolidate into context objects (settings context, search context, UI state context) or custom hooks to reduce surface area. Reduces prop count from 30+ to 2-3 per component.
- [ ] **Extract reused patterns into utilities** `[code]` `[refactor]` ,  Modal/drawer state pattern repeated 4+ times (settingsOpen, aboutOpen, etc.); keyboard shortcut handling repeated (App.jsx, ResultList.jsx); localStorage try/catch pattern repeated 3+ times. Create useModalState, useKeyboardShortcuts, useLocalStorage custom hooks.
- [ ] **Add TypeScript or JSDoc for type safety** `[code]` `[type-safety]` ,  Codebase is currently untyped JavaScript. Add JSDoc comments to complex functions and hooks (useFindingSearch.js, useContributionQueue.js, App.jsx), or migrate to TypeScript for full type checking. Improves IDE autocomplete and catches type errors at dev time.
- [ ] **Decompose App.jsx** `[code]` `[refactor]` ,  1303 lines. Extract theme manager, search manager, party mode into hooks.
- [ ] **Standardize locale/language naming** `[code]` `[i18n]` ,  Mixed usage across hooks; standardize throughout.
- [ ] **Add JSDoc to complex hooks** `[code]` ,  useFindingSearch.js and useContributionQueue.js need parameter/return type docs.

---

## Phase 1 ,  Launch Day Essentials

**Day 1 for Phase 1 public release** (ship with these):

- [ ] **Production domain configured** `[infra]` `[manual]` ,  Confirm domain, configure DNS, enable HTTPS, update canonical URL.

---

## Phase 2 ,  In Progress

### AI Assist & Agent

- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` ,  Add `refinementHistory` state, pass full history to `getAgenticRefinement`, display turn history, add "Clear conversation" button, test corpus search per turn.
- [ ] **System prompt tuning** `[ai]` `[claude]` `[phase2]` ,  Test across 20+ corpus entries, verify tone/length/format, adjust `buildPrompt()`, document final prompt, iterate on feedback.

### User Findings & Editing

- [ ] **Copy / add / edit / delete findings** `[ux]` `[phase2]` ,  Data layer wired locally. Phase 1: UI forms. Phase 2: Supabase backend, cloud sync.
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` `[manual]` ,  Works via debug command. Add Settings UI toggle, document behavior.

### Multilingual Edit Flow

Backend complete. UI dialogs pending. All i18n keys are in `en.json`; hooks and services are wired; personal overrides are applied in `useFindingSearch` and visible in search results.

- [ ] **Save changes button in DetailPanel** `[ux]` `[i18n]` `[phase2]` ,  Add button (shows when edited), check locale, save via `useUserOverrides` or trigger edit-scope dialog.
- [ ] **Edit target dialog** `[ux]` `[i18n]` ,  Modal: "Personal entries" vs. "Shared corpus"; wire hooks.
- [ ] **Edit scope dialog** `[ux]` `[i18n]` `[phase2]` ,  Three options: `lang_only`, `lang_and_en`, `all_langs`; show warning for personal saves.
- [ ] **English switch transition (lang_and_en flow)** `[ux]` `[design]` ,  Animate bottom sheet, show skip dialog, preserve app locale.
- [ ] **Personal override indicator in DetailPanel** `[ux]` `[design]` ,  Show badge near title with timestamp when `_hasOverride` is true.
- [ ] **Contributions review panel (maintainer)** `[ux]` `[manual]` ,  Add section in SettingsPanel for pending contributions with approve/reject/export.
- [ ] **Reset All excludes personal overrides and contributions** `[ux]` `[privacy]` `[design]` ,  Separate overrides/contributions from Reset All, require explicit user action to clear.

### Search & Results

### Export & Sharing

- [ ] **Export findings** `[ux]` ,  Multi-select UI, report generation (Markdown/plain text), test formatting.
- [ ] **Email results** `[ux]` `[enhancement]` ,  Complete Export, add Email delivery option, wire SendGrid/Resend, test end-to-end.
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` ,  Implement Jira/Linear URL generation, test deep links, document format.

### Data & Content

- [ ] **Add native-specific corpus entries** `[corpus]` `[phase2]` ,  Add 4 entries: Dynamic Type sizing, accessibility labels, announcements, custom actions.
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` `[phase2]` ,  Settings UI for URL input/load, activate Supabase backend.

### Design & Polish

- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` ,  Audit layout consistency, empty states, keyboard nav, spacing.

---

## Accessibility (A11Y)

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` ,  18 locales built and functional; extraction to standalone package pending. **Remaining**: (1) extract locale JSONs and `EASTER_EGG_LOCALES` map to `src/plugins/easter-eggs/`, (2) implement lazy-loading for locale files to avoid bloating main bundle, (3) document plugin API for drop-in usage in other React projects

---

## DevOps

### Code Quality

- [ ] **UI component library extraction (npm publishing)** `[code]` `[enhancement]` `[deferred]` ,  Accessible SPA primitives fully built and in production (router, announcer, focus/names debuggers, BottomSheet, Drawer, Modal, form controls, button system). **Rationale for deferral**: (1) extraction requires monorepo setup and package management complexity, (2) component APIs are stable but not yet battle-tested in multiple projects, (3) publishing adds maintenance burden for minimal v1.0 gain. **Recommendation**: Defer to v1.1 or later (post-launch). If extraction becomes important, (1) confirm button unification complete, (2) audit component APIs for cross-project reusability, (3) scaffold monorepo structure, (4) publish to npm

### Infrastructure

- [ ] **Version tagging** `[infra]` ,  Decide corpus threshold, create `v0.1.0` tag, push to GitHub releases.
- [ ] **Chrome extension ,  validate and merge** `[infra]` ,  Add PNG icons, load unpacked, smoke-test at ~400px, merge.
- [ ] **Firefox extension ,  validate and merge** `[infra]` ,  Add PNG icons, load via about:debugging, confirm sidebar, merge.
- [ ] **Electron desktop app ,  icons, test, merge** `[infra]` ,  Add icons, test on macOS/Windows, code-sign macOS, merge.
- [ ] **Umami analytics activation** `[infra]` `[manual]` ,  Create account, add site, replace WEBSITE_ID, verify zero cookies, enable at launch.

### Privacy & Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` `[phase3]` `[launch-blocker]` ,  Finalize GDPR-DRAFT.md, move to GDPR.md, publish before launch, cover localStorage/API/tracking/contributions.

---

## Phase 3 ,  Planned

### AI Assist & Agent

- [ ] **Extend agentic AI to remaining providers** `[ai]` `[agent]` `[enhancement]` ,  Keep Claude-only (tool use provider-specific). Standard AI Assist works for all 4 providers without corpus search.

### Authentication

- [ ] **Sign-in UI** `[ux]` `[phase3]` ,  Add SettingsPanel footer section with avatar/name + Google/GitHub buttons + sign-out.
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` `[launch-blocker]` ,  Install Supabase JS, set env vars, uncomment, verify OAuth slugs and RLS policies.

### Cloud Data Sync

- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` ,  Activate `syncSettings()` and `getRemoteSettings()`, merge on sign-in, push on change.
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` `[phase3]` ,  Activate CRUD stubs via Supabase, verify schema.
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` ,  Wire rank up/rank down sync, merge on sign-in.

### Search & Visibility

- [ ] **Search Console setup** `[infra]` `[seo]` `[manual]` ,  Verify domain, submit sitemap, monitor indexing.
- [ ] **Update canonical URL to production domain** `[seo]` `[code]` ,  Confirm domain, update canonical/OG/Twitter URLs.

### Analytics & Monitoring

- [ ] **Error tracking / crash reporting** `[infra]` `[monitoring]` ,  Evaluate Sentry, add error boundary, capture unhandled rejections.
- [ ] **GitHub releases page** `[infra]` `[manual]` ,  Create v0.1.0 release, add notes, attach artifacts.

### Monetization & Growth

- [ ] **Monetization strategy** `[phase3]` `[manual]` ,  Decide free/premium/ad-supported, define limits, rate limiting for AI.
- [ ] **Ad network integration** `[infra]` `[manual]` ,  Research Carbon/EthicalAds/Splitrocket, evaluate CPM/CPC/placement.
- [ ] **Social proof & community** `[growth]` `[manual]` ,  Submit to Product Hunt, post to a11y communities, reach out to influencers.
- [ ] **Feedback collection** `[growth]` `[ux]` ,  Add feedback widget, monitor GitHub Issues, establish feedback loop.

### Launch Readiness

- [ ] **Pre-launch checklist** `[infra]` `[manual]` `[launch-blocker]` ,  GDPR/privacy/terms, SEO tags, Umami/error tracking, GitHub releases, social prep, domain/DNS, CDN, backup.
- [ ] **Post-launch monitoring** `[infra]` `[manual]` ,  Daily error logs, Search Console, Umami, respond to feedback <24h, weekly status, collect features.

---

## Resolved

All Phase 1 items, major milestones, and obsolete features. See CHANGELOG.md and UPDATES.md for technical details.

- ✅ Phase 1 complete (May 6)
- ✅ 133-entry public corpus fully sourced and WCAG-mapped
- ✅ All linters passing (ESLint 9.x, Stylelint, Markdownlint)
- ✅ Offline-first support (Service Worker, PWA manifest)
- ✅ Accessibility baseline (axe-core, WCAG 2.2 AA, keyboard + screen reader tested)
- ✅ Documentation (README, CONTRIBUTING, SECURITY, DEPLOYING, CHANGELOG, UPDATES)
- ✅ SEO infrastructure (robots.txt, sitemap.xml, meta tags, structured data)
- ✅ Agentic AI wired (DetailPanel toggle, SettingsPanel config, corpus search)
- ✅ AI provider privacy comparison table (README)
- ✅ Button consolidation (70+ instances → 2 base components)
- ✅ CSS tokenization (all outline/spacing/motion values to tokens)
- ✅ UI component library extracted and portable
- ✅ Zero dead code and unused imports
- ✅ Comprehensive code review and refactoring (May 5)
- ✅ Code cleanup and dead code removal (May 6)
- ✅ UI library decoupling and panel unification (May 6)
- ✅ Extract inline UI primitives to src/components/ui/ (Toggle, RadioChip, Select)
- ✅ Complete UI component library extraction for boilerplate (StateButton, InputWithClear, Badge, Field, PanelShell, BackButton, Modal, Announcer)
- ✅ Wire agentic AI in DetailPanel (agent toggle, settings config, corpus search)
- ✅ Document AI provider privacy comparison in README
- ✅ Advanced search syntax (query parser for +term and -term operators)
- ✅ Phase 2 stubs review (verified against Supabase JS v2 SDK docs)
- ✅ GitHub README badges (License, Version, Node.js)
- 💤 Deferred: SCSS migration, corpus pre-translation, Compare mode, Ko-fi donations, Ko-fi a11y patch, GitHub Sponsors
