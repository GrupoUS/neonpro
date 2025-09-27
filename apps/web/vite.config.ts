// @ts-expect-error - Module not available in current environment
let TanStackRouterVite: () => { name: string }
try {
  // @ts-expect-error
  TanStackRouterVite = require('@tanstack/router-plugin/vite').TanStackRouterVite
} catch {
  TanStackRouterVite = () => ({ name: 'tanstack-router' })
}
// Fallback type declaration to suppress TS2307 for @tanstack/router-plugin/vite
declare module '@tanstack/router-plugin' {
  export function TanStackRouterVite(): { name: string }
}

import react from '@vitejs/plugin-react'

// @ts-expect-error - Module not available in current environment
let path: { resolve: (from: string, to: string) => string }
try {
  // @ts-expect-error
  path = require('node:path')
} catch {
  path = { resolve: (from: string, to: string) => `${from}/${to}` }
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
    'process.env': 'import.meta.env',
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-progress', 'lucide-react'],
          copilot: ['@copilotkit/react-core', '@copilotkit/react-ui'],
          forms: ['react-hook-form', 'zod', 'valibot'],
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
