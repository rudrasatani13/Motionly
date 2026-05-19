import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dev-dist',
      'build',
      'coverage',
      'node_modules',
      '*.tsbuildinfo',
      'pnpm-lock.yaml',
    ],
  },

  // Base JS rules + TypeScript recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Application source (React + TS)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      'unused-imports': unusedImports,
      prettier: prettierPlugin,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // React 18 + the new JSX transform: React doesn't need to be in scope.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Fast refresh expects components to be the only thing exported from
      // hot-reloadable modules. Warn, don't block.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Unused imports / vars — surface via the dedicated plugin so we can
      // distinguish unused imports (auto-removable) from unused locals/args.
      // Allow leading-underscore vars/args as the intentional ignore convention.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Discourage `any` but don't make it impossible — see CODING_STANDARDS §1.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Surface Prettier formatting issues as ESLint errors so `pnpm lint`
      // catches them. `eslint-config-prettier` (applied below) turns off
      // every stylistic rule that would conflict.
      'prettier/prettier': 'error',
    },
  },

  // Vite config and other root-level tooling files run in Node.
  {
    files: ['vite.config.ts', 'eslint.config.js', '*.config.{js,ts,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Must be last so it disables any stylistic rules that conflict with Prettier.
  prettierConfig,
);
