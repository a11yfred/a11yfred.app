# Comprehensive Corpus Audit - Detailed Findings

**Date**: 2026-05-05
**Auditor**: Claude (automated + manual)
**Scope**: Public Corpus (89 entries) + Personal Corpus (126 entries)

---

## Executive Summary

### Automated Scan Results

**PUBLIC CORPUS (89 entries)**
- Passive voice: 38 entries (43%)
- Reading level too complex: 26 entries (29%)
- Jargon inconsistencies: 34 entries (38%)
- Missing keywords: ALL 89 entries (100%)
- Missing related links: 54 entries (61%)

**PERSONAL CORPUS (126 entries)**
- Passive voice: 66 entries (52%)
- Reading level too simple: 17 entries (13%)
- Jargon inconsistencies: 29 entries (23%)
- Missing keywords: ALL 126 entries (100%)
- Missing related links: 90 entries (71%)

---

## Key Findings by Category

### 1. Jargon Consistency Issues

Most common mixed variants across both corpora:
- **"keyboard user"** vs **"keyboard-only user"** vs **"keyboard navigation"** (inconsistent)
- **"screen reader"** vs **"assistive technology"** (use screen reader as primary)
- **"accessible name"** vs **"accessible label"** (standardize to "accessible name")
- **"landmark"** vs **"ARIA landmark"** (standardize to "landmark")
- **"focus trap"** vs **"trap focus"** (standardize to "focus trap")

**Action**: Create jargon guide and apply standardization pass

---

### 2. Passive Voice Issues

**PUBLIC CORPUS** (38 entries with passive voice patterns)
- Most common: "is X + -ed" pattern (is focused, is hidden, is announced)
- Examples: "keyboard focus stays where it was" → "keyboard focus remains on the original element"
- Impact: Violates "active voice" requirement for ESL readability

**PERSONAL CORPUS** (66 entries, higher rate)
- More acceptable in personal voice, but still could be tightened
- Examples: "be restructured" → "restructure", "is open" → "opens"

**Action**: Target 38 public entries for voice conversion, 20+ priority personal entries

---

### 3. Reading Level Calibration

**PUBLIC CORPUS**
- 26 entries exceed ESL threshold (avg sentence >20 words)
- Highest: ATH-131 (avg 32 words), ATH-141 (avg 25 words)
- Issue: Complex nested clauses, too many per-paragraph concepts

**PERSONAL CORPUS**
- 17 entries below target (avg sentence <10 words)
- Lowest: ATH-029 (avg 7 words), ATH-032 (avg 7 words), ATH-003 (avg 7 words)
- Issue: Too terse, loses technical depth expected of personal corpus

**Action**: 
- Public: Break long sentences, simplify explanations
- Personal: Add more detail, expand technical context

---

### 4. Missing Keywords

**ALL 215 entries missing category keywords**

Common patterns:
- ATH-001 (button/link related): missing `dialog`, `navigation`, `image`
- ATH-128 (focus related): missing `button`, `form`, `dialog`, `navigation`
- ATH-011 (heading related): missing `button`, `form`, `dialog`, `image`

These are "category" keywords — not metadata tags, but likely search terms.

**Action**: Add element/component-type keywords systematically

---

### 5. Missing Related Links

**PUBLIC CORPUS**: 54 entries (61%) with suggested cross-links
**PERSONAL CORPUS**: 90 entries (71%) with suggested cross-links

Example chains:
- ATH-001 (unlabeled control) → ATH-010, ATH-134, ATH-155 (all about labeling)
- ATH-127 (focus not managed) → ATH-140, ATH-146 (focus-related)
- ATH-128 (focus indicator missing) → ATH-130 (focus visible)

**Action**: Review and apply suggested related links (verify WCAG SC overlap)

---

## Recommended Fix Priority

### PHASE 1: High-Impact, Quick Wins (Public Corpus)
1. **Jargon standardization**: Find/replace for "keyboard user", "screen reader", "accessible name"
2. **Reading level**: Target 26 complex entries, break into shorter sentences
3. **Keywords**: Add 3-5 category keywords to each entry

**Estimated effort**: 4-6 hours
**Impact**: ~70% of findings addressed

### PHASE 2: Voice & Tone (Both Corpora)
1. **Public**: Convert 38 passive voice entries to active
2. **Personal**: Deepen 17 entries below 10 word average, add technical detail
3. **Related links**: Apply 50+ suggested cross-links to both corpora

**Estimated effort**: 6-8 hours
**Impact**: Voice consistency, discoverability

### PHASE 3: Final Polish (Both Corpora)
1. Manual review of rewritten entries
2. Spot-check jargon consistency across related entries
3. Verify reading level calibration

**Estimated effort**: 2-3 hours

---

## Manual Audit Deep-Dive (Starting with Critical Priority Entries)

### ATH-001: Unlabeled Button or Link [CRITICAL]

**Current State:**
- Desc: "A button, link, or custom native control does not have an accessible name. Screen readers announce it as \"button\" or \"link\" with no context, so users cannot tell what it does. On native platforms, custom UIView or View subclasses may lack accessibilityLabel (iOS) or contentDescription (Android)."
- Rem: "For web: add aria-label, aria-labelledby, or a visible text label to every interactive control. For native iOS: set .accessibilityLabel on custom views; use accessibilityIdentifier only for testing, not for the label users hear. For native Android: set android:contentDescription on all interactive elements; do not rely on the view ID as a label."

**Issues Found:**
1. ✅ Active voice (acceptable)
2. ⚠️ Reading level: Some nested concepts, but acceptable
3. ❌ Missing keywords: `dialog`, `navigation`, `image`, `modal`
4. ❌ Jargon: Mixed "screen reader/readers"
5. ❌ No related links (could link to ATH-010, ATH-134, ATH-155)

**Proposed Changes:**
- Add keywords: `modal close`, `menu button`, `dialog trigger`
- Standardize: "Screen readers announce..." (already singular)
- Add related: Cross-link to "Accessible Name Computation" entries

---

### ATH-127: Focus Not Managed [CRITICAL]

**Current State:**
- Desc: "When a modal, dialog, or drawer opens, keyboard focus stays where it was. Screen reader and keyboard users cannot easily reach the new content."
- Rem: "Move focus to the first element inside the new content when it opens. Use tabindex=\"-1\" on a heading if the first focusable element comes later. Trap focus inside while it is open, and return focus to the trigger button when it closes."

**Issues Found:**
1. ⚠️ Passive: "focus stays where it was" (could be: "focus does not move")
2. ✅ Reading level acceptable
3. ❌ Missing keywords: `form`, `navigation`, `image`, `menu`
4. ❌ Jargon: Mixed "keyboard user/users"
5. ❌ Missing related: ATH-140, ATH-146

**Proposed Changes:**
- Passive fix: "focus does not move to the new content"
- Add keywords: `popover`, `disclosure`, `offcanvas`
- Standardize jargon
- Add related links to other focus-management entries

[... Continue with 10-15 more critical entries in this format ...]

---

## Next Steps

1. Review this audit document
2. Approve fix strategy and priority order
3. Generate JSON batch file with proposed changes
4. Apply rewrites entry-by-entry with verification
5. Re-audit to verify fixes

