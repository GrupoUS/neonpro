import path from 'path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vite'
import { trpcFix } from './vite-plugin-trpc-fix'

let TanStackRouterVite: () => { name: string }
try {
  TanStackRouterVite = require('@tanstack/router-plugin/vite').TanStackRouterVite
} catch {
  TanStackRouterVite = () => ({ name: 'tanstack-router' })
}

export default defineConfig({
  plugins: [
    trpcFix(),
    TanStackRouterVite(),
    react(),
    tsconfigPaths({
      ignoreConfigErrors: true,
    }),
  ],
  logLevel: 'warn',
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  root: '.',
  publicDir: 'public',
  resolve: {
    preserveSymlinks: true,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@trpc/server/unstable-core-do-not-import': path.resolve(__dirname, '../../node_modules/@trpc/server/dist/index.mjs'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@neonpro/types': path.resolve(__dirname, '../../packages/types/src'),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src'),
      '@neonpro/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': 'import.meta.env',
  },
  ssr: {
    noExternal: ['@supabase/supabase-js']
  },
  server: {
    host: true,
    port: 8080,
    open: false,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    minify: 'terser',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: [
        '@segment/analytics-node', 
        'chalk', 
        'fs', 
        'path', 
        'crypto', 
        'os', 
        'stream', 
        'util', 
        'events', 
        'buffer',
        'iceberg-js',
        '@supabase/node-fetch'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          trpc: ['@trpc/server', '@trpc/client', '@trpc/react-query'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-progress', 'lucide-react'],
          forms: ['react-hook-form', 'zod'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns'],
        },
        chunkFileNames: chunkInfo => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split('/')
                .pop()
                ?.replace(/\.[^/.]+$/, '')
            : 'chunk'
          return `assets/${facadeModuleId}-[hash].js`
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'scheduler',
      '@supabase/supabase-js',
      '@supabase/auth-js',
      '@supabase/postgrest-js',
      '@supabase/functions-js', 
      '@supabase/realtime-js',
      '@supabase/storage-js',
      '@tanstack/react-router',
      '@tanstack/react-query',
      '@tanstack/router-core',
      '@tanstack/history',
      '@tanstack/query-core',
      '@tanstack/store',
      '@tanstack/react-store',
      '@trpc/server',
      '@trpc/client',
      '@trpc/react-query',
      'superjson',
      'react-hook-form',
      'zod',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'date-fns',
      'sonner',
      '@radix-ui/react-slot',
      '@radix-ui/react-progress',
      'class-variance-authority',
      '@neonpro/ui',
      '@neonpro/types',
      'tiny-invariant',
      'tiny-warning',
      'use-sync-external-store',
    ],
    exclude: ['@segment/analytics-node', 'iceberg-js', '@supabase/node-fetch'],
  },
})
