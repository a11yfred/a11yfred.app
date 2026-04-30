# Security

## Data storage

All user data is stored locally in `localStorage` only. Nothing is ever sent to any server except where explicitly noted below. Clearing browser storage removes all saved preferences, ratings, and API keys.

| Data | Where stored | Sent anywhere? |
| ---- | ------------ | -------------- |
| AI provider API key | `localStorage` per provider | Only to that provider's API endpoint when AI assist is used |
| Theme, language, platform, UI preferences | `localStorage` | No |
| Finding ratings (upvotes, stars, archive) | `localStorage` | No |
| Finding frequency (opens, copies count) | `localStorage` key `frequentFindings` | No |
| Pinned findings (favorites) | `localStorage` key `pinnedFindings` | No |
| Settings save count (Party Mode unlock) | `localStorage` | No |
| Recent findings history (last 10 IDs) | `localStorage` key `recentFindings` | No |
| User-created / copied findings | `localStorage` key `userFindings` | No |
| Personal locale overrides for corpus findings | `localStorage` key `userOverrides` | No |
| Pending contribution suggestions (queued edits awaiting review) | `localStorage` key `pendingContributions` | No — exported manually by the user and reviewed offline |
| WCAG version filter preference | `localStorage` key `wcagFilter` | No |
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

## No backend

This is a fully static application in all delivery formats. There is no database, authentication server, or backend of any kind. Corpus data is a local JSON file bundled with the app.

### Offline-first support

The app includes a Service Worker that caches the app shell and corpus JSON on the first load. Subsequent visits use the cached assets, allowing full search functionality offline. The Web App Manifest enables installation to the home screen on mobile. AI Assist still requires internet to reach the provider API endpoint, but all search, filtering, and rating features work offline.

The Electron build bundles the app shell directly, enabling offline use without a prior online visit.

## Corpus and translation data

The corpus (`src/data/corpus.json`) and all locale files (`src/i18n/*.json`) are static assets bundled at build time. No user-entered text is ever sent for translation.

## Debug tooling

Debug tools are guarded by `IS_DEV` checks (`hostname === 'localhost' || '127.0.0.1'`) and render nothing in production. The localhost API key bypass in `SettingsPanel.jsx` skips validation only when `window.location.hostname === 'localhost' || '127.0.0.1'`; it does not affect deployed builds.

## Content Security Policy

Security headers are configured in `netlify.toml` (Netlify deploys) and `vercel.json` (Vercel deploys). The CSP restricts script sources to `'self'`, style sources to `'self' 'unsafe-inline'`, and API connections to `'self'` plus the configured AI provider endpoints. No third-party analytics, tracking, or ad scripts are included.

## Third-party scripts

No third-party scripts are loaded at runtime. The Ko-fi widget (`KofiWidget.jsx`) is present in the codebase but disabled — it is not mounted anywhere in the current build.

## Reporting a vulnerability

Open an issue at [https://github.com/[your-repo]/issues](https://github.com/) or contact the maintainer directly. Please do not disclose security issues publicly until they have been reviewed.
