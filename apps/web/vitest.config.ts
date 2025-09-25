import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    // @ts-ignore - Ignore TanStackRouterVite type mismatch due to monorepo version differences
    TanStackRouterVite(),
    // @ts-ignore - Ignore react plugin type mismatch due to monorepo version differences
    react(),
  ],
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.vercel/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/test-results/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.vercel/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/test-results/**',
    ],
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      'json': 'test-results/test-results.json',
      'html': 'test-results/test-results.html',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    server: {
      deps: {
        inline: [
          '@trpc/client',
          '@trpc/react-query',
          '@trpc/server',
          '@supabase/supabase-js',
          '@tanstack/react-query',
          '@tanstack/react-router',
        ],
      },
    },
    fakeTimers: {
      enableGlobally: true,
    },
    sequence: {
      shuffle: {
        seed: 123,
      },
    },
    chaiConfig: {
      truncateThreshold: 0,
    },
    snapshotSerializers: [],
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  root: '.',
  publicDir: 'public',
  resolve: {
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
      'class-variance-authority',
      '@copilotkit/react-core',
      '@copilotkit/react-ui',
    ],
  },
})