# Source Citation Audit - Findings & Recommendations

**Status**: In progress - auditing 79 root-domain links across 124 entries

## Key Finding: Title Mismatch Problem

Many referenced article titles in personal-corpus.json **do not exist as exact published articles** on expert sites. Examples:
- "aria-hidden Anti-Patterns" (Roselli) - not a published article title
- "Data Visualization & Accessibility" (Eric Bailey) - not found on his site
- "Keyboard Navigation & Focus Failures" (Roselli) - generic topic, not specific article
- Generic "Adrian Roselli" (ATH-046, ATH-047, ATH-050) - no article title at all

## Approach: Three Categories

### Category A: Remove Credit Entirely
**When**: Article title is generic or doesn't reference a real published article AND the content doesn't clearly require that specific author's work

**Examples to remove:**
- ATH-046: Generic "Adrian Roselli" (no article title, just his name)
- ATH-047: Generic "Adrian Roselli" (no article title)
- ATH-050: Generic "Adrian Roselli" (no article title)
- ATH-039: Generic "WebAIM - Chart Accessibility" (WebAIM has no dedicated chart article)
- ATH-039: Generic "Eric Bailey - Data Visualization & Accessibility" (not a published article)

### Category B: Replace with Verified Article
**When**: We find an actual published article that matches the topic

**Examples found:**
- ATH-002: "Patrick H. Lauke - Focus & Keyboard Accessibility" → Could use [Where to Put Focus When Opening a Modal Dialog](https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html) (Roselli) or keep searching Lauke's site
- ATH-038: "Adrian Roselli - Keyboard Traps & Focus Management" → Use [Dialog Focus in Screen Readers](https://adrianroselli.com/2020/10/dialog-focus-in-screen-readers.html)
- ATH-105: "Adrian Roselli - Modal Dialogs" → Use [Where to Put Focus When Opening a Modal Dialog](https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html)

### Category C: Flag for Manual Review
**When**: Article title seems plausible but we can't verify it exists, or our entry doesn't clearly reflect what the expert actually published

**Examples:**
- Many Roselli entries on form accessibility, keyboard nav, ARIA - need deeper matching against actual article titles
- Scott O'Hara and others - systematic search needed

## Verified Adrian Roselli Articles (from searches)

Found URLs:
- Modal dialogs: https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html
- Dialog focus: https://adrianroselli.com/2020/10/dialog-focus-in-screen-readers.html
- ARIA misuse: https://adrianroselli.com/2020/07/aria-grid-as-an-anti-pattern.html
- Skip links (discussion): https://adrianroselli.com/2020/06/accessibe-will-get-you-sued.html
- Form accessibility: https://adrianroselli.com/2024/02/dont-disable-form-controls.html
- aria-hidden (discussed): https://adrianroselli.com/2021/06/using-css-to-enforce-accessibility.html
- Tooltip (hover): https://adrianroselli.com/2010/08/more-on-hover-vs-touch.html

## Next Steps

1. **Immediate**: Remove generic credits (3 entries: ATH-046, 047, 050)
2. **Immediate**: Remove unverifiable article references (ATH-039 WebAIM & Bailey)
3. **Systematic**: Match remaining entries against actual published articles
   - Adrian Roselli (40 remaining after removals)
   - Scott O'Hara (29)
   - Eric Bailey (22)
   - Others (15+)

## Recommendation to User

I propose we:
1. **Start**: Remove the 3 generic Roselli credits immediately
2. **Then**: Go through each expert systematically, doing web searches for actual article titles
3. **For each entry**: Either find the published article URL or remove the credit and flag if needed
4. **Decision point**: When we can't verify an article, decide: keep credit as-is (generic), remove credit, or find different expert?

Would you like me to proceed with this systematic audit?

