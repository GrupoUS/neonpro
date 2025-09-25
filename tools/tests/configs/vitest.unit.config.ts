import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    isolate: true,
    pool: 'threads',
    include: [
      '**/*.unit.test.{ts,tsx}',
      '**/*.unit.spec.{ts,tsx}',
      'categories/**/*.test.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.integration.test.{ts,tsx}',
      '**/*.e2e.test.{ts,tsx}',
      '**/*.api.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/test-results/**',
        '**/coverage/**',
        '**/*.config.*',
        '**/*.setup.*',
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
    setupFiles: [],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../..'),
      '@tests': resolve(__dirname, '..'),
    },
  },
})