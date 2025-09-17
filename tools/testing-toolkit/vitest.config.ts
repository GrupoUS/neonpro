import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment configuration
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/core/setup.ts'],

    // Coverage configuration following quality gates
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/fixtures/**',
        '**/mocks/**',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // Critical paths require higher coverage
        'src/compliance/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/agents/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },

    // Test execution configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,

    // Parallel execution for performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'src/**/*.e2e.{test,spec}.{js,ts,jsx,tsx}',
    ],

    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html',
    },

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,

    // Watch mode configuration
    watch: false,
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
    ],
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@agents': resolve(__dirname, './src/agents'),
      '@compliance': resolve(__dirname, './src/compliance'),
      '@fixtures': resolve(__dirname, './src/fixtures'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },

  // Define configuration for different environments
  define: {
    __TEST_ENV__: JSON.stringify('test'),
    __HEALTHCARE_COMPLIANCE__: JSON.stringify(true),
    __AGENT_COORDINATION__: JSON.stringify(true),
  },
});
