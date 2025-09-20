/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    include: [
      // App tests
      "../../apps/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "../../apps/**/__tests__/**/*.{ts,tsx,js,jsx}",
      // Package tests
      "../../packages/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "../../packages/**/__tests__/**/*.{ts,tsx,js,jsx}",
      // Tool tests (category-based)
      "../../tools/frontend/src/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "../../tools/backend/src/**/*.{test,spec}.{ts,js}",
      "../../tools/database/src/**/*.{test,spec}.{ts,js}",
      "../../tools/quality/src/**/*.{test,spec}.{ts,js}",
      "../../tools/shared/src/**/*.{test,spec}.{ts,js}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/*.d.ts",
      // E2E tests handled by Playwright
      "**/e2e/**",
      "**/*.e2e.*",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../apps/web/src"),
      "@/components": path.resolve(__dirname, "../../apps/web/src/components"),
      "@/lib": path.resolve(__dirname, "../../apps/web/src/lib"),
      "@/hooks": path.resolve(__dirname, "../../apps/web/src/hooks"),
      "@neonpro/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@neonpro/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@neonpro/database": path.resolve(
        __dirname,
        "../../packages/database/src",
      ),
      "@neonpro/tools-shared": path.resolve(
        __dirname,
        "../../tools/shared/src",
      ),
      "@neonpro/tools-frontend-tests": path.resolve(
        __dirname,
        "../../tools/frontend/src",
      ),
      "@neonpro/tools-backend-tests": path.resolve(
        __dirname,
        "../../tools/backend/src",
      ),
      "@neonpro/tools-database-tests": path.resolve(
        __dirname,
        "../../tools/database/src",
      ),
      "@neonpro/tools-quality-tests": path.resolve(
        __dirname,
        "../../tools/quality/src",
      ),
    },
  },
});
