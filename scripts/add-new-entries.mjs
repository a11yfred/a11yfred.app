import { readFileSync, writeFileSync } from 'fs'

const corpusPath = './src/data/personal-corpus.json'
const data = JSON.parse(readFileSync(corpusPath, 'utf8'))

// ── 1. Convert A11Y-048 in place (scrollbar → forced colors) ──────────────────
const i048 = data.findIndex(e => e.id === 'A11Y-048')
data[i048] = {
  id: 'A11Y-048',
  sc: '1.4.11',
  title: 'Interface Does Not Adapt to Forced Colors or High Contrast Mode',
  wcagLevel: 'AA',
  wcagVersion: '2.1',
  severity: 'Medium',
  platform: 'web',
  desc: 'The interface does not adapt when the user activates Forced Colors Mode (Windows) or a high contrast theme. Custom-styled components lose their visual boundaries, become invisible, or display incorrect colors because hardcoded values override system color adaptations. Users with low vision who depend on high contrast to perceive content and controls cannot use the interface reliably. Custom CSS scrollbars are a common trigger: they become invisible or non-functional in Forced Colors Mode and do not meet the 3:1 non-text contrast requirement against their background.',
  fix: 'Test in Windows High Contrast Mode (black and white variants) and in Forced Colors Mode via browser DevTools. Avoid hardcoding colors on interactive components; use CSS system color keywords (ButtonText, LinkText, CanvasText, Highlight) where browser defaults would otherwise be overridden. Use @media (forced-colors: active) to apply targeted overrides where needed. For custom scrollbars: remove ::-webkit-scrollbar CSS and allow the browser to render the native OS scrollbar, which adapts automatically. Verify that focus indicators, button boundaries, and icon contrast survive in all high contrast modes.',
  creditNames: ['Leonie Watson', 'Patrick H. Lauke', 'WCAG'],
  keywords: ['forced colors', 'high contrast', 'Windows High Contrast', 'Forced Colors Mode', 'custom scrollbar', 'low vision', 'system colors', 'webkit-scrollbar', 'scrollbar-color', 'scrollbar-width', 'color adaptation'],
  relatedSC: ['1.4.3 Contrast (Minimum) (Level AA)'],
  primarySC: '1.4.11 Non-text Contrast (Level AA)',
  creditLinks: [
    { text: 'Forced Colors Explained (Leonie Watson)', url: 'https://developer.chrome.com/docs/devtools/rendering/emulate-css/' },
    { text: 'Understanding 1.4.11 Non-text Contrast (Level AA)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html' },
  ],
  note: 'Leonie Watson and Patrick H. Lauke have documented forced colors behavior extensively. Custom scrollbar CSS (scrollbar-color, scrollbar-width: thin, ::-webkit-scrollbar) is one of the most common triggers for this failure in modern builds.',
}

// ── 2. Rename A11Y-106 ────────────────────────────────────────────────────────
const i106 = data.findIndex(e => e.id === 'A11Y-106')
data[i106].title = 'Dragging Movements Have No Pointer Alternative'
data[i106].keywords = ['dragging', 'drag and drop', 'dragging movements', 'pointer', 'motor impairment', 'keyboard alternative', 'sortable list', 'reorder', 'move up', 'move down']

// ── Insertion helpers ─────────────────────────────────────────────────────────
// Insert entries back-to-front by current index to preserve positions

// 3a. Blur validation -- before A11Y-122 (index 121)
data.splice(121, 0, {
  id: 'A11Y-NEW-BLUR',
  sc: '3.3.1',
  title: 'Form Errors Triggered Prematurely on Field Blur',
  wcagLevel: 'A',
  wcagVersion: '2.0',
  severity: 'High',
  platform: 'web',
  desc: 'Inline validation fires when focus leaves a field, not when the user submits the form. A user tabbing through fields to review the form triggers error states on every empty field they pass through, regardless of whether they have attempted to complete them. The errors are inaccurate at the time they appear and create a misleading and disruptive experience, particularly when compounded by assertive live region announcements on the same errors.',
  fix: 'Trigger validation on form submission, not on blur. If real-time validation is needed for a specific field (such as confirming a password match), apply it only after the user has entered a value and left the field, not on first blur of a still-empty field. Never flag a field as an error solely because the user moved past it without filling it in. If blur-based validation is unavoidable, suppress error messages for fields the user has not yet interacted with.',
  creditNames: ['WCAG'],
  keywords: ['form validation', 'blur', 'premature error', 'inline validation', 'focus out', 'onBlur', 'error on tab', 'field error', 'form error', 'validation timing'],
  relatedSC: ['3.3.2 Labels or Instructions (Level A)', '3.3.3 Error Suggestion (Level AA)'],
  primarySC: '3.3.1 Error Identification (Level A)',
  creditLinks: [{ text: 'Understanding 3.3.1 Error Identification (Level A)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html' }],
})

// 3b. Carousel after A11Y-069 (index 68 -> insert at 69)
data.splice(69, 0, {
  id: 'A11Y-NEW-CAROUSEL',
  sc: '2.2.2',
  title: 'Auto-Advancing Carousel or Slideshow Has No Pause, Stop, or Hide Control',
  wcagLevel: 'A',
  wcagVersion: '2.0',
  severity: 'High',
  platform: 'web',
  desc: 'A carousel, hero banner, or slideshow automatically advances through content without user input. No control exists to pause, stop, or hide the moving content. Users with cognitive disabilities, attention-related conditions, or reading difficulties are distracted or disoriented by content that changes before they finish reading it. Keyboard users cannot keep pace with auto-advancing content.',
  fix: 'Provide a visible and keyboard-accessible pause or stop control that halts auto-advancement. Once paused, the carousel must remain paused until the user explicitly resumes it. Alternatively, do not auto-advance at all -- user-initiated navigation is the preferred approach. If auto-advance is retained, ensure the interval is long enough to read all slide content at a comfortable pace. Do not restart auto-advance after user interaction with the carousel controls.',
  creditNames: ['WCAG'],
  keywords: ['carousel', 'slideshow', 'auto-advance', 'auto-play', 'hero banner', 'pause', 'stop', 'hide', 'moving content', 'animation', 'cognitive', 'attention'],
  relatedSC: ['2.2.1 Timing Adjustable (Level A)', '1.4.2 Audio Control (Level A)'],
  primarySC: '2.2.2 Pause, Stop, Hide (Level A)',
  creditLinks: [{ text: 'Understanding 2.2.2 Pause, Stop, Hide (Level A)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html' }],
  note: 'Auto-advancing carousels are widely considered an accessibility and usability anti-pattern. Many experts recommend removing auto-advance entirely rather than providing a pause control as mitigation.',
})

// 3c. Session expires -- before carousel (now at 69), so insert at 69
data.splice(69, 0, {
  id: 'A11Y-NEW-SESSION',
  sc: '2.2.1',
  title: 'Session Expires without Warning',
  wcagLevel: 'A',
  wcagVersion: '2.0',
  severity: 'Critical',
  platform: 'web',
  desc: 'An authenticated session expires after a period of inactivity with no warning before the timeout occurs. The user is logged out and any unsaved work or form data is lost without opportunity to extend the session or save progress. Users who are slow to complete tasks due to disability -- including screen reader users navigating complex forms, users with motor impairments, and users with cognitive or memory disabilities -- are disproportionately affected.',
  fix: 'Warn the user before the session expires, with enough time to respond. SC 2.2.1 requires at least 20 seconds notice and a simple mechanism to extend the session -- for example, pressing a key or activating a button. A modal or status region that appears two to five minutes before expiry and offers an extend option meets this requirement. If the session cannot be extended, inform the user how to recover their work. Sessions lasting at least 20 hours without expiry satisfy SC 2.2.1 without a warning mechanism.',
  creditNames: ['WCAG'],
  keywords: ['session timeout', 'session expiry', 'inactivity', 'logout', 'warning', 'time limit', 'extend session', 'unsaved data', 'authenticated'],
  relatedSC: ['2.2.2 Pause, Stop, Hide (Level A)'],
  primarySC: '2.2.1 Timing Adjustable (Level A)',
  creditLinks: [{ text: 'Understanding 2.2.1 Timing Adjustable (Level A)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html' }],
  note: 'SC 2.2.1 exceptions apply when the timeout is required for security reasons (financial, health data). The notification mechanism requirement still applies even when the timeout itself cannot be removed. Particularly relevant in healthcare, financial services, and government applications.',
})

// 3d. Cookie banner after A11Y-066 (index 65 -> insert at 66)
data.splice(66, 0, {
  id: 'A11Y-NEW-COOKIE',
  sc: '2.1.1',
  title: 'Cookie or Consent Banner Cannot Be Dismissed by Keyboard',
  wcagLevel: 'A',
  wcagVersion: '2.0',
  severity: 'High',
  platform: 'web',
  desc: 'A cookie consent banner, GDPR notice, or similar overlay blocks page content and cannot be fully operated by keyboard. The dismiss button, accept and reject controls, and preference links are not reachable by Tab, cannot be activated by Enter or Space, or are visually present but absent from the keyboard focus order. Users who do not use a pointer device cannot dismiss the banner and may be unable to access any content behind it.',
  fix: 'Ensure all banner controls -- accept, reject, manage preferences, and dismiss -- are keyboard focusable and activatable. On banner appearance, move focus to the first interactive element within it. Trap focus within the banner while it blocks the rest of the page, following the same pattern as a modal dialog. Provide a visible dismiss control that is reachable by keyboard and activatable by Enter and Space. Do not rely on clicking outside the banner as the only dismissal method.',
  creditNames: ['WCAG'],
  keywords: ['cookie banner', 'consent banner', 'GDPR', 'cookie notice', 'keyboard accessible', 'dismiss', 'focus trap', 'overlay', 'consent management', 'CMP'],
  relatedSC: ['2.1.2 No Keyboard Trap (Level A)', '2.4.3 Focus Order (Level A)'],
  primarySC: '2.1.1 Keyboard (Level A)',
  creditLinks: [{ text: 'Understanding 2.1.1 Keyboard (Level A)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html' }],
  note: 'Commonly overlooked because the banner is often injected by a third-party consent management platform (CMP). Keyboard access requirements apply regardless of whether the component is first-party or third-party.',
})

// 3e. Reduced motion after A11Y-036 (index 35 -> insert at 36)
data.splice(36, 0, {
  id: 'A11Y-NEW-MOTION',
  sc: '',
  title: 'System Reduced Motion Preference Not Respected',
  wcagLevel: '',
  wcagVersion: '2.1',
  severity: 'Best Practice',
  platform: 'both',
  desc: 'Animations, transitions, parallax effects, and other motion-based interactions play at full intensity regardless of the user\'s system-level Reduce Motion setting. Users with vestibular disorders, motion sensitivity, epilepsy risk, or attention-related conditions use this setting to limit motion across their device. Ignoring it exposes those users to motion they have explicitly asked to avoid.',
  fix: 'Web: wrap all non-essential animation and transition CSS in @media (prefers-reduced-motion: reduce) blocks. Replace or disable animations rather than just slowing them. Check JavaScript-driven animations and third-party libraries separately -- the media query in CSS does not automatically suppress JavaScript animation libraries. iOS: check UIAccessibility.isReduceMotionEnabled before starting animations and provide a non-animated fallback. Android: check Settings.Global.TRANSITION_ANIMATION_SCALE or observe AccessibilityManager to detect reduced motion preference.',
  creditNames: ['Adrian Roselli', 'WCAG'],
  keywords: ['reduced motion', 'prefers-reduced-motion', 'vestibular', 'animation', 'transition', 'parallax', 'motion sensitivity', 'epilepsy', 'Reduce Motion'],
  relatedSC: ['2.3.3 Animation from Interactions (Level AAA)'],
  primarySC: '',
  creditLinks: [
    { text: 'prefers-reduced-motion: Taking a no-motion-first approach to animations (Adrian Roselli)', url: 'https://adrianroselli.com/2019/03/accessibility-concerns-with-css-motion.html' },
    { text: 'Understanding 2.3.3 Animation from Interactions (Level AAA)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html' },
  ],
  note: 'WCAG 2.3.3 is AAA but prefers-reduced-motion is considered a baseline expectation across accessibility expert literature regardless of conformance level. Adrian Roselli recommends a motion-first approach: design without motion as the default and layer it in only when safe.',
})

// 3f. Text truncation after A11Y-044 (find dynamically after prior inserts)
const i044 = data.findIndex(e => e.id === 'A11Y-044')
data.splice(i044 + 1, 0, {
  id: 'A11Y-NEW-TRUNC',
  sc: '1.4.4',
  title: 'Text Truncates or Clips when System Font Size Increases (Native App)',
  wcagLevel: 'AA',
  wcagVersion: '2.0',
  severity: 'High',
  platform: 'native',
  desc: 'Labels, button titles, and other text elements clip or truncate rather than wrapping when the user\'s system font size is set above the default. Fixed-height containers do not expand to accommodate larger text. Content is cut off mid-word or replaced with an ellipsis, making it unreadable. The failure is widespread when hardcoded heights or static frames constrain text layout.',
  fix: 'Use dynamic layout constraints that allow containers to grow with their content. iOS: avoid fixed-height Auto Layout constraints on elements that contain text; use UILabel.adjustsFontForContentSizeCategory = true and numberOfLines = 0 to allow wrapping. In SwiftUI, avoid .frame(height:) on text-containing views; prefer .fixedSize(horizontal: false, vertical: true). Android: set android:layout_height to wrap_content on text-bearing views rather than a fixed dp value. Avoid maxLines without an accessible alternative. Test at the largest Dynamic Type or font size setting on each platform.',
  creditNames: ['WCAG'],
  keywords: ['text truncation', 'text clipping', 'font size', 'Dynamic Type', 'text resize', 'fixed height', 'wrap content', 'native app', 'iOS', 'Android', 'large text', 'label clipping'],
  relatedSC: ['1.4.10 Reflow (Level AA)'],
  primarySC: '1.4.4 Resize Text (Level AA)',
  creditLinks: [{ text: 'Understanding 1.4.4 Resize Text (Level AA)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html' }],
})

// 3g. Document entry after A11Y-003 (index 2 -> insert at 3, last so no shift matters)
data.splice(3, 0, {
  id: 'A11Y-NEW-DOC',
  sc: '1.1.1',
  title: 'Document Inaccessible to Assistive Technology',
  wcagLevel: 'A',
  wcagVersion: '2.0',
  severity: 'Critical',
  platform: 'document',
  desc: 'A document linked or embedded on the page -- PDF, Word, or PowerPoint -- is not accessible to assistive technology. This includes documents produced from image-only scans with no text layer, exports that produce no tag tree or document structure, and files where reading order, headings, or semantic relationships are absent. Screen readers either extract nothing from the file or read content in an order that does not match the intended meaning.',
  fix: 'For PDFs: ensure the file is text-based and tagged. Re-process image-only scans using OCR before tagging. Use Acrobat Pro\'s Make Accessible action and verify the Tags panel reflects correct heading hierarchy and reading order. For Word and PowerPoint source files: use native Heading styles and slide title placeholders before export, not manual bold or font-size formatting. Re-export with document structure tags enabled. Provide an accessible HTML or plain text alternative when remediation is not possible.',
  creditNames: ['WCAG'],
  keywords: ['document', 'PDF', 'Word', 'PowerPoint', 'untagged', 'image scan', 'OCR', 'tag tree', 'reading order', 'document accessibility', 'screen reader', 'assistive technology'],
  relatedSC: ['1.3.1 Info and Relationships (Level A)', '1.3.2 Meaningful Sequence (Level A)'],
  primarySC: '1.1.1 Non-text Content (Level A)',
  creditLinks: [{ text: 'Understanding 1.1.1 Non-text Content (Level A)', url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html' }],
  note: 'Broad catch-all for documents that fail at the foundation level. More specific failures -- heading structure loss on export, reading order issues, unlabeled PDF form fields -- are covered in separate entries.',
})

// ── Verify ────────────────────────────────────────────────────────────────────
const newEntries = data.filter(e => e.id.startsWith('A11Y-NEW'))
console.log('New entries:', newEntries.length)
newEntries.forEach(e => console.log(' ', e.id, '|', e.title))
console.log('Total entries:', data.length)

writeFileSync(corpusPath, JSON.stringify(data, null, 2))
console.log('Written.')
