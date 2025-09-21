import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      exclude: [],
      // Whether to polyfill `global`.
      globals: {
        Buffer: true, // can also be 'build' or 'dev'
        global: true,
        process: true,
      },
      // Whether to polyfill specific globals.
      protocolImports: true,
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: 'NeonProAPI',
      fileName: 'index',
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
        '@opentelemetry/exporter-jaeger',
        '@opentelemetry/exporter-prometheus',
        '@opentelemetry/resources',
        '@opentelemetry/sdk-node',
        '@opentelemetry/sdk-trace-base',
        '@opentelemetry/sdk-metrics',
        '@opentelemetry/semantic-conventions',
        '@opentelemetry/instrumentation-express',
        '@opentelemetry/instrumentation-http',
        '@sentry/node',
        '@sentry/core',
        'winston',
        'winston-daily-rotate-file',
        'node-fetch',
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
        'vite-plugin-node-polyfills/shims/global',
        'vite-plugin-node-polyfills/shims/buffer',
        'vite-plugin-node-polyfills/shims/process',
      ],
      output: {
        globals: {
          hono: 'Hono',
        },
      },
    },
    target: 'node18',
    minify: 'terser',
    sourcemap: true,
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
    ],
  },
  esbuild: {
    target: 'node18',
  },
});
