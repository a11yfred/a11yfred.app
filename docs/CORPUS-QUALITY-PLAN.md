# Corpus Quality Plan

Checklist for reviewing and cleaning corpus entries, both when adding new entries and during
periodic re-passes. Applies to `personal-corpus.json` and `corpus.json`.

---

## Backups

Before any editing session that touches corpus files, write a dated backup:

```bash
cp src/data/personal-corpus.json src/data/personal-corpus-backup-YYYY-MM-DD.json
```

Use a `b` suffix (e.g., `2026-05-07b`) if a second session runs on the same day.
Backups live in `src/data/` and are gitignored.

---

## JSON Field Order

Every entry must follow this field order exactly:

```text
id, sc, title, wcagLevel, wcagVersion, severity, platform,
desc, fix, sourceCredits, keywords, related, scLabel, links
```

- `id` must always be first.
- `title` must always be second.
- Entries where `id` appears last or mid-object must be normalized before committing.

Validate with:

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('src/data/personal-corpus.json','utf8'));
const bad = d.filter(e => Object.keys(e)[0] !== 'id');
console.log('id-not-first count:', bad.length, bad.map(e => e.id));
"
```

---

## SC and WCAG Level Accuracy

### SC mapping rules

- Look up the SC number in the WCAG 2.2 spec before assigning.
- `sc` must match `scLabel` exactly (number, name, level).
- `wcagLevel` must match the level in `scLabel` (A, AA, or AAA).
- `wcagVersion` must be the version that introduced the SC (2.0, 2.1, or 2.2).

### Common mismatches to check

- SC 1.2.1 = Audio-only and Video-only (Level A). SC 1.2.2 = Captions (Level A). These are distinct.
- SC 1.4.13 = Content on Hover or Focus. Level AA, not AAA.
- SC 2.4.11 = Focus Not Obscured (Minimum). Level AA. Name is not "Focus Appearance".
- SC 2.4.12 = Focus Not Obscured (Enhanced). Level AAA.
- SC 3.2.6 = Consistent Help. Level A (WCAG 2.2).
- SC 3.3.7 = Redundant Entry. Level A (WCAG 2.2).

### When to blank sc

If the primary failure cannot be tied to a single SC (best practice, multi-SC issue, or
UX concern with no direct mapping):

- Set `sc` and `scLabel` to `""`.
- Set `severity` to `"Best Practice"`.
- Move all relevant SCs to `related`.

---

## Primary SC vs. Related SC

The `sc` field should name the SC that most directly fails. Use `related` for SCs that
are implicated but secondary.

### Common patterns

- Labeling failures: primary `3.3.2 Labels or Instructions`, related `4.1.2 Name, Role, Value`.
- Modal/dialog structure: primary `1.3.1 Info and Relationships`, related `4.1.2`, `2.1.2`.
- Keyboard focus removed by script: primary `2.1.1 Keyboard`, related includes `2.4.3 Focus Order`
  and `2.4.11 Focus Not Obscured (Minimum)`.
- Sticky header obscuring focus: primary `2.4.11 Focus Not Obscured (Minimum)`, related includes
  `2.4.12 Focus Not Obscured (Enhanced)` and `2.4.7 Focus Visible`.
- Infinite scroll blocking footer: primary `2.1.1 Keyboard`, related includes `2.4.1 Bypass Blocks`.
- Session or timeout entries: add `4.1.3 Status Messages` to related when the failure
  involves missing feedback to users.
- Help mechanism consistency: add `1.3.1 Info and Relationships` to related.
- Reading order or landmark failures: add `1.3.1 Info and Relationships` to related.
- Keyboard entries for native apps: add `2.4.3 Focus Order` and `2.4.7 Focus Visible` to related.

---

## Platform Field

- `"web"` for browser-only issues.
- `"native"` for iOS/Android-only issues.
- `"both"` only when the defect pattern applies equally to web and native with the same fix logic.
- SC 2.5.x (Pointer) failures are web. Do not mark them `"both"` unless there is a specific
  native equivalent described in the fix.

---

## sourceCredits Ordering

Always follow this order:

1. W3C WAI
2. WCAG
3. WAI-ARIA APG
4. WebAIM
5. Deque University / Deque axe
6. Appt
7. MDN
8. Other organizations
9. Individual experts, alphabetical by last name (e.g., Bailey, Eggert, Groves, O'Hara, Roselli)

---

## Understanding Links

- Link text format: `Understanding X.X.X Title (Level Y)`
- URL pattern: `https://www.w3.org/WAI/WCAG22/Understanding/<slug>.html`
- SC name in link text must match the official WCAG 2.2 name, not draft names.
- `2.4.11`: slug is `focus-not-obscured-minimum`, name is "Focus Not Obscured (Minimum)".
- `2.4.12`: slug is `focus-not-obscured-enhanced`, name is "Focus Not Obscured (Enhanced)".

---

## Severity Range Language in desc

Severity ranges in `desc` are acceptable when the severity genuinely varies by context.
Write them authoritatively, not as schema caveats. Pattern:

> When [condition A], the failure is Critical; when [condition B], the failure is High.

Do not write: "Severity ranges from X to Y depending on..."

---

## desc Field

- **Defect-first:** System as subject. What the system does wrong, not what the user experiences.
  - Wrong: "Screen reader users cannot determine the state of..."
  - Right: "The expanded or collapsed state is not communicated to assistive technology."
- **1-3 sentences** for single-platform entries. Multi-platform entries may be longer.
- **No code in desc** unless the code token IS the defect subject (the specific tag, attribute, or
  value that is wrong). Mechanism explanation belongs in `fix`.
- **WCAG terminology:**
  - "focus order" (SC 2.4.3), not "tab order"
  - "focus indicator", not "focus ring"
  - Cite SCs inline as "SC X.X.X", not "WCAG X.X.X"
- **Platform framing:**
  - AT names (VoiceOver, TalkBack, Switch Control, Switch Access, Voice Control, Voice Access) imply
    their platform. Do not add "on iOS" or "on Android" alongside an AT name.
  - For multi-platform entries, describe the cross-platform behavior first, then platform-specific
    behavior if needed.
- **No speculative language.** Avoid "may", "might", "could", "can cause". State the concrete
  failure. Avoid "Screen reader users build expectations..." or "users may find it difficult..."
- **No requirement statements** ("must", "is required to", "developers need to"). The `desc` states
  what is wrong; the `fix` states what to do.
- **Pronouns:** Use "they/them" for third-person gender-neutral references. Prefer "users" (plural)
  over "the user" (singular) when referring to the general population.
- Hyphenate "on-screen" consistently.
- "When" conditional openers are acceptable only when the condition scopes the defect precisely.

---

## fix Field

- **Start with an action verb.** "Add", "Move", "Set", "Provide", "Make", "Give", "Verify",
  "Confirm", "Remove", "Replace", "Use", "Wrap", "Bind", "Separate", "Close".
- **No "Ensure" as a standalone sentence opener.** "Ensure X" → rewrite as a direct imperative.
  - Wrong: "Ensure the modal receives focus on open."
  - Right: "Move focus to the first focusable element inside the modal on open."
- **Mid-fix conditionals are acceptable:** "If the component must remain open, ensure the user can
  still reach footer content." The rule only targets standalone "Ensure X." sentences.
- **No "should" as a hedge.** "X should Y" → "X must Y" or restructure as an imperative.
  Technical uses are acceptable: "should not be", "should remain", "should use".
- **"focus order" not "tab order"** in contexts not specifically about `tabindex` values.
- **"focus indicator" not "focus ring".**
- **"the user" only in scenario-specific context** (when the user, after the user, if the user).
  Do not use "the user" to refer to the general population of users. Use "users" or restructure.
- **No "note that".** Convert to a direct statement.
- **SC citations:** "SC X.X.X" not "WCAG X.X.X" when citing inline.
- Platform sections in fix use "iOS:" and "Android:" as section headers for implementation steps.

---

## SC Cross-Reference Keywords

When an SC number is cited in `desc` or `fix` (other than the entry's own primary SC), add that SC
number as a keyword. This enables cross-referencing in search results.

Validate with:

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('src/data/personal-corpus.json','utf8'));
const pat = /\bSC (\d+\.\d+\.\d+)\b/g;
d.forEach(e => {
  const text = [e.desc||'',e.fix||''].join(' ');
  const mentioned = new Set(); let m; pat.lastIndex=0;
  while((m=pat.exec(text))!==null){if(m[1]!==e.sc)mentioned.add(m[1]);}
  const missing=[...mentioned].filter(s=>!(e.keywords||[]).includes(s));
  if(missing.length)console.log(e.id,'missing:',missing.join(', '));
});
"
```

---

## Voice and Tone

- No em-dashes anywhere. Use commas, periods, parentheses, or colons.
- No speculative language about screen reader users: avoid "Screen reader users build
  expectations..." or "may find it difficult..." State the concrete failure instead.
- Avoid mid-sentence colons where a parenthetical works better.
  Wrong: "A component: such as a grid, must..."
  Right: "A component (such as a grid) must..."
- "Interactive control" is not allowed in titles. "interactive control/controls" is acceptable in
  `desc` and `fix` body text.
- Article before code: use "an `aria-live`", not "a `aria-live`".

---

## Conflicting Label Guidance

When advising about `aria-label` vs. visible `<label>`:

- State that `aria-label` overrides the visible label in the accessible name calculation.
- Instruct removal of `aria-label` when a visible `<label>` already exists.
- Do not simultaneously say "remove aria-label" and "aria-label will override it" in a
  way that implies `aria-label` is the mechanism to keep.

---

## Corpus Entry Titles

- AP title case.
- No inline code in titles.
- Noun phrase, 4-8 words.
- Append `(Native App)` when the entry is native-only.
- Avoid "Interactive Control" as a phrase; use "Control" or the specific element type.
- "Contrast Ratio" and "Alt Text" are acceptable in titles.
- Qualifier vocabulary. Use these canonical forms:
  - "Missing" not "Lacks", "Has No", or "Exposes No"
  - "Not Programmatically Determined" for state and value failures (SC 4.1.2)
  - "Not Programmatically Associated" for label relationship failures (SC 1.3.1, 3.3.2)
  - "Not Exposed" for AT-visibility failures
- Within a same-SC cluster, align qualifier vocabulary across all entries.

---

## Re-pass Trigger

Run this checklist whenever:

- More than 10 new entries are added in a session.
- A batch of entries is imported from `corpus_src/`.
- A WCAG SC name or level is found to be wrong anywhere in the file.
- A terminology change is applied globally (e.g., "remediation" → "suggested fix").

After a re-pass, write a dated backup and note the pass in `docs/MAINT-LOG.md`.
