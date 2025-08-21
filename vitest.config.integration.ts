/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Integration test configuration
    name: 'integration',
    include: ['apps/web/tests/integration/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.d.ts',
      'apps/web/tests/unit/**',
      'apps/web/tests/e2e/**',
    ],

    // Test environment
    environment: 'happy-dom',
    setupFiles: ['apps/web/tests/integration/integration-test-setup.ts'],

    // Performance and timeout settings
    testTimeout: 30_000, // 30 seconds for integration tests
    hookTimeout: 10_000, // 10 seconds for setup/teardown

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage/integration',
      include: [
        'apps/web/app/**/*.{ts,tsx}',
        'apps/web/lib/**/*.{ts,tsx}',
        'apps/web/hooks/**/*.{ts,tsx}',
        'packages/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/coverage/**',
        '**/build/**',
        '**/.next/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 75,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Globals and mocking
    globals: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Reporter configuration
    reporter: ['default', 'json', 'html'],
    outputFile: {
      json: 'test-results/integration-results.json',
      html: 'test-results/integration-report.html',
    },

    // Pool configuration for parallel execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        maxForks: 4, // Limit concurrent tests to prevent database conflicts
      },
    },

    // Retry configuration for flaky integration tests
    retry: 2,

    // Test sequence
    sequence: {
      concurrent: false, // Run integration tests sequentially to avoid conflicts
      shuffle: false, // Keep predictable order
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web'),
      '@/components': path.resolve(__dirname, 'apps/web/components'),
      '@/lib': path.resolve(__dirname, 'apps/web/lib'),
      '@/hooks': path.resolve(__dirname, 'apps/web/hooks'),
      '@/types': path.resolve(__dirname, 'packages/types/src'),
      '@/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@/shared': path.resolve(__dirname, 'packages/shared/src'),
    },
  },

  // Environment variables for integration tests
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.INTEGRATION_TEST': '"true"',
  },
});
