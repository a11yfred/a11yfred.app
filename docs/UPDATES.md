# Updates

Plain-language record of what changed and why. For technical details see `CHANGELOG.md`.

---

## May 5, 2026 — ID consolidation documentation and console error fixes

### Corpus ID reference complete

The corpus now has a comprehensive reference document mapping all entries showing which are in use and the structure of the corpus data.

### Console error fixed

Removed `aria-hidden` attribute from app background div that was conflicting with focused descendants. The `inert` attribute alone is sufficient to prevent focus and interaction with background content during modal/panel display, and avoids the console warning about hidden focused elements.

---

## May 1, 2026 — Corpus completion, platform variant UI, and sourcing finalization

### Corpus now 100% sourced with 2+ expert references

All 124 accessibility findings in the personal corpus now have at minimum 2 expert sources backing each entry. This completes the Tier 2 sourcing initiative that began with selecting 10 reference experts (Adrian Roselli, Scott O'Hara, Eric Bailey, Marco Zehe, Scott Vinkle, Kat Holmes, Eric Eggert, Karl Groves, Steve Faulkner, Patrick H. Lauke). Sources are deep-linked where possible (e.g., Roselli's "Where to Put Focus When Opening a Modal Dialog", O'Hara's "Unbuttoning Buttons", Bailey's "aria-label is a code smell") to enable quick reference during audits.

### Platform variant display and filtering now visible in UI

Platform information (Web / iOS / Android / Web & Mobile) is now displayed as a badge on every finding in the result list and detail panel. Clicking the platform badge filters results by that platform, matching the existing behavior for priority and WCAG badges. This feature surfaces the platform variant work that was already in the search logic but not visible to the user — findings now clearly indicate whether they apply to web-only, native app, or both.

### Content quality review completed for first 40 entries (ATH-001–040)

Conducted a comprehensive editorial pass on the first 40 findings to ensure title consistency, clarity, and depth. Fixed 4 entries (ATH-002, ATH-005, ATH-011, ATH-018) where titles were using a "No X" or "X Not Y" pattern instead of the established descriptive pattern (e.g., "No Focus Management" → "Modal Opens Without Focus Management"). Also added nuance details to ATH-002 (clarifying that nested modals are generally discouraged in practice) and ATH-004 (emphasizing that the 20-second warning is a WCAG requirement, not optional).

### JSON schema corruption recovery

Fixed critical JSON corruption in entries ATH-044–050 where a failed bulk regex replacement had stripped essential metadata (id, title, sc, scLabel, related, priority) from 7 entries, leaving only the sources array. Reconstructed all 7 entries with proper structure using the existing metadata combined with sourcing information.

### Internationalization updates for platform badges

Added platform badge translation keys across 8 major language files (en, de, es, fr, ja, pt, zh, nl, sv, sv) with support for Web, iOS, Android, and Web & Mobile variants. This enables platform labels to display correctly in any supported language.

---

## April 30, 2026 (late evening) — Button styling and interaction refinements

### Better visual feedback and consistency

Copy buttons throughout the detail panel now use the "double page" copy icon for clarity — visually distinct from a paste or clipboard icon. Hovering over a title or success criterion row highlights it with a subtle background, but only on devices with a mouse (not on touch devices where this creates unwanted hover states).

### Improved form field spacing and alignment

Location prefix field now has proper spacing between the label and "(optional)" text, making the relationship clearer. The clear button inside the field is now properly vertically centered when text is present, fixing a visual misalignment.

### Consistent button labeling

Reset buttons within description and remediation fields show "Reset", while the bottom "Reset All Content" button shows that full label before clicking and "All Content Reset" after — clearer communication of scope. Copy All button now consistently uses title casing ("Copy All" / "Copied All"). All button text throughout the app has been updated to use NY Times title casing for consistency.

---

## April 30, 2026 (evening) — Finding details UI refinements

### Copy buttons throughout the finding detail panel

You can now copy individual pieces of a finding without copying the entire detail:

- **Copy title button** next to the finding title — useful when you want to reference just the issue name
- **Copy primary SC button** next to the "Fails" success criterion — copy the WCAG reference separately
- **Copy related SCs button** next to "Related" success criteria — get all related standards at once

All copy buttons show a Check icon for 2 seconds after copying, with a spoken announcement.

### Better location prefix UX

The Location Prefix field now behaves more intelligently:

- **(optional) label disappears** when you've entered a value, reappears if you clear it — less clutter once you've started typing
- **Clear button** (×) appears inside the field when you have text — same style and placement as the search bar's clear button, so behavior is consistent across the app

### Improved narrow mode UI

The narrow mode button now has a visual design that better matches the rest of the app:

- **Filter icon** makes the button's purpose clearer at a glance
- **Button moved below** the search input and left-aligned with it — visually distinct from the search controls but still associated with the search area
- **Focus restoration** — when you click the Narrow button, focus returns to the search input automatically so you can start typing immediately
- **Exit button is now an X icon** (not text) — consistent with other icon buttons in the UI (like the location prefix clear button), and matches the reset icon's visual style
- **Label changed** from "Narrow results" to "Narrowing results" when you're in narrow mode — clearer communication of state

All of these changes make the interface more self-documenting: copy buttons appear where content is, the clear button placement is consistent, and state changes are communicated through labels and visual placement rather than relying on modal dialogs.

---

## April 30, 2026 (late afternoon) — Narrow results mode

### Filter within search results

New "Narrow" button appears next to the results count when you have search results showing. Click it to enter narrow mode — the search input label and placeholder change to reflect you're now filtering *within* the current results rather than doing a new search. The narrow filter uses the same Fuse.js fuzzy search logic on title, description, keywords, and source names.

In narrow mode:

- The count display shows "X of Y results" so you see the filtered vs. total
- The clear button now says "Clear and reset" which wipes the narrow filter and returns to the original search
- An "Exit" button returns you to viewing all results
- The narrow filter respects the live-search setting — updates in real-time if live search is on, otherwise updates on Enter

This gives you a two-step refinement workflow: (1) broad search to get a candidate set, (2) narrow to find the specific match within that set. Much faster than retyping a more specific query.

---

## April 30, 2026 (afternoon) — Improved Reset All dialog

### Reset All is now a BottomSheet with explicit lists

The Reset All confirmation changed from a Modal to a BottomSheet to accommodate detailed, explicit information about what gets permanently deleted and what gets reset to defaults. Users now see:

**Will permanently delete:**

- All AI provider API keys
- All finding ratings (upvotes, downvotes, stars, archived state)
- All pinned findings
- Usage frequency tracking (opens, copies count)
- Recent findings history
- Personal text overrides for findings
- Pending contribution suggestions

**Will reset to factory defaults (with specific values shown):**

- Theme → Light
- Language → English
- Platform → Web
- AI Assist → Off
- Live Search → On

This replaces the vague "clear all saved settings" copy with explicit, itemized lists so users understand the full scope before confirming. Red warning box at the top reminds users the action cannot be undone.

---

## April 30, 2026 — UI refinements, result card display fixes

### Related findings now display compactly

When a finding has only one related issue, it displays on a single line with the singular label "Similar or related issue:" instead of "issues:". Multiple related findings still stack as a bulleted list. This follows the same UX pattern already established for source links, reducing visual clutter for findings with only one related criterion.

### Animation and responsive design complete

All transitions are now consistent across the app. BottomSheet animates both entrance and exit; result lists stagger on load; SettingsPanel transitions smoothly on desktop. Every animation respects `prefers-reduced-motion: reduce`. Result cards are fully responsive down to 568px viewport height (iPhone SE landscape), using the result card fold behavior to adapt layout.

### Selection indicator meets WCAG 1.4.1

The selected result card now uses a non-color indicator (accent left-edge bar from the fold behavior) alongside color, so the selection state is perceivable without relying on color alone.

### PWA offline support

Service Worker now caches the app shell and corpus JSON, enabling full offline search after the first load. Web App Manifest allows installation to home screen. Tested on mobile Chrome.

---

## April 29, 2026 — Multi-platform builds (Chrome extension, Firefox extension, Electron)

Three distribution targets are now in active development on feature branches. The same React app powers all of them — no source rewrites needed.

**Chrome extension** (`feature/chrome-extension`) — runs as a Chrome side panel, which opens beside whatever page you're auditing. That's the natural fit for an audit tool: you search A11yTextHelper on the left, review the page on the right, copy and paste. Build with `npm run build:extension`, then load the `dist-extension/` folder as an unpacked extension in Chrome.

**Firefox extension** (`feature/firefox-extension`) — same idea, using Firefox's sidebar instead. No background script needed; Firefox opens the sidebar automatically when you click the extension icon. Build with `npm run build:extension:firefox`, load temporarily via `about:debugging`.

**Electron desktop** (`feature/electron-app`) — the desktop app scaffold is now functionally complete. API keys are stored using the operating system's encrypted keychain (`safeStorage`) instead of the browser's localStorage, so they're protected at rest. The app is fully offline for search; AI Assist still requires internet to reach the provider API.

---

## April 28, 2026 — Archived items, URL sync, settings updates

### Archived items look cleaner

Archived result cards are redesigned: the title text stays fully readable (same as normal text color) while the badges, success criterion, and description fade out and turn neutral gray. All badges on an archived card now use the same consistent neutral color. The success criterion label is also now bold across all cards.

### URL updates as you type

When Live Search is on, the `?q=` URL parameter now updates immediately as you type or click a typewriter phrase — so the address bar always reflects what you're searching, not just after you press Enter.

### Settings updates

The Reset button is now labeled **Reset Settings & Clear Data** with a red style to make it clear it's a destructive action. The confirmation dialog has a matching heading and shows a warning icon inline with the body text. The Unpin All button briefly shows a checkmark and "All Unpinned" confirmation after you click it. When nothing is pinned, the Pinned Results section in Settings now says "Nothing pinned." instead of showing empty space.

### Back to Top

When the result list has more than 50 items, a **Back to Top** button appears at the bottom. Clicking it scrolls to the top and moves focus to the result count heading.

---

## April 28, 2026 — Debug commands from search bar, toggle hover, contrast fixes

### Debug commands work from the search bar

All `debug` commands (`debug ok`, `debug wrong`, `debug 401`, etc.) now work when typed into the main search field. Previously they only worked from the Revision Notes field inside a finding panel. With live search on, debug commands still require pressing Enter — they won't fire on every keystroke.

### Unchecked toggle hover state

Settings toggles that are currently off now show a subtle hover state (darker border and outline) that matches the existing hover effect on checked toggles.

---

## April 28, 2026 — Badge filters, shareable links, Easter egg fonts, debug polish

### Filter by badge

Clicking any badge in a finding panel (severity, source, or WCAG version) now filters the result list to show all findings with that tag. Click a different badge or start a new search to clear the filter.

### Shareable search URLs

Performing a search now writes a `?q=` parameter to the URL. The Copy Link button (next to the result count) copies the full URL including the query, so you can paste it in a message and the recipient lands on the same results. Navigating to a shared link pre-fills the search automatically.

### Easter egg locale heading fonts

Each of the 17 secret language modes now has its own heading font family: Pirate and High Valyrian get elegant old-world serif; Klingon, Hodor, and Newspeak get Impact; Belter, Nadsat, and Cityspeak get Courier New; Dovahzul gets Old English Text MT; Pig Latin and Simlish get Comic Sans; and so on.

### Toggle restored

The settings toggles are back to a plain circular thumb. The power-button icon experiment has been removed.

### Debug commands simplified

`debug all`, `debug names`, and `debug ai assist` now work without typing `on` — the bare command enables the tool. Append `off` to disable. The debug help panel (`debug help`) has been reformatted to match.

## April 28, 2026 — Badge labels on desktop, WCAG filter layout, accessibility fixes

### Badge labels on wider screens

On desktop, the severity, source, and WCAG badges now include a text label: **Severity: Critical**, **Source: ATH**, **WCAG 2.1, Level AA**. On mobile the short form remains — **Critical**, **ATH**, **2.1, AA** — to keep the card compact. Translations are queued for the next i18n pass.

### WCAG filter layout

The WCAG Version and Conformance Level radio groups in Settings now sit evenly side by side with their options centered under each heading.

### Accessible name debugger — controls only

The dev-mode accessible name tooltip (debug → Names) now only fires on interactive controls (buttons, links, inputs, images). Hovering over paragraphs, headings, and other static text no longer shows a tooltip, so the overlay is less noisy during keyboard and focus audits.

---

## April 27, 2026 — Related issue back navigation, Copy/Reset button layout

### Navigate back through related findings

When you tap a related issue link inside a finding panel, a back button now appears in the top-left corner of the sheet chrome. Tapping it returns you to the previous finding with focus restored to its heading, so you can follow a chain of related issues and retrace your steps without closing the sheet.

### Copy all and Reset all moved to the bottom

The "Copy all" and "Reset all" buttons have moved to the bottom of the finding panel, right above the Close button. On narrow screens both buttons sit side by side at full width, making them easy to tap after reviewing a finding.

---

## April 27, 2026 — Multilingual edit backend, badge redesign, debug improvements

### Edit in any language

The backend for multilingual editing is fully wired. When you edit a finding's description or remediation in a non-English locale, you'll soon be able to choose: save it privately to your own device, or suggest the change for the shared corpus. For the "contribute" path, your edit is queued locally and can be exported as JSON for maintainer review — nothing is sent automatically. Personal edits are stored in your browser's localStorage and applied on top of the corpus text at runtime, so your changes show up in search results immediately.

### Badge redesign

The priority, source, and WCAG version badges in result cards now sit together as a group on the right side of the card header, instead of spacing out unevenly. They're also smaller and use a monospaced font to make them feel more like labels than text.

### Debug improvements

The debug help panel now closes when you click the overlay behind it. The `debug all on/off` command now toggles all debug tools together — focus toast, announce toast, and the accessible-names tooltip.

### GDPR draft

A privacy disclosure document covering all data practices (localStorage keys, AI API calls, no tracking) has been drafted and saved locally. It'll be published as a page before any public launch.

## April 27, 2026 — Session restore, recent history, export, user findings data layer

### Remember where you were

Refreshing the page now reopens whatever finding you had selected. The selected finding's ID is saved to sessionStorage when you open it and cleared when the tab closes, so it only persists for the current browsing session — not forever. The app also starts building a "recently viewed" list in the background (the last 10 findings you opened), ready for when a Recent section is added to the UI.

### Export a finding

The export utility is complete under the hood. `exportFinding(finding, format)` can generate a plain text file, a Markdown doc, or a CSV row from any finding — all client-side, no server. A button to trigger it will be added to the detail panel.

### User findings data layer

The foundation for copy, add, edit, and delete is wired. A new `userFindingsService` handles localStorage read/write for user-created findings using `USR-NNN` IDs so they never collide with corpus entries. The `useUserFindings` hook exposes reactive state and four actions (`addFinding`, `editFinding`, `deleteFinding`, `copyFinding`). User findings are already merged into search results alongside corpus entries — so once the UI forms exist, they'll appear in search immediately.

### Privacy disclosure updated

The privacy text in Settings now lists all storage keys the app uses, including the new sessionStorage entry and the user findings storage.

## April 27, 2026 — Focus fixes, debug plugin, NamesDebugger, Easter egg improvements, docs overhaul

### Focus management tightened

Several focus return gaps are closed. Closing a modal or sheet now reliably returns focus to the button that opened it: the Save button for "No Changes", the Reset All button for the reset confirmation, and the Privacy & Storage button for the privacy sheet. Archiving a result card moves focus to the next card in the list. Reset All now focuses the H1 heading after resetting. The View All confirm modal also returns focus to the View All button.

Navigating to a related issue from a finding panel no longer overwrites the focus return target — focus still goes back to the original result card when the panel closes.

### Debug plugin

All dev-only tooling is consolidated into a new standalone plugin at `src/plugins/debug/`. The KB focus debugger, announce toast visualization, AI assist toggle toast, deployment banner, and a new command reference panel (`debug help`) are all there. The plugin is self-contained — markup, styles, and logic together — and can be dropped into any React/Vite project.

Type `debug help` in the search bar to see all available commands in a floating panel with an X to close.

### New debug commands

- `debug all on / off` — toggle the KB focus toast and announce toast visualization together
- `debug ai assist on / off` — enable or disable AI assist from the search bar; shows a green toast confirming the change
- `debug deploy [off | on | netlify | pages | vercel]` — show a fixed bottom-left banner indicating which deployment target is active
- `debug help` — show the full command reference panel

### Debug Launcher (opt-in FAB)

The debug plugin now includes a floating action button that can be enabled for any project. When active it sits in the corner like an accessibility overlay button and opens a spotlight-style command input — useful for projects that don't have a search bar or command field to type debug commands into. A11yTextHelper leaves it off by default since commands go in the search bar, but it's one prop change to enable.

### Easter egg improvements

Easter eggs no longer wipe your search results when they fire. If you had results on screen and typed `pig latin`, your results come back when the language changes. The detail panel also stays open.

New off commands: `pig latin off`, `pirate off`, `klingon off`, `valyrian off` all restore the UI language to English. `party mode off` restores the appearance to Auto.

### Accessible name tooltip (`debug names on`)

The debug plugin now has a hover tooltip mode. Type `debug names on` in the search bar and every element you mouse over shows a small tooltip with its accessible name and where that name comes from — `aria-label`, `aria-labelledby`, a `<label for>` association, `alt` text, or just text content. Useful for quickly spotting unlabeled controls without opening DevTools. Turn it off with `debug names off`.

### About page restructured

The About page was reorganized. Easter eggs now have their own sub-sections for Fake Languages and Party Mode. The Languages section picked up the RTL layout and capitalization philosophy notes that used to be separate sections. A new Accessibility Details section explains the `useAriaHide` hook. Architectural Choices is expanded with a note on 404 handling and a list of all three plugins with links to their READMEs.

### TODO backlog reordered

TODO items are now sorted by value and effort — high value, low effort at the top. Dormant items (Ko-fi, Electron, Phase 3, Umami) are tagged `[dormant]` so they stay in the list without cluttering active work. A new item covers importing from `corpus_src/` source files.

---

## April 26, 2026 — Dependency updates, build improvements, and full maintenance sweep

### Updated all dependencies

Every package is now on its latest stable version. The biggest changes are React 19, Vite 8, and ESLint 10. The ESLint update required removing one plugin that had become incompatible — it handled rules specific to class-based React components, which this app does not use, so nothing was lost. markdownlint also received an update that introduced a new table formatting rule; one doc file needed a small fix.

### Faster CSS in production

The build now runs stylesheets through LightningCSS, which produces smaller output than the previous default. No visible change — just smaller files the browser downloads and parses faster.

### Security headers updated

The Content Security Policy now includes GitHub and Google avatar image domains. These will be needed once the planned sign-in feature is active so profile pictures load without violating the policy. Everything else is unchanged — API keys still go only to the AI provider you configure, and no new data is collected.

### Dead code removed

Three CSS class definitions that were left over from an earlier About panel redesign — never actually applied to any element — were deleted. One ESLint configuration file was cleaned up to remove a plugin that was no longer needed.

### Docs fully up to date

The README was completely rewritten to match the current state of the project: accurate file structure, correct hook names, updated key counts, and a new section documenting the Electron scaffold and the translation script. The Contributing guide was updated to use "finding" consistently.

### Full maintenance sweep

Ran a thorough pass covering accessibility, security, SEO, performance, privacy, and auth wiring. Everything was in good shape — no issues found beyond the dependency upgrades documented above. The sweep confirmed: axe-core reports no violations, keyboard navigation works end-to-end, all external connections are covered by the Content Security Policy, the privacy disclosure in Settings accurately lists every stored key, and the Supabase/OAuth stubs are present but not active.

---

## April 26, 2026 — New finding, corpus renames, About panel polish, and i18n fixes

### New finding: Visible Heading Not Marked as Heading

Added ATH-076 to the corpus. This covers the common pattern of text that looks like a heading (large, bold, visually distinct) but is not marked up with an `h1`–`h6` element. Screen reader users miss it entirely when navigating by heading.

### Two corpus entries renamed

- "Focus Not Moved When New Content Opens" is now **Focus Not Managed** — shorter and more accurate to the broader scope of focus management failures.
- "Flashing Content May Cause Seizures" is now **Flashing Content** — the medical implication is already covered in the description; the title doesn't need to repeat it.

### About panel improvements

The "What Is This?" section has been rewritten with clearer, more direct language. WCAG 2.2 is now a clickable link. The example findings listed in the About panel are now actual links — clicking them opens the finding directly. On desktop, the gear icon in the header switches to a close button when About is open, consistent with how Settings works.

### i18n fixes

Corrected a bug where all 40+ non-English locale files had the wrong text for steps 3 ("Pick") and 5 ("Copy") in the How to Use section — they were showing the "Customize" and "Vote" content instead. All locale files now have full key coverage with no missing entries.

---

## April 26, 2026 — Deep linking, UI polish, and dev tooling

### Shareable links for defects and panels

Settings, About, and individual defect entries now have their own URLs. Opening `/#/about` loads the About panel directly. Opening `/#/defect/ATH-023` opens that specific defect. The browser back button works throughout. The page title bar updates to include the defect name when a defect is open.

### Visual hover states

Several text-link style buttons were missing hover feedback. Fails/WCAG SC criteria links, related issue buttons, the Settings link inside the detail panel, and the Privacy & Storage buttons in both Settings and About now all turn white on hover while keeping their underline.

### Save & Revise button

The button label and padding were both fixed — text no longer clips at the edges, and the label consistently says "Revise" instead of "Rewrite."

### Dev debug tooling

When running locally, every accessibility announcement now shows as a large toast at the bottom of the screen (white on black pill, red for urgent/assertive). This makes it easy to verify screen reader announcements while building without needing a screen reader open. The README now documents all debug commands and Easter egg search triggers.

---

## April 26, 2026 — Public corpus expanded with 16 new defect entries

### 16 new accessibility defects added to the corpus

The public corpus has grown from 53 to 69 entries. The new defects cover common issues that were missing from the original set, including several WCAG 2.2 criteria:

- **ATH-004** Session Timeout Without Warning (2.2.1)
- **ATH-006** Flashing Content May Cause Seizures (2.3.1)
- **ATH-015** Content Does Not Reflow at 400% Zoom (1.4.10)
- **ATH-020** Touch or Click Target Too Small (2.5.8, WCAG 2.2)
- **ATH-024** Screen Orientation Locked (1.3.4)
- **ATH-036** Autocomplete Attribute Missing on Personal Data Fields (1.3.5)
- **ATH-042** iFrame Missing a Title (4.1.2)
- **ATH-044** Expanded or Collapsed State Not Communicated (4.1.2)
- **ATH-049** Device Motion Feature Has No Alternative (2.5.4)
- **ATH-064** Reading Order Disrupted by CSS Positioning (1.3.2)
- **ATH-065** No Confirmation Step for Irreversible Actions (3.3.4)
- **ATH-066** Focus Indicator Does Not Meet Minimum Area (2.4.11, WCAG 2.2)
- **ATH-067** Instructions Rely on Sensory Characteristics Only (1.3.3)
- **ATH-068** Navigation Changes Position Across Pages (3.2.3)
- **ATH-069** Linked Document Is Not Accessible (1.1.1) — PDFs, Word, Excel
- **ATH-070** Emoji or Special Characters Disrupt Screen Reader Output (1.3.1)

### All new entries need review

These entries were written based on established WCAG guidance and common audit findings, but the wording, keywords, and remediation advice should be reviewed before treating them as final. They have not been through the same editorial pass as the original corpus. See the TODO for a review task.

---

## April 25, 2026 — About panel improvements and settings footer fix

### The About panel is now a proper drawer

The About panel now slides in the same way as Settings — from the left on mobile, replacing the main view on desktop. The Info button in the header works as a toggle (click to open, click again to close). The panel has a back button, section dividers, and a Privacy & Storage link at the bottom.

### Reset All is fixed

The Reset All button in Settings is now properly styled and always sits right next to the Save button.

---

## April 25, 2026 — About panel, Reset All, performance fixes

### There is now an About page

Click the ⓘ button in the header (next to the gear) to open an About panel explaining what the app is for, how to use it in four steps, what the notable features are, and what's coming next.

### You can now reset all settings at once

A "Reset All" button has been added to the Settings footer, next to the Save button. Clicking it opens a confirmation prompt, then clears everything — theme, language, platform filter, live search preference, AI provider, and all API keys — and returns to defaults. This is useful if you want to start fresh or if something gets into a weird state.

### Under-the-hood: performance and Phase 2 groundwork

Translation overlays for non-English locales are now cached after first load so switching back to a previously used language is instant. The app also has groundwork for Phase 2 features laid out: Supabase database schema, Google and GitHub sign-in stubs, and a data layer that's ready for user-owned custom defect entries.

---

## April 25, 2026 — The app now speaks 10 languages

### Interface translated into 10 languages

All text in the app is now translated: English, Spanish, French, German, Dutch, Swedish, Simplified Chinese, Japanese, Korean, and Filipino (Tagalog). Switch languages in Settings → Appearance → Language.

Everything translates: search labels, placeholder text, hint text, result messages, the defect detail panel (all buttons, modal headings, everything), all Settings labels, party mode announcements, the footer, and all screen reader announcements.

### Translations were done with AI — they may have errors

The translations were generated with AI assistance, not by native speakers. A note has been added to the Privacy & storage information modal to be upfront about this. If you spot a translation error, please open an issue or submit a PR.

No custom or user-entered data (location prefixes, refine notes, anything you type) is ever sent anywhere for translation.

### Three new language additions: Swedish, Chinese, Korean

Swedish was added specifically to reach the t12t (tillgänglighet — Swedish for "accessibility") community in Scandinavia, which is one of the most active international accessibility communities. Simplified Chinese and Korean were added for the large accessibility communities in East Asia.

### Privacy & storage button has a new home

The "Privacy & storage information" button has been moved to the bottom of Settings, on the same row as the Save button. On desktop it sits on the left, across from Save on the right. On mobile, Save comes first and the privacy link sits below it.

The privacy modal now has a third paragraph noting that AI-generated translations may contain errors and confirming that none of your personal data is ever sent out for translation.

---

## April 25, 2026 — Party mode goes wild: sounds, sparkles, music, and more

### Sounds when you click things

In party mode, clicking buttons, toggles, and dropdowns now plays a random sound — a goose honk, cat hiss, cat meow, fart noise, descending ahooga car horn, wolf whistle, or snare drum. The fart has a 1.5× higher chance of appearing. Each fart is slightly different in length.

### Squeaky shoes while you type

Typing in the search field in party mode plays a squeaky shoe sound every third keystroke. The pitch is randomized slightly each time so it doesn't feel robotic.

### Click sparkles

Clicking anywhere in party mode shoots a burst of 14 colorful stars and circles from your cursor. They fly outward, fall, and fade. Skipped entirely if you have Reduce Motion turned on in your OS.

### Floating music player

A small round play button appears randomly on the page. Click it to play a synthesized loop approximating the guitar-and-drums riff from Blur's "Song 2" — it loops continuously until you click pause. The button wanders to a new random position whenever you navigate to a different part of the app.

### Party banner settles down

The bouncing "~*~ PARTY MODE ENABLED ~*~" banner now stops after 5 seconds. Hover over it to restart the bounce for another 5 seconds.

### Stars instead of circles on chips

The small dot inside each selection chip is now a ☆ or ★ star in party mode instead of a circle.

### Bigger magic wand cursor

The custom magic wand cursor is now twice the size (64×64 instead of 32×32).

### Gradient background fixed

The party mode background was tiling visually in some cases. It now uses a fixed radial gradient covering the full viewport, centered at a random position each time — no tiling.

### Screen reader announcement improved

The party mode activation announcement is already sent as an assertive alert, which interrupts any current speech. The text now stays in the DOM long enough for longer messages to finish reading before being cleared.

---

## April 25, 2026 — Party mode, copy guard, search and button fixes, LinkedIn

### Party Mode — a fourth theme option in Settings

Settings now has a "Party Mode?" chip alongside Light, Auto, and Dark. Selecting it changes everything: the font switches to Comic Sans, the entire color palette shifts to a random complementary set of bright colors (different every time you activate it), colorful confetti falls from the top of the screen in an assortment of shapes and colors for five seconds, and the mouse cursor turns into a magic wand.

If you have "Reduce Motion" turned on in your operating system, the confetti is skipped and you will see a note at the bottom of Settings confirming that the app saw your setting and respected it.

Screen readers hear a description of everything that changed when Party Mode turns on.

### Copying an empty field now says so

If you click Copy on a description or remediation field that has been cleared out, the app now shows a small popup that reads "Nothing to copy" instead of silently doing nothing.

### Search field label is now black

The "Describe the defect or observation" label above the search field was a lighter grey. It is now the same dark color as all other field labels on the page.

### Search hint: "AI assist is active"

The hint text below the search field now says "AI assist is active" instead of "AI assist is on."

### Clear search button matches Reset

The small button that clears your search text now shows ↺ (the same reset symbol used in the description and remediation fields) instead of an ✕. The behavior is the same — it clears the field and returns focus.

### Rewrite button grows to match the input

The Rewrite button that appears next to the refinement note field was not always the same height as the input it sits beside. It now stretches to match the input height regardless of your font size settings.

### Footer: LinkedIn

The Bluesky link in the footer has been replaced with a link to LinkedIn (linkedin.com/in/mikeyil).

---

## April 25, 2026 — Panel improvements, settings navigation, translations groundwork, more defects

### Defect panel close button is fixed

The × close button on the defect panel was visually clipped — half of it was hidden behind the rounded corner of the sheet. It now sits clearly inside the panel in the top-right corner. On mobile, there is also a full-width "Close" button at the bottom of the sheet so you do not have to scroll back up.

### Opening Settings from inside a defect panel now preserves your work

If you tap the settings gear while you have a defect open (and you have made edits to the description or remediation), your edits are kept. When you close Settings, the defect panel comes right back with everything you typed still there.

### Reset now asks before throwing away big changes

If you have made significant changes to a description or remediation field and then click Reset, the app now asks "Are you sure?" before wiping your edits. If you have barely changed the text, it resets immediately without asking — same as before.

### WCAG success criteria now appear as a bulleted list

The "Fails:" and "Related:" lines in the defect detail panel are now a proper bulleted list, making them easier to scan at a glance.

### "Typeahead" is now called "Live search"

The toggle in Settings was labeled "Typeahead", which is a technical term that most people do not know. It is now called "Live search", which describes what it does — results appear as you type.

### Search hint tells you what mode you are in

The hint text below the search field now tells you whether you are searching web or native results, and whether AI assist is on. You no longer have to open Settings to remember what you set.

### Language selector added to Settings

Settings now has a Language option under Appearance. It defaults to your browser's language. You can change it to English, Español, Français, Deutsch, Nederlands, 日本語, or Filipino. Full translations of the interface are still in progress — this sets up the selector so it is ready when translations arrive.

### Appearance settings moved to the top of Settings

The Appearance section (theme and language) now appears before the Search section. This matches the typical priority order users expect when opening settings.

### Settings panel has a visual divider above the Save button

The Save button now has a separator line above it, making it easier to spot at the bottom of the settings form.

### "Made by" → "A project by" in the footer

Small wording update to better reflect that the tool is open source and accepts contributions.

### 13 new accessibility defect entries

The public defect library grew from 41 to 54 entries. New topics include: missing audio descriptions, missing closed captions, vague link text, figures without descriptions, conflicting form labels, unlabeled dropdowns, layout breaking at larger text sizes, form groups without labels, lists not using list markup, live regions not announcing updates, multi-touch gestures without alternatives, and vague error messages.

---

## April 25, 2026 — Simplified public defect library, cleaner detail panel, Ko-fi fixes

### Simplified public defect library

A fresh set of 41 defect entries replaces the placeholder in the public data file. These are written at a plain reading level — shorter sentences, common words, no assumed knowledge of WCAG jargon. The goal is for any developer or QA engineer to read a description and immediately understand the problem and the fix, even if they've never done accessibility work before.

Near-duplicate entries from the internal library were consolidated into single entries. For example, "No Visible Focus" and "Poor Focus Indicator" are now one entry. "Form Field Missing Label," "No Label Association," and "Unlabeled Form Inputs" are now one entry. The result is a tighter, less repetitive list.

The original internal corpus is unchanged and still loads in the development environment.

### Defect detail panel — cleaner layout and better info

A few things changed in the defect detail panel (the sheet that slides up when you pick a result):

- **Priority badge** now appears next to the defect title. It was already shown on the result card but missing from the detail view.
- **WCAG success criteria** are now plain text links instead of pill-shaped badges. Each entry now reads as "Fails: 1.1.1 Non-text Content (Level A)" and "Related: 4.1.2 Name, Role, Value (Level A)" — comma-separated when there are multiple related criteria.
- **Refine field** has a proper explanatory sentence below the label instead of a short inline hint. The non-AI version tells you to edit directly or jot a note. The AI version describes what AI will do and links straight to Settings so you can change your model.
- **Rewrite button** is smaller and less visually dominant, matching the Reset and Copy buttons. The arrow icon is gone; a small sparkle icon is in its place to indicate AI involvement.

### Close button spacing and focus ring fix

The × close button on the defect panel was sitting too close to the right edge of the sheet. It now has a bit more breathing room, and the keyboard focus ring around it is no longer clipped by the panel's rounded corners.

### Ko-fi widget — more accessibility patches

Three more fixes were added on top of the existing Ko-fi accessibility patches:

- Tooltip trigger icons inside the widget are now keyboard-focusable. Tabbing to them and pressing Enter or Space activates the tooltip, the same as hovering would.
- Inputs inside the Ko-fi panel that used only placeholder text as labels now have a real visible label injected above them.
- Text inside the Ko-fi widget now has a forced minimum contrast override applied so it's readable regardless of whatever color scheme Ko-fi happens to use.

---

## April 25, 2026 — Defect detail as a bottom sheet, Ko-fi widget, naming cleanup

### Defect detail now slides up from the bottom

Clicking a result used to open the detail inline below the search results. It now slides up from the bottom of the screen as a bottom sheet — the same pattern you'd see in a maps or settings app. This works the same way on mobile and desktop.

The detail stays up while you read it, and you can close it with the × button, the Escape key, or by clicking the backdrop behind it. When it closes, keyboard focus returns to the result you clicked.

This also fixes an issue where opening Settings from within the detail would cause both to be open at the same time. Settings now dismisses the detail when it opens.

### Ko-fi support widget and accessibility fixes

A Ko-fi "Support me" floating button has been added to the app. When clicked it opens Ko-fi's donation overlay.

Ko-fi's widget has some accessibility gaps out of the box — the trigger button has no accessible label, the popup has no dialog semantics, and the iframe inside has no title. The app now silently patches all of those when the widget loads, without modifying Ko-fi's own code. Keyboard and screen reader users can use the widget the same way as mouse users.

On mobile the footer text was being hidden behind the floating Ko-fi button. Extra padding has been added to keep the footer clear of it.

### Internal rename: "OffCanvas" is now "Drawer"

The slide-in settings panel was internally called "OffCanvas" — a legacy implementation term. It's been renamed to "Drawer" throughout, which is the standard name used across Material Design, Ant Design, Chakra, and Radix. This is a code-only change; nothing on screen looks different.

### Token cleanup

The dark backdrop that appears behind the settings drawer and the defect bottom sheet was a hardcoded color value duplicated in two places. It's now a single named token (`--overlay-bg`) referenced in both. If we ever want to adjust the overlay tint, it's one change.

### Plugin and focus management documentation updated

The router plugin README has been fully rewritten to cover the Drawer and BottomSheet components and their props, the required CSS class names for each, and a complete reference for the focus management rules: when to trap focus, when to return it to the trigger, how Escape key handling works across layered panels, and why children are only mounted while a panel is open. Anyone dropping these components into a new project should have everything they need from the README alone.

---

## April 24, 2026 — Footer link, docs folder, and settings fixes

### GitHub link in the footer now works

The "Fork on GitHub" link at the bottom of the page now points to the actual repo at github.com/mikeyil/a11ytexthelper. It was a placeholder before.

### Docs moved to their own folder

All documentation files — changelog, updates, to-do list, maintenance guide, and contributing guide — live in a `docs/` subfolder now. The README stays at the root where GitHub expects it.

### Disabled AI fields now look consistent

The provider selector and API key input in Settings both dim out when AI assist is turned off. They now look the same — same text color, same border style. Previously the selector appeared slightly different from the input because the browser was treating them differently behind the scenes.

### Page title no longer shows a focus outline

Keyboard focus still moves to the page title internally (for screen reader users navigating to and from Settings), but the visible blue focus ring is no longer drawn around it. It was appearing as an artifact of the focus management and looked unintentional.

---

## April 24, 2026 — Accessibility, security, privacy, performance, SEO, and docs overhaul

### Screen readers now hear copy and reset confirmations

When you click the Copy or Reset button on a defect description or remediation, the app now announces the action to screen readers — "Defect description: Copied to clipboard" or "Possible remediation steps: Reset to original." Before this change, assistive technology users had no way of knowing whether the button did anything. This satisfies a WCAG requirement (4.1.3 Status Messages) that has been in the backlog since the tool launched.

### Dark mode priority badges — fixed

The Critical / High / Medium / Low priority badges in the result list now look correct in dark mode. Previously they showed their light-mode colors (white backgrounds, dark text) regardless of the active theme, which looked jarring on the dark card surface. Each badge now uses a dark-mode-appropriate palette that passes the required contrast ratios.

### Higher-contrast mode support

If you have "Increase Contrast" turned on in your OS accessibility settings, the app now responds with slightly darker muted text and stronger borders. This is automatic — no setting to toggle.

### Fixed: body text size wasn't using the right token

A quiet bug: the body font size was referencing a token that doesn't exist, which meant the browser quietly fell back to its own default. This is now corrected and the font size will behave exactly as designed across all browsers.

### Security headers on Netlify

The app now ships with a full set of security response headers when deployed to Netlify: a Content Security Policy that restricts what scripts, styles, and network connections the page can make; click-jacking protection; MIME-type sniffing prevention; and a restrictive permissions policy (no camera, microphone, geolocation, or payment API access). These apply to the production deployment, not the dev server.

### Privacy disclosure expanded

The AI assist section of Settings now lists exactly what is stored in your browser and what isn't. Four things go into `localStorage`: your theme preference, your search mode, your AI provider choice, and your API key(s). Nothing else — no personal data, no usage data, no corpus content.

### Crawlers blocked

A `robots.txt` file has been added that tells all search engines not to index this deployment. The tool isn't ready for public discovery yet, and this ensures it won't accidentally appear in search results while it's still in development.

### Build output is now split for better caching

The production build now puts React and Fuse.js into separate files from the app code. This means if you update the app (which happens often), your browser only needs to re-download the part that changed — not React and Fuse.js again. Faster repeat loads.

### SEO is ready to switch on

All the SEO infrastructure — page description, social sharing previews (Open Graph, Twitter Card), structured data for search engines, and canonical URL — has been written and placed in the HTML. It's all commented out so crawlers won't see it during development. When Phase 3 launches, enabling it is a matter of uncommenting a block and filling in the real URL.

### Dead code removed

The settings used to open in a modal. That modal was replaced with the current slide-in panel several sessions ago, but the CSS for it was still sitting in the stylesheet doing nothing. It's been removed. Typography utility classes that referenced a font size system we retired were also updated to match the current token names.

### Docs completely overhauled

- **README** — updated project structure, correct corpus filename, added sections on the router and announce plugins, updated deployment instructions to cover Netlify
- **TODO** — every shorthand note expanded into a full, actionable item with enough context to act on it without re-reading the code; a new AI Agent Support section identifies the specific work needed to make the AI Refine feature smarter; a new Internationalization section covers the full i18n plan in detail
- **CHANGELOG** — this entry

---

## April 23, 2026 — Settings as its own page, keyboard focus rules, corpus rename

### Settings is now a real page (and a slide-in panel on mobile)

Settings used to open in a modal. Now it's a full page on desktop and a panel that slides in from the left on mobile. On desktop, navigating to Settings replaces the main search view — just like a real page navigation. On mobile, it slides over without hiding the address bar or creating a scroll trap.

The browser Back button closes Settings. No special handling needed.

### Keyboard focus follows you around the screen

A new internal plugin handles all the rules for where keyboard focus should go when the screen changes. The short version:

- **Click a result** → focus jumps to the top of the defect detail, so you don't have to Tab back down to it
- **Open Settings** → focus jumps to the Settings heading
- **Close Settings** → focus returns to the ⚙ button you clicked to open it
- **Tab key can't escape modals or panels** — it wraps around inside the open layer until you close it

These are all WCAG requirements for keyboard and screen reader users. They're now handled automatically by reusable hooks rather than ad-hoc fixes.

### Font sizes are now larger and consistent

The font size base was raised from 14pt to your browser's default (typically 16px). This makes everything slightly larger and — more importantly — means the app respects whatever font size you've set in your browser preferences (a WCAG requirement).

The number of internal font size options was cut from seven down to four: **small**, **body**, **sub-heading**, and **heading**. Nothing on screen uses a font smaller than 12px.

### Your corpus is yours; a public one is coming

A placeholder file called `corpus.json` has been created for a future public corpus — one that anyone can use. The public deployment ships only the generic version.

---

## April 23, 2026 — Settings redesign, branding, and accessibility pass

### Settings panel — now organized into sections

Settings used to be a flat list. It now has three labeled sections — **Search**, **Appearance**, and **AI Assist** — so it's easier to find what you're looking for, especially as more options get added.

### Theme moved to Settings (Light / Auto / Dark)

The theme toggle was previously a small button in the footer. It's now a set of three clearly labeled chips in the Appearance section of Settings: Light, Dark, and Auto.

**Auto** is the new default. It matches your operating system's light or dark mode setting and updates instantly if you change it — no reload needed.

### Search input — visible label and larger target

"Describe the defect" is now a visible text label above the search input rather than placeholder text. Placeholder text disappears the moment you start typing, which can be confusing. The label stays visible so you always know what the field is for.

The input itself is now taller — about two lines high — and uses a slightly larger font (14pt base). It's easier to click or tap and feels more intentional.

### Accessibility improvements

- **Focus ring** — every interactive element (inputs, buttons, links) now shows a visible purple outline when you navigate with a keyboard. This was missing before.
- **Text contrast** — one of the text colors (used for secondary and hint text) was too light and failed the WCAG contrast test. It's been corrected in both light and dark themes. Every text color on screen now passes at minimum 4.5:1 contrast against its background.
- **Font size base** — the whole app now uses 14pt as its base size. This scales automatically if you've set a larger font in your browser preferences (a WCAG requirement).

### "Nothing Found" empty state

When a search returns no results, you now see a proper empty state: a magnifying glass illustration and a short tip suggesting different search terms, rather than a single line of plain text.

---

## April 23, 2026 — Visual redesign and open source prep

### New look

The title and tagline are now centered at the top of the page and larger — it reads like a tool you made rather than a nav label. The platform toggle (Web / Native) moved below the title where it makes more logical sense. The settings gear stays in the top-right corner.

A footer was added at the bottom of every page with a theme toggle (previously buried in the header), a "Made by Mikey Ilagan" credit, and a "Fork on GitHub" link.

### Better font

The app now uses Noto Sans as its primary font — a Google open-source typeface designed to look good across all languages and platforms. On Fedora/Bazzite systems it gracefully steps down to Cantarell, the GNOME default. No external font service is used; the fonts are bundled with the app.

### Open source groundwork

The project now has an MIT license and a contributing guide. When the GitHub repo goes public, contributors will have everything they need to fork the project and add defect entries.

---

## April 23, 2026 — Design system foundation

The app's colors, font sizes, spacing, and border radii are now all defined as named tokens in one file (`tokens.css`). This means future visual changes happen in one place instead of scattered across components. A separate typography file documents the type scale.

The layout is now properly mobile-first — it works well on a phone and expands gracefully on larger screens. Icon buttons now meet the recommended 44×44px touch target size.

---

## April 23, 2026 — Initial build

First working version of A11yTextHelper. Type a description of a defect, get matching entries from the corpus, pick one, optionally add a location prefix ("Global:", "Cart:", etc.), and copy the text straight into your audit spreadsheet.

AI assist is off by default. Turn it on in Settings, add your API key for the provider of your choice, and the Refine field will rewrite the description and remediation based on your note.
