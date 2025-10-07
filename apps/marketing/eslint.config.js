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
    // ✅ REMOVIDAS regras conflitantes - usa apenas a base
    rules: {},
  },

  {
    ignores: [
      'next.config.mjs',
      '.next/**',
      'out/**',
      'public/**',
      'coverage/**',
      '*.config.{js,mjs}',
      'tailwind.config.js',
      'src/content/**/*.md',
      'src/content/**/*.mdx',
    ],
  },
];
