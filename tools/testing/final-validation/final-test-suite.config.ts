/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * NeonPro Healthcare Platform - Final Validation Test Suite
 *
 * Comprehensive testing configuration for Phase 6: Testing & Validation
 * Ensures 100% production readiness certification
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setup/final-test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "apps/api/src/**/*.{ts,tsx}",
        "apps/web/app/**/*.{ts,tsx}",
        "apps/web/components/**/*.{ts,tsx}",
        "apps/web/lib/**/*.{ts,tsx}",
        "packages/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.*",
        "**/__tests__/**",
      ],
      thresholds: {
        global: {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    teardownTimeout: 30_000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../.."),
      "@api": path.resolve(__dirname, "../../../apps/api/src"),
      "@web": path.resolve(__dirname, "../../../apps/web"),
      "@shared": path.resolve(__dirname, "../../../packages/shared/src"),
      "@core": path.resolve(__dirname, "../../../packages/core-services/src"),
      "@ui": path.resolve(__dirname, "../../../components"),
    },
  },
});
