/// <reference types="vitest" />

import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Root configuration for shared tests
  './vitest.config.ts',

  // Apps configurations
  {
    test: {
      name: 'web-app',
      root: './apps/web',
      environment: 'jsdom',
      include: [
        '**/*.{test}.{ts,tsx}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/*.spec.ts', // Excluir TODOS os .spec.* (Playwright)
        '**/*.spec.tsx',
        '**/e2e/**',
        '**/playwright/**',
        '**/test/**', // Excluir pasta test (contém .spec.ts)
      ],
    },
  },

  // Packages configurations
  {
    test: {
      name: 'ui-package',
      root: './packages/ui',
      environment: 'jsdom',
      include: [
        '**/*.{test}.{ts,tsx}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'utils-package',
      root: './packages/utils',
      environment: 'node',
      include: [
        '**/*.{test}.{ts}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'types-package',
      root: './packages/types',
      environment: 'node',
      include: [
        '**/*.{test}.{ts}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'auth-package',
      root: './packages/auth',
      environment: 'jsdom',
      include: [
        '**/*.{test}.{ts,tsx}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'db-package',
      root: './packages/db',
      environment: 'node',
      include: [
        '**/*.{test}.{ts}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'domain-package',
      root: './packages/domain',
      environment: 'node',
      include: [
        '**/*.{test}.{ts}', // SOMENTE .test.* (NÃO .spec.*)
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  // Tools configurations - SOMENTE testes unitários (NÃO .spec.*)
  {
    test: {
      name: 'testing-tools',
      root: './tools/testing',
      environment: 'jsdom',
      include: [
        '**/__tests__/**/*.{ts,tsx}', // SOMENTE __tests__ (NÃO .spec.*)
      ],
      exclude: [
        '**/*.spec.ts', // Excluir TODOS os .spec.* (Playwright)
        '**/*.spec.tsx',
        '**/e2e/**',
        '**/playwright/**',
        '**/security/**',
        '**/visual/**',
        '**/*.e2e.{test,spec}.{ts,tsx}',
      ],
    },
  },
]);
