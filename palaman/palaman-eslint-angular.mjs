/**
 * @ulam/palaman — ESLint plugin (Angular templates)
 *
 * Flags the same ARIA anti-patterns as palaman-eslint.mjs but for Angular
 * component templates. Requires @angular-eslint/template-parser.
 *
 * Rules that require ancestor walking (no-log-with-interactive-children,
 * no-menu-role-on-nav, no-heading-inside-interactive) are limited because
 * @angular-eslint/template-parser does not attach parent references to nodes.
 * Those rules will still fire for direct matches but cannot walk the tree.
 *
 * Usage in eslint.config.js:
 *   import angularTemplateParser from '@angular-eslint/template-parser'
 *   import palaman from '@ulam/palaman/angular'
 *
 *   export default [
 *     {
 *       files: ['**\/*.html'],
 *       languageOptions: { parser: angularTemplateParser },
 *       plugins: { '@ulam/palaman': palaman },
 *       rules: palaman.configs.recommended.rules,
 *     },
 *   ]
 */

import { h } from './lib/helpers-angular.js'
import { buildRules, buildRecommendedRules } from './lib/rules.js'

const NS = '@ulam/palaman'
const rules = buildRules(h)

export default {
  meta: { name: `${NS}/angular` },
  rules,
  configs: {
    recommended: {
      plugins: [NS],
      rules: buildRecommendedRules(NS),
    },
  },
}
