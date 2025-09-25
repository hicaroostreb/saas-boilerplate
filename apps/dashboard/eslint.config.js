import nextConfig from '@workspace/eslint-config/next.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Extende a configuração base do workspace
  ...nextConfig,
  
  // Configuração específica para o dashboard
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    
    settings: {
      next: {
        rootDir: './'
      },
      react: {
        version: 'detect'
      }
    },
    
    rules: {
      // Dashboard específicas - mais rigorosas para app crítico
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      
      // Segurança específica para dashboard
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Performance para dashboard
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      
      // Next.js otimizações para dashboard
      '@next/next/no-img-element': 'error' // Força uso do next/image
    }
  },
  
  // Configuração específica para actions (server-side)
  {
    files: ['actions/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Actions devem ser mais rigorosas
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': 'error' // Sem console em actions de produção
    }
  },
  
  // Configuração específica para schemas
  {
    files: ['schemas/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Schemas devem ser explícitos
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  
  // Configuração específica para middleware
  {
    files: ['middleware.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Middleware precisa ser otimizado
      'no-console': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error'
    }
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
      'tailwind.config.js'
    ]
  }
];
