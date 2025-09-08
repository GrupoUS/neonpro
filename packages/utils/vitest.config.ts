import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    reporters: (() => {
      const reporters: string[] = ['default',]
      const reporterPath = path.resolve(__dirname, '../../.vitest-reporters/junit.cjs',)
      const enabled = process.env.VITEST_JUNIT !== '0'
      if (enabled && fs.existsSync(reporterPath,)) reporters.push(reporterPath,)
      return reporters
    })(),
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.test.{ts,tsx}',],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov',],
      reportsDirectory: 'coverage',
      all: true,
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src',),
    },
  },
},)
