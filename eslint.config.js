import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'
import palaman from './src/palaman/palaman-eslint.mjs'

export default [
  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      ...palaman.configs.recommended.plugins,
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

      // jsx-a11y + @ulam/palaman (composed in palaman recommended)
      ...palaman.configs.recommended.rules,
      // autoFocus is intentional on the search input — single-purpose tool where
      // search is always the first action. Downgraded to warn, not suppressed.
      'jsx-a11y/no-autofocus': 'warn',

      // @ulam/palaman — bad ARIA patterns not caught by jsx-a11y recommended
      // errors — definite breakage or phantom controls
      '@ulam/palaman/no-aria-label-on-generic': 'error',
      '@ulam/palaman/no-assertive-live-overuse': 'error',
      '@ulam/palaman/no-unblocked-aria-disabled': 'error',
      '@ulam/palaman/no-roles-without-name': 'error',
      '@ulam/palaman/no-group-without-name': 'error',
      '@ulam/palaman/no-presentation-on-focusable': 'error',
      '@ulam/palaman/no-log-with-interactive-children': 'error',
      '@ulam/palaman/no-aria-hidden-in-link': 'error',
      '@ulam/palaman/no-redundant-aria-hidden-with-presentation': 'error',
      '@ulam/palaman/no-aria-owns-on-void': 'error',
      '@ulam/palaman/no-title-as-label': 'error',
      // warnings — strong guidance, occasional legitimate overrides
      '@ulam/palaman/no-tooltip-role-misuse': 'warn',
      '@ulam/palaman/no-application-role': 'warn',
      '@ulam/palaman/no-grid-role': 'warn',
      '@ulam/palaman/no-menu-role-on-nav': 'warn',
      '@ulam/palaman/no-aria-roledescription': 'warn',
      '@ulam/palaman/no-aria-readonly': 'warn',
      '@ulam/palaman/no-href-hash': 'warn',
      '@ulam/palaman/no-tabs-without-structure': 'error',
      '@ulam/palaman/no-tab-without-controls': 'warn',
      '@ulam/palaman/no-positive-tabindex': 'error',
      '@ulam/palaman/no-autoplay-without-controls': 'error',
      '@ulam/palaman/no-heading-inside-interactive': 'error',
      '@ulam/palaman/no-placeholder-only': 'error',
      '@ulam/palaman/warn-role-alert': 'warn',
      '@ulam/palaman/prefer-aria-disabled': 'warn',
      '@ulam/palaman/no-target-blank-without-label': 'warn',
      '@ulam/palaman/no-empty-button': 'error',
      '@ulam/palaman/no-image-role-without-name': 'error',
      '@ulam/palaman/no-spinbutton-without-range': 'error',
      '@ulam/palaman/no-slider-without-range': 'error',
      '@ulam/palaman/no-combobox-without-expanded': 'error',
      '@ulam/palaman/no-mouse-only-events': 'error',

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
