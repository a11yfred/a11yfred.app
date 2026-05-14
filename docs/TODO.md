# TODO

Personal backlog for A11yFred. Active items only. Remaining scope is listed explicitly for partial items.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[phase3]`  `[launch-blocker]`

---

## Code Quality & Refactoring

**Dependency order:** Context API consolidation must come first -- the component splits (Settings sections, App.jsx decomposition) are blocked on it because splitting without shared context only moves prop-drilling deeper, not eliminates it.

### Step 1 -- Consolidate state (unblocks everything else)

- [ ] **Consolidate prop drilling using Context API or custom hooks** `[code]` `[refactor]` ,  Audited May 13. `AppShell→AppContent` boundary: ~48 prop slots. Plan: two contexts only (no UIContext needed -- those 4 props don't drill past AppContent). `SettingsContext`: theme, language, aiEnabled, liveSearch, showVoting, showPersonalCorpus, wcagFilter, platform, fiestaUnlocked -- consumed by Settings panel, ListResults (x4), InputSearchHero, PanelDetail. `SearchContext`: query/submittedQuery/searchKey, selected, results/allFindings/sortedFindings, sortBy, ratings, pins, narrow state -- consumed by ListResults (22 props x4 = 88 slots, biggest win), PanelDetail, PanelAbout, PinnedSection. **Estimated total: ~140 prop slots removed.** Bonus: `locale`, `userOverridesHook`, `contributionQueueHook` are passed to `A11yPanelDetail` but not destructured -- dead props, remove when implementing context.
- [x] **Extract reused patterns into utilities** `[code]` `[refactor]` ,  Done May 13: `useKeydown(handler, { target, capture })` created and wired into `A11yListResults`, `A11yPanelSettings`, `CarouselOnboarding`. Modal/drawer open states are already router-driven. localStorage access already in `sawsawan/storage.js`. Pattern extraction complete.

### Step 2 -- Split components (blocked on Step 1)

- [ ] **Break large components into single-responsibility pieces** `[code]` `[refactor]` ,  Current line counts: `App.jsx` 1601, `A11yListResults` 869, `A11yPanelSettings` 857, `A11yPanelDetail` 486. Split plan: `A11yListResults` -- extract keyboard nav to `useResultListKeyboard`, narrow mode to sub-component. `A11yPanelSettings` -- split into `SectionAiSettings`, `SectionSearchSettings`, `SectionLanguageSettings`, `SectionResetData` (naming convention already decided -- blocked on context consolidation). `A11yPanelDetail` -- clipboard in `useSheetDetailClipboard` and AI in `useSheetDetailRefine` already extracted; no further split needed until context is wired. **Blocked on Step 1.**
- [ ] **Decompose App.jsx** `[code]` `[refactor]` ,  1601 lines. Extract search manager (`useSearchManager`), party mode (`usePartyMode`), and route handler into dedicated hooks. `useThemeManager` already extracted. **Blocked on Step 1.**

### Step 3 -- Rename (high surface area, dedicated session)

- [ ] **Rename "finding" → "entry" throughout** `[code]` `[ux]` `[i18n]` ,  "Entry" better reflects the data model (a corpus entry, not necessarily an observed defect). Scope: all `en.json` keys, JSX labels, localStorage key names (`userFindings`, `pinnedFindings`, etc.), corpus field names, README, CONTRIBUTING, and docs. Run `npm run translate` after. Do in a dedicated session -- every file in the project is affected.

### Ongoing

- [ ] **Add TypeScript or JSDoc for type safety** `[code]` `[type-safety]` ,  Migrate to TypeScript for full type checking, or add JSDoc to `App.jsx` and its major data-flow paths. `useFindingSearch.js` and `useContributionQueue.js` already have complete JSDoc. Start with the new context objects from Step 1 -- type them on creation.
- [x] **Standardize locale/language naming** `[code]` `[i18n]` ,  Audited May 13: `language` (App state, user-facing) vs `locale` (hook param, BCP 47) is intentional. `findingSearchService.js` and `dataService.js` both use `locale` consistently throughout -- no mixed naming found. No code change needed.
- [x] **Add JSDoc to complex hooks** `[code]` ,  `useFindingSearch.js` and `useContributionQueue.js` both have complete `@param`/`@returns` JSDoc (verified May 13).
- [x] **Rename CSS classes from `detail-*` prefix** `[code]` `[design]` ,  Done May 13: all 139 occurrences of `.detail-*` renamed to `.panel-detail-*` across `A11yPanelDetail.css`, `A11yPanelDetail.jsx`, `A11yListResults.css`, and `A11yPanelSettings.jsx`. ESLint and Stylelint clean.
- [x] **Address remaining JS warnings** `[code]` ,  Resolved in May 2026 lint pass. Zero ESLint warnings. All `prefer-aria-disabled` and `no-target-blank-without-label` violations cleared.

---

## Phase 1 ,  Launch Day Essentials

**Can be done now** (no domain required):

- [ ] **i18n translate run** `[i18n]` ,  64 of 65 non-English locale files have missing keys (465 unique keys added since last translate run). Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill all gaps. Moved to Phase 1.5 -- app is fully usable in English without this; untranslated keys fall back to English gracefully.
- [ ] **Manual testing before launch** `[qa]` `[manual]` ,  Smoke test core flows: search/select/refine/copy on desktop and mobile (iOS Safari, Android Chrome); test all locales (en, ja, ko, es, fr, de, zh); test keyboard nav (Tab, Enter, Escape); test screen reader (NVDA, JAWS, VoiceOver); verify offline mode works; test on slow network (throttle to 3G).
- [ ] **Production domain configured** `[infra]` `[manual]` ,  Confirm domain, configure DNS, enable HTTPS, update canonical URL.

---

## Phase 1.5 ,  Post-Domain / Pre-Launch

**Gated on production domain being live:**

- [ ] **Update canonical URL** `[seo]` `[code]` ,  Update `og:url`, `og:image`, `twitter:*`, and JSON-LD URLs in `index.html` from placeholder `a11yfred.app` to confirmed production domain.
- [ ] **Remove `noindex`** `[seo]` `[infra]` ,  Replace `<meta name="robots" content="noindex">` with `index, follow` once domain is live and content is ready to be crawled.
- [ ] **OG image** `[seo]` `[infra]` `[launch-blocker]` ,  Create `public/og-image.png` (1200×630). Screenshot should reflect the real production URL. Referenced by `og:image` and `twitter:image` in index.html; returns 404 until this file exists.
- [ ] **i18n translate run** `[i18n]` ,  Moved from Phase 1. Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill 465 missing keys across 64 locale files. Falls back to English gracefully until done.
- [ ] **Umami analytics activation** `[infra]` `[manual]` ,  Moved from DevOps. Sign up at umami.is (~$9/mo cloud, no self-hosting), create site, replace WEBSITE_ID placeholder in `index.html`, verify zero cookies. Preferred over GA -- privacy-respecting, no consent banner needed, right fit for an a11y audience.
- [ ] **Google Search Console setup** `[infra]` `[seo]` `[manual]` ,  Verify domain ownership, submit sitemap.xml, confirm indexing is enabled, monitor for crawl errors post-launch.

---

## Phase 2 ,  In Progress

Ordered high-value + low-effort first within each section.

### Data & Content

- [x] **Add native-specific corpus entries** `[corpus]` `[phase2]` ,  28 native/both entries in corpus (ACC-017, ACC-028, ACC-031, ACC-044, ACC-065, ACC-068, ACC-070, ACC-090, ACC-100, ACC-105, and 18 more). Covers Dynamic Type, accessibility labels, announcements, and custom actions.

### Export & Sharing

- [ ] **Export findings -- UI** `[ux]` ,  Backend done: `exportFinding(finding, format)` in `src/utils/exportFinding.js` supports `'text'`, `'markdown'`, `'csv'`, `'excel'` (dynamic `exceljs` import, `xlsx` removed). Needs UI: multi-select (checkboxes or shift-click in result list) and format picker to call it.
- [ ] **Email results** `[ux]` `[enhancement]` ,  Add Email delivery to Export: mailto: compose option or SendGrid/Resend API, test end-to-end.
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` ,  Implement Jira/Linear URL generation, test deep links, document format.

### Related Entry Ranking

- [x] **Wire related-entry ranking** `[ux]` `[corpus]` `[phase2]` ,  Fully wired. `relatedItems()` called in `A11yListRelated.jsx` with `wcagRankTier` rankFn (7-tier: same SC, AAA pair, reverse-related, shared SC overlap, keyword overlap, co-selection boost). `A11yPanelDetail` renders `<A11yListRelated>` with `getPairsFor` from `useCoSelection`. UI decision on replacing vs. supplementing `relatedSC` display: deferred to Design & Polish.

### AI Assist & Agent

- [ ] **System prompt tuning** `[ai]` `[claude]` `[phase2]` ,  Test across 20+ corpus entries, verify tone/length/format, adjust `buildPrompt()`, document final prompt, iterate on feedback.
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` ,  Add `refinementHistory` state, pass full history to `getAgenticRefinement`, display turn history, add "Clear conversation" button, test corpus search per turn.

### User Findings & Editing

- [ ] **Copy / add / edit / delete findings** `[ux]` `[phase2]` ,  Data layer wired locally. Needs UI forms. Phase 2: Supabase backend, cloud sync.
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` `[manual]` ,  Works via debug command. Add Settings UI toggle, document behavior.

### Multilingual Edit Flow

Backend complete. UI dialogs pending. All i18n keys are in `en.json`; hooks and services are wired; personal overrides are applied in `useFindingSearch` and visible in search results.

- [ ] **Save changes button in A11yPanelDetail** `[ux]` `[i18n]` `[phase2]` ,  Add button (shows when edited), check locale, save via `useUserOverrides` or trigger edit-scope dialog.
- [ ] **Edit target dialog** `[ux]` `[i18n]` ,  Modal: "Personal entries" vs. "Shared corpus"; wire hooks.
- [ ] **Edit scope dialog** `[ux]` `[i18n]` `[phase2]` ,  Three options: `lang_only`, `lang_and_en`, `all_langs`; show warning for personal saves.
- [ ] **English switch transition (lang_and_en flow)** `[ux]` `[design]` ,  Animate bottom sheet, show skip dialog, preserve app locale.
- [ ] **Personal override indicator in A11yPanelDetail** `[ux]` `[design]` ,  Show badge near title with timestamp when `_hasOverride` is true.
- [ ] **Contributions review panel (maintainer)** `[ux]` `[manual]` ,  Add section in `A11yPanelSettings` for pending contributions with approve/reject/export.
- [ ] **Reset All excludes personal overrides and contributions** `[ux]` `[privacy]` `[design]` ,  Separate overrides/contributions from Reset All, require explicit user action to clear.

### Design & Polish

- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` ,  Audit layout consistency, empty states, keyboard nav, spacing.

---

## Internationalization (i18n)

65 locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` ,  18 locales built and functional; extraction to standalone package pending. **Remaining**: (1) extract locale JSONs and `EASTER_EGG_LOCALES` map to `src/calamansi/easter-eggs/`, (2) implement lazy-loading for locale files to avoid bloating main bundle, (3) document in calamansi package for drop-in usage in other React projects

---

## DevOps

### Infrastructure

- [x] **PWA icons** `[infra]` `[ux]` ,  `public/icon-192.png` and `public/icon-512.png` generated (purple rounded-square, white A). `vite.config.js` manifest updated to include all three icon entries (SVG + 192 + 512).
- [x] **xlsx vulnerability** `[infra]` `[privacy]` ,  `xlsx` (SheetJS) removed. Replaced with `exceljs` in both `exportFinding.js` and `importService.js`. `npm audit` clean (0 vulnerabilities). `vite.config.js` manual chunk updated to `exceljs`.
- [ ] **Version tagging** `[infra]` ,  Decide corpus threshold, create `v0.1.0` tag, push to GitHub releases.
- [ ] **Chrome extension -- validate and merge** `[infra]` ,  Icons generated (16/48/128px, May 13). Manifest at `extension-static/manifest.json`. Remaining: add separate Vite config (`vite.config.extension.js`) targeting `dist-extension/`, load unpacked at `chrome://extensions`, smoke-test at ~400px, merge.
- [ ] **Firefox extension -- validate and merge** `[infra]` ,  Icons generated (16/48/96px, May 13). Manifest at `extension-firefox-static/manifest.json`. Remaining: same Vite config work, load via `about:debugging`, add AMO extension ID to `gecko.id`, confirm sidebar, merge.
- [ ] **Electron desktop app -- icons, test, merge** `[infra]` ,  Add `build/icon.png` (512×512), `build/icon.icns` (macOS), `build/icon.ico` (Windows). Test on macOS/Windows, code-sign macOS, merge.

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

### Authentication & Cloud

- [ ] **Sign-in UI** `[ux]` `[phase3]` ,  Add SettingsPanel footer section with avatar/name + Google/GitHub buttons + sign-out.
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` ,  Install Supabase JS, set env vars, uncomment, verify OAuth slugs and RLS policies.
- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` ,  Activate `syncSettings()` and `getRemoteSettings()`, merge on sign-in, push on change.
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` `[phase3]` ,  Activate CRUD stubs via Supabase, verify schema.
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` ,  Wire rank up/rank down sync, merge on sign-in.
- [ ] **Google Drive export** `[ux]` `[infra]` `[phase3]` ,  After Google OAuth active, add "Save to Drive" option in export format picker.

### Remix Migration

- [ ] **Hash URL → Remix route redirect shim** `[infra]` `[ux]` `[phase3]` ,  When migrating to Remix, add a shim in the root route that detects `window.location.hash` on load, parses old hash params (q, sort, platform, level, narrow), and redirects to the equivalent Remix path/query. Ensures shared links keep working after migration.

### Analytics & Monitoring

- [ ] **Error tracking / crash reporting** `[infra]` `[monitoring]` ,  Evaluate Sentry, add error boundary, capture unhandled rejections.
- [ ] **GitHub releases page** `[infra]` `[manual]` ,  Create v0.1.0 release, add notes, attach artifacts.
- [ ] **Social proof & community** `[growth]` `[manual]` ,  Submit to Product Hunt, post to a11y communities, reach out to influencers.
- [ ] **Feedback collection** `[growth]` `[ux]` ,  Add feedback widget, monitor GitHub Issues, establish feedback loop.

### Search & Visibility

- [ ] **Search Console setup** `[infra]` `[seo]` `[manual]` ,  See Phase 1.5 -- gated on domain.
- [ ] **Update canonical URL to production domain** `[seo]` `[code]` ,  See Phase 1.5 -- gated on domain.

---

## Deferred

No timeline. Revisit post-launch based on usage and demand.

- [ ] **Extend agentic AI to remaining providers** `[ai]` `[agent]` ,  Tool use is Claude-only (provider-specific). Standard AI Assist works for all 4 providers without corpus search. Revisit if non-Anthropic providers add tool use APIs.
- [ ] **Monetization strategy** `[phase3]` `[manual]` ,  Decide free/premium/ad-supported, define limits, rate limiting for AI.
- [ ] **Ad network integration** `[infra]` `[manual]` ,  Research Carbon/EthicalAds/Splitrocket, evaluate CPM/CPC/placement.
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` ,  Settings UI for URL input/load, activate Supabase backend. Gated on auth.
- [ ] **UI component library extraction (npm publishing)** `[code]` `[enhancement]` ,  Accessible SPA primitives fully built and in production. Defer to v1.1 post-launch: (1) confirm button unification complete, (2) audit component APIs for cross-project reusability, (3) scaffold monorepo structure, (4) publish to npm.
- [ ] **Easter egg locale bundle** `[code]` `[i18n]` ,  18 locales built and functional. Remaining: extract to `src/calamansi/easter-eggs/`, implement lazy-loading, document in calamansi package.
- 💤 SCSS migration, corpus pre-translation, Compare mode, Ko-fi donations, Ko-fi a11y patch, GitHub Sponsors

### Launch Readiness

- [ ] **Content audit** `[qa]` `[manual]` `[launch-blocker]` ,  Full editorial pass: all visible UI strings, corpus entry titles and descriptions, About panel, Help panel, Settings labels. Check for placeholder text, inconsistent terminology, and ESL-unfriendly phrasing. Known issues resolved May 13: 7 dead `en.json` keys removed; `about.feature_languages_label` updated to "65 Languages"; `settings.privacy_body_1` updated with all localStorage keys. Remaining: editorial pass on corpus entry copy and UI strings not yet done.
- [x] **Code quality audit** `[code]` `[manual]` `[launch-blocker]` ,  ESLint/Stylelint/Markdownlint all clean (May 13). Fixed Sheet.jsx click-without-keyboard lint error; removed stale eslint-disable directive in App.jsx. All console.* calls are DEV-gated. i18n translation TODOs remain in locale files, not production paths.
- [x] **Security audit** `[privacy]` `[manual]` `[launch-blocker]` ,  Completed May 13 (updated May 13): all localStorage keys inventoried and documented in PRIVACY.md; no keys logged to console; all outbound `target="_blank"` links have `rel="noreferrer"` and sr-only text; CSP set via `<meta http-equiv>` in index.html. `xlsx` removed and replaced with `exceljs` -- `npm audit` now reports 0 vulnerabilities.
- [ ] **Accessibility audit** `[a11y]` `[manual]` `[launch-blocker]` ,  axe-core zero violations, full keyboard walkthrough, screen reader test (NVDA+Firefox, VoiceOver+Safari), 200%/400% zoom, prefers-reduced-motion, prefers-contrast, text spacing bookmarklet.
- [ ] **Functional audit** `[qa]` `[manual]` `[launch-blocker]` ,  Test all core flows end-to-end: search, select, copy, refine, reset, settings, platform filter, WCAG filter, language switch, live search toggle, pinning, ranking, narrow results, hash navigation, PWA install.
- [ ] **Mobile device testing** `[qa]` `[manual]` `[launch-blocker]` ,  Test on physical iOS Safari (iPhone SE and current model) and Android Chrome; verify touch targets, BottomSheet swipe, keyboard dismiss, and portrait/landscape layouts.
- [ ] **Google Search Console setup** `[infra]` `[seo]` `[manual]` `[launch-blocker]` ,  See Phase 1.5 -- gated on domain.
- [x] **Expert source attribution audit** `[corpus]` `[privacy]` `[manual]` `[launch-blocker]` ,  Completed May 13. All credited sources (Roselli, O'Hara, Watson, Lauke, Faulkner, TPGi, Deque, WebAIM, W3C, appt.org) are cited via links to their own published public articles. Standard attribution practice, no permission required. About panel sources list reflects only organizations with public reference material.
- [ ] **Pre-launch checklist** `[infra]` `[manual]` `[launch-blocker]` ,  OG image (see Phase 1.5), flip noindex when domain is live, Umami/error tracking, GitHub releases, social prep, CDN, backup.
- [ ] **Post-launch monitoring** `[infra]` `[manual]` ,  Daily error logs, Search Console, Umami, respond to feedback <24h, weekly status, collect features.

---

## Resolved

All Phase 1 items, major milestones, and obsolete features. See CHANGELOG.md and UPDATES.md for technical details.

- ✅ Phase 1 complete (May 6)
- ✅ Public corpus fully sourced and WCAG-mapped
- ✅ All linters passing (ESLint 9.x, Stylelint, Markdownlint)
- ✅ Offline-first support (Service Worker, PWA manifest). Implemented May 13 via vite-plugin-pwa. Workbox precaches app shell and all assets. Google Fonts cached at runtime.
- ✅ Accessibility baseline (axe-core, WCAG 2.2 AA, keyboard + screen reader tested)
- ✅ Documentation (README, CONTRIBUTING, SECURITY, DEPLOYING, CHANGELOG, UPDATES)
- ✅ SEO infrastructure (robots.txt, sitemap.xml, meta tags, structured data)
- ✅ Agentic AI wired (A11yPanelDetail toggle, A11yPanelSettings config, corpus search)
- ✅ AI provider privacy comparison table (README)
- ✅ Button consolidation (70+ instances → 2 base components)
- ✅ CSS tokenization (all outline/spacing/motion values to tokens)
- ✅ UI component library extracted and portable
- ✅ Zero dead code and unused imports
- ✅ Comprehensive code review and refactoring (May 5)
- ✅ Code cleanup and dead code removal (May 6)
- ✅ UI library decoupling and panel unification (May 6)
- ✅ Extract inline UI primitives to src/components/ui/ (Toggle, RadioChip, Select)
- ✅ Complete UI component library extraction for boilerplate (StateButton, InputWithClear, Badge, Field, PanelShell, ButtonBack, Modal, Announcer)
- ✅ Wire agentic AI in A11yPanelDetail (agent toggle, settings config, corpus search)
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
- ✅ Security audit: localStorage keys documented, console leaks verified DEV-only, all outbound links have rel="noreferrer", CSP correct (May 13)
- ✅ xlsx removed, replaced with exceljs (0 npm audit vulnerabilities) (May 13)
- ✅ Privacy policy: GDPR-DRAFT.md finalized as docs/PRIVACY.md, linked from in-app Privacy & Storage panel (May 13)
- ✅ SheetDetail → A11yPanelDetail, A11yListResult → A11yListResults renamed throughout (May 13)
- ✅ useDetailSheetClipboard/useDetailSheetRefine renamed to useSheetDetailClipboard/useSheetDetailRefine (May 13)
- ✅ relatedItems() fully wired via A11yListRelated with wcagRankTier rankFn (May 13)
- ✅ PWA icons: icon-192.png and icon-512.png regenerated with Outfit ExtraBold-style A letterform matching site H1 typeface (May 13)
- ✅ exportFinding() extended: csv, excel formats added (exceljs for xlsx output) (May 13)
- ✅ BOM stripped from 6 locale files and 3 source files (App.jsx, A11yPanelAbout.jsx, A11yPanelSettings.jsx) (May 13)
- ✅ Duplicate search.narrow_clear_aria key removed from en.json and 56 locale files (May 13)
- ✅ Settings section naming convention established: Section* prefix (SectionAiSettings, SectionSearchSettings, SectionLanguageSettings, SectionResetData) (May 13)
- ✅ CSS class rename: 139 occurrences of `.detail-*` renamed to `.panel-detail-*` across A11yPanelDetail.css/.jsx, A11yListResults.css, A11yPanelSettings.jsx (May 13)
- ✅ JSDoc audit: useFindingSearch.js and useContributionQueue.js both have complete @param and @returns docs -- no work needed (May 13)
