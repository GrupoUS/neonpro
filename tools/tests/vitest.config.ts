import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    setupFiles: [],
    isolate: false,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    include: [
      "./**/*.{test,spec}.{js,ts}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.red-phase.*",
      "**/config-manager-enhanced.test.ts",
    ],
  },
})
