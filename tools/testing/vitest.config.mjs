/**
 * Main Vitest Configuration for NeonPro Testing Suite
 * Comprehensive testing setup with multiple project configurations
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Main test environment
    environment: 'node',
    
    // Test patterns
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.spec.ts'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}'
      ],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/.next/**'
      ]
    },
    
    // Setup files
    setupFiles: ['./__tests__/setup.ts'],
    
    // Test timeout
    testTimeout: 30000,
    
    // Verbose reporting
    reporters: ['verbose'],
    
    // Module resolution
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app')
    }
  }
})