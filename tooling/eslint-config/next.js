import nextPlugin from '@next/eslint-plugin-next';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import baseConfig from './index.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Extende a configuração base
  ...baseConfig,

  // Configuração específica para Next.js
  {
    files: ['**/*.{js,mjs,ts,tsx}'],

    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },

    rules: {
      // ✅ Next.js específicas - Core Web Vitals (SEM DUPLICATAS)
      '@next/next/google-font-display': 'warn',
      '@next/next/google-font-preconnect': 'warn',
      '@next/next/next-script-for-ga': 'warn',
      '@next/next/no-before-interactive-script-outside-document': 'error',
      '@next/next/no-css-tags': 'error',
      '@next/next/no-head-element': 'error',
      '@next/next/no-head-import-in-document': 'error', // ← APENAS UMA VEZ!
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-page-custom-font': 'warn',
      '@next/next/no-script-component-in-head': 'error', // ← APENAS UMA VEZ!
      '@next/next/no-styled-jsx-in-document': 'error',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-title-in-document-head': 'error',
      '@next/next/no-typos': 'warn',
      '@next/next/no-unwanted-polyfillio': 'warn',

      // ✅ Next.js específicas - Recommended (REMOVIDAS DUPLICATAS)
      '@next/next/inline-script-id': 'error',
      '@next/next/no-assign-module-variable': 'error',
      '@next/next/no-document-import-in-page': 'error',
      '@next/next/no-duplicate-head': 'error',
      // REMOVIDOS: '@next/next/no-head-import-in-document' e '@next/next/no-script-component-in-head' (já declarados acima)

      // React específicas para Next.js
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX A11y
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
    },

    settings: {
      next: {
        rootDir: ['apps/*/', 'tooling/*/'],
      },
      react: {
        version: 'detect',
      },
    },
  },

  // Configuração específica para pages/app directory
  {
    files: ['**/pages/**/*.{js,ts,tsx}', '**/app/**/*.{js,ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/*/pages/'],
    },
  },

  // Configuração para arquivos de configuração Next.js
  {
    files: ['**/next.config.{js,mjs}'],
    env: {
      node: true,
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-undef': 'off',
    },
  },
];
