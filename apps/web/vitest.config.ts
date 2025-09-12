import path from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../../.config/testing/vitest.config';

export default mergeConfig(
  shared,
  defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@neonpro/shared': path.resolve(__dirname, '../../packages/shared/src'),
        '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
        '@neonpro/database': path.resolve(__dirname, '../../packages/database/src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      pool: 'forks',
      threads: false,
      include: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'lib/**/*.{test,spec}.{ts,tsx}',
        'tools/tests/**/*.{test,spec}.{ts,tsx}',
      ],
      exclude: [
        'tools/tests/integration/**',
        'tools/tests/e2e/**',
        'tools/tests/performance/**',
        'lib/integration/**',
        'lib/e2e/**',
        'lib/performance/**',
        'lib/benchmarks/**',
        'src/lib/emergency/emergency-cache.test.ts', // Temporarily exclude flaky test
      ],
      testTimeout: 30000,
      hookTimeout: 30000,
      deps: {
        optimizer: {
          web: {
            include: [
              '@neonpro/shared',
              '@neonpro/utils',
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
    },
  }),
);
