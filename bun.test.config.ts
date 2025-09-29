/**
 * Healthcare-Optimized Bun Test Configuration
 * 
 * Configuration for Bun's built-in test runner optimized for healthcare applications
 */

// Bun test configuration
export default {
  // Test timeout for healthcare operations (30 seconds)
  timeout: 30000,
  
  // Coverage configuration with healthcare compliance
  coverage: {
    include: [
      'apps/**/*.ts',
      'packages/**/*.ts',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.vercel/**',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/test-results/**',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },
  
  // Performance optimization for healthcare workloads
  maxConcurrency: Math.max(1, Math.min(8, Math.floor(require('os').cpus().length / 2))),
}