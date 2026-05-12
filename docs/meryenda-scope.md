# Meryenda Browser Extension — Scope

## What it is

A Chrome extension that combines three things no single tool does together today:

1. **Automated a11y auditing** via axe-core
2. **Interactive visual debuggers** via meryenda
3. **Overlay detection and blocking** via declarativeNetRequest + meryenda signatures

## Competitive position

| Capability | axe DevTools | Accessibility Insights | WAVE | ARC Toolkit | AccessiByeBye | **Meryenda** |
| --- | --- | --- | --- | --- | --- | --- |
| Automated rules (axe-core) | ✓ | ✓ | partial | ✓ | — | ✓ |
| Visual focus debugger | — | partial | — | — | — | ✓ |
| Accessible names debugger | — | — | — | — | — | ✓ |
| Heading map debugger | — | partial | ✓ | — | — | ✓ |
| Tab stops debugger | partial | ✓ | — | — | — | ✓ |
| WCAG SC reference | — | — | — | — | — | ✓ |
| Overlay detection | — | — | — | — | ✓ | ✓ |
| Overlay blocking (network) | — | — | — | — | ✓ (7) | ✓ (23+) |
| Free | Partial | ✓ | ✓ | ✓ | ✓ | ✓ |

## Architecture

```text
extension/
  manifest.json         # MV3, declarativeNetRequest, content_scripts
  background.js         # service worker — rule updates, message routing
  content.js            # injects meryenda debuggers into inspected page
  popup/
    popup.html
    popup.js
    popup.css
  rules/
    rules.json           # generated from OVERLAY_SIGNATURES — do not edit manually
  vendor/
    axe.min.js           # axe-core, bundled
```

### Content script

- Imports meryenda core (focus, names, headings, tabstops, overlays)
- Receives toggle messages from popup via `chrome.runtime.onMessage`
- Runs `axe.run()` on demand, posts results back to popup
- Fallback DOM removal for overlays not caught at network level

### Background service worker

- Manages `declarativeNetRequest` dynamic rules
- No persistent state — stateless rule application

### Popup

- Vanilla HTML/CSS/JS, no framework
- Sections:
  - **Audit** — run axe, show violations grouped by impact (critical → best practice)
  - **Debuggers** — toggle focus, names, headings, tabstops per tab
  - **Overlays** — scan results from `detectOverlays()`, block status per vendor
  - **WCAG** — filterable SC list from `WCAG_CRITERIA` (level, version, coverage)
  - **Settings** — which debuggers auto-run on page load, block list on/off

## What needs to be built

### 1. Extension shell

- `manifest.json` — MV3, permissions: `activeTab`, `scripting`, `declarativeNetRequest`, `storage`
- `background.js` — service worker, message routing
- `content.js` — meryenda injector + axe runner
- `popup/` — vanilla UI

### 2. Overlay blocker

- `declarativeNetRequest` static rules block overlay CDN domains at network level
- `rules.json` generated from `OVERLAY_SIGNATURES` src domains via build script
- DOM removal fallback in content script for anything that loads anyway

### 3. Rule generator (palaman build script)

- Reads `meryenda/core/overlays.js` OVERLAY_SIGNATURES
- Outputs `extension/rules/rules.json` in declarativeNetRequest format
- Run after `sync-overlays` to keep block list in sync with signatures

### 4. axe-core integration

- Bundle `axe-core` into the extension (MPL 2.0, free to embed)
- Call `axe.run()` from content script
- Return violations to popup, display grouped by impact level
- Link each violation to its WCAG SC via `WCAG_CRITERIA`

### 5. IS_DEV guard removal in meryenda

- All meryenda overlay mounts currently check `import.meta.env.DEV`
- Extension needs them in production — replace env guard with an `enabled` option
- Keep IS_DEV behavior in the app by passing `enabled: import.meta.env.DEV`

## What's out of scope (v1)

- Guided manual test flows (Accessibility Insights style) — v2
- DevTools panel — popup is sufficient for v1
- Firefox — MV3 differences, v2
- CI/CD integration — separate tool

## Open questions

1. **Repo** — lives here alongside meryenda, or separate repo?
2. **Name** — "Meryenda DevTools"? "Meryenda"? Something else entirely?
3. **Auto-blocking default** — block overlays by default (opt-out) or off by default (opt-in)?

## Dependencies

- `axe-core` — MPL 2.0, free to embed
- `meryenda` (this repo) — vanilla, no framework
- No other runtime dependencies

## Maintenance

- `npm run sync-overlays` detects new vendors on overlayfactsheet.com
- After adding new signatures to `meryenda/core/overlays.js`, run rule generator to update `rules.json`
- Both steps can be chained: `npm run sync-overlays && npm run generate-rules`
