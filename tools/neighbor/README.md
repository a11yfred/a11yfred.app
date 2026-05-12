# @a11yfred/neighbor

Accessibility linting plugin for ESLint and Stylelint. Catches ARIA anti-patterns, missing semantic structure, and HTML spec violations that existing plugins miss or only partially cover.

## Packages

| Entry point | Covers |
|---|---|
| `@a11yfred/neighbor/eslint` | React / JSX |
| `@a11yfred/neighbor/eslint-vue` | Vue SFCs |
| `@a11yfred/neighbor/eslint-angular` | Angular templates |
| `@a11yfred/neighbor` (default) | Stylelint — CSS user-preference fallbacks |

## Coverage gap map

The table below shows how neighbor fills gaps across frameworks. Each ecosystem has a base plugin that covers the fundamentals; neighbor adds the layer above it.

### React / JSX

Base: **eslint-plugin-jsx-a11y** (peer, optional)

| What neighbor adds | Rule | SC |
|---|---|---|
| `aria-disabled` keeps element reachable | `prefer-aria-disabled` | 2.1.1 |
| `aria-disabled` must block click handler | `no-unblocked-aria-disabled` | 2.1.1 |
| `aria-label` on generic element with no role | `no-aria-label-on-generic` | 1.3.1 |
| `role="alert"` overuse prompt | `warn-role-alert` | 4.1.3 |
| `aria-live="assertive"` outside `role="alert"` | `no-assertive-live-overuse` | 4.1.3 |
| `role="dialog"` / `alertdialog` requires accessible name | `no-roles-without-name` | 4.1.2 |
| `role="dialog"` strongly recommended to have close button | `no-dialog-without-close` | 2.1.2 |
| `role="group"` + form controls requires name | `no-group-without-name` | 1.3.1 |
| `role="tooltip"` requires `id` on the tooltip element | `no-tooltip-role-misuse` | 4.1.2 |
| `role="application"` disables AT browse mode | `no-application-role` | — |
| `role="grid"` almost always wrong | `no-grid-role` | — |
| `role="menu"` on nav triggers wrong AT mode | `no-menu-role-on-nav` | 2.1.1 |
| `role="presentation"` / `none` on focusable element | `no-presentation-on-focusable` | 2.1.1 |
| `role="log"` must not contain interactive children | `no-log-with-interactive-children` | 4.1.2 |
| `role="img"` requires accessible name | `no-image-role-without-name` | 4.1.2 |
| `role="tab"` requires `aria-selected`; `tabpanel` requires `aria-labelledby` | `no-tabs-without-structure` | 4.1.2 |
| `role="tab"` should declare `aria-controls` | `no-tab-without-controls` | 4.1.2 |
| `role="combobox"` requires `aria-expanded` | `no-combobox-without-expanded` | 4.1.2 |
| `role="slider"` requires value range attributes | `no-slider-without-range` | 4.1.2 |
| `role="spinbutton"` requires value range attributes | `no-spinbutton-without-range` | 4.1.2 |
| `role="listbox"` requires `role="option"` children | `no-listbox-without-option` | 4.1.2 |
| `role="tree"` requires `role="treeitem"` children | `no-tree-without-treeitem` | 4.1.2 |
| `role="feed"` requires `role="article"` children | `no-feed-without-article` | 4.1.2 |
| `aria-hidden="true"` + `role="none"` is redundant | `no-redundant-aria-hidden-with-presentation` | — |
| `aria-roledescription` does not translate | `no-aria-roledescription` | — |
| `aria-readonly` has poor AT support | `no-aria-readonly` | — |
| `aria-owns` on void element | `no-aria-owns-on-void` | 4.1.2 |
| `aria-activedescendant` requires non-empty static ID | `no-aria-activedescendant-without-id` | 4.1.2 |
| `aria-required` only valid on form-control roles | `no-aria-required-on-non-form` | 4.1.2 |
| `<a>` with only aria-hidden children (phantom link) | `no-aria-hidden-in-link` | 4.1.2 |
| `<button>` with only aria-hidden children (no name) | `no-empty-button` | 4.1.2 |
| `<input>` placeholder used as sole label | `no-placeholder-only` | 1.3.1 |
| `<input>` with invalid type value | `no-input-type-invalid` | 1.3.5 |
| `<button>` inside `<form>` missing explicit type | `no-button-type-missing` | HTML spec |
| `<summary>` outside `<details>` | `no-summary-without-details` | 2.1.1 |
| `<a href="#">` used as a button | `no-href-hash` | 2.1.1 |
| `target="_blank"` without new-tab disclosure | `no-target-blank-without-label` | 3.2.2 |
| Duplicate `id` breaks ARIA relationships | `no-duplicate-id` | 1.3.1 |
| Positive `tabIndex` breaks tab order | `no-positive-tabindex` | 2.4.3 |
| `<h1>`–`<h6>` inside interactive element | `no-heading-inside-interactive` | 4.1.2 |
| `title` attribute as only accessible name | `no-title-as-label` | 2.4.6 |
| `<video>`/`<audio autoplay>` without controls | `no-autoplay-without-controls` | 1.4.2 |
| Mouse-only events without keyboard equivalents | `no-mouse-only-events` | 2.1.1 |
| `aria-activedescendant` element must be focusable | `no-aria-activedescendant-without-id` | 4.1.2 |

### Vue SFCs

Base: **eslint-plugin-vuejs-accessibility** (peer, optional)

neighbor adds everything in the React table above, adapted for `VElement` AST nodes, plus the portability rules below that fill gaps vuejs-accessibility does not cover.

| What neighbor adds | Rule | SC |
|---|---|---|
| Ambiguous link text ("click here", "read more") | `no-anchor-ambiguous-text` | 2.4.4 |
| `<a>` with no content and no accessible name | `no-anchor-no-content` | 4.1.2 |
| `aria-activedescendant` element must have `tabIndex` | `no-aria-activedescendant-no-tabindex` | 4.1.2 |
| Invalid ARIA attribute values (boolean/tristate/token) | `no-invalid-aria-prop-value` | 4.1.2 |
| Invalid `autocomplete` token | `no-autocomplete-invalid` | 1.3.5 |
| `<h1>`–`<h6>` with no content | `no-heading-no-content` | 2.4.6 |
| `<iframe>` without `title` | `no-iframe-no-title` | 4.1.2 |
| Alt text contains "image", "photo", etc. | `no-img-redundant-alt` | 1.1.1 |
| `accessKey` attribute | `no-access-key` | 2.1.4 |
| Interactive role on non-interactive element without keyboard handler | `no-noninteractive-to-interactive-role` | 4.1.2 |
| Non-interactive element with `tabIndex >= 0` and no role | `no-noninteractive-tabindex` | 4.1.2 |
| Prefer native HTML element over ARIA role equivalent | `prefer-semantic-element` | 4.1.2 |
| ARIA attribute not supported by the element's role | `no-role-supports-aria-props` | 4.1.2 |
| `scope` attribute on `<td>` (only valid on `<th>`) | `no-scope-on-td` | 1.3.1 |

> **Note:** `no-summary-without-details` and `no-button-type-missing` require parent-node traversal. They work in JSX and Vue. In Angular templates the parser does not attach parent pointers so these rules silently pass — see Angular notes below.

### Angular templates

Base: **@angular-eslint/eslint-plugin-template** (peer, optional)

neighbor adds the same rule set as Vue (all recommended + portability rules), adapted for `TmplAstElement` nodes.

| Angular-specific limitation | Affected rules |
|---|---|
| Parser does not set parent pointers — ancestor walking unavailable | `no-summary-without-details`, `no-button-type-missing`, `no-log-with-interactive-children`, `no-menu-role-on-nav`, `no-heading-inside-interactive` |
| Bound attributes (`[aria-label]="expr"`) are not statically analyzable | Any rule checking ARIA attribute values |

### Remix / SSR frameworks

| Version | Renderer | neighbor entry point |
| --- | --- | --- |
| Remix v2 | React | `@a11yfred/neighbor/eslint` + `eslint-plugin-jsx-a11y` |
| Remix v3 | Preact fork (no React) | `@a11yfred/neighbor/eslint` + `eslint-plugin-jsx-a11y` |
| Next.js | React | `@a11yfred/neighbor/eslint` + `eslint-plugin-jsx-a11y` |
| Astro (`.tsx` islands) | React / Preact | `@a11yfred/neighbor/eslint` + `eslint-plugin-jsx-a11y` |

Remix v3 abandons React in favour of a Preact fork with a different component model (no hooks, native DOM events), but template files are still `.jsx`/`.tsx`. ESLint sees the same JSX AST regardless — neighbor and jsx-a11y rules apply identically. Drop `eslint-plugin-react` and `eslint-plugin-react-hooks` from Remix v3 projects; everything else stays the same.

### Static sites and vanilla JS

ESLint does not parse plain HTML files natively. For static sites:

- Use **axe-core** via the browser DevTools or CI runner (covers the same rule surface at runtime).
- Pair with **HTMLHint** or **html-validate** for HTML spec validation (`no-input-type-invalid`, `no-summary-without-details`, `no-button-type-missing` equivalents).
- neighbor's Stylelint plugin (`@a11yfred/neighbor`) applies to any CSS/SCSS regardless of framework — no JS required.

## Peer dependencies

| Peer | Required | Required for |
| --- | --- | --- |
| `eslint >= 8` | optional | Any ESLint entry point |
| `eslint-plugin-jsx-a11y >= 6` | **required** | React / JSX config — neighbor deliberately omits 10+ rules that jsx-a11y covers; without it those checks silently disappear |
| `eslint-plugin-vuejs-accessibility >= 2` | optional | Vue config (bundled into recommended when present) |
| `@angular-eslint/eslint-plugin-template >= 17` | optional | Angular config (bundled into recommended when present) |
| `stylelint >= 14` | optional | Stylelint config |

## Rule severity defaults

| Severity | Meaning |
|---|---|
| `error` | Definite AT breakage or HTML spec violation — fix required |
| `warn` | Strong guidance with occasional legitimate overrides — review required |

All rules can be individually overridden in your ESLint config.
