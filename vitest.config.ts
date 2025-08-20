/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Projects configuration (replaces workspace)
    projects: [
      // Root tests
      {
        name: 'root',
        root: '.',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts,tsx,js,jsx}',
          '**/*.integration.test.{ts,tsx,js,jsx}',
          '**/__tests__/**/*.{ts,tsx,js,jsx}',
          '**/test/**/*.{test}.{ts,tsx,js,jsx}',
          '!**/node_modules/**',
          '!**/dist/**',
          '!**/.next/**',
          '!**/apps/**', // Exclude apps (they have their own configs below)
          '!**/packages/**', // Exclude packages (they have their own configs below)
          '!**/tools/**', // Exclude tools (they have their own configs below)
        ],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/coverage/**',
          '**/.next/**',
          '**/.vercel/**',
          '**/.nuxt/**',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.spec.js',
          '**/*.spec.jsx',
          '**/playwright/**',
          '**/*.e2e.test.ts',
          '**/*.e2e.test.tsx',
          '**/*.e2e.spec.ts',
          '**/*.e2e.spec.tsx',
          '**/e2e/**',
          '**/cypress/**',
          '**/security/**',
          '**/visual/**',
          '**/performance/**',
          '**/load-testing/**',
        ],
      },

      // Web App
      {
        name: 'web-app',
        root: './apps/web',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../../vitest.setup.ts'],
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

      // API App
      {
        name: 'api',
        root: './apps/api',
        globals: true,
        environment: 'node',
        setupFiles: ['./vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts}',
          '**/__tests__/**/*.{ts}',
        ],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/*.spec.ts',
          '**/e2e/**',
        ],
      },

      // UI Package
      {
        name: 'ui-package',
        root: './packages/ui',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts,tsx}',
          '**/__tests__/**/*.{ts,tsx}',
        ],
        exclude: ['**/*.spec.*'],
      },

      // Utils Package
      {
        name: 'utils-package',
        root: './packages/utils',
        globals: true,
        environment: 'node',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts}',
          '**/__tests__/**/*.{ts}',
        ],
        exclude: ['**/*.spec.*'],
      },

      // Types Package
      {
        name: 'types-package',
        root: './packages/types',
        globals: true,
        environment: 'node',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts}',
          '**/__tests__/**/*.{ts}',
        ],
        exclude: ['**/*.spec.*'],
      },

      // Auth Package
      {
        name: 'auth-package',
        root: './packages/auth',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts,tsx}',
          '**/__tests__/**/*.{ts,tsx}',
        ],
        exclude: ['**/*.spec.*'],
      },

      // DB Package
      {
        name: 'db-package',
        root: './packages/db',
        globals: true,
        environment: 'node',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts}',
          '**/__tests__/**/*.{ts}',
        ],
        exclude: ['**/*.spec.*'],
      },

      // Domain Package
      {
        name: 'domain-package',
        root: './packages/domain',
        globals: true,
        environment: 'node',
        setupFiles: ['../../vitest.setup.ts'],
        include: [
          '**/*.{test}.{ts}',
          '**/__tests__/**/*.{ts}',
        ],
        exclude: ['**/*.spec.*'],
      },

      // Testing Tools
      {
        name: 'testing-tools',
        root: './tools/testing',
        globals: true,
        environment: 'jsdom',
        setupFiles: ['../../vitest.setup.ts'],
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
    ],

    // Global test configuration
    // Global test configuration
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],

    // Pool de workers otimizado
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },

    // Timeouts apropriados para healthcare
    testTimeout: 30_000,
    hookTimeout: 30_000,

    // Configuração de reporter
    reporter: ['basic'],

    // Otimização de deps modernizada (removendo deprecated external)
    deps: {
      optimizer: {
        web: {
          exclude: ['@testing-library/react', '@testing-library/jest-dom'],
        },
      },
    },

    // Configuração de coverage apenas para arquivos válidos
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/playwright/**',
        '**/e2e/**',
        'coverage/',
        '.next/',
        'vitest.config.ts',
      ],
    },
  },

  // Configuração do Vite
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@/lib': path.resolve(__dirname, './apps/web/lib'),
      '@/components': path.resolve(__dirname, './apps/web/components'),
      '@/utils': path.resolve(__dirname, './packages/utils/src'),
      '@/types': path.resolve(__dirname, './packages/types/src'),
      '@test': path.resolve(__dirname, './tools/testing'),
      '@/test': path.resolve(__dirname, './tools/testing'),
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/utils': path.resolve(__dirname, './packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
      zod: path.resolve(__dirname, './node_modules/zod'),
    },
  },

  // CRÍTICO: Configuração para resolver dependências do monorepo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/react',
      '@testing-library/jest-dom',
      'zod',
      'lucide-react',
      '@tanstack/react-query',
      'web-vitals',
    ],
  },
});
