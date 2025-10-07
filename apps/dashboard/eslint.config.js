import nextConfig from '@workspace/eslint-config/next.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Usa a configuração base compartilhada (agora alinhada!)
  ...nextConfig,

  // Configuração específica para o dashboard
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

    // ✅ REMOVIDAS todas as regras conflitantes!
    // Agora usa apenas a configuração base balanceada
    rules: {
      // Apenas overrides específicos do dashboard se necessário
      // (mantendo mínimos para evitar conflitos)
    },
  },

  // Arquivos ignorados específicos do dashboard
  {
    ignores: [
      'next.config.mjs',
      '.next/**',
      'out/**',
      'public/**',
      'coverage/**',
      '*.config.{js,mjs}',
      'tailwind.config.js',
    ],
  },
];
