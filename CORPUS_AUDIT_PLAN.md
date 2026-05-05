# Corpus Audit Plan

## Scope
- **Public Corpus**: 89 entries (ATH-001+, plus public-only ATH-127+)
- **Personal Corpus**: 126 entries (private, comprehensive)
- **Total to audit**: 215 entries

## Audit Criteria (Applied Separately by Corpus)

### 1. Writing Quality & Voice
- **Public corpus**: ESL/middle school reading level, simple sentence structure, clear explanations
- **Personal corpus**: Mikey's voice — more detailed, technical depth, fewer hedges, direct and casual
- Check: Passive vs. active voice, sentence length, jargon explanation

### 2. Spelling & Grammar
- Consistent capitalization (WCAG, aria-label, etc.)
- Consistent punctuation (Oxford comma, em-dashes, hyphens)
- Verb tense agreement within desc/rem pairs
- No typos or misspellings

### 3. Jargon Consistency
- Identify key terms (e.g., "accessible name", "focus trap", "landmark", "live region")
- Standardize terminology across related entries
- Reduce synonymous variations (e.g., "keyboard user" vs. "keyboard navigation user")
- Ensure jargon is explained in public corpus, assumed in personal

### 4. Keywords
- Check for missing obvious keywords (element names, component types, patterns)
- Ensure keywords are searchable (lowercase, singular/plural variants)
- Add user-search terms (what would an auditor type?)

### 5. Related Links
- Check for missing related ATH-IDs (cross-reference entries addressing the same WCAG SC or similar issues)
- Verify related entries in `related` array point to valid SCs
- Add cross-links between complementary entries (e.g., "Focus Not Managed" ↔ "Focus Indicator Missing")

### 6. Reading Level Calibration
- **Public**: Simple sentences, explain acronyms on first use, avoid nested clauses
- **Personal**: Assume technical knowledge, shorter + denser, more examples

## Execution Plan

1. **Phase 1**: Scan public corpus for structural issues (missing links, jargon inconsistency)
2. **Phase 2**: Scan personal corpus for the same
3. **Phase 3**: Deep-dive on 10-15 high-impact entries (Critical priority, most-audited SCs)
4. **Phase 4**: Generate rewrite candidates and batch apply fixes
5. **Phase 5**: Re-check for consistency and create audit report

## Output
- Audit findings document (grouped by entry + issue type)
- Batch rewrite file (JSON with proposed changes)
- Summary report (counts by issue type)
