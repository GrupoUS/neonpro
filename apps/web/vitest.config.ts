import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment settings optimized for clinic app
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],

    // Performance optimization for clinic app testing
    threads: true,
    isolate: true,
    maxConcurrency: 6,
    minThreads: 3,
    maxThreads: 8,
    testTimeout: 15000,
    hookTimeout: 15000,

    // Smart retry for flaky tests
    retry: process.env.CI ? 3 : 2,

    // Memory optimization
    maxWorkers: 8,
    minWorkers: 3,

    // Coverage configuration optimized for clinic app
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'src/test/**',
        'src/test-utils/**',
        '**/*.stories.*',
        '**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        perFile: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
      ],
    },

    // Test matching optimized for clinic app structure
    include: [
      'src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/test/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'cypress/',
      'src/test-setup.ts',
      'src/test/**',
      '**/*.config.*',
      '**/coverage/**',
    ],

    // Snapshot testing optimized for clinic UI
    snapshotFormat: {
      printBasicPrototype: false,
      escapeString: true,
      printFunctionName: true,
    },

    // Mock settings
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Global test files
    // Note: globalSetup removed due to vitest context issues

    // Test isolation

    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_API_URL: 'http://localhost:3001',
    },

  },
  
  // Path aliases optimized for clinic app structure
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/components/ui': path.resolve(__dirname, './src/components/ui'),
      '@/components/clients': path.resolve(__dirname, './src/components/clients'),
      '@/components/appointments': path.resolve(__dirname, './src/components/appointments'),
      '@/components/dashboard': path.resolve(__dirname, './src/components/dashboard'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/lib/utils': path.resolve(__dirname, './src/lib/utils'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/integrations': path.resolve(__dirname, './src/integrations'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/constants': path.resolve(__dirname, './src/constants'),
    },
  },
  
  // Environment variables for tests
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
    'process.env.VITE_SUPABASE_URL': JSON.stringify('http://localhost:54321'),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
    'process.env.VITE_API_URL': JSON.stringify('http://localhost:3001'),
    'process.env.VITE_WEBSOCKET_URL': JSON.stringify('ws://localhost:3001/ws'),
  },

  // Deps optimization for clinic app
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@testing-library/jest-dom',
      '@testing-library/react',
      '@testing-library/user-event',
      '@tanstack/react-query',
      '@tanstack/react-router',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'valibot',
      'recharts',
      'lucide-react',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
    exclude: [],
  },
});