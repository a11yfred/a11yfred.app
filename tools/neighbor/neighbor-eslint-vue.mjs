/**
 * @a11yfred/neighbor — ESLint plugin (Vue SFCs)
 *
 * Flags the same ARIA anti-patterns as neighbor-eslint.mjs but for Vue templates.
 * Requires vue-eslint-parser as the project's ESLint parser for .vue files.
 *
 * Usage in eslint.config.js:
 *   import vueParser from 'vue-eslint-parser'
 *   import neighbor from '@a11yfred/neighbor/vue'
 *
 *   export default [
 *     {
 *       files: ['**\/*.vue'],
 *       languageOptions: { parser: vueParser },
 *       plugins: { '@a11yfred/neighbor': neighbor },
 *       rules: neighbor.configs.recommended.rules,
 *     },
 *   ]
 */

import { h } from './lib/helpers-vue.js'
import { buildRules, buildRecommendedRules, buildPortabilityRules } from './lib/rules.js'

const NS = '@a11yfred/neighbor'
const rules = buildRules(h)
const plugin = { meta: { name: `${NS}/vue` }, rules }

let vueA11y = null
try { vueA11y = (await import('eslint-plugin-vuejs-accessibility')).default } catch {}

export default {
  ...plugin,
  configs: {
    recommended: {
      plugins: {
        [NS]: plugin,
        ...(vueA11y ? { 'vuejs-accessibility': vueA11y } : {}),
      },
      rules: {
        ...(vueA11y ? vueA11y.configs['flat/recommended'].rules : {}),
        ...buildRecommendedRules(NS),
        ...buildPortabilityRules(NS),
      },
    },
  },
}
