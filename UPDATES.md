# Updates

Plain-language record of what changed and why. For technical details see `CHANGELOG.md`.

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

The defect data file has been renamed from `defects.json` to `mikeys-corpus.json` to make it clear it's a personal data source. A placeholder file called `corpus.json` has been created for a future public corpus — one that anyone can use without the personal entries. When both exist, the public deployment will only ship the generic version.

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
