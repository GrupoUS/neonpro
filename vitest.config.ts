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
            exclude: [
              "packages/health-dashboard/**",
              "**/dist/**",
              "**/.next/**",
              "**/.turbo/**",
            ],
            thresholds: {
              global: { branches: 80, functions: 85, lines: 85, statements: 85 },
            },
          },
        },
      },
      {
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
            exclude: [
              "packages/health-dashboard/**",
              "**/dist/**",
              "**/build/**",
              "**/.next/**",
              "**/.turbo/**",
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
          "@neonpro/ui",
          "@neonpro/shared",
          "@neonpro/utils",
        ],
      },
    },
  },
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
          exclude: [
            "packages/health-dashboard/**",
            "**/dist/**",
            "**/build/**",
            "**/.next/**",
            "**/.turbo/**",
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
          exclude: [
            "packages/health-dashboard/**",
            "**/dist/**",
            "**/build/**",
            "**/.next/**",
            "**/.turbo/**",
          ],
          thresholds: {
            global: { branches: 70, functions: 75, lines: 80, statements: 80 },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: [
      { find: /^@\//, replacement: path.resolve(__dirname, "./apps/web/") },
      { find: /^@$/, replacement: path.resolve(__dirname, "./apps/web") },
      { find: /^@\/lib(.*)?$/, replacement: path.resolve(__dirname, "./apps/web/lib") + "$1" },
      {
        find: /^@\/components(.*)?$/,
        replacement: path.resolve(__dirname, "./apps/web/components") + "$1",
      },
      {
        find: /^@neonpro\/ui$/,
        replacement: path.resolve(__dirname, "./packages/ui/src/index.ts"),
      },
      {
        find: "@/lib/query/query-utils.ts",
        replacement: path.resolve(__dirname, "./apps/web/lib/query/query-utils.ts"),
      },
      { find: "react", replacement: path.resolve(__dirname, "./node_modules/react") },
      { find: "react-dom", replacement: path.resolve(__dirname, "./node_modules/react-dom") },
    ],
  },
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
