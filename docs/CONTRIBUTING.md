# Contributing

Contributions welcome, especially finding entries, keyword improvements, and bug fixes.

## Setup

```bash
git clone https://github.com/<your-username>/a11ytexthelper
cd a11ytexthelper
npm install
npm run dev   # http://localhost:5173
```

## Adding findings

Findings go in `src/data/corpus.json`. See the **Finding schema** section in the main [README](../README.md) for the full field reference.

A few things that matter most:

- **Keywords** drive search relevance. Include element name, component type, issue type, and terms an auditor would naturally search.
- **Descriptions and suggested fixes** should be plain language, short sentences, no unexplained jargon. Write for a developer who has never done accessibility work.
- **Sources** must be public (WCAG Understanding docs, WebAIM, Deque, axe-core). Private audit data will not be accepted.
- **IDs** increment from the highest existing `ATH-` number.

## Submitting a pull request

Fork → branch (`add-finding-ath-077`) → change → PR with a short description. If adding findings, mention the WCAG success criterion and source.

A PR template lives at `.github/PULL_REQUEST_TEMPLATE.md` and loads automatically on GitHub.

## Bug reports and feature requests

Open a GitHub Issue. No template required.
