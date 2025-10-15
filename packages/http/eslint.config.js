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
    },
  },
];
