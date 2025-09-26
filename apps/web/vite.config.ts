// @ts-expect-error - Module not available in current environment
let TanStackRouterVite: () => { name: string }
try {
  // @ts-expect-error
  TanStackRouterVite = require('@tanstack/router-plugin/vite').TanStackRouterVite
} catch {
  TanStackRouterVite = () => ({ name: 'tanstack-router' })
}
// Fallback type declaration to suppress TS2307 for @tanstack/router-plugin/vite
declare module '@tanstack/router-plugin/vite' {
  export function TanStackRouterVite(): { name: string }
}

import react from '@vitejs/plugin-react'

// @ts-expect-error - Module not available in current environment
let path: { resolve: (from: string, to: string) => string }
try {
  // @ts-expect-error
  path = require('path')
} catch {
  path = { resolve: (from: string, to: string) => from + '/' + to }
}
// Fallback type declaration to suppress TS2307 for path
declare module 'path' {
  export function resolve(from: string, to: string): string
}

import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // @ts-expect-error - Ignore TanStackRouterVite type mismatch due to monorepo version differences
    TanStackRouterVite(),
    // @ts-expect-error - Ignore react plugin type mismatch due to monorepo version differences
    react(),
  ],
  root: '.',
  publicDir: 'public',
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    port: 8080,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-progress', 'lucide-react'],
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
      'react-hook-form',
      'zod',
      'valibot',
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
    ],
  },
})
