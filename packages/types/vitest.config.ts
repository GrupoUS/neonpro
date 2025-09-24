import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // TDD Compliance: Require tests to exist (no empty suites allowed)
    passWithNoTests: false,
    globals: false,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
      ],
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
  plugins: [],
})
