/**
 * @ulam/palaman — ESLint plugin (Vue SFCs)
 *
 * Flags the same ARIA anti-patterns as palaman-eslint.mjs but for Vue templates.
 * Requires vue-eslint-parser as the project's ESLint parser for .vue files.
 *
 * Usage in eslint.config.js:
 *   import vueParser from 'vue-eslint-parser'
 *   import palaman from '@ulam/palaman/vue'
 *
 *   export default [
 *     {
 *       files: ['**\/*.vue'],
 *       languageOptions: { parser: vueParser },
 *       plugins: { '@ulam/palaman': palaman },
 *       rules: palaman.configs.recommended.rules,
 *     },
 *   ]
 */

import { h } from './lib/helpers-vue.js'
import { buildRules, buildRecommendedRules } from './lib/rules.js'

const NS = '@ulam/palaman'
const rules = buildRules(h)

export default {
  meta: { name: `${NS}/vue` },
  rules,
  configs: {
    recommended: {
      plugins: [NS],
      rules: buildRecommendedRules(NS),
    },
  },
}
