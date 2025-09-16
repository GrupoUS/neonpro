/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [
      path.resolve(__dirname, '../../.config/testing/vitest.setup.ts'),
      path.resolve(__dirname, './src/setup.ts')
    ],
    include: [
      'src/**/*.{test,spec}.{ts,js}',
      'src/**/__tests__/**/*.{ts,js}',
      'src/**/*.bench.{ts,js}' // Include benchmark tests
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.bench.{ts,js}' // Exclude benchmarks from coverage
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 60000, // Longer timeout for performance tests
    benchmark: {
      include: ['src/**/*.bench.{ts,js}'],
      exclude: ['node_modules/**']
    }
  },
  resolve: {
    alias: {
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src'),
      '@neonpro/tools-shared': path.resolve(__dirname, '../shared/src')
    },
  },
});