import nextConfig from '@workspace/eslint-config/next.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextConfig,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      next: {
        rootDir: './',
      },
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'out/**', // Específico Next.js export
      'public/**', // Assets estáticos
    ],
  },
];
