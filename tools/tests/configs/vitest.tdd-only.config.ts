/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    // Configuração simplificada para testes TDD do PR 59
    globals: true,
    environment: 'node',
    setupFiles: ['./fixtures/setup.ts'],

    // Focar apenas nos nossos testes TDD
    include: [
      'categories/backend/unit/package-manager-consistency.test.ts',
      'categories/backend/unit/test-path-references.test.ts',
      'categories/backend/integration/ci-workflow-validation.test.ts',
      'categories/backend/integration/package-structure-integration.test.ts',
      'categories/backend/integration/end-to-end-pipeline.test.ts',
    ],

    // Excluir tudo para evitar interferência
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/categories/backend/unit/background-jobs-manager.test.ts',
      '**/categories/backend/unit/example.test.ts',
      '**/categories/backend/unit/error-handling/**',
      '**/categories/backend/unit/reference-error-tests/**',
      '**/categories/backend/unit/security/**',
    ],

    // Coverage simples
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../../coverage',
      exclude: [
        'node_modules/',
        'fixtures/',
        'configs/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },

    // Performance otimizada
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: false,
      },
    },

    // Timeouts razoáveis
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, '../../../'),
      '@api': resolve(__dirname, '../../../apps/api/src'),
      '@web': resolve(__dirname, '../../../apps/web/src'),
      '@packages': resolve(__dirname, '../../../packages'),
      '@tools': resolve(__dirname, '../../../tools'),
      '@shared': resolve(__dirname, '../../../packages/shared/src'),
      '@types': resolve(__dirname, '../../../packages/types/src'),
      '@utils': resolve(__dirname, '../../../packages/utils/src'),
    },
  },
})