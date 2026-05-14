// Adds ACC-107 through ACC-111 to corpus.json
// Source: legacy corpus gap analysis (ATH-159, ATH-092, ATH-096, ATH-132, ATH-139)

import { readFileSync, writeFileSync } from 'fs';

const corpusPath = 'src/data/corpus.json';
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));

const newEntries = [
  {
    id: 'ACC-107',
    sc: '4.1.2',
    title: 'Custom Accessibility Actions Not Provided (Native App)',
    wcagLevel: 'A',
    wcagVersion: '2.0',
    severity: 'High',
    platform: 'native',
    desc: 'Contextual actions available through swipe gestures, long-press menus, or custom interactions are not exposed to assistive technology. VoiceOver users cannot use the rotor or swipe up/down to reveal actions on a focused element, and TalkBack users have no equivalent accessibility action. Users who rely on assistive technology or cannot perform complex gestures lose access to these features entirely.',
    fix: 'iOS: add UIAccessibilityCustomAction objects to the accessibilityCustomActions array of the affected view. Provide a clear action name and a handler block for each. For list rows with swipe actions (delete, reply, archive), mirror each swipe option as a custom action. SwiftUI: use the accessibilityAction modifier. Android: override onInitializeAccessibilityNodeInfo and add AccessibilityNodeInfoCompat.AccessibilityActionCompat actions for each contextual operation. For RecyclerView items, expose each action this way. Test with VoiceOver (swipe up/down on the element) and TalkBack (double-tap-hold gesture).',
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
    note: 'Severity is commonly High. It rises to Critical when the hidden contextual actions are the only way to perform a task, for example when a swipe-to-delete action is the sole delete path.',
  },
  {
    id: 'ACC-108',
    sc: '',
    title: 'Positive tabindex Values Disrupt Keyboard Focus Order',
    wcagLevel: 'A',
    wcagVersion: '2.0',
    severity: 'Best Practice',
    platform: 'web',
    desc: 'Elements use positive tabindex values (tabindex="1", tabindex="2", and so on) to manually control the keyboard focus sequence. Positive tabindex creates a separate priority tab ring that moves before anything with tabindex="0" or no tabindex. This is nearly impossible to maintain correctly as content changes and routinely produces confusing, unpredictable focus order in practice.',
    fix: 'Remove all positive tabindex values. Use tabindex="0" to include a custom interactive element in the natural document order, and tabindex="-1" to make an element focusable by script without placing it in the tab sequence. Fix focus order problems by reordering elements in the DOM, not by overriding with tabindex integers.',
    creditNames: ['Deque', 'Adrian Roselli'],
    keywords: [
      'tabindex',
      'positive tabindex',
      'tabindex 1',
      'tabindex 2',
      'focus order',
      'tab order',
      'tab sequence',
      'keyboard navigation',
      'focus management',
    ],
    relatedSC: ['2.4.3 Focus Order (Level A)'],
    primarySC: '',
    creditLinks: [
      {
        text: 'Deque: Avoid positive tabindex',
        url: 'https://dequeuniversity.com/tips/tabindex-positive-numbers',
      },
    ],
  },
  {
    id: 'ACC-109',
    sc: '',
    title: 'Custom CSS Scrollbar Overrides User Accessibility Settings',
    wcagLevel: 'AA',
    wcagVersion: '2.1',
    severity: 'Best Practice',
    platform: 'web',
    desc: 'Custom CSS scrollbar styles override the operating system native scrollbars. Custom scrollbars commonly become invisible or unusable in Windows Forced Colors Mode (High Contrast), ignore OS-level scrollbar width preferences configured by low-vision users, and frequently fail the 3:1 non-text contrast requirement against their background. Users who depend on scrollbar visibility for orientation lose a functional navigation aid.',
    fix: 'Remove custom scrollbar CSS (::-webkit-scrollbar, scrollbar-color, scrollbar-width: thin). Let the browser render native scrollbars that automatically adapt to OS accessibility settings, including Forced Colors Mode and user-defined scrollbar sizes. If a styled scrollbar is required for design reasons, test it against all forced-colors media query states and verify the track, thumb, and gutter each pass 3:1 contrast against their respective backgrounds.',
    creditNames: ['Eric Bailey', 'WCAG'],
    keywords: [
      'custom scrollbar',
      'css scrollbar',
      '::-webkit-scrollbar',
      'scrollbar-color',
      'scrollbar styling',
      'scrollbar contrast',
      'scrollbar visibility',
      'forced colors',
      'high contrast mode',
      'windows high contrast',
      'low vision',
    ],
    relatedSC: ['1.4.11 Non-text Contrast (Level AA)'],
    primarySC: '',
    creditLinks: [
      {
        text: "Eric Bailey: Don't use custom CSS scrollbars",
        url: 'https://ericwbailey.website/published/dont-use-custom-css-scrollbars',
      },
    ],
  },
  {
    id: 'ACC-110',
    sc: '',
    title: 'Page Has No H1 Heading',
    wcagLevel: 'AA',
    wcagVersion: '2.0',
    severity: 'Best Practice',
    platform: 'both',
    desc: 'The page has no h1 heading. WCAG does not require a specific h1, but the h1 is the most predictable entry point for screen reader users navigating by heading. Without it, users who skip to the first heading to orient themselves find either nothing or a heading that does not name the page topic.',
    fix: 'Add a single h1 to each page that names the main topic or purpose of that page. On pages where the page title and the h1 would be identical, that is expected and correct. Avoid multiple h1 elements on a single page. All section headings should use h2 through h6 in logical descending order beneath the h1.',
    creditNames: ['TPGi', 'WCAG'],
    keywords: [
      'h1',
      'heading',
      'heading level one',
      'missing h1',
      'no h1',
      'page structure',
      'screen reader navigation',
      'heading navigation',
    ],
    relatedSC: ['2.4.6 Headings and Labels (Level AA)', '1.3.1 Info and Relationships (Level A)'],
    primarySC: '',
    creditLinks: [
      {
        text: 'TPGi: When do headings fail WCAG?',
        url: 'https://www.tpgi.com/when-do-headings-fail-wcag/',
      },
    ],
  },
  {
    id: 'ACC-111',
    sc: '',
    title: 'ARIA Tab Pattern Used Where a Simpler Alternative Would Work',
    wcagLevel: 'A',
    wcagVersion: '2.1',
    severity: 'Best Practice',
    platform: 'web',
    desc: 'The component uses ARIA tabs (role="tablist", role="tab", role="tabpanel"), which require arrow key navigation inside the tab list. Many users do not expect arrow key navigation in this context, and the pattern is difficult to implement correctly. Common failures include arrow keys not working, Tab key skipping the tab panel, or the selected tab not being announced. Adopting the ARIA tab pattern incurs a high implementation cost for a user experience that simpler patterns can match.',
    fix: 'Consider replacing ARIA tabs with a simpler pattern. If the tabs link to different pages or sections, use real anchor links. If the tabs show and hide content panels on the same page, a group of buttons each controlling a panel with aria-expanded, or an accordion pattern, provides equivalent functionality with a lower implementation burden and a more predictable keyboard experience. If you keep ARIA tabs, implement the full APG Tabs pattern: arrow keys move between tabs in the tablist, Tab moves focus to the active tabpanel, and the correct aria-selected and aria-controls relationships are set.',
    creditNames: ['WAI-ARIA APG', 'Heydon Pickering'],
    keywords: [
      'aria tabs',
      'aria tab',
      'tablist',
      'tabpanel',
      'tab role',
      'arrow key navigation',
      'keyboard pattern',
      'overengineering',
      'accordion alternative',
    ],
    relatedSC: ['4.1.2 Name, Role, Value (Level A)', '2.1.1 Keyboard (Level A)'],
    primarySC: '',
    creditLinks: [
      {
        text: 'APG: Tabs Pattern',
        url: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
      },
      {
        text: 'Inclusive Components: Tabbed Interfaces',
        url: 'https://inclusive-components.design/tabbed-interfaces/',
      },
    ],
  },
];

// Append new entries (after the existing ACC entries, before any ATH entries if present)
const accEntries = corpus.filter(e => e.id.startsWith('ACC-'));
const nonAccEntries = corpus.filter(e => !e.id.startsWith('ACC-'));

const updated = [...accEntries, ...newEntries, ...nonAccEntries];
writeFileSync(corpusPath, JSON.stringify(updated, null, 2));

console.log('Added ACC-107 through ACC-111');
console.log('New total ACC entries:', updated.filter(e => e.id.startsWith('ACC-')).length);
console.log('Total corpus entries:', updated.length);
