import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}", "tests/**/*.{test,spec}.{js,ts}"],
    exclude: ["node_modules/**", "dist/**"],
    testTimeout: 10000, // 10 seconds for unit tests
    bail: 1,
    reporters: ["verbose"],
    env: {
      NODE_ENV: "test",
    },
    setupFiles: ["./src/tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@neonpro/types": path.resolve(__dirname, "../types/src"),
      "@neonpro/database": path.resolve(__dirname, "./src"),
    },
  },
});
