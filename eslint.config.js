import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import neighbor from './tools/neighbor/neighbor-eslint.mjs'

export default [
  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      ...neighbor.configs.recommended.plugins,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // React
      ...react.configs.recommended.rules,

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // jsx-a11y + @a11yfred/neighbor (composed in neighbor recommended)
      ...neighbor.configs.recommended.rules,
      // autoFocus is intentional on the search input — single-purpose tool where
      // search is always the first action. Downgraded to warn, not suppressed.
      'jsx-a11y/no-autofocus': 'warn',

      // @a11yfred/neighbor — bad ARIA patterns not caught by jsx-a11y recommended
      // errors — definite breakage or phantom controls
      '@a11yfred/neighbor/no-aria-label-on-generic': 'error',
      '@a11yfred/neighbor/no-assertive-live-overuse': 'error',
      '@a11yfred/neighbor/no-unblocked-aria-disabled': 'error',
      '@a11yfred/neighbor/no-roles-without-name': 'error',
      '@a11yfred/neighbor/no-group-without-name': 'error',
      '@a11yfred/neighbor/no-presentation-on-focusable': 'error',
      '@a11yfred/neighbor/no-log-with-interactive-children': 'error',
      '@a11yfred/neighbor/no-aria-hidden-in-link': 'error',
      '@a11yfred/neighbor/no-redundant-aria-hidden-with-presentation': 'error',
      '@a11yfred/neighbor/no-aria-owns-on-void': 'error',
      '@a11yfred/neighbor/no-title-as-label': 'error',
      // warnings — strong guidance, occasional legitimate overrides
      '@a11yfred/neighbor/no-tooltip-role-misuse': 'warn',
      '@a11yfred/neighbor/no-application-role': 'warn',
      '@a11yfred/neighbor/no-grid-role': 'warn',
      '@a11yfred/neighbor/no-menu-role-on-nav': 'warn',
      '@a11yfred/neighbor/no-aria-roledescription': 'warn',
      '@a11yfred/neighbor/no-aria-readonly': 'warn',
      '@a11yfred/neighbor/no-href-hash': 'warn',
      '@a11yfred/neighbor/no-tabs-without-structure': 'error',
      '@a11yfred/neighbor/no-tab-without-controls': 'warn',
      '@a11yfred/neighbor/no-positive-tabindex': 'error',
      '@a11yfred/neighbor/no-autoplay-without-controls': 'error',
      '@a11yfred/neighbor/no-heading-inside-interactive': 'error',
      '@a11yfred/neighbor/no-placeholder-only': 'error',
      '@a11yfred/neighbor/warn-role-alert': 'warn',
      '@a11yfred/neighbor/prefer-aria-disabled': 'warn',
      '@a11yfred/neighbor/no-target-blank-without-label': 'warn',
      '@a11yfred/neighbor/no-empty-button': 'error',
      '@a11yfred/neighbor/no-image-role-without-name': 'error',
      '@a11yfred/neighbor/no-spinbutton-without-range': 'error',
      '@a11yfred/neighbor/no-slider-without-range': 'error',
      '@a11yfred/neighbor/no-combobox-without-expanded': 'error',
      '@a11yfred/neighbor/no-mouse-only-events': 'error',

      // @ulam framework-specific rules
      '@a11yfred/neighbor/no-announce-in-render': 'error',
      '@a11yfred/neighbor/no-hash-router-in-remix': 'warn',
      '@a11yfred/neighbor/no-use-page-title-in-remix': 'warn',

      // Allow _-prefixed parameters in stubs and intentionally unused args
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Modern React (17+) doesn't require React import for JSX
      'react/react-in-jsx-scope': 'off',
      // Disable prop-types validation (using TypeScript-style approach instead)
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    // Ignore build output and deps
    ignores: ['dist/**', 'node_modules/**'],
  },
]
