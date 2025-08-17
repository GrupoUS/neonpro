/**
 * 🏥 Healthcare Vitest Configuration - NeonPro
 * ≥90% Coverage Requirements with Patient Data Protection
 * Constitutional Healthcare Testing Standards
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment optimized for healthcare components
    environment: 'jsdom',
    
    // Healthcare test patterns
    include: [
      'apps/web/__tests__/healthcare/**/*.test.{js,jsx,ts,tsx}',
      'apps/web/components/**/*.healthcare.test.{js,jsx,ts,tsx}',
      'apps/web/app/**/*.healthcare.test.{js,jsx,ts,tsx}'
    ],
    
    // Healthcare-specific globals
    globals: true,
    
    // Healthcare test setup
    setupFiles: [
      './apps/web/__tests__/healthcare/setup/healthcare-test-setup.ts'
    ],
    
    // Coverage configuration for healthcare compliance
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage/healthcare',
      
      // Coverage thresholds for healthcare quality (≥90%)
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      },
      
      include: [
        'apps/web/components/**/*.{js,jsx,ts,tsx}',
        'apps/web/lib/**/*.{js,jsx,ts,tsx}',
        'apps/web/app/**/*.{js,jsx,ts,tsx}'
      ],
      
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/*.config.{js,ts,mjs}',
        '**/coverage/**',
        '**/*.stories.{js,jsx,ts,tsx}'
      ]
    },
    
    // Healthcare test timeout (patient safety consideration)
    testTimeout: 10000,
    
    // Clear mocks between tests (patient data protection)
    clearMocks: true,
    
    // Restore mocks after each test (healthcare security)
    restoreMocks: true,
    
    // Mock reset (healthcare data isolation)
    mockReset: true,
    
    // Reporters for healthcare audit trails
    reporters: ['verbose', 'html'],
    
    // Fail on console errors (healthcare quality standards)
    onConsoleLog: (log) => {
      if (log.includes('ERROR') || log.includes('WARN')) {
        return false
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web'),
      '@/components': path.resolve(__dirname, './apps/web/components'),
      '@/lib': path.resolve(__dirname, './apps/web/lib'),
      '@/app': path.resolve(__dirname, './apps/web/app'),
      '@/types': path.resolve(__dirname, './apps/web/types'),
      '@/utils': path.resolve(__dirname, './apps/web/utils')
    }
  }
})