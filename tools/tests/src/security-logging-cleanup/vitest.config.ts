/**
 * Vitest Configuration for Security Logging Cleanup Tests
 * 
 * This configuration ensures all RED phase test scenarios can be executed
 * properly and provides the necessary setup for comprehensive testing.
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test files pattern
    include: [
      '**/*.test.ts',
      '**/*.spec.ts'
    ],
    
    // Exclude non-test files
    exclude: [
      'node_modules/**',
      'dist/**',
      '**/*.d.ts'
    ],
    
    // Global test setup
    globalSetup: ['./setup.ts'],
    
    // Test timeout
    testTimeout: 30000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Verbose output for debugging
    verbose: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    
    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    unstubGlobals: true,
    
    // Test isolation
    isolate: true,
    
    // Concurrency settings
    maxConcurrency: 4,
    fileParallelism: true,
    
    // Output configuration
    outputFile: 'junit.xml',
    reporters: ['verbose', 'junit']
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../../../'),
      '@neonpro/security': resolve(__dirname, '../../../../packages/security/src'),
      '@neonpro/core': resolve(__dirname, '../../../../packages/core-services/src'),
      '@neonpro/database': resolve(__dirname, '../../../../packages/database/src'),
      '@neonpro/shared': resolve(__dirname, '../../../../packages/shared/src')
    }
  },
  
  // TypeScript configuration
  esbuild: {
    target: 'node18',
    format: 'esm'
  }
})