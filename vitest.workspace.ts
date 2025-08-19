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
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}'
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/e2e/**',
        '**/playwright/**'
      ]
    }
  },

  // Packages configurations
  {
    test: {
      name: 'ui-package',
      root: './packages/ui',
      environment: 'jsdom',
      include: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}'
      ]
    }
  },

  {
    test: {
      name: 'utils-package',
      root: './packages/utils',
      environment: 'node',
      include: [
        '**/*.{test,spec}.{ts}',
        '**/__tests__/**/*.{ts}'
      ]
    }
  },

  {
    test: {
      name: 'types-package',
      root: './packages/types',
      environment: 'node',
      include: [
        '**/*.{test,spec}.{ts}',
        '**/__tests__/**/*.{ts}'
      ]
    }
  },

  {
    test: {
      name: 'auth-package',
      root: './packages/auth',
      environment: 'jsdom',
      include: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}'
      ]
    }
  },

  {
    test: {
      name: 'db-package',
      root: './packages/db',
      environment: 'node',
      include: [
        '**/*.{test,spec}.{ts}',
        '**/__tests__/**/*.{ts}'
      ]
    }
  },

  {
    test: {
      name: 'domain-package',
      root: './packages/domain',
      environment: 'node',
      include: [
        '**/*.{test,spec}.{ts}',
        '**/__tests__/**/*.{ts}'
      ]
    }
  },

  // Tools configurations
  {
    test: {
      name: 'testing-tools',
      root: './tools/testing',
      environment: 'jsdom',
      include: [
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}'
      ],
      exclude: [
        '**/e2e/**',
        '**/playwright/**',
        '**/*.e2e.{test,spec}.{ts,tsx}'
      ]
    }
  }
]);
