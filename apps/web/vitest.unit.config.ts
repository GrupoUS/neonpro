import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/test-setup.ts'],
    include: [
      'src/**/*.{unit,test}.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/categories/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.vercel/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/test-results/**',
      '**/test/categories/integration/**',
      '**/test/categories/e2e/**',
      '**/*.integration.test.{js,jsx,ts,tsx}',
      '**/*.e2e.test.{js,jsx,ts,tsx}',
      '**/*.api.test.{js,jsx,ts,tsx}',
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
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    reporters: ['verbose'],
    outputFile: {
      'json': 'test-results/unit-test-results.json',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
    },
    testTimeout: 10000,
    hookTimeout: 10000,
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