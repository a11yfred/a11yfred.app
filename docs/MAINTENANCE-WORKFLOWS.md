# Maintenance Workflows

Detailed guidance for maintenance checklist items. Use alongside [MAINTENANCE-CHECKLIST.md](MAINTENANCE-CHECKLIST.md).

---

## Code Quality Workflows

### Linters

Run all three:

```bash
npm run lint         # ESLint
npm run lint:css     # Stylelint
npm run lint:md      # Markdownlint (docs/**/*.md + README.md)
```

Fix all errors and warnings before committing. New rule overrides need justification in a comment.

### Token Audit

Grep `src/index.css` and all JSX for hardcoded color values (`#fff`, `#111`, `rgba`, `hsl`), hardcoded sizes that repeat 3+ times (px or em), and any value that could be a named token.

Add tokens for values with clear semantic meaning. Update `tokens.css` first, then replace all instances.

### Dead CSS

Search for CSS classes defined in `src/index.css` that are no longer referenced in JSX. Look for overwritten rules where a later declaration always wins (specificity or cascade). Remove both the dead rule and any workaround selectors that exist only to defeat it. Check for commented-out blocks that have not been removed.

### DRY Pass

Look for repeated inline style patterns that could move to utility classes. Three or more identical property+value pairs across unrelated selectors is the threshold.

### Unused Tokens

Check `src/index.css` (custom properties section) for tokens no longer referenced anywhere in `src/index.css` or JSX. Distinguish between truly dead tokens and tokens reserved for planned features. Check TODO for placeholders like `--duration-slow`, `--ease-in`, `--mono` — do not remove without verifying the feature is cancelled.

### SCSS Evaluation

Assess whether CSS custom properties are still sufficient for current theming and component complexity. If repeated nesting patterns, complex selectors, or mixins would meaningfully reduce duplication, add a TODO item to evaluate SCSS migration. Do not migrate without a dedicated session.

---

## Performance & Functionality Workflows

### Bundle Size

```bash
npm run build
```

Check the total gzipped size (target: < 200 kB). Note individual chunk sizes.

### Cold Load

Test in incognito mode + DevTools throttling (Slow 3G). Search must be usable within 3 seconds.

### Console Errors

Build and open DevTools in production mode. Zero errors, zero unexpected warnings.

### Search Accuracy

Test 10 representative queries (e.g., "focus", "aria", "keyboard", "form", "color contrast"). Expected defects must appear in top 3 results.

### Platform Filter

- Web filter excludes `native`-only entries
- Native filter excludes `web`-only entries
- Both filter shows entries marked `both`

### Copy / Reset Behavior

- Description and suggested fix copy correctly
- Location prefix included when set
- `announce()` fires after copy and reset
- Reset confirmation modal fires when >70% of text changed

### AI Refinement

- Valid API key: text rewrites correctly
- Invalid API key: fails gracefully with error message

### Persistence

After reload, verify these restore from `localStorage`:
- Theme (Light/Auto/Dark/Party)
- Language selection
- Platform filter (Web/Native/Both)
- Live search toggle
- WCAG version and level filters

---

## Privacy & Security Workflows

### API Key Handling

Keys must be stored in `localStorage` only. Never log keys. Never include keys in fetch bodies except to the provider's own endpoint. Verify in network tab and DevTools console.

### External Links

Every link with `target="_blank"` must have `rel="noreferrer"` to prevent window.opener access.

### DOM Content

Search codebase for `innerHTML`. All DOM manipulation goes through React JSX.

### `localStorage` Inventory

Current keys:
- `theme`, `language`, `liveSearch`, `platform`, `ai_provider`, `wcagFilter`
- `recentFindings`, `userFindings`, `userOverrides`, `pendingContributions`, `pinnedResults`
- `apikey_<provider>` (one per configured provider: anthropic, openai, google, azure)

`sessionStorage`:
- `lastSelectedId`

Verify the count in SettingsPanel privacy disclosure matches reality.

### Privacy Disclosure

SettingsPanel (About → Privacy & Storage) must list all `localStorage` keys. Update `settings.privacy_body_2` in `src/i18n/en.json` whenever storage changes. Propagate to all locale files.

### No Analytics

- No third-party tracking scripts or pixels
- Umami placeholder in `index.html` must remain commented out
- GitHub Sponsors link active in footer

### Dependency Audit

```bash
npm audit
```

Resolve high/critical issues before release.

### Outdated Packages

```bash
npm outdated
```

Apply non-breaking minor/patch updates. Read changelogs for anything touching accessibility, security, or CSP before upgrading.

### Dead Dependencies

Check `package.json` against actual `import` statements in `src/`. Remove packages no longer imported anywhere. Verify the build succeeds.

---

## Deployment Workflows

See [DEPLOYING.md](DEPLOYING.md) for full deployment target setup and switching instructions.

**Current status (2026-04-27):** All auto-deploys suspended. `netlify.toml` has `ignore = "exit 0"`. To re-enable, remove that line.

### Build Check

```bash
npm run build
```

No Vite errors. Chunk sizes within expected ranges.

### SPA Redirect Test

Navigate directly to `/#/settings` in a new tab. Page must load (not return 404).

### Security Headers

On the active deployment, verify response headers include:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### `robots.txt` Validation

Verify `robots.txt` content matches current phase:
- Dev: `Disallow: /`
- Phase 3 public: `Allow: /`

### Active Target Verification

Ensure only one platform is deploying on each push. If switching targets, verify the previous one is paused.

### Electron Wiring Check

If Electron build is activated:
- Verify `SettingsPanel` writes API keys to `window.electronAPI.keys` (via `safeStorage`), not `localStorage`

If Electron is not yet active:
- Confirm scaffold in `electron/` is intact (`main.js`, `preload.js`, `electron-builder.json`)

---

## Accessibility Workflows

### axe-core Sweep

```bash
npm run dev
```

Open DevTools. `@axe-core/react` runs automatically and logs violations to the console. Fix every violation before release. axe covers WCAG 2.0, 2.1, 2.2 (Level A and AA) plus best practices.

### Manual Keyboard Test

Tab through the entire interface. Every interaction (search, selection, copy, reset, refine, settings) must be reachable and operable without a mouse. Tab order must follow visual reading order.

### Zoom Test

- 200%: Text readable, no content hidden or truncated
- 400%: No horizontal scrolling required

### Screen Reader Test

Test with NVDA + Firefox and VoiceOver + Safari. Verify:
- Result list announcements fire when search fires
- BottomSheet heading receives focus on select
- Copy and reset announcements fire via `announce()`
- Settings panel open/close restores focus correctly
- Drawer focus trap works on mobile
- `<html lang>` updates when user switches language

### Dark Mode Test

Toggle dark theme. Inspect all states:
- Empty state
- Results list
- Selected finding detail
- Settings panel
- AI refinement active
- All four severity badge levels

### Responsive Test

Test at three widths: 375px, 768px, 1280px. Layout, text, and controls must hold at each width.

### Prefers Contrast Test

Emulate `prefers-contrast: more` in DevTools. Contrast tokens must apply without breaking layout.

### Text Spacing Test

Use WCAG text spacing bookmarklet (increases letter-spacing, word-spacing, line-height, paragraph spacing by 0.5em). No content loss.

---

## i18n Workflows

See [i18n-WORKFLOW.md](i18n-WORKFLOW.md) for complete translation procedures including parity checks and scripted workflows.

### String Coverage

Any new UI text must use `t('key')` from `src/i18n/en.json`. Never hardcode English strings in components.

### Key Parity

Every key in `en.json` must exist in all 49+ other locale files. Missing keys fall back to the key literal, which is visible to users. Run the parity check after every session that modified `en.json`:

```sh
node -e "
const fs=require('fs'),path=require('path');
const dir='src/i18n';
const en=JSON.parse(fs.readFileSync(path.join(dir,'en.json'),'utf8'));
const keys=Object.keys(en);
fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&f!=='en.json').forEach(f=>{
  const loc=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  const missing=keys.filter(k=>!(k in loc));
  if(missing.length) console.log(f,missing);
});
console.log('parity check done');
"
```

### Translate New Keys

After adding keys to `en.json`, run:

```bash
ANTHROPIC_API_KEY=... npm run translate
```

The script detects keys still holding English fallback values and translates them in one pass.

### Track Edits

Log all `en.json` changes in `docs/i18n-edits.md`. Note key and old/new value. Batch them and run the translate workflow below rather than translating immediately.

### Full Translate Workflow

Run whenever `docs/i18n-edits.md` has unresolved entries:

**Step 1 — Parity (no API needed):** Compare `es.json` keys against all other locale files. Add missing keys with English value as placeholder. Commit: `i18n: add missing keys as English placeholders`.

**Step 2 — Retranslate stale keys:** Find keys whose English source changed since `scripts/en-snapshot.json` was last written. Run:

```bash
ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs
```

Commit: `i18n: retranslate stale keys, English source changed`.

**Step 3 — Translate placeholders:** Find all values identical to their `en.json` counterpart. Run the same script:

```bash
ANTHROPIC_API_KEY=... node scripts/translate-missing.mjs
```

Commit: `i18n: translate remaining English placeholder values`.

After all three steps, update `docs/i18n-edits.md` to mark resolved entries.

### Announce Audit

Verify all `announce()` call strings are pulled from `t()` and that every locale file has the corresponding key translated (not just English fallback).

### Corpus Translation

Defect descriptions and suggested fixes in `corpus.json` should have locale-specific overlays. Run `npm run translate` whenever entries are added or edited. WCAG SC names and codes should remain in English in all locales.

### Technical Term Review

After machine translation batches, flag corpus entries using WCAG-specific terms (accessible name, focus trap, landmark, live region, ARIA role) for human review. Machine translation of these terms is unreliable.

### Capitalization Conventions

- English variants: NYT title case
- Romance/Germanic: sentence case
- Caseless scripts (CJK, Arabic, Uyghur, Tamil, Devanagari): no change

Apply when adding keys or updating existing ones.

### Lang Attribute

`<html lang>` updates correctly when user switches language. Verify with screen reader after any changes to `App.jsx` language effect.

---

## Plugin Workflows

Plugins (`src/plugins/router/`, `src/plugins/announce/`, `src/plugins/debug/`) are designed to be portable.

### Import Isolation

Verify no plugin file imports from app-level code:
- `../../App`
- `../../hooks`
- `../../services`
- `../../i18n`
- `../../data`

Plugins may only import from React, react-dom, and declared external packages.

### External Dependencies

List any non-React external packages imported by plugins (currently: `lucide-react` in `router/`). Document in the plugin's `README.md` under a "Dependencies" heading.

### README Accuracy

Verify `src/plugins/router/README.md`, `src/plugins/announce/README.md`, and `src/plugins/debug/README.md` match current exports. Update if hooks or components were added, renamed, or removed.

---

## Documentation Workflows

### CHANGELOG

Add entry for meaningful code changes (bug fixes, features, refactors, dependency updates). Use format: `category: description`.

### UPDATES

Plain-language entry for anything user-facing. Explain what changed and why.

### TODO

Completed items: mark with strikethrough (`~~text~~`) and move to bottom of section. Fully retired items: move to `## Resolved` section.

### README Accuracy

Review README.md entirely:
- Feature descriptions match current implementation
- Project structure lists actual files with accurate descriptions
- Phase table reflects current state of each phase
- Component count matches actual components
- Debug command table matches `runCommand()` in `App.jsx`
- Easter eggs table matches `EASTER_EGGS` object in `App.jsx`
- Finding schema matches `corpus.json` fields exactly

### Corpus Entry Count

Run:

```bash
node -e "console.log(require('./src/data/corpus.json').length)"
```

Update README entry count.

### Hooks and Services List

Verify every file in `src/hooks/` and `src/services/` appears in README with accurate one-line description.

### Plugin READMEs

Verify export lists and API docs in each plugin's README match current exported symbols.

### CONTRIBUTING Schema

Defect schema example in CONTRIBUTING.md must match `corpus.json` fields exactly.

### MAINT-LOG

Add row after every maintenance sweep. Keep newest first. Format: `| YYYY-MM-DD | [section] | [result] |`

### Privacy Disclosure

Open About panel and verify Privacy & Storage section lists all `localStorage` keys accurately. Update if storage keys change.
