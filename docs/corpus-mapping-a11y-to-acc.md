# Personal to Public Corpus Mapping

**Date:** 2026-05-08 (updated after severity sweep, renumber, and note pass)
**Personal corpus:** `personal-corpus.json` — 175 entries, prefix A11Y-NNN (A11Y-001 through A11Y-175)
**Public corpus:** `corpus.json` — target 60-85 entries, prefix ACC-NNN
**Legacy public corpus:** `corpus-legacy.json` — archived, reference only

---

## Namespaces

| Prefix | Corpus | Audience | Count |
| --- | --- | --- | --- |
| A11Y- | Personal (`personal-corpus.json`) | Expert / paid tier | 175 |
| ACC- | Public (`corpus.json`) | Beginner-accessible, ESL-friendly | 99 (IDs aligned to A11Y source numbers) |
| ATH- | Legacy (`corpus-legacy.json`) | Archived reference | 147 |

---

## Editorial Criteria for Public Corpus

- AA and below only (AAA entries dropped unless extremely common)
- Plain English, minimal jargon, beginner- and ESL-friendly
- Wild encounter rate filter: only failures commonly seen in real audits
- Consolidated variants unless the split is strongly justified
- Best Practice (blank SC) entries kept only if very high encounter rate and widely understood
- Document platform: 1-2 broad entries only, not PDF-specific technical entries
- Native app: keep entries where failure is common cross-platform; merge redundant OS-specific variants
- No CSS or implementation-detail-only entries
- Intentional ID gaps preserved: when A11Y- entries are dropped or merged, their ACC- slot stays empty
- SC and relatedSC from merged entries are unioned into the surviving public entry
- Notes field used actively: merged entries explain their full scope in the note; severity ranges included where the failure commonly appears at different levels depending on context

---

## Resolved Questions (2026-05-08)

1. **Text truncation on resize (native):** Added to personal corpus as A11Y-044. Maps to ACC-031.
2. **Premature blur validation errors:** Added to personal corpus as A11Y-131. Maps to ACC-080.
3. **Document entries in public corpus:** Added broad catch-all to personal as A11Y-004. Maps to ACC-003.
4. **"Announce" vs "Communicated":** "Announced" used for speech/live region failures. "Communicated" or "programmatically determined" used for state/role/value failures.
5. **Cookie banner:** Added to personal as A11Y-057. Maps to ACC-040.
6. **Auto-advancing carousel:** Added to personal as A11Y-073. Maps to ACC-051.
7. **Session expires without warning:** Added to personal as A11Y-071. Maps to ACC-049.
8. **Reduced motion:** Added to personal as A11Y-078 (Best Practice). Maps to ACC-054.
9. **Forced colors / High contrast:** A11Y-050 broadened from scrollbar-specific to full forced colors entry. Maps to ACC-034.
10. **Dragging movements:** A11Y-112 retitled to align with SC 2.5.7 terminology. Maps to ACC-069.
11. **A11Y-173 absorbed:** Visual-Only Countdown Timer content merged into A11Y-175 (Dynamic Status Updates). Personal corpus renumbered: A11Y-174 to A11Y-173, A11Y-175 to A11Y-174, A11Y-176 to A11Y-175.
12. **Severity sweep (2026-05-08):** 23 severity changes applied. Critical reduced from 79 to 73; High adjusted to 55; Medium to 27; Low to 3. Range notes added to 9 entries where severity is context-dependent.
13. **Double dash rule:** All notes use commas, colons, parentheses, or "for example/such as/e.g./i.e." No em dashes or double dashes anywhere in note text.

---

## Full Mapping Table

| A11Y- | Title | Decision | ACC- | Notes |
| --- | --- | --- | --- | --- |
| A11Y-001 | Alt Text Missing or Empty | Keep | ACC-001 | Core, universal; covers linked image and background image variants |
| A11Y-002 | Complex Image or Figure Missing Sufficient Text Alternative | Keep | ACC-002 | Common, distinct from simple missing alt |
| A11Y-003 | PDF Is Untagged or Is an Image-Only Scan | Drop | -- | Document platform; covered by ACC-003 |
| A11Y-004 | Document Inaccessible to Assistive Technology | Keep | ACC-003 | Broad catch-all for any inaccessible document format |
| A11Y-005 | Meaningful Background Image Has No Text Alternative | Merge into ACC-001 | -- | Consolidate into alt text entry |
| A11Y-006 | Alt Text Inaccurate or Misleading | Keep | ACC-004 | Common, distinct failure requiring human review |
| A11Y-007 | Alt Text Duplicates Adjacent Visible Text | Keep | ACC-005 | Common beginner mistake; severity range Low to Medium |
| A11Y-008 | Linked Image Missing Text Alternative | Merge into ACC-001 | -- | Variant of missing alt; cover in ACC-001 fix |
| A11Y-009 | Decorative Image Exposed to Assistive Technology | Keep | ACC-006 | Very common; merge native variant in |
| A11Y-010 | Decorative Image Exposed to Assistive Technology (Native App) | Merge into ACC-006 | -- | Cover both platforms in ACC-006 |
| A11Y-011 | Missing Transcript for Prerecorded Media | Keep | ACC-007 | Common; merge audio-only variant in |
| A11Y-012 | Audio-Only Content Missing Transcript | Merge into ACC-007 | -- | Near-identical to transcript entry |
| A11Y-013 | Missing Captions on Prerecorded Video | Keep | ACC-008 | Extremely common |
| A11Y-014 | Missing Audio Description for Video | Keep | ACC-009 | Common, distinct from captions; merge 1.2.5 variant in |
| A11Y-015 | Missing Captions on Live Audio or Video | Keep | ACC-010 | Distinct from prerecorded |
| A11Y-016 | Video Missing Audio Description | Merge into ACC-009 | -- | AA variant of same failure |
| A11Y-017 | Emoji and Special Characters Disrupt Screen Reader Announcement | Keep | ACC-011 | Extremely common in real content |
| A11Y-018 | Document Heading Structure Missing or Lost on Export | Drop | -- | Document platform |
| A11Y-019 | Text Emphasis Conveyed by Visual Styling Alone | Keep | ACC-012 | Common, important beginner concept |
| A11Y-020 | Landmark Regions Missing, Incorrect, or Incomplete | Keep | ACC-013 | Very common; bumped to High |
| A11Y-021 | Missing or Incorrect Semantic Structure | Keep | ACC-014 | Core; keep general |
| A11Y-022 | Tabular Data Not Structured as a Table | Keep | ACC-015 | Very common |
| A11Y-023 | Widget Missing Required Accessibility Role Relationships | Merge into ACC-014 | -- | Too technical standalone; covered by semantic structure |
| A11Y-024 | Modal Does Not Hide Background from Screen Readers | Keep | ACC-016 | Common, important |
| A11Y-025 | CSS display Property Strips Element Semantics | Drop | -- | Too technical for public corpus |
| A11Y-026 | Related Content Not Grouped as Single Accessible Element (Native App) | Keep | ACC-017 | Good intro to native grouping concepts |
| A11Y-027 | Reading Order in PDF Does Not Match Visual Layout | Drop | -- | Document platform |
| A11Y-028 | Reading Order Does Not Match Content Order | Keep | ACC-018 | Common web issue; merge native variant in; severity range High to Critical |
| A11Y-029 | Reading Order Does Not Match Visual Layout (Native App) | Merge into ACC-018 | -- | Cover both platforms in ACC-018 |
| A11Y-030 | Instructions Rely Solely on Sensory Characteristics | Keep | ACC-019 | Classic, common; downgraded to High |
| A11Y-031 | Interface Locked to Single Screen Orientation | Keep | ACC-020 | Very common, easy to understand |
| A11Y-032 | Personal Data Fields Not Configured for Browser Autofill | Keep | ACC-021 | Common, practical; merge native variant in |
| A11Y-033 | Personal Data Fields Missing Autofill Hints (Native App) | Merge into ACC-021 | -- | Cover both platforms in ACC-021 |
| A11Y-034 | Visual State or Meaning Communicated by Color Alone | Keep | ACC-022 | Extremely common, beginner-critical |
| A11Y-035 | Link in Body Text Distinguished by Color Alone | Keep | ACC-023 | Common specific variant worth keeping |
| A11Y-036 | Audio or Video Autoplays on Page Load | Keep | ACC-024 | Very common |
| A11Y-037 | Text Falls below Minimum Contrast Ratio | Keep | ACC-026 | #1 most common WCAG failure |
| A11Y-038 | All-Caps Text Disrupts Readability | Keep | ACC-025 | Common, easy to understand |
| A11Y-039 | Dark Mode or System Color Scheme Not Supported | Drop | -- | Best Practice, no SC, implementation-heavy |
| A11Y-040 | User Scaling and Zoom Disabled | Keep | ACC-029 | Very common |
| A11Y-041 | Content Requires Horizontal Scroll after Text Resize | Keep | ACC-030 | Common; merge font size preference variants in |
| A11Y-042 | Text Size Ignores System Font Size Preference | Merge into ACC-030 | -- | Cover broadly in ACC-030 |
| A11Y-043 | User Font Size Preference Ignored (Native App) | Merge into ACC-030 | -- | Cover both platforms in ACC-030 |
| A11Y-044 | Text Truncates or Clips when System Font Size Increases (Native App) | Keep | ACC-031 | New entry; confirmed in native audits; distinct from reflow |
| A11Y-045 | Text Falls below Minimum Font Size | Keep | ACC-027 | Common, plain-English friendly |
| A11Y-046 | UI Does Not Support System Magnification (Native App) | Keep | ACC-028 | Common native issue |
| A11Y-047 | Text Presented as Image | Keep | ACC-032 | Common, important principle |
| A11Y-048 | Insufficient Contrast Ratio for Enhanced Standard | Drop | -- | AAA |
| A11Y-049 | Page Requires Horizontal Scroll at 400% Zoom | Keep | ACC-033 | Common, SC 1.4.10 worth including |
| A11Y-050 | Interface Does Not Adapt to Forced Colors or High Contrast Mode | Keep | ACC-034 | Broadened from scrollbar-specific; covers full forced colors failure |
| A11Y-051 | Non-text Content or Control Has Insufficient Contrast Ratio | Merge into ACC-035 | -- | Combine with insufficient non-text contrast entry |
| A11Y-052 | Insufficient Non-Text Contrast Ratio | Keep | ACC-035 | Common; merge redundant variant in |
| A11Y-053 | Text Spacing Requirements Not Met or Layout Breaks when Overridden | Keep | ACC-036 | Broadened to cover all four SC 1.4.12 minimums plus override failure |
| A11Y-054 | Tooltip Disappears before User Can Read It | Keep | ACC-037 | Common UX/a11y failure; severity range High to Critical |
| A11Y-055 | Hover or Focus Content Cannot Be Dismissed | Keep | ACC-038 | Common, important; severity range High to Critical |
| A11Y-056 | Escape Key Does Not Close Overlay or Modal | Keep | ACC-039 | Very common; merge native overlay dismiss in |
| A11Y-057 | Cookie or Consent Banner Cannot Be Dismissed by Keyboard | Keep | ACC-040 | New entry; very common third-party component failure |
| A11Y-058 | Infinite Scroll Prevents Keyboard Access to Page Footer | Keep | ACC-041 | Common modern pattern failure |
| A11Y-059 | Scrollable Region Not Keyboard Accessible | Keep | ACC-042 | Common |
| A11Y-060 | Script Removes Focus Programmatically on Interaction | Drop | -- | Too technical for public corpus |
| A11Y-061 | Non-Interactive Element Receives Keyboard Focus | Keep | ACC-043 | Common, easy concept |
| A11Y-062 | Control Not Keyboard Accessible (Native App) | Keep | ACC-044 | Important native issue; merge custom control variant in |
| A11Y-063 | Overlay Dismiss Gesture Blocked or Not Supported (Native App) | Merge into ACC-039 | -- | Cover in Escape key entry as both-platform |
| A11Y-064 | Control Invisible until It Receives Keyboard Focus | Keep | ACC-045 | Common ghost focus issue |
| A11Y-065 | Radio Group Not Navigable by Arrow Keys | Keep | ACC-046 | Common, very specific and findable |
| A11Y-066 | Custom Control Not Keyboard Accessible | Merge into ACC-044 | -- | Same concept, consolidate |
| A11Y-067 | Custom Keyboard Shortcuts Undiscoverable to Users | Drop | -- | Low encounter rate outside complex apps |
| A11Y-068 | Switch Control or Switch Access Cannot Operate the Interface (Native App) | Drop | -- | Too specialized for beginner public corpus |
| A11Y-069 | Keyboard Focus Trapped in Component | Keep | ACC-047 | Critical, very common |
| A11Y-070 | Single-Key Shortcut Cannot Be Remapped or Disabled | Keep | ACC-048 | SC 2.1.4 commonly missed |
| A11Y-071 | Session Expires without Warning | Keep | ACC-049 | New entry; SC 2.2.1 |
| A11Y-072 | Timed Notification Disappears before User Can Read It | Keep | ACC-050 | Very common toast/notification failure; downgraded to High |
| A11Y-073 | Auto-Advancing Carousel or Slideshow Has No Pause, Stop, or Hide Control | Keep | ACC-051 | New entry; SC 2.2.2; carousels ubiquitous; downgraded to Medium |
| A11Y-074 | Auto-Playing Content Has No Pause or Stop Control | Keep | ACC-052 | Very common; distinct from carousel |
| A11Y-075 | Session Data Lost after Re-Authentication | Drop | -- | AAA |
| A11Y-076 | Inactivity Timeout Not Communicated to Users | Drop | -- | AAA |
| A11Y-077 | Flashing Content Exceeds Safe Flash Threshold | Keep | ACC-053 | Safety-critical, important for all audiences |
| A11Y-078 | System Reduced Motion Preference Not Respected | Keep | ACC-054 | Best Practice; widely expected regardless of conformance level |
| A11Y-079 | Skip Link Target Is Navigation, Not Main Content | Merge into ACC-055 | -- | Variant of skip link failure; downgraded to Medium before merge |
| A11Y-080 | Missing or Non-Functional Skip Link | Keep | ACC-055 | Very common; merge all skip link variants in |
| A11Y-081 | Skip Link Not Visible on Focus | Merge into ACC-055 | -- | Cover all skip link variants in ACC-055 |
| A11Y-082 | Page Title Missing, Non-Unique, or Stale | Keep | ACC-056 | Very common, easy to understand |
| A11Y-083 | Focus Not Restored after Modal Dismissal (Native App) | Merge into ACC-057 | -- | Cover both platforms in focus management entry |
| A11Y-084 | Focus Order Does Not Match Visual Reading Order | Keep | ACC-057 | Common; merge all focus management variants in; severity range High to Critical |
| A11Y-085 | Focus Not Managed after Dynamic Content Change | Merge into ACC-057 | -- | Focus management variant |
| A11Y-086 | Focus Placed on Element without User Initiation | Merge into ACC-057 | -- | Focus management variant; kept High |
| A11Y-087 | Dynamic Content Insertion Disrupts Focus Order | Merge into ACC-057 | -- | Focus management variant |
| A11Y-088 | Dialog Placement Disrupts Expected Focus Order | Merge into ACC-057 | -- | Focus management variant |
| A11Y-089 | Date Picker Obscures the Input Field | Drop | -- | Too specific, low encounter rate |
| A11Y-090 | Non-Descriptive or Ambiguous Link Text | Keep | ACC-059 | Core, extremely common; merge empty link text in |
| A11Y-091 | Adjacent Links Point to the Same Destination | Drop | -- | Low encounter rate |
| A11Y-092 | Link Text Empty or Visually Hidden | Merge into ACC-059 | -- | Variant of ambiguous link text; bumped to High before merge |
| A11Y-093 | Identical Link Text Used for Different Destinations | Keep | ACC-058 | Common, plain-English friendly |
| A11Y-094 | No Alternative Way to Locate Pages within the Site | Keep | ACC-060 | Common in small sites; downgraded to Low |
| A11Y-095 | Icon-Only Control Has No Visible Label | Keep | ACC-061 | Very common; downgraded to High |
| A11Y-096 | Non-Heading Content Incorrectly Marked as Heading | Merge into ACC-062 | -- | Cover heading misuse broadly |
| A11Y-097 | Heading Element Contains No Text | Merge into ACC-062 | -- | Heading issue variant |
| A11Y-098 | Heading Structure Missing, Incorrect, or Non-Descriptive | Keep | ACC-062 | Very common; merge heading misuse variants in; bumped to High |
| A11Y-099 | Visible Focus Indicator Missing or Inadequate | Keep | ACC-063 | Core, extremely common; merge form/native variants in |
| A11Y-100 | Form Input Missing Visible Boundary and Focus State | Merge into ACC-063 | -- | Cover in ACC-063 |
| A11Y-101 | Visible Focus Indicator Missing for External Keyboard Users (Native App) | Merge into ACC-063 | -- | Cover both platforms in ACC-063 |
| A11Y-102 | Focusable Element Not Visible in Any State | Drop | -- | Edge case, low encounter rate |
| A11Y-103 | Current Location in Site Not Indicated | Drop | -- | AAA |
| A11Y-104 | Link Purpose Cannot Be Determined from Link Text Alone | Drop | -- | AAA |
| A11Y-105 | Sticky Header or Footer Obscures Keyboard Focus | Keep | ACC-064 | Very common modern UI pattern |
| A11Y-106 | Multi-Touch Gesture Has No Single-Pointer Alternative | Keep | ACC-065 | Common, both platforms |
| A11Y-107 | Control Activates on Press without Cancellation Option | Keep | ACC-066 | Common, important safety pattern |
| A11Y-108 | Accessible Name Does Not Match Visible Label | Keep | ACC-067 | Very common voice control failure; merge native variant in |
| A11Y-109 | Voice Control or Voice Access Cannot Operate Controls (Native App) | Merge into ACC-067 | -- | Cover both in ACC-067 |
| A11Y-110 | Device Motion Has No UI Alternative | Keep | ACC-068 | SC 2.5.4 Level A; users with mounted devices cannot access shake/tilt features |
| A11Y-111 | Target Size below Enhanced Minimum | Drop | -- | AAA |
| A11Y-112 | Dragging Movements Have No Pointer Alternative | Keep | ACC-069 | SC 2.5.7; commonly missed |
| A11Y-113 | Control Tap Target below Minimum Size | Keep | ACC-070 | Very common mobile issue; merge overlap variant in |
| A11Y-114 | Tap Target Areas Overlap Adjacent Controls | Merge into ACC-070 | -- | Cover both tap target issues in ACC-070 |
| A11Y-115 | Missing or Incorrect Language Attribute | Keep | ACC-071 | Very common, important for TTS |
| A11Y-116 | PDF Has No Document Title or Language Set | Drop | -- | Document platform |
| A11Y-117 | Language of Inline Content Not Specified | Keep | ACC-072 | Common in multilingual content; downgraded to High |
| A11Y-118 | Unusual Terms or Jargon Not Defined | Drop | -- | AAA |
| A11Y-119 | Reading Level Exceeds Lower Secondary Education | Drop | -- | AAA |
| A11Y-120 | Unexpected Change of Context on Focus | Keep | ACC-074 | Common, important |
| A11Y-121 | Back Navigation Does Not Return to Previous Page | Keep | ACC-073 | Common SPA issue, plain-English friendly |
| A11Y-122 | Unexpected Change of Context on Input | Keep | ACC-075 | Very common form pattern; merge auto-submit variant in |
| A11Y-123 | Form Submits or Navigates Automatically on Field Completion | Merge into ACC-075 | -- | Specific instance of ACC-075 |
| A11Y-124 | No Warning before Opening New Tab or Window | Keep | ACC-076 | Common, plain-English friendly |
| A11Y-125 | Navigation Order Inconsistent Across Pages | Keep | ACC-077 | Common, important |
| A11Y-126 | Inconsistent Identification of Controls Across Pages | Keep | ACC-078 | Common; downgraded to Medium |
| A11Y-127 | Help Mechanism Not Consistently Placed Across Pages | Drop | -- | Low encounter rate, SC 3.2.6 rarely tested; downgraded to Low |
| A11Y-128 | Form Errors Not Programmatically Associated | Keep | ACC-079 | Very common; merge native and focus-only variants in |
| A11Y-129 | Error Messages Visible Only on Focus | Merge into ACC-079 | -- | Variant of form error issue; downgraded to High before merge |
| A11Y-130 | Form Error Not Announced after Validation (Native App) | Merge into ACC-079 | -- | Cover both platforms in ACC-079 |
| A11Y-131 | Form Errors Triggered Prematurely on Field Blur | Keep | ACC-080 | New entry; confirmed across multiple audits |
| A11Y-132 | Error Message Does Not Identify the Field or Failure | Keep | ACC-081 | Very common, distinct from association |
| A11Y-133 | Input Errors Announced Too Aggressively via Live Region | Drop | -- | Technical implementation detail |
| A11Y-134 | Form Input Missing Label | Keep | ACC-082 | Core, most common form failure; merge programmatic/checkbox variants in |
| A11Y-135 | Required Field Indicator Not Explained | Keep | ACC-083 | Very common |
| A11Y-136 | Form Input Label Not Programmatically Associated | Merge into ACC-082 | -- | Technical variant of missing label; kept High |
| A11Y-137 | Form Label Too Vague to Describe Input Purpose | Keep | ACC-084 | Common; merge conflicting label variant in |
| A11Y-138 | Checkbox Missing Visible Label | Merge into ACC-082 | -- | Variant of missing label |
| A11Y-139 | Form Input Label Too Generic, Misleading, or Conflicting | Merge into ACC-084 | -- | Same concept as ACC-084 |
| A11Y-140 | Placeholder Text Used as the Only Label | Keep | ACC-085 | Extremely common |
| A11Y-141 | Multi-Part Form Field Has No Label on Individual Inputs | Drop | -- | Low encounter rate |
| A11Y-142 | Error Message Does Not Describe How to Correct | Keep | ACC-086 | Very common |
| A11Y-143 | No Confirmation Step before Irreversible Action | Keep | ACC-087 | Common, plain-English |
| A11Y-144 | Previously Entered Data Not Preserved Across Form Steps | Keep | ACC-088 | Common multi-step form issue |
| A11Y-145 | Authentication Requires Cognitive Test with No Alternative | Keep | ACC-089 | SC 3.3.8 (WCAG 2.2), increasingly common |
| A11Y-146 | WebView Content Not Exposed to Screen Readers (Native App) | Keep | ACC-090 | Common hybrid app failure |
| A11Y-147 | Custom Widget Missing Expected Interaction Pattern | Keep | ACC-091 | Common; merge custom select variant in |
| A11Y-148 | Incorrect ARIA Role on Element | Keep | ACC-092 | Very common; merge native role variant in |
| A11Y-149 | Layout Table Not Marked for Presentation | Drop | -- | Technical, low encounter in modern builds; downgraded to Medium |
| A11Y-150 | Focusable Element Hidden from Assistive Technology | Keep | ACC-093 | Common ghost element issue |
| A11Y-151 | Duplicate ID Breaks ARIA or Label Association | Keep | ACC-094 | Very common, auto-detectable |
| A11Y-152 | Dialog or Modal Missing Accessible Name | Keep | ACC-095 | Very common |
| A11Y-153 | Incorrect or Missing Accessibility Role (Native App) | Merge into ACC-092 | -- | Cover both platforms in ACC-092 |
| A11Y-154 | PDF Form Fields Not Tagged or Labeled | Drop | -- | Document platform |
| A11Y-155 | ARIA Menu Roles Applied to Navigation Links | Keep | ACC-096 | Common ARIA misuse pattern |
| A11Y-156 | Control Does Not Announce State or Mode Change | Keep | ACC-097 | Very common; merge state determination variant in |
| A11Y-157 | Control Missing Accessible Name, Role, or Value | Keep | ACC-098 | Core 4.1.2; merge misleading name variant in |
| A11Y-158 | Nested Interactive Elements Violate HTML Specification | Keep | ACC-099 | Common, auto-detectable; severity range High to Critical |
| A11Y-159 | Adjustable Control Missing Increment and Decrement Actions (Native App) | Keep | ACC-100 | Common native control failure |
| A11Y-160 | Heading Contains Interactive Element with Conflicting Role | Drop | -- | Low encounter rate, niche |
| A11Y-161 | Embedded Frame Missing Accessible Name | Keep | ACC-101 | Very common |
| A11Y-162 | Hidden or Collapsed Content Exposed to Screen Readers | Keep | ACC-102 | Common |
| A11Y-163 | Control Accessible Name Misleads or Misidentifies | Merge into ACC-098 | -- | Variant of accessible name issue |
| A11Y-164 | Numeric Value Announced without Context or Unit | Drop | -- | Low encounter rate, niche |
| A11Y-165 | Custom Select Widget Missing Accessible Name and Role | Merge into ACC-091 | -- | Specific instance of custom widget pattern |
| A11Y-166 | Control State Not Programmatically Determined | Merge into ACC-097 | -- | State announcement variant |
| A11Y-167 | Unavailable Feature Not Marked as Disabled | Keep | ACC-103 | Common, plain-English friendly; downgraded to Medium |
| A11Y-168 | Table Column Sort State Not Programmatically Determined | Drop | -- | Low encounter rate, niche |
| A11Y-169 | Incorrect Nesting of List Elements | Keep | ACC-104 | Common, auto-detectable |
| A11Y-170 | Loading State Not Announced to Assistive Technology | Keep | ACC-105 | Very common; merge native and status variants in |
| A11Y-171 | Expanded Content Not Announced to Assistive Technology | Keep | ACC-106 | Very common |
| A11Y-172 | Autocomplete Widget Announces Redundant Results | Drop | -- | Implementation detail, low encounter; downgraded to Medium |
| A11Y-173 | Dynamic Content Change Not Announced (Native App) | Merge into ACC-105 | -- | Cover both platforms in ACC-105 |
| A11Y-174 | Live Region Configured to Announce on Every Keystroke | Drop | -- | Implementation detail, expert-only; downgraded to Medium |
| A11Y-175 | Dynamic Status Updates Not Announced to Assistive Technology | Merge into ACC-105 | -- | Countdown timer content absorbed here; consolidate all status announcement into ACC-105 |

Total rows: 175 | Keep: 106 | Merge: 39 | Drop: 30
