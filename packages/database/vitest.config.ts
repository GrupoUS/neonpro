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
        // Healthcare database operations compliance (LGPD data protection)
        'database-operations': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'data-migration': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'schema-validation': {
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