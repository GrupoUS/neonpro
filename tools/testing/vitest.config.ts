import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Test files location - focus on new structure for now
    include: [
      'tools/testing/unit/**/*.{test,spec}.{js,ts,jsx,tsx}',
      // TODO: Migrate and re-enable after Jest to Vitest migration
      // 'apps/**/*.{test,spec}.{js,ts,jsx,tsx}',
      // 'packages/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],

    // Exclude E2E tests and old Jest tests temporarily
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      'tools/testing/e2e/**',
      'tools/testing/playwright/**',
      '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}',
      // Temporarily exclude Jest-based tests until migration
      'apps/web/**/__tests__/**',
      'apps/web/**/*.test.{js,ts,jsx,tsx}',
      'apps/web/**/*.spec.{js,ts,jsx,tsx}',
      'apps/web/lib/**/*.test.{js,ts,jsx,tsx}',
      'apps/web/app/**/*.test.{js,ts,jsx,tsx}',
    ],

    // Global setup and teardown
    setupFiles: ['./tools/testing/unit/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './tools/testing/reports/coverage',
      include: ['apps/**/*.{js,ts,jsx,tsx}', 'packages/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        '**/*.config.{js,ts}',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
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

    // Test timeout
    testTimeout: 10_000,

    // Test runners
    reporters: ['default', 'json', 'html'],

    // Output directory for reports
    outputFile: {
      json: './tools/testing/reports/vitest-results.json',
      html: './tools/testing/reports/vitest-report.html',
    },

    // Watch mode settings
    watch: false,

    // Global test configuration
    globals: true,

    // Pool options for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../'),
      '@/apps': resolve(__dirname, '../../apps'),
      '@/packages': resolve(__dirname, '../../packages'),
      '@/tools': resolve(__dirname, '../../tools'),
    },
  },

  // Define global constants
  define: {
    __TEST__: true,
  },
});
