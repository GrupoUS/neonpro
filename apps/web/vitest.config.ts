import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    // @ts-expect-error - Ignore TanStackRouterVite type mismatch due to monorepo version differences
    TanStackRouterVite(),
    // @ts-expect-error - Ignore react plugin type mismatch due to monorepo version differences
    react(),
  ],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/test/test-setup.ts', // Contains MSW setup and all mocks
      './src/test/setup/environment.ts', // DOM environment setup
    ],
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
        '**/src/test/**', // Exclude test setup files from coverage
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
      'src/test/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/categories/**/*.{test,spec}.{js,jsx,ts,tsx}',
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
      json: 'test-results/test-results.json',
      html: 'test-results/test-results.html',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
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
    testTimeout: 15000, // Increased for healthcare operations
    hookTimeout: 15000, // Increased for healthcare operations
  },

  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
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
