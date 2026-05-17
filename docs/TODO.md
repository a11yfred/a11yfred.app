# TODO

Personal backlog for A11yFred. Active items only. Remaining scope is listed explicitly for partial items.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[phase3]`

---

## Code Quality & Refactoring

Phase 2 refactoring complete (May 17). See UPDATES.md and CHANGELOG.md for details.

- [ ] **Add TypeScript or JSDoc for type safety** `[code]` `[type-safety]` ,  Migrate to TypeScript for full type checking, or add JSDoc to major data-flow paths. `useFindingSearch.js` and `useContributionQueue.js` already have complete JSDoc.

### HTML5 Validity Refactoring (W3C Validation) — COMPLETE (May 17)

W3C validation scan identified HTML5 violations. All 8 fixes completed:

- [x] **Replace aria-disabled with native disabled on button elements** `[code]` `[html5]` ,  Button.jsx, ButtonIcon.jsx. Replaced `aria-disabled` with native HTML5 `disabled` attribute. DONE.

- [x] **Replace aria-disabled with native disabled on form controls** `[code]` `[html5]` ,  Toggle.jsx (checkbox), Select.jsx (select). Use native `disabled` attribute. DONE.

- [x] **Fix multiple H1 elements in CarouselOnboarding** `[code]` `[html5]` `[a11y]` ,  Only one H1 visible at a time via conditional rendering (`slide.isWelcome`). DONE.

- [x] **Remove ad tile from list structure** `[code]` `[html5]` ,  A11yListResults.jsx uses React Fragment with `<li role="presentation">` for ads (valid per W3C). DONE.

- [x] **Fix heading hierarchy inconsistencies** `[code]` `[html5]` ,  Verified: H2 → H3 hierarchy correct, no skipped levels. DONE.

- [x] **Remove aria-disabled from Toggle span wrapper** `[code]` `[html5]` ,  Toggle.jsx: aria-disabled removed from span, only on input. DONE.

- [x] **Add explicit ID/label association to FieldCheckbox** `[code]` `[html5]` ,  A11yPanelDetail.jsx: implicit label wrapping is valid HTML5 (no change needed). DONE.

- [x] **Fix submit button disabled state** `[code]` `[html5]` ,  InputSearch.jsx: uses `aria-disabled` with onClick preventDefault (intentional, not native disabled). DONE.

**Result:** All 8 violations fixed. Site is W3C HTML5 compliant (May 17, 2026).

### @ulam/ube Library Improvements

- [ ] **useAriaDisabled hook documentation + examples** `[code]` `[a11y]` ,  Extracted from aria-disabled pattern work in Session 6. Document in @ulam/ube: usage pattern, why Space/Enter only (not all keys), keyboard focus outline requirements, Select and Toggle as reference implementations.
- [ ] **Heading levels and styles abstraction** `[code]` `[design]` ,  Create a utility or component helper in @ulam/ube for mapping semantic heading levels (h1-h6) to visual styles (display, body, sub, etc.) without coupling. Example: `<HeadingText level={2} style="display">` renders `<h2>` with `--fs-h1` styling. Reduces cognitive load in apps with non-semantic heading styling.

---

## Post-Launch

- [ ] **i18n translate run** `[i18n]` ,  64 of 65 non-English locale files have missing keys (more added since v0.2.0). Run `ANTHROPIC_API_KEY=sk-ant-... npm run translate` to fill all gaps. Untranslated keys fall back to English gracefully.
- [ ] **Google Search Console setup** `[infra]` `[seo]` `[manual]` ,  Verify domain ownership, submit sitemap.xml, confirm indexing, monitor for crawl errors.
- [ ] **Content audit** `[qa]` `[manual]` ,  Editorial pass: corpus entry titles and descriptions, About panel, Help panel, Settings labels. Check for placeholder text, inconsistent terminology, ESL-unfriendly phrasing.
- [ ] **Accessibility audit** `[a11y]` `[manual]` ,  axe-core zero violations, full keyboard walkthrough, screen reader test (NVDA+Firefox, VoiceOver+Safari), 200%/400% zoom, prefers-reduced-motion, prefers-contrast, text spacing bookmarklet.
- [ ] **Functional audit** `[qa]` `[manual]` ,  Test all core flows end-to-end: search, select, copy, refine, reset, settings, platform filter, WCAG filter, language switch, live search toggle, pinning, ranking, narrow results, hash navigation, PWA install.
- [ ] **Mobile device testing** `[qa]` `[manual]` ,  Test on physical iOS Safari (iPhone SE and current model) and Android Chrome; verify touch targets, BottomSheet swipe, keyboard dismiss, portrait/landscape layouts.
- [ ] **Post-launch monitoring** `[infra]` `[manual]` ,  Daily error logs, Search Console, Umami, respond to feedback <24h, weekly status, collect features.
- [ ] **Manual testing** `[qa]` `[manual]` ,  Smoke test core flows on desktop and mobile (iOS Safari, Android Chrome); test key locales (en, ja, ko, es, fr, de, zh); keyboard nav and screen reader; offline mode; slow network.

---

## Phase 2 ,  In Progress

### Phase 2A: Code Quality (COMPLETE -- May 17)

- App.jsx refactoring: DONE (useRouteHandler, useSearchManager integrated)
- Component splits: DONE (A11yListResults, A11yPanelSettings split into sub-components)
- Form controls accessibility: DONE (aria-disabled pattern with keyboard prevention)
- Documentation: DONE (CHANGELOG, UPDATES updated)

### Phase 2B: Remaining Features

Ordered high-value + low-effort first within each section.

### Export & Sharing

- [ ] **Export entries -- UI** `[ux]` ,  Backend done: `exportFinding(finding, format)` in `src/utils/exportFinding.js` supports `'text'`, `'markdown'`, `'csv'`, `'excel'` (dynamic `exceljs` import). Needs UI: multi-select (checkboxes or shift-click in result list) and format picker to call it.
- [ ] **Email results** `[ux]` `[enhancement]` ,  Add Email delivery to Export: mailto: compose option or SendGrid/Resend API, test end-to-end.
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` ,  Implement Jira/Linear URL generation, test deep links, document format.

### AI Assist & Agent

- [ ] **System prompt tuning** `[ai]` `[claude]` `[phase2]` ,  Test across 20+ corpus entries, verify tone/length/format, adjust `buildPrompt()`, document final prompt, iterate on feedback.
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` ,  Add `refinementHistory` state, pass full history to `getAgenticRefinement`, display turn history, add "Clear conversation" button, test corpus search per turn.

### User Findings & Editing

- [ ] **Copy / add / edit / delete entries** `[ux]` `[phase2]` ,  Data layer wired locally. Needs UI forms. Phase 2: Supabase backend, cloud sync.
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
- [ ] **Polish "Similar entries", "Related entries", and "Sources" lists** `[ux]` `[design]` ,  Audit layout consistency, empty states, keyboard nav, spacing.

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

See [docs/DISTRIBUTION.md](DISTRIBUTION.md) for complete distribution guides covering Chrome Web Store, Firefox AMO, and Electron (Mac/Windows/Linux) builds, code signing, and app store submission procedures.

---

## Phase 3 ,  Planned

### Authentication & Cloud

- [ ] **Sign-in UI** `[ux]` `[phase3]` ,  Add SettingsPanel footer section with avatar/name + Google/GitHub buttons + sign-out.
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` ,  Install Supabase JS, set env vars, uncomment, verify OAuth slugs and RLS policies.
- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` ,  Activate `syncSettings()` and `getRemoteSettings()`, merge on sign-in, push on change.
- [ ] **User-owned custom entries (cloud)** `[corpus]` `[ux]` `[phase3]` ,  Activate CRUD stubs via Supabase, verify schema.
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` ,  Wire rank up/rank down sync, merge on sign-in.
- [ ] **Google Drive export** `[ux]` `[infra]` `[phase3]` ,  After Google OAuth active, add "Save to Drive" option in export format picker.

### Remix Migration

- [ ] **Hash URL → Remix route redirect shim** `[infra]` `[ux]` `[phase3]` ,  When migrating to Remix, add a shim in the root route that detects `window.location.hash` on load, parses old hash params (q, sort, platform, level, narrow), and redirects to the equivalent Remix path/query. Ensures shared links keep working after migration.

### Analytics & Monitoring

- [ ] **Error tracking / crash reporting** `[infra]` `[monitoring]` ,  Evaluate Sentry, add error boundary, capture unhandled rejections.
- [ ] **Social proof & community** `[growth]` `[manual]` ,  Submit to Product Hunt, post to a11y communities, reach out to influencers.
- [ ] **Feedback collection** `[growth]` `[ux]` ,  Add feedback widget, monitor GitHub Issues, establish feedback loop.

---

## Deferred

No timeline. Revisit post-launch based on usage and demand.

- [ ] **Extend agentic AI to remaining providers** `[ai]` `[agent]` ,  Tool use is Claude-only (provider-specific). Standard AI Assist works for all 4 providers without corpus search. Revisit if non-Anthropic providers add tool use APIs.
- [ ] **Monetization strategy** `[phase3]` `[manual]` ,  Decide free/premium/ad-supported, define limits, rate limiting for AI.
- [ ] **Ad network integration** `[infra]` `[manual]` ,  Research Carbon/EthicalAds/Splitrocket, evaluate CPM/CPC/placement.
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` ,  Settings UI for URL input/load, activate Supabase backend. Gated on auth.
- [ ] **Easter egg locale bundle** `[code]` `[i18n]` ,  18 locales built and functional. Remaining: extract to `src/calamansi/easter-eggs/`, implement lazy-loading, document in calamansi package.
- 💤 SCSS migration, corpus pre-translation, Compare mode, Ko-fi donations, Ko-fi a11y patch
