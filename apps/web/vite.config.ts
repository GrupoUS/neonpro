import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Define config without importing vite to avoid dependency resolution issues
export default {
  plugins: [
    // @ts-ignore - Ignore TanStackRouterVite type mismatch due to monorepo version differences
    TanStackRouterVite(),
    // @ts-ignore - Ignore react plugin type mismatch due to monorepo version differences
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
}
