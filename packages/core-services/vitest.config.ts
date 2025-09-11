import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/services/**/*.test.ts',
      'src/services/governance/**/__tests__/**/*.test.ts',
    ],
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
