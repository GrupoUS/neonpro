import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [
      '../web/src/test/test-setup.ts', // Shared setup with web
      './src/test-setup.ts', // API-specific if needed
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
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        // Healthcare API endpoints compliance (LGPD, ANVISA, CFM)
        'api-endpoints': {
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
        'data-validation': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
      // Healthcare compliance reporting
      reportOnFailure: true,
      include: [
        '**/api/**/*.{js,ts}',
        '**/healthcare/**/*.{js,ts}',
        '**/security/**/*.{js,ts}',
        '**/validation/**/*.{js,ts}',
        '**/middleware/**/*.{js,ts}',
      ],
    },
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'test/**/*.{test,spec}.{js,ts}',
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
    reporters: ['verbose', 'json'],
    outputFile: {
      json: 'test-results/api-test-results.json',
      html: 'test-results/api-test-results.html',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    fakeTimers: {
      enableGlobally: true,
    },
    testTimeout: 15000,
    hookTimeout: 15000,
  },
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
