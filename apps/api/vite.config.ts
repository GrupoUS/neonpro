import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
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
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'hono',
        '@hono/node-server',
        '@prisma/client',
        '@supabase/supabase-js',
        '@trpc/server',
        '@trpc/client'
      ],
      output: {
        globals: {
          hono: 'Hono'
        }
      }
    },
    target: 'node18',
    minify: 'terser',
    sourcemap: true
  },
  server: {
    port: 3005,
    host: true
  },
  optimizeDeps: {
    include: [
      'hono',
      '@hono/node-server',
      '@hono/trpc-server',
      '@trpc/server',
      'zod',
      'valibot'
    ]
  },
  esbuild: {
    target: 'node18'
  }
})