# About This Build

A11yTextHelper started as a clipboard tool. Type an accessibility defect ID, copy the description and remediation, paste it into a bug report. That's the whole pitch. But somewhere along the way it became a peculiar little project.

---

## The Easter Eggs

Type `pirate`, `pig latin`, `klingon`, or `valyrian` into the search box and the entire UI switches to that language. Every label, button, heading, and WCAG explanation — in character. The pirate locale calls its theme section "The Ship's Hull." The settings panel is "Captain's Quarters." These don't persist to localStorage (you'd be annoyed if you came back the next day and couldn't read the app), so they vanish the moment you save settings or refresh.

The logic for detecting Easter egg input is intentionally asymmetric: if live search is on it fires while you type; if live search is off, it only fires when you hit the search button. That way you can think before committing to Klingon.

## Party Mode

There's a fourth theme called Party. It generates a random accessible color palette on every activation — six semantic color tokens derived from a random hue, computed in HSL so the foreground/background contrast ratios are always at least 4.5:1. While active, every button click plays a sound (a small synthesized blip via the Web Audio API), and typing generates confetti. The confetti and sounds are suppressed when `prefers-reduced-motion` is set.

The party palette is generated fresh each time you switch to it. No two sessions look the same.

## 50+ Languages, Including Some You've Probably Never Heard Of

The app ships UI translations for 50+ languages. The obvious ones (Spanish, French, German, Japanese, Chinese) are there. But also:

- **Palawa kani** — a reconstructed language for Tasmanian Aboriginal peoples, developed from records of seven extinct languages
- **Nāhuatlahtōlli** — Classical Nahuatl, the language of the Aztec empire
- **Nêhiyawêwin** — Plains Cree, written in Canadian Aboriginal Syllabics
- **Diné bizaad** — Navajo
- **Anishinaabemowin** — Ojibwe
- **Ruáingga** — Rohingya. This one gets a special warning modal when selected, because the Rohingya people have endured genocide and forced displacement, the translation was AI-generated without native speaker review, and that's worth naming directly.

Activating a language changes the entire app, not just the chrome. The corpus entries (defect titles, descriptions, remediations) load a locale-specific overlay at runtime. English keywords are preserved on each record in a hidden field so that typing "button" in the Japanese locale still finds the right defects — cross-language Fuse.js search.

## The KoFi Widget Accessibility Patch

The app embeds a Ko-fi donation widget. It's a third-party script that injects its own DOM and is, predictably, not particularly accessible. Rather than just including it and moving on, the app watches for it to mount via MutationObserver, then adds `role="dialog"`, `aria-modal="true"`, `aria-label`, and a full Tab focus trap. The trigger button gets an `aria-label` if it doesn't have one.

It's a little absurd that an accessibility tool ships with an inaccessible widget, so patching it felt necessary.

## Modals That Actually Stay in the Viewport

The settings panel is a drawer that slides in via CSS `translateX`. For months any modal opened from within the settings panel would render in the wrong position — sometimes offscreen, sometimes overlapping incorrectly. The root cause is a CSS quirk: `position: fixed` is calculated relative to the nearest transformed ancestor, not the viewport. Once an ancestor has a `transform`, it becomes the containing block. The fix was `createPortal`, rendering every modal and bottom sheet directly at `document.body`, outside the drawer's transform context entirely.

## The Bottom Sheet Swipe Gesture

On mobile, you can drag the bottom sheet down and release to dismiss it. The gesture only activates if the touch starts within the top 56px of the panel (the chrome area with the handle and close button). During the drag, the sheet translates downward in real time with no CSS transition. If the drag delta exceeds 100px when the finger lifts, the sheet closes. Otherwise it snaps back.

It's about 40 lines of touch event handling. It works like native iOS bottom sheets because it's doing exactly what native iOS bottom sheets do — tracking Y position, translating, checking threshold.

## The Reset Confirmation Threshold

When you edit a defect description and then hit Reset, the app checks whether your edits are significant enough to warrant a confirmation modal. It runs a Levenshtein edit distance calculation and compares the result against the original string length. If more than 70% of the original has been changed, you get a "are you sure?" prompt. Minor typo fixes reset silently.

## Architectural Choices Worth Noting

The router, announcer, and i18n system are each self-contained plugins (`src/plugins/router/`, `src/plugins/announce/`) with barrel exports and READMEs. The idea is that any of them could be lifted out of this project and dropped into another one. The announcer in particular — a live region manager with `assertive`/`polite` priority queuing and automatic clearing — would be useful in almost any accessible React app.

The corpus translation overlay system is designed so that when the app eventually moves to Supabase (Phase 2), only `dataService.js` changes. Everything else — the search hook, the UI, the translation cache — stays the same.

---

Built by Mikey Ilagan.
