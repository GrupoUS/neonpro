import { resolve } from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    isolate: false,
    pool: "threads",
    include: [
      "**/*.ai.test.{ts,tsx}",
      "**/*.agent.test.{ts,tsx}",
      "**/categories/ai/**/*.test.{ts,tsx}",
      "fixtures/ai-setup.ts",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/backend/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/test-results/**",
        "**/coverage/**",
        "**/*.config.*",
        "**/*.setup.*",
        "**/fixtures/**",
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
    setupFiles: ["./fixtures/ai-setup.ts"],
    testTimeout: 15000,
    hookTimeout: 15000,
    globalSetup: ["./setup/ai.global-setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "../.."),
      "@tests": resolve(__dirname, "."),
      "@agents": resolve(__dirname, "../../.claude/agents"),
    },
  },
  define: {
    global: "globalThis",
  },
})
