/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@neonpro/ui',
    '@neonpro/utils',
    '@neonpro/database',
  ],

  // HEALTHCARE PRODUCTION OPTIMIZATION
  compress: true, // Enable gzip compression for production
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Image optimization for healthcare media
  images: {
    formats: ['image/avif', 'image/webp',],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840,],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384,],
  },

  // Performance optimization
  experimental: {
    optimizePackageImports: [
      '@neonpro/ui',
      'lucide-react',
      '@radix-ui/react-icons',
    ],
    turbo: {
      resolveAlias: {
        '@/': './',
      },
    },
  },

  // Security headers for healthcare compliance
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  eslint: {
    // HEALTHCARE CRITICAL: Using Biome for code quality validation
    ignoreDuringBuilds: true, // Biome handles linting in CI/CD pipeline
  },
  typescript: {
    // HEALTHCARE CRITICAL: TypeScript errors MUST be fixed for patient safety
    // ignoreBuildErrors: true, // ❌ REMOVED - Patient safety requirement
  },
}

export default nextConfig
