# TODO

Personal backlog for A11yTextHelper. Active items only. Remaining scope is listed explicitly for partial items.

Items are ordered **high value + low effort first** within each section.

Category tags: `[corpus]` `[data]` `[ai]` `[ux]` `[a11y]` `[design]` `[infra]` `[code]` `[privacy]` `[perf]` `[i18n]` `[agent]` `[manual]` `[phase3]` `[launch-blocker]`

---

## Phase 2 — In Progress

### AI Assist & Agent

- [x] **Wire agentic AI in DetailPanel** `[agent]` `[ai]` `[ux]` — Backend fully wired: (1) toggle added in Refine section of DetailPanel, (2) mode toggle exposed in Settings under AI Assist (Claude only), (3) agentic refinement uses searchCorpus tool via getAgenticRefinement; i18n keys and placeholders added for translation
- [x] **Document AI provider privacy comparison in README** `[privacy]` `[ai]` — Comparison table added showing training data policies, retention, and privacy commitments for all 4 providers (Anthropic, OpenAI, Google, Microsoft)
- [ ] **Multi-turn refinement conversation** `[agent]` `[ux]` `[claude]` — Extends agentic AI. **Remaining**: (1) extend Refine section to show turn history, (2) store history in component state as `{ role, content }[]`, (3) pass full history in subsequent calls, (4) add "Clear conversation" button
- [ ] **System prompt tuning** `[ai]` `[claude]` — Baseline prompt established. **Remaining**: test refinements across 20+ finding types covering variety of SCs, priorities, and platforms; adjust tone/length/format in `buildPrompt` if output drifts; document final prompt version

### User Findings & Editing

- [ ] **Copy / add / edit / delete findings** `[ux]` `[enhancement]` — Data layer wired (`userFindingsService.js`, `useUserFindings.js`, merged into `useFindingSearch`); UI forms and inline edit pending. **Remaining**: (1) build forms and inline edit UI, (2) wire copy button to trigger duplication flow, (3) activate cloud persistence via Supabase in Phase 2 (requires auth)
- [ ] **Personal vs. public corpus toggle** `[corpus]` `[ux]` `[manual]` — Switching works via debug command (`debug corpus personal|public`). **Remaining**: (1) add Settings UI toggle (not debug-only), (2) document behavior in README and feature docs

### Multilingual Edit Flow

Backend complete. UI dialogs pending. All i18n keys are in `en.json`; hooks and services are wired; personal overrides are applied in `useFindingSearch` and visible in search results.

- [ ] **Save changes button in DetailPanel** `[ux]` `[i18n]` — Unblocks entire multilingual edit flow. **Remaining**: add "Save changes" button that triggers edit-flow dialog for non-English locale, save directly as override for English
- [ ] **Edit target dialog** `[ux]` `[i18n]` — Required after Save Changes button. **Remaining**: modal with two choices ("Save to my personal entries" / "Suggest to shared corpus"); wire `useUserOverrides.saveOverride` and `useContributionQueue.submitContribution`
- [ ] **Edit scope dialog** `[ux]` `[i18n]` — Required after target selection. **Remaining**: three radio options (`lang_only`, `lang_and_en`, `all_langs`); show `edit.personal_ai_warning` for `lang_only` personal saves
- [ ] **English switch transition (lang_and_en flow)** `[ux]` `[design]` — Only needed for `lang_and_en` flow. **Remaining**: (1) animate bottom sheet close/reopen showing English version, (2) show dialog first giving chance to skip, (3) do not change app-wide locale, only finding panel content
- [ ] **Personal override indicator in DetailPanel** `[ux]` `[design]` — Visual feedback when editing. **Remaining**: when `finding._hasOverride` is true, show badge/label near title with timestamp from `_overrideEditedAt`; nice-to-have but not blocking multilingual edit
- [ ] **Contributions review panel (maintainer)** `[ux]` `[manual]` — Maintainer-only feature. **Remaining**: add section in SettingsPanel listing pending contributions with approve/reject/export controls; wire `useContributionQueue` and `exportJson()`; merge still runs via `scripts/apply-contributions.mjs`
- [ ] **Reset All includes personal overrides and contributions** `[ux]` `[privacy]` — Reset All exists. **Remaining**: (1) verify Reset All calls `clearAllOverrides()` and `clearContributions()`, (2) confirm UI lists both when clearing, (3) test in UI

### Search & Results

- [ ] **Advanced search syntax** `[ux]` `[search]` — Concept clear. **Remaining**: (1) implement query parser for `+term` and `-term` operators, (2) integrate pre-filter step before Fuse.js, (3) add syntax hint tooltip near search bar, (4) test edge cases (operators + fuzzy search together)

### Export & Sharing

- [ ] **Export findings** `[ux]` — Architecture planned (integrate with Email results via shared report pipeline). **Remaining**: (1) multi-select UI in ResultList, (2) report generation (Markdown/plain text templates), (3) integrate with Email results, (4) test formatting and ensure findings export cleanly
- [ ] **Email results** `[ux]` `[enhancement]` — Concept clear and wired to export pipeline. **Remaining**: (1) complete Export findings implementation (multi-select + report generation), (2) add Email delivery option to export dialog, (3) wire email service provider (SendGrid/Resend), (4) test end-to-end
- [ ] **Bug tracker integration** `[ux]` `[infra]` `[enhancement]` — Concept is clear and deep-link generation without auth is straightforward. **Remaining**: (1) implement URL format generation for Jira/Linear in export flow, (2) test deep links against live Jira/Linear instances, (3) document URL format in README

### Data & Content

- [ ] **Add native-specific corpus entries** `[corpus]` `[phase2]` — 44/76 entries are platform-relevant to native (57.9%); Phase 1 target met. **Remaining**: Phase 2 expansion to add 4 native-specific entries: (1) Dynamic Type sizing (iOS), (2) Custom accessibility label requirements (UIAccessibilityLabel / contentDescription), (3) Native accessibility announcements (UIAccessibilityPostNotification), (4) Custom accessibility actions (UIAccessibilityCustomAction)
- [ ] **Custom data source / remote corpus** `[corpus]` `[ux]` `[infra]` `[phase2]` — `importFromUrl` function handles public JSON URLs. **Remaining**: (1) Settings UI with URL input + load button + error handling, (2) activate Supabase backend for authenticated users in Phase 2

### Design & Polish

- [ ] **Polish "Similar findings", "Related findings", and "Sources" lists** `[ux]` `[design]` — Sections exist in DetailPanel. **Remaining**: (1) audit layout consistency across all three sections, (2) ensure empty states are clear, (3) verify keyboard navigation is consistent, (4) standardize spacing patterns

---

## Accessibility (A11Y)

- [ ] **Verify Ko-fi patch selectors against live DOM** `[a11y]` — Patches work in development. **Remaining**: open deployed app, confirm selectors still match live Ko-fi DOM (selectors may drift with Ko-fi updates), adjust if needed; manual testing only

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

- [ ] **UI component library extraction** `[code]` `[claude]` — Accessible SPA primitives are built (router, announcer, focus/names debuggers, form controls, button system). **Remaining**: (1) confirm button unification is fully complete, (2) audit component APIs for stability, (3) scaffold monorepo structure (`packages/core`, `packages/ui`, `packages/app`), (4) extract plugins and UI components. Defer to post-v1.0 when APIs stabilize; complexity is high and not critical path

### Infrastructure

- [ ] **Version tagging** `[infra]` — Tagging strategy is defined. **Remaining**: (1) decide stable corpus threshold, (2) create `v0.1.0` tag on Phase 1 launch, (3) push tags to GitHub releases page
- [ ] **Chrome extension — validate and merge** `[infra]` — Scaffold complete on `feature/chrome-extension`. **Remaining**: (1) add 16/48/128px PNG icons, (2) load unpacked from `dist-extension/`, (3) smoke-test search/copy/settings/AI refine at ~400px width, (4) merge when layout confirmed
- [ ] **Firefox extension — validate and merge** `[infra]` — Scaffold complete on `feature/firefox-extension`. **Remaining**: (1) add PNG icons, (2) load via `about:debugging`, (3) confirm sidebar behavior, (4) merge when confirmed
- [ ] **Electron desktop app — icons, test, merge** `[infra]` — Functionally complete on `feature/electron-app`. **Remaining**: (1) add app icons (`.icns` / `.ico` / `.png`), (2) test end-to-end on macOS/Windows (safeStorage persistence, AI refine), (3) code-sign macOS build, (4) merge when icons ready
- [ ] **Umami analytics activation** `[infra]` `[manual]` — Integration point in `index.html` (cookieless, GDPR-compliant). **Remaining**: (1) create free account at umami.is or self-host, (2) add your site and get WEBSITE_ID, (3) replace `YOUR_WEBSITE_ID` and uncomment script tag in index.html, (4) verify zero cookies in Umami dashboard, (5) enable on deployment (Phase 3 public launch)

### Privacy & Security

- [ ] **GDPR disclosure for Phase 3** `[privacy]` `[phase3]` `[launch-blocker]` — Draft exists at `docs/GDPR-DRAFT.md` (gitignored). **Remaining**: (1) review and finalize GDPR-DRAFT.md, (2) move to `docs/GDPR.md` (tracked), (3) publish as linked page before Phase 3 launch, (4) ensure covers localStorage, AI API calls, no-cookies, no-tracking, contribution flow, offline use

---

## Phase 3 — Planned

### AI Assist & Agent

- [ ] **Extend agentic AI to remaining providers** `[ai]` `[agent]` `[enhancement]` — Agentic mode is Claude-only by design (tool use is provider-specific). **Decision**: Keep agentic mode exclusive to Claude. Standard AI assist works for all 4 providers (OpenAI/Google/Microsoft) without corpus search. If user feedback indicates strong demand for provider parity, implement OpenAI/Google/Microsoft tool use with provider-specific schemas (Phase 3 enhancement). **Current state**: Agentic mode complete for Claude; standard AI assist sufficient for other providers.

### Authentication

- [ ] **Sign-in UI** `[ux]` `[phase3]` — Blocked on Supabase activation. **Remaining**: (1) add minimal sign-in section to SettingsPanel footer, (2) show avatar/name when signed in, (3) "Sign in with Google/GitHub" buttons when not, (4) sign-out option inline
- [ ] **Google / GitHub OAuth via Supabase** `[infra]` `[privacy]` `[phase3]` `[launch-blocker]` — Stubs exist in `authService.js` and `supabaseClient.js`. **Remaining**: (1) install `@supabase/supabase-js`, (2) set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, (3) uncomment implementation blocks, (4) verify OAuth slugs and RLS policies. Required before GDPR disclosure can be published
- [ ] **Phase 2 stubs review** `[infra]` `[claude]` `[manual]` — Stubs exist. **Remaining**: (1) re-read `authService.js` and `supabaseClient.js` against current Supabase JS v2 SDK docs, (2) confirm OAuth slugs (`'google'`, `'github'`), table names, RLS policies are accurate. Prerequisite for activating Supabase

### Cloud Data Sync

- [ ] **Settings sync** `[infra]` `[ux]` `[phase3]` — Stubs exist in `dataService.js`. **Remaining**: (1) activate `syncSettings()` and `getRemoteSettings()` via Supabase, (2) on sign-in merge remote with localStorage, (3) on setting change push to Supabase; API keys excluded from sync (localStorage only)
- [ ] **User-owned custom findings (cloud)** `[corpus]` `[ux]` `[phase3]` — Phase 1 localStorage layer wired (`userFindingsService.js`, `useUserFindings.js`). **Remaining**: (1) activate `getUserFindings()`, `saveUserFinding()`, `deleteUserFinding()` stubs in `dataService.js` via Supabase, (2) verify DB schema, (3) test CRUD operations
- [ ] **Persist ratings to Supabase** `[ux]` `[infra]` `[phase3]` — Ratings data layer exists. **Remaining**: (1) wire up/downvote sync to `ratings` table (`user_id`, `finding_id`, `vote`), (2) merge localStorage ratings on sign-in, (3) test sync behavior

### Search & Visibility

- [ ] **Search Console setup** `[infra]` `[seo]` `[manual]` — Verify domain ownership and monitor search performance. **Remaining**: (1) create Google Search Console account, (2) verify ownership via DNS/HTML/file, (3) submit sitemap.xml, (4) monitor indexing status, (5) check for crawl errors, (6) track impressions/clicks/CTR for initial keywords
- [ ] **SEO optimization for Phase 3** `[seo]` `[code]` — Enable SEO meta tags in index.html (currently commented out). **Remaining**: (1) uncomment meta description/OG/Twitter cards in index.html, (2) fill in canonical URL (yourdomain.com), (3) generate dynamic OG image, (4) verify all internal links use hash routing, (5) test with Rich Results tester, (6) confirm structured data (WebApplication JSON-LD) is valid
- [ ] **Sitemap generation** `[infra]` `[seo]` — Single-page app sitemap needed. **Remaining**: (1) generate `public/sitemap.xml` (single entry for SPA root), (2) link in index.html head, (3) submit to Search Console, (4) set crawl budget/user-agent rules if needed
- [ ] **robots.txt for Phase 3** `[seo]` `[code]` — Currently blocks all crawlers (dev mode). **Remaining**: (1) update `public/robots.txt` to allow crawlers on prod domain, (2) set crawl delay/rate-limit if needed, (3) reference sitemap.xml

### Analytics & Monitoring

- [ ] **Umami analytics setup** `[infra]` `[manual]` — Privacy-first, cookieless analytics. **Remaining**: (1) create free account at umami.is or self-host, (2) add site and get WEBSITE_ID, (3) replace `YOUR_WEBSITE_ID` and uncomment script in index.html, (4) verify zero cookies in dashboard, (5) enable on production deployment
- [ ] **Error tracking / crash reporting** `[infra]` `[monitoring]` — Optional but recommended for early-stage visibility. **Remaining**: (1) evaluate Sentry (free tier covers 5k events/mo, good for startups), (2) add error boundary to App.jsx, (3) capture unhandled promise rejections, (4) configure release tracking, (5) notify on critical errors, (6) set up Slack/email alerts
- [ ] **GitHub releases page** `[infra]` `[manual]` — Document milestones and version history. **Remaining**: (1) create GitHub release for v0.1.0 on Phase 3 launch, (2) add release notes, (3) attach build artifacts if distributing binaries, (4) enable auto-updates tracking (Electron desktop users can subscribe)

### Monetization & Growth

- [ ] **Monetization strategy** `[phase3]` `[manual]` — Strategic decision on revenue model. **Remaining**: (1) decide free vs. premium tiers (or ad-supported free), (2) define feature limits per tier, (3) plan token limits for AI Assist (rate limiting), (4) document pricing before launch
- [ ] **Ad network integration** `[infra]` `[manual]` — If monetizing via ads. **Remaining**: (1) research networks: Carbon Ads (tech/indie focus, $2k+/mo minimum), EthicalAds (privacy-first, $500+/mo minimum), Splitrocket (affiliate), or direct sponsorships, (2) evaluate CPM/CPC/terms for each, (3) decide on placement (top banner, sidebar, result tiles wired), (4) implement ad rotation/fallback if network is down
- [ ] **Social proof & community** `[growth]` `[manual]` — Build initial user base. **Remaining**: (1) submit to Product Hunt (timing before or after launch), (2) post to accessibility communities (Twitter/X, LinkedIn, Reddit r/accessibility, WebAIM forum), (3) reach out to a11y influencers (Adrian Roselli, Eric Bailey, etc. for early feedback), (4) create discussion forum or Discord for user feedback
- [ ] **Feedback collection** `[growth]` `[ux]` — Understand initial user needs. **Remaining**: (1) add feedback widget (Canny, Typeform, or simple mailto link), (2) monitor GitHub Issues, (3) track feature requests, (4) establish feedback loop for Phase 3.1 improvements

### Launch Readiness

- [ ] **Pre-launch checklist** `[infra]` `[manual]` `[launch-blocker]` — Final verification before going public. **Remaining**: (1) GDPR disclosure published and linked, (2) Privacy policy finalized, (3) Terms of service if monetizing, (4) all SEO meta tags filled in and verified, (5) Umami active and reporting, (6) error tracking active, (7) GitHub releases ready, (8) social channels prepared (Twitter account, LinkedIn post scheduled), (9) cold email list for outreach (a11y auditors, accessibility consultants), (10) domain DNS configured correctly, (11) CDN/caching optimized, (12) backup/monitoring in place for Netlify/Vercel
- [ ] **Post-launch monitoring** `[infra]` `[manual]` — Week 1 oversight. **Remaining**: (1) daily check of error logs, (2) monitor Search Console for indexing progress, (3) track Umami sessions/pageviews/bounces, (4) respond to early feedback/bug reports within 24h, (5) publish weekly update/status post, (6) collect initial feature requests

---

## Archived

Completed or obsolete items have been cleaned from the active list. See CHANGELOG.md and UPDATES.md for documentation.

**Completed (documented in CHANGELOG/UPDATES):**

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
