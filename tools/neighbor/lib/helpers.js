/**
 * neighbor/lib/helpers.js
 * Shared constants and pure data — no AST dependency.
 */

export const INTERACTIVE_ELEMENTS = new Set([
  'a', 'button', 'input', 'select', 'textarea', 'details', 'summary',
])

export const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'checkbox', 'radio', 'textbox', 'combobox', 'listbox',
  'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'tab', 'switch',
  'slider', 'spinbutton', 'searchbox', 'gridcell', 'treeitem',
])

// Truly generic containers — not landmarks, not interactive, not sectioning
export const GENERIC_CONTAINERS = new Set(['div', 'span', 'p'])

// Void/leaf elements that cannot have children (aria-owns on these is wrong)
export const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
  'meta', 'param', 'source', 'track', 'wbr',
])

export const HEADING_ELEMENTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

export const NAV_MENU_ROLES = new Set([
  'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
])

export const ROLES_REQUIRING_NAME = new Set([
  'region', 'dialog', 'alertdialog', 'application', 'marquee', 'searchbox',
])

export const FORM_ELEMENTS = new Set(['input', 'select', 'textarea'])

export const CAROUSEL_CLASS_PATTERN = /carousel|slider|slideshow|rotator/i
