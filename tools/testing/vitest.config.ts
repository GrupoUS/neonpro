/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./setup.ts'],
    include: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/playwright/**'
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.*',
        '**/*.setup.*',
        '**/mocks/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../apps/web/app'),
      '@/lib': path.resolve(__dirname, '../../apps/web/app/lib'),
      '@/components': path.resolve(__dirname, '../../apps/web/app/components'),
      '@/types': path.resolve(__dirname, '../../apps/web/app/lib/types'),
      '@/utils': path.resolve(__dirname, '../../packages/utils/src'),
    }
  }
});