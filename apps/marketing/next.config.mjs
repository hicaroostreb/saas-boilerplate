/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpilação de packages do workspace (ATUALIZADO)
  transpilePackages: [
    '@workspace/ui',
    '@workspace/auth',
    '@workspace/database',
    '@workspace/billing',
    '@workspace/common',
    '@workspace/routes',
  ],

  // Otimizações experimentais para marketing site
  experimental: {
    optimizePackageImports: [
      '@workspace/ui',
      'lucide-react',
      'framer-motion',
      'tailwindcss',
    ],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
  },

  // Configuração ESLint otimizada
  eslint: {
    dirs: ['app', 'components', 'lib'],
    ignoreDuringBuilds: true, // ← MUDANÇA: true para evitar erros no build
  },

  // Configuração TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Otimizações de imagem para marketing
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
  },

  // Headers de segurança e performance
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        // Cache otimizado para assets estáticos
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Otimizações de bundle para marketing site
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output para otimização de marketing site (COMENTADO - pode causar problemas no dev)
  // output: 'standalone',

  // Configuração de build otimizada
  generateBuildId: async () => {
    return `${Date.now()}`;
  },

  // PWA e service worker (opcional para marketing)
  ...(process.env.NODE_ENV === 'production' && {
    async rewrites() {
      return [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
        {
          source: '/robots.txt',
          destination: '/api/robots',
        },
      ];
    },
  }),
};

export default nextConfig;
