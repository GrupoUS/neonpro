import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'tests/',
        'vitest.config.ts',
        'tsup.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});