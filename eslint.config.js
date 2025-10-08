// @ts-check
import baseConfig from './tooling/eslint-config/index.js';

/**
 * Root ESLint configuration for monorepo
 * Provides fallback config while delegating to individual packages
 */
export default [
  ...baseConfig,
  {
    ignores: [
      // Build outputs
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'coverage/**',

      // Dependencies
      'node_modules/**',

      // Let individual packages handle their own linting
      'apps/**',
      'packages/**',
    ],
  },
];
