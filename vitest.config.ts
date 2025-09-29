import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      'node_modules/**',
      'dist/**',
      '.vercel/**',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/test-results/**',
    ],
    include: [
      'apps/**/src/**/*.{test,spec}.{js,ts}',
      'packages/**/src/**/*.{test,spec}.{js,ts}',
    ],
    coverage: {
      provider: 'v8',
      exclude: ['node_modules/**', 'dist/**'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'test-results/root-test-results.json',
    },
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
    },
  },
})
