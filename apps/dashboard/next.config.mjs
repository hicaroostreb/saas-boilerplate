import { config } from 'dotenv';

// Carregar variáveis de ambiente da raiz do monorepo
config({ path: '../../.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpilação de packages do workspace
  transpilePackages: [
    '@workspace/ui',
    '@workspace/auth',
    '@workspace/database',
    '@workspace/billing',
    '@workspace/common',
    '@workspace/routes',
  ],

  // Configuração de ambiente otimizada (SEM NODE_ENV!)
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
  },

  // Configurações experimentais
  experimental: {
    externalDir: true,
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // Configuração ESLint otimizada
  eslint: {
    dirs: ['app', 'actions', 'schemas', 'lib', 'components'],
    ignoreDuringBuilds: true, // ← IGNORAR DURANTE BUILD
  },

  // Configuração TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Headers de segurança para produção
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Otimizações de bundle
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
