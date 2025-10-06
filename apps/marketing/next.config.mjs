/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ ENTERPRISE: Marketing só usa packages permitidos pela Clean Architecture
  transpilePackages: [
    '@workspace/ui', // ✅ Application Layer
    '@workspace/common', // ✅ Foundation Layer
    '@workspace/routes', // ✅ Foundation Layer
    '@workspace/rate-limiter', // ✅ Infrastructure Layer
  ],

  // ✅ ENTERPRISE: Configuração mínima estável
  experimental: {
    externalDir: true,
  },

  // ✅ ENTERPRISE: ESLint focado apenas no src
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },

  // ✅ ENTERPRISE: TypeScript strict
  typescript: {
    ignoreBuildErrors: false,
  },

  // ✅ ENTERPRISE: Headers de segurança mantidos
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

  // ✅ ENTERPRISE: Otimizações de produção
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
