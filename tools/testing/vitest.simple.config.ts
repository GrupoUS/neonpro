/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Simplified Vitest Configuration for NeonPro Healthcare Testing
 * ============================================================
 *
 * This configuration focuses on testing without Prisma dependencies
 * to avoid workspace conflicts. Designed for healthcare compliance testing.
 */

export default defineConfig({
  test: {
    name: 'neonpro-healthcare-tests',
    environment: 'jsdom',
    globals: true,

    // Setup files for healthcare testing
    setupFiles: ['./healthcare-setup.ts', './setup.ts'],

    // Test file patterns
    include: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      '../**/*.{test,spec}.{ts,tsx}', // Include parent directory tests
    ],

    // Exclusions to avoid conflicts
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      '**/playwright/**',
      '**/cypress/**',
      '**/coverage/**',
      '**/*.e2e.{test,spec}.{ts,tsx}',
      // Skip Prisma-related tests for now
      '**/prisma/**',
      '**/database/**',
      // Skip packages that might have dependency issues
      '**/packages/database/**',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.*',
        '**/*.setup.*',
        '**/mocks/**',
        '**/e2e/**',
        '**/playwright/**',
      ],
    },

    // Test timeout for healthcare scenarios
    testTimeout: 30_000,
    hookTimeout: 30_000,

    // Healthcare-specific environment variables
    env: {
      NODE_ENV: 'test',
      HEALTHCARE_MODE: 'true',
      LGPD_COMPLIANCE: 'true',
      ANVISA_VALIDATION: 'true',
      CFM_STANDARDS: 'true',
    },
  },

  // Path resolution for NeonPro modules
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../'),
      '@/app': path.resolve(__dirname, '../../app'),
      '@/lib': path.resolve(__dirname, '../../lib'),
      '@/components': path.resolve(__dirname, '../../components'),
      '@/hooks': path.resolve(__dirname, '../../hooks'),
      '@/providers': path.resolve(__dirname, '../../providers'),
      '@/types': path.resolve(__dirname, '../../lib/types'),
      '@/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@neonpro/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },

  // Enable source maps for debugging
  esbuild: {
    sourcemap: true,
  },
});
