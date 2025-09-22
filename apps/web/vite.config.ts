import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'crypto';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

// Healthcare SRI Plugin for Vite
function healthcareSRIPlugin() {
  return {
    name: 'healthcare-sri',
    generateBundle(_, bundle) {
      const sriManifest = {};

      Object.keys(bundle).forEach(fileName => {
        const asset = bundle[fileName];
        if (asset.type === 'asset' || asset.type === 'chunk') {
          const content = typeof asset.code === 'string' ? asset.code : asset.source;
          if (content) {
            // Generate SHA-384 hash for SRI (healthcare-grade security)
            const hash = createHash('sha384').update(content).digest('base64');
            sriManifest[fileName] = `sha384-${hash}`;
          }
        }
      });

      // Add SRI manifest to bundle
      this.emitFile({
        type: 'asset',
        fileName: 'sri-manifest.json',
        source: JSON.stringify(sriManifest, null, 2),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isAnalyze = process.env.ANALYZE === 'true';

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        routeFileIgnorePrefix: '-',
        quoteStyle: 'single',
        autoCodeSplitting: true,
        addRouteExtensions: false,
      }),
      react(),
      healthcareSRIPlugin(),

      // Bundle analyzer for performance monitoring (only when ANALYZE=true)
      ...(isAnalyze
        ? [
          visualizer({
            filename: 'dist/bundle-analysis.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
            title: 'NeonPro Healthcare Platform - Bundle Analysis',
          }),
        ]
        : []),
    ],

    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        {
          find: '@neonpro/shared',
          replacement: path.resolve(__dirname, '../../packages/shared/src'),
        },
        {
          find: '@neonpro/types',
          replacement: path.resolve(__dirname, '../../packages/types/src'),
        },
        {
          find: '@sentry/react',
          replacement: path.resolve(__dirname, './src/shims/sentry-react.tsx'),
        },
        {
          find: '@sentry/tracing',
          replacement: path.resolve(__dirname, './src/shims/sentry-tracing.ts'),
        },
        {
          find: /^file-saver(\/.*)?$/,
          replacement: path.resolve(__dirname, './src/shims/file-saver'),
        },
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    server: {
      host: '::',
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3004',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,

      // Healthcare SRI Configuration
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1200,

      // Integrity Hash Generation
      rollupOptions: {
        external: [
          '@opentelemetry/auto-instrumentations-node',
          '@opentelemetry/exporter-otlp-http',
          '@opentelemetry/exporter-otlp-grpc',
          '@opentelemetry/sdk-node',
          'node-fetch',
        ],
        output: {
          // Enhanced code splitting for healthcare application performance
          manualChunks(id) {
            // Core frameworks - separate chunks for better caching
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (
                id.includes('react-router')
                || id.includes('@tanstack/react-router')
              ) {
                return 'vendor-router';
              }
              if (id.includes('@tanstack/react-query')) return 'vendor-query';

              // Database and auth
              if (id.includes('@supabase')) return 'vendor-database';

              // UI components
              if (id.includes('@radix-ui')) return 'vendor-ui-base';
              if (id.includes('framer-motion')) return 'vendor-animations';
              if (id.includes('@headlessui')) return 'vendor-ui-components';

              // Healthcare-specific libraries
              if (id.includes('fhir') || id.includes('hl7')) {
                return 'vendor-healthcare';
              }

              // Charts and visualization
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }

              // Forms and validation
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'vendor-forms';
              }

              // Date handling
              if (id.includes('date-fns') || id.includes('dayjs')) {
                return 'vendor-dates';
              }

              // Icons
              if (id.includes('lucide') || id.includes('react-icons')) {
                return 'vendor-icons';
              }

              // Utilities
              if (id.includes('lodash') || id.includes('ramda')) {
                return 'vendor-utils';
              }

              return 'vendor-misc';
            }

            // Application code splitting by feature
            if (id.includes('/src/features/')) {
              if (id.includes('/patients/')) return 'feature-patients';
              if (id.includes('/appointments/')) return 'feature-appointments';
              if (id.includes('/medical-records/')) {
                return 'feature-medical-records';
              }
              if (id.includes('/billing/')) return 'feature-billing';
              if (id.includes('/admin/')) return 'feature-admin';
              if (id.includes('/telemedicine/')) return 'feature-telemedicine';
              return 'feature-shared';
            }

            // Route-based code splitting
            if (id.includes('/src/routes/')) {
              if (id.includes('/dashboard/')) return 'route-dashboard';
              if (id.includes('/patients/')) return 'route-patients';
              if (id.includes('/appointments/')) return 'route-appointments';
              if (id.includes('/settings/')) return 'route-settings';
              return 'route-common';
            }
          },

          // SRI Hash Generation for Healthcare Security
          assetFileNames: assetInfo => {
            if (assetInfo.name.endsWith('.css')) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (assetInfo.name.endsWith('.js')) {
              return `assets/js/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-router',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'react-hook-form',
        'date-fns',
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-toast',
      ],
      exclude: ['file-saver'],
    },
  };
});
