# Source Citation Fixes for personal-corpus.json

## Status Summary

### Completed

#### 1. W3C/WAI Sources (111 entries fixed)
- **Status**: COMPLETE
- **Change**: Converted generic "W3C/WAI" source names to proper "Understanding SC X.X.X: [Title] (Level Y)" format
- **Example**:
  - Before: `"name": "W3C/WAI"`
  - After: `"name": "Understanding SC 4.1.2: Name, Role, Value (Level A)"`
- **Implementation**: Automated extraction from URL slug + SC label, with comprehensive WCAG title mapping

#### 2. Expert Author URLs (30+ entries fixed)
- **Status**: SUBSTANTIAL PROGRESS
- **Experts with URLs matched**:
  - Adrian Roselli: 13 articles
  - Marcy Sutton: 5 articles  
  - Eric Bailey: 3 articles
  - Heydon Pickering: 2 articles
  - Scott O'Hara: 1 article

- **Examples of matched articles**:
  - "Adrian Roselli - Where to Put Focus When Opening a Modal Dialog" → https://adrianroselli.com/2025/06/where-to-put-focus-when-opening-a-modal-dialog.html
  - "Marcy Sutton - Focus Testing & Keyboard Accessibility" → https://marcysutton.com/testing-accessibility/
  - "Eric Bailey - aria-label is a code smell" → https://ericwbailey.website/published/aria-label-is-a-code-smell/
  - "Heydon Pickering - Inclusive Components" → https://inclusive-components.design/

### Remaining Work

#### 152 root domain URLs still need article-specific research

Most common articles needing research (by frequency):
- Heydon Pickering - Semantic HTML (3x)
- Adrian Roselli - ARIA Misuse & Anti-Patterns (2x)
- Scott O'Hara - Form Labels & Instructions (2x)
- Marcy Sutton - Accessible Responsive Design (2x)
- Adrian Roselli - Form Accessibility (2x)
- Scott O'Hara - Semantic Form Controls (2x)
- Eric Bailey - Accessible Naming (2x)
- Adrian Roselli - Tooltip Patterns (2x)
- Patrick H. Lauke - Mobile Accessibility (2x)
- Scott O'Hara - Form Grouping (2x)
- Scott O'Hara - Button Accessibility (2x)
- Adrian Roselli - Context Changes (2x)
- ... and 105+ more articles

## Research Strategy

### Experts to focus on (by frequency of references):
1. **Adrian Roselli** (~40-50 articles) - https://adrianroselli.com/
   - Search: site:adrianroselli.com "[topic]"
2. **Scott O'Hara** (~15-20 articles) - https://www.scottohara.me/
3. **Heydon Pickering** (~15-20 articles) - https://heydonworks.com/
4. **Marcy Sutton** (~10-15 articles) - https://marcysutton.com/
5. **Patrick H. Lauke** (~10-15 articles) - https://www.splintered.co.uk/
6. **Eric Bailey** (~10-15 articles) - https://ericwbailey.design/
7. Others: Kat Holmes, Karl Groves, Steve Faulkner, Marco Zehe, etc.

### Search approach:
```
site:[domain] "[article topic phrase]"
[Author] "[article title]" accessibility
[Author] "[specific topic]" [second topic]
```

## Files Modified
- `src/data/personal-corpus.json` - All 111 W3C/WAI sources updated + 30+ expert URLs matched

## Next Steps
1. Continue searching for article-specific URLs for remaining 152 entries
2. Batch-search by expert to maximize efficiency
3. Apply matches incrementally
4. Consider creating a `links` field (like corpus.json) for better data structure separation

## Related Task
- User observed that corpus.json uses separate `links` and `sources` fields, which may be cleaner than personal-corpus's combined approach. Consider consolidating structure in future refactoring.
