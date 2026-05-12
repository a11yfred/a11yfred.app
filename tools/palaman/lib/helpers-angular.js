/**
 * palaman/lib/helpers-angular.js
 * Helpers for Angular template AST via @angular-eslint/template-parser.
 *
 * Parser: @angular-eslint/eslint-plugin-template provides its own rule format.
 * Node type for elements: 'Element$1' (from @angular-eslint/template-parser, the class is
 * TmplAstElement). The node has:
 *   node.name          — tag name string
 *   node.attributes    — TmplAstTextAttribute[] (static attrs)
 *   node.inputs        — TmplAstBoundAttribute[] (property bindings)
 *   node.children      — TmplAstNode[]
 *
 * We only inspect static (non-bound) attributes for ARIA checks.
 * Bound attributes ([aria-label]="expr") cannot be statically analyzed.
 *
 * Angular ESLint rule visitor uses standard ESLint `create(context)` but the
 * parser emits different node types. The visitor key from @angular-eslint is
 * 'Element$1' (the internal class name exposed via the parser).
 */

import {
  INTERACTIVE_ELEMENTS,
  INTERACTIVE_ROLES,
} from './helpers.js'

/** Find a static TmplAstTextAttribute by name. */
export function getAttr(tmplElement, name) {
  return (tmplElement.attributes ?? []).find(a => a.name === name) ?? null
}

/** TmplAstTextAttribute.value is a plain string. */
export function getAttrStringValue(attr) {
  if (!attr) return null
  return typeof attr.value === 'string' ? attr.value || null : null
}

export function getElementName(tmplElement) {
  return (tmplElement.name ?? '').toLowerCase() || null
}

export function hasAttr(tmplElement, name) {
  return getAttr(tmplElement, name) !== null
}

export function getRoleValue(tmplElement) {
  return getAttrStringValue(getAttr(tmplElement, 'role'))
}

export function hasAccessibleName(tmplElement) {
  return hasAttr(tmplElement, 'aria-label') || hasAttr(tmplElement, 'aria-labelledby')
}

export function isInteractiveElement(tmplElement) {
  const el = getElementName(tmplElement)
  if (el && INTERACTIVE_ELEMENTS.has(el)) return true
  const role = getRoleValue(tmplElement)
  return !!(role && INTERACTIVE_ROLES.has(role))
}

export function hasOnlyHiddenChildren(tmplElement) {
  const children = tmplElement.children ?? []
  if (children.length === 0) return false
  return children.every(child => {
    if (child.constructor?.name === 'TmplAstText') return (child.value ?? '').trim() === ''
    if (child.constructor?.name === 'TmplAstElement') {
      return (child.attributes ?? []).some(a => a.name === 'aria-hidden')
    }
    return false
  })
}

export function getParent(tmplElement) {
  // @angular-eslint/template-parser does not set parent on AST nodes —
  // ancestor walking is not available without tracking the stack ourselves.
  // Rules needing ancestor traversal are skipped for Angular.
  return null
}

export function* getAncestors(_tmplElement) { /* not available */ }

export function* getChildOpeningElements(tmplElement) {
  for (const child of tmplElement.children ?? []) {
    if (child.constructor?.name === 'TmplAstElement') yield child
  }
}

export function getClassName(tmplElement) {
  return getAttrStringValue(getAttr(tmplElement, 'class'))
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
  getParent,
  getAncestors,
  getChildOpeningElements,
  getClassName,
  elementVisitor: 'Element$1',
  elementWithChildrenVisitor: 'Element$1',
  getOpeningElement: (node) => node,
  getChildOpeningElementsFromWrapper: (node) =>
    (node.children ?? []).filter(c => c.constructor?.name === 'TmplAstElement'),
}
