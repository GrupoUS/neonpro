/// <reference types="vitest" />

import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],

    // Incluir todos os testes que existem no monorepo
    include: [
      '**/*.{test,spec}.{ts,tsx,js,jsx}',
      '**/*.integration.test.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/test/**/*.{test,spec}.{ts,tsx,js,jsx}',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/.next/**',
      '!**/playwright/**',
      '!**/e2e/**',
      '!**/cypress/**',
    ],

    // Configuração abrangente de exclusões apenas para arquivos problemáticos
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/.nuxt/**',

      // Excluir APENAS testes Playwright e E2E específicos
      '**/playwright/**',
      '**/*.e2e.test.ts',
      '**/*.e2e.test.tsx',
      '**/*.e2e.spec.ts',
      '**/*.e2e.spec.tsx',
      '**/e2e/**',
      '**/cypress/**',

      // Excluir testes playwright específicos que estão sendo detectados
      '**/apps/web/test/**/*.spec.ts',
      '**/apps/web/test/**/*.spec.tsx',
      '**/tools/testing/e2e/**',
      '**/tools/testing/playwright/**',

      // Excluir testes que requerem servidor ativo
      '**/performance/**',
      '**/load-testing/**',
    ],

    // Resolver aliases
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
      '@neonpro/auth': path.resolve(__dirname, './packages/auth/src'),
      '@neonpro/db': path.resolve(__dirname, './packages/db/src'),
      '@neonpro/domain': path.resolve(__dirname, './packages/domain/src'),
    },

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

    // Otimização de deps simplificada
    deps: {
      // Remove optimizer para evitar problemas de resolução
      external: ['@testing-library/react', '@testing-library/jest-dom'],
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

  // Configuração específica para monorepo
  // optimizeDeps: {
  //   include: ['react', 'react-dom', '@testing-library/react'],
  // },
});
