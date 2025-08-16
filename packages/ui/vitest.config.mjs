/**
 * Vitest Configuration for @neonpro/ui Package
 * Migrated from Jest with enhanced type safety
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    name: '@neonpro/ui',
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./vitest.setup.ts'],
    
    // Test patterns
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts'
      ]
    },
    
    // Globals for React Testing Library
    globals: true,
    
    // Skip tests if no test files exist
    passWithNoTests: true,
    
    // Module resolution
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})