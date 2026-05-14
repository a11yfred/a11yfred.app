import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('./src/data/personal-corpus.json', 'utf8'))

const updates = {
  'A11Y-004': 'Broad catch-all for documents that fail at the foundation level. More specific failures (heading structure loss on export, reading order issues, unlabeled PDF form fields) are covered in separate entries.',
  'A11Y-021': 'One of the highest-volume findings in any audit. Missing semantic structure is also the root cause of many apparent 4.1.2 failures, so confirm the actual failure before filing both.',
  'A11Y-034': 'WCAG 1.4.1 requires a non-color distinguishing characteristic for links in body text, and underline is the most common solution. The 3:1 contrast difference between link and surrounding text is an acceptable alternative but is harder to verify.',
  'A11Y-037': 'The most commonly reported WCAG failure in automated testing. Contrast failures also appear in non-text content (SC 1.4.11), so confirm which SC applies before filing.',
  'A11Y-052': 'Both SC 1.4.11 and 1.4.13 entries in this area are commonly filed together. Tooltips that are also the accessible name for a control compound this failure: the name disappears before the user can read it.',
  'A11Y-077': 'SC 2.3.1 is safety-critical. The threshold is three flashes per second at sufficient area and contrast. Most testing tools do not automatically detect this, so manual review or specialist tooling (Peat, HATS) is required.',
  'A11Y-082': 'Page title is the first thing announced when a page loads or a route changes in a SPA. In SPAs, the title must update on every route change. A static title that never changes is a common failure.',
  'A11Y-108': "SC 2.5.3 is specifically about voice control. The accessible name must match or begin with the visible label so voice commands like \"click Submit\" work. This is distinct from misleading labels (4.1.2) or vague labels (3.3.2).",
  'A11Y-115': 'The lang attribute on the html element is the minimum requirement. An incorrect language value (e.g., lang="en" on a French page) is as much a failure as a missing one, as both cause mispronunciation.',
  'A11Y-145': '3.3.8 (WCAG 2.2, Level AA) specifically prohibits cognitive function tests (such as CAPTCHA, puzzle, or pattern recognition) as the only authentication step without an alternative. Two-factor SMS or passkeys satisfy the SC.',
}

let updated = 0
for (const e of data) {
  if (updates[e.id]) {
    e.note = updates[e.id]
    updated++
  }
}

console.log('Updated:', updated)
writeFileSync('./src/data/personal-corpus.json', JSON.stringify(data, null, 2))
console.log('Written.')
