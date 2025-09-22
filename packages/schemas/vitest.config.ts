import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // TDD Compliance: Require tests to exist (no empty suites allowed)
    passWithNoTests: false,
    globals: false,
    environment: "node",
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
<<<<<<< HEAD
        'node_modules/**',
=======
        'node_modules/_,
>>>>>>> origin/main
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types/**',
        '**/examples/**',
        '**/legacy/**',
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
  plugins: [],
});