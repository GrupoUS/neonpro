/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * NeonPro Simplified Vitest Configuration
 *
 * FOCUS: Patient Management + Core Business Logic + Essential Components
 * REMOVED: Over-engineered compliance/security/AI testing
 * PROJECTS: 3 essential projects vs 11 complex projects
 */
export default defineConfig({
  test: {
    // Simplified projects configuration
    projects: [
      // 1. Web Application Tests (Next.js 15 + Patient Management)
      {
        name: 'web-app',
        root: './apps/web',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          // Patient Management tests (100% implemented)
          'app/(dashboard)/patients/**/*.test.{ts,tsx}',
          'components/**/*.test.{ts,tsx}',
          // Core forms and UI
          'lib/**/*.test.{ts}',
          // Essential hooks
          'hooks/**/*.test.{ts}',
        ],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.next/**',
          // Exclude premature E2E tests
          '**/*.spec.{ts,tsx}',
          '**/e2e/**',
        ],
      },

      // 2. Shared Packages Tests (Business Logic + Utils)
      {
        name: 'packages',
        root: './packages',
        globals: true,
        environment: 'node',
        setupFiles: ['../vitest.setup.ts'],
        include: [
          // Core business logic
          'shared/**/*.test.{ts}',
          'types/**/*.test.{ts}',
          'utils/**/*.test.{ts}',
          // Essential form validation
          'validators/**/*.test.{ts}',
          // UI components (shadcn/ui + TweakCN)
          'ui/**/*.test.{ts,tsx}',
        ],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          // Remove premature packages
          'compliance/**', // Test only when compliance exists
          'ai/**', // Test only when AI exists
          'security/**', // Test only when security exists
        ],
      },

      // 3. API Tests (Hono.dev Backend - if exists)
      {
        name: 'api',
        root: './apps/api',
        globals: true,
        environment: 'node',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          'src/**/*.test.{ts}',
          // Patient management API routes
          'src/routes/patients/**/*.test.{ts}',
          // Core middleware
          'src/middleware/auth.test.{ts}',
        ],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          // Remove premature compliance testing
          '**/compliance/**',
          '**/lgpd/**',
          '**/security/**',
        ],
      },
    ],

    // Global configuration - simplified
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],

    // Optimized performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // Reasonable timeouts
    testTimeout: 10_000, // Reduced from 30s
    hookTimeout: 10_000,

    // Simple reporting
    reporter: ['basic'],

    // Essential coverage only
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: [
        // Focus on implemented features
        'apps/web/app/(dashboard)/patients/**',
        'apps/web/components/**',
        'packages/shared/**',
        'packages/ui/**',
        'packages/utils/**',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'coverage/',
        '.next/',
        // Exclude premature features
        '**/compliance/**',
        '**/ai/**',
        '**/security/**',
      ],
      thresholds: {
        global: {
          branches: 70, // Realistic for MVP
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },

  // Simplified resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@/lib': path.resolve(__dirname, './apps/web/lib'),
      '@/components': path.resolve(__dirname, './apps/web/components'),
      '@/hooks': path.resolve(__dirname, './apps/web/hooks'),
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/utils': path.resolve(__dirname, './packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
      '@neonpro/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },

  // Essential dependencies only
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'zod',
      '@tanstack/react-query',
    ],
  },
});

/**
 * Testing Strategy Comments:
 *
 * FOCUS AREAS:
 * 1. Patient Management (100% implemented)
 * 2. Form validation (Zod schemas)
 * 3. Core UI components (shadcn/ui)
 * 4. Business logic utilities
 *
 * REMOVED (Premature):
 * - Compliance testing (test when compliance exists)
 * - AI testing (test when AI exists)
 * - Security testing (test when security layer exists)
 * - Accessibility testing (manual validation for MVP)
 * - Multi-tenant testing (test when multi-tenancy exists)
 *
 * EFFICIENCY GAINS:
 * - 3 projects vs 11 (63% reduction in complexity)
 * - Focus on implemented features
 * - Faster test execution
 * - Easier maintenance
 * - Clear testing boundaries
 */
