/**
 * Vitest Configuration for Integration Tests
 *
 * Configuration for running comprehensive integration tests
 * for aesthetic clinic features with proper mocking and
 * database setup
 */

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/__tests__/setup/test-setup.ts',
      './src/__tests__/setup/msw-setup.ts',
    ],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'src/__tests__/setup/',
      'src/**/*.unit.{test,spec}.{js,jsx,ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/*.config.{js,ts}',
        'src/__tests__/**/*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Higher thresholds for critical components
        './src/components/aesthetic-scheduling/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        './src/components/aesthetic-clinic/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: 'junit-integration.xml',
    },
    // Test timeout for integration tests
    testTimeout: 10000,
    hookTimeout: 10000,
    // Retry failed tests
    retry: 2,
    // Slow test threshold
    slowTestThreshold: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/__tests__': path.resolve(__dirname, './src/__tests__'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    // Mock API endpoints during testing
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {
      NODE_ENV: '"test"',
      DATABASE_URL: '"postgresql://postgres:postgres@localhost:5432/neonpro_test"',
      VITE_API_URL: '"http://localhost:3001"',
    },
  },
});
