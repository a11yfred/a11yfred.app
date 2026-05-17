# Security Policy

## Supported Versions

A11yFred is a client-side web application. Currently in active development with post-launch Phase 2 refactoring complete. Only the latest commit on the `main` branch is actively maintained.

| Version | Supported                    |
| ------- | ---------------------------- |
| main    | Yes                          |
| v0.1.0+ | Backport critical fixes only |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

To report a vulnerability, email **<mikey@a11yfred.app>** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (if applicable)
- Any suggested mitigations you are aware of

You should receive a response within 5 business days. If the report is confirmed, a fix will be prioritized and credited to you in the changelog (unless you prefer to remain anonymous).

## Scope

This app:

- Runs entirely in the browser. There is no server-side component, no database, and no user accounts (auth stubs exist but are not active)
- Stores only local preferences and API keys in `localStorage`; API keys are sent directly to the respective AI provider and never to any intermediate server
- Has no authentication surface

Vulnerabilities of interest include:

- XSS via corpus data or user-entered content
- Leakage of API keys stored in `localStorage` across origins
- Content Security Policy bypasses
- Dependency vulnerabilities with a realistic exploitation path

Out of scope: theoretical vulnerabilities with no practical impact, vulnerabilities in third-party AI provider APIs, and issues requiring physical access to the user's device.
