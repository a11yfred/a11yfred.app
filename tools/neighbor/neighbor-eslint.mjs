/**
 * @a11yfred/neighbor — ESLint plugin (React / JSX)
 *
 * Flags ARIA patterns that are widely derided, semantically wrong, or have
 * poor/no AT support — but are not caught by eslint-plugin-jsx-a11y recommended.
 *
 * Sources and credits:
 *   Adrian Roselli         adrianroselli.com
 *   Heydon Pickering       heydonworks.com, inclusive-components.design
 *   Scott O'Hara           scottohara.me
 *   Patrick Lauke          splintered.co.uk, patrickhlauke.github.io/aria
 *   Karl Groves            karlgroves.com
 *   Marcy Sutton           marcysutton.com
 *   Eric Eggert            yatil.net
 *   WAI-ARIA APG           w3.org/WAI/ARIA/apg
 *   ARIA 1.2 spec          w3.org/TR/wai-aria-1.2
 *
 * Rules already covered by jsx-a11y recommended (not duplicated here):
 *   aria-hidden on focusable           → jsx-a11y/no-aria-hidden-on-focusable
 *   presentation/none on interactive   → jsx-a11y/no-interactive-element-to-noninteractive-role
 *   redundant role                     → jsx-a11y/no-redundant-roles
 *   prefer semantic element            → jsx-a11y/prefer-tag-over-role
 *   invalid role value                 → jsx-a11y/aria-role
 *   invalid aria prop                  → jsx-a11y/aria-props
 *   tabindex > 0                       → jsx-a11y/tabindex-no-positive
 *   tabindex on non-interactive        → jsx-a11y/no-noninteractive-tabindex
 *   img missing alt                    → jsx-a11y/alt-text
 *   input missing label                → jsx-a11y/label-has-associated-control
 */

import jsxA11y from 'eslint-plugin-jsx-a11y'
import { h } from './lib/helpers-jsx.js'
import { buildRules, buildRecommendedRules } from './lib/rules.js'
import { buildUlamRules, buildUlamRecommendedRules } from './lib/ulam-rules.js'

const NS = '@a11yfred/neighbor'
const rules = { ...buildRules(h), ...buildUlamRules() }

const plugin = { meta: { name: NS }, rules }

export default {
  ...plugin,
  configs: {
    recommended: {
      plugins: {
        [NS]: plugin,
        'jsx-a11y': jsxA11y,
      },
      rules: {
        ...jsxA11y.configs.recommended.rules,
        ...buildRecommendedRules(NS),
        ...buildUlamRecommendedRules(NS),
      },
    },
  },
}
