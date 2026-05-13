# TODO

Personal backlog for A11yFred. Active items only. Remaining scope is listed explicitly for partial items.

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
- [ ] **Address remaining JS warnings** `[code]` ,  41 intentional warnings remain: `prefer-aria-disabled` on all Button/ButtonIcon/Toggle/Radio/Select/InputSearch/SheetDetail/A11yPanelSettings/A11yListResult/A11yTextareaCopyable/UlamMenu/A11yPanelAdmin/A11yInputSearchHero components; `no-target-blank-without-label` on external links in App, A11yLinkSc, A11yLinksSource, A11yPanelAbout, A11yPanelAdmin. These require real code changes (aria-disabled pattern, opens-in-new-tab text), not just lint suppression.

---

## Phase 1 ,  Launch Day Essentials

**Day 1 for Phase 1 public release** (ship with these):

- [ ] **Corpus translations incomplete** `[i18n]` `[launch-blocker]` ,  8 language overlays (de, es, fr, ja, ko, pt-BR, tl, zh) cover 54 of 106 corpus entries — 52 entries fall back to English for non-English users. Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill the gaps. Requires an Anthropic API key.
- [ ] **Manual testing before launch** `[qa]` `[manual]` ,  Smoke test core flows: search/select/refine/copy on desktop and mobile (iOS Safari, Android Chrome); test all locales (en, ja, ko, es, fr, de, zh); test keyboard nav (Tab, Enter, Escape); test screen reader (NVDA, JAWS, VoiceOver); verify offline mode works; test on slow network (throttle to 3G).
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

### Export & Sharing

- [ ] **Export findings** `[ux]` ,  Multi-select UI (checkboxes or shift-click in result list), format picker (Markdown, plain text, CSV, Excel), file download.
- [ ] **Email results** `[ux]` `[enhancement]` ,  Add Email delivery to Export: mailto: compose option or SendGrid/Resend API, test end-to-end.
- [ ] **Google Drive export** `[ux]` `[infra]` `[phase3]` ,  After Google OAuth active, add "Save to Drive" option in export format picker; upload exported file directly to user's Drive.
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` ,  Implement Jira/Linear URL generation, test deep links, document format.

### Data & Content

- [ ] **Add native-specific corpus entries** `[corpus]` `[phase2]` ,  Add 4 entries: Dynamic Type sizing, accessibility labels, announcements, custom actions.
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` `[phase2]` ,  Settings UI for URL input/load, activate Supabase backend.

### Related Entry Ranking

- [ ] **Implement tiered related-entry ranking** `[ux]` `[corpus]` `[phase2]` ,  Surface related entries using 7-tier order: (1) same SC, (2) AAA/enhanced counterpart, (3) entries where current SC appears in their related array, (4) shared related SC overlap, (5) keyword similarity, (6) discoverability (same platform/severity/section), (7) Best Practice entries last. See memory: related_sc_ranking.md.
- [ ] **User co-selection behavioral signal** `[ux]` `[data]` `[phase2]` ,  Track when a user copies one entry then navigates to and copies another in the same session. Persist co-selection pairs as `{ a, b, count }` in `localStorage` key `coSelectionPairs`. Weak signal: view-then-view (sessionStorage only). Strong signal: copy-then-copy (persisted). Use pair counts to boost ranking of frequently co-used entries above keyword tier. Wire copy events in `DetailPanel.jsx` and selection events in `App.jsx`.

### Design & Polish

- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` ,  Audit layout consistency, empty states, keyboard nav, spacing.

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` ,  18 locales built and functional; extraction to standalone package pending. **Remaining**: (1) extract locale JSONs and `EASTER_EGG_LOCALES` map to `src/calamansi/easter-eggs/`, (2) implement lazy-loading for locale files to avoid bloating main bundle, (3) document in calamansi package for drop-in usage in other React projects

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

### Extension and Electron distribution

### Chrome Web Store

1. Create a Google developer account at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole) and pay the one-time $5 registration fee.
2. Run `npm run build` and zip the entire `dist/` folder (the output of the Vite build, not the source).
3. In the developer console, create a new item and upload the zip. Fill in the store listing: name, description (140 chars), screenshots (1280x800 or 640x400), at least one promotional image (440x280).
4. Set visibility (public or unlisted) and submit for review. Google review typically takes 1 to 3 business days for new extensions, faster for updates.
5. For updates: increment `version` in `extension-static/manifest.json`, rebuild, re-zip, upload in the console.

### Firefox Add-ons (AMO)

1. Create a Mozilla account at [addons.mozilla.org/developers](https://addons.mozilla.org/en-US/developers/).
2. Run `npm run build` and zip `dist/` (same build, different manifest).
3. Submit at AMO Submit: upload the zip, then upload the source code zip (AMO requires source for review of minified code).
4. Fill in listing details. AMO review for new add-ons is manual and can take days to weeks. Updates to approved add-ons are faster (often same-day auto-approval if no code changes in review scope).
5. For self-distribution (bypass AMO): sign the xpi via `web-ext sign` using an AMO API key, then distribute the `.xpi` directly. Users install via `about:addons` drag-and-drop.

### Electron: Mac, Windows, Linux

Building distributable installers requires `electron-builder` (already a dev dependency in the scaffold). Steps:

1. Add app icons: `build/icon.png` (512x512, used for Linux and as source), `build/icon.icns` (macOS), `build/icon.ico` (Windows). Tools: `electron-icon-builder` or `icns-gen` from the PNG.
2. Run `npm run build` to produce `dist/`, then `npx electron-builder` (or add a script: `"dist": "electron-builder"`).
3. Output by platform:
   - macOS: `.dmg` installer and `.app` bundle (in `dist/`)
   - Windows: `.exe` NSIS installer (runs `electron-builder --win`)
   - Linux: `.AppImage` (runs anywhere), `.deb` (Debian/Ubuntu), `.rpm` (Fedora)
4. Cross-compilation: building macOS targets requires a Mac or a macOS CI runner. Windows and Linux can cross-compile from each other with some limitations. GitHub Actions with `macos-latest`, `windows-latest`, and `ubuntu-latest` runners covers all three.
5. Code signing:
   - macOS: requires an Apple Developer account ($99/yr), a Developer ID Application certificate, and `notarytool` submission after signing. Without signing, users see a Gatekeeper warning.
   - Windows: optional but recommended. Buy a code-signing certificate (DigiCert, Sectigo, etc.) or use Microsoft Trusted Signing (Azure, cheaper). Without it, Windows Defender SmartScreen shows a warning on first run.
   - Linux: no signing required.
6. Distribution:
   - Self-hosted: upload the built artifacts to a GitHub Release (tag the commit, attach the files). Users download directly.
   - Mac App Store: requires a separate `mas` build target in electron-builder, an App Store provisioning profile, and Apple review. More restrictive (sandboxing). Most Electron apps skip this and distribute via GitHub Releases or their own site.
   - Windows Store (MSIX): possible via electron-builder `--win appx` target. Requires a Microsoft Partner Center account. Optional.
   - Snapcraft / Flathub: Linux packaging for wider distribution. `electron-builder` can produce Snap packages. Flathub requires a separate manifest PR.

### Privacy & Security

- [x] **GDPR disclosure for Phase 3** `[privacy]` `[phase3]` `[launch-blocker]` ,  Published as docs/PRIVACY.md (May 13). URL_PRIVACY_POLICY points to a11yfred/a11yfred (repo is public).

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
- [ ] **Update canonical URL to production domain** `[seo]` `[code]` ,  Confirm domain, update canonical/OG/Twitter URLs in index.html once domain is live; currently placeholder `a11yfred.app`.

### Analytics & Monitoring

- [ ] **Error tracking / crash reporting** `[infra]` `[monitoring]` ,  Evaluate Sentry, add error boundary, capture unhandled rejections.
- [ ] **GitHub releases page** `[infra]` `[manual]` ,  Create v0.1.0 release, add notes, attach artifacts.

### Monetization & Growth

- [ ] **Monetization strategy** `[phase3]` `[manual]` ,  Decide free/premium/ad-supported, define limits, rate limiting for AI.
- [ ] **Ad network integration** `[infra]` `[manual]` ,  Research Carbon/EthicalAds/Splitrocket, evaluate CPM/CPC/placement.
- [ ] **Social proof & community** `[growth]` `[manual]` ,  Submit to Product Hunt, post to a11y communities, reach out to influencers.
- [ ] **Feedback collection** `[growth]` `[ux]` ,  Add feedback widget, monitor GitHub Issues, establish feedback loop.

### Launch Readiness

- [ ] **Content audit** `[qa]` `[manual]` `[launch-blocker]` ,  Full editorial pass: all visible UI strings, corpus entry titles and descriptions, About panel, Help panel, Settings labels. Check for placeholder text, inconsistent terminology, em-dashes, and ESL-unfriendly phrasing.
- [x] **Code quality audit** `[code]` `[manual]` `[launch-blocker]` ,  ESLint/Stylelint/Markdownlint all clean (May 13). Fixed Sheet.jsx click-without-keyboard lint error; removed stale eslint-disable directive in App.jsx. All console.* calls are DEV-gated. i18n translation TODOs remain in locale files — not production paths.
- [x] **Security audit** `[privacy]` `[manual]` `[launch-blocker]` ,  Completed May 13: all localStorage keys inventoried and documented in PRIVACY.md; no keys logged to console (all console.* are DEV-gated); all 3 outbound `target="_blank"` links have `rel="noreferrer"`; CSP set via `<meta http-equiv>` in index.html (GitHub Pages cannot set response headers; `frame-ancestors` is an accepted omission). `npm audit` has 2 high-severity xlsx advisories (prototype pollution, ReDoS) — no fix available upstream; xlsx is used only for CSV/Excel export in the admin panel (non-public feature), acceptable risk at launch.
- [ ] **Accessibility audit** `[a11y]` `[manual]` `[launch-blocker]` ,  axe-core zero violations, full keyboard walkthrough, screen reader test (NVDA+Firefox, VoiceOver+Safari), 200%/400% zoom, prefers-reduced-motion, prefers-contrast, text spacing bookmarklet.
- [ ] **Functional audit** `[qa]` `[manual]` `[launch-blocker]` ,  Test all core flows end-to-end: search, select, copy, refine, reset, settings, platform filter, WCAG filter, language switch, live search toggle, pinning, ranking, narrow results, hash navigation, PWA install.
- [ ] **Mobile device testing** `[qa]` `[manual]` `[launch-blocker]` ,  Test on physical iOS Safari (iPhone SE and current model) and Android Chrome; verify touch targets, BottomSheet swipe, keyboard dismiss, and portrait/landscape layouts.
- [ ] **Google Search Console setup** `[infra]` `[seo]` `[manual]` `[launch-blocker]` ,  Verify domain ownership in Search Console, submit sitemap.xml, confirm indexing is enabled (remove noindex), monitor for crawl errors post-launch.
- [x] **Expert source attribution audit** `[corpus]` `[privacy]` `[manual]` `[launch-blocker]` ,  Completed May 13. All credited sources (Roselli, O'Hara, Watson, Lauke, Faulkner, TPGi, Deque, WebAIM, W3C, appt.org) are cited via links to their own published public articles — standard attribution practice, no permission required. About panel sources list reflects only organizations with public reference material.
- [ ] **OG image** `[seo]` `[infra]` `[launch-blocker]` ,  Create `public/og-image.png` (1200×630). Referenced by `og:image` and `twitter:image` in index.html — returns 404 until this file exists. Create after the production domain is live so the screenshot reflects the real URL.
- [ ] **Pre-launch checklist** `[infra]` `[manual]` `[launch-blocker]` ,  GDPR/privacy/terms, ~~SEO tags~~ (done — flip noindex when domain is live), OG image, Umami/error tracking, GitHub releases, social prep, domain/DNS, CDN, backup.
- [ ] **Post-launch monitoring** `[infra]` `[manual]` ,  Daily error logs, Search Console, Umami, respond to feedback <24h, weekly status, collect features.

---

## Resolved

All Phase 1 items, major milestones, and obsolete features. See CHANGELOG.md and UPDATES.md for technical details.

- ✅ Phase 1 complete (May 6)
- ✅ Public corpus fully sourced and WCAG-mapped
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
- ✅ Admin panel corpus split into Public (ACC) and Legacy (ATH) dataset tabs (May 9)
- ✅ Admin panel restyled with UI library components (May 9)
- ✅ Results layout consolidated: sort + actions in one row, rank hint repositioned (May 9)
- ✅ Footer: Mikey Ilagan linked to mikey.fyi with ref tracking (May 9)
- ✅ WCAG filter pending note repositioned to sit directly below description (May 9)
- ✅ ulam framework vanilla route announcer (taho-pandan) and focus manager (siling-mahaba) written (May 11)
- ✅ Remix 3 adapter imports updated from @remix-run/react to react-router (May 11)
- ✅ 3 ulam-specific neighbor lint rules added: no-announce-in-render, no-hash-router-in-remix, no-use-page-title-in-remix (May 11)
- ✅ neighbor and rogers moved to tools/; adobo renamed to rogers throughout (May 11)
- ✅ All docs updated for framework restructure; five-pass stale reference sweep complete (May 11)
- ✅ Zero JS errors, zero CSS errors, zero MD errors across all three linters (May 12)
- ✅ A11yPanelSettings bad export fixed; useCompletion/useProviderConfig refactored to useState lazy init (May 12)
- ✅ prefers-reduced-motion and prefers-reduced-transparency fallback blocks added to all UI components (May 12)
- ✅ neighbor stylelint rule updated to suppress when selector has existing prefers override (May 12)
- ✅ SEO meta tags updated: duplicate robots tag removed, description copy refreshed, sitemap lastmod bumped to 2026-05-13 (May 13)
- ✅ Code quality audit: all three linters clean, Sheet.jsx keyboard handler added, stale eslint-disable removed (May 13)
- ✅ Security audit: localStorage keys documented, console leaks verified DEV-only, all outbound links have rel="noreferrer", CSP correct, xlsx vulns noted as accepted risk (May 13)
- ✅ Privacy policy: GDPR-DRAFT.md finalized as docs/PRIVACY.md, linked from in-app Privacy & Storage panel (May 13)
- 💤 Deferred: SCSS migration, corpus pre-translation, Compare mode, Ko-fi donations, Ko-fi a11y patch, GitHub Sponsors
