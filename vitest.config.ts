import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tools/testing/vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/ui/*': path.resolve(__dirname, './packages/ui/src/*'),
      '@neonpro/utils': path.resolve(__dirname, './packages/utils/src'),
      '@neonpro/utils/*': path.resolve(__dirname, './packages/utils/src/*'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
      '@neonpro/types/*': path.resolve(__dirname, './packages/types/src/*'),
      '@neonpro/shared': path.resolve(__dirname, './packages/shared/src'),
      '@neonpro/shared/*': path.resolve(__dirname, './packages/shared/src/*'),
      '@neonpro/security': path.resolve(__dirname, './packages/security/src'),
      '@neonpro/security/*': path.resolve(__dirname, './packages/security/src/*'),
      '@neonpro/database': path.resolve(__dirname, './packages/database/src'),
      '@neonpro/database/*': path.resolve(__dirname, './packages/database/src/*'),
      '@apps/*': path.resolve(__dirname, './apps/*/src'),
    },
  },
  include: [
    'apps/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'packages/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'tools/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  exclude: [
    'node_modules',
    'dist',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
  ],
});