# TODO

Personal backlog for A11yFred. Active items only. Remaining scope is listed explicitly for partial items.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[phase3]`

---

## Code Quality & Refactoring

**Dependency order:** Context API consolidation must come first -- the component splits (Settings sections, App.jsx decomposition) are blocked on it because splitting without shared context only moves prop-drilling deeper, not eliminates it.

### Step 1 -- Consolidate state (unblocks everything else)

- [x] **Consolidate prop drilling using Context API or custom hooks** `[code]` `[refactor]` ,  Done May 14. SettingsContext, SearchContext, RatingsContext wired; ~140 prop slots removed; custom hooks useAppSettings, useAppSearch, useAppRatings extracted.

### Step 2 -- Split components (unblocked, in progress)

- [ ] **Break large components into single-responsibility pieces** `[code]` `[refactor]` ,  Current line counts: `App.jsx` 1601, `A11yListResults` 869, `A11yPanelSettings` 857, `A11yPanelDetail` 486. Split plan: `A11yListResults` -- extract keyboard nav to `useResultListKeyboard`, narrow mode to sub-component. `A11yPanelSettings` -- split into `SectionAiSettings`, `SectionSearchSettings`, `SectionLanguageSettings`, `SectionResetData`. `A11yPanelDetail` -- clipboard in `useSheetDetailClipboard` and AI in `useSheetDetailRefine` already extracted; no further split needed.
- [ ] **Decompose App.jsx** `[code]` `[refactor]` ,  1601 lines. Extract search manager (`useSearchManager`), party mode (`usePartyMode`), and route handler into dedicated hooks. `useThemeManager` already extracted.

### Step 3 -- Rename (high surface area, dedicated session)

- [ ] **Rename "finding" → "entry" throughout** `[code]` `[ux]` `[i18n]` ,  "Entry" better reflects the data model (a corpus entry, not necessarily an observed defect). Scope: all `en.json` keys, JSX labels, localStorage key names (`userFindings`, `pinnedFindings`, etc.), corpus field names, README, CONTRIBUTING, and docs. Run `npm run translate` after. Do in a dedicated session -- every file in the project is affected.

### Step 3 -- Refactoring optimizations

- [x] **Extract repeated label formatters** `[code]` `[refactor]` ,  Done May 14. Created `src/utils/labelFormatters.js` with `getPlatformLabel()` and `getViewAllPlatformLabel()`. Replaced inline ternary chains in App.jsx.
- [ ] **Clean up naming conventions** `[code]` `[refactor]` ,  Renamed `platform_` to `platformParam`. Review PanelReact naming.

### Ongoing

- [ ] **Add TypeScript or JSDoc for type safety** `[code]` `[type-safety]` ,  Migrate to TypeScript for full type checking, or add JSDoc to `App.jsx` and its major data-flow paths. `useFindingSearch.js` and `useContributionQueue.js` already have complete JSDoc. Start with the new context objects from Step 1 -- type them on creation.

---

## Post-Launch

- [ ] **i18n translate run** `[i18n]` ,  64 of 65 non-English locale files have missing keys (more added since v0.2.0). Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill all gaps. Untranslated keys fall back to English gracefully.
- [ ] **GitHub releases page** `[infra]` `[manual]` ,  Create v0.1.0 and v0.2.0 releases on GitHub, add notes.
- [ ] **Google Search Console setup** `[infra]` `[seo]` `[manual]` ,  Verify domain ownership, submit sitemap.xml, confirm indexing, monitor for crawl errors.
- [ ] **Content audit** `[qa]` `[manual]` ,  Editorial pass: corpus entry titles and descriptions, About panel, Help panel, Settings labels. Check for placeholder text, inconsistent terminology, ESL-unfriendly phrasing.
- [ ] **Accessibility audit** `[a11y]` `[manual]` ,  axe-core zero violations, full keyboard walkthrough, screen reader test (NVDA+Firefox, VoiceOver+Safari), 200%/400% zoom, prefers-reduced-motion, prefers-contrast, text spacing bookmarklet.
- [ ] **Functional audit** `[qa]` `[manual]` ,  Test all core flows end-to-end: search, select, copy, refine, reset, settings, platform filter, WCAG filter, language switch, live search toggle, pinning, ranking, narrow results, hash navigation, PWA install.
- [ ] **Mobile device testing** `[qa]` `[manual]` ,  Test on physical iOS Safari (iPhone SE and current model) and Android Chrome; verify touch targets, BottomSheet swipe, keyboard dismiss, portrait/landscape layouts.
- [ ] **Post-launch monitoring** `[infra]` `[manual]` ,  Daily error logs, Search Console, Umami, respond to feedback <24h, weekly status, collect features.
- [ ] **Manual testing** `[qa]` `[manual]` ,  Smoke test core flows on desktop and mobile (iOS Safari, Android Chrome); test key locales (en, ja, ko, es, fr, de, zh); keyboard nav and screen reader; offline mode; slow network.

---

## Phase 2 ,  In Progress

Ordered high-value + low-effort first within each section.

### Export & Sharing

- [ ] **Export findings -- UI** `[ux]` ,  Backend done: `exportFinding(finding, format)` in `src/utils/exportFinding.js` supports `'text'`, `'markdown'`, `'csv'`, `'excel'` (dynamic `exceljs` import). Needs UI: multi-select (checkboxes or shift-click in result list) and format picker to call it.
- [ ] **Email results** `[ux]` `[enhancement]` ,  Add Email delivery to Export: mailto: compose option or SendGrid/Resend API, test end-to-end.
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` ,  Implement Jira/Linear URL generation, test deep links, document format.

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

- [ ] **Update color theme to be more neighborly** `[design]` ,  Align the a11yfred color palette more closely with the neighbor framework's visual style.
- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` ,  Audit layout consistency, empty states, keyboard nav, spacing.

---

## Internationalization (i18n)

65 locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` ,  18 locales built and functional; extraction to standalone package pending. **Remaining**: (1) extract locale JSONs and `EASTER_EGG_LOCALES` map to `src/calamansi/easter-eggs/`, (2) implement lazy-loading to avoid bloating main bundle, (3) document in calamansi package for drop-in usage in other React projects.

---

## DevOps

### Infrastructure

- [ ] **Chrome extension -- validate and merge** `[infra]` ,  Icons generated (16/48/128px, May 13). Manifest at `extension-static/manifest.json`. Remaining: add separate Vite config (`vite.config.extension.js`) targeting `dist-extension/`, load unpacked at `chrome://extensions`, smoke-test at ~400px, merge.
- [ ] **Firefox extension -- validate and merge** `[infra]` ,  Icons generated (16/48/96px, May 13). Manifest at `extension-firefox-static/manifest.json`. Remaining: same Vite config work, load via `about:debugging`, add AMO extension ID to `gecko.id`, confirm sidebar, merge.
- [ ] **Electron desktop app -- icons, test, merge** `[infra]` ,  Add `build/icon.png` (512x512), `build/icon.icns` (macOS), `build/icon.ico` (Windows). Test on macOS/Windows, code-sign macOS, merge.

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
- [ ] **Social proof & community** `[growth]` `[manual]` ,  Submit to Product Hunt, post to a11y communities, reach out to influencers.
- [ ] **Feedback collection** `[growth]` `[ux]` ,  Add feedback widget, monitor GitHub Issues, establish feedback loop.

---

## mikey.fyi

- [ ] **Update mikey.fyi content to feature Laura's site** `[manual]` ,  Full accessible rebuild -- highlight it prominently.
- [ ] **Hide rogers from mikey.fyi** `[manual]` ,  Not ready to show publicly yet.
- [ ] **Add Laura's site under ulam on mikey.fyi** `[manual]`

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
