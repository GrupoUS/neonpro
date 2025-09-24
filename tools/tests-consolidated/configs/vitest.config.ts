/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Configuração simples e eficiente seguindo KISS
    globals: true,
    environment: 'node',
    setupFiles: ['./fixtures/setup.ts'],
    
    // Organização simples por tipo de teste
    include: [
      'unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Excluir testes e2e (Playwright)
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**'
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
        '**/*.d.ts'
      ]
    },
    
    // Performance otimizada
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: false
      }
    },
    
    // Timeouts razoáveis
    testTimeout: 10000,
    hookTimeout: 10000
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
      '@utils': resolve(__dirname, '../../../packages/utils/src')
    }
  }
})