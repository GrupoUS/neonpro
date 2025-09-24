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
        'node_modules/**',
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
        '**/stories/**',
        '**/examples/**',
        '**/*.css',
        '**/*.scss',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
  plugins: [],
})
