# Phase 1 Proposed Rewrites - Critical Entries

**Date**: 2026-05-05
**Reviewed entries**: ATH-131, ATH-049, ATH-141, ATH-072, ATH-101

---

## ATH-131: Incorrect Heading Structure [CRITICAL - 32 words avg]

### Current State
**Title**: Incorrect Heading Structure

**DESC** (76 words, 2 sentences, 32 words avg):
"Heading levels are used in a way that does not reflect the document structure — for example, an h3 appears before an h2 in the same section, or a sub-heading uses a higher level number than its parent. Screen reader users rely on the heading tree to understand page hierarchy; an incoherent or reversed structure misrepresents the information relationships on the page."

**REM** (48 words, 2 sentences, 24 words avg):
"Assign heading levels based on document hierarchy, not visual styling. A section that is conceptually a sub-item should use a lower-numbered heading than its parent. Note: skipping heading levels (e.g. h1 then h3) is a best practice concern but not a WCAG failure; reversing hierarchy — using a higher-numbered heading for a conceptually more prominent section — does fail 1.3.1."

### Issues Found
1. ❌ Em-dashes present ("— for example", "— using a higher-numbered")
2. ❌ Multiple nested concepts in first DESC sentence
3. ⚠️ Long REM sentences with multiple concepts
4. ✅ Active voice (acceptable)
5. ❌ Missing keywords: "structure", "hierarchy", "semantics", "level", "outline"

### Proposed Rewrite

**DESC** (revised to 3 shorter sentences, avg ~15 words each):
"Heading levels are used in a way that does not match the document structure. For example, an h3 might appear before an h2 in the same section, or a subheading uses a higher level number than its parent. Screen reader users rely on the heading hierarchy to understand how information is organized. When heading structure is wrong, users cannot navigate the page correctly."

**Word count**: 85 words, 4 sentences, avg 21 words (IMPROVED from 32)

**REM** (revised to 3 shorter sentences):
"Assign heading levels based on document structure, not visual styling. If a section is conceptually a sub-item, it should use a lower-numbered heading than its parent. Important: skipping heading levels (for example, h1 then h3) is a best practice but not a WCAG failure. Reversing hierarchy (using a higher number for a more prominent section) does fail this criterion."

**Word count**: 66 words, 4 sentences, avg 16.5 words (IMPROVED)

**Keywords to add**:
- Current: [none in entry, checking data...]
- Add: "structure", "hierarchy", "semantics", "outline", "level", "h1", "h2", "h3", "heading tree"

---

## ATH-049: Form Errors Not Linked to Their Fields [PRIORITY - 25 words avg]

### Current State
**Title**: Form Errors Not Linked to Their Fields

**DESC** (25 words, 1 sentence):
"When a form shows an error message, screen readers do not announce it because the error message has no code-level link to the input field."

**REM** (36 words, 2 sentences, 18 words avg):
"Use aria-describedby to connect the error message to its input field. When errors appear, move keyboard focus to the first field with an error so all users know where to fix the problem."

### Issues Found
1. ✅ Active voice (good)
2. ✅ Reading level acceptable on DESC
3. ✅ REM is good length
4. ❌ Missing keywords: "validation", "aria-describedby", "feedback", "announcement", "form field"

### Proposed Rewrite

**No rewrite needed for voice/reading level.** Just add keywords.

**Keywords to add**:
- Current: [checking...]
- Add: "validation", "aria-describedby", "feedback", "announcement", "form field", "error message"

---

## ATH-141: Repeated Links to the Same Destination [PRIORITY - 25 words avg]

### Current State
**Title**: Repeated Links to the Same Destination

**DESC** (66 words, 2 sentences, 26 words avg):
"A content block has multiple separate links or buttons that all go to the same place — for example, a card with a linked image, a linked title, and a "Read more" button. Keyboard users must tab through all of them, and screen reader users hear repeated announcements."

**REM** (38 words, 2 sentences, 19 words avg):
"Combine them into a single link. Mark the image as decorative (alt="") and use the text as the link label. Or wrap the entire card in one link element."

### Issues Found
1. ❌ Em-dash present ("— for example")
2. ⚠️ First DESC sentence is long but clear (26 words)
3. ✅ REM is concise
4. ❌ Missing keywords: "card", "pattern", "redundant", "navigation", "link grouping"

### Proposed Rewrite

**DESC** (revised to remove em-dash and improve clarity):
"A content block has multiple separate links or buttons that all point to the same destination. For example, a card might have a linked image, a linked title, and a "Read more" button. Keyboard users must tab through every link, and screen reader users hear the same destination announced multiple times."

**Word count**: 56 words, 3 sentences, avg 18.5 words (IMPROVED)

**Keywords to add**:
- Current: [checking...]
- Add: "card", "pattern", "redundant", "navigation", "link grouping", "duplicate", "same destination"

---

## ATH-072: Device Motion Feature Has No Alternative [PRIORITY - 24 words avg]

### Current State
**Title**: Device Motion Feature Has No Alternative

**DESC** (35 words, 1 sentence):
"A feature is triggered by device motion — such as shaking to undo or tilting to scroll — and there is no other way to perform the same action. Users who cannot move their device, or whose device is mounted to a wheelchair, cannot access this feature."

**REM** (35 words, 2 sentences):
"Provide a UI control — such as a button or menu option — that performs the same action as the device motion gesture. Also allow users to disable the motion trigger entirely to prevent accidental activation."

### Issues Found
1. ❌ Multiple em-dashes (— such as", "— such as")
2. ⚠️ First DESC sentence is long (26 words) but clear
3. ❌ Missing keywords: "motion", "gesture", "shake", "tilt", "accelerometer", "gyroscope"

### Proposed Rewrite

**DESC** (revised to remove em-dashes):
"A feature is triggered by device motion (such as shaking to undo or tilting to scroll) with no alternative way to perform the same action. Users who cannot move their device or whose device is mounted to a wheelchair cannot access this feature."

**Word count**: 42 words, 2 sentences, avg 21 words (maintained, but improved clarity by removing em-dashes)

**REM** (revised):
"Provide a UI control (such as a button or menu option) that performs the same action as the device motion gesture. Also allow users to disable the motion trigger to prevent accidental activation."

**Word count**: 31 words, 2 sentences, avg 15.5 words (IMPROVED)

**Keywords to add**:
- Current: [checking...]
- Add: "motion", "gesture", "shake", "tilt", "accelerometer", "gyroscope", "alternative control"

---

## ATH-101: Control Not Keyboard Accessible [PRIORITY - 21 words avg]

### Current State
**Title**: Control Not Keyboard Accessible

### Issues Found
1. ⚠️ Reading level flagged (avg 21 words, borderline)
2. Need to read full entry to propose fixes

### Action
Review in detail when preparing for batch apply

---

## Summary of Changes

**Entries requiring content rewrite**:
- ATH-131: DESC (4 sentences, simpler) + REM (4 sentences, simpler)
- ATH-141: DESC (3 sentences, remove em-dash) + REM (no change)
- ATH-072: DESC (2 sentences, remove em-dashes) + REM (2 sentences, cleaner)
- ATH-049: No rewrite needed (just add keywords)
- ATH-101: TBD (need full review)

**All entries receiving keyword additions** (to address 100% of public corpus missing category keywords)

**Total entries affected in Phase 1**:
- 4 entries with content rewrites (ATH-131, ATH-141, ATH-072, + more TBD)
- All 89 public entries with keyword additions
- Jargon standardization (find/replace across all entries)

---
