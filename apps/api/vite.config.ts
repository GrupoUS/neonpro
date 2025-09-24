import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const isEdge = process.env.EDGE_RUNTIME === 'true';

  return {
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    build: {
      outDir: 'dist',
      lib: {
        entry: 'src/index.ts',
        name: 'NeonProAPI',
        fileName: format => `index.${format}${isEdge ? '.edge' : ''}`,
        formats: ['es'],
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
              if (id.includes('zod') || id.includes('valibot')) {
                return 'vendor-validation';
              }
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
