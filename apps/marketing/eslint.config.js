import nextConfig from '@workspace/eslint-config/next.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Extende a configuração base do workspace
  ...nextConfig,
  
  // Configuração específica para o marketing site
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
      // Marketing específicas - SEO otimizado
      '@next/next/no-img-element': 'error', // Força next/image para performance
      '@next/next/no-head-import-in-document': 'error',
      '@next/next/no-title-in-document-head': 'error',
      '@next/next/google-font-display': 'warn',
      '@next/next/google-font-preconnect': 'warn',
      
      // Performance crítico para marketing
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      
      // SEO e Acessibilidade
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      
      // TypeScript menos rigoroso para marketing (velocidade dev)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  
  // Configuração específica para componentes de marketing
  {
    files: ['components/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Componentes de marketing precisam ser acessíveis
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error'
    }
  },
  
  // Configuração específica para páginas (SEO crítico)
  {
    files: ['app/**/*.{ts,tsx}', 'pages/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Páginas devem ter metadata otimizada
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-page-custom-font': 'warn'
    }
  },
  
  // Configuração para arquivos de conteúdo/blog
  {
    files: ['content/**/*.{js,ts,tsx}', 'lib/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Conteúdo deve ser estruturado
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn'
    }
  },
  
  // Arquivos ignorados específicos do marketing site
  {
    ignores: [
      'next.config.mjs',
      '.next/**',
      'out/**',
      'public/**',
      'coverage/**',
      '*.config.{js,mjs}',
      'tailwind.config.js',
      'content/**/*.md',
      'content/**/*.mdx'
    ]
  }
];
