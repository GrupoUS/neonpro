/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Web App Vitest Configuration
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["../../vitest.setup.ts"],
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@neonpro/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
