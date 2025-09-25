import * as path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tools/tests/setup.ts'],
    include: [
      'tools/tests/**/*.{test,spec}.{js,ts}',
      'tools/tests/integration/**/*.{test,spec}.{js,ts}',
    ],
    exclude: ['node_modules/**', 'dist/**', '.vercel/**'],
    testTimeout: 30000, // 30 seconds for integration tests
    bail: 1,
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './packages'),
      '@types': path.resolve(__dirname, './packages/types/src'),
      '@utils': path.resolve(__dirname, './packages/utils/src'),
      '@config': path.resolve(__dirname, './packages/config/src'),
    },
  },
})
