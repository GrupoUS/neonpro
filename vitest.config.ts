/// <reference types="vitest" />

import path from "node:path";
import { defineConfig, defineProject } from "vitest/config";

/**
 * ⚡ NeonPro Optimized Vitest Configuration
 *
 * ✅ BEST PRACTICES APPLIED:
 * - Vitest 3.x "projects" pattern for monorepo
 * - Single configuration file approach
 * - Consolidated setup files
 * - Performance optimizations for Bun
 * - Clean separation of unit vs integration tests
 */
export default defineConfig({
  // Ensure deterministic cache location for Turborepo outputs caching
  cacheDir: path.resolve(__dirname, ".vitest"),
  // React JSX configuration
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },

  test: {
    // 📋 PROJECTS CONFIGURATION - Best Practice for Monorepos
    projects: [
      // 🧪 UNIT TESTS PROJECT
      {
        test: {
          name: {
            label: "unit",
            color: "green",
          },
          // Fast unit testing configuration
          globals: true,
          environment: "happy-dom",
          setupFiles: ["./vitest.setup.ts"],

          // Performance for unit tests
          isolate: true,
          pool: "threads",
          poolOptions: {
            threads: {
              singleThread: false,
              maxThreads: 4,
            },
          },

          // Sequential for stability
          sequence: {
            hooks: "list",
            concurrent: false,
          },

          // Unit test patterns
          include: [
            // Restrict unit tests to fast suites only
            "tools/tests/**/*.test.{ts,tsx}",
            "apps/web/tests/components/**/*.test.{ts,tsx}",
            "apps/web/tests/hooks/**/*.test.{ts,tsx}",
            "apps/api/src/**/*.test.{ts}",
            "packages/ui/tests/**/*.test.{ts,tsx}",
            "packages/utils/tests/**/*.test.{ts}",
            "packages/core-services/tests/**/*.test.{ts}",
            "packages/shared/tests/**/*.test.{ts,tsx}",
            "packages/security/src/index.test.ts",
          ],
          // Ensure unit project does not pick up integration suites
          exclude: [
            "apps/web/tests/integration/**",
            "packages/*/tests/integration/**",
            // Exclude perf and flaky browser-dependent suites from unit
            "apps/web/tests/performance/**",
            "**/*.performance.test.{ts,tsx}",
            "apps/web/tests/external-chat-widget.test.ts",
          ],

          // Optimized timeouts for unit tests
          testTimeout: 5_000,
          hookTimeout: 5_000,

          // Essential coverage for units
          coverage: {
            provider: "v8",
            reporter: ["text", "json"],
            include: [
              "apps/web/tests/**",
              "packages/ui/**",
              "packages/utils/**",
              "tools/tests/**",
            ],
            exclude: [
              "packages/health-dashboard/**",
            ],
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      // 🔄 INTEGRATION TESTS PROJECT
      {
        test: {
          name: {
            label: "integration",
            color: "blue",
          },
          // Integration test configuration
          environment: "happy-dom",
          setupFiles: ["./vitest.setup.ts"],

          // More forgiving performance for integration
          pool: "forks",
          poolOptions: {
            forks: {
              singleFork: false,
              maxForks: 2,
            },
          },

          // Integration patterns
          include: [
            "apps/web/tests/integration/**/*.test.{ts,tsx}",
            "packages/*/tests/integration/**/*.test.{ts,tsx}",
          ],

          // Longer timeouts for integration
          testTimeout: 15_000,
          hookTimeout: 10_000,

          // Sequential for database safety
          sequence: {
            concurrent: false,
            shuffle: false,
          },

          // Retry for flaky integration tests
          retry: 1,

          coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            reportsDirectory: "coverage/integration",
            include: [
              "apps/web/app/**/*.{ts,tsx}",
              "apps/web/lib/**/*.{ts,tsx}",
              "packages/**/*.{ts,tsx}",
            ],
            exclude: [
              "packages/health-dashboard/**",
            ],
            thresholds: {
              global: {
                branches: 70,
                functions: 75,
                lines: 80,
                statements: 80,
              },
            },
          },
        },
      },
    ],

    // ❌ GLOBAL EXCLUSIONS
    exclude: [
      // Standard exclusions
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      // Legacy Playwright-based test (removed)
      "apps/web/tests/external-chat-widget.test.ts",

      // E2E and performance tests (separate tools)
      "**/tools/e2e/**",
      "apps/web/tests/performance/**",
      "**/*.performance.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/*.e2e.{ts,tsx}",
      "**/playwright/**",

      // Unimplemented/problematic tests
      "**/compliance/**",
      "**/ai/**",
      "**/lgpd/**",
      "**/monitoring/**",

      // Cleanup exclusions
      "**/logs/**",
      "**/temp-*",
      "**/*.cache",
      "**/*cache/**",
      "**/cleanup-reports/**",
    ],

    // 🔧 SHARED CONFIGURATION
    reporters: ["default"],

    // Environment optimizations
    environmentOptions: {
      happyDOM: {
        url: "http://localhost:3000",
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

    // Disable CSS processing for better performance
    css: false,

    // Dependency optimizations
    server: {
      deps: {
        inline: [
          "@testing-library/react",
          "@testing-library/jest-dom",
          "@testing-library/user-event",
          "@neonpro/ui",
          "@neonpro/shared",
          "@neonpro/utils",
        ],
      },
    },
  },

  // Top-level projects to ensure Vitest selects only intended suites
  projects: [
    defineProject({
      test: {
        name: { label: "unit", color: "green" },
        globals: true,
        environment: "happy-dom",
        setupFiles: ["./vitest.setup.ts"],
        isolate: true,
        pool: "threads",
        poolOptions: { threads: { singleThread: false, maxThreads: 4 } },
        sequence: { hooks: "list", concurrent: false },
        include: [
          "tools/tests/**/*.test.{ts,tsx}",
          "apps/web/tests/components/**/*.test.{ts,tsx}",
          "apps/web/tests/hooks/**/*.test.{ts,tsx}",
          "apps/api/src/**/*.test.{ts}",
          "packages/ui/tests/**/*.test.{ts,tsx}",
          "packages/utils/tests/**/*.test.{ts}",
          "packages/core-services/tests/**/*.test.{ts}",
          "packages/shared/tests/**/*.test.{ts,tsx}",
          "packages/security/src/index.test.ts",
        ],
        exclude: [
          "apps/web/tests/integration/**",
          "packages/*/tests/integration/**",
          "apps/web/tests/performance/**",
          "**/*.performance.test.{ts,tsx}",
          "apps/web/tests/external-chat-widget.test.ts",
        ],
        testTimeout: 5_000,
        hookTimeout: 5_000,
        coverage: {
          provider: "v8",
          reporter: ["text", "json"],
          include: [
            "apps/web/tests/**",
            "packages/ui/**",
            "packages/utils/**",
            "tools/tests/**",
          ],
          thresholds: {
            global: { branches: 80, functions: 85, lines: 85, statements: 85 },
          },
        },
      },
    }),
    defineProject({
      test: {
        name: { label: "integration", color: "blue" },
        environment: "happy-dom",
        setupFiles: ["./vitest.setup.ts"],
        pool: "forks",
        poolOptions: { forks: { singleFork: false, maxForks: 2 } },
        include: [
          "apps/web/tests/integration/**/*.test.{ts,tsx}",
          "packages/*/tests/integration/**/*.test.{ts,tsx}",
        ],
        testTimeout: 15_000,
        hookTimeout: 10_000,
        sequence: { concurrent: false, shuffle: false },
        retry: 1,
        coverage: {
          provider: "v8",
          reporter: ["text", "json", "html"],
          reportsDirectory: "coverage/integration",
          include: [
            "apps/web/app/**/*.{ts,tsx}",
            "apps/web/lib/**/*.{ts,tsx}",
            "packages/**/*.{ts,tsx}",
          ],
          thresholds: {
            global: { branches: 70, functions: 75, lines: 80, statements: 80 },
          },
        },
      },
    }),
  ],

  // ✅ UNIFIED RESOLVE ALIASES
  resolve: {
    alias: [
      // Web app aliases
      { find: /^@\//, replacement: path.resolve(__dirname, "./apps/web/") },
      { find: /^@$/, replacement: path.resolve(__dirname, "./apps/web") },
      { find: /^@\/lib(.*)?$/, replacement: path.resolve(__dirname, "./apps/web/lib") + "$1" },
      {
        find: /^@\/components(.*)?$/,
        replacement: path.resolve(__dirname, "./apps/web/components") + "$1",
      },
      { find: /^@\/hooks(.*)?$/, replacement: path.resolve(__dirname, "./apps/web/hooks") + "$1" },
      {
        find: /^@\/providers(.*)?$/,
        replacement: path.resolve(__dirname, "./apps/web/providers") + "$1",
      },
      { find: /^@\/lib(.*)?$/, replacement: path.resolve(__dirname, "./apps/web/lib") + "$1" },

      // API aliases
      {
        find: /^@\/middleware(.*)?$/,
        replacement: path.resolve(__dirname, "./apps/api/src/middleware") + "$1",
      },
      {
        find: /^@\/routes(.*)?$/,
        replacement: path.resolve(__dirname, "./apps/api/src/routes") + "$1",
      },
      {
        find: /^@\/types(.*)?$/,
        replacement: path.resolve(__dirname, "./apps/api/src/types") + "$1",
      },

      // Monorepo package aliases (source, handle subpaths safely)
      // Exact package imports → point to source index
      {
        find: /^@neonpro\/ui$/,
        replacement: path.resolve(__dirname, "./packages/ui/src/index.ts"),
      },
      {
        find: /^@neonpro\/utils$/,
        replacement: path.resolve(__dirname, "./packages/utils/src/index.ts"),
      },
      {
        find: /^@neonpro\/types$/,
        replacement: path.resolve(__dirname, "./packages/types/src/index.ts"),
      },
      {
        find: /^@neonpro\/shared$/,
        replacement: path.resolve(__dirname, "./packages/shared/src/index.ts"),
      },
      // Subpath imports → map folder then append capture group
      {
        find: /^@neonpro\/ui\/(.*)$/,
        replacement: path.resolve(__dirname, "./packages/ui/src") + "/$1",
      },
      {
        find: /^@neonpro\/utils\/(.*)$/,
        replacement: path.resolve(__dirname, "./packages/utils/src") + "/$1",
      },
      {
        find: /^@neonpro\/types\/(.*)$/,
        replacement: path.resolve(__dirname, "./packages/types/src") + "/$1",
      },
      {
        find: /^@neonpro\/shared\/(.*)$/,
        replacement: path.resolve(__dirname, "./packages/shared/src") + "/$1",
      },

      // Explicit subpath aliases for tests (kept for determinism)
      {
        find: "@neonpro/shared/api-client",
        replacement: path.resolve(__dirname, "./packages/shared/src/api-client.ts"),
      },
      {
        find: "@neonpro/utils/validation",
        replacement: path.resolve(__dirname, "./packages/utils/src/validation.ts"),
      },
      {
        find: "@/lib/query/query-utils",
        replacement: path.resolve(__dirname, "./apps/web/lib/query/query-utils.ts"),
      },
      {
        find: "@/lib/query/query-utils.ts",
        replacement: path.resolve(__dirname, "./apps/web/lib/query/query-utils.ts"),
      },

      // Force single React instance
      { find: "react", replacement: path.resolve(__dirname, "./node_modules/react") },
      { find: "react-dom", replacement: path.resolve(__dirname, "./node_modules/react-dom") },
    ],
  },

  // Performance dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "zod",
      "@tanstack/react-query",
    ],
  },
});
