import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';
  const isEdge = process.env.EDGE_RUNTIME === 'true';

  return {
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
      nodePolyfills({
        exclude: [],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
      isAnalyze && visualizer({
        filename: '../../bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    build: {
      outDir: 'dist',
      lib: {
        entry: 'src/index.ts',
        name: 'NeonProAPI',
        fileName: format => `index.${format}${isEdge ? '.edge' : ''}`,
        formats: ['es'],
      },
      rollupOptions: {
        external: [
          'hono',
          '@hono/node-server',
          '@prisma/client',
          '@supabase/supabase-js',
          '@trpc/server',
          '@trpc/client',
          '@opentelemetry/api',
          '@opentelemetry/auto-instrumentations-node',
          '@opentelemetry/exporter-prometheus',
          '@opentelemetry/sdk-node',
          '@opentelemetry/semantic-conventions',
          '@sentry/node',
          '@sentry/profiling-node',
          // Node.js built-ins
          'fs',
          'path',
          'https',
          'crypto',
          'stream',
          'util',
          'perf_hooks',
          'zlib',
          'buffer',
          'process',
        ],
        output: {
          chunkFileNames: chunkInfo => {
            return `chunks/[name]-[hash]${isEdge ? '.edge' : ''}.js`;
          },
          entryFileNames: entryInfo => {
            return `entries/[name]-[hash]${isEdge ? '.edge' : ''}.js`;
          },
          globals: {
            hono: 'Hono',
          },
          manualChunks: {
            // Split vendor chunks for better caching
            vendor: ['hono', '@hono/node-server'],
            trpc: ['@trpc/server', '@trpc/client', 'superjson'],
            validation: ['zod', 'valibot'],
            database: ['@prisma/client'],
            auth: ['@supabase/supabase-js', 'jose'],
            ai: ['@ai-sdk/anthropic', '@ai-sdk/openai', 'ai'],
            monitoring: ['@opentelemetry/api', '@opentelemetry/sdk-node', '@sentry/node'],
          },
        },
      },
      target: isEdge ? 'es2022' : 'node18',
      minify: 'terser',
      sourcemap: true,
      // Code splitting for better performance
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('hono')) return 'vendor-hono';
              if (id.includes('trpc')) return 'vendor-trpc';
              if (id.includes('zod') || id.includes('valibot')) return 'vendor-validation';
              if (id.includes('prisma')) return 'vendor-database';
              if (id.includes('supabase')) return 'vendor-auth';
              if (id.includes('ai-sdk')) return 'vendor-ai';
              if (id.includes('opentelemetry')) return 'vendor-monitoring';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      port: 3005,
      host: true,
    },
    optimizeDeps: {
      include: [
        'hono',
        '@hono/node-server',
        '@hono/trpc-server',
        '@trpc/server',
        'zod',
        'valibot',
        'date-fns',
        'nanoid',
      ],
      exclude: ['@prisma/client'],
    },
    esbuild: {
      target: isEdge ? 'es2022' : 'node18',
      // Tree shaking optimizations
      pure: ['console.log', 'console.debug', 'console.info'],
    },
    // Performance optimizations
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      __EDGE__: isEdge,
    },
  };
});
