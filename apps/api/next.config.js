/**
 * Next.js Configuration for Edge Runtime Bundle Optimization
 *
 * Optimized for Brazilian healthcare applications running on Vercel Edge Runtime
 * with strict performance requirements (<100ms response times).
 */

import { withSentryConfig } from '@sentry/nextjs';
import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for edge runtime optimization
  experimental: {
    // Optimize bundle splitting for healthcare modules
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@trpc/server',
      '@trpc/client',
      'zod',
    ],
  },

  // External packages for server components (moved from experimental)
  serverExternalPackages: [
    'crypto-js',
    'jose',
    'node-forge',
  ],

  // Webpack configuration for healthcare-specific optimizations
  webpack: (config, { dev, isServer, nextRuntime }) => {
    // Healthcare data processing optimizations
    if (nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize crypto operations for LGPD compliance
        'crypto-js': 'crypto-js/core',
        // Optimize date handling for Brazilian timezone
        'date-fns': 'date-fns/esm',
      };

      // Bundle splitting for healthcare modules
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            healthcare: {
              test: /[\\/]node_modules[\\/](supabase|trpc|zod)[\\/]/,
              name: 'healthcare-core',
              priority: 20,
            },
            crypto: {
              test: /[\\/]node_modules[\\/](crypto-js|jose|node-forge)[\\/]/,
              name: 'crypto-bundle',
              priority: 15,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
          },
        },
      };
    }

    // Performance monitoring for healthcare compliance
    if (!dev && isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.HEALTHCARE_MONITORING': JSON.stringify('enabled'),
        })
      );
    }

    return config;
  },

  // Standalone output for Vercel deployment
  output: 'standalone',

  // Image optimization for medical imaging
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for medical images
    
    // Healthcare-compliant image domains
    domains: [
      'cdn.neonpro.com.br',
      'assets.neonpro.com.br',
    ],

    // Custom loader for LGPD-compliant image processing
    loader: 'custom',
    path: '/api/images/',
  },

  // Enable compression for faster healthcare data transfer
  compress: true,

  // Security headers for healthcare compliance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Healthcare-API',
            value: 'NeonPro-Edge-Runtime',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Redirects for healthcare API versioning
  async redirects() {
    return [
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
        permanent: true,
      },
    ];
  },

  // Rewrites for healthcare data routing
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
      {
        source: '/metrics',
        destination: '/api/metrics',
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Use custom tsconfig for healthcare features
    tsconfigPath: './tsconfig.json',
  },

  // ESLint configuration for healthcare code quality
  eslint: {
    dirs: ['src', 'pages', 'app'],
  },

  // Environment variables for healthcare compliance
  env: {
    EDGE_RUNTIME_OPTIMIZED: 'true',
    HEALTHCARE_BUNDLE_MODE: 'optimized',
    BRAZIL_COMPLIANCE_ENABLED: 'true',
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? {
        exclude: ['error', 'warn'],
      }
      : false,
  },
};

// Sentry configuration for healthcare monitoring
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'neonpro-healthcare',
  project: 'edge-runtime-api',
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
