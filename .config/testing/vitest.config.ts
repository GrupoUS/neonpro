/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
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
    },
  },
});
