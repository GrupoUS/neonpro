import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "**/*.integration.test.{ts,tsx}",
      "**/*.integration.spec.{ts,tsx}",
      "**/*.api.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
    ],
    setupFiles: ["./setup/integration.setup.ts"],
    globalSetup: ["./setup/integration.global-setup.ts"],
    teardown: ["./setup/integration.global-teardown.ts"],
  },
})
