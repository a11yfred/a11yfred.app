# Changelog

All notable changes to A11yTextHelper are documented here.

## [Unreleased]

### ESL-Friendly and Plain Language Content Updates

- **Simplified About panel text** to be more direct and accessible to non-native speakers
  - Replaced conversational narrative with clear, action-oriented language
  - Focused on what the tool does rather than why it was built
  - Simplified privacy disclosure to use shorter sentences and common words

- **Removed emdashes (—) throughout all user-facing content**
  - Replaced with periods, commas, or colons for clarity
  - Applied consistently across en.json, help text, and error messages
  - Improves readability for ESL audiences

- **Added Oxford commas to all multi-item lists**
  - Applied consistently in UI labels, help text, and announcer messages
  - Improves clarity in lists of 3+ items

- **Markdown documentation updated**
  - Updated [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md): changed "remediation" references to "suggested fixes"
  - Updated [docs/FEATURE-STATUS.md](docs/FEATURE-STATUS.md): standardized "Pinned Results" terminology, updated "AI Agent (Agentic Mode)" to "AI Agent (Match Existing Style / Agentic AI)"
  - Updated [docs/MAINTENANCE.md](docs/MAINTENANCE.md): updated checklist items for new terminology
  - Updated [docs/i18n-edits.md](docs/i18n-edits.md): documented all terminology changes

### Changed

#### Ko-fi Removal and GitHub Sponsors Integration

- **Removed:** Ko-fi widget and all related references
  - Removed import from [src/App.jsx:93](src/App.jsx#L93) (commented Ko-fi widget reference)
  - Removed CSS token `--clearance-kofi: 5rem` from [src/tokens.css](src/tokens.css)
  - Removed Ko-fi bottom clearance padding from `.page-footer` and `.drawer-panel` in [src/index.css](src/index.css)
  - Removed Ko-fi mobile media query block from [src/index.css](src/index.css)
  - Removed i18n keys from [src/i18n/en.json](src/i18n/en.json):
    - `footer.kofi_aria`
    - `footer.kofi_label`
    - `footer.kofi_text`
    - `footer.kofi_tip_label`

- **Added:** GitHub Sponsors link in footer
  - Added GitHub Sponsors link with heart icon in Footer component ([src/App.jsx](src/App.jsx))
  - Link positioned between "Built by" credit and LinkedIn social link
  - Accessible with proper aria labels and keyboard navigation

#### Terminology Standardization

##### "Remediation" → "Suggested Fix"

Standardized language across the entire application. "Remediation" was technical jargon; "Suggested Fix" is more accessible and user-friendly.

**Changed in [src/i18n/en.json](src/i18n/en.json):**

- `detail.remediation_label` → field still labeled with fallback text "Suggested Fix"
- `detail.remediation_aria` → `detail.suggested_fix_aria`
- `detail.copy_remediation` → `detail.copy_suggested_fix`
- `detail.announcer_copy_remediation` → `detail.announcer_copy_suggested_fix`
- `export.label_remediation` → `export.label_suggested_fix`
- All help and about panel text references changed from "suggested remediation" to "suggested fix"

**Changed in [src/components/DetailPanel.jsx](src/components/DetailPanel.jsx):**

- Line 81: Debug text changed from "Revised remediation" to "Revised suggested fix"
- Line 126: Export copy text changed from "Remediation:" to "Suggested Fix:"
- Line 252: Debug text changed from "Remediation" to "Suggested Fix"

**Changed in [src/utils/exportFinding.js](src/utils/exportFinding.js):**

- Line 48: Markdown export header changed from "## Remediation" to "## Suggested Fix"
- Line 71: Text export header changed from "Remediation:" to "Suggested Fix:"

**Changed in [src/components/SettingsPanel.jsx](src/components/SettingsPanel.jsx):**

- Fallback text for remediation label updated to "Suggested Fix"

##### "Agentic Mode" → "Match Existing Style (Agentic AI)"

More descriptive naming that clarifies the AI feature's purpose while remaining accessible.

**Changed in [src/i18n/en.json](src/i18n/en.json):**
- `settings.ai_agentic_label` value changed from "Agentic Mode" to "Match Existing Style (Agentic AI)"
- `settings.ai_agentic_desc` value updated to describe matching existing writing style

**Changed in [src/components/DetailPanel.jsx](src/components/DetailPanel.jsx):**
- Fallback text updated to "Match Existing Style (Agentic AI)"

**Changed in [src/components/SettingsPanel.jsx](src/components/SettingsPanel.jsx):**
- Lines 605-607: Fallback text and description updated to "Match Existing Style (Agentic AI)"

##### "Prioritize" → "Rank Results"
More specific and action-oriented language that better describes what users do with the priority controls.

**Changed in [src/i18n/en.json](src/i18n/en.json):**
- All onboarding and help text changed from "prioritize results" to "rank results"
- `help.step_2_label` changed from "Prioritize" to "Rank Results"
- `onboarding.slide_2_heading` changed from "Prioritize" to "Rank Results"
- All related announcer text updated accordingly

##### "Sort Priority" → "Ranking Controls"
More descriptive name for the sorting/ranking feature in settings.

**Changed in [src/i18n/en.json](src/i18n/en.json):**
- `settings.sort_priority_label` changed from "Sort Priority" to "Ranking Controls"

#### Terminology Consistency Notes

**Results vs. Findings (Confirmed Intentional Distinction):**
- **"Results"** used in search/list context: "Rank Results," "Narrow Results," "Pinned Results," "Starred Results"
- **"Findings"** used for individual items: "open a finding," "select the finding," "pick a finding," "match existing finding"
- This distinction is semantic and correct — both terms are retained as intended

#### Documentation Updates

**[docs/DEPLOYING.md](docs/DEPLOYING.md):**
- Updated Netlify deployment strategy from "tag-based releases only" to "auto-deploy on all branches (previews) + tag-based releases (production)"
- Added detailed branch preview workflow explanation
- Added tag-based release workflow explanation
- Fixed markdown linting issue (MD032: added blank lines around list items in "To disable auto-deploy" section)

**[README.md](README.md):**
- Added three project badges: License (MIT), Version (0.1.0), Node.js (>=18)

### Technical Notes

- All changes maintain backward compatibility at the code level (i18n keys are internal)
- No database schema changes required
- Terminology changes are purely UI-facing and localization-aware
- All linters pass (npm run lint)
