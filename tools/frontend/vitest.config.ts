/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      path.resolve(__dirname, '../../.config/testing/vitest.setup.ts'),
      path.resolve(__dirname, './src/setup.ts')
    ],
    include: [
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'src/**/__tests__/**/*.{ts,tsx,js,jsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**' // E2E tests handled by Playwright
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/e2e/**'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../apps/web/src'),
      '@/components': path.resolve(__dirname, '../../apps/web/src/components'),
      '@/lib': path.resolve(__dirname, '../../apps/web/src/lib'),
      '@/hooks': path.resolve(__dirname, '../../apps/web/src/hooks'),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src'),
      '@neonpro/tools-shared': path.resolve(__dirname, '../shared/src')
    },
  },
});