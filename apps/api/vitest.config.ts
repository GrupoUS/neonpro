import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.vercel/**',
      '../../apps/web/**',
    ],
    reporters: ['default'],
    bail: 1,
    timeout: 20000,
  },
  resolve: {
    alias: {
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
    },
  },
});
