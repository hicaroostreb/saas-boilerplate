import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local da raiz do monorepo
loadEnv({ path: resolve(process.cwd(), '../../.env.local') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile workspace packages
  transpilePackages: [
    '@workspace/ui',
    '@workspace/auth',
    '@workspace/database',
    '@workspace/common',
    '@workspace/routes',
  ],

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@workspace/ui'],
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Production optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
};

export default nextConfig;
