# TODO

Personal backlog for A11yTextHelper. Items show status: **COMPLETED**, **OBSOLETE**, or **PARTIALLY COMPLETE** with remaining scope rewritten.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[dormant]` `[phase3]` `[launch-blocker]`

---

## Data & Content

### Corpus & Findings

- [ ] **Keyword audit** `[corpus]` `[manual]` `[dormant]` — **COMPLETE**: all 89 public corpus entries have keywords populated; audit could improve relevance by expanding synonyms and component names, but is not blocking; low priority; keep as dormant reference for future optimization
- [ ] **Add native-specific corpus entries** `[corpus]` `[phase2]` — **PARTIALLY COMPLETE**: 44/76 entries are platform-relevant to native (57.9%); Phase 1 target met (40% threshold); **remaining scope**: Phase 2 expansion to add 4 native-specific entries covering: (1) Dynamic Type sizing (iOS), (2) Custom accessibility label requirements (UIAccessibilityLabel / contentDescription), (3) Native accessibility announcements (UIAccessibilityPostNotification), (4) Custom accessibility actions (UIAccessibilityCustomAction); defer to Phase 2 unless blocking a user need
- [ ] **Related SC links** `[corpus]` `[manual]` `[dormant]` — **COMPLETE**: all entries have `related` arrays populated; audit could improve accuracy by spot-checking secondary SC citations, but accuracy is acceptable for Phase 1; **remaining scope**: defer until frequency tracking is active so you can prioritize auditing the most-viewed entries first
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` `[manual]` — **PARTIALLY COMPLETE**: switching works via debug command (`debug corpus personal|public`); **remaining scope**: (1) add Settings UI toggle (not debug-only), (2) document behavior in README and feature docs; prereq: not blocking, but nice-to-have for v1.1
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` `[phase2]` — **PARTIALLY COMPLETE**: `importFromUrl` function handles public JSON URLs; **remaining scope**: (1) Settings UI with URL input + load button + error handling, (2) activate Supabase backend for authenticated users in Phase 2; prereq: Authentication (Phase 3)
- [ ] **Public corpus bootstrap** `[corpus]` `[phase3]` — **OBSOLETE**: corpus bootstrap is complete with 89 entries, exceeding original 80–100 target; this item is no longer relevant
- [ ] **Auth-gated custom findings** `[corpus]` `[privacy]` `[phase3]` `[launch-blocker]` — **NOT STARTED**: requires Phase 3 authentication infrastructure; scope: sync user-created findings to Supabase RLS-protected table; unauthenticated users use localStorage only; custom data never ships in public build; prereq: Google/GitHub OAuth activation

### Competitive / Differentiators

- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` — **PARTIALLY COMPLETE**: concept is clear and implementation (deep links without auth) is straightforward; **remaining scope**: (1) implement URL format generation for Jira/Linear in export flow, (2) test deep links against live Jira/Linear instances, (3) document URL format in README
- [ ] **Compare mode** `[ux]` `[enhancement]` — **OBSOLETE**: split-view design requires significant DetailPanel refactoring and is not blocking Phase 1; defer to Phase 2+ if user feedback warrants it

---

## User Experience Design

### UX

- [ ] **Email results** `[ux]` `[enhancement]` — **PARTIALLY COMPLETE**: concept is clear and wired to export pipeline; **remaining scope**: (1) complete Export findings implementation (multi-select + report generation), (2) add Email delivery option to export dialog, (3) wire email service provider (SendGrid/Resend), (4) test end-to-end
- [ ] **Pinned result handling in search** `[ux]` `[enhancement]` — **OBSOLETE**: current pinned behavior is intentional; suggestion to hide pinned from search is a v1.2+ enhancement trade-off decision; keep pinned+search overlap for v1.0
- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` — **PARTIALLY COMPLETE**: sections exist in DetailPanel; **remaining scope**: (1) audit layout consistency across all three sections, (2) ensure empty states are clear, (3) verify keyboard navigation is consistent, (4) standardize spacing/spacing patterns
- [ ] **Copy / add / edit / delete findings** `[ux]` `[enhancement]` — **PARTIALLY COMPLETE**: data layer wired (`userFindingsService.js`, `useUserFindings.js`, merged into `useFindingSearch`); UI forms and inline edit pending; **remaining scope**: (1) build forms and inline edit UI, (2) wire copy button to trigger duplication flow, (3) activate cloud persistence via Supabase in Phase 2; auth required
- [ ] **Advanced search syntax** `[ux]` `[search]` — **PARTIALLY COMPLETE**: concept is clear; **remaining scope**: (1) implement query parser for `+term` and `-term` operators, (2) integrate pre-filter step before Fuse.js, (3) add syntax hint tooltip near search bar, (4) test edge cases (operators + fuzzy search together)
- [ ] **Export findings** `[ux]` — **PARTIALLY COMPLETE**: architecture planned (integrate with Email results via shared report pipeline); **remaining scope**: (1) multi-select UI in ResultList, (2) report generation (Markdown/plain text templates), (3) integrate with Email results, (4) test formatting and ensure findings export cleanly

### Multilingual Edit Flow

Backend complete. UI dialogs pending. All i18n keys are in `en.json`; hooks and services are wired; personal overrides are applied in `useFindingSearch` and visible in search results.

- [ ] **Save changes button in DetailPanel** `[ux]` `[i18n]` — **NOT STARTED**: unblocks entire multilingual edit flow; **remaining scope**: add "Save changes" button that triggers edit-flow dialog for non-English locale, save directly as override for English
- [ ] **Edit target dialog** `[ux]` `[i18n]` — **NOT STARTED**: required after Save Changes button; **remaining scope**: modal with two choices ("Save to my personal entries" / "Suggest to shared corpus"); wire `useUserOverrides.saveOverride` and `useContributionQueue.submitContribution`
- [ ] **Edit scope dialog** `[ux]` `[i18n]` — **NOT STARTED**: required after target selection; **remaining scope**: three radio options (`lang_only`, `lang_and_en`, `all_langs`); show `edit.personal_ai_warning` for `lang_only` personal saves
- [ ] **English switch transition (lang_and_en flow)** `[ux]` `[design]` — **NOT STARTED**: only needed for `lang_and_en` flow; **remaining scope**: (1) animate bottom sheet close/reopen showing English version, (2) show dialog first giving chance to skip, (3) do not change app-wide locale, only finding panel content
- [ ] **Personal override indicator in DetailPanel** `[ux]` `[design]` — **NOT STARTED**: visual feedback; **remaining scope**: when `finding._hasOverride` is true, show badge/label near title with timestamp from `_overrideEditedAt`; nice-to-have but not blocking multilingual edit
- [ ] **Contributions review panel (maintainer)** `[ux]` `[manual]` — **NOT STARTED**: maintainer-only feature; **remaining scope**: add section in SettingsPanel listing pending contributions with approve/reject/export controls; wire `useContributionQueue` and `exportJson()`; merge still runs via `scripts/apply-contributions.mjs`
- [ ] **Reset All includes personal overrides and contributions** `[ux]` `[privacy]` — **PARTIALLY COMPLETE**: Reset All exists; **remaining scope**: (1) verify Reset All calls `clearAllOverrides()` and `clearContributions()`, (2) confirm UI lists both when clearing, (3) test in UI
- [ ] **Ko-fi link in footer** `[ux]` `[dormant]` — **OBSOLETE**: Ko-fi widget already provides discoverability for Phase 1; nice-to-have for v1.1+

---

## Accessibility (A11Y)

- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` `[dormant]` — **PARTIALLY COMPLETE**: patches work in development; **remaining scope**: open deployed app, confirm selectors still match live Ko-fi DOM (selectors may drift with Ko-fi updates), adjust if needed; manual testing only

---

## AI

### AI Assist

- [ ] **Wire Microsoft Copilot** `[ai]` — **NOT STARTED**: requires Azure OpenAI; **remaining scope**: (1) set `VITE_AZURE_OPENAI_ENDPOINT` in `.env.local`, (2) verify response parses correctly in `aiService.js`, (3) test against sample finding
- [ ] **System prompt tuning** `[ai]` `[claude]` — **PARTIALLY COMPLETE**: baseline prompt is established; **remaining scope**: test refinements across 20+ finding types covering variety of SCs, priorities, and platforms; adjust tone/length/format in `buildPrompt` if output drifts; document final prompt version

### AI Agent Support

Agent support means upgrading the single-shot AI refinement call into a multi-step, tool-using workflow. The goals are: more accurate rewrites, corpus-aware suggestions, and eventually autonomous finding research.

- [ ] **Wire agentic AI in DetailPanel** `[agent]` `[ai]` `[ux]` — **PARTIALLY COMPLETE**: backend (`agenticAiService.js` with tool use + search_corpus + error handling) is implemented; **remaining scope**: (1) wire toggle in Refine section of DetailPanel, (2) expose mode toggle in Settings under AI Assist, (3) document agentic workflow in How-To-Use page
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` — **NOT STARTED**: extends agentic AI; **remaining scope**: (1) extend Refine section to show turn history, (2) store history in component state as `{ role, content }[]`, (3) pass full history in subsequent calls, (4) add "Clear conversation" button

---

## Internationalization (i18n)

50+ locale files covering Latin, CJK, RTL, and indigenous scripts. `en.json` is the source of truth; run `npm run translate` after adding keys.

- [ ] **AI refinement locale pass** `[i18n]` `[ai]` `[claude]` `[enhancement]` — **OBSOLETE**: high API cost enhancement; defer to v1.2+ if localization quality needs improvement; current approach of translating English AI output is acceptable for Phase 1
- [ ] **Corpus pre-translation script** `[i18n]` `[corpus]` `[claude]` `[enhancement]` — **OBSOLETE**: defer to Phase 2 when corpus is stable and multilingual audit can be prioritized; not blocking Phase 1

---

## Plugins

- [ ] **Easter egg locale bundle** `[code]` `[i18n]` — **PARTIALLY COMPLETE**: 18 locales built and functional; extraction to standalone package pending; **remaining scope**: (1) extract locale JSONs and `EASTER_EGG_LOCALES` map to `src/plugins/easter-eggs/`, (2) implement lazy-loading for locale files to avoid bloating main bundle, (3) document plugin API for drop-in usage in other React projects
- [ ] **Ko-fi a11y patch as standalone plugin** `[code]` `[a11y]` `[dormant]` — **PARTIALLY COMPLETE**: patch is working in `App.jsx`; extraction to plugin pending; **remaining scope**: (1) extract `patchKofiA11y` to `src/plugins/kofi/KofiWidget.jsx` and `index.js`, (2) include self-contained `kofi.css`, (3) document selectors and note maintenance burden if Ko-fi's markup changes

---

## DevOps

### Code Quality

- [ ] **Migrate inline spacing to tokens** `[code]` `[claude]` — **COMPLETE**: 222+ spacing token usages throughout `index.css` (4,299 lines); spacing is fully tokenized; spot audit shows no remaining raw px/rem spacing values; no further work needed
- [ ] **UI component library extraction** `[code]` `[claude]` `[dormant]` — **PARTIALLY COMPLETE**: accessible SPA primitives are built (router, announcer, focus/names debuggers, form controls, button system); **remaining scope**: (1) confirm button unification is fully complete, (2) audit component APIs for stability, (3) scaffold monorepo structure (`packages/core`, `packages/ui`, `packages/app`), (4) extract plugins and UI components; defer to post-v1.0 when APIs stabilize; complexity is high and not critical path
- [ ] **CSS Modules / SCSS evaluation** `[code]` `[claude]` — **COMPLETE**: decision confirmed — CSS Modules ruled out (BEM + custom properties give effective scoping); SCSS nesting is most likely future path if `index.css` grows beyond 5K lines; defer SCSS until post-button-unification + component-library-extraction; current CSS structure is acceptable for Phase 1

### Infrastructure

- [ ] **Version tagging** `[infra]` — **PARTIALLY COMPLETE**: tagging strategy is defined; **remaining scope**: (1) decide stable corpus threshold, (2) create `v0.1.0` tag on Phase 1 launch, (3) push tags to GitHub releases page; can be done anytime post-stabilization
- [ ] **Chrome extension — validate and merge** `[infra]` — **PARTIALLY COMPLETE**: scaffold complete on `feature/chrome-extension`; **remaining scope**: (1) add 16/48/128px PNG icons, (2) load unpacked from `dist-extension/`, (3) smoke-test search/copy/settings/AI refine at ~400px width, (4) merge when layout confirmed
- [ ] **Firefox extension — validate and merge** `[infra]` — **PARTIALLY COMPLETE**: scaffold complete on `feature/firefox-extension`; **remaining scope**: (1) add PNG icons, (2) load via `about:debugging`, (3) confirm sidebar behavior, (4) merge when confirmed
- [ ] **Electron desktop app — icons, test, merge** `[infra]` — **PARTIALLY COMPLETE**: functionally complete on `feature/electron-app`; **remaining scope**: (1) add app icons (`.icns` / `.ico` / `.png`), (2) test end-to-end on macOS/Windows (safeStorage persistence, AI refine), (3) code-sign macOS build, (4) merge when icons ready
- [ ] **Umami analytics** `[infra]` `[dormant]` `[manual]` — **PARTIALLY COMPLETE**: integration point is clear; **remaining scope**: (1) sign up at umami.is, (2) replace `YOUR_WEBSITE_ID` in `index.html`, (3) verify zero cookies in dashboard, (4) enable on deployment; can be done anytime pre-launch
- [ ] **Phase 3 hosting strategy** `[infra]` `[dormant]` `[phase3]` — **OBSOLETE**: deployment strategy is undecided and deferred by design; revisit in Phase 3 planning (options: separate Netlify/Vercel site, subdomain, self-hosted)

### Privacy & Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` `[dormant]` `[phase3]` `[launch-blocker]` — **PARTIALLY COMPLETE**: draft exists at `docs/GDPR-DRAFT.md` (gitignored); **remaining scope**: (1) review and finalize GDPR-DRAFT.md, (2) move to `docs/GDPR.md` (tracked), (3) publish as linked page before Phase 3 launch, (4) ensure covers localStorage, AI API calls, no-cookies, no-tracking, contribution flow, offline use

---

## Accounts & Cloud Sync

### Authentication

- [ ] **Sign-in UI** `[ux]` `[phase3]` — **NOT STARTED**: blocked on Supabase activation; **remaining scope**: (1) add minimal sign-in section to SettingsPanel footer, (2) show avatar/name when signed in, (3) "Sign in with Google/GitHub" buttons when not, (4) sign-out option inline
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` `[launch-blocker]` — **PARTIALLY COMPLETE**: stubs exist in `authService.js` and `supabaseClient.js`; **remaining scope**: (1) install `@supabase/supabase-js`, (2) set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, (3) uncomment implementation blocks, (4) verify OAuth slugs and RLS policies; required before GDPR disclosure can be published
- [ ] **Phase 2 stubs review** `[infra]` `[claude]` `[manual]` — **PARTIALLY COMPLETE**: stubs exist; **remaining scope**: (1) re-read `authService.js` and `supabaseClient.js` against current Supabase JS v2 SDK docs, (2) confirm OAuth slugs (`'google'`, `'github'`), table names, RLS policies are accurate; prerequisite for activating Supabase

### Cloud Data Sync

- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` — **PARTIALLY COMPLETE**: stubs exist in `dataService.js`; **remaining scope**: (1) activate `syncSettings()` and `getRemoteSettings()` via Supabase, (2) on sign-in merge remote with localStorage, (3) on setting change push to Supabase; API keys excluded from sync (localStorage only)
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` `[phase3]` — **PARTIALLY COMPLETE**: Phase 1 localStorage layer wired (`userFindingsService.js`, `useUserFindings.js`); **remaining scope**: (1) activate `getUserFindings()`, `saveUserFinding()`, `deleteUserFinding()` stubs in `dataService.js` via Supabase, (2) verify DB schema, (3) test CRUD operations
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` — **PARTIALLY COMPLETE**: ratings data layer exists; **remaining scope**: (1) wire up/downvote sync to `ratings` table (`user_id`, `finding_id`, `vote`), (2) merge localStorage ratings on sign-in, (3) test sync behavior
- [ ] **GitHub Sponsors** `[infra]` `[phase3]` — **OBSOLETE**: nice-to-have alternative to Ko-fi; defer to Phase 3 if monetization strategy includes Sponsors

---

## Monetization

- [ ] **Ad tiles in result list** `[ux]` `[design]` `[phase3]` `[manual]` — **COMPLETE**: tile component (`SponsoredTile.jsx`) and admin preview (`AdminPanel.jsx` toggle, frequency config) fully built and wired; **remaining work is Phase 3 only**: (1) connect real ad delivery source (Carbon Ads, EthicalAds, direct-sold), (2) replace placeholder copy, (3) finalize placement rules; ship v1.0/v1.1 without ads; infrastructure deferred to v2.0+
- [ ] **Free vs. premium feature tiers** `[phase3]` `[manual]` — **NOT STARTED**: strategic business decision; **remaining scope**: (1) define free tier (AI Assist monthly tokens? corpus size limits?), (2) define premium tier (more tokens, custom findings, cloud sync, export formats), (3) think through usage limits (rate limiting, server-side counters, grace periods), (4) document tier requirements before Phase 3 launch
- [ ] **Ad services, pricing, and what's included** `[phase3]` `[manual]` — **NOT STARTED**: strategic business decision; **remaining scope**: (1) research ad networks (Carbon Ads, EthicalAds, self-served), (2) document starting CPM/CPC, minimum traffic, reporting, targeting, payment terms for each, (3) decide on network vs. direct-sell model, (4) define ad slot count per page, starter package for direct buyers, sponsorship (fixed monthly) vs. impression-based model before Phase 3
