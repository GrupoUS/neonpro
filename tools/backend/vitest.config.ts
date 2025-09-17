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
      'src/**/__tests__/**/*.{ts,js}'
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
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    testTimeout: 30000 // Longer timeout for API tests
  },
  resolve: {
    alias: {
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src'),
      '@neonpro/core-services': path.resolve(__dirname, '../../packages/core-services/src'),
      '@neonpro/tools-shared': path.resolve(__dirname, '../shared/src')
    },
  },
});