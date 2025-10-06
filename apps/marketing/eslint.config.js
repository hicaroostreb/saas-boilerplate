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
    rules: {
      '@next/next/no-img-element': 'error',
      '@next/next/no-head-import-in-document': 'error',
      '@next/next/no-title-in-document-head': 'error',
      '@next/next/google-font-display': 'warn',
      '@next/next/google-font-preconnect': 'warn',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Configuração específica para src/components
  {
    files: ['src/components/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
    },
  },

  // Configuração específica para src/app
  {
    files: ['src/app/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-page-custom-font': 'warn',
    },
  },

  // Configuração para src/lib
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
    },
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
