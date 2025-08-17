import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Performance Optimizations
  experimental: {
    // Modern optimizations for Next.js 15
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Enable modern bundling
    bundlePagesRouterDependencies: true,
    // Optimize CSS
    optimizeCss: true,
    // Enable gzip compression
    gzipSize: true,
  },

  // Image optimization for healthcare content
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.com',
      },
    ],
    // Healthcare-specific image optimization
    dangerouslyAllowSVG: false, // Security for healthcare
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers for healthcare compliance
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app *.clerk.accounts.dev;
          style-src 'self' 'unsafe-inline' fonts.googleapis.com;
          img-src 'self' blob: data: *.supabase.co *.clerk.accounts.dev;
          font-src 'self' fonts.gstatic.com;
          connect-src 'self' *.supabase.co wss://*.supabase.co *.clerk.accounts.dev;
          frame-ancestors 'none';
          base-uri 'self';
          form-action 'self';
          object-src 'none';
          media-src 'self';
          worker-src 'self' blob:;
          child-src 'self';
          frame-src 'self' *.clerk.accounts.dev;
        `
          .replace(/\s{2,}/g, ' ')
          .trim(),
      },
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
        value:
          'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/(.*)',
        headers: [
          // API security for healthcare
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          // Long-term caching for static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Compression for better performance
  compress: true,

  // Production optimizations
  swcMinify: true,

  // Bundle analysis
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: process.env.ANALYZE === 'true',
        }),
      );
      return config;
    },
  }),

  // Healthcare compliance redirects
  async redirects() {
    return [
      // Security redirects
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },

  // PoweredBy removal for security
  poweredByHeader: false,

  // Strict mode for better performance and debugging
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    // Enable type checking in production build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Run ESLint during builds
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
