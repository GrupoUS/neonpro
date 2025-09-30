import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { cpus } from 'node:os'

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/test/setup/bun-test-preload.ts'],
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
      '**/*.{test,spec}.{js,ts}', // Changed to exclude node_modules implicitly, but already in exclude
      '!**/node_modules/**', // Explicit exclusion for safety
    ],
    coverage: {
      provider: 'v8',
      exclude: ['node_modules/**', 'dist/**'],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        // Healthcare-specific thresholds for compliance (LGPD, ANVISA, CFM)
        healthcare: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        security: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        api: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'core-business': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
      // Healthcare compliance reporting
      reportOnFailure: true,
      include: [
        '**/healthcare/**/*.{js,ts}',
        '**/security/**/*.{js,ts}',
        '**/api/**/*.{js,ts}',
        '**/core/**/*.{js,ts}',
      ],
    },
    reporters: ['verbose', 'json', 'junit'],
    outputFile: {
      json: 'test-results/root-test-results.json',
      junit: 'test-results/root-test-results.xml',
    },
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
    },
    // Healthcare-optimized test settings
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: false,
      },
    },
    maxWorkers: Math.max(1, Math.min(4, Math.floor(cpus().length / 2))),
    minWorkers: 1,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
