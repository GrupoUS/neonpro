import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  projects: [
    {
      name: 'apps',
      test: {
        include: ['apps/**/*.{test,spec}.{ts,tsx}'],
      },
    },
    {
      name: 'packages', 
      test: {
        include: ['packages/**/*.{test,spec}.{ts,tsx}'],
      },
    },
    {
      name: 'tools',
      test: {
        include: ['tools/**/*.{test,spec}.{ts,tsx}'],
      },
    },
  ],
})