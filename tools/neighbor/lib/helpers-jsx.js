/**
 * neighbor/lib/helpers-jsx.js
 * Helpers for React/JSX AST (espree + @babel/eslint-parser).
 * Nodes: JSXOpeningElement, JSXAttribute, JSXElement, JSXText, JSXExpressionContainer
 *
 * All helpers conform to the standard interface expected by lib/rules.js:
 *   getAttr(node, name)         → attribute node or null
 *   getAttrStringValue(attr)    → string | null
 *   getElementName(node)        → lowercase string | null
 *   hasAttr(node, name)         → boolean
 *   getRoleValue(node)          → string | null
 *   hasAccessibleName(node)     → boolean
 *   isInteractiveElement(node)  → boolean
 *   hasOnlyHiddenChildren(jsxOrVNode) → boolean (for link-hidden check)
 *   getParent(node)             → parent opening-element-like node | null
 *   getAncestors(node)          → iterable of opening-element-like nodes, root-ward
 *   getChildOpeningElements(node) → iterable of opening-element-like nodes (direct children)
 *   getClassName(node)          → string | null
 */

import {
  INTERACTIVE_ELEMENTS,
  INTERACTIVE_ROLES,
} from './helpers.js'

export function getAttrStringValue(attr) {
  if (!attr) return null
  const val = attr.value
  if (!val) return null
  if (val.type === 'Literal') return String(val.value)
  if (val.type === 'JSXExpressionContainer' && val.expression.type === 'Literal')
    return String(val.expression.value)
  return null
}

export function getAttr(openingElement, name) {
  return openingElement.attributes.find(
    a => a.type === 'JSXAttribute' && a.name?.name === name
  ) ?? null
}

export function getElementName(openingElement) {
  const n = openingElement.name
  if (typeof n.name === 'string') {
    // Custom React components start with uppercase — return null so rules
    // that check element names don't treat them as native HTML elements.
    if (n.name[0] !== n.name[0].toLowerCase()) return null
    return n.name.toLowerCase()
  }
  return null
}

export function hasAttr(openingElement, name) {
  return getAttr(openingElement, name) !== null
}

export function getRoleValue(openingElement) {
  return getAttrStringValue(getAttr(openingElement, 'role'))
}

export function hasAccessibleName(openingElement) {
  return hasAttr(openingElement, 'aria-label') || hasAttr(openingElement, 'aria-labelledby')
}

export function isInteractiveElement(openingElement) {
  const el = getElementName(openingElement)
  if (el && INTERACTIVE_ELEMENTS.has(el)) return true
  const role = getRoleValue(openingElement)
  return !!(role && INTERACTIVE_ROLES.has(role))
}

/** Returns true if every child of the JSXElement is aria-hidden or empty text. */
export function hasOnlyHiddenChildren(jsxElement) {
  const children = jsxElement.children ?? []
  if (children.length === 0) return false
  return children.every(child => {
    if (child.type === 'JSXText') return child.value.trim() === ''
    if (child.type === 'JSXExpressionContainer')
      return child.expression.type === 'Literal' && String(child.expression.value).trim() === ''
    if (child.type === 'JSXElement') {
      return child.openingElement.attributes.some(
        a => a.type === 'JSXAttribute' && a.name?.name === 'aria-hidden'
      )
    }
    return false
  })
}

/** Returns the parent opening element (JSXOpeningElement), or null. */
export function getParent(openingElement) {
  // openingElement → JSXElement → parent JSXElement → openingElement
  const parent = openingElement.parent?.parent
  if (parent?.type === 'JSXElement') return parent.openingElement
  return null
}

/** Returns an iterable of ancestor opening elements, root-ward. */
export function* getAncestors(openingElement) {
  let cur = getParent(openingElement)
  while (cur) {
    yield cur
    cur = getParent(cur)
  }
}

/** Returns an iterable of direct-child opening elements. */
export function* getChildOpeningElements(openingElement) {
  const jsxElement = openingElement.parent
  if (jsxElement?.type !== 'JSXElement') return
  for (const child of jsxElement.children ?? []) {
    if (child.type === 'JSXElement') yield child.openingElement
  }
}

export function getClassName(openingElement) {
  const classAttr = getAttr(openingElement, 'className') ?? getAttr(openingElement, 'class')
  return getAttrStringValue(classAttr)
}

const NEW_TAB_PATTERN = /new.tab|new.window|opens in/i

/** Recursively collect all text content from a JSX subtree. */
function collectText(node) {
  if (!node) return ''
  if (node.type === 'JSXText') return node.value
  if (node.type === 'JSXElement') {
    return (node.children ?? []).map(collectText).join('')
  }
  if (node.type === 'JSXExpressionContainer') {
    const ex = node.expression
    if (ex.type === 'Literal') return String(ex.value)
    if (ex.type === 'TemplateLiteral') return ex.quasis.map(q => q.value.raw).join('')
  }
  return ''
}

/**
 * Returns true if the link communicates "opens in new tab" via:
 *   - aria-label containing the phrase
 *   - any descendant text content containing the phrase (e.g. sr-only span)
 */
export function hasNewTabWarning(openingElement) {
  const labelVal = (getAttrStringValue(getAttr(openingElement, 'aria-label')) ?? '').toLowerCase()
  if (NEW_TAB_PATTERN.test(labelVal)) return true
  const jsxElement = openingElement.parent
  if (jsxElement?.type !== 'JSXElement') return false
  const childText = collectText(jsxElement)
  return NEW_TAB_PATTERN.test(childText)
}

/** Wrap all JSX helpers into the standard `h` interface expected by rules. */
export const h = {
  getAttr,
  getAttrStringValue,
  getElementName,
  hasAttr,
  getRoleValue,
  hasAccessibleName,
  isInteractiveElement,
  hasOnlyHiddenChildren: (openingElement) => {
    const el = openingElement.parent
    return el?.type === 'JSXElement' ? hasOnlyHiddenChildren(el) : false
  },
  hasNewTabWarning,
  getParent,
  getAncestors,
  getChildOpeningElements,
  getClassName,
  // Node visitor key for ESLint — what AST node type fires the rule
  elementVisitor: 'JSXOpeningElement',
  // For rules that need to visit element+children (group-without-name, etc.)
  elementWithChildrenVisitor: 'JSXElement',
  /** For elementWithChildrenVisitor: extract the opening element from the wrapper node */
  getOpeningElement: (node) => node.openingElement,
  /** For elementWithChildrenVisitor: get direct child opening elements */
  getChildOpeningElementsFromWrapper: (node) => {
    return (node.children ?? [])
      .filter(c => c.type === 'JSXElement')
      .map(c => c.openingElement)
  },
}
