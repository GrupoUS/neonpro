import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/__tests__/**/*',
        'src/**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        // Healthcare core business logic compliance
        'core-business': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        healthcare: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        security: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      },
      // Healthcare compliance reporting
      reportOnFailure: true
    }
  }
});