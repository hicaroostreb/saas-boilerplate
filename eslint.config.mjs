// eslint.config.mjs
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default [
  // Ignorar arquivos gerados
  {
    ignores: [
      '/dist/',
      '/node_modules/',
      '/.next/',
      '/coverage/'
    ]
  },

  // Configuração base do ESLint
  js.configs.recommended,

  // Configuração do TypeScript
  ...tseslint.configs.recommended,

  // Configuração do Prettier
  prettierConfig,

  // Configuração personalizada
  {
    plugins: {
      prettier: prettier
    },
    rules: {
      'prettier/prettier': 'error',
      // Relaxar algumas regras TypeScript para desenvolvimento
      '@typescript-eslint/no-explicit-any': 'warn', // warning em vez de error
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn', // warning para {}
      '@typescript-eslint/no-require-imports': 'warn', // permitir require() com warning
      // Adicione suas regras customizadas aqui
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        // Globals do Node.js
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        dirname: 'readonly',
        filename: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        // Web APIs disponíveis no Node.js
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        fetch: 'readonly'
      }
    }
  },

  // Configuração específica para TypeScript nos packages
  {
    files: ['packages/*/.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
      // Removendo parserOptions.project temporariamente
      // para evitar conflitos em monorepos
    }
  }
];