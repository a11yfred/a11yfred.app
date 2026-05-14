// Updates corpus.json (ACC-057, ACC-062, ACC-091, ACC-100)
// and personal-corpus.json (A11Y-098, A11Y-147, new custom-actions entry)

import { readFileSync, writeFileSync } from 'fs';

// ── ACC corpus ─────────────────────────────────────────────────────────────

const accPath = 'src/data/corpus.json';
const acc = JSON.parse(readFileSync(accPath, 'utf8'));

// ACC-057: add positive-tabindex sentence to fix
{
  const e = acc.find(x => x.id === 'ACC-057');
  e.fix = e.fix.replace(
    'Do not move focus to elements the user has not interacted with.',
    'Do not move focus to elements the user has not interacted with. Avoid positive tabindex values (tabindex="1", tabindex="2", and so on): they create an unpredictable priority tab ring that overrides natural DOM order and is a common cause of illogical focus sequences.'
  );
}

// ACC-062: add no-h1 diagnostic sentence to fix
{
  const e = acc.find(x => x.id === 'ACC-062');
  e.fix = e.fix.replace(
    'An empty heading element is a failure.',
    'An empty heading element is a failure. A page with no h1 at all is a common instance: screen reader users expect the h1 as the primary entry point when navigating by heading, and its absence forces linear top-to-bottom traversal.'
  );
}

// ACC-091: add ARIA tabs example to fix
{
  const e = acc.find(x => x.id === 'ACC-091');
  e.fix = e.fix.replace(
    'Native HTML equivalents (select, input type="checkbox") implement these patterns automatically and are strongly preferred.',
    'Native HTML equivalents (select, input type="checkbox") implement these patterns automatically and are strongly preferred. ARIA tab patterns (tablist, tab, tabpanel) are a frequent source of this failure: arrow key navigation inside the tab list surprises many users and the pattern is commonly implemented incompletely. If the tabs reveal content panels on the same page, a button-per-panel approach with aria-expanded is often simpler and equally valid.'
  );
}

// ACC-100: extend desc and fix to cover contextual swipe actions
{
  const e = acc.find(x => x.id === 'ACC-100');
  e.desc = e.desc + ' The same principle applies to any contextual actions exposed through swipe gestures or long-press menus: if those actions are not mirrored as custom accessibility actions, VoiceOver and TalkBack users lose access to them entirely.';
  e.fix = e.fix + ' For contextual actions available through swipe gestures or long-press menus (delete, reply, archive): iOS: add UIAccessibilityCustomAction objects to the accessibilityCustomActions array of the view, one per action, with a clear name and handler block. Android: override onInitializeAccessibilityNodeInfo and call info.addAction() with AccessibilityNodeInfoCompat.AccessibilityActionCompat for each contextual action.';
  e.keywords = [...new Set([...e.keywords, 'custom action', 'swipe action', 'context menu', 'long press', 'UIAccessibilityCustomAction', 'delete action'])];
}

writeFileSync(accPath, JSON.stringify(acc, null, 2));
console.log('corpus.json updated: ACC-057, ACC-062, ACC-091, ACC-100');

// ── Personal corpus ────────────────────────────────────────────────────────

const personalPath = 'src/data/personal-corpus.json';
const personal = JSON.parse(readFileSync(personalPath, 'utf8'));

// A11Y-098: add no-h1 diagnostic sentence to desc
{
  const e = personal.find(x => x.id === 'A11Y-098');
  // Insert after "(3) no heading elements exist on the page at all, forcing linear reading from top to bottom;"
  e.desc = e.desc.replace(
    '(3) no heading elements exist on the page at all, forcing linear reading from top to bottom;',
    '(3) no heading elements exist on the page at all, the most common form being a page with no h1, which removes the primary entry point screen reader users navigate to first;'
  );
}

// A11Y-147: add ARIA tabs as a named example
{
  const e = personal.find(x => x.id === 'A11Y-147');
  e.fix = e.fix.replace(
    'Do not mix patterns from multiple widget types.',
    'Do not mix patterns from multiple widget types. ARIA tab patterns (tablist, tab, tabpanel) are a common instance: they require arrow key navigation inside the tab list, which many users do not expect, and are frequently implemented incompletely. If the purpose is to show and hide content panels, a group of buttons with aria-expanded controlling associated panels is simpler and equally valid.'
  );
}

// New entry: A11Y-176 Custom Accessibility Actions Not Provided (Native App)
// Find current max A11Y ID
const a11yIds = personal
  .filter(e => e.id && e.id.startsWith('A11Y-'))
  .map(e => parseInt(e.id.replace('A11Y-', ''), 10))
  .filter(n => !isNaN(n));
const nextId = 'A11Y-' + String(Math.max(...a11yIds) + 1).padStart(3, '0');

const newEntry = {
  id: nextId,
  sc: '4.1.2',
  title: 'Custom Accessibility Actions Not Provided (Native App)',
  wcagLevel: 'A',
  wcagVersion: '2.0',
  severity: 'High',
  platform: 'native',
  desc: 'Contextual actions available through swipe gestures, long-press menus, or custom interactions are not exposed to assistive technology. VoiceOver users cannot swipe up or down on a focused element to reveal available actions, and TalkBack users have no equivalent accessibility action. Users who cannot perform complex gestures, or who use a switch, keyboard, or voice control, lose access to these features entirely.',
  fix: 'iOS UIKit: add a UIAccessibilityCustomAction for each contextual action to the accessibilityCustomActions array of the affected view. Provide a clear name and a handler block. For list rows with swipe actions (delete, reply, archive), mirror each option as a custom action. SwiftUI: use the accessibilityAction modifier. Android: override onInitializeAccessibilityNodeInfo and call info.addAction() with AccessibilityNodeInfoCompat.AccessibilityActionCompat for each action. For RecyclerView items, expose each contextual option this way. Test with VoiceOver (swipe up/down on the focused element) and TalkBack (double-tap-hold gesture to open action menu).',
  creditNames: ['WCAG', 'Apple', 'Google'],
  keywords: [
    'custom action',
    'accessibility action',
    'UIAccessibilityCustomAction',
    'AccessibilityAction',
    'VoiceOver',
    'TalkBack',
    'swipe action',
    'context menu',
    'long press',
    'delete action',
    'reply action',
    'rotor',
    'native gesture',
    'iOS',
    'Android',
  ],
  relatedSC: ['2.1.1 Keyboard (Level A)'],
  primarySC: '4.1.2 Name, Role, Value (Level A)',
  creditLinks: [
    {
      text: 'Understanding 4.1.2 Name, Role, Value (Level A)',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
    },
    {
      text: 'Apple: UIAccessibilityCustomAction',
      url: 'https://developer.apple.com/documentation/uikit/uiaccessibilitycustomaction',
    },
  ],
  note: 'Severity is commonly High. Raise to Critical when the contextual action is the only path to complete a task, for example when swipe-to-delete is the sole way to remove an item.',
};

personal.push(newEntry);
writeFileSync(personalPath, JSON.stringify(personal, null, 2));
console.log(`personal-corpus.json updated: A11Y-098, A11Y-147, added ${nextId}`);
console.log('Personal corpus total:', personal.length);
