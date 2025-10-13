import js from '@eslint/js';
import turbo from 'eslint-plugin-turbo';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Global ignores - TODOS OS IGNORES CRÍTICOS MIGRADOS
  {
    ignores: [
      // Dependencies
      '**/node_modules/',

      // Build outputs
      '**/dist/',
      '**/build/',
      '**/.next/',
      '**/.turbo/',
      '**/coverage/',

      // Database generated (CRITICAL!)
      'packages/database/',
      '**/drizzle/',
      '**/migrations/',
      '**/seed.ts',

      // Test & Documentation generated
      '**/playwright-report/',
      '**/storybook-static/',

      // Generated files
      '**/*.d.ts',

      // OS files (migrados do .eslintignore)
      '**/.DS_Store',
      '**/Thumbs.db',

      // Specific configs (NÃO todo .js)
      '**/*.config.{js,mjs,cjs}',
      '**/next.config.{js,mjs}',
      '**/tailwind.config.{js,ts}',
      '**/postcss.config.{js,mjs}',
      '**/vite.config.{js,ts}',
      '**/drizzle.config.{js,ts}',
    ],
  },

  // TypeScript files configuration
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: true, // Enable type information
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
      turbo,
    },

    rules: {
      // Turbo integration
      'turbo/no-undeclared-env-vars': 'warn',

      // 🔒 SAFETY CRITICAL (ERROR) - Só 5 regras que quebram aplicação
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',

      // ⚠️ QUALITY GUIDELINES (WARN) - Melhora código, não trava dev
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      // 🎯 CORREÇÃO: Mudar de 'warn' para 'off' para permitir auto-fix no CI
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-inferrable-types': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-template': 'warn',
      'object-shorthand': 'warn',

      // 📋 DEVELOPER EXPERIENCE
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      // 🚫 FLEXIBILIDADE TOTAL (OFF)
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',

      // ✅ MANTIDOS
      '@typescript-eslint/prefer-as-const': 'error',
      'no-unused-expressions': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    },
  },

  // JavaScript files configuration (NO TypeScript parser/rules)
  {
    files: ['**/*.{js,mjs,cjs}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // NO TypeScript parser for JS files
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
      turbo,
    },

    rules: {
      // Turbo integration
      'turbo/no-undeclared-env-vars': 'warn',

      // 🔒 SAFETY CRITICAL (ERROR) - Só regras JS básicas
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',

      // ⚠️ QUALITY GUIDELINES (WARN) - Só JS
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-template': 'warn',
      'object-shorthand': 'warn',

      // 📋 DEVELOPER EXPERIENCE
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      // ✅ MANTIDOS
      'no-unused-expressions': 'error',

      // 🚫 DESABILITAR regras TypeScript para JS
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);
