import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    isolate: true,
    pool: 'threads',
    include: [
      '**/*.integration.test.{ts,tsx}',
      '**/*.integration.spec.{ts,tsx}',
      '**/*.api.test.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/*.unit.test.{ts,tsx}',
      '**/*.e2e.test.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/test-results/**',
        '**/coverage/**',
        '**/*.config.*',
        '**/*.setup.*',
        '**/e2e/**',
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
    setupFiles: ['./setup/integration.setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    globalSetup: ['./setup/integration.global-setup.ts'],
    teardown: ['./setup/ai.global-teardown.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../..'),
      '@tests': resolve(__dirname, '..'),
    },
  },
})