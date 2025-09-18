/**
 * Next.js Configuration for Edge Runtime Bundle Optimization
 *
 * Optimized for Brazilian healthcare applications running on Vercel Edge Runtime
 * with strict performance requirements (<100ms response times).
 */

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for edge runtime optimization
  experimental: {
    // Enable edge runtime for API routes
    runtime: 'edge',

    // Optimize bundle splitting for healthcare modules
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@trpc/server',
      '@trpc/client',
      'zod',
      'jose',
      'crypto-js',
    ],

    // Enable concurrent features for better performance
    serverComponentsExternalPackages: [
      'crypto-js',
      'jose',
      'node-forge',
    ],

    // Optimize for edge runtime
    edgeRuntime: {
      // Preload critical healthcare modules
      preload: [
        'crypto',
        'buffer',
        'util',
      ],
    },
  },

  // Webpack optimization for healthcare edge runtime
  webpack: (config, { dev, isServer, nextRuntime }) => {
    // Edge runtime specific optimizations
    if (nextRuntime === 'edge') {
      // Minimize bundle size for edge runtime
      config.optimization = {
        ...config.optimization,

        // Enable module concatenation for smaller bundles
        concatenateModules: true,

        // Optimize chunk splitting for healthcare modules
        splitChunks: {
          chunks: 'all',
          minSize: 0,
          maxSize: 244000, // Keep under 250KB for edge runtime
          cacheGroups: {
            // Healthcare core modules
            healthcare: {
              test: /[\\/]src[\\/](middleware|services|utils)[\\/].*healthcare/,
              name: 'healthcare-core',
              priority: 30,
              chunks: 'all',
              maxSize: 50000, // 50KB max per healthcare chunk
            },

            // Brazilian compliance modules
            compliance: {
              test: /[\\/]src[\\/].*[\\/](lgpd|cfm|anvisa)/,
              name: 'brazil-compliance',
              priority: 25,
              chunks: 'all',
              maxSize: 40000,
            },

            // Supabase optimized bundle
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase/,
              name: 'supabase-edge',
              priority: 20,
              chunks: 'all',
              maxSize: 60000,
            },

            // tRPC optimized bundle
            trpc: {
              test: /[\\/]node_modules[\\/]@trpc/,
              name: 'trpc-edge',
              priority: 15,
              chunks: 'all',
              maxSize: 30000,
            },

            // Validation libraries
            validation: {
              test: /[\\/]node_modules[\\/](zod|yup|joi)/,
              name: 'validation',
              priority: 10,
              chunks: 'all',
              maxSize: 25000,
            },
          },
        },

        // Tree shaking for unused healthcare modules
        usedExports: true,
        sideEffects: false,
      };

      // Alias for smaller crypto implementations in edge runtime
      config.resolve.alias = {
        ...config.resolve.alias,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer',
      };

      // Minimize polyfills for edge runtime
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer',
      };
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        }),
      );
    }

    return config;
  },

  // Output optimization for edge runtime
  output: 'standalone',

  // Optimize images for healthcare applications
  images: {
    // Minimize image processing for edge runtime
    formats: ['image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for medical images

    // Optimize for Brazilian CDN
    domains: [
      'cdn.neonpro.com.br',
      'assets.neonpro.com.br',
    ],

    // Loader optimization for medical images
    loader: 'custom',
    path: '/api/images/',
  },

  // Compress for better edge performance
  compress: true,

  // Headers for healthcare compliance and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Edge runtime optimization headers
          {
            key: 'X-Edge-Optimized',
            value: 'true',
          },
          {
            key: 'X-Bundle-Optimized',
            value: 'healthcare-edge',
          },

          // Performance optimization
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },

          // Preload critical healthcare resources
          {
            key: 'Link',
            value:
              '</api/health/check>; rel=preload; as=fetch, </api/compliance/report>; rel=preload; as=fetch',
          },
        ],
      },
    ];
  },

  // Redirects for healthcare optimization
  async redirects() {
    return [
      // Optimize old API routes
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
        permanent: true,
      },
    ];
  },

  // Rewrites for edge runtime optimization
  async rewrites() {
    return [
      // Route health checks to optimized edge handlers
      {
        source: '/health',
        destination: '/api/health/check',
      },
      {
        source: '/compliance',
        destination: '/api/compliance/report',
      },
    ];
  },

  // TypeScript configuration for edge runtime
  typescript: {
    // Type checking optimizations
    tsconfigPath: './tsconfig.json',
  },

  // ESLint optimization
  eslint: {
    dirs: ['src', 'pages', 'app'],
  },

  // Environment variables for edge optimization
  env: {
    EDGE_RUNTIME_OPTIMIZED: 'true',
    HEALTHCARE_BUNDLE_MODE: 'optimized',
    BRAZIL_COMPLIANCE_ENABLED: 'true',
  },

  // Production optimizations
  swcMinify: true,

  // Remove console logs in production edge runtime
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? {
        exclude: ['error', 'warn'],
      }
      : false,
  },
};

// Sentry configuration for edge runtime monitoring
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'neonpro-healthcare',
  project: 'edge-runtime-api',

  // Bundle size optimization for Sentry
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

module.exports = process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
