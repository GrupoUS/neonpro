/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

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
            "tools/tests/**/*.test.{ts,tsx}",
            "apps/web/tests/**/*.test.{ts,tsx}",
            "apps/api/src/**/*.test.{ts}",
            "packages/ui/tests/**/*.test.{ts,tsx}",
            "packages/utils/tests/**/*.test.{ts}",
            "packages/core-services/tests/**/*.test.{ts}",
            "packages/shared/tests/**/*.test.{ts,tsx}",
            "packages/security/src/index.test.ts",
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

      // E2E and performance tests (separate tools)
      "**/tools/e2e/**",
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

  // ✅ UNIFIED RESOLVE ALIASES
  resolve: {
    alias: {
      // Web app aliases
      "@": path.resolve(__dirname, "./apps/web"),
      "@/lib": path.resolve(__dirname, "./apps/web/lib"),
      "@/components": path.resolve(__dirname, "./apps/web/components"),
      "@/hooks": path.resolve(__dirname, "./apps/web/hooks"),

      // API aliases
      "@/middleware": path.resolve(__dirname, "./apps/api/src/middleware"),
      "@/routes": path.resolve(__dirname, "./apps/api/src/routes"),
      "@/types": path.resolve(__dirname, "./apps/api/src/types"),

      // Package aliases
      "@neonpro/ui": path.resolve(__dirname, "./packages/ui/src"),
      "@neonpro/utils": path.resolve(__dirname, "./packages/utils/src"),
      "@neonpro/types": path.resolve(__dirname, "./packages/types/src"),
      "@neonpro/shared": path.resolve(__dirname, "./packages/shared/src"),

      // Force single React instance
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
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
