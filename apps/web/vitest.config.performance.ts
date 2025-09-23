/**
 * Vitest Configuration for Performance Tests
 * 
 * Configuration for running performance tests with proper
 * monitoring, benchmarking, and regression detection
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/__tests__/setup/test-setup.ts',
      './src/__tests__/setup/performance-setup.ts'
    ],
    include: [
      'src/**/performance/**/*.test.{js,jsx,ts,tsx}',
      'src/**/*performance*.test.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'src/**/*.unit.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'
    ],
    // Performance test specific settings
    testTimeout: 30000, // 30 seconds for performance tests
    hookTimeout: 30000,
    // No retries for performance tests to get accurate metrics
    retry: 0,
    // Slow test threshold
    slowTestThreshold: 10000,
    // Output format for performance metrics
    reporters: [
      'verbose',
      [
        'json',
        {
          outputFile: 'performance-results.json'
        }
      ]
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/__tests__': path.resolve(__dirname, './src/__tests__')
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    // Performance testing endpoints
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {
      NODE_ENV: '"test"',
      DATABASE_URL: '"postgresql://postgres:postgres@localhost:5432/neonpro_test"',
      VITE_API_URL: '"http://localhost:3001"',
      VITE_PERFORMANCE_MONITORING: '"true"'
    }
  },
  // Performance monitoring settings
  performance: {
    // Enable performance monitoring
    enabled: true,
    // Performance thresholds
    thresholds: {
      // Render time thresholds (ms)
      renderTime: {
        fast: 100,
        acceptable: 200,
        slow: 500
      },
      // Memory usage thresholds (MB)
      memoryUsage: {
        low: 50,
        medium: 100,
        high: 200
      },
      // Response time thresholds (ms)
      responseTime: {
        fast: 200,
        acceptable: 500,
        slow: 1000
      },
      // WebSocket latency thresholds (ms)
      websocketLatency: {
        excellent: 50,
        good: 100,
        acceptable: 200
      },
      // Concurrent user thresholds
      concurrentUsers: {
        successRate: 0.95,
        errorRate: 0.05
      }
    },
    // Performance monitoring intervals
    monitoring: {
      // Memory monitoring interval (ms)
      memoryInterval: 5000,
      // Long task monitoring
      longTaskThreshold: 100,
      // Network request monitoring
      networkTimeout: 5000
    },
    // Benchmark configuration
    benchmark: {
      // Number of iterations for benchmarks
      iterations: 100,
      // Warmup iterations
      warmupIterations: 10,
      // Minimum sample size
      minSamples: 20,
      // Maximum time for benchmarks (ms)
      maxTime: 30000
    },
    // Load testing configuration
    loadTesting: {
      // Default concurrent users
      defaultUsers: 10,
      // Default duration (ms)
      defaultDuration: 30000,
      // Ramp up time (ms)
      rampUpTime: 5000,
      // Think time between requests (ms)
      thinkTime: 1000,
      // Timeout for requests (ms)
      requestTimeout: 10000
    },
    // Regression detection
    regression: {
      // Percentage threshold for regression detection
      threshold: 0.2, // 20%
      // Minimum number of samples to consider
      minSamples: 10,
      // Confidence interval (0-1)
      confidence: 0.95
    }
  }
});