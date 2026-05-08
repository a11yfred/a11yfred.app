import { readFileSync, writeFileSync } from 'fs'

const corpusPath = './src/data/personal-corpus.json'
const data = JSON.parse(readFileSync(corpusPath, 'utf8'))

const notes = {
  'A11Y-001': 'axe-core detects missing alt on img elements reliably. Inaccurate or misleading alt text requires human review and is covered in a separate entry.',
  'A11Y-013': 'SC 1.2.3 (Level A) is satisfied by either an audio description track or a full text alternative for the video. SC 1.2.5 (Level AA) requires the audio description track specifically. Both are commonly missed together.',
  'A11Y-017': 'The most common cause is using manual bold and font size increases instead of Word Heading styles. The heading structure exists visually but produces no tag in the exported PDF.',
  'A11Y-021': 'One of the highest-volume findings in any audit. Missing semantic structure is also the root cause of many apparent 4.1.2 failures -- confirm the actual failure before filing both.',
  'A11Y-024': 'aria-hidden="true" on a parent element hides all descendants from the accessibility tree, including focusable elements. This can silently break keyboard and screen reader access without any visible indicator.',
  'A11Y-025': 'The fix depends heavily on whether sub-elements need to remain individually accessible for secondary actions. Use accessibilityCustomActions (iOS) or accessibility actions (Android) to preserve secondary interactions while merging the primary reading target.',
  'A11Y-030': 'SC 1.3.3 failures are often missed because they do not cause a visual defect. Look for instructions like "click the red button", "see the icon to the left", or "use the form below."',
  'A11Y-034': 'WCAG 1.4.1 requires a non-color distinguishing characteristic for links in body text -- underline is the most common solution. The 3:1 contrast difference between link and surrounding text is an acceptable alternative but is harder to verify.',
  'A11Y-036': 'SC 1.4.2 is commonly misapplied to background music or ambient sound loops. It applies to any audio that plays automatically, including video with audio tracks.',
  'A11Y-037': 'The most commonly reported WCAG failure in automated testing. Contrast failures also appear in non-text content (SC 1.4.11) -- confirm which SC applies before filing.',
  'A11Y-040': 'Zoom disabled via user-scalable=no or maximum-scale=1 in the viewport meta tag. This is a one-line fix with no layout side effects in responsive designs.',
  'A11Y-047': 'Images of text include buttons rendered as images, text in promotional banners, and text embedded in infographics. Logos are exempt. SVG text is not an image of text if the text node is present in the DOM.',
  'A11Y-048': 'Leonie Watson and Patrick H. Lauke have documented forced colors behavior extensively. Custom scrollbar CSS (scrollbar-color, scrollbar-width: thin, ::-webkit-scrollbar) is one of the most common triggers for this failure in modern builds.',
  'A11Y-049': 'Reflow is tested at 320 CSS pixels viewport width (equivalent to 400% zoom on a 1280px screen). Content that requires horizontal scrolling at this width fails. Exceptions exist for content where two-dimensional layout is essential (data tables, maps, complex diagrams).',
  'A11Y-051': 'Non-text contrast failures are frequently missed in automated testing. Common failures: focus indicators below 3:1, icon buttons with insufficient contrast, input field borders against white backgrounds, and chart elements.',
  'A11Y-052': 'Both SC 1.4.11 and 1.4.13 entries in this area are commonly filed together. Tooltips that are also the accessible name for a control compound this failure -- the name disappears before the user can read it.',
  'A11Y-056': 'Escape key behavior is expected by WCAG and is a modal interaction convention. When Escape does not work, keyboard users have no reliable way to dismiss the overlay without navigating to a close button, which may itself be inaccessible.',
  'A11Y-065': 'Arrow key navigation within radio groups follows the roving tabindex pattern. Only one radio in a group should be in the tab sequence at a time; arrow keys move between options within the group.',
  'A11Y-069': 'Focus trap is a correct pattern for modal dialogs (intentional) but a critical failure when applied to non-modal components like date pickers, dropdowns, or carousels.',
  'A11Y-072': 'Toast notifications and snackbars are the most common real-world instance. The notification must persist long enough for a screen reader to reach it, or it must be placed in a persistent live region.',
  'A11Y-077': 'SC 2.3.1 is safety-critical. The threshold is three flashes per second at sufficient area and contrast. Most testing tools do not automatically detect this -- manual review or specialist tooling (Peat, HATS) is required.',
  'A11Y-082': 'Page title is the first thing announced when a page loads or a route changes in a SPA. In SPAs, the title must update on every route change -- a static title that never changes is a common failure.',
  'A11Y-084': 'Focus order failures in dialogs are especially disruptive because the user is already in a constrained context. Confirm focus lands inside the dialog on open and returns to the trigger on close.',
  'A11Y-090': 'Link text is read in isolation by screen reader users navigating via link list. "Click here", "read more", "learn more", and "details" all fail this criterion when used without additional context.',
  'A11Y-095': 'The most visible focus indicator failure. User agent default outlines are often suppressed with outline: 0 or outline: none in CSS resets. WCAG 2.4.11 (Focus Appearance, AA, 2.2) extends this with minimum size and contrast requirements.',
  'A11Y-099': 'Sticky elements that obscure focused content became a WCAG 2.2 failure under SC 2.4.12 (Focus Not Obscured, AA). SC 2.4.7 (AA) also applies if the focused element is completely hidden. File both where applicable.',
  'A11Y-108': 'SC 2.5.3 is specifically about voice control -- the accessible name must match or begin with the visible label so voice commands like "click Submit" work. This is distinct from misleading labels (4.1.2) or vague labels (3.3.2).',
  'A11Y-112': 'WCAG 2.5.7 requires a single-pointer alternative, not necessarily a keyboard alternative. A drag-to-reorder that can also be reordered via a touch-accessible button satisfies the SC even if keyboard is not involved.',
  'A11Y-115': 'The lang attribute on the html element is the minimum requirement. An incorrect language value (lang="en" on a French page) is as much a failure as a missing one -- both cause mispronunciation.',
  'A11Y-128': 'Form errors must be associated with their fields (aria-describedby), identify the field in error, and describe what went wrong. Filing three separate entries for association, identification, and description is valid when they are independently failing.',
  'A11Y-134': 'Placeholder text disappears on input and has insufficient contrast in most browsers at default styling. It cannot substitute for a label because it fails both persistence and contrast requirements.',
  'A11Y-145': '3.3.8 (WCAG 2.2, Level AA) specifically prohibits cognitive function tests -- CAPTCHA, puzzle, or pattern recognition -- as the only authentication step without an alternative. Two-factor SMS or passkeys satisfy the SC.',
  'A11Y-148': 'ARIA role="menu" and role="menuitem" are for application-style menus (like a desktop app File menu), not for site navigation. Applying these roles to nav links causes screen readers to announce navigation as a menu and changes expected keyboard behavior.',
  'A11Y-151': 'Duplicate IDs are one of the most reliably auto-detected failures. axe-core reports them as a critical violation. The impact is silent: aria-labelledby, aria-describedby, and label for all resolve to the first matching ID in the DOM.',
  'A11Y-166': 'aria-disabled communicates disabled state to assistive technology without removing the element from the tab order, which allows users to discover the control even when it cannot be activated. This is preferable to the HTML disabled attribute for custom controls where focus preservation is important.',
  'A11Y-170': 'The most common implementation of this failure is a loading spinner with no accessible equivalent. aria-live="polite" on a status region that announces "Loading complete" when content arrives is the standard fix.',
  'A11Y-175': 'Live regions should never use aria-live="assertive" or role="alert" for routine status messages. Reserve assertive for genuinely urgent, time-sensitive alerts. Polite is almost always the correct choice.',
}

let added = 0
for (const [id, note] of Object.entries(notes)) {
  const entry = data.find(e => e.id === id)
  if (!entry) { console.log('NOT FOUND:', id); continue }
  if (entry.note) { console.log('ALREADY HAS NOTE:', id); continue }
  entry.note = note
  added++
}

console.log('Notes added:', added)
console.log('Total entries with note:', data.filter(e => e.note).length)

writeFileSync(corpusPath, JSON.stringify(data, null, 2))
console.log('Written.')
