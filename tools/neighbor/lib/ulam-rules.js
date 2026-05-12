/**
 * neighbor/lib/ulam-rules.js
 * Lint rules specific to @ulam framework patterns.
 *
 * These rules operate on JS/JSX call expressions and import declarations,
 * not on JSX element visitors — they do not take the `h` adapter.
 *
 * Rules:
 *   no-announce-in-render        — announce() called in component body, not effect/handler
 *   no-hash-router-in-remix      — importing from siling-labuyo/hashRouter in a Remix project
 *   no-use-page-title-in-remix   — usePageTitle() used alongside react-router imports
 */

// ─── no-announce-in-render ───────────────────────────────────────────────────
//
// announce() writes to a live region. Calling it directly in a component body
// fires on every render, spamming screen readers with repeated announcements.
// It must only be called inside useEffect, useLayoutEffect, or event handlers.

const ANNOUNCE_FNS = new Set(['announce', 'clearAnnouncements'])
const SAFE_PARENT_CALLS = new Set([
  'useEffect', 'useLayoutEffect', 'useInsertionEffect',
  'useCallback', 'useMemo',
])

function isInsideSafeContext(node) {
  let cur = node.parent
  while (cur) {
    // Arrow or function expression passed as argument to useEffect etc.
    if (
      cur.type === 'CallExpression' &&
      cur.callee?.name &&
      SAFE_PARENT_CALLS.has(cur.callee.name)
    ) return true
    // Event handler: onClick={...}, onKeyDown={...}, etc.
    if (
      cur.type === 'JSXExpressionContainer' &&
      cur.parent?.type === 'JSXAttribute' &&
      cur.parent?.name?.name?.startsWith('on')
    ) return true
    // Regular function (not a component body) — event listeners, async handlers
    if (
      cur.type === 'FunctionDeclaration' ||
      cur.type === 'FunctionExpression' ||
      cur.type === 'ArrowFunctionExpression'
    ) {
      // Standalone function (not a callback) — safe
      const parent = cur.parent
      if (parent?.type !== 'CallExpression') return true
      // It's a callback — only safe if the callee is a known safe hook
      if (parent.callee?.name && SAFE_PARENT_CALLS.has(parent.callee.name)) return true
      // Could be an event handler function passed as a prop — allow it
      if (parent.callee?.type === 'MemberExpression') return true
      // Nested callback (e.g. setState inside onClick) — keep traversing upward
      // Don't bail here; let the loop continue to find the enclosing context
    }
    cur = cur.parent
  }
  return false
}

export function makeNoAnnounceInRender() {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow announce() called directly in a component render body' },
      messages: {
        inRender:
          '`{{fn}}()` called outside a useEffect or event handler will fire on every render, ' +
          'spamming screen readers. Move it into useEffect(() => { {{fn}}(...) }, [dep]) ' +
          'or call it from an event handler. (@ulam/taho)',
      },
      schema: [],
    },
    create(context) {
      return {
        CallExpression(node) {
          const name = node.callee?.name
          if (!name || !ANNOUNCE_FNS.has(name)) return
          if (isInsideSafeContext(node)) return
          context.report({ node, messageId: 'inRender', data: { fn: name } })
        },
      }
    },
  }
}

// ─── no-hash-router-in-remix ─────────────────────────────────────────────────
//
// The @ulam hash router (siling-labuyo/hashRouter, @ulam/sili/hashRouter) is a
// fallback for plain SPA builds. In Remix, file-based routing replaces it.
// Importing from the hash router in a file that also uses react-router means
// the migration to siling-mahaba is incomplete.

const HASH_ROUTER_PATHS = new Set([
  'siling-labuyo/hashRouter',
  '@ulam/sili/hashRouter',
  '@ulam/siling-labuyo/hashRouter',
])

const REMIX_PATHS = new Set([
  'react-router',
  '@remix-run/react',
  'react-router-dom',
])

export function makeNoHashRouterInRemix() {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow @ulam hash router imports alongside react-router' },
      messages: {
        hashRouter:
          'Importing from the @ulam hash router alongside react-router means the Remix migration ' +
          'is incomplete. Replace hash router usage with siling-mahaba equivalents: ' +
          'useRouter/useRouteMatch from @ulam/siling-mahaba. (@ulam/siling-mahaba)',
      },
      schema: [],
    },
    create(context) {
      let hasRemixImport = false
      const hashRouterNodes = []

      return {
        ImportDeclaration(node) {
          const src = node.source.value
          if (REMIX_PATHS.has(src)) hasRemixImport = true
          if (HASH_ROUTER_PATHS.has(src) || src.includes('/hashRouter')) {
            hashRouterNodes.push(node)
          }
        },
        'Program:exit'() {
          if (!hasRemixImport) return
          for (const node of hashRouterNodes) {
            context.report({ node, messageId: 'hashRouter' })
          }
        },
      }
    },
  }
}

// ─── no-use-page-title-in-remix ──────────────────────────────────────────────
//
// usePageTitle() from siling-labuyo sets document.title imperatively.
// In Remix, page titles are set via the `meta` export on each route module.
// Using usePageTitle() alongside react-router imports means the migration shim
// has not been cleaned up.

const USE_PAGE_TITLE_SOURCES = new Set([
  'siling-labuyo/hooks/usePageTitle',
  '@ulam/sili',
  '@ulam/siling-labuyo',
  '@ulam/siling-mahaba',
])

export function makeNoUsePageTitleInRemix() {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: 'Disallow usePageTitle() in Remix — use the meta export instead' },
      messages: {
        usePageTitle:
          '`usePageTitle()` sets document.title imperatively, which conflicts with Remix\'s ' +
          'declarative `meta` export. Export a `meta` function from each route module instead: ' +
          '`export const meta = () => [{ title: "App | Page" }]`. ' +
          'Then remove this import. (@ulam/siling-mahaba)',
      },
      schema: [],
    },
    create(context) {
      let hasRemixImport = false
      const usePageTitleNodes = []

      return {
        ImportDeclaration(node) {
          const src = node.source.value
          if (REMIX_PATHS.has(src)) hasRemixImport = true
          const importsUsePageTitle = node.specifiers.some(
            s => s.type === 'ImportSpecifier' && s.imported?.name === 'usePageTitle'
          )
          if (importsUsePageTitle && USE_PAGE_TITLE_SOURCES.has(src)) {
            usePageTitleNodes.push(node)
          }
          // Also catch wildcard re-exports like @ulam/siling-mahaba (which re-exports it)
          if (importsUsePageTitle) usePageTitleNodes.push(node)
        },
        'Program:exit'() {
          if (!hasRemixImport) return
          // Deduplicate (wildcard catch above may double-push)
          const seen = new Set()
          for (const node of usePageTitleNodes) {
            if (seen.has(node)) continue
            seen.add(node)
            context.report({ node, messageId: 'usePageTitle' })
          }
        },
      }
    },
  }
}

// ─── All ulam rule factories ──────────────────────────────────────────────────

export const ULAM_RULE_FACTORIES = {
  'no-announce-in-render':      makeNoAnnounceInRender,
  'no-hash-router-in-remix':    makeNoHashRouterInRemix,
  'no-use-page-title-in-remix': makeNoUsePageTitleInRemix,
}

export function buildUlamRules() {
  const rules = {}
  for (const [name, factory] of Object.entries(ULAM_RULE_FACTORIES)) {
    rules[name] = factory()
  }
  return rules
}

export function buildUlamRecommendedRules(ns) {
  return {
    [`${ns}/no-announce-in-render`]:      'error',
    [`${ns}/no-hash-router-in-remix`]:    'warn',
    [`${ns}/no-use-page-title-in-remix`]: 'warn',
  }
}
