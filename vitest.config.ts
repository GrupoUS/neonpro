/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    
    // Incluir todos os testes que existem
    include: [
      '**/*.{test,spec}.{ts,tsx}',
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
      
      // Excluir TODOS os testes Playwright e E2E
      '**/playwright/**',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.e2e.test.ts',
      '**/*.e2e.test.tsx',
      '**/e2e/**',
      '**/cypress/**',
      
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
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/utils': path.resolve(__dirname, './packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
    },
    
    // Pool de workers otimizado
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    
    // Timeouts apropriados para healthcare
    testTimeout: 30000,
    hookTimeout: 30000,
    
    // Configuração de reporter
    reporter: ['basic'],
    
    // Otimização de deps
    deps: {
      inline: [
        '@testing-library/react',
        '@testing-library/jest-dom',
      ]
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
        'vitest.config.ts'
      ]
    }
  },
  
  // Configuração do Vite
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@/lib': path.resolve(__dirname, './apps/web/lib'),
      '@/components': path.resolve(__dirname, './apps/web/components'),
      '@/utils': path.resolve(__dirname, './packages/utils/src'),
      '@/types': path.resolve(__dirname, './packages/types/src'),
      '@neonpro/ui': path.resolve(__dirname, './packages/ui/src'),
      '@neonpro/utils': path.resolve(__dirname, './packages/utils/src'),
      '@neonpro/types': path.resolve(__dirname, './packages/types/src'),
    }
  },
  
  // Configuração específica para monorepo
  optimizeDeps: {
    include: ['react', 'react-dom', '@testing-library/react']
  },
})