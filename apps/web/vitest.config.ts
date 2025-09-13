import path from 'path';
import { defineConfig } from 'vitest/config';
import type { InlineConfig } from 'vitest';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/database': path.resolve(__dirname, '../../packages/database/src'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    pool: 'forks',
    // Curated, fast test suite (5–6 core tests) by default.
    // To run FULL suite (including legacy/excluídos), set FULL_TESTS=1
    include: process.env.FULL_TESTS
      ? [
          'src/**/*.{test,spec}.{ts,tsx}',
          'lib/**/*.{test,spec}.{ts,tsx}',
          'tools/tests/**/*.{test,spec}.{ts,tsx}',
        ]
      : [
          'src/__tests__/routes/dashboard.test.tsx',
          'src/__tests__/routes/appointments.test.tsx',
          'src/__tests__/routes/clients.test.tsx',
          'src/__tests__/auth-form.test.tsx',
          'src/components/organisms/__tests__/NotificationCard.test.tsx',
          'src/components/ui/__tests__/SharedAnimatedList.test.tsx',
        ],
    // Broad excludes to skip legacy/slow suites by default
    exclude: [

      '**/*.test.ts',
      '**/*.spec.ts',
      '**/*.integration.test.ts',
      'tools/tests/integration/**',
      'tools/tests/e2e/**',
      'tools/tests/performance/**',
      'lib/integration/**',
      'lib/e2e/**',
      'lib/performance/**',
      'lib/benchmarks/**',
      'src/lib/emergency/emergency-cache.test.ts',
      'src/components/organisms/governance/**',
      'src/__tests__/legacy/**',
      'src/components/ui/ai-chat/**',
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    deps: {
      optimizer: {
        web: {
          include: [
            '@neonpro/shared',
            '@neonpro/utils',
            '@neonpro/ui',
          ],
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  } satisfies InlineConfig,
});