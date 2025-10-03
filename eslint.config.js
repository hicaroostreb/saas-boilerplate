import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/**
 * 🏆 ENTERPRISE ESLINT CONFIG - Otimizado para Qualidade + Produtividade
 *
 * Filosofia:
 * - Error: Previne bugs reais (type errors, security, runtime crashes)
 * - Warn: Code quality opcional (pode ser ignorado temporariamente)
 * - Off: Falsos positivos ou coberto por outras ferramentas
 *
 * Baseado em: Google, Meta, Microsoft, Vercel best practices
 */
export default [
  // ✅ BASE: JavaScript essentials
  js.configs.recommended,

  // ✅ PERFORMANCE: Ignores otimizados
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/build/**',
      '**/*.min.js',
      'packages/database/**',
      '**/drizzle/**',
      '**/migrations/**',
      '**/playwright-report/**',
      '**/storybook-static/**',
    ],
  },

  // ✅ TYPESCRIPT: Main configuration
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
      // 🎯 TYPESCRIPT: Type Safety (ERROR - previne bugs)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error', // PROMOVIDO: força types
      '@typescript-eslint/no-non-null-assertion': 'error', // PROMOVIDO: type safety
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'off', // Mantido OFF (muitos falsos positivos)

      // 🎯 REACT: Critical rules (ERROR)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error', // NOVO: previne typos em props

      // 🎯 REACT HOOKS: Non-negotiable (ERROR)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error', // PROMOVIDO: previne stale closures

      // 🎯 ACCESSIBILITY: Balanced approach
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',

      // 🎯 GENERAL: Clean code (ERROR for critical, WARN for style)
      'no-unused-vars': 'off', // Delegado para @typescript-eslint
      'no-undef': 'off', // TypeScript já valida
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'warn', // REBAIXADO: style preference
      'no-duplicate-imports': 'error',

      // 🎯 FORMATTING: Delegado para Prettier (removidos)
      // Prettier cuida: semi, quotes, trailing-spaces, eol-last

      // 🎯 SECURITY: Non-negotiable (ERROR)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // 🎯 ASYNC/PROMISES: Pragmatic approach
      'no-await-in-loop': 'off', // REMOVIDO: muitos falsos positivos (retry logic, etc)
      'require-atomic-updates': 'off', // REMOVIDO: falsos positivos frequentes
      'no-promise-executor-return': 'error', // NOVO: previne bugs Promise
      'no-async-promise-executor': 'error', // NOVO: previne anti-patterns
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
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // ✅ CONFIG FILES: Lenient for tooling
  {
    files: [
      '**/*.config.{js,ts}',
      '**/next.config.{js,ts}',
      '**/tailwind.config.{js,ts}',
      '**/vitest.config.{js,ts}',
      '**/postcss.config.{js,ts}',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
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
        afterAll: 'readonly',
        beforeAll: 'readonly',
        vi: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // ✅ API ROUTES: Server-side flexibility
  {
    files: ['**/api/**/*.{js,ts}', '**/app/**/route.{js,ts}'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // ✅ INFRASTRUCTURE: Gateway/Repository patterns
  {
    files: [
      '**/infrastructure/**/*.{js,ts}',
      '**/*.gateway.{js,ts}',
      '**/*.repository.{js,ts}',
    ],
    rules: {
      // Retry logic é comum aqui
      'no-await-in-loop': 'off',
    },
  },

  // ✅ PRETTIER: Must be last to override formatting rules
  prettierConfig,
];
