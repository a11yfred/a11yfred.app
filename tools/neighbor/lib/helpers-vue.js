/**
 * neighbor/lib/helpers-vue.js
 * Helpers for Vue SFC AST via vue-eslint-parser.
 * Nodes: VElement (has startTag.attributes), VAttribute, VLiteral, VExpressionContainer
 *
 * vue-eslint-parser docs: https://github.com/vuejs/vue-eslint-parser/blob/master/docs/ast.md
 * Rule visitor: 'VElement' (fired for every HTML element in the template)
 */

import {
  INTERACTIVE_ELEMENTS,
  INTERACTIVE_ROLES,
} from './helpers.js'

/**
 * In vue-eslint-parser, an attribute is a VAttribute node.
 * Plain attribute:    { type: 'VAttribute', key: { name: 'role' }, value: { type: 'VLiteral', value: '"dialog"' } }
 * v-bind shorthand:  { type: 'VAttribute', directive: true, key: { argument: { name: 'role' } }, value: VExpressionContainer }
 * We only read static (non-directive) attributes for ARIA checks.
 */
export function getAttr(vElement, name) {
  const attrs = vElement.startTag?.attributes ?? []
  return attrs.find(a => !a.directive && a.key?.name === name) ?? null
}

export function getAttrStringValue(attr) {
  if (!attr) return null
  // VLiteral.value includes surrounding quotes — strip them
  const raw = attr.value?.value
  if (typeof raw === 'string') return raw.replace(/^["']|["']$/g, '')
  return null
}

export function getElementName(vElement) {
  const raw = vElement.rawName ?? vElement.name ?? ''
  if (!raw) return null
  // Vue custom components can be PascalCase (MyButton) or kebab-case (my-button).
  // PascalCase names would lowercase to a native element name collision (e.g. Button → button).
  // Return null for PascalCase so rules don't treat custom components as native elements.
  if (raw[0] !== raw[0].toLowerCase()) return null
  return raw.toLowerCase()
}

export function hasAttr(vElement, name) {
  return getAttr(vElement, name) !== null
}

export function getRoleValue(vElement) {
  return getAttrStringValue(getAttr(vElement, 'role'))
}

export function hasAccessibleName(vElement) {
  return hasAttr(vElement, 'aria-label') || hasAttr(vElement, 'aria-labelledby')
}

export function isInteractiveElement(vElement) {
  const el = getElementName(vElement)
  if (el && INTERACTIVE_ELEMENTS.has(el)) return true
  const role = getRoleValue(vElement)
  return !!(role && INTERACTIVE_ROLES.has(role))
}

/** Returns true if every child element is aria-hidden or the element has no visible text children. */
export function hasOnlyHiddenChildren(vElement) {
  const children = vElement.children ?? []
  if (children.length === 0) return false
  return children.every(child => {
    if (child.type === 'VText') return child.value.trim() === ''
    if (child.type === 'VElement') {
      const attrs = child.startTag?.attributes ?? []
      return attrs.some(a => !a.directive && a.key?.name === 'aria-hidden')
    }
    return false
  })
}

const NEW_TAB_PATTERN = /new.tab|new.window|opens in/i

function collectVueText(node) {
  if (!node) return ''
  if (node.type === 'VText') return node.value ?? ''
  if (node.type === 'VElement') return (node.children ?? []).map(collectVueText).join('')
  return ''
}

export function hasNewTabWarning(vElement) {
  const labelVal = (getAttrStringValue(getAttr(vElement, 'aria-label')) ?? '').toLowerCase()
  if (NEW_TAB_PATTERN.test(labelVal)) return true
  const childText = (vElement.children ?? []).map(collectVueText).join('')
  return NEW_TAB_PATTERN.test(childText)
}

/** Parent VElement, or null. */
export function getParent(vElement) {
  const p = vElement.parent
  return p?.type === 'VElement' ? p : null
}

export function* getAncestors(vElement) {
  let cur = getParent(vElement)
  while (cur) {
    yield cur
    cur = getParent(cur)
  }
}

export function* getChildOpeningElements(vElement) {
  for (const child of vElement.children ?? []) {
    if (child.type === 'VElement') yield child
  }
}

export function getClassName(vElement) {
  return getAttrStringValue(getAttr(vElement, 'class'))
}

export const h = {
  getAttr,
  getAttrStringValue,
  getElementName,
  hasAttr,
  getRoleValue,
  hasAccessibleName,
  isInteractiveElement,
  hasOnlyHiddenChildren,
  hasNewTabWarning,
  getParent,
  getAncestors,
  getChildOpeningElements,
  getClassName,
  elementVisitor: 'VElement',
  elementWithChildrenVisitor: 'VElement',
  getOpeningElement: (node) => node,
  getChildOpeningElementsFromWrapper: (node) => (node.children ?? []).filter(c => c.type === 'VElement'),
}
