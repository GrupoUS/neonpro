import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // TDD Compliance: Require tests to exist (no empty suites allowed)
    passWithNoTests: false,
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
        '**/examples/**',
        '**/schemas/**',
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
  },
  plugins: [],
})
