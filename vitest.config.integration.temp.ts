import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Removendo o plugin React temporariamente para testar
  // plugins: [react()],
  test: {
    // Test configuration
    name: "integration",

    exclude: [
      "node_modules/**",
      "dist/**",
      "**/*.d.ts",
      "**/build/**",
      "**/coverage/**",
      "**/*.config.{js,ts}",
      "**/playwright/**",
      "**/*.e2e.{test,spec}.{js,ts,jsx,tsx}",
    ],

    include: [
      "apps/web/tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "packages/**/tests/integration/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],

    // Environment configuration
    environment: "happy-dom",

    // Setup files
    setupFiles: [
      "./tests/setup/global-mocks.ts",
      "./tests/setup/integration-test-setup.ts",
    ],

    // Timeouts
    testTimeout: 30_000, // 30 seconds for individual tests
    hookTimeout: 10_000, // 10 seconds for setup/teardown

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage/integration",
      include: [
        "apps/web/app/**/*.{ts,tsx}",
        "apps/web/lib/**/*.{ts,tsx}",
        "apps/web/hooks/**/*.{ts,tsx}",
        "packages/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/coverage/**",
        "**/build/**",
      ],
    },

    // Global configuration
    globals: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Reporters
    reporter: ["default", "json", "html"],

    // Pool configuration for better performance
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 4,
      },
    },

    // Retry configuration
    retry: 2,

    // Sequence configuration
    sequence: {
      concurrent: false,
      shuffle: false,
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/web"),
      "@/components": path.resolve(__dirname, "./apps/web/components"),
    },
  },
});
