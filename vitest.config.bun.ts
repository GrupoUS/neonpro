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
          branches: 85, // Increased for healthcare compliance
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    reporters: ['verbose', 'json', 'junit'],
    outputFile: {
      json: 'test-results/bun-test-results.json',
      junit: 'test-results/bun-test-results.xml',
    },
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
    },
    // Bun-specific optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: false,
      },
    },
    maxWorkers: Math.max(1, Math.min(4, Math.floor(require('os').cpus().length / 2))),
    minWorkers: 1,
    testTimeout: 30000, // Increased for healthcare tests
    hookTimeout: 30000,
    // Healthcare compliance settings
    globals: true,
    setupFiles: ['./src/test/setup/bun-test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
      '@neonpro/core': path.resolve(__dirname, './packages/core/src'),
      '@neonpro/database': path.resolve(__dirname, './packages/database/src'),
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/config': path.resolve(__dirname, './packages/config/src'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'test'),
  },
})