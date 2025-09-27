import path from 'path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import { defineConfig } from 'vite'

let TanStackRouterVite: () => { name: string }
try {
  TanStackRouterVite = require('@tanstack/router-plugin/vite').TanStackRouterVite
} catch {
  TanStackRouterVite = () => ({ name: 'tanstack-router' })
}

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tsconfigPaths(),
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
