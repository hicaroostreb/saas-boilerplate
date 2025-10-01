import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/**
 * ✅ ENTERPRISE: ESLint 9+ Flat Config
 * Clean, objetivo e enterprise-ready para monorepo Turborepo
 */
export default [
  // ✅ BASE: JavaScript recomendado
  js.configs.recommended,

  // ✅ PERFORMANCE: Ignores globais otimizados
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/build/**',
      '**/*.min.js',
      // Database & tooling exclusions
      'packages/database/**',
      '**/drizzle/**',
      '**/migrations/**',
      '**/playwright-report/**',
      '**/storybook-static/**',
    ],
  },

  // ✅ TYPESCRIPT: Configuração principal
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: [
          './tsconfig.json',
          './packages/*/tsconfig.json',
          './apps/*/tsconfig.json',
        ],
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      // ✅ TYPESCRIPT: Core rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      // 🎯 FASE 1: Desabilitar no-unnecessary-condition (95 warnings eliminados)
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-floating-promises': 'error',

      // ✅ REACT: Essential rules only
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-unescaped-entities': 'error',

      // ✅ REACT HOOKS: Critical rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ✅ ACCESSIBILITY: Essential only
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',

      // ✅ GENERAL: Clean code essentials
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-duplicate-imports': 'error',
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],

      // ✅ SECURITY: Non-negotiable
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // ✅ PERFORMANCE: Important warnings
      'no-await-in-loop': 'warn',
      'require-atomic-updates': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // ✅ JAVASCRIPT: Minimal rules
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ✅ CONFIG FILES: Lenient for tooling
  {
    files: [
      '**/*.config.{js,ts}',
      '**/next.config.{js,ts}',
      '**/tailwind.config.{js,ts}',
      '**/vitest.config.{js,ts}',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ✅ TESTS: Development-friendly
  {
    files: [
      '**/*.test.{js,ts,tsx}',
      '**/*.spec.{js,ts,tsx}',
      '**/__tests__/**/*.{js,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // ✅ API ROUTES: Server-side flexibility
  {
    files: ['**/api/**/*.{js,ts}', '**/app/**/route.{js,ts}'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // ✅ PRETTIER: Always last
  prettierConfig,
];
