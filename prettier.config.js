/** @type {import('prettier').Config} */
export default {
  // Configurações básicas
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  
  // Configurações específicas para diferentes tipos de arquivo
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        printWidth: 120
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always'
      }
    },
    {
      files: '*.{yml,yaml}',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.{css,scss,less}',
      options: {
        singleQuote: false
      }
    }
  ],
  
  // Plugins para monorepo SaaS
  plugins: [
    'prettier-plugin-tailwindcss',
    'prettier-plugin-organize-imports'
  ],
  
  // Configuração Tailwind
  tailwindConfig: './apps/*/tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva', 'twMerge'],
  
  // Configuração de imports (prettier-plugin-organize-imports)
  organizeImportsSkipDestructiveCodeActions: true
};
