import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/integration/**/*.test.ts"],
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/vitest.*",
      ],
    },
  },
  resolve: {
    alias: {
      "@neonpro/domain": resolve(__dirname, "../domain/src"),
      "@neonpro/database": resolve(__dirname, "./src"),
    },
  },
});
