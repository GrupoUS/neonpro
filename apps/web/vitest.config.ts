import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/test/test-setup.ts', // Contains MSW setup and all mocks
      './src/test/setup/environment.ts', // DOM environment setup
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.vercel/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/test-results/**',
        '**/src/test/**', // Exclude test setup files from coverage
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        // Healthcare UI components compliance (LGPD, ANVISA, CFM, WCAG 2.1 AA)
        'ui-components': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        healthcare: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        security: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'forms-validation': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
      // Healthcare compliance reporting
      reportOnFailure: true,
      include: [
        '**/healthcare/**/*.{js,jsx,ts,tsx}',
        '**/security/**/*.{js,jsx,ts,tsx}',
        '**/ui/**/*.{js,jsx,ts,tsx}',
        '**/forms/**/*.{js,jsx,ts,tsx}',
        '**/validation/**/*.{js,jsx,ts,tsx}',
      ],
    },
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/categories/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.vercel/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '**/test-results/**',
    ],
    reporters: ['verbose', 'json', 'html'],
    outputFile: {
      json: 'test-results/test-results.json',
      html: 'test-results/test-results.html',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
    },
    server: {
      deps: {
        inline: [
          '@trpc/client',
          '@trpc/react-query',
          '@trpc/server',
          '@supabase/supabase-js',
          '@tanstack/react-query',
          '@tanstack/react-router',
        ],
      },
    },
    fakeTimers: {
      enableGlobally: true,
    },
    sequence: {
      shuffle: {
        seed: 123,
      },
    },
    chaiConfig: {
      truncateThreshold: 0,
    },
    snapshotSerializers: [],
    testTimeout: 15000, // Increased for healthcare operations
    hookTimeout: 15000, // Increased for healthcare operations
  },

  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    port: 8080,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'react-hook-form',
      'zod',
      'valibot',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'date-fns',
      'sonner',
      '@radix-ui/react-slot',
      'class-variance-authority',
      '@copilotkit/react-core',
      '@copilotkit/react-ui',
    ],
  },
})
