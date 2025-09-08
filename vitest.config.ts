/// <reference types="vitest" />

import path from "node:path";
import { defineConfig, defineProject } from "vitest/config";

export default defineConfig({
  cacheDir: path.resolve(__dirname, ".vitest"),
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    projects: [
      {
        test: {
          name: "unit",
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
            reportsDirectory: "coverage/unit",
            reporter: ["text", "json", "json-summary", "clover", "html"],
            include: [
              "apps/web/app/**/*.{ts,tsx}",
              "apps/web/components/**/*.{ts,tsx}",
              "apps/api/src/**/*.{ts,tsx}",
              "packages/*/src/**/*.{ts,tsx}",
            ],
            exclude: [
              "packages/health-dashboard/**",
              "**/dist/**",
              "**/build/**",
              "**/.next/**",
              "**/.turbo/**",
              "**/lib/**",
              "**/tests/**",
            ],
            thresholds: {
              global: { branches: 80, functions: 85, lines: 85, statements: 85 },
            },
          },
        },
      },
      {
        test: {
          name: "integration",
          environment: "happy-dom",
          setupFiles: ["./vitest.setup.ts"],
          pool: "forks",
          poolOptions: { forks: { singleFork: false, maxForks: 2 } },
          include: [
            "apps/web/tests/integration/**/*.test.{ts,tsx}",
          ],
          testTimeout: 15_000,
          hookTimeout: 10_000,
          sequence: { concurrent: false, shuffle: false },
          retry: 1,
          coverage: {
            provider: "v8",
            reporter: ["text", "json", "json-summary", "html"],
            reportsDirectory: "coverage/integration",
            include: [
              "apps/web/app/**/*.{ts,tsx}",
              "apps/web/lib/**/*.{ts,tsx}",
              "packages/**/*.{ts,tsx}",
            ],
            exclude: [
              "packages/health-dashboard/**",
              "**/dist/**",
              "**/build/**",
              "**/.next/**",
              "**/.turbo/**",
              "packages/*/lib/**",
            ],
            thresholds: {
              global: { branches: 70, functions: 75, lines: 80, statements: 80 },
            },
          },
        },
      },
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "apps/web/tests/external-chat-widget.test.ts",
      "**/tools/e2e/**",
      "apps/web/tests/performance/**",
      "**/*.performance.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/*.e2e.{ts,tsx}",
      "**/playwright/**",
      // Guard against accidental unit tests in Next.js app routes
      // Unit tests should live under tools/tests/** or apps/*/tests/**
      "apps/*/app/**",
      "apps/*/pages/**",
      "**/compliance/**",
      "**/ai/**",
      "**/lgpd/**",
      "**/monitoring/**",
      "**/logs/**",
      "**/temp-*",
      "**/*.cache",
      "**/*cache/**",
      "**/cleanup-reports/**",
    ],
    reporters: ["default"],
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
    css: false,
    server: {
      deps: {
        inline: [
          "@testing-library/react",
          "@testing-library/jest-dom",
          "@testing-library/user-event",
          "@neonpro/shared",
          "@neonpro/utils",
        ],
      },
    },
  },
  resolve: {
    alias: [
      // Specific first: ensure deep alias wins before generic "@/"
      { find: /^@\/lib\/utils$/, replacement: path.resolve(__dirname, "./apps/web/lib/utils.ts") },
      {
        find: /^@\/components\/ui$/,
        replacement: path.resolve(__dirname, "./apps/web/components/ui/index.ts"),
      },
      { find: /^@\/components/, replacement: path.resolve(__dirname, "./apps/web/components") },
      { find: /^@\/lib/, replacement: path.resolve(__dirname, "apps/web/lib") },

      // Generic app alias (kept after specifics)
      { find: /^@\//, replacement: path.resolve(__dirname, "apps/web") + "/" },

      // Consolidated UI alias → local barrel
      {
        find: /^@neonpro\/ui$/,
        replacement: path.resolve(__dirname, "./apps/web/components/ui/index.ts"),
      },
      {
        find: /^@neonpro\/ui\//,
        replacement: path.resolve(__dirname, "./apps/web/components/ui/"),
      },

      // Specific files
      {
        find: "@/lib/query/query-utils.ts",
        replacement: path.resolve(__dirname, "./apps/web/lib/query/query-utils.ts"),
      },

      // React resolutions for isolation
      { find: "react", replacement: path.resolve(__dirname, "./node_modules/react") },
      { find: "react-dom", replacement: path.resolve(__dirname, "./node_modules/react-dom") },
    ],
  },
  // Vite-only option; ignore during Vitest config parsing
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@testing-library/react",
      "@testing-library/jest-dom",
      "@testing-library/user-event",
      "zod",
      "@tanstack/react-query",
    ],
  },
});
