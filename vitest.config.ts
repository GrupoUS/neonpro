/// <reference types="vitest" />

import path from 'node:path'
import { defineConfig, defineProject, } from 'vitest/config'

export default defineConfig({
  cacheDir: path.resolve(__dirname, '.vitest',),
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts',],
          isolate: true,
          pool: 'threads',
          poolOptions: { threads: { singleThread: false, maxThreads: 4, }, },
          sequence: { hooks: 'list', concurrent: false, },
          include: [
            'tools/tests/**/*.test.{ts,tsx}',
            'apps/web/tests/components/**/*.test.{ts,tsx}',
            'apps/web/tests/hooks/**/*.test.{ts,tsx}',
            'apps/api/src/**/*.test.{ts}',
            'packages/utils/tests/**/*.test.{ts}',
            'packages/core-services/tests/**/*.test.{ts}',
            'packages/shared/tests/**/*.test.{ts,tsx}',
            'packages/security/src/index.test.ts',
          ],
          exclude: [
            'apps/web/tests/integration/**',
            'packages/*/tests/integration/**',
            'apps/web/tests/performance/**',
            '**/*.performance.test.{ts,tsx}',
            'apps/web/tests/external-chat-widget.test.ts',
          ],
          testTimeout: 5_000,
          hookTimeout: 5_000,
          coverage: {
            provider: 'v8',
            reportsDirectory: 'coverage/unit',
            reporter: ['text', 'json', 'json-summary', 'clover', 'html',],
            include: [
              'apps/web/app/**/*.{ts,tsx}',
              'apps/web/components/**/*.{ts,tsx}',
              'apps/api/src/**/*.{ts,tsx}',
              'packages/*/src/**/*.{ts,tsx}',
            ],
            exclude: [
              'packages/health-dashboard/**',
              '**/dist/**',
              '**/build/**',
              '**/.next/**',
              '**/.turbo/**',
              '**/lib/**',
              '**/tests/**',
            ],
            thresholds: {
              global: { branches: 80, functions: 85, lines: 85, statements: 85, },
            },
          },
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'happy-dom',
          setupFiles: ['./vitest.setup.ts',],
          pool: 'forks',
          poolOptions: { forks: { singleFork: false, maxForks: 2, }, },
          include: [
            'apps/web/tests/integration/**/*.test.{ts,tsx}',
          ],
          testTimeout: 15_000,
          hookTimeout: 10_000,
          sequence: { concurrent: false, shuffle: false, },
          retry: 1,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'json-summary', 'html',],
            reportsDirectory: 'coverage/integration',
            include: [
              'apps/web/app/**/*.{ts,tsx}',
              'apps/web/lib/**/*.{ts,tsx}',
              'packages/**/*.{ts,tsx}',
            ],
            exclude: [
              'packages/health-dashboard/**',
              '**/dist/**',
              '**/build/**',
              '**/.next/**',
              '**/.turbo/**',
              'packages/*/lib/**',
            ],
            thresholds: {
              global: { branches: 70, functions: 75, lines: 80, statements: 80, },
            },
          },
        },
      },
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'apps/web/tests/external-chat-widget.test.ts',
      '**/tools/e2e/**',
      'apps/web/tests/performance/**',
      '**/*.performance.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/*.e2e.{ts,tsx}',
      '**/playwright/**',
      // Guard against accidental unit tests in Next.js app routes
      // Unit tests should live under tools/tests/** or apps/*/tests/**
      'apps/*/app/**',
      'apps/*/pages/**',
      '**/compliance/**',
      '**/ai/**',
      '**/lgpd/**',
      '**/monitoring/**',
      '**/logs/**',
      '**/temp-*',
      '**/*.cache',
      '**/*cache/**',
      '**/cleanup-reports/**',
    ],
    reporters: ['default',],
    environmentOptions: {
      happyDOM: {
        url: 'http://localhost:3000',
        width: 1920,
        height: 1080,
        settings: {
          disableJavaScriptFileLoading: true,
          disableCSSFileLoading: true,
          disableComputedStyleRendering: true,
          disableIframePageLoading: true,
        },
      },
    },
    css: false,
    server: {
      deps: {
        inline: [
          // Inline test utils and shared code, but never core React to avoid duplicate instances
          '@testing-library/react',
          '@testing-library/jest-dom',
          '@testing-library/user-event',

          '@neonpro/shared',
          '@neonpro/utils',
        ],
        // Explicitly exclude React family from dep optimization to ensure single instance from root
        exclude: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react-dom/client',
          'scheduler',
        ],
      },
    },
  },
  resolve: {
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom', 'react/jsx-runtime',], // keep dedupe for safety
    alias: [
      // Map internal packages to source to avoid Node require path differences and ensure Vite aliasing applies
      {
        find: /^@neonpro\/shared$/,
        replacement: path.resolve(__dirname, 'packages/shared/src/index.ts',),
      },
      {
        find: /^@neonpro\/shared\/(.*)$/,
        replacement: (id: string,) =>
          path.resolve(__dirname, 'packages/shared/src', id.replace(/^@neonpro\/shared\//, '',),),
      },

      // Force single React instance for all packages
      { find: /^react$/, replacement: path.resolve(__dirname, 'node_modules/react',), },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-dom',), },
      {
        find: /^react\/jsx-runtime$/,
        replacement: path.resolve(__dirname, 'node_modules/react/jsx-runtime.js',),
      },

      // Collapse any absolute .pnpm store React paths to root React to guarantee singleton
      {
        find: /node_modules\/\.pnpm\/react@[^/]+\/node_modules\/react(\/.*)?$/,
        replacement: path.resolve(__dirname, 'node_modules/react',),
      },
      {
        find: /node_modules\/\.pnpm\/react-dom@[^/]+\/node_modules\/react-dom(\/.*)?$/,
        replacement: path.resolve(__dirname, 'node_modules/react-dom',),
      },

      // Normalize deep CJS development imports to single ESM entry to prevent duplicate React instances
      { find: /^react\/cjs\/react\.development\.js$/, replacement: 'react', },
      { find: /^react\/cjs\/react\.production\.min\.js$/, replacement: 'react', },
      {
        find: /^react-dom\/cjs\/react-dom-client\.development\.js$/,
        replacement: 'react-dom/client',
      },
      {
        find: /^react-dom\/cjs\/react-dom-client\.production\.min\.js$/,
        replacement: 'react-dom/client',
      },
      { find: /^react-dom\/cjs\/react-dom\.development\.js$/, replacement: 'react-dom', },
      { find: /^react-dom\/cjs\/react-dom\.production\.min\.js$/, replacement: 'react-dom', },
      { find: /^scheduler\/cjs\/scheduler\.development\.js$/, replacement: 'scheduler', },
      { find: /^scheduler\/cjs\/scheduler\.production\.min\.js$/, replacement: 'scheduler', },

      // Specific first: ensure deep alias wins before generic "@/"
      {
        find: /^@\/lib\/utils$/,
        replacement: path.resolve(__dirname, './apps/web/lib/utils.ts',),
      },
      {
        find: /^@\/components\/ui$/,
        replacement: path.resolve(__dirname, './apps/web/components/ui/index.ts',),
      },
      {
        find: /^@\/components\/ui\/(.*)$/,
        replacement: path.resolve(__dirname, './apps/web/components/ui',) + '/$1',
      },
      {
        find: /^@\/components\/(.*)$/,
        replacement: path.resolve(__dirname, './apps/web/components',) + '/$1',
      },
      { find: /^@\/lib/, replacement: path.resolve(__dirname, 'apps/web/lib',), },

      // Generic app alias (kept after specifics)
      { find: /^@\//, replacement: path.resolve(__dirname, 'apps/web',) + '/', },

      // Consolidated UI alias → local barrel
      {
        find: /^@neonpro\/ui$/,
        replacement: path.resolve(__dirname, './apps/web/components/ui/index.ts',),
      },
      {
        find: /^@neonpro\/ui\//,
        replacement: path.resolve(__dirname, './apps/web/components/ui/',),
      },

      // Force single instance for tanstack react-query
      {
        find: /^@tanstack\/react-query$/,
        replacement: path.resolve(__dirname, 'node_modules/@tanstack/react-query',),
      },

      // Specific files
      {
        find: '@/lib/query/query-utils.ts',
        replacement: path.resolve(__dirname, './apps/web/lib/query/query-utils.ts',),
      },
      // React resolutions for isolation
      // Avoid forcing React runtime aliases; let Vitest resolve from root to prevent dispatcher mismatch
      // Keep only react-query alias if needed
    ],
  },
  // Vite-only option; ignore during Vitest config parsing
  optimizeDeps: {
    include: [
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'zod',
    ],
    exclude: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-dom/client',
      'scheduler',
    ],
  },
  ssr: {
    // Bundle these so Vite/Vitest apply alias/dedupe uniformly and avoid Node resolving a separate React copy under .pnpm
    noExternal: [
      /^@neonpro\//,
      /^@tanstack\//,
      /^react($|\/)/,
      /^react-dom($|\/)/,
      /^scheduler($|\/)/,
    ],
    external: [],
  },
},)
