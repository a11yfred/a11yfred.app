import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'

export default [
  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
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

      // Accessibility (jsx-a11y recommended)
      ...jsxA11y.configs.recommended.rules,
      // autoFocus is intentional on the search input — single-purpose tool where
      // search is always the first action. Downgraded to warn, not suppressed.
      'jsx-a11y/no-autofocus': 'warn',

      // Allow _-prefixed parameters in stubs and intentionally unused args
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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
