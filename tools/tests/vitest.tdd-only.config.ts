import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    include: [
      '**/*.tdd.test.{ts,tsx}',
      '**/*.red-phase.test.{ts,tsx}',
      '**/backend/unit/**/*.test.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/ai/**',
      '**/integration/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
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
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    setupFiles: [],
    testTimeout: 5000,
    hookTimeout: 5000,
    sequence: {
      shuffle: false,
      seed: 123,
    },
    chaiConfig: {
      truncateThreshold: 0,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../..'),
      '@tests': resolve(__dirname, '.'),
    },
  },
})