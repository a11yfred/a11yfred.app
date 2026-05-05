# Phase 2 Plan - Voice, Tone & Jargon Standardization

**Date**: 2026-05-05
**Phase**: 2 - Voice/tone conversion and jargon standardization
**Status**: Planning (ready to execute after Phase 1 verification)

---

## User Requirements (Clarified)

### Public Corpus Voice Requirements
- **Target**: Plain language, ESL/middle school English
- **Standard**: Simple sentences, clear explanations
- **Jargon**: Explain technical terms on first use, use consistent terminology
- **Tone**: Helpful, educational, accessible to non-experts
- **Examples**: "Keyboard-only users", "screen reader users", "accessible name" (not "accessible label")

### Personal Corpus Voice Requirements  
- **Target**: Authentically sounds like Mikey
- **Standard**: Technical depth, casual/direct tone, assume audience knowledge
- **Jargon**: Can use technical terms freely, but should be consistent
- **Tone**: Expert, concise, practical insights
- **Quality**: Prioritize sounding authentic over simplification

---

## Phase 2 Tasks

### Task 1: Jargon Standardization (All Entries)

**Find/Replace across PUBLIC CORPUS:**

1. "keyboard user" → "keyboard-only user"
   - Pattern: \bkeyboard users?\b → "keyboard-only user" / "keyboard-only users"
   - Entries affected: ~20 in audit findings

2. "screen reader" → "screen reader" (keep singular, but standardize plural)
   - Pattern: "screen readers" (acceptable, but note mixed usage)
   - Goal: Use "screen reader users" not just "screen readers"

3. "accessible label" → "accessible name"
   - Pattern: Replace exact phrase
   - Affects: Form labels, heading text, etc.

4. "ARIA landmark" or "aria landmark" → "landmark"
   - Pattern: \bARIA landmark\b or \baria landmark\b
   - Affects: Landmark region entries

5. "trap focus" or "focus trapping" → "focus trap"
   - Pattern: Standardize to "focus trap"
   - Affects: Dialog/modal entries

6. "focus handling" → "focus management"
   - Pattern: Standardize to "focus management"

**Find/Replace across PERSONAL CORPUS:**
- Apply same standardization for consistency
- Then review for voice fit (does it sound like Mikey?)

### Task 2: Passive Voice Conversion (Priority Public Entries)

**Public corpus: 38 entries with passive voice patterns**

**High-priority rewrites** (from CORPUS_AUDIT_FINDINGS):
- ATH-127: "focus stays where it was" → "focus remains on the original element" or "focus does not move"
- ATH-128: "is focused" / "be removed" → "has focus" / "remove"
- ATH-101: "be used" → "use" or "users can"
- ATH-130: "is hidden" → "hides"
- ATH-131: "are used" / "is organized" → "use" / "organize"
- ATH-132: "be avoided" → "avoid"
- ATH-133: "are required" → "require"
- ATH-018: "is announced" → "announce"

**Pattern for conversion**:
- Identify be-verb + past participle patterns
- Rewrite with active subject and verb form
- Maintain technical accuracy and meaning
- Target: Simple, direct sentences

**Personal corpus: 66 entries with passive voice**
- Review for voice fit first (passive might be intentional for Mikey's style)
- Convert only if clearly verbose or awkward
- Prioritize clarity over voice authenticity

### Task 3: Missing Related Links (Both Corpora)

**Public corpus: 54 entries missing related links**
**Personal corpus: 90 entries missing related links**

**Strategy**:
- For each suggested missing link from audit (e.g., ATH-001 could link to ATH-010, ATH-134, ATH-155)
- Verify suggested entry is actually related (same SC or closely related)
- Add to `related` array if appropriate

**Example**:
```json
"related": [
  "1.1.1 Non-text Content (Level A)",
  "4.1.2 Name, Role, Value (Level A)"  // <- add if suggesting link to same SC
]
```

**Note**: The audit suggests cross-linking by SC match. We should verify these are actually related concepts, not just same SC.

### Task 4: Keyword Additions (ALL 215 entries)

**All 89 public + 126 personal missing category keywords**

**Systematic approach**:
1. Review entry title and content
2. Add relevant category keywords:
   - **Element types**: button, form, dialog, image, link, heading, etc.
   - **Behaviors**: navigation, interaction, motion, focus, etc.
   - **Platforms**: web, iOS, Android, mobile, etc.
   - **Specifics**: validation, error, announcement, highlight, etc.

**Example**:
- ATH-001 (Unlabeled Button): Already has good keywords (button, link, form, etc.)
- ATH-127 (Focus Not Managed): Should add "popover", "menu" if not present

---

## Execution Order

1. **Jargon standardization** (find/replace, lowest risk)
2. **Passive voice conversion** (public corpus priority, manual rewrites)
3. **Related links** (structured additions, verify each)
4. **Keyword additions** (systematic by entry type)

---

## Voice Quality Check

After all fixes applied:

**Public corpus verification**:
- ✅ No em-dashes
- ✅ Avg sentence < 20 words
- ✅ Jargon explained or consistent
- ✅ Simple sentence structure (no heavy nesting)
- ✅ Active voice preferred

**Personal corpus verification**:
- ✅ Sounds like Mikey (direct, technical, knowledgeable)
- ✅ Jargon used consistently
- ✅ No unnecessary simplification
- ✅ Authentic voice preserved

---

## Estimated Effort

- Jargon standardization: 2-3 hours (find/replace + verification)
- Passive voice conversion (public): 3-4 hours (manual rewrites)
- Related links: 2-3 hours (verification + additions)
- Keyword additions: 2-3 hours (systematic review)
- Verification re-audit: 1 hour

**Total Phase 2**: 10-14 hours

---
