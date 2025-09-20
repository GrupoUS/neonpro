import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/services/**/*.test.ts",
      "src/services/governance/**/__tests__/**/*.test.ts",
      "src/realtime/**/*.test.ts",
      "src/usage/**/*.test.ts",
      "src/parser/**/*.test.ts",
      "src/**/__tests__/**/*.test.ts",
    ],
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@neonpro/types": path.resolve(__dirname, "../types/src"),
      "@neonpro/utils": path.resolve(__dirname, "../utils/src"),
      "@neonpro/database": path.resolve(__dirname, "../database/src"),
      "@neonpro/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});
