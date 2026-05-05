# Security

## Data storage

All user data is stored locally in `localStorage` only. Nothing is ever sent to any server except where explicitly noted below. Clearing browser storage removes all saved preferences, ratings, and API keys.

| Data | Where stored | Sent anywhere? |
| ---- | ------------ | -------------- |
| AI provider API key | `localStorage` per provider | Only to that provider's API endpoint when AI assist is used |
| Theme | `localStorage` key `theme` | No |
| Language / Locale | `localStorage` key `language` | No |
| Platform filter (Web / Native / Both) | `localStorage` key `platform` | No |
| Live search toggle | `localStorage` key `liveSearch` | No |
| WCAG version (2.0 / 2.1 / 2.2) + level (A / AA) filter | `localStorage` key `wcagFilter` | No |
| Finding ratings (upvotes, downvotes, stars, archive) | `localStorage` key `defect_ratings` | No — cloud sync in Phase 3 (requires auth) |
| Finding frequency (opens, copies count) | Implicit in `recentFindings` array | No |
| Pinned findings (favorites) | `localStorage` key `pinnedFindings` | No |
| Recent findings history (last 10 IDs) | `localStorage` key `recentFindings` | No |
| User-created / copied findings | `localStorage` key `userFindings` | No — cloud persistence in Phase 3 (requires auth) |
| Personal locale overrides for corpus findings | `localStorage` key `userOverrides` | No — cloud persistence in Phase 3 (requires auth) |
| Pending contribution suggestions (queued edits awaiting review) | `localStorage` key `pendingContributions` | No — exported manually by the user and reviewed offline |
| Settings save count (Party Mode unlock) | `localStorage` | No |
| Last selected finding ID (session only) | `sessionStorage` key `lastSelectedId` | No — cleared when the tab closes |

## API keys

Keys are entered by the user and stored locally. Storage location varies by platform:

| Platform | Storage | Notes |
| -------- | ------- | ----- |
| Web (browser) | `localStorage` | Scoped to the deployment origin |
| Chrome / Firefox extension | `localStorage` | Scoped to the extension origin (`chrome-extension://` or `moz-extension://`) — isolated from all websites |
| Electron desktop | `safeStorage` (OS keychain) via encrypted file in `app.getPath('userData')` | Encrypted at rest using OS-level encryption; never written to `localStorage` |

Keys are sent exclusively to the configured AI provider's API when a revision request is made. No key is ever sent to any A11yTextHelper server — there is no A11yTextHelper server.

## Browser extension context

In the Chrome and Firefox extensions, the app runs inside an isolated extension origin. `localStorage` is scoped to that origin and is not accessible to any website the user visits. No content scripts are injected into web pages; the extension only runs in the side panel / sidebar UI.

## No backend (Phase 1)

This is a fully static application in all delivery formats. There is no database, authentication server, or backend of any kind. Corpus data is a local JSON file bundled with the app.

**Note:** Phase 3 will introduce optional Supabase authentication and cloud sync. In Phase 3, only users who explicitly sign in will have data sent to Supabase servers. Unauthenticated users will continue to use the fully offline-first Phase 1 model.

### Offline-first support

The app includes a Service Worker that caches the app shell and corpus JSON on the first load. Subsequent visits use the cached assets, allowing full search functionality offline. The Web App Manifest enables installation to the home screen on mobile. AI Assist still requires internet to reach the provider API endpoint, but all search, filtering, and rating features work offline.

The Electron build bundles the app shell directly, enabling offline use without a prior online visit.

## Corpus and translation data

The corpus (`src/data/corpus.json`) and all locale files (`src/i18n/*.json`) are static assets bundled at build time. No user-entered text is ever sent for translation or external processing, except when using AI Assist (which sends the finding text to the configured AI provider API, per the user's consent and API key).

## Debug tooling

Debug tools are guarded by `IS_DEV` checks (`hostname === 'localhost' || '127.0.0.1'`) and render nothing in production. The localhost API key bypass in `SettingsPanel.jsx` skips validation only when `window.location.hostname === 'localhost' || '127.0.0.1'`; it does not affect deployed builds.

## Content Security Policy

Security headers are configured in `netlify.toml` (Netlify deploys) and `vercel.json` (Vercel deploys). The CSP restricts script sources to `'self'`, style sources to `'self' 'unsafe-inline'`, and API connections to `'self'` plus the configured AI provider endpoints. No third-party analytics, tracking, or ad scripts are included.

## Third-party scripts

No third-party scripts are loaded at runtime. The Ko-fi widget (`KofiWidget.jsx`) is present in the codebase but currently disabled pending console error resolution — it is not mounted in the current build.

Third-party analytics (Umami) is disabled by default in Phase 1. The script placeholder exists in `index.html` but is commented out. If enabled in Phase 3, Umami does not use cookies or collect personal data — it only tracks aggregated page views and navigation patterns. Users will have full visibility into what is being tracked before any public launch.

## Reporting a vulnerability

Open an issue at [https://github.com/[your-repo]/issues](https://github.com/) or contact the maintainer directly. Please do not disclose security issues publicly until they have been reviewed.
