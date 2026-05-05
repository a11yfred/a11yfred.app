# Phase 1 Corpus Fixes - Public Corpus Quick Wins

**Date**: 2026-05-05
**Phase**: 1 - High-impact, quick-win fixes for public corpus
**Scope**: Jargon standardization, reading level fixes, keyword additions

---

## Fix Categories

### 1. JARGON STANDARDIZATION (Apply across all entries)

**Standardization Rules:**
- "keyboard user" / "keyboard users" → "keyboard-only user" / "keyboard-only users"
- "keyboard-only user" / "keyboard-only users" (primary form)
- "screen reader" / "screen readers" → "screen reader" (singular primary, but plural acceptable)
- "accessible label" → "accessible name" (primary term per WCAG)
- "ARIA landmark" / "aria landmark" → "landmark" (primary, simple form)
- "trap focus" → "focus trap" (primary form)
- "focus trapping" → "focus trap" (primary form)

**Impact**: Fixes jargon consistency in ~34 public entries with mixed variants

---

## 2. CRITICAL ENTRIES - VOICE & READING LEVEL FIXES

### ATH-001: Unlabeled Button or Link
**Current issues**: Keywords mostly complete; jargon consistency needed

**Jargon fix needed**: None currently (already uses "screen reader" singular)

**Status**: Accept as-is; already strong entry

---

### ATH-127: Focus Not Managed
**Current sentence lengths**: 2 sentences (16 + 18 words avg = 17 words = acceptable)

**Passive voice issue**: "focus stays where it was" (minor, acceptable for clarity)

**Reading level**: Acceptable (avg 17 words)

**Keywords current**: Good coverage (modal, dialog, drawer, focus, keyboard, tab order, trap)

**Missing keywords**: "popover", "disclosure", "offcanvas", "menu", "submenu"

**Related links missing**: ATH-140 (Focus Visible), ATH-146 (Focus Indicator)

**Proposed changes**:
- Add keywords: "popover", "disclosure", "offcanvas", "menu", "submenu", "focus trap"
- Add related: "2.4.7 Focus Visible (Level AA)", "2.1.1 Keyboard (Level A)"

---

### ATH-128: Focus Indicator Missing or Not Visible
**Current sentence lengths**: 2 sentences (17 + 24 words avg = 20.5 = slightly high)

**Passive voice**: "cannot see which element is focused" (acceptable); "may be removed" (passive)

**Reading level**: Borderline at 20.5 words avg

**Keywords current**: Good coverage (focus, keyboard, outline)

**Missing keywords**: "visibility", "contrast", "outline", "ring"

**Related links missing**: ATH-130 (Focus State), ATH-140 (Focus Visible)

**Proposed changes**:
- Rewrite: "Keyboard users cannot see which element has focus. The default focus outline may be removed, or the custom focus style is too faint to see clearly." (KEEP CURRENT - already clear)
- Add keywords: "visibility", "outline required", "ring", "custom focus style"
- Add related: "1.4.11 Non-text Contrast (Level AA)"

---

### ATH-101: Control Not Keyboard Accessible
**Current sentence lengths**: Needs measurement

**Reading level issue**: FLAGGED as "Sentence too long for ESL (avg 21 words)"

**Passive voice**: "be used" appears in remediation

**Proposed fix**:
Break long remediation into shorter sentences focused on each platform.

---

### ATH-131: Accessible Name From Alt Text
**Reading level issue**: FLAGGED as "Sentence too long for ESL (avg 32 words)" - HIGHEST

**Passive voice**: "are used"

**Proposed fix**: Major rewrite needed - break into smaller conceptual chunks

---

### ATH-141: Link Text is Generic
**Reading level issue**: FLAGGED as "Sentence too long for ESL (avg 25 words)"

**Proposed fix**: Simplify and break sentences

---

---

## 3. KEYWORD ADDITIONS BY ENTRY TYPE

Based on automation findings (ALL 89 public entries missing category keywords), add these systematically:

**Button/Link entries** (ATH-001, ATH-101, etc.):
- Add: "click", "interactive", "operable", "control", "element"

**Dialog/Modal entries** (ATH-127, etc.):
- Add: "popover", "disclosure", "offcanvas", "menu", "submenu"

**Focus entries** (ATH-128, ATH-130, etc.):
- Add: "visibility", "outline", "ring", "indicator", "state"

**Form entries** (ATH-034, etc.):
- Add: "field", "input", "validation", "required", "error"

**Image entries** (ATH-011, etc.):
- Add: "alt text", "alt attribute", "description", "photo", "picture", "icon"

---

## 4. READING LEVEL FIXES PRIORITY

**Highest Priority** (avg 25+ words):
- ATH-131 (32 words) - CRITICAL
- ATH-049 (25 words)
- ATH-141 (25 words)
- ATH-072 (24 words)

**High Priority** (avg 21-24 words):
- ATH-101, ATH-008, ATH-009, ATH-136, ATH-138, ATH-068, ATH-073, ATH-156, ATH-077, ATH-080

**Process**:
1. Read entry text
2. Identify nested clauses or multiple concepts per sentence
3. Break into 2-3 shorter sentences (target: 12-18 words each)
4. Preserve technical accuracy
5. Keep jargon consistent (use standardized terms)

---

## 5. NEXT STEPS (After fixes applied)

1. Apply jargon standardization (find/replace)
2. Apply keyword additions
3. Rewrite critical high-reading-level entries (ATH-131, ATH-049, ATH-141, ATH-072)
4. Verify all changes don't break links or schema
5. Re-run audit-corpus.mjs to verify improvements
6. Commit as: "fix: corpus Phase 1 — jargon consistency, reading level, keywords"

---
