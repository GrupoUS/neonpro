import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],

  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: [
      './src/test/test-setup.ts',
      './src/test/setup/environment.ts',
      './src/test/setup/global-setup.ts',
      './src/test/setup/global-teardown.ts',
    ],
    globalSetup: ['./src/test/setup/global-setup.ts'],
    globalTeardown: ['./src/test/setup/global-teardown.ts'],
    include: [
      'src/**/*.{integration,test}.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/categories/integration/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.vercel/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/test-results/**',
      '**/test/categories/unit/**',
      '**/test/categories/e2e/**',
      '**/*.unit.test.{js,jsx,ts,tsx}',
      '**/*.e2e.test.{js,jsx,ts,tsx}',
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
        '**/src/test/**',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    reporters: ['verbose'],
    outputFile: {
      json: 'test-results/integration-test-results.json',
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
    testTimeout: 15000,
    hookTimeout: 15000,
  },

  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
