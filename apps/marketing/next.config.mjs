/** @type {import('next').NextConfig} */
const nextConfig = {
  // MÍNIMO - só o essencial para funcionar
  transpilePackages: [
    // Comentar TODOS temporariamente para debug
    // '@workspace/ui',
    // '@workspace/auth',
    // '@workspace/billing',
    // '@workspace/common',
    // '@workspace/routes',
    // '@workspace/rate-limiter',
    // '@workspace/database',
    // '@workspace/webhooks',
  ],

  // DESABILITAR todas as otimizações experimentais
  experimental: {
    // Comentar tudo que pode causar problemas
    // optimizePackageImports: [...],
    // webVitalsAttribution: [...],
  },

  // Configuração basic ESLint
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: true, // Permitir build mesmo com warnings
  },

  // TypeScript básico
  typescript: {
    ignoreBuildErrors: true, // Temporário para debug
  },

  // Remover todas as otimizações avançadas por enquanto
};

export default nextConfig;
