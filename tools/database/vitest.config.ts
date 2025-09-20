/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [
      path.resolve(__dirname, "../../.config/testing/vitest.setup.ts"),
      path.resolve(__dirname, "./src/setup.ts"),
    ],
    include: ["src/**/*.{test,spec}.{ts,js}", "src/**/__tests__/**/*.{ts,js}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/setup.ts", "**/*.d.ts", "**/*.config.*"],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    testTimeout: 30000, // Longer timeout for database operations
  },
  resolve: {
    alias: {
      "@neonpro/database": path.resolve(
        __dirname,
        "../../packages/database/src",
      ),
      "@neonpro/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@neonpro/tools-shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});
