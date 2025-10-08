import baseConfig from '@workspace/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Playwright globals
        test: 'readonly',
        expect: 'readonly',
        page: 'readonly',
        context: 'readonly',
        browser: 'readonly',
      },
    },
    rules: {
      // E2E permite any e console
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },
];
