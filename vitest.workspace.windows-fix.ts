/// <reference types="vitest" />

import { defineWorkspace } from 'vitest/config';
import path from 'path';

// Configuração alternativa para resolver problemas de workspace folder no Windows
export default defineWorkspace([
  // Root configuration for shared tests
  {
    test: {
      name: 'root-config',
      root: process.cwd(),
      environment: 'node',
      include: ['./vitest.config.ts'],
    },
  },

  // Apps configurations
  {
    test: {
      name: 'web-app',
      root: path.resolve(process.cwd(), 'apps/web'),
      environment: 'jsdom',
      include: [
        '**/*.{test}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/e2e/**',
        '**/playwright/**',
        '**/test/**',
      ],
    },
  },

  // Packages configurations
  {
    test: {
      name: 'ui-package',
      root: path.resolve(process.cwd(), 'packages/ui'),
      environment: 'jsdom',
      include: [
        '**/*.{test}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'utils-package',
      root: path.resolve(process.cwd(), 'packages/utils'),
      environment: 'node',
      include: [
        '**/*.{test}.{ts}',
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'types-package',
      root: path.resolve(process.cwd(), 'packages/types'),
      environment: 'node',
      include: [
        '**/*.{test}.{ts}',
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'auth-package',
      root: path.resolve(process.cwd(), 'packages/auth'),
      environment: 'jsdom',
      include: [
        '**/*.{test}.{ts,tsx}',
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'db-package',
      root: path.resolve(process.cwd(), 'packages/db'),
      environment: 'node',
      include: [
        '**/*.{test}.{ts}',
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  {
    test: {
      name: 'domain-package',
      root: path.resolve(process.cwd(), 'packages/domain'),
      environment: 'node',
      include: [
        '**/*.{test}.{ts}',
        '**/__tests__/**/*.{ts}',
      ],
      exclude: ['**/*.spec.*'],
    },
  },

  // Tools configurations
  {
    test: {
      name: 'testing-tools',
      root: path.resolve(process.cwd(), 'tools/testing'),
      environment: 'jsdom',
      include: [
        '**/__tests__/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.spec.ts',
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