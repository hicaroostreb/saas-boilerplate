import js from '@eslint/js';
import turbo from 'eslint-plugin-turbo';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'node_modules/**',
      '*.config.{js,mjs,cjs}',
      'coverage/**',
      '**/*.d.ts',
    ],
  },

  // Main configuration
  {
    files: ['**/*.{js,mjs,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      turbo: turbo,
    },

    rules: {
      // Turbo específicas
      'turbo/no-undeclared-env-vars': 'warn',

      // TypeScript específicas
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-inferrable-types': 'warn',

      // JavaScript/ES6+ específicas
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
    },
  },

  // TypeScript específico - REGRAS BALANCEADAS ✅
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // ✅ CORRIGIDO: ERROR → WARN (alinhado com comportamento local)
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // ← MUDANÇA CRÍTICA
      '@typescript-eslint/prefer-optional-chain': 'warn', // ← MUDANÇA CRÍTICA
    },
  },

  // JavaScript específico (menos rigoroso)
  {
    files: ['**/*.{js,mjs}'],
    rules: {
      // Desabilitar regras TypeScript para arquivos JS puros
      '@typescript-eslint/no-var-requires': 'off',
    },
  }
);
