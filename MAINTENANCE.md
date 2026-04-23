# Maintenance Checklist

Recurring sweeps to run before releases, after major changes, or on a regular schedule. Most require judgment — automated checks are noted where available.

---

## CSS and design tokens

- [ ] **Token audit** — search for hardcoded values (`#ffffff`, `14px`, `1rem`, `6px`) not using `var(--*)` tokens; update to reference `tokens.css`
- [ ] **DRY pass** — look for repeated inline style patterns across components that could become utility classes in `typography.css` or `index.css`
- [ ] **Dark mode check** — toggle to dark theme and visually inspect every screen state: empty, search results, selected defect, settings panel, AI refine active
- [ ] **Responsive check** — resize browser at three widths: 375px (mobile), 768px (tablet / breakpoint), 1280px (desktop); confirm layout, text, and controls hold at each
- [ ] **Unused tokens** — check `tokens.css` for any custom properties no longer referenced anywhere
- [ ] **Dead code removal** — search for unused CSS classes, commented-out markup, and unreachable JS (dead component props, stubbed functions that will never be called, orphaned imports); remove rather than leave in place

---

## WCAG 2.2 compliance

- [ ] **1.1.1 Non-text content** — all icon buttons (`⚙`, `◐`, `×`) have descriptive `title` or `aria-label`
- [ ] **1.3.1 Info and relationships** — page has correct landmark structure: `<header>`, `<main>`, `<footer>`; result list uses `role="listbox"` / `role="option"`
- [ ] **1.4.3 Contrast (AA)** — all text/background pairs ≥ 4.5:1 normal, ≥ 3:1 large text; check both light and dark themes; check priority badge colors
- [ ] **1.4.4 Resize text** — zoom browser to 200%; confirm text readable and no content hidden or truncated
- [ ] **1.4.10 Reflow** — zoom to 400%; confirm no horizontal scrolling required (WCAG 2.2)
- [ ] **1.4.11 Non-text contrast** — UI component borders and focus rings ≥ 3:1 against adjacent color
- [ ] **1.4.12 Text spacing** — apply WCAG text spacing bookmarklet; verify no content loss (line-height 1.5×, letter-spacing 0.12em, word-spacing 0.16em)
- [ ] **2.1.1 Keyboard** — tab through entire interface without a mouse; confirm every interactive element is reachable and operable; test search, result selection, copy, refine, settings, close
- [ ] **2.4.3 Focus order** — tab order follows logical visual reading order
- [ ] **2.4.7 Focus visible** — focus indicator visible on every focusable element in both themes
- [ ] **2.5.3 Label in name** — visible label text matches or is contained in the accessible name of interactive elements
- [ ] **2.5.5 Target size (AAA)** — interactive controls ≥ 44×44px; `.btn-icon` class handles icon buttons; verify platform toggle and copy buttons
- [ ] **2.5.8 Target size (AA, WCAG 2.2)** — minimum 24×24px for all controls
- [ ] **3.1.1 Language** — `<html lang="en">` present; update to match active locale when i18n is implemented
- [ ] **4.1.2 Name, role, value** — all interactive elements properly labeled; AI toggle has `role="switch"` and `aria-checked`
- [ ] **4.1.3 Status messages** — copy confirmation and AI refine status should use `aria-live`; verify screen reader announces these

---

## Security and privacy

- [ ] **API key handling** — keys are stored in `localStorage` only, never logged, never included in any fetch body other than the provider's own endpoint; audit `aiService.js` on every change
- [ ] **`rel` audit** — all `target="_blank"` links have `rel="noreferrer"`; check `App.jsx` footer link and any links added to corpus entries
- [ ] **No `innerHTML`** — search codebase for `innerHTML` assignments; all DOM content must use React's JSX or DOM API methods
- [ ] **`localStorage` inventory** — only `theme`, `ai_provider`, and `apikey_<provider>` should be stored; audit for any unintended additions
- [ ] **No analytics or tracking** — confirm no third-party scripts, pixels, or beacons have been added
- [ ] **GDPR / privacy** — no personal data is collected or transmitted by the app itself; user-supplied API keys go only to the chosen AI provider; document this clearly in Settings UI
- [ ] **Dependency audit** — `npm audit`; high or critical severity issues should be resolved before release
- [ ] **`npm outdated`** — review outdated packages; apply non-breaking updates

---

## SEO (relevant when Phase 3 goes public)

- [ ] **`<title>`** — accurate and descriptive
- [ ] **`<meta name="description">`** — present in `index.html`; update when app purpose or audience changes
- [ ] **`lang` attribute** — `<html lang>` matches active language
- [ ] **OG / social meta** — `og:title`, `og:description`, `og:image` present for public version
- [ ] **`robots.txt`** — present and correct for public version; Phase 1 (personal) can disallow all
- [ ] **Canonical URL** — `<link rel="canonical">` for public version
- [ ] **Favicon** — present and renders correctly in browser tab

---

## Functionality and performance

- [ ] **Search accuracy** — test 10 representative queries; confirm expected defects surface in top 3 results; if relevance is off, review Fuse.js weights and keyword coverage
- [ ] **Platform filter** — confirm Web results exclude `native`-only entries; Native results exclude `web`-only; `both` entries appear in both modes
- [ ] **Copy behavior** — confirm description and remediation copy correctly in Chrome, Firefox, and Safari; check that location prefix is included when set
- [ ] **AI refinement** — with a valid API key, submit a refinement note; confirm description and remediation update correctly; confirm error state displays if the call fails
- [ ] **Theme persistence** — toggle theme, reload; confirm preference is restored
- [ ] **Bundle size** — run `npm run build`; review Vite output for unexpectedly large chunks; target < 200kB gzipped total
- [ ] **Cold load time** — open app in an incognito window on a throttled connection (Chrome DevTools → Slow 3G); confirm search is usable within 3 seconds
- [ ] **No console errors** — open DevTools on a production build; confirm zero errors and zero unexpected warnings

---

## Localization (i18n)

- [ ] **String coverage** — when new UI text is added, confirm it uses `t()` from react-i18next rather than a hardcoded string; run a search for raw English strings in JSX
- [ ] **Locale file parity** — all keys present in `en/translation.json` should exist in every other locale file; missing keys fall back to English silently — catch them before release
- [ ] **Corpus translation sync** — when entries are added or edited in `defects.json`, re-run the translation pass and update the `translations` object for all languages
- [ ] **Technical term review** — after any machine translation batch, flag entries containing specialized a11y terms (accessible name, focus trap, landmark, live region, aria) for human review; machine translation of these is unreliable
- [ ] **`lang` attribute** — confirm `<html lang>` updates correctly when the user switches language
- [ ] **RTL readiness** — note any languages added in future that require right-to-left layout (Arabic, Hebrew); current language set is all LTR

---

## Documentation

- [ ] **CHANGELOG.md** — add an entry for any meaningful code change; use date-first headers; group by area
- [ ] **UPDATES.md** — add a plain-language entry for anything user-facing; written for yourself, not a client
- [ ] **TODO.md** — close resolved items; move to Resolved section; add new findings under the correct category
- [ ] **README.md** — confirm project structure section matches actual files; update phase table if status changes
- [ ] **CONTRIBUTING.md** — confirm defect schema matches current `defects.json`; update if fields are added or renamed
- [ ] **MAINTENANCE.md** (this file) — add new sweep sections when new systems are introduced (i18n, Supabase, Phase 3 public data, etc.); retire checks that no longer apply
