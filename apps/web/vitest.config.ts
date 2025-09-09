import path from 'path'
import { defineConfig, } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src',),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src',),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src',),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src',),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts',],
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'lib/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'tests/integration/**',
      'tests/e2e/**',
      'tests/performance/**',
      'lib/integration/**',
      'lib/e2e/**',
      'lib/performance/**',
      'lib/benchmarks/**',
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    deps: {
      inline: [
        /@neonpro\/shared/,
        /@neonpro\/utils/,
      ],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html',],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  },
},)
