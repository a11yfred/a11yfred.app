# Privacy Policy

**Effective date:** 2026-05-13
**Last updated:** 2026-05-13

---

## What A11yFred is

A11yFred is a single-page web application that helps accessibility auditors look up and adapt finding descriptions and remediation text. It runs entirely in your browser. There is no server, no database, and no account system.

---

## Data we collect

A11yFred collects no personal data and does not track individual users. Page view analytics are collected anonymously via [Umami](https://umami.is/) (see [Analytics](#analytics) below). There is no telemetry, no crash reporting, and no behavioral tracking.

---

## Data you create, stored locally

All data you create is stored in your browser's `localStorage` (and one entry in `sessionStorage`). It never leaves your device except where you explicitly initiate an action (see [AI Assist](#ai-assist-optional-opt-in) below).

| What | localStorage key | Cleared by |
| ---- | ---------------- | ---------- |
| Theme preference | `theme` | Browser storage clear or Settings → Reset All |
| Language preference | `language` | Browser storage clear or Settings → Reset All |
| Platform filter | `platform` | Browser storage clear or Settings → Reset All |
| Live Search toggle | `liveSearch` | Browser storage clear or Settings → Reset All |
| Show ranking toggle | `showRanking` | Browser storage clear or Settings → Reset All |
| Show personal corpus toggle | `showPersonalCorpus` | Browser storage clear or Settings → Reset All |
| WCAG version/level filter | `wcagFilter` | Browser storage clear or Settings → Reset All |
| Finding ratings (rank up/down, stars) | `defect_ratings` | Browser storage clear or Settings → Reset All |
| Pinned findings | `pinnedFindings` | Browser storage clear or Settings → Reset All |
| Co-selection pairs (usage signal) | `coSelectionPairs` | Browser storage clear or Settings → Reset All |
| Personal corpus edits | `userOverrides` | Browser storage clear or Settings → Reset All |
| User-created custom findings | `userFindings` | Browser storage clear or Settings → Reset All |
| Pending contribution suggestions | `pendingContributions` | Browser storage clear, in-app export-and-clear, or Settings → Reset All |
| Recent findings (last 10 IDs) | `recentFindings` | Browser storage clear or Settings → Reset All |
| Per-finding notes | `finding_note_<id>` | Browser storage clear or Settings → Reset All |
| Onboarding seen flag | `onboardingSeen` | Browser storage clear or Settings → Reset All |
| Settings save count (Party Mode unlock) | `settingsSaveCount` | Browser storage clear or Settings → Reset All |
| Admin panel dataset preference | `adminDataset` | Browser storage clear |
| View-all skip preference | `viewAllSkipConfirm` | Browser storage clear |
| AI provider preference | `ai_provider` | Browser storage clear or Settings → Reset All |
| AI model per provider | `ai_model_<provider>` | Browser storage clear or Settings → Reset All |
| Agentic mode toggle | `agentic_mode` | Browser storage clear or Settings → Reset All |
| AI API keys | `apikey_<provider>` | Browser storage clear, in-app key field clear, or Settings → Reset All |
| Last selected finding (current tab only) | `lastSelectedId` (sessionStorage) | Tab close |

**Your right to deletion:** Use Settings → Reset All to clear all stored data at once, or clear your browser's site data directly (browser Settings → Privacy → Clear browsing data). Either action removes all locally stored data permanently and is not reversible.

---

## AI Assist (optional, opt-in)

If you choose to use the AI Assist feature:

- You supply your own API key from Anthropic, OpenAI, Google, or Microsoft Azure.
- Your API key is stored in `localStorage` on your device only (`apikey_<provider>`).
- When you request a revision, the current finding's description and/or remediation text is sent directly from your browser to the AI provider's API. No other personal data is included.
- The text you send is subject to the privacy policy of whichever AI provider you choose.

**A11yFred never sees your API key or the content of your requests.** All API calls go directly from your browser to the provider. There is no intermediate server.

Relevant provider privacy policies:

- Anthropic: [anthropic.com/privacy](https://www.anthropic.com/privacy)
- OpenAI: [openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy)
- Google: [policies.google.com/privacy](https://policies.google.com/privacy)
- Microsoft Azure: [privacy.microsoft.com](https://privacy.microsoft.com/en-us/privacystatement)

---

## Contribution suggestions (optional, opt-in)

If you choose to suggest an edit to the shared corpus:

- The edited text is stored locally in `localStorage` under `pendingContributions`.
- You can export this data as a JSON file at any time from within the app.
- Nothing is sent automatically. Contribution review happens offline: you export the file, the maintainer reviews it, and approved edits are merged manually into the codebase.
- No identifying information (name, email, device fingerprint) is attached to contributions.

---

## No cookies

A11yFred uses no cookies.

---

## Analytics

A11yFred uses [Umami](https://umami.is/), a privacy-first analytics platform, to collect anonymous aggregate statistics. Umami sets no cookies, collects no personal data, and cannot identify individual visitors. Data collected includes page views, referrer, browser type, device type, and country -- all aggregated and never linked to a person.

Umami data is hosted on Umami Cloud and is not shared with any third party. To opt out, set `localStorage.setItem('umami.disabled', '1')` in your browser's developer console.

---

## No third-party tracking

No advertising or behavioral tracking scripts are loaded. The only third-party script is Umami analytics (see [Analytics](#analytics) above).

---

## Offline use

A11yFred works offline after the first load. The corpus and all UI are bundled with the app. AI Assist requires an internet connection to reach the provider API; everything else works offline.

---

## Children

A11yFred is a professional tool for accessibility auditors. It is not directed at children and does not knowingly collect data from anyone under 13.

---

## GDPR (EU/EEA users)

Because A11yFred collects no personal data and processes all data locally in your browser, it does not act as a data controller or data processor under the GDPR. Anonymous, non-identifiable analytics data (page views, device type, country) is sent to Umami Cloud; this data cannot be linked to an individual. No personal data is shared with third parties unless you explicitly use AI Assist, in which case the relevant provider's data practices apply.

---

## Changes to this policy

This document describes current behavior. If data practices change materially, this file will be updated. The git history of this file is the authoritative record of changes.

---

## Contact

For questions about data practices, open an issue on [GitHub](https://github.com/a11yfred/a11yfred), email [privacy@a11yfred.app](mailto:privacy@a11yfred.app), or contact [hello@a11yfred.app](mailto:hello@a11yfred.app).
