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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['@segment/analytics-node'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          trpc: ['@trpc/server', '@trpc/client', '@trpc/react-query'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-progress', 'lucide-react'],
          copilot: ['@copilotkit/react-core', '@copilotkit/react-ui'],
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
      '@tanstack/react-router',
      '@tanstack/react-query',
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
      '@copilotkit/react-core',
      '@copilotkit/react-ui',
      '@neonpro/ui',
      '@neonpro/types',
      '@neonpro/database',
      '@neonpro/core',
    ],
    exclude: ['@segment/analytics-node'],
  },
})
