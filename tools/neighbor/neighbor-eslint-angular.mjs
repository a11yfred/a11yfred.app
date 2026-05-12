/**
 * @a11yfred/neighbor — ESLint plugin (Angular templates)
 *
 * Flags the same ARIA anti-patterns as neighbor-eslint.mjs but for Angular
 * component templates. Requires @angular-eslint/template-parser.
 *
 * Rules that require ancestor walking (no-log-with-interactive-children,
 * no-menu-role-on-nav, no-heading-inside-interactive) are limited because
 * @angular-eslint/template-parser does not attach parent references to nodes.
 * Those rules will still fire for direct matches but cannot walk the tree.
 *
 * Usage in eslint.config.js:
 *   import angularTemplateParser from '@angular-eslint/template-parser'
 *   import neighbor from '@a11yfred/neighbor/angular'
 *
 *   export default [
 *     {
 *       files: ['**\/*.html'],
 *       languageOptions: { parser: angularTemplateParser },
 *       plugins: { '@a11yfred/neighbor': neighbor },
 *       rules: neighbor.configs.recommended.rules,
 *     },
 *   ]
 */

import { h } from './lib/helpers-angular.js'
import { buildRules, buildRecommendedRules, buildPortabilityRules } from './lib/rules.js'

const NS = '@a11yfred/neighbor'
const rules = buildRules(h)
const plugin = { meta: { name: `${NS}/angular` }, rules }

let angularA11y = null
try { angularA11y = (await import('@angular-eslint/eslint-plugin-template')).default } catch {}

const ANGULAR_A11Y_RULES = [
  'alt-text', 'click-events-have-key-events', 'elements-content',
  'interactive-supports-focus', 'label-has-associated-control',
  'mouse-events-have-key-events', 'no-autofocus', 'no-distracting-elements',
  'no-positive-tabindex', 'role-has-required-aria', 'table-scope', 'valid-aria',
]

function getAngularA11yRules(plugin) {
  const out = {}
  for (const rule of ANGULAR_A11Y_RULES) {
    if (plugin.rules?.[rule]) out[`@angular-eslint/template/${rule}`] = 'error'
  }
  return out
}

export default {
  ...plugin,
  configs: {
    recommended: {
      plugins: {
        [NS]: plugin,
        ...(angularA11y ? { '@angular-eslint/template': angularA11y } : {}),
      },
      rules: {
        ...(angularA11y ? getAngularA11yRules(angularA11y) : {}),
        ...buildRecommendedRules(NS),
        ...buildPortabilityRules(NS),
      },
    },
  },
}
