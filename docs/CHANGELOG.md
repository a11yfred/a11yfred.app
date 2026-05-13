# Changelog

All significant changes to A11yFred, newest first.

---

## 2026-05-10

### Code quality and refactoring passes

- `SearchBar.jsx`: removed local `CYCLE_MS` redeclaration; now imports from `constants.js`
- `SettingsPanel.jsx`: removed redundant `|| 'fallback'` from agentic mode label; wired `t('settings.agentic_mode_desc')` to replace hardcoded English description; imported `TOAST_HIDE_DURATION` for save-button toast
- `DetailPanel.jsx`: all copy and reset timeouts now use `NOTIFICATION_TIMEOUT`; removed stray blank line in import block
- `App.jsx`: extracted duplicate `recentFindings` localStorage update into module-level `recordRecentFinding()` helper (was repeated in `applySelectFinding` and `handleSelectRelated`)
- `constants.js`, `ResultList.jsx`, `Field.jsx`, `index.css`, `router.css`: removed double blank lines

### CSS mobile-first refactor and JS cleanup

- Converted all remaining `(width < 768px)` blocks in `index.css`, `ui.css`, and `router.css` to mobile-first `(width >= 768px)` overrides; base styles now target mobile by default
- Moved `.field__actions` margin-top from base to desktop-only block
- Merged `.confetti-canvas` and `.sparkles-canvas` shared declarations in `router.css`; fixed `no-descending-specificity` on `.sheet-close-bottom-btn` by reordering selectors
- `Button.jsx`: removed dead `displayTitle` variable (always equaled `title`)
- `constants.js`: removed three dead exports (`PRIORITY_ORDER`, `VERSION_ORDER`, `LEVEL_ORDER`) with no importers anywhere in the codebase
- `AdminPanel.jsx`: replaced triple ternary corpus selection with object map
- `i18n/index.jsx`: replaced `new RegExp(..., 'g')` in variable-substitution loop with `replaceAll()` to avoid per-call regex allocation
- `README.md`: corrected UI component count to 21 (was 20)

---

## 2026-05-08

### App rename: A11yTextHelper → A11yHelper

- Renamed app from A11yTextHelper to A11yHelper; domain updated to a11yhelper.app
- Updated 89 files: package.json, index.html, App.jsx, all 64 locale JSON files, all docs, extension manifests, Electron builder config, plugin and script files

---

## 2026-05-07

### Structural merges (personal-corpus.json, 153 → 147 entries)

#### Merge 1 of 4: ATH-037 absorbed into ATH-040 (SC 1.4.3)

**Retired:** ATH-037 "Insufficient Text Contrast on Inline Link"

**Reason:** ATH-037 was a specialization of ATH-040 covering the same SC (1.4.3) with the additional requirement that inline links also need a non-color differentiator. Same primary SC, same fix approach, same severity (Critical). The inline-link scenario is better expressed as a named case inside the general contrast entry than as a standalone entry.

**What was preserved from ATH-037:**

- ATH-037 desc material (inline link dual requirement: 4.5:1 contrast + non-color indicator) added as a third sentence to ATH-040 desc
- ATH-037 fix material (non-color differentiator for links; 3:1 color difference to surrounding body text) added as a dedicated paragraph in ATH-040 fix
- ATH-037 keywords absorbed: `link contrast`, `inline link`, `link differentiation`, `underline`, `color only`
- ATH-037 related entry `1.4.1 Use of Color (Level A)` absorbed into ATH-040 related
- `compound failure` keyword added to ATH-040 (the inline link scenario fails both 1.4.3 and 1.4.1 simultaneously)

**ATH-040 before:**

> desc: "Text does not meet the minimum contrast ratio of 4.5:1 against its background (3:1 for large text). Users with low vision or color blindness cannot read text rendered at insufficient contrast."
>
> fix: "Adjust foreground or background colors... Verify all text states... Disabled text is exempt. Verify both light and dark mode variants if applicable."

**ATH-040 after:**

> desc: adds: "Inline links are a common failure point: link text must meet 4.5:1 against its background and must also be distinguishable from surrounding body text by a non-color indicator (underline, border, or icon), because color difference alone does not satisfy SC 1.4.1."
>
> fix: adds: "For inline links, add a non-color differentiator (underline, border-bottom, or icon) in addition to meeting the 4.5:1 contrast threshold. If relying on color difference between the link and surrounding body text, that color difference must also meet at least 3:1 (SC 1.4.1)."

---

#### Merge 2 of 4: ATH-080 absorbed into ATH-079 (SC 3.2.4)

**Retired:** ATH-080 "Inconsistent Identification of Same Component"

**Reason:** ATH-079 (same function, different control type across pages) and ATH-080 (same component, different accessible name across pages) are both SC 3.2.4 with identical fixes. The distinction is a difference in framing rather than a difference in failure or remedy. Auditors report one finding per page for this SC. Combining them removes ambiguity about which entry to use.

**What was preserved from ATH-080:**

- ATH-080 desc material ("same component uses different accessible names, visual labels, or iconography") merged into ATH-079 desc as a second sentence expanding the scope
- ATH-080 fix material ("design token", "shared component", "audit every instance", "label consistency") absorbed into ATH-079 fix
- ATH-080 keywords absorbed: `inconsistent identification`, `naming convention`, `design token`, `shared component`, `label consistency`, `accessible name`
- ATH-080 related entry `4.1.2 Name, Role, Value (Level A)` absorbed into ATH-079 related

**ATH-079 title change:** "Inconsistent Controls for Same Functionality" → "Inconsistent Identification of Controls Across Pages"

**ATH-079 desc before:**

> "A UI component that serves the same function appears with different accessible names, roles, or visual labels across pages. Screen reader users who search by label or navigate by element type encounter the same component under different names..."

**ATH-079 desc after:**

> Adds second sentence: "Users who learn a control's identity in one location cannot recognize it in another, breaking consistency across the experience."

---

#### Merge 3 of 4: ATH-055 absorbed into ATH-054 (SC 2.1.2)

**Retired:** ATH-055 "Partial Keyboard Trap"

**Reason:** Both entries cover SC 2.1.2 No Keyboard Trap. ATH-054 was a complete trap (no exit at all). ATH-055 was a partial trap (exit exists but is unreliable: reopens immediately, Escape bound to component not document). The fix for both is substantively identical. Merged into ATH-054 with severity-range language to preserve the Critical/High distinction.

**What was preserved from ATH-055:**

- ATH-055 desc material ("partial trap", "component reopens immediately", "Escape fires on component not document") merged into ATH-054 desc as description of the partial-trap failure mode
- ATH-055 fix material ("bind Escape to document not component", "permanent dismissal") absorbed into ATH-054 fix
- ATH-055 keywords absorbed: `partial keyboard trap`, `widget`, `arrow keys`, `stuck focus`, `dropdown`, `focus cycle`
- Severity-range language added: "When no exit path exists, the failure is Critical; when an exit path exists but is unreliable, the failure is High."

**ATH-054 desc before:**

> "Keyboard focus enters a component... and has no way out. The Escape key does not dismiss the component, no visible close control exists or is keyboard accessible, and no other exit mechanism is available. Keyboard-only users cannot leave the component without refreshing the page."

**ATH-054 desc after:**

> "...In a complete trap, the Escape key does not dismiss the component, no keyboard-accessible close control exists, and no exit path is available without a page refresh. In a partial trap, the component can sometimes be dismissed but reopens immediately, the Escape key fires on the component instead of the document, or the exit path is undocumented. When no exit path exists, the failure is Critical; when an exit path exists but is unreliable, the failure is High."

---

#### Merge 4 of 4: ATH-101, ATH-102, ATH-103 absorbed into ATH-100 (SC 2.4.6)

**Retired:** ATH-101 "Text Styled as Heading Not in Heading Markup", ATH-102 "No Heading Structure on Page", ATH-103 "Missing or Non-Descriptive Headings"

**Reason:** All four entries cover SC 2.4.6 Headings and Labels. Auditors do not report four separate findings for heading problems on a single page: they report one structural heading finding with multiple observations. The four failure modes (skipped levels, styled-not-marked, absent headings, vague headings) are clearly distinct and all belong in a single comprehensive entry that covers the full space of heading failures.

**What was preserved from ATH-101:**

- Desc: "text that visually functions as a section heading uses styling but is not marked with a heading element" → named as failure mode (2)
- Fix: "do not use `<p>`, `<span>`, `<div>`, or `<strong>` as substitutes for heading elements"
- Keywords: `heading markup`, `styled text as heading`, `visually heading`, `unmarked heading`, `bold paragraph`, `CSS heading`
- Links: Roselli "Irrational Headings"

**What was preserved from ATH-102:**

- Desc: "no heading elements at all; screen reader users must read the entire page linearly" → named as failure mode (3)
- Fix: "every page needs at least one heading"
- Keywords: `no headings`, `missing heading structure`, `no h1`
- Related: `2.4.1 Bypass Blocks (Level A)`

**What was preserved from ATH-103:**

- Desc: "heading text is vague or generic (e.g., 'Section' or 'Details')" → named as failure mode (4)
- Fix: "Rewrite vague headings to accurately describe the content below. Heading text should be concise, unique within the page, and meaningful without surrounding context."
- Keywords: `missing heading`, `non-descriptive heading`, `vague heading`, `heading text`, `section heading`, `untitled section`
- Links: Roselli "Irrational Headings" (already in ATH-101, one copy in merged entry)

**ATH-100 title change:** "Heading Levels Out of Order" → "Heading Structure Missing, Incorrect, or Non-Descriptive"

---

### Data fix: ATH-148 and ATH-149–153 sc field cleanup

- ATH-148: `sc` field contained `"3.2.3 Consistent Navigation"` (text embedded alongside the number) → corrected to bare `"3.2.3"`; `"3.2.3"` also removed from keywords (redundant now that sc is properly set)
- ATH-149–153: `sc` fields contained full SC names (`"4.1.3 Status Messages"`, `"3.3.1 Error Identification"`, etc.) → corrected to bare SC numbers (`"4.1.3"`, `"3.3.1"`, `"2.4.3"`, `"4.1.2"`, `"4.1.2"`)

---

### Compound SC additions (5 entries)

These entries already described dual-SC failures in their desc and fix. The `compound failure` keyword was added and related arrays confirmed to contain the secondary SC.

| Entry | Primary SC | Secondary SC | Reason |
| --- | --- | --- | --- |
| ATH-040 | 1.4.3 | 1.4.1 | Inline link scenario fails both contrast minimum (1.4.3) and color-only differentiation from body text (1.4.1) simultaneously |
| ATH-048 | 1.4.11 | 2.4.11 | Desc and fix explicitly address both non-text contrast failure (1.4.11) and focus indicator contrast failure (2.4.11) on the same control |
| ATH-067 | 2.4.7 | 1.4.11 | Desc says input lacks visible boundary (1.4.11 failure) AND visible focus indicator (2.4.7); fix references both contrast thresholds |
| ATH-049 | 2.1.1 | 2.4.7 | Desc explicitly notes the hidden control also fails focus visibility; related already contains 2.4.7 and 1.4.11 |
| ATH-038 | 1.4.1 | 1.3.3 | Color-only state communication (1.4.1) commonly co-occurs with instructions that rely on sensory characteristics like shape+color (1.3.3); `1.3.3 Sensory Characteristics` added to related |

---

### Keyword quality pass (personal-corpus.json, all 153 entries)

Cross-corpus frequency analysis identified 10 terms appearing in 10+ entries and internal duplication patterns in 20+ entries. Changes applied across all entries:

- Removed failure-technique and WCAG success criterion codes from keywords (F44, F54, F80, H42, G183, etc.): these belong in links, not search metadata
- Removed bare AT names (screen reader, NVDA, JAWS, VoiceOver, TalkBack) from web entries where the failure is not AT-specific; retained on native entries and entries specifically about AT announcement behavior
- Consolidated substring duplicates (e.g., "chart" + "bar chart" + "pie chart" → keep compounds; "heading" + "heading levels" + "heading structure" → keep compounds only)
- Removed fix-detail terms that are implementation tokens rather than failure signals (e.g., "keydown", "onchange", "aria-owns", "axios", "pushState" where not the primary failure concept)
- Removed SC numbers used as bare keywords where the SC is already the entry's primary sc field
- Removed vague/generic terms that produce false positives: "native", "iOS", "Android" on entries already scoped by platform field; "keyboard", "screen reader", "validation", "cognitive" where more specific terms already present
- ATH-120: removed exact duplicate "duplicate id" keyword
- ATH-044: trimmed from 25 to 15 keywords
- ATH-002: trimmed from 25 to 14 keywords
- ATH-004: trimmed from 22 to 12 keywords
- ATH-123: trimmed from 22 to 12 keywords
- ATH-134: trimmed from 20 to 12 keywords

Result: average 9.7 keywords per entry (was ~12+), min 6, max 15, zero exact duplicates, all automated checks passing.

---

### New native Best Practice entries ATH-154 and ATH-155

- ATH-154: Best Practice "Dark Mode Not Supported (Native App)": iOS semantic colors / SwiftUI adaptive colors / asset catalog Light+Dark variants; Android values-night / MaterialTheme.colorScheme / AppCompatDelegate. Sources: Apple, Google
- ATH-155: Best Practice "UI Does Not Support System Magnification (Native App)": iOS Accessibility Zoom / Display Zoom / Auto Layout constraints; Android display size / densityDpi / fontScale config changes. Sources: Apple, Google
- Native entry count: 11 → 13; total corpus: 151 → 153

---

### Content expansion: ATH-106 Android 16 orientation details

- ATH-106 fix: added Android 16 (API 36) behavior: orientation locking via `android:screenOrientation` and `Activity.setRequestedOrientation()` is ignored on large screens (≥600dp) including tablets and unfolded foldables; WCAG 1.3.4 compliance is automatic on those form factors for apps targeting API 36+; temporary opt-out via `android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY` removed in Android 17
- ATH-106 links: added Android 16 behavior changes doc (developer.android.com)
- ATH-106 keywords: added `android 16`, `API 36`, `large screen`, `foldable`, `resizability`

---

### Corpus review: colon cleanup, phrasing fixes, and content fixes

- ATH-106 desc: `...the user cannot see: including wheelchair users with mounted devices, cannot access content locked to the opposite orientation` → parenthetical `(including wheelchair users with mounted devices) cannot access...` (colon pattern missed in previous pass)
- ATH-153 desc: `configured in a way that suppresses accessibility` → `configured to suppress accessibility` (tighter phrasing)
- ATH-085 links: added Understanding 3.1.5, Understanding 3.3.2, and WebAIM Fonts (entry previously had no links)
- ATH-017 desc: `...the user cannot see: including items inside collapsed or hidden regions` → parenthetical `(items inside collapsed or hidden regions and off-screen panels)`
- ATH-038 desc: `Users who cannot perceive color differences: including those with color blindness, users on monochrome displays, and users in high-contrast mode, cannot access...` → `Users who cannot perceive color differences (including those with color blindness, users on monochrome displays, and users in high-contrast mode) cannot access...`
- ATH-081 desc: `for all validation messages: including low-priority inline feedback` → comma: `for all validation messages, including low-priority inline feedback`
- ATH-142 desc: `Users who cannot perceive color differences: including those with color blindness or low vision, cannot identify...` → parenthetical `(including those with color blindness or low vision) cannot identify...`
- ATH-068 fix: `Add a visible text label to every interactive control` → `Add a visible text label to every icon-only control` (scoped to match the entry's actual subject)
- ATH-106 fix: `unless the content is essential in one orientation, e.g., a piano keyboard` → `such as a piano keyboard` (exception clause, not an example list; avoids two e.g. instances in one sentence)

---

### Desc trimming pass (personal-corpus.json, 7 entries)

ATH-053 was reviewed and retained as-is: the final sentence is deliberate severity-range language and must not be removed.

#### ATH-003

Before:

> UI components (buttons, inputs, checkboxes, radio buttons, toggle controls, icons) and graphical objects do not meet the 3:1 minimum contrast ratio against adjacent background colors in one or more states. This includes default, hover, and focused states. Users with low vision cannot distinguish the boundaries, states, or active areas of interactive controls. Failures on primary interactive controls such as form inputs and action buttons are more severe than failures on secondary decorative graphical objects.

After (sentences 1–2 merged; state list folded into sentence 1):

> UI components, e.g., buttons, inputs, checkboxes, radio buttons, toggle controls, and icons, and graphical objects do not meet the 3:1 minimum contrast ratio against adjacent background colors across all states including default, hover, and focused. Users with low vision cannot distinguish the boundaries, states, or active areas of interactive controls. Failures on primary interactive controls such as form inputs and action buttons are more severe than failures on secondary decorative graphical objects.

---

#### ATH-013

Before:

> An interactive control has an accessible name that does not match its actual function or context. The name may reuse a common convention with a different meaning, e.g., labeling a base-page action "Close" when that word conventionally signals dismissal of a modal or overlay. The name may also describe an appearance rather than a purpose. When the accessible name does not reflect the action, users relying on assistive technology cannot predict the outcome of activating the control.

After (sentences 2–3 merged into a compound clause):

> An interactive control has an accessible name that does not match its actual function or context. The name may reuse a common convention with a different meaning, e.g., labeling a base-page action "Close" when that word conventionally signals dismissal of a modal or overlay, or may describe an appearance rather than a purpose. When the accessible name does not reflect the action, users relying on assistive technology cannot predict the outcome of activating the control.

---

#### ATH-044

Before:

> Interactive controls cannot be reached or operated using a keyboard alone. A control may not be in the tab order, may not respond to expected keystrokes (Enter, Space, arrow keys), may rely exclusively on mouse or pointer event handlers, or may be a custom widget that does not follow the ARIA keyboard interaction pattern for its role. This includes custom checkboxes built without native input elements or without Space-key toggle handling. Keyboard-only users and screen reader users cannot use these controls.

After (sentences 2–3 merged; custom-checkbox clause folded into sentence 2 as parenthetical):

> Interactive controls cannot be reached or operated using a keyboard alone. A control may not be in the tab order, may not respond to expected keystrokes (Enter, Space, arrow keys), may rely exclusively on mouse or pointer event handlers, or may be a custom widget, including custom checkboxes without Space-key toggle handling, that does not follow the ARIA keyboard interaction pattern for its role. Keyboard-only users and screen reader users cannot use these controls.

---

#### ATH-069

Before:

> An interactive control's programmatic accessible name does not match or contain the visible label text shown on screen. The visible label and the accessible name diverge, so the spoken phrase a user says to activate the control does not correspond to any accessible name the browser can resolve. Voice Control and Dragon NaturallySpeaking users cannot activate the control by speaking its visible label. Screen reader users hear a name that does not reflect what is shown visually.

After (sentences 3–4 merged):

> An interactive control's programmatic accessible name does not match or contain the visible label text shown on screen. The visible label and the accessible name diverge, so the spoken phrase a user says to activate the control does not correspond to any accessible name the browser can resolve. Voice Control and Dragon NaturallySpeaking users cannot activate the control by speaking its visible label, and screen reader users hear a name that does not match what is shown visually.

---

#### ATH-086

Before:

> Form fields have labels that are present and programmatically determined, but too vague, abbreviated, or generic to communicate what the field expects. Labels like "Name", "Input", or "Field 1" do not indicate whether a full name, first name only, or a specific format is required. Format requirements, length constraints, and input patterns are either absent or placed only in placeholder text that disappears on entry. Users with cognitive disabilities cannot determine what to enter without trial and error.

After (sentences 2–3 merged):

> Form fields have labels that are present and programmatically determined, but too vague, abbreviated, or generic to communicate what the field expects. Labels like "Name", "Input", or "Field 1" do not indicate whether a full name, first name only, or a specific format is required, and format requirements, length constraints, or input patterns are either absent or placed only in placeholder text that disappears on entry. Users with cognitive disabilities cannot determine what to enter without trial and error.

---

#### ATH-134

Before:

> When a modal dialog or overlay is presented, background content remains accessible to assistive technology. On web, screen readers using browse (reading) mode can navigate outside the dialog and interact with elements that should be inert. On native platforms, VoiceOver and TalkBack can swipe past the modal into background views. In both contexts, users can activate blocked controls or encounter content out of context when assistive technology does not respect the modal boundary.

After (sentences 2–3 merged; platform-specific detail replaced with unified statement):

> When a modal dialog or overlay is presented, background content remains accessible to assistive technology. Screen readers in browse mode and native assistive technologies can navigate outside the dialog and interact with background elements that should be inert. In both contexts, users can activate blocked controls or encounter content out of context when assistive technology does not respect the modal boundary.

---

#### ATH-135

Before:

> A custom-built native UI control, a toggle, stepper, rating control, or interactive card, has no accessibility role set. VoiceOver announces the element without a role, or announces it with an incorrect default role. TalkBack announces it as a generic unlabeled element. Users cannot determine the control's type or how to interact with it.

After (sentences 2–3 merged):

> A custom-built native UI control, a toggle, stepper, rating control, or interactive card, has no accessibility role set. VoiceOver announces the element without a role or with an incorrect default role, and TalkBack announces it as a generic unlabeled element. Users cannot determine the control's type or how to interact with it.

---

### Full corpus review and content fixes (automated audit, 151 entries)

- ATH-052 title: "Skip Link Present but Not Visible to Keyboard Users" → "Skip Link Not Visible on Focus"
- ATH-086 title: "Form Label Does Not Describe Purpose or Expected Input" → "Form Label Too Vague to Describe Input Purpose"
- ATH-088 title: "Error Message Does Not Help User Correct the Input" → "Error Message Does Not Describe How to Correct"
- ATH-134 title: "Modal Does Not Hide Background Content from Screen Readers" → "Modal Does Not Hide Background from Screen Readers"
- ATH-149 desc: restructured to defect-first (was condition-first)
- ATH-150 fix: replaced generic error string example with concrete "Email address is required"
- ATH-152 desc: "labelled" → "labeled" (US English consistency)
- ATH-153 fix: "Ensure the HTML content..." → "Audit the HTML content..." (action verb)

---

### New native entries ATH-149–153 (personal-corpus.json)

- ATH-149: 4.1.3 "Dynamic Content Change Not Announced (Native App)": UIAccessibility.post / accessibilityLiveRegion / LiveRegionMode.Polite
- ATH-150: 3.3.1 "Form Error Not Announced After Validation (Native App)": UIAccessibilityPostNotification / TextInputLayout.setError / accessibilityLiveRegion
- ATH-151: 2.4.3 "Focus Not Restored After Modal Dismissal (Native App)": layoutChanged notification / @AccessibilityFocusState / requestFocus / FocusRequester
- ATH-152: 4.1.2 "Adjustable Control Missing Increment and Decrement Actions (Native App)": accessibilityTraits.adjustable / accessibilityIncrement / accessibilityDecrement / CustomAccessibilityAction
- ATH-153: 4.1.2 "WebView Content Not Exposed to Screen Readers (Native App)": WKWebView / Android WebView / screenChanged notification / isAccessibilityElement
- All sourced primarily from Apple developer documentation and Google Android accessibility guidelines
- Native entry count: 6 → 11; total corpus: 146 → 151

---

### Platform field audit and expansion

- ATH-071 `web` → `both`: expanded fix with Native iOS (44x44pt, UIEdgeInsets) and Android (48x48dp, TouchDelegate) guidance
- ATH-072 `web` → `both`: expanded fix with Native iOS (hitTest override) and Android (non-overlapping view bounds) guidance
- All other platform assignments confirmed correct: 6 native, 7 both, 133 web

---

### WCAG canonical terminology pass (personal-corpus.json, 146 entries)

- "programmatically associated" → "programmatically determined" in ATH-021, ATH-082, ATH-086, ATH-097 (WCAG normative term for 1.3.1 and 4.1.2)
- "programmatically exposed" → "programmatically determined" in titles of ATH-016, ATH-091, ATH-095
- "context change" → "change of context" in ATH-075, ATH-076, ATH-077, ATH-126 (WCAG defined term for 3.2.2)
- "focus ring" → "focus indicator" in ATH-003, ATH-004 (WCAG 2.4.7 term; ATH-137 UIKit usage preserved)
- "validation error/s" → "input error/s" in ATH-081 title, ATH-082 desc, ATH-083 desc (WCAG 3.3.1 term)
- "alt text description" → "text alternative" in ATH-002 (WCAG 1.1.1 term)
- "purely decorative" → "pure decoration" in ATH-124 (WCAG defined term)
- ATH-081 title rewritten: "Validation Errors Interrupt Input via Assertive Announcement" → "Input Errors Announced Too Aggressively via Live Region"
- Add ATH-148: 3.2.3 Consistent Navigation (gap entry)
- Merge ATH-045 into ATH-044: checkbox keyboard pattern folded into generic custom control entry; Sara Soueidan added to sourceCredits and links
- SC 4.1.1 Parsing formally excluded from corpus (deprecated in WCAG 2.2 HTML5 contexts)

---

### Voice and style pass on personal-corpus.json (146 entries)

- Convert all mid-sentence ": such as / : for example / : like" patterns to parentheticals across 14 entries (ATH-013, ATH-020, ATH-033, ATH-034, ATH-096, ATH-105, ATH-108, ATH-113, ATH-114, ATH-115, ATH-116, ATH-120, ATH-123, ATH-131)
- Replace all "users who rely on screen readers" with "screen reader users" (global)
- Replace all "cannot build a/an [accurate/reliable] mental model" with specific, observable failure language
- Convert mid-sentence colons before "including" clauses to parentheticals (ATH-034)
- ATH-108 fix: tighten two-dimensional scrolling exemption to "fundamentally requires" + "where that scrolling is essential"
- ATH-034 fix: add required error handling guidance (aria-invalid + associated error message)
- Remove ATH-018 (unlabeled tooltip trigger, fully covered by ATH-097); corpus is now 146 entries
- Demote ATH-026, ATH-033, ATH-077 from specific SC to Best Practice; move implicated SC to related field
- Fix SC 1.2.2 label: "Captions (Level A)" to "Captions (Prerecorded) (Level A)" in ATH-010, ATH-104, ATH-140
- Reorder sourceCredits in ATH-133 through ATH-139 (Apple/Google moved after Deque/Appt/MDN, before individual experts)
- ATH-129 fix restructured: single-field input as primary recommendation, ARIA fallback secondary
- All automated checks passing: id-not-first 0, self-references 0, bare Deque 0, Interactive Control titles 0

---

## 2026-05-06

### ESLint 9.x compatibility and dependency fixes

- Downgrade @eslint/js to 9.x for compatibility with ESLint 9.x environment
- Add eslint-plugin-react to resolve JSX import detection (modern JSX transform doesn't require React import)
- Disable outdated React rules: `react/react-in-jsx-scope`, `react/jsx-uses-react` (no longer needed with new JSX runtime)
- Remove duplicate props from App.jsx (Suspense was duplicated)
- Re-add necessary Suspense import to fix lazy component loading

### Compatibility verification

- All ESLint passes with no warnings
- jsx-a11y plugin working correctly with React 18 JSX transform
- No false positives on accessibility rules

---

### Button component consolidation and active state fixes

- Consolidate ~70 button instances into two base components: Button (text) and IconButton (icon-only)
- Remove StateButton, IconStateButton, and context-specific button styling patterns
- Add `.btn__field--success` styling for accent and tertiary icon button variants
- Fix icon button `:active` state color swap (now uses `var(--border)` background)
- Convert about-inline-link buttons to anchor tags with hash-based hrefs
- Remove `useRouter` import from AboutPanel (nav no longer uses onClick handlers)
- Fix help-tour-description font size (remove `var(--fs-small)` override)

### CSS tokenization

- Replace `outline-offset: 2px` with `var(--focus-outline-offset)` (21 instances)
- Replace `outline: 2px solid var(--focus)` with tokenized width (11 instances)
- Replace `max-width: 720px` with `var(--modal-max-width)` (2 instances)
- Replace `border-radius: 11px` (toggle) with `var(--toggle-radius)`

---

### Button icon placement and markup standardization

- Refactor StateButton to use `.btn-icon` container for icon centering
- Change save button from `icon={null}` to `icon={<Save />}` for consistent state button pattern
- Add `display: inline` to `.settings-save-btn` for proper icon/text alignment
- Add SVG styling rules (flex-shrink, line-height, vertical-align) for cross-browser consistency
- Restructure detail-revise-btn to use `.btn-icon` markup pattern
- Separate button icons from text spans in all button types

---

### CSS system refactor and token consolidation

- Fix broken `--fs-sm` token reference; replace with `--fs-small`
- Add `--platform-bg` and `--platform-text` tokens with dark mode overrides
- Replace 25+ hardcoded values with design tokens (colors, spacing, radii, transitions)
- Merge duplicate `.detail-copy-btn` and `.detail-sc-copy-btn` selectors
- Merge duplicate `.search-submit-btn` and `.results-narrow-submit-btn` selectors

### Content audit and accuracy fixes

- Fix "export findings" → "copy findings" in tour description
- Fix "sorted by severity" → "sorted by relevance and priority" in onboarding
- Remove shipped "Additional AI providers" from Coming Soon
- Fix hard-coded English in About panel; add `about.feature_ai_setup_link` token
- Remove orphaned i18n keys: `onboarding.skip`, `onboarding.nav_aria`, `onboarding.dot_aria`
- Remove orphaned reset keys: `confirm_reset_all_item_overrides`, `_contributions`
- Add Party Mode to About panel features list
- Update README: Phase 1 complete, corpus 107→133 entries, remove broken ARCHITECTURE.md reference

---

## 2026-05-05

### Code refactoring and constants consolidation

- Extract shared utilities: `findingSlug.js`, `constants.js`, `useToastState`, `storage.js`
- Replace ~30 magic numbers with named constants
- Remove ~90 lines of duplicate code across 4 files

### UI component library extraction

- Extract 9 reusable components (StateButton, InputWithClear, Badge, Field, PanelShell, BackButton, Toggle, RadioChip, Select) to `src/components/ui/`
- Refactor all consumers; all linters passing

### Agentic AI integration

- Add agentic mode toggle to DetailPanel and SettingsPanel (Claude/Anthropic only)
- Add 5 new i18n keys for agentic mode UI

### Corpus audit and quality improvements

- Reading level optimized (26 → 11 issues, 58% improvement); all em-dashes removed
- Rewrite 15 entries for ESL/middle school reading standard
- Cross-reference all corpus entries with same-SC related links (54 updated)
- Corpus: 87.6% meet ESL standard, 100% same-SC cross-referencing, all 89 entries validated

### SEO and documentation

- Uncomment SEO meta tags; enable crawlers; create sitemap
- Archive historical docs; all markdown files passing linting
- **Phase status**: Phase 1 complete, Phase 2 partial, Phase 3 planning

### Additional improvements

- Add AI Provider Privacy Comparison table
- Add platform badges (Web, iOS, Android, Web & Mobile) with 8-language translations
- Remove `aria-hidden` from app background div

---

## 2026-05-02: Onboarding panel, skip-to-next, priority sort, ad tile preview, and UX housekeeping

### Onboarding panel

- 3-slide paginated panel (Find, Refine, Copy) with Drawer on mobile, inline on desktop
- Auto-launches on first visit; re-launchable from Help panel; Escape shows confirm modal

### Ad tile preview (dev only)

- `SponsoredTile.jsx` placeholder with Sponsored badge and aria-label
- `AdminPanel.jsx` toggle + "Every N results" frequency input
- Injected after every nth result in ResultList; off by default

### Keyboard navigation + skip-to-next

- Per-result skip-to-next button (focus-only); wraps to first result
- Sort/priority controls moved after results in DOM

### Result list prioritization

- Sorted by archived → starred → priority → SC label

### UX completions

- Frequent findings boost via implicit open/copy tracking
- Pin results to home page with Pinned section above search
- Upvote/downvote ratings per card
- Narrow results mode with count display
- Related findings singular/plural label
- Reset All as BottomSheet with explicit lists

### Visual design

- Left-edge accent bar for selection (WCAG 1.4.1 non-color indicator)
- Severity badge moved below title in detail panel
- Responsive to short viewports (568px)

### Corpus & content

- All 89 entries sourced with 2+ expert references
- Gmail-style keyboard shortcuts (J/K/S/E/U/Shift+↑↓)

### Infrastructure

- Offline-first PWA with Service Worker caching + Web App Manifest

---

## 2026-05-01: Corpus sourcing completion, platform variant UI, content quality review

### Tier 2 sourcing complete: all 124 findings now 2+ sourced

- All entries with minimum 2 expert sources (10-expert consensus)
- Deep-linked where available

### Platform variant display implemented

- Platform badge on ResultList and DetailPanel
- Clickable to filter by platform (Web, iOS, Android, Web & Mobile)
- i18n support across 8 languages

### Content quality review + title standardization (ATH-001–040)

- Fixed 4 entries with inconsistent title patterns
- Added nuance details to ATH-002 and ATH-004

### JSON corruption recovery (ATH-044–050)

- Reconstructed 7 entries corrupted by failed regex replacement
- All 124 entries verified

---

## 2026-04-30

### Copy button icons and interaction refinements

- Copy icon for all copy buttons (distinct from Clipboard)
- Consistent NY Times title casing throughout
  - `edit.save_button`: "Save changes" → "Save Changes"
  - `contributions.export_button`: "Export as JSON" → "Export As JSON"
  - `detail.copy_all_text`: "Copy all" → "Copy All" (matching "Copied All" state)
- `src/index.css`: Added mouse-only hover states via `@media (pointer: fine)` for detail rows:
  - `.detail-title-row:hover` and `.detail-sc-item-row:hover` show subtle background highlight
  - Prevents unwanted hover states on touch devices

### Form field and button label improvements

- `src/components/DetailPanel.jsx`: Added space between "Location Prefix" label and "(optional)" text
- `src/index.css`: Updated `.detail-location-input-wrap` to use `align-items: center` for proper vertical centering of clear button
- `src/components/DetailPanel.jsx`: Separated reset button labels for clarity:
  - Field-level reset buttons show "Reset" (unchanged)
  - Bottom "Reset All Content" button shows different states: "Reset All Content" → "All Content Reset" after click
  - Added new i18n key `detail.reset_all_done_desktop`: "All Content Reset"

### Visual consistency

- All button text now uses NY Times title casing (capitalize most words except small articles/prepositions unless they're the first word)
- Copy buttons styled with transparent background and corner-radius hover states for subtle interaction feedback

---

### Copy buttons for finding details

- `src/components/DetailPanel.jsx`: Added state for `copiedTitle`, `copiedPrimarySc`, `copiedRelatedSc`
- Added handlers: `copyTitle()`, `copyPrimarySc()`, `copyRelatedSc()` using existing `copy()` utility
- **Title copy button**: Added `.detail-title-row` flex layout with title + Clipboard icon button
- **SC copy buttons**: Wrapped SC list items in `.detail-sc-item-row` flex layout with copy buttons for each
- All copy buttons show Check icon for 2 seconds on success, matching existing copy button behavior
- `src/i18n/en.json`: Added `detail.copy_title_aria`, `detail.copy_sc_aria`, updated `detail.reset_all_fields_text` to "Reset content"
- `src/index.css`: Added `.detail-title-row`, `.detail-copy-btn`, `.detail-sc-item-row`, `.detail-sc-copy-btn` classes

### Location prefix UX improvements

- `src/components/DetailPanel.jsx`: Updated location field label to conditionally show `(optional)` only when field is empty
- **Clear button**: Added × button with `.detail-location-clear-btn` positioned absolutely inside input (same pattern as search clear)
- `src/index.css`: Added `.detail-location-input-wrap`, `.detail-location-clear-btn` classes for input wrapper and positioned clear button

### Narrow mode UI refinements

- `src/components/SearchBar.jsx`: Imported Filter and X icons from lucide-react
- **Filter icon**: Added Filter icon to narrow button
- **Button repositioning**: Moved narrow button below search input via new `.search-narrow-button-row` container with left alignment
- **Exit button redesign**: Changed from text "Exit" to X icon using `btn-icon` class for consistency with reset icon style
- **Focus restoration**: Added `handleNarrowClick()` to focus input after entering narrow mode via `setTimeout(...inputRef.current?.focus())`
- **Label update**: Changed `search.narrow_label` key usage to `search.narrowing_results` for "Narrowing results" in narrow mode
- **Removed badge**: Deleted `.search-narrow-badge` pill from label row (simplified visual)
- `src/i18n/en.json`: Added `search.narrowing_results`, `search.exit_narrow_aria`
- `src/index.css`: Updated `.search-exit-narrow-btn` to use `btn-icon` styling; added `.search-narrow-button-row`, `.search-narrow-btn` for below-input placement and Filter icon

---

### Narrow results mode

- `src/App.jsx`: Added `narrowMode` and `narrowQuery` state in AppShell; passed through AppContent tree
- `src/components/SearchBar.jsx`: Conditional label, placeholder, and clear button text when `narrowMode` is true
- Search input switches label to "Narrow results" and placeholder to "Filter within {count} results…"
- "Exit" button appears instead of Search button to exit narrow mode
- Narrow badge pill shows to right of label when active
- `src/components/ResultList.jsx`: Added `narrowMode`, `narrowQuery`, `narrowResults`, `onNarrow` props
- Results filtered via fuzzy search on title, description, keywords, source names (same Fuse.js logic)
- Count display shows "{narrowed} of {total} Results" format when in narrow mode
- "Narrow" button appears next to results count when not already narrowing
- Live-search setting governs narrow filter updates (real-time vs. on-submit)
- Clear button behavior: in narrow mode, clears narrow filter and returns to base search; normally clears search entirely
- `useMemo` in App computes `narrowedResults` based on `narrowQuery` filtering `results` array
- `src/i18n/en.json`: Added 11 new keys for narrow mode UI labels and placeholders
- `src/index.css`: Added `.search-narrow-badge`, `.search-exit-narrow-btn`, `.results-count-actions`, `.results-narrow-btn` classes

### Reset All redesign + UI refinements

### Reset All BottomSheet with explicit lists

- `src/components/SettingsPanel.jsx`: Changed from Modal to BottomSheet to show detailed lists
- `src/i18n/en.json`: Added 18 new keys with granular copy for what gets cleared and reset values
- Red warning box with AlertTriangle icon at top
- Two sections: "Will permanently delete" (7 items) and "Will reset to defaults" (5 settings with explicit values)
- BottomSheet allows room for detailed lists; Modal was too cramped
- Button layout in drawer footer with accent/secondary button pair
- Added `.settings-reset-sheet`, `.settings-reset-warning`, `.settings-reset-section`, `.settings-reset-list`, `.settings-reset-actions` CSS classes

---

### Related findings display

- `src/components/DetailPanel.jsx`: `RelatedIssues` component detects single vs. multiple findings
- Single finding: renders inline via `.detail-related__single` (no list markup)
- Multiple findings: stack as bulleted list via `.detail-related__list`
- `src/i18n/en.json`: `detail.related_issue_heading` (singular) added alongside `detail.related_heading` (plural)
- Single-item display reduces visual clutter and follows the same UX pattern as `SourceLinks`

### Animations and responsive design

- All entrance/exit transitions now consistent app-wide
- BottomSheet: slide-up entrance + slide-down exit
- ResultList: stagger animation on load
- SettingsPanel: smooth transition on desktop
- All animations respect `prefers-reduced-motion: reduce`
- Result cards responsive to 568px viewport height (iPhone SE landscape) via fold behavior

### WCAG 1.4.1 selection indicator

- Selected result card includes non-color indicator (left-edge accent bar from fold)
- Selection state now perceivable without relying on color alone
- Meets WCAG 2.2 1.4.1 Use of Color

### PWA offline support

- Service Worker caches app shell and corpus JSON
- Web App Manifest enables home screen installation
- Full search functionality available offline after first load
- Tested on mobile Chrome

---

## 2026-04-29

### Multi-platform distribution scaffolds

Three feature branches scaffolded for non-web distribution. No existing source files on `main` were modified; all changes are additive and branch-isolated.

#### Chrome extension (`feature/chrome-extension`)

- `extension-static/manifest.json`: Manifest V3; `side_panel` target, `sidePanel` permission
- `extension-static/background.js`: minimal service worker; calls `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`
- `vite.extension.config.js`: `base: './'`, `publicDir: 'extension-static'`, `outDir: 'dist-extension'`
- `package.json`: `build:extension` script added

#### Firefox extension (`feature/firefox-extension`)

- `extension-firefox-static/manifest.json`: Manifest V3; `sidebar_action` + `browser_specific_settings.gecko` ID; no background script (Firefox opens sidebar automatically)
- `vite.firefox.config.js`: `publicDir: 'extension-firefox-static'`, `outDir: 'dist-extension-firefox'`
- `package.json`: `build:extension:firefox` script added

#### Electron desktop (`feature/electron-app`)

- `electron/main.js`: `keys:set` / `keys:get` / `keys:delete` IPC stubs completed: `safeStorage.encryptString` / `decryptString` with `fs.writeFileSync` / `readFileSync` to `app.getPath('userData')`; `require('fs')` added
- `src/services/aiService.js`: `getAiRefinement`: API key read guarded with `window.electronAPI ? await window.electronAPI.keys.get(...) : localStorage.getItem(...)`
- `src/services/agenticAiService.js`: same guard for `apikey_anthropic`
- `src/components/SettingsPanel.jsx`: `keys` / `savedKeys` init skips localStorage in Electron; `useEffect` loads keys from `electronAPI.keys.get` after mount; `handleSave` routes writes through `electronAPI.keys.set/delete` vs `localStorage` depending on context
- `package.json`: `electron`, `electron-builder`, `concurrently` added to `devDependencies`

---

### Sources schema upgrade, corpus re-pass ATH-001–005, sources.json registry

#### Sources field schema

- `src/data/corpus.json`, `src/data/personal-corpus.json`: `sources` field migrated from `string[]` to `{ name: string, url: string | null }[]`; all existing entries converted via migration script
- `src/data/sources.json`: new fallback registry mapping author/org names to homepage URLs
- `src/components/DetailPanel.jsx`: source badge renders as `<a>` link when `url` is non-null, otherwise stays as filter `<button>`
- `src/components/ResultList.jsx`: same link/span pattern for result card source badges
- `src/App.jsx`: badge filter updated to `f.sources?.some(s => s.name === badgeFilter.value)`
- `src/plugins/debug/AdminPanel.jsx`: stats accumulation updated to use `src.name`
- `README.md`: schema block and field description updated to reflect `sources` object array

#### Corpus re-pass (ATH-001–005)

- ATH-001–004: deep source URLs added (WCAG Understanding docs, APG dialog-modal pattern)
- ATH-003: desc rewritten to explain compound failure (1.4.11 + 2.4.7); Critical priority confirmed and justified
- ATH-004: desc and rem tightened; keywords expanded (web, outline: none, outline: 0, css)
- ATH-005: desc and rem rewritten; rem now prescribes native elements first, then tabindex + ARIA role + keyboard handlers together

---

## 2026-04-28

### Archived item appearance

- `src/index.css`: `.result-row--archived .result-item` loses `opacity: 0.4`; opacity moved to children only (`.result-item__badges`, `.result-item__sc`, `.result-item__desc`) so the title text renders at full `var(--text)` color; `filter: grayscale(1)` remains on the parent
- `src/index.css`: `.result-row--archived .priority-badge/source-badge/wcag-badge`: unified to `background: var(--border); color: var(--text-faint)` (after badge base definitions to satisfy no-descending-specificity)
- `src/components/ResultList.jsx`: `.priority-badge` inline `style` skipped when `archived` so CSS archived override can take effect
- `src/index.css`: `.result-item__sc` gains `font-weight: 600`

### URL sync: live search

- `src/App.jsx`: `handleQueryChange` now calls `syncSearchUrl(q)` inside the `liveSearch` path; clicking a typewriter phrase or typing with live search on immediately writes `?q=` to the URL (previously only `handleSearch` did this)

### Settings: Unpin All, Reset rename, pinned-results row

- `src/components/SettingsPanel.jsx`: Unpin All button: `PinOff` icon; success state shows `Check` + "All Unpinned" for 1500ms with `.field-btn--success`
- `src/components/SettingsPanel.jsx`: Reset button renamed to "Reset Settings & Clear Data", class changed to `btn-danger`
- `src/components/SettingsPanel.jsx`: Reset confirm modal: heading updated to "Reset Settings & Clear Data?"; `AlertTriangle` icon inline in body text
- `src/index.css`: `.btn-danger`: red border/text, transparent bg, hover fills red; shared disabled rule extended
- `src/index.css`: `.settings-reset-warning-icon` and `.modal-heading-icon` for inline icon positioning
- `src/components/SettingsPanel.jsx`: Pinned Results row: desc text shows `t('settings.pinned_results_empty')` ("Nothing pinned.") when `!hasPins`

### Back to Top button

- `src/components/ResultList.jsx`: shown when `results.length > 50`; scrolls to top and focuses the results count `<h2>` via `countHeadingRef`
- `src/components/ResultList.jsx`: count heading uses a callback ref to serve both `countHeadingRef` (internal) and `countRef` prop (external); always has `tabIndex={-1}`
- `src/index.css`: `.back-to-top-btn` style

### Modal headingIcon prop

- `src/plugins/router/Modal.jsx`: optional `headingIcon` ReactNode rendered `aria-hidden` before heading text; `aria-label` stays a plain string

### axe: archived pin button

- `src/components/ResultList.jsx`: pin button gets `disabled={archived}`; marks it as a disabled control so axe skips its contrast check

### i18n

- `src/i18n/*.json` (63 locale files): 10 missing keys added as English placeholders: `about.feature_pinning_label/body`, `results.back_to_top`, `results.unpin_all`, `results.count_badge`, `settings.pinned_results_label/desc/empty`, `settings.unpin_all`, `settings.unpin_all_done`

---

### axe color-contrast fixes (round 2)

- `src/plugins/debug/debug.css`: `.focus-toast` background changed from `rgb(20 100 200 / 0.9)` (semi-transparent; blended against white page to ~4.4:1: white text at `opacity: 0.75` and red/green indicators at `opacity: 0.9` all failed) to solid `#0e2040` (dark navy); all three flagged elements now pass at their existing opacity values (~9:1 label, ~5.5:1 red indicator, ~8.8:1 green indicator)
- `src/index.css`: `@keyframes typewriter-fade` opacity keyframes removed; `opacity` values were causing axe to catch `.search-typewriter__phrase` at fractional opacity mid-animation (~2.5:1 effective contrast); animation now uses `transform` only; slide-in/out motion preserved

### axe color-contrast fixes (round 1) and other axe violations

- `src/tokens.css`: `--text-faint: #767676` (4.54:1 on white, borderline: axe rounds to fail) → `#696969` (5.5:1); dark-mode value `#909090` unchanged
- `src/plugins/router/Modal.jsx`: `aria-label={heading}` on panel element replaces `aria-labelledby` referencing a conditionally-rendered heading (unreliable when content is `{open && ...}`)
- `src/plugins/router/Modal.jsx`, `Drawer.jsx`, `BottomSheet.jsx`: `inert=""` → `inert={true}` / `inert={...||undefined}`; `inert=""` evaluates to `false` in React 19
- `src/App.jsx`: `<Announcer>` moved inside `<main>` landmark; `dev-toast-stack` gets `aria-hidden="true"`; skip link wrapped in `<nav aria-label="Skip navigation">`: all three changes resolve axe `region` violations

### Debug commands from search bar

- `src/App.jsx`: `debugPanelCmd` state; `runCommand` routes `debug ok/wrong/401/429/503/network` by setting `debugPanelCmd` (previously these only worked from the Revision Notes textarea); `handleQueryChange` skips live-search for any query starting with "debug": those require ENTER regardless of live-search setting
- `src/components/DetailPanel.jsx`: accepts `debugPanelCmd` / `onDebugPanelCmdHandled` props; `useEffect` reacts to the prop and fires the appropriate revision UI state directly, bypassing the `aiEnabled && canRevise` guard

### Skip link icon

- `src/App.jsx`: `<ChevronDown size={14} aria-hidden="true" />` added after the skip link label text
- `src/index.css`: `.skip-link` gets `display: flex; align-items: center; gap: var(--space-1)`

### Toggle off-state hover styles

- `src/index.css`: three `:hover:not(:has(.toggle__input:checked))` rules add track background/border, thumb outline, and ring border changes to unchecked toggles, matching the existing on-toggle hover behavior

---

### Badge click filter

- `DetailPanel.jsx`: all three badge `<span>` elements converted to `<button>` with `onClick={() => onBadgeClick?.({ type, value })}`; `--badge-bg`/`--badge-text` CSS vars set inline so the hover swap rule in `index.css` works without per-badge overrides; `aria-label` includes badge value + "Show all findings with this tag"
- `App.jsx`: `badgeFilter` state + `badgeResults` memo; `handleBadgeClick` clears selected, navigates to `/`, and focuses `resultsCountRef`; a second `<ResultList key="badge">` renders filtered results when `badgeFilter` is set
- `index.css`: `.priority-badge` gets `--badge-bg`/`--badge-text` vars to support the hover inversion shared by `.source-badge` and `.wcag-badge`; `.detail-badges button` hover + focus-visible rules

### Shareable search URLs

- `App.jsx`: `query` and `submittedQuery` now initialise from `new URLSearchParams(window.location.search).get('q')` on first render; `syncSearchUrl(q)` calls `history.replaceState` to write `?q=...` on submit/clear without adding history entries; `handleCopyLink` syncs the URL before copying `window.location.href`
- `ResultList.jsx`: `countRef` and `onCopyLink` props; `results-count-row` flex wrapper around h2 + copy button; copy button shows "Copy link" / "Copied!" with 2 s timeout; `Link` icon from lucide-react
- `index.css`: `.results-count-row`, `.results-copy-link-btn` styles
- `en.json`: `results.copy_link`, `results.copy_link_aria`, `results.copied_link`

### Toggle: power button reverted

- `SettingsPanel.jsx`: removed `<svg className="toggle__power">` from `.toggle__thumb`; thumb is now a plain circular span again
- `index.css`: removed `.toggle__power`, `.toggle:has(.toggle__input:checked) .toggle__power`, `.toggle:hover:has(.toggle__input:checked) .toggle__power`

### Skip link: hash router 404 fix

- `App.jsx`: `href="#finding-search"` → `href="#/"` so that even without JS the link stays on the root route instead of routing to a non-existent path; `onClick` handler with `e.preventDefault()` + programmatic focus is retained

### Easter egg locale heading fonts

- `index.css`: 9 new font-family rules covering all 17 Easter egg locales (excluding Na'vi which already had Papyrus): Comic Sans MS (pig, sim); Palatino Linotype (pir, val); Book Antiqua (qya, sjn); Impact (tlh, hod, nws); Courier New (blt, nds, csp); Georgia (dot); Segoe Print (tok); Old English Text MT (dov); Lucida Console (mnd); Arial Black (ali); applied to 12 heading class selectors per locale

### Reset All feedback

- `DetailPanel.jsx`: `resetAllDone` state; "Reset all" button briefly shows `<Check>` + "Reset" text for 2 s after firing, matching the copy-all success pattern
- `en.json`: `detail.reset_done_desktop`, `detail.reset_done_mobile`, `detail.reset_done_aria`

### Debug help panel polish

- `DebugHelp.jsx`: A11y Testing section condensed: note about `off` suffix + 2 rows (vs. 4 with paired on/off); Deployment descriptions shortened; `customCommands` sections now support optional `note` field rendered as `.debug-help-note`; `debug all` / `debug names` / `debug ai assist` now work without the `on` suffix (bare command = enable)
- `debug.css`: overlay: `pointer-events: none` removed, semi-transparent backdrop added so click-outside-to-close works
- `App.jsx`: `runCommand` accepts `debug all`, `debug names`, `debug ai assist` (no `on` required); custom commands updated to condensed format

### Settings/About desktop padding

- `index.css`: `.settings-panel, .about-panel` on `width >= 768px` get `padding-top: calc(var(--space-8) + var(--space-6))` to align headings with the compact header layout; `.page-header` gets `z-index: 1` to stay above panels

---

### Skip link (WCAG 2.4.1)

- `App.jsx`: `<a href="#finding-search" className="skip-link">` added as first child of `.app-background`; targets the existing search input ID
- `index.css`: `.skip-link`: `position: absolute`, `transform: translateY(calc(-100% - var(--space-4)))` (off-screen); `:focus-visible` slides it in via `transform: translateY(0)`
- `en.json`: `common.skip_to_main`: "Skip to main content"; `[TODO: translate]` placeholder added to all 49 non-English locale files

### Toggle: power button indicator

- `SettingsPanel.jsx`: replaced two-state conditional (`.toggle__check` / `.toggle__ring`) with a single always-visible SVG: `<line x1="5" y1="1.5" x2="5" y2="5">` + `<path d="M 3 2.4 A 3.2 3.2 0 1 0 7 2.4">` in a `.toggle__power` `<svg>`
- `index.css`: `.toggle__power`: `stroke: var(--border-control)` default; `stroke: var(--accent)` when checked; `stroke: var(--accent-bg)` on hover+checked; removed old `.toggle__check` / `.toggle__ring` rules

### Result card fold on select

- `ResultList.jsx`: `<ul className={`result-list${selected ? ' result-list--has-selection' : ''}`}>`: adds `result-list--has-selection` when a card is selected
- `index.css`: `.result-item__sc` and `.result-item__desc` get `max-height` + `overflow: hidden` + transition; fold rule via `.result-list--has-selection .result-row:not(:has(.result-item--selected))` collapses `max-height` to 0 and `opacity` to 0; specificity ordering fixed to satisfy stylelint `no-descending-specificity`

### Model selector in Settings

- `SettingsPanel.jsx`: `PROVIDER_MODELS` map (Anthropic: haiku/sonnet/opus, OpenAI: mini/4o, Google: flash/pro, Microsoft: none); per-provider `<select>` between provider selector and API key input; persisted to `localStorage` as `ai_model_{provider}`; Reset All restores defaults; `hasUnsaved` includes model changes
- `aiService.js`: Anthropic and OpenAI `buildBody` read `localStorage.getItem('ai_model_{provider}')` with per-provider defaults; Google `buildUrl` is dynamic (model embedded in URL)
- `en.json`: `settings.model_label`: "Model"; `[TODO: translate]` placeholder added to all 49 non-English locale files

### Agentic AI backend

- `src/services/searchCorpusTool.js` (new): `SEARCH_CORPUS_TOOL_SCHEMA` (Anthropic tool-use JSON schema); `searchCorpus(query, corpus, limit=3)` creates a Fuse instance from the provided corpus array and returns `{ id, title, scLabel, priority, desc, rem }` objects
- `src/services/agenticAiService.js` (new): `getAgenticRefinement({ finding, descText, remText, note, corpus })`: Anthropic-only multi-turn tool-use loop; `AGENTIC_SYSTEM_PROMPT` instructs model to always call `search_corpus` first; `MAX_TOOL_TURNS = 5` guard; dev logging per turn; `AiApiError` on limit exceeded
- DetailPanel UI wiring is pending (tracked in TODO)

### Fuse.js profiling

- `useFindingSearch.js`: `performance.now()` wraps `fuse.search()`; `console.warn` in dev when elapsed >20 ms, including query and corpus size

### Platform audit

- `corpus.json`: ATH-050 ("Content Announced Incorrectly by Screen Readers"): `platform` corrected from `"web"` to `"both"`; `desc` and `rem` updated to cover VoiceOver/TalkBack alongside NVDA/JAWS
- Current counts: web 32, both 42, native 2; 44/76 (57.9%) native-relevant, above 40% target; gaps documented in TODO

### Tiles responsive to vertical height

- `index.css`: `.result-item__desc`: `@media (height >= 700px)` raises `-webkit-line-clamp` to 3; `@media (height >= 900px)` raises it to 4

### docs/FEATURE-STATUS.md (new)

- Living tracker of all features with status (Complete / Partial / Backend Only / Stubbed / Not Started), percentage, and what's missing; grouped by phase

---

### Badges: desktop labels (≥ 768px)

- `ResultList.jsx`, `DetailPanel.jsx`: priority badge shows "Severity: {value}", source badge shows "Source: {value}", WCAG badge shows "WCAG {version}, Level {level}" on desktop; mobile shows short form with comma: "{version}, {level}"
- `en.json`: 4 new keys: `badge.severity_prefix`, `badge.source_prefix`, `badge.wcag_prefix`, `badge.level_prefix`; placeholder added to all 49 non-English locales
- `index.css`: `.badge-prefix { display: none }` base; revealed via `@media (width >= 768px)`

### WCAG filter radio group layout

- `.settings-fieldset`: `margin: var(--space-1) var(--space-2) var(--space-3)` (moved from `.settings-radio-legend`)
- `.settings-wcag-filter-row .settings-fieldset`: `flex: 0 0 50%; text-align: center`
- `.settings-wcag-filter-row .settings-radio-group`: `display: inline-flex; align-items: flex-start; text-align: left` (centers group within fieldset without breaking legend flow)
- `.settings-radio-legend`: `margin: 0` (margin now lives on fieldset)

### Settings group headings: a11y fix

- `SettingsPanel.jsx`: Language, Platform, WCAG Filter, Live Search, Voting group labels changed from `<p>` to `<h3>` (correct heading semantics for labelling grouped controls)

### NamesDebugger: controls only

- `NamesDebugger.jsx`: tooltip now fires only on interactive elements (button, input, select, textarea, img, a[href], elements with interactive ARIA roles); static text (p, h*, div, span) no longer trigger the overlay

### Announce string corrections

- `en.json`: `detail.copy_all_announce`: "Finding Details / Description and Possible Remediation Steps copied"; `detail.reset_all_fields_announce`: "Finding Details / Description and Possible Remediation Steps reset"; updated in all 49 locale files

---

## 2026-04-27

### BottomSheet: back button for related issue navigation

- `BottomSheet.jsx`: new `onBack` / `backLabel` props; renders `btn-icon btn-icon-accent sheet-back-btn` (ChevronLeft, RTL-aware) in the chrome left when `onBack` is defined; `sheet-back-btn` uses `margin-right: auto` to keep the drag handle centered and the close button right-aligned
- `App.jsx`: `findingHistory` state (array of previous findings); `handleSelectRelated` pushes current finding to history before navigating and increments `panelFocusTrigger` so the new sheet's heading receives focus; `handleBack` pops history, restores previous finding, and increments `panelFocusTrigger` for focus; `BottomSheet` receives `onBack={findingHistory.length > 0 ? handleBack : undefined}`
- `DetailPanel.jsx`: new `onSelectRelated` prop; `RelatedIssues` uses `onSelectRelated ?? onSelect` so the history-aware handler fires when available
- `en.json`: `detail.back_aria`: "Back to previous finding"; placeholder added to all 49 non-English locales

### Detail panel: Copy all / Reset all layout

- Buttons moved out of `detail-refine` to the end of `DetailPanel`, just above the `sheet-close-bottom` close button
- Order swapped: Reset all → Copy all (was Copy all → Reset all)
- `.detail-actions-end`: added `border-top` + `padding-top` + increased `margin-top` to form a visual footer section; `.detail-panel + .sheet-close-bottom` rule removes the redundant double border
- Mobile (<768px): both `.detail-action-btn` get `flex: 1; justify-content: center` for a 50/50 layout

---

### Multilingual edit flow: backend complete

- New `src/services/userOverridesService.js`: localStorage CRUD for personal locale overrides (`userOverrides` key); `applyOverride(finding, locale, overrides)` pure function applies overrides without reading localStorage
- New `src/services/contributionService.js`: contribution queue (`pendingContributions` key); `EDIT_TARGET` / `EDIT_SCOPE` / `CONTRIBUTION_STATUS` constants; `submitContribution`, `exportContributionsJson`, status management
- New `src/hooks/useUserOverrides.js`: reactive state wrapper; exposes `saveOverride`, `deleteOverride`, `deleteAllForFinding`, `clearAllOverrides`, `hasOverride`
- New `src/hooks/useContributionQueue.js`: reactive state wrapper; exposes `submitContribution`, `approveContribution`, `rejectContribution`, `exportJson`; re-exports flow constants
- `useFindingSearch.js`: added 8th param `userOverrides`; new `allFindings` useMemo applies `applyOverride` to every corpus finding before merging with user findings; sets `_hasOverride`, `_overrideLocale`, `_overrideEditedAt` metadata flags
- `App.jsx`: instantiates `useUserOverrides` + `useContributionQueue`; passes `userOverrides` to `useFindingSearch`; passes both hooks to `DetailPanel` as `userOverridesHook`/`contributionQueueHook` props ready for UI wiring
- New `scripts/apply-contributions.mjs`: maintainer approval script; reads exported contributions JSON; patches `corpus.json` (English) and `src/data/translations/{locale}.json` per scope (`lang_only`, `lang_and_en`, `all_langs`); idempotent; prints next-step git instructions
- 46 new `en.json` keys for all edit flow dialogs, scope picker, contribution panel, and override indicator; placeholders added to all 49 non-English locale files
- `SECURITY.md`: added `userOverrides`, `pendingContributions`, `wcagFilter` to localStorage inventory table

### Batch features (previous session: now committed)

- `DetailPanel`: Copy all + Reset all buttons; inline edit warning (`role="status"`)
- `SettingsPanel`: WCAG version filter checkboxes (2.0/2.1/2.2); persisted as `wcagFilter`
- `AboutPanel`: data sources section
- `SearchBar`: typewriter animation (8 phrases, `aria-hidden` removed, right-aligned in label row, truncated with `text-overflow`)
- `useFindingSearch`: `versionFiltered` useMemo stage

### Badge redesign

- `priority-badge`, `source-badge`, `wcag-badge`: reduced to `--fs-small` (12px), switched to `--mono` font
- `result-item__badges`: new flex container wraps all three badges; prevents spread-out placement when multiple badges appear; `result-item__header` now uses `align-items: center`

### Debug plugin improvements

- `DebugHelp`: clicking the overlay backdrop closes the panel
- `App.jsx`: `debug all on/off` now toggles all debug tools: `devAllEnabled` (focus + announce toasts) AND `namesEnabled` (names tooltip); updated description in the command reference

### GDPR draft

- `docs/GDPR-DRAFT.md` (gitignored): full Phase 1 privacy disclosure covering localStorage keys, AI API data flow, no-cookies, no-tracking, contribution export flow, offline use; ready for review before Phase 3 launch

### TODO.md

- Added `[phase3]` category tag; applied to all auth/cloud/public-launch items
- New "Multilingual Edit Flow" subsection with 7 UI todos
- `UI component library extraction` expanded with architecture explanation and prerequisite chain
- `CSS Modules` expanded with tradeoff analysis
- Version tagging entry updated with exact git commands
- Electron offline note: offline is implicit in the bundled app; AI Assist still needs internet
- Umami tagged `[manual]` (requires account signup)
- Phase 3 hosting entry rewritten as undecided-strategy note

---

### Session persistence

- `App.jsx`: `handleSelectFinding` writes selected finding ID to `sessionStorage` (`lastSelectedId`) and appends it to `localStorage` array `recentFindings` (max 10, deduped, newest-first)
- `App.jsx`: added `sessionRestoredRef` + restore-on-mount `useEffect`: after corpus loads and only when URL is bare (`#/`), reads `lastSelectedId` from sessionStorage and reopens the finding; fires once per page load, URL routing takes precedence

### Export utility

- New `src/utils/exportFinding.js`: `exportFinding(finding, format)` triggers a browser download; formats: `text` (default), `markdown`, `csv`; uses Blob URL + synthetic anchor pattern, no server required

### User findings data layer

- New `src/services/userFindingsService.js`: localStorage-backed CRUD (`loadUserFindings`, `saveUserFinding`, `deleteUserFinding`, `createUserFinding`, `copyUserFinding`); IDs use `USR-NNN` prefix; Phase 2 Supabase swap requires changes to this file only
- New `src/hooks/useUserFindings.js`: reactive wrapper exposing `userFindings` state + `addFinding`, `editFinding`, `deleteFinding`, `copyFinding` actions
- `src/hooks/useFindingSearch.js`: accepts `userFindings = []` sixth parameter; internal corpus state renamed `corpusFindings`; new `allFindings` useMemo merges corpus + user findings; callers receive merged set transparently
- `src/App.jsx`: instantiates `useUserFindings`, passes `userFindings` to `useFindingSearch`; CRUD actions available at App scope for future UI binding

### Privacy & security

- `docs/SECURITY.md`: added rows for `recentFindings` (localStorage), `userFindings` (localStorage), `lastSelectedId` (sessionStorage)
- `src/i18n/en.json` `settings.privacy_body_2`: updated to describe all new storage keys including sessionStorage distinction

---

### Data

- Renamed `src/data/mikeys-corpus.json` → `src/data/personal-corpus.json`; `.gitignore` updated to match

### AI refinement UX

- `DetailPanel.jsx`: added `aria-busy="true"` to the Save & Revise button while `refining` is true
- `DetailPanel.jsx`: added a spinning `<Loader2>` icon (Lucide, 12px, `aria-hidden="true"`) before "Revising…" text during the request
- `index.css`: added `@keyframes spinner-spin` and `.detail-revising-spinner` class; spin disabled under `prefers-reduced-motion: reduce`

### Focus management (WCAG 2.4.3)

- `App.jsx` / `SettingsPanel.jsx`: wired `returnFocusRef` to Privacy BottomSheet → privacy button, reset confirm Modal → Reset All button, no-changes Modal → Save button, view-all confirm Modal → View All button
- `App.jsx`: `handleResetAll` now focuses H1 after reset (`setTimeout 50ms`)
- `App.jsx`: `handleSelectFinding` no longer overwrites `findingTriggerRef` when a panel is already open: preserves original result-card trigger for when the panel closes
- `ResultList.jsx`: archiving a result focuses the next result card in the list (falls back to previous if no next); uses `itemRefs` map + `focusNextRef` ref resolved in a post-render effect

### Debug plugin (`src/plugins/debug/`)

- New plugin directory: `FocusDebugger.jsx` (moved from `src/components/`), `DeployBanner.jsx`, `AiDebugToast.jsx` + `useAiDebugToast`, `DebugHelp.jsx`, `debug.css`, `index.js`, `README.md`
- All dev-only CSS moved from `index.css` to `src/plugins/debug/debug.css`; `index.css` now has a single comment pointing there
- `DebugHelp.jsx`: full command reference panel rendered on `debug help`; accepts `customCommands` prop for project-specific sections; has X button to close
- `DeployBanner.jsx`: fixed bottom-left banner for deployment status; activated via `debug deploy [off|on|netlify|pages|vercel]`
- `AiDebugToast.jsx`: green toast for AI assist toggle; driven by `useAiDebugToast` hook
- `FocusDebugger.jsx`: accepts `enabled` prop so `debug all off` suppresses it
- `Announcer.jsx`: added `devEnabled` prop (ref-based closure update): toast visualization respects `debug all off`
- `DebugLauncher.jsx`: FAB (bottom-right, `>_` icon) + spotlight-style command input; `enabled` prop defaults to `false`; useful for projects without a built-in command field; `onCommand` prop wires in the project's command dispatcher; Escape and X button close it

### Command system

- `App.jsx`: unified `runCommand(q)` dispatcher replaces scattered inline checks; handles: `debug help`, `debug all on/off`, `debug deploy [target]`, `debug ai assist on/off`, Easter egg off commands, `party mode off`
- `DetailPanel.jsx`: renamed `debug ai assist` trigger → `debug ai assist on`
- Easter egg off commands: `pig latin off`, `pirate off`, `klingon off`, `valyrian off` → restore language to `'en'`; `party mode off` → restore theme to `'auto'`
- Easter egg on/off detection moved before `navigate('/')` in both `handleQueryChange` and `handleSearch` so viewAll state is preserved when a command fires; `activateEasterEgg` no longer clears search results or closes the panel

### Corpus rename / AI refinement loading state / localhost bypass

- Renamed `src/data/mikeys-corpus.json` → `src/data/personal-corpus.json`; `.gitignore` updated
- `DetailPanel.jsx`: `aria-busy="true"` on Save & Revise button while refining; spinning `<Loader2>` icon before "Revising…" text
- `SettingsPanel.jsx`: API key validation bypassed on `localhost` / `127.0.0.1`

### `NamesDebugger`: accessible name tooltip

- New `src/plugins/debug/NamesDebugger.jsx`: cursor-following tooltip showing the accessible name of any hovered element and the source that provides it (`aria-label`, `aria-labelledby`, `label[for]`, `alt`, `title`, `placeholder`, `text content`, etc.)
- Toggled via `debug names on` / `debug names off`; `enabled` defaults to `false` in App.jsx (off by default, manual activation required)
- CSS: `.names-tooltip`, `.names-tooltip__source`, `.names-tooltip__name` added to `debug.css`
- Exported from `src/plugins/debug/index.js`; documented in plugin `README.md` (exports table + component section + A11y Testing commands)
- `debug names on/off` added to `DebugHelp.jsx` A11y Testing section and main `README.md` Universal commands table

### ABOUT.md and docs

- `ABOUT.md`: "Fake Languages" sub-heading renamed to "Silly Languages" (Klingon and Valyrian are considered real languages by some)
- `docs/MAINT-LOG.md`: created: maintenance run history moved out of `MAINTENANCE.md` into its own file; `MAINTENANCE.md` now has a single pointer to it; checklist item updated; README docs table updated

### Debug command reclassification

- `debug skeleton` moved from universal to custom commands: it triggers app-level loading state, not a plugin feature; updated `DebugHelp.jsx` (removed from hardcoded A11y Testing section), `App.jsx` (added to `customCommands` array), plugin `README.md`, and main `README.md`

### Docs

- `ABOUT.md`: restructured: Easter Eggs section split into "Fake Languages" and "Party Mode" sub-sections; Ko-fi patch section removed; feature sections renamed to "Modals Stay in the Viewport" and "Bottom Sheet Swipe Gesture"; RTL moved under Languages section; Language Capitalization Philosophy moved under Languages section; "Priority Labels Are Fully Translated" and "Line Breaks Inside Translation Strings" sections removed; new "Accessibility Details" section with `useAriaHide`; "Architectural Choices" expanded with 404 section and plugins list with README links
- `docs/TODO.md`: reordered sections and items by value/effort (high value + low effort first); `[dormant]` tag added to Ko-fi items, Electron scaffold, Umami analytics, Phase 3 items, GitHub Sponsors, GDPR disclosure; corpus_src intake item added; methodology note added to header
- `docs/SECURITY.md`: created: data storage table, API keys policy, no-backend statement, debug tooling note, CSP description, third-party scripts, vulnerability reporting
- `docs/CONTRIBUTING.md`: simplified: duplicate schema removed, README cross-reference added, tightened to ~34 lines

---

## 2026-04-26

### Dependencies

- Upgraded React and React DOM to v19
- Upgraded Vite to v8; migrated `manualChunks` in `vite.config.js` from object form to function form (required by Vite 8 / rolldown)
- Upgraded ESLint to v10; upgraded `eslint-plugin-react-hooks` to v5; upgraded `eslint-plugin-jsx-a11y` to v6.10
- Removed `eslint-plugin-react`: incompatible with ESLint 10 (`context.getFilename()` removed); codebase is function-components-only so `react-hooks` + `jsx-a11y` are sufficient
- Upgraded `markdownlint-cli` to v0.48; fixed new MD060/table-column-style violation in `docs/DEPLOYING.md` (table separator pipes now spaced)

### Build and config

- `vite.config.js`: enabled `css: { transformer: 'lightningcss' }` for faster, smaller CSS output; added `chunkSizeWarningLimit: 1200` (50+ locale files make main chunk intentionally large); `manualChunks` now a function returning `'react'` or `'fuse'` chunk names
- `eslint.config.js`: removed `eslint-plugin-react` import and `settings: { react: { version: 'detect' } }`; kept `react-hooks` recommended rules and `jsx-a11y` recommended rules

### Security and CSP

- `netlify.toml`: added comment documenting how to add Supabase URL to `connect-src` for Phase 2 auth; added `https://avatars.githubusercontent.com` and `https://lh3.googleusercontent.com` to `img-src` for OAuth user avatar support

### Dead-weight removal

- `src/index.css`: removed three dead CSS classes with no JSX references: `.about-heading` (superseded by `.about-subheading`), `.about-privacy-btn`, `.about-privacy-btn:hover`, and `.about-privacy-settings-link` (removed during About panel redesign)
- `src/App.jsx`: added `// eslint-disable-line react-hooks/immutability` on four intentional `useRef` mutations that the upgraded linter incorrectly flagged as violations

### Docs

- `README.md`: fully rewritten: project structure updated to reflect current files (`scripts/`, `electron/`, `src/data/translations/`, `favicon.svg`, `mikeys-corpus.json`); hook names corrected (`useFindingSearch`, `useFindingRatings`); en.json key count updated (~235); Electron section added; deploy table updated; finding schema section updated; Dev/Debug section added
- `docs/CONTRIBUTING.md`: rewritten: all "defect" → "finding"; schema example ID updated to ATH-077; branch name example updated; PR instructions updated

### Sweeps performed: no further action required

- **Accessibility**: axe-core console clean in development; keyboard flow verified; focus management, ARIA roles, focus trapping, and live region wiring all confirmed intact; `<html lang>` updates correctly on language switch
- **Security**: no `innerHTML`, no `eval`, no dynamic `require`; all `target="_blank"` links carry `rel="noreferrer"`; API keys `localStorage`-only and never logged; CSP covers all external AI provider connections; no new permissions requested; dependency audit clean
- **SEO**: commented-out block in `index.html` intentionally preserved for Phase 3 launch; `robots.txt` correctly disallows all crawlers for dev deployment
- **Performance**: LightningCSS enabled; `manualChunks` vendor split confirmed (React and Fuse.js in separate cacheable chunks); no unnecessary re-renders identified; cold load on Slow 3G within budget
- **Privacy**: `localStorage` inventory matches SettingsPanel disclosure; no third-party scripts active; Umami placeholder remains commented out; Ko-fi widget remains disabled pending selector verification
- **Auth wiring**: Supabase and OAuth stubs confirmed present and inert: `authService.js`, `supabaseClient.js`, `dataService.js` all have activation comments; no accidental activation

---

### Corpus

- Renamed ATH-002: "Focus Not Moved When New Content Opens" → "Focus Not Managed"
- Renamed ATH-006: "Flashing Content May Cause Seizures" → "Flashing Content"
- Added ATH-076 (public corpus) and ATH-085 (private corpus): "Visible Heading Not Marked as Heading": SC 1.3.1, High priority, web platform
- Updated translated title for ATH-002 in all 8 corpus translation overlay files (de, es, fr, ja, ko, pt-BR, tl, zh)

### About panel

- "What Is This?" section rewritten with two-paragraph text; second paragraph starts with "Consistency is key…"
- WCAG 2.2 text hyperlinked to <https://www.w3.org/TR/WCAG22/> via JSX split-on-placeholder pattern (`{wcag}` in i18n string)
- Example items now navigate to their corpus finding pages on click (ATH-001, ATH-010, ATH-013, ATH-014, ATH-019)
- On desktop, the header settings gear icon switches to an X close button when the About panel is open (mirrors Settings behavior)

### i18n

- `about.what_body_2` added to `en.json`; translate script updated to detect completely missing keys (`isMissing` condition) and write new keys to locale files
- Translate script re-run across all 40+ non-English locales; all files now have full key coverage
- Fixed step 3 ("Pick") and step 5 ("Copy") data in all 40+ non-English locales: previously showed "Customize" and "Vote" due to stale snapshot values
- Added 12 missing keys to all English variant files (en-AU, en-GB, en-IN, en-ZA): `detail.revise_error_*`, `settings.reset_all_announce`, `settings.preserved_announce`, `settings.theme_*_announce`, `error.announce`
- Added English placeholders for 39 remaining missing keys across de, pig, tlh, zh, pir, rhg, pjt; full key parity restored

### UI polish

- Removed extra margin-left from `.header-github-link .external-link-icon` (gap on the flex container was sufficient)
- `(optional)` label next to Location Prefix field now `font-weight: 400` (was inheriting bold from parent label)
- RTL: `.settings-footer-actions` `margin-left: auto` changed to `margin-inline-start: auto` so Save/Reset buttons are flush with the left edge in RTL locales
- BottomSheet desktop close button: auto-width, right-aligned (left-aligned in RTL), with a divider above; mobile retains full-width behavior
- Related issues list on mobile now has `margin-bottom: var(--space-4)` matching spacing elsewhere
- Archiving a result now immediately moves it to the bottom of the sorted list without requiring a re-search (`ratings` added to `sortedFindings` dependency array and sort logic)
- View-all state preserved when navigating to a finding detail, Settings, or About and returning (`returnViewAllRef` pattern)

### Code quality

- Suppressed `react-hooks/immutability` false positives on intentional `useRef` mutations in `App.jsx` with inline `// eslint-disable-line` comments

---

### Router plugin

- Added `matchRoute(pattern, route)` pure function and `useRouteMatch(pattern)` hook; both exported from `src/plugins/router/index.js`
- `/about` promoted from component state to a hash route (`route === '/about'`)
- `/defect/:id` route added: selecting a defect navigates there; closing navigates back; settings/about close restores the defect URL if one was open behind them
- Auto-select on cold load: if the page is opened at `/#/defect/ATH-023`, the matching defect is found and selected once data finishes loading
- Document title now updates to `A11yHelper | <defect title>` when the detail panel is the foreground view

### UI fixes

- `.detail-rewrite-btn` renamed to `.detail-revise-btn`; vertical padding increased from `4px` to `0.625em` (text no longer clips)
- Added `:hover` state (`color: var(--text); text-decoration: underline`) to: `.detail-sc-link`, `.detail-related__btn` (also restored underline on hover), `.detail-settings-link`, `.settings-privacy-btn`, `.about-privacy-btn`
- Search field: decorative `Pencil` icon (faint, right-aligned) that hides when text is entered
- SettingsPanel: API key error stays visible on failed save (removed effect that cleared it immediately when AI was toggled off)

### Debug tooling

- `Announcer`: on `localhost`, every `announce()` call renders a large white-on-black pill toast with priority badge; assertive priority uses red background
- README: Dev / Debug section documenting all search field triggers, AI debug trigger, and the visual ARIA monitor

---

### corpus.json

- Added 16 new defect entries filling gap IDs (ATH-004, 006, 015, 020, 024, 036, 042, 044, 049) and extending the sequence (ATH-064 through ATH-070)
- New WCAG SCs now covered: 2.2.1 (Timing Adjustable), 2.3.1 (Three Flashes), 1.4.10 (Reflow), 2.5.8 (Target Size: WCAG 2.2), 1.3.4 (Orientation), 1.3.5 (Identify Input Purpose), 2.5.4 (Motion Actuation), 1.3.2 (Meaningful Sequence), 3.3.4 (Error Prevention), 2.4.11 (Focus Appearance: WCAG 2.2), 1.3.3 (Sensory Characteristics), 3.2.3 (Consistent Navigation)
- New topic coverage: iFrame titles, aria-expanded state, document accessibility (PDF/Word/Excel), emoji and special characters in screen reader output
- All new entries carry English `desc`, `rem`, `keywords`, `priority`, `platform`, and `related` fields matching existing schema
- **Flag for editorial review**: wording and remediation advice not yet through the same editorial pass as original ATH-001 through ATH-063 entries

---

## 2026-04-25

### About panel redesign

- `AboutPanel.jsx`: converted from BottomSheet to Drawer (same pattern as Settings); back button header matches Settings; `onClose` prop wired
- Desktop: `AboutPanel` renders in `<main>` (same slot as SettingsPanel) when `isDesktop && aboutOpen`
- Mobile: dedicated `<Drawer>` for About; replaced BottomSheet
- Info button in header now toggles (shows X when aboutOpen, Info when closed); `aboutOpen` and `onCloseAbout` props added to `Header`
- Privacy & Storage button added inside About panel (reuses settings privacy sheet)
- Section dividers added via CSS (`border-top` on `+ .about-section` sibling); each section has `padding-bottom: var(--space-6)`; last section has `5rem` bottom for future Ko-fi button
- `.about-header` + `.about-title` CSS added (mirrors `.settings-header`/`.settings-title`)
- Removed double padding: `.about-panel` no longer has `padding`; parent container (Drawer or `app-container`) provides it
- `backgroundInert` updated: desktop about is inline content (no inert needed); mobile about uses Drawer path
- Defect BottomSheet suppressed while `aboutOpen` (`open={... && !aboutOpen}`)
- `.about-privacy-btn` CSS added

### Settings footer

- `settings-footer-actions` wrapper div groups Reset All + Save buttons as a flex row: always adjacent
- Mobile layout: Privacy link above the button pair; desktop: Privacy left, button pair right
- `.settings-reset-btn` now shares padding/border-radius declaration with `.settings-save-btn`; no more unstyled appearance
- Save button no longer `width: 100%` on mobile; both buttons size to content within their flex row

### MAINTENANCE.md

- `localStorage` inventory item updated: removed stale "exactly six keys" count; explains variable `apikey_*` count
- Privacy disclosure item updated: notes to propagate `privacy_body_2` changes to all locale files
- Locale file parity item: runnable node one-liner added for CI/pre-release check
- Docs section: About panel content review + Phase 2 stubs review items added

---

### About panel (bottom sheet)

- `AboutPanel.jsx`: new bottom sheet component; covers what the app is, 4-step how-to, notable features, and a "Coming Soon" section for auth and custom defects
- Info button (`<Info size={20}>`) added to header, left of the gear; wrapped both header action buttons in `.page-header__actions` flex container
- `aboutOpen` state in `AppContent`; `backgroundInert` updated to include `aboutOpen`
- `header.open_about`, `about.*` keys added to `en.json` (29 new keys)

### Settings: Reset All

- "Reset All" button added to settings footer row (left of Save on desktop, stacked on mobile)
- Confirmation modal: `settings.confirm_reset_all_*` keys; uses existing `Modal` component
- `handleResetAll` in `App.jsx`: calls `localStorage.clear()`, resets all React state to defaults, navigates to `/`
- `onReset` prop added to `SettingsPanel`; calls `onReset?.()` after confirmation

### Button system: `.btn-secondary`

- `.btn-secondary` added to `index.css` as a named alias for the secondary/outlined button treatment (same visual style as `.btn-ghost`, kept for back-compat); use `.btn-secondary` in all new code

### Phase 2 stubs: Supabase, auth

- `supabaseClient.js`: Supabase client stub with full setup instructions, DB schema (SQL), and `.env.local` configuration comments
- `authService.js`: Google + GitHub OAuth stubs via Supabase Auth; includes commented-out Phase 2 implementation; all functions safe to call today (return null / empty array / throw informative errors)
- `dataService.js`: `getUserDefects()`, `saveUserDefect()`, `deleteUserDefect()`, `syncSettings()`, `getRemoteSettings()` stubs added; merged result cache (`mergedCache`) prevents re-mapping corpus on repeated locale switches; `en-*` locales short-circuited to skip overlay lookup; `OVERLAY_FALLBACKS` map adds `pt` → `pt-BR` fallback

### i18n parity

- 6 missing keys added to all 49 non-English locale files: `common.close`, `settings.privacy_subhead_storage`, `settings.privacy_subhead_translations`, `notfound.heading`, `notfound.body`, `notfound.button`
- `pir.json` only needed the 3 shared keys (already had `notfound.*`)
- `settings.privacy_body_2` updated: "six things" replaced with accurate language about variable number of API keys

### ESLint

- `argsIgnorePattern: '^_'` added to `no-unused-vars` rule in `eslint.config.js`; allows `_callback`, `_userId` etc. in stub functions without lint errors

---

### Internationalization: 50+ locales

- Expanded from 10 to 50+ locale files covering English variants, Romance/Germanic, CJK, Southeast Asian, Indigenous languages (Nahuatl, Navajo, Ojibwe, Plains Cree, Māori, Hawaiian, Guaraní, Quechua, Pitjantjatjara), constructed languages (Esperanto, Pig Latin, Klingon, Valyrian), Easter egg locales (Pirate, Pig Latin, Klingon, Valyrian), and minority languages (Rohingya, Tibetan, Uyghur, Tamazight, Crimean Tatar, Basque, Valencian)
- Title-case conventions applied by language: NYT rules for English variants and Filipino; sentence case for Romance/Germanic; no changes for caseless scripts (CJK, Arabic, Uyghur, Tamil, Devanagari)
- RTL support: Palestinian Arabic (`ar-PS`) and Uyghur (`ug`) set `document.documentElement.dir = "rtl"`; entire layout mirrors including Drawer direction, back chevron, chip corner radii, and toggle thumb; driven by CSS `[dir="rtl"]` overrides
- `useDir` hook added to router plugin: reactive MutationObserver on `<html dir>`; used by SettingsPanel for back chevron direction

### Priority/severity labels translated

- `PRIORITY_VARS` in `ResultList.jsx` and `DetailPanel.jsx` extended with `key` field pointing to `priority.*` i18n keys
- Badge displays `t(p.key)` instead of hardcoded `defect.priority` string
- `priority.critical/high/medium/low/best_practice` keys added to `en.json` and all 48 other locale files
- Pirate translations: "Abandon Ship!" / "Batten Down!" / "Listing, Cap'n" / "Calm Waters" / "Old Salt's Wisdom"

### Pirate chip line breaks

- `\n` in translation string values renders as `<br>` elements in `RadioChip`; pirate chip labels "Sunny\nSeas", "Dead o'\nNight", "Treasure\nMode?" intentionally break to fit narrow screens
- `white-space: nowrap` removed from `.radio-chip`; `min-height: 3rem` added to keep all chips the same height

### 404 page

- `NotFoundPage` component renders for any hash route other than `/` and `/settings`
- "Back to Home" button navigates to `#/`; i18n keys added (`notfound.heading/body/button`) in all locales

### "Native App" rename

- All instances of platform label "Native" renamed to "Native App" across all 50+ locale files

### Accessibility fixes

- `useAriaHide` fixed: now moves focus into the panel before setting `aria-hidden` on `#root`, eliminating WAI-ARIA violation warning when trigger button is still focused on overlay open
- `.btn-icon:focus-visible` gets `border-radius: 50%`: keyboard focus ring is now a perfect circle on close buttons and gear icon

### UI/design

- Fork on GitHub link: `text-decoration: underline` added; underline offset normalized to match LinkedIn link
- Gear icon (settings button): hover background highlight via `var(--bg-subtle)`
- App title links to `#/` homepage
- Ko-fi widget disabled (third-party script causing console reload loop); code moved to `src/components/KofiWidget.jsx` for potential re-enable
- Settings back button: tighter to edge and less gap on mobile via `@media (width < 768px)` override
- Chips, save button, and bottom sheet close button all share `padding: var(--space-3) var(--space-4)` for consistent 48px height
- `margin-bottom: var(--space-4)` added under the Refine row before the bottom close button
- `settings.privacy_subhead_storage` and `settings.privacy_subhead_translations` subheadings added in English

### Lint sweep

- Zero errors, zero warnings across ESLint and Stylelint
- Removed unused `isDesktop` variable from SettingsPanel
- Removed stale `eslint-disable` comments for `react/no-unknown-property` (inert is now recognized)
- Extracted `KofiWidget` and `patchKofiA11y` from App.jsx into `src/components/KofiWidget.jsx`
- Fixed empty catch block in `partySongs.js`

---

### I18n system (`src/i18n/index.jsx`, `src/i18n/en.json`, …)

- Zero-dependency custom i18n: React Context + flat-key JSON + `{placeholder}` interpolation; no react-i18next or i18next needed
- `I18nProvider` wraps `AppContent` in `App.jsx`; `useT()` hook returns the memoized `t(key, vars)` function in any child component
- Static imports of 10 locale files at module level into a `MESSAGES` map; locale lookup with double fallback: unknown locale → `MESSAGES.en`, missing key → English key → key literal
- `AppShell` (state + `I18nProvider` wrapper) split from `AppContent` (all logic + render, calls `useT()`); a component cannot consume its own context: this split is the canonical fix

### Locale files (`src/i18n/`)

- 10 complete locale files: `en.json` (source of truth), `es.json`, `fr.json`, `de.json`, `nl.json`, `ja.json`, `tl.json` (Filipino/Tagalog, ISO 639-1), `zh.json`, `ko.json`, `sv.json`
- ~93 keys per file covering all UI strings across SearchBar, ResultList, DetailPanel, SettingsPanel, App (Header, Footer, PartyBanner), and all `announce()` calls
- All translations generated with AI; `settings.privacy_body_translations` key discloses this in native language in every locale
- Filipino uses ISO code `tl`; language label reads "Filipino (Tagalog)" per Philippine Government conventions

### All UI components wired (`src/App.jsx`, `src/components/`)

- `SearchBar.jsx`: all labels, aria-labels, placeholder, hint text, button text via `t()`; platform label reuses `settings.platform_web/native` keys to stay DRY
- `ResultList.jsx`: `aria-label`, no-results heading and body, no-results `announce()` all via `t()` with `{query}` interpolation
- `DetailPanel.jsx`: all labels, button aria-labels, modal headings/bodies, refine hints via `t()`; copy and reset `announce()` calls use `t()` with `{label}` interpolation; `label` strings pre-computed in `DetailPanel` and passed down to `Field`
- `SettingsPanel.jsx`: all section headings, radio chip labels, toggle labels, provider labels, API key placeholders via `t()`; `PROVIDERS` array uses `placeholderKey` (a translation key) instead of a literal string; theme chips use `labelKey` pattern; `usePageTitle(t('settings.heading'))`
- `App.jsx`: `Header`, `Footer`, `PartyBanner` each call `useT()` directly; footer credit splits on `'Mikey Ilagan'` via `.split()` for cross-locale `<strong>` markup; party `announce()` strings via `t()`; BottomSheet label and Drawer label via `t()`

### Language selector expanded (`src/components/SettingsPanel.jsx`)

- `LANGUAGES` array now has 10 entries: English, Español, Français, Deutsch, Nederlands, Svenska, 中文（简体）, 日本語, 한국어, Filipino (Tagalog)
- Swedish added for the t12t (tillgänglighet) Scandinavian accessibility community; Chinese and Korean for East Asian accessibility communities

### Privacy button layout (`src/components/SettingsPanel.jsx`, `src/index.css`)

- Privacy button moved from between AI toggle and provider selector into a new `.settings-footer-row` at the bottom of settings
- Desktop (≥ 768px): flexbox row, `justify-content: space-between`: privacy button left-aligned, Save button right-aligned
- Mobile: flex column: Save button on top (`order: -1`), privacy button below
- CSS specificity fix: `.settings-save-btn` base rule placed before `.settings-footer-row .settings-save-btn` to satisfy `no-descending-specificity` linter rule

### Privacy modal extended

- Privacy modal now has three paragraphs: existing API key storage disclosure, existing localStorage key inventory, new `settings.privacy_body_translations` AI translation disclosure
- Disclosure states: translations were generated with AI and may contain errors; no custom or user-entered data is ever sent out for translation

### `localStorage` count updated

- Inventory is now six keys: `theme`, `language`, `liveSearch`, `platform`, `ai_provider`, `apikey_<provider>`

---

### Party mode sound effects (`src/utils/partySounds.js`, `src/App.jsx`)

- New `partySounds.js` utility synthesizes six sounds via the Web Audio API (zero external dependencies): goose honk, cat hiss, cat meow, fart noise, descending ahooga car horn, wolf whistle; snare drum added as a seventh
- Fart noise synthesized from resonant lowpass-filtered noise + low sawtooth oscillator with pitch sweep; slightly randomized duration for variety; appears 3 slots in the random pool vs 2 for others (1.5× more likely)
- Snare drum synthesized from body (sine with pitch drop) + buzz (highpass-filtered noise)
- All sounds route through a shared master gain node at 0.5
- `playPartySound()` triggers on clicks of `button`, `[role="button"]`, input submit/button, checkbox, radio, and select elements
- `playSqueak()` (squeaky shoe: sine gliding ~650–1500 Hz, random base per press) fires every 3rd keypress in `#defect-search` in party mode; modifier keys (Shift, Ctrl, Alt, Meta, Tab, CapsLock, Escape) excluded

### Party mode sparkle effect (`src/components/PartySparkles.jsx`, `src/index.css`)

- `PartySparkles.jsx`: fixed canvas, z-index 199, `pointer-events: none`; listens for `click` on document; each click spawns 14 particles (circles and 5-point stars) that burst outward, fall with gravity, and fade
- Entirely skipped when `prefers-reduced-motion: reduce` is on

### Party mode floating music player (`src/utils/partySongs.js`, `src/components/PartyMusicPlayer.jsx`)

- `partySongs.js`: synthesizes a looping approximation of Blur's "Song 2": distorted sawtooth power chords (root + 5th + octave via WaveShaper), triangle-wave bass, kick/snare/hihat drums; 4-bar loop at 132 BPM; scheduled with a `setTimeout` look-ahead approach; master gain 0.22; stop function fades out and disconnects
- `PartyMusicPlayer.jsx`: fixed circular play/pause button at a random `top`/`left` position; moves to a new random position on each route change (via `useRouter`); `aria-label` and `aria-pressed` update with play state; stops when party mode deactivates; z-index 195

### Party mode visual polish (`src/App.jsx`, `src/index.css`, `src/tokens.css`)

- **Radial gradient**: `[data-theme="party"] body` now uses `radial-gradient(ellipse at var(--party-grad-x) var(--party-grad-y), ...)` with `background-attachment: fixed; background-size: cover; background-repeat: no-repeat`: fixes the tiling artifact from the previous linear-gradient; `--party-grad-x`/`--party-grad-y` (random 10–90%) generated in `generatePartyPalette()` and cleaned up via `PARTY_KEYS`
- **Party banner animation**: bounces for 5 s then stops (`.party-banner--still { animation: none }`); `mouseenter` restarts the 5 s countdown via `setTimeout`; `pointer-events: none` removed so hover fires
- **Radio chip stars**: `[data-theme="party"] .radio-chip__indicator::before` renders `☆` (inactive) or `★` (active) replacing the circle dot
- **Magic wand cursor**: SVG resized 32×32 → 64×64; all path coordinates doubled; hotspot adjusted `10 2` → `20 4`

---

### Party Mode theme (`src/components/SettingsPanel.jsx`, `src/App.jsx`, `src/tokens.css`, `src/index.css`, `src/components/Confetti.jsx`)

- "Party Mode?" added as a fourth chip option in the Theme fieldset (Light / Auto / Dark / Party Mode?)
- On activation, `generatePartyPalette()` produces a random complementary color palette (random base hue, complementary and triadic derived hues) and applies it as inline style overrides on `document.documentElement`; priority badge colors are kept fixed to preserve accessibility
- `PARTY_KEYS` array in `App.jsx` ensures all inline overrides are removed when switching to any other theme
- `[data-theme="party"]` in `tokens.css` overrides `--font` to Comic Sans and sets a magic wand SVG cursor (star at the tip, hotspot at star point)
- Confetti canvas (`Confetti.jsx`) renders 110 particles for 5 seconds then fades over 800 ms; uses `requestAnimationFrame`; entirely skipped when `prefers-reduced-motion: reduce` is set
- Screen reader receives an assertive `announce()` on activation: describes confetti, or notes that it was skipped if reduced motion is on
- Reduced-motion disclosure note shown at the very bottom of SettingsPanel whenever `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true

### Copy guard (`src/components/DetailPanel.jsx`)

- Copying an empty field now shows a "Nothing to copy" modal with an OK button instead of silently calling `navigator.clipboard.writeText('')`

### Search bar polish (`src/components/SearchBar.jsx`, `src/index.css`)

- "Describe the defect or observation" label color changed from `--text-muted` to `--text` to match other form labels
- Search hint: "AI assist is on" corrected to "AI assist is active"
- Clear-search button icon changed from `<X>` (Lucide) to the `↺` reset symbol to match Field reset buttons; `lucide-react` `X` import removed from `SearchBar.jsx`

### Rewrite button height fix (`src/index.css`)

- `.detail-refine-row` changed to `align-items: stretch`; `.detail-rewrite-btn` uses `align-self: stretch` and `padding: 0 12px` so the button grows to the same height as the adjacent refine input

### Footer update (`src/App.jsx`)

- Bluesky link replaced with LinkedIn (`https://www.linkedin.com/in/mikeyil`) and LinkedIn SVG icon

### TODO update

- `docs/TODO.md`: "About / data sources page" item added to UX section; describes what to include when an About page is created (corpus compilation method, sources, credit)

---

### Settings ↔ defect panel navigation (`src/App.jsx`, `src/plugins/router/BottomSheet.jsx`)

- Opening Settings while a defect panel is selected no longer clears the selection; the panel state (including edits) is preserved via a new `keepMounted` prop on `BottomSheet`
- Closing Settings restores the defect panel and returns keyboard focus to the panel heading via a `focusTrigger` prop in `DetailPanel`
- `backgroundInert` formula fixed: `(!isDesktop && settingsOpen) || (!!selected && !settingsOpen)`: prevents the settings drawer from ever being inside an inert subtree
- `returnToPanelRef` and `panelFocusTrigger` state added to `AppShell`
- `onOpenSettings` no longer calls `setSelected(null)`

### Reset confirmation modal (`src/components/DetailPanel.jsx`, `src/plugins/router/Modal.jsx`)

- Modal now accepts an `actions` prop: `[{ label, onClick, className }]`; defaults to a single OK button when omitted
- `editDistance` (Levenshtein) and `isSignificantlyChanged` helpers added to `DetailPanel`
- When >70% of a textarea's original text has been changed, clicking Reset opens a "Are you sure?" confirmation modal instead of resetting immediately
- Stacked "Yes, reset" (primary) / "No, nevermind" (ghost) button layout in the modal footer
- DRY: `handleReset` extracts the shared reset + announce + flag pattern used for both desc and rem fields

### BottomSheet chrome layout fix (`src/plugins/router/BottomSheet.jsx`, `src/index.css`)

- Close button moved from `position: absolute` (which caused it to be half-clipped above the panel) to normal flex flow at the right end of the chrome row
- Drag handle re-centered via `position: absolute` on the handle instead of on the button
- Mobile-only full-width "Close" button added at the bottom of the sheet content area (hidden on desktop via `@media (width >= 768px)`)

### SC list now bulleted (`src/components/DetailPanel.jsx`, `src/index.css`)

- "Fails:" and "Related:" lines changed from `<p>` inside a `<div>` to `<li>` inside a `<ul>` with `list-style: disc` and indent: more visually prominent
- CSS: `.detail-sc` / `.detail-sc-line` replaced by `.detail-sc-list` / `.detail-sc-item`

### Rewrite button sizing fix (`src/index.css`)

- `.detail-rewrite-btn` padding overrides `field-btn` to `6px 10px`: matches the adjacent input height
- `.detail-refine-row` changed from `align-items: stretch` to `align-items: flex-start`

### Search button height fix (`src/index.css`)

- `.search-submit-btn` changed from `align-self: flex-end` to `align-self: stretch` so it fills the row height and stays flush with the input

### "Typeahead" renamed to "Live search" everywhere

- Code: `typeahead` state / prop → `liveSearch`; localStorage key: `typeahead` → `liveSearch`
- User-facing: toggle label "Typeahead" → "Live search"; SearchBar hint updated
- Privacy modal text updated to reflect the new key name (now six stored keys)

### Language selector (`src/App.jsx`, `src/components/SettingsPanel.jsx`)

- New `language` state in `AppShell`; defaults to `navigator.language` (browser/OS language), falls back to `'en'`
- Persisted to `localStorage` as `'language'`; applied to `document.documentElement.lang` on change
- Language selector added to SettingsPanel under Appearance (English, Español, Français, Deutsch, Nederlands, 日本語, Filipino)
- Note: language selector and lang attribute were wired in this session; full UI translation completed in a subsequent commit (see i18n entry above)

### Settings section reorder and polish (`src/components/SettingsPanel.jsx`, `src/index.css`)

- Sections reordered: Appearance (Theme + Language) → Search (Platform + Live search) → AI Assist
- Save button row now has a `border-top` divider above it
- Drawer bottom padding increased to `5rem` on mobile so the Ko-fi floating button does not overlap settings content

### SearchBar hint text improved (`src/components/SearchBar.jsx`)

- Hint now shows current platform focus ("web-based" / "native mobile") and AI provider name if AI is enabled
- "Change in Settings" button separated into plain text + inline "Settings" button

### Modal improvements (`src/index.css`)

- `max-height` changed from `90dvh` to `calc(100dvh - 2 * var(--space-6))`: ensures the top of the modal is always at least `--space-6` from the viewport top regardless of content height
- `.modal-heading`: `line-height: 1em` added
- `.modal-footer`: `display: flex; flex-direction: column; gap: var(--space-2)` for stacked action buttons

### Ghost button style added (`src/index.css`)

- `.btn-ghost`: neutral border, transparent background, muted text; used for secondary/cancel modal actions

### Footer text (`src/App.jsx`)

- "Made by" → "A project by"

### `.gitignore` updated

- Added private corpus file.

### Public corpus expanded (`src/data/corpus.json`)

- 13 new entries added (ATH-051 – ATH-063) sourced from axe-core rules, WCAG 2.2 Understanding docs, and WebAIM guidance
- Topics: figure without description, conflicting form labels, unlabeled select/dropdown, layout breaks at 200% text size, vague link text, audio/video without transcript, form group without legend, list content without list markup, live region not announcing, multi-point gesture without alternative, vague error messages, missing closed captions (1.2.2), missing audio description (1.2.5)
- Total: 54 entries

### Ko-fi accessibility letter (`docs/LETTER_TO_KOFI.md`)

- Created with full documentation of all 6 accessibility issues patched in the widget and recommended fixes for each

---

### Public corpus (`src/data/corpus.json`)

- 41-entry simplified corpus rewritten at middle school / ESL reading level; replaces the one-item placeholder
- Merged 9 near-duplicate entries from the personal corpus into single consolidated entries: ATH-003+004, ATH-005+006, ATH-013+015, ATH-019+020+049, ATH-023+024+042, ATH-035+036, ATH-044 (absorbed into ATH-010)
- All `desc` and `rem` text rewritten: shorter sentences, plain vocabulary, "you" voice, jargon explained inline
- `src/services/dataService.js`: import switched to `corpus.json`; private corpus preserved separately

### DetailPanel refactor (`src/components/DetailPanel.jsx`)

- **Priority badge** added to the title row (`detail-title-row`); uses the same `priority-badge` token colors as the result list
- **SC links**: `ScBadge` pill component replaced with inline `ScLink` text links; format now reads `Fails: 1.1.1 Non-text Content (Level A)` and `Related: 4.1.2 Name, Role, Value (Level A)` (comma-separated when multiple)
- **Refine hint**: `detail-label-hint` span replaced with `detail-refine-hint` paragraph below the label; non-AI text now fully describes both manual and AI-assisted workflows; AI text links to Settings via `detail-settings-link` button (inline text-link appearance)
- **Rewrite button**: `detail-rewrite-btn` class removed; button now uses `btn-accent field-btn` to match Reset/Copy buttons; `↗` removed; Lucide `<Sparkles size={12}>` added before "Rewrite" text; `aria-label` added for screen readers
- `PRIORITY_VARS` constant duplicated from `ResultList.jsx` into `DetailPanel.jsx` (avoids coupling or a shared file for one constant)
- `useRouter` import added to support the Settings navigation link inside the AI hint

### CSS changes (`src/index.css`)

- `.sc-badge` and `.sc-badge--primary` removed (no longer used)
- `.badge-group` removed (replaced by `.detail-title-row` + `.detail-sc`)
- `.detail-rewrite-btn` removed (replaced by `field-btn`)
- `.detail-label-hint` removed (replaced by `.detail-refine-hint`)
- **New classes**: `.detail-title-row` (flex row for title + priority), `.detail-sc` / `.detail-sc-line` / `.detail-sc-label` / `.detail-sc-link` (text-link SC display), `.detail-refine-hint` (secondary help text), `.detail-settings-link` (inline button styled as underlined link)

### BottomSheet close button and focus ring fix (`src/index.css`)

- `.sheet-chrome` padding-top increased from `var(--space-3)` (12px) to `var(--space-4)` (16px): matches `--radius-lg`, pushing the close button below the border-radius clip zone
- `.sheet-close-btn` `right` increased from `var(--space-5)` (20px) to `var(--space-6)` (24px): more breathing room from the panel edge

### Ko-fi a11y patches expanded (`src/App.jsx`)

- **Tooltip icons**: `<i rel="tooltip">` elements now receive `tabindex="0"`, `role="button"`, `aria-label="More information"`, and keyboard handlers; `focus` / `blur` dispatch `mouseenter` / `mouseleave` to activate the existing tooltip behavior
- **Visible form labels**: any Ko-fi overlay `<input>` or `<textarea>` using placeholder text as its only label now gets a programmatically associated `<label>` element injected above it with `display: block`
- **Contrast override**: a `<style id="kofi-a11y-styles">` tag is injected that forces `color: #1a1a1a` on text within the Ko-fi floating chat wrapper and overlay, ensuring minimum 4.5:1 contrast; the tag is removed on component unmount

---

### BottomSheet component (`src/plugins/router/BottomSheet.jsx`)

- New plugin component; slides up from bottom of viewport on all breakpoints (not mobile-only)
- Sticky chrome row: centered drag-handle pill + Lucide `<X>` close button top-right
- Full focus management: saves `document.activeElement` on open, restores on close; `useFocusTrap` restricts Tab; Escape handler; `inert` attribute blocks interaction when closed
- Children only mount while `open` is true: `useFocusOnMount` in child components fires fresh each time
- `App.jsx`: `DetailPanel` moved out of `searchView` and into `BottomSheet` at AppShell root level so it covers all viewports; selection cleared at event source (`onOpenSettings` handler) rather than in a `useEffect` to avoid cascading renders
- `src/components/DetailPanel.jsx`: close row (`×` button) removed; BottomSheet chrome handles close; `onClose` dead prop removed from function signature and all call sites; `.detail-title` font-size bumped to `var(--fs-h1)`, weight to 700

### OffCanvas renamed to Drawer

- `src/plugins/router/OffCanvas.jsx` → `src/plugins/router/Drawer.jsx`; function renamed `OffCanvas` → `Drawer`; default label changed from `'Settings'` to `'Menu'`
- `src/plugins/router/index.js`: export updated
- `src/index.css`: CSS classes `.offcanvas-backdrop` / `.offcanvas-panel` → `.drawer-backdrop` / `.drawer-panel`; section comment updated
- `src/App.jsx`: import and JSX updated; all inline comments updated

### Full CSS migration (completed prior session, logged here)

- All inline styles removed from `SearchBar.jsx`, `ResultList.jsx`, `SettingsPanel.jsx`, `DetailPanel.jsx`, `Announcer.jsx`
- `onMouseEnter` / `onMouseLeave` removed everywhere; `:hover` in CSS handles all hover states
- `onFocus` / `onBlur` removed; `:focus` / `:focus-visible` in CSS handles focus border-color changes
- `Toggle`: JS `hovered` state eliminated; CSS `:has(.toggle__input:checked) .toggle__track` and `:hover:has(...)` handle all visual states
- `RadioChip`: JS `focused` state eliminated; CSS `.radio-chip:has(:focus-visible)` handles focus ring; full-chip hit target (`input.radio-chip__input` with `position: absolute; inset: 0; opacity: 0`) merged from contributor PR
- `SettingsPanel`: disabled label muting added: `.settings-provider-group:has(:disabled) .settings-field-label` uses `--text-faint` with reduced opacity; verified ≥ 4.5:1 contrast
- `.stylelintrc.json`: `selector-class-pattern` added with BEM-compatible regex allowing `__` element and `--` modifier notation
- `src/index.css` specificity fix: `input[type="text"]` (0,1,1) was overriding `.search-input` (0,1,0); fixed by qualifying as `input.search-input`, `input.search-input--has-value`, `input.search-input:focus`

### Ko-fi widget and accessibility patches

- `App.jsx`: `KofiWidget` component loads Ko-fi overlay script; `patchKofiA11y` function attaches a `MutationObserver` that adds `aria-label` to the trigger button, `role="dialog"` / `aria-modal` / `aria-label` to the popup overlay, `title` to Ko-fi iframes, and an Escape handler that clicks Ko-fi's close button and returns focus to the trigger
- `src/index.css`: `padding-bottom: 5rem` added to `.page-footer` on `@media (width < 768px)` to clear the floating Ko-fi button

### Header and footer restructure

- GitHub "Fork on GitHub" link moved to header top-left; hides when settings is open (compact header mode) alongside the h1
- Footer collapsed to a single centered line: "Made by **Mikey Ilagan** · @mikeyil.bsky.social"
- Ko-fi widget replaced the Ko-fi footer link entirely

### New token: overlay background

- `src/tokens.css`: `--overlay-bg: rgb(0 0 0 / 0.45)` added; was hardcoded in both `.drawer-backdrop` and `.sheet-backdrop`; both now reference the token

### SettingsPanel on desktop

- `SettingsPanel` wrapped in `React.lazy()` + `Suspense`; settings bundle deferred until first open
- Settings heading uses `var(--fs-h1)` to match page h1 and BottomSheet detail heading
- Drawer panel covers full screen on mobile (`inset: 0; width: 100%`)
- Header button spacing: gear icon and GitHub link closer to viewport edge; more visual space between buttons and h1

### Plugin documentation

- `src/plugins/router/README.md`: complete rewrite: `Drawer` and `BottomSheet` each have a full section with props table and required CSS class list; new Rule 6 documents Escape key handling and the intentional double-fire pattern; `inert` added to the modal-from-scratch checklist; event-source state rule added
- `src/plugins/announce/README.md`: auto-clear behavior (messages cleared ~1 s after announcement) documented; pre-existing lint warnings resolved (table pipe spacing, code fence language tags, list blank lines)

### Dead code and stale props

- `src/components/DetailPanel.jsx`: `onClose` prop removed (dead after BottomSheet took over close responsibility)
- `src/index.css`: `.detail-panel__close-row` and `.detail-panel__close-btn` CSS removed; `.detail-panel` border-top and margin-top removed (no longer rendered inline in page flow)
- `src/App.jsx`: stale `useEffect` for clearing selection replaced with direct `setSelected(null)` call in the settings open handler

### Maintenance pass (2026-04-25)

- Build: clean, 82 kB total gzipped (up 2 kB from BottomSheet + Drawer); well within 200 kB target
- Token audit: `--overlay-bg` token added; Ko-fi brand colors left hardcoded (not design system values); `#fff` toggle thumb intentional (must stay white in dark mode for contrast)
- Dead code: `onClose` prop removed from `DetailPanel`; `detail-panel__close-*` CSS removed
- `rel="noreferrer"` audit: all `target="_blank"` links pass
- `innerHTML`: none found
- `localStorage` inventory: 5 keys confirmed

---

## 2026-04-24

### Footer

- `src/App.jsx`: GitHub link updated from placeholder to actual repository URL: `https://github.com/mikeyil/A11yHelper`

### Docs reorganization

- `CHANGELOG.md`, `UPDATES.md`, `TODO.md`, `MAINTENANCE.md`, `CONTRIBUTING.md` moved to `docs/`; `README.md` stays at repo root (GitHub convention)
- `README.md`: contributing link and Docs table updated to reference `docs/` paths
- `docs/MAINTENANCE.md`: Docs section updated to reference `docs/` paths
- `docs/TODO.md`: "Create GitHub repo" and new resolved items moved to Resolved section

### Disabled form control consistency

- `src/tokens.css`: `--text-disabled` token added (light: `#b5b5b5`, dark: `#505050`); intentionally below 4.5:1: disabled controls are exempt per WCAG 1.4.3
- `src/index.css`: `select:disabled { opacity: 1 }` added; overrides browser-applied opacity on disabled `<select>` so its border and text color are fully controlled by component styles
- `src/components/SettingsPanel.jsx`: provider `<select>` and API key `<input>` disabled text color changed from `var(--text-faint)` to `var(--text-disabled)`; both controls now show consistent text color and border when AI assist is off

### Focus ring

- `src/App.jsx`: `outline: none` added to h1 inline style; removes the focus-visible ring from the page title (programmatic focus target, not user-navigable)

---

### Bug fixes

- `src/App.jsx`: `typeahead` was never persisted to `localStorage`; initialized with hardcoded `true`; now reads `localStorage.getItem('typeahead') !== 'false'` on mount and a `useEffect` writes the value on every change
- `src/App.jsx`: `platform` was never persisted to `localStorage`; initialized with hardcoded `'web'`; now reads `localStorage.getItem('platform') || 'web'` on mount and a `useEffect` writes the value on every change
- `src/components/SettingsPanel.jsx`: privacy disclosure stated "four things in localStorage" and listed typeahead; corrected to five items with platform added: theme, platform, typeahead, active AI provider, API key(s)
- `src/components/SearchBar.jsx`: clear button `fontSize: 14` (raw px) replaced with `var(--fs-body)`
- `src/components/SettingsPanel.jsx`: back button `fontSize: 20` (raw px) replaced with `var(--fs-sub)`

### Maintenance checklist findings (2026-04-24)

- Build: clean, 76 kB total gzipped; vendor chunks confirmed (react 45 kB, fuse 9 kB, app 20 kB)
- `npm audit`: 2 moderate vulns in esbuild/vite (dev-server CORS, not production); fix deferred (requires Vite 8 breaking upgrade)
- `npm outdated`: all updates are major version bumps (React 18→19, Vite 5→8, ESLint 9→10); deferred
- `innerHTML`: none found
- `rel="noreferrer"`: verified on all `target="_blank"` links
- `localStorage` inventory: 5 keys confirmed after bug fix (theme, typeahead, platform, ai_provider, apikey_*)
- WCAG code checks: all aria-labels, landmarks, role/aria-checked, announce wiring, lang attr: passed
- Docs: all files verified current

---

### Accessibility (WCAG 2.2)

- `src/components/DetailPanel.jsx`: imported `announce` from the announce plugin; copy buttons now call `announce('Defect description: Copied to clipboard')` and `announce('Possible remediation steps: Copied to clipboard')` on success (WCAG 4.1.3 Status Messages)
- `src/components/DetailPanel.jsx`: reset buttons now call `announce('Defect description: Reset to original')` and `announce('Possible remediation steps: Reset to original')` (WCAG 4.1.3)
- `src/components/DetailPanel.jsx`: close button (×) gained `className="btn-icon"`; now meets the 44×44px minimum touch target requirement (WCAG 2.5.5)
- `src/tokens.css`: dark mode priority badge token overrides added: `--priority-critical/high/medium/low-text/bg` now have dark-mode values that pass ≥ 4.5:1 contrast (badge text on badge bg) and ≥ 3:1 (badge bg on card bg)
- `src/tokens.css`: `@media (prefers-contrast: more)` block added; increases `--text-muted`, `--text-faint`, `--border-control`, and `--border` in both light and dark themes (WCAG 1.4.6)
- `src/index.css`: `body { font-size: var(--fs-md) }` corrected to `var(--fs-body)`; `--fs-md` was never defined so body text was silently falling back to the browser default without the correct token

### Token system cleanup

- `src/tokens.css`: full rewrite with shorthand hex throughout (`#ffffff` → `#fff`, etc.) to satisfy the `color-hex-length` stylelint rule
- `src/tokens.css`: stale comment referencing `ResultList.jsx migration is tracked in TODO.md` removed; migration is now complete
- `src/tokens.css`: spacing comment updated to remove the inaccurate `14pt base` reference

### Priority badge colors: migration complete

- `src/components/ResultList.jsx`: removed hardcoded `PRIORITY_COLORS` JS object; component now reads `var(--priority-*-text)` and `var(--priority-*-bg)` directly; dark mode automatically applies via the new token overrides

### Security

- `netlify.toml` *(new)*: Netlify configuration with security response headers: `Content-Security-Policy` (restricts scripts to `self`, styles to `self` + Google Fonts, connect to `self` + four AI provider APIs), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (disables camera, microphone, geolocation, payment)
- `netlify.toml`: SPA fallback redirect (`/*` → `/index.html` 200) for hash router compatibility on hard reload and direct links

### Privacy

- `src/components/SettingsPanel.jsx`: privacy disclosure expanded; now lists all four `localStorage` keys (theme, typeahead, provider, API keys) explicitly and states that no personal data, usage data, or corpus content is collected or transmitted
- `public/robots.txt` *(new)*: `Disallow: /` blocks all crawlers on the dev Netlify deployment; replace with a permissive file before Phase 3 launch
- `public/` *(new directory)*: created as the Vite static assets root

### Performance

- `vite.config.js`: `build.rollupOptions.output.manualChunks` added; splits React/React-DOM (`react` chunk) and Fuse.js (`fuse` chunk) into separately cached vendor chunks; reduces re-download size on app updates

### SEO (all commented out: dev deployment)

- `index.html`: full SEO block added inside an HTML comment: `<meta name="description">`, Open Graph (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:locale`, `og:site_name`), Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`), JSON-LD `WebApplication` structured data, canonical link, sitemap link reference
- `index.html`: `<meta name="robots" content="noindex, nofollow">` active for the dev deployment
- `index.html`: `<meta name="theme-color">` added for light and dark themes (progressive enhancement; Chrome/Edge/Safari mobile only: Firefox ignores gracefully)
- `index.html`: `<!-- <link rel="icon"> -->` placeholder commented in for favicon; create `public/favicon.svg` to activate

### Code cleanup

- `src/index.css`: `.modal-overlay`, `.modal-content`, `@keyframes slide-up`, and the `@media (prefers-reduced-motion)` override for the modal animation were all dead code left over from the settings modal; removed
- `src/typography.css`: scale utilities rewritten; old classes (`.text-xs/sm/base/md/lg/xl/2xl`) referenced the removed 7-token scale; replaced with `.text-small/body/sub/heading` aligned to the current 4-token system
- `src/App.jsx`: stale `/* TODO: update href … */` comment removed from footer; the GitHub link TODO is tracked in `TODO.md`
- `src/App.jsx`: verbose focus-management comment on the settings `useEffect` condensed to one line

### Docs

- `README.md`: complete rewrite: expands project structure to include `plugins/` and `public/`, adds plugin sections (router, announce), updates deployment section to cover Netlify as the primary target with GitHub Pages as an alternative, adds build and plugin documentation
- `TODO.md`: full overhaul: all shorthand/paraphrased items expanded into complete actionable statements; new **AI Agent Support** section added with 6 items covering tool use, multi-turn conversation, and model selection; **Internationalization** section expanded and re-tagged; 16 new items resolved and moved to the Resolved section; redundant or duplicate items consolidated
- `CHANGELOG.md`: this entry
- `UPDATES.md`: plain-language entry added for this session

---

## 2026-04-23

### Router plugin (`src/plugins/router/`)

- New self-contained hash-routing + focus-management plugin; zero deps beyond React
- `Router` / `useRouter`: hash-based SPA routing; `navigate(path)` sets `window.location.hash`; `hashchange` event drives re-renders; browser Back button works natively
- `OffCanvas`: slide-in panel with trigger-focus save/restore, Escape handler, `inert` attribute when closed, and built-in `useFocusTrap`
- `useFocusOnMount`: returns a ref; on mount, calls `.focus()` on the attached element (for headings with `tabIndex={-1}` and modal close buttons)
- `useReturnFocus`: saves `document.activeElement` on mount, restores it on unmount; handles "return to trigger" for all panel and modal close events
- `useFocusTrap`: restricts Tab / Shift+Tab to a container while `active`; cycles wrap-around; skips elements inside `[inert]` subtrees; used by `OffCanvas` internally
- `useMediaQuery`: reactive `window.matchMedia` wrapper; re-renders on breakpoint change
- `src/plugins/router/README.md`: full plugin documentation with focus-management rules and SPA integration guide
- `src/plugins/router/index.js`: exports all hooks and components from a single entry point

### Settings as page / off-canvas panel

- `src/App.jsx`: wraps `<Router>`; uses `useRouter` and `useMediaQuery` to render settings as a full-page replacement on desktop (≥ 768px) or as an off-canvas slide from the left on mobile
- `src/App.jsx`: `navigate('/settings')` / `navigate('/')` replaces the previous modal toggle; browser Back button closes settings automatically
- Modal classes and `<SettingsModal>` wrapper removed; SettingsPanel renders as a plain block

### Focus management

- `src/components/DetailPanel.jsx`: `useFocusOnMount` added; defect title `<h2>` receives `ref={titleRef}` and `tabIndex={-1}`; focus moves here whenever a result is selected so keyboard and screen reader users don't have to hunt for new content
- `src/components/SettingsPanel.jsx`: `useFocusOnMount` on Settings heading; `useReturnFocus` restores focus to the ⚙ button on close

### Font scale: final token migration

- `src/index.css`: `html { font-size: 100% }` (revised from 14pt); respects user's browser font-size preferences (WCAG 1.4.4); rem base is typically 16px
- `src/tokens.css`: font scale reduced from 7 tokens to 4: `--fs-small` (0.75rem/12px), `--fs-body` (1rem/16px), `--fs-sub` (1.125rem/18px), `--fs-heading` (1.5rem/24px); old `--fs-xs/sm/base/md/lg/xl/2xl` removed
- `src/App.jsx`: h1 uses `clamp(1.75rem, 10.5vw, 2.667rem)`; fills ~85% of a 390px screen, caps at ~32pt on desktop; does not use a token (unique one-off)
- `src/components/DetailPanel.jsx`: all literal `fontSize: 11/13/14/18` replaced with `var(--fs-small/body/sub)`
- `src/components/SettingsPanel.jsx`: all `var(--fs-xs/sm/base/md)` replaced with `var(--fs-small/body/sub)`

### Corpus

- `src/data/defects.json` renamed; private corpus is never exposed in the public deployment
- `src/data/corpus.json` created as a placeholder for the public/generic corpus with a single example entry documenting the schema
- `src/services/dataService.js`: import updated to point at `corpus.json`

---

### Branding, settings overhaul, accessibility pass, and UX polish

#### Settings overhaul

- `src/components/SettingsPanel.jsx`: three `<h3>` section headers added: **Search**, **Appearance**, **AI Assist**; each visually separated with a top border
- `src/components/SettingsPanel.jsx`: theme moved from footer button to Appearance section; `ThemeChip` component renders Light / Auto / Dark radio inputs styled as pill chips; `<fieldset>`+`<legend class="sr-only">` for screen reader grouping
- `src/components/SettingsPanel.jsx`: `theme` and `onThemeChange` props added; all font-size values migrated to `var(--fs-*)` tokens
- `src/App.jsx`: theme state now supports `'auto'` (default); `useEffect` resolves to light/dark via `prefers-color-scheme` and adds a media query listener so the UI updates instantly if the OS theme changes while Auto is active
- `src/App.jsx`: footer theme toggle removed; `Footer` component no longer receives theme props

#### Search input

- `src/components/SearchBar.jsx`: outer `<div>` replaced with `<search aria-label="Defect search">` (HTML5 search landmark)
- `src/components/SearchBar.jsx`: "Describe the defect" extracted from placeholder to a visible `<label htmlFor="defect-search">`; placeholder is now only the e.g. example text
- `src/components/SearchBar.jsx`: input `min-height: 3rem`, `padding: var(--space-3) var(--space-4)`, `font-size: var(--fs-md)` (14pt); text is vertically centered by default `<input>` behavior
- `src/components/SearchBar.jsx`: `outline: none` removed; border-color change on focus retained as a supplementary cue

#### Accessibility

- `src/index.css`: global `:focus-visible` rule added: `2px solid var(--focus)`, `outline-offset: 2px`; applies to all interactive elements including inputs, textareas, and buttons
- `src/index.css`: `.sr-only` utility class added (clip-path, 1×1px, overflow hidden) for visually hidden accessible text
- `src/tokens.css`: `--focus: #5548c8` (light, 6.4:1 vs white) and `--focus: #a09ce8` (dark, 4.6:1 vs #111) tokens added
- `src/components/DetailPanel.jsx`: `outline: 'none'` removed from all input/textarea inline styles

#### Contrast corrections

- `src/tokens.css`: `--text-faint` corrected from `#999999` (2.76:1, failing) to `#767676` (4.54:1, passing) in light mode
- `src/tokens.css`: `--text-faint` corrected from `#555555` (2.01:1, failing) to `#909090` (5.0:1, passing) in dark mode; hierarchy is preserved: --text-muted (#999) has higher contrast than --text-faint (#909) against the dark bg

#### Typography and font size

- `src/index.css`: `html { font-size: 14pt }` sets the rem base; browser font-size preferences are respected (WCAG 1.4.4)
- `src/tokens.css`: all `--fs-*` tokens converted from `px` to `rem` (e.g. `--fs-md: 1rem` = 14pt); `body { font-size: var(--fs-md) }` unchanged

#### Nothing Found empty state

- `src/components/ResultList.jsx`: `NoResults` component added; renders an SVG magnifying glass with dashed scan lines, a "No results for …" heading, and a search-tip paragraph; shown when `results.length === 0`
- `src/App.jsx`: `query={activeQuery}` prop passed to `ResultList` for the empty-state label

#### Linting fixes (CSS)

- `src/index.css`: `rgba(…)` → `rgb(… / alpha)` (stylelint `color-function-alias-notation`)
- `src/index.css`: `(min-width: 768px)` → `(width >= 768px)` (stylelint `media-feature-range-notation`)
- `src/index.css`: deprecated `clip: rect(…)` removed from `.sr-only`; `clip-path: inset(50%)` is sufficient

---

### Header and footer

- `src/App.jsx`: header redesigned: title and subtitle centered, platform toggle moved below subtitle, settings gear anchored top-right via `position: absolute` so centering stays true; `<main>` wrapper added with `flex: 1`
- `src/App.jsx`: `Footer` component added: divider line, theme toggle left, "Made by Mikey Ilagan" credit center, "Fork on GitHub ↗" link right; theme toggle removed from header
- `src/index.css`: `.app-container` gains `display: flex; flex-direction: column` to support footer pinning

### Font stack

- `src/main.jsx`: self-hosted `@fontsource/noto-sans` (400/500/600/700) and `@fontsource/cantarell` (400/700) imported; no external CDN dependency
- `src/tokens.css`: `--font` updated to `'Noto Sans', 'Cantarell', 'Inter', 'Ubuntu', system-ui, -apple-system, sans-serif`; `--mono` adds `'Fira Code'`
- `package.json`: `@fontsource/noto-sans` and `@fontsource/cantarell` added as dependencies

### Title scale

- `src/App.jsx`: h1 uses `clamp(22px, 5vw, 32px)` for fluid scaling; subtitle upgraded to `--fs-md` / `--text-muted`

### Open source

- `LICENSE` *(new)*: MIT license, copyright Mikey Ilagan 2026
- `CONTRIBUTING.md` *(new)*: fork/clone/run instructions, defect entry schema, PR process, scope note on private corpus

---

### Design tokens

- `src/tokens.css` *(new)*: all design tokens in one place: surface and text colors, accent, semantic (`--success`), priority badge colors (`--priority-critical-*` through `--priority-low-*`), font families, type scale (`--fs-xs` through `--fs-2xl`), spacing (`--space-1` through `--space-8`), border radius variants (`--radius-sm`, `--radius`, `--radius-full`)
- `src/index.css`: `:root` and `[data-theme="dark"]` blocks removed; now live in `tokens.css`

### Type scale utilities

- `src/typography.css` *(new)*: type scale utility classes (`.text-xs` through `.text-2xl`), weight utilities, color utilities, `.line-clamp-2` helper; components use inline styles today, classes available for gradual adoption

### Responsive layout

- `src/index.css`: `.app-container`: mobile base padding `var(--space-5) var(--space-4)` (1.25rem 1rem); at `≥ 768px` centers at `max-width: 720px` with `var(--space-8) var(--space-6)` padding; spacing references tokens throughout
- `src/index.css`: `.btn-icon`: 44×44px minimum tap target for icon-only buttons (WCAG 2.5.5)
- `src/App.jsx`: container uses `.app-container` class; icon buttons use `.btn-icon`; platform toggle padding bumped to `6px 12px` for touch comfort

### Build order

- `src/main.jsx`: CSS import order: `tokens.css` → `typography.css` → `index.css`

---

## 2026-04-23: Project started

- Vite + React 18 + Fuse.js scaffold
- `src/data/defects.json`: 50 starter defect entries
- `src/services/dataService.js`: JSON data layer with migration stub
- `src/services/aiService.js`: AI provider abstraction; Anthropic (Claude) implemented, OpenAI / Google / Microsoft stubbed
- `src/hooks/useDefectSearch.js`: Fuse.js search with platform filter (`web` / `native` / `both`)
- `src/components/`: SearchBar, ResultList, DetailPanel, SettingsPanel
- Light/dark theme toggle with `localStorage` persistence and `prefers-color-scheme` default
- Platform toggle (Web / Native) in header
- AI assist toggle; API keys stored in `localStorage` only, never sent to any server other than the provider
- Location prefix field in DetailPanel: prepends site/page scope to defect description before copy
- Copy button with 2-second "Copied" feedback on description and remediation fields
- AI refinement: describe the change, Claude rewrites description and remediation in place
