# Updates

Plain-language record of what changed and why. For technical details see `CHANGELOG.md`.

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
