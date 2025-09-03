/// <reference types="vitest" />
import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit-only Vitest configuration used by @neonpro/tooling
// Ensures `pnpm -w --filter @neonpro/tooling vitest run` only runs the unit project
export default defineConfig({
  cacheDir: path.resolve(__dirname, "../../.vitest"),
  test: {
    name: { label: "unit", color: "green" },
    globals: true,
    environment: "happy-dom",
    setupFiles: [path.resolve(__dirname, "../../vitest.setup.ts")],
    isolate: true,
    pool: "threads",
    poolOptions: { threads: { singleThread: false, maxThreads: 4 } },
    sequence: { hooks: "list", concurrent: false },
    include: [
      path.resolve(__dirname, "../../tools/tests/**/*.test.{ts,tsx}"),
      path.resolve(__dirname, "../../apps/web/tests/**/*.test.{ts,tsx}"),
      path.resolve(__dirname, "../../apps/api/src/**/*.test.{ts}"),
      path.resolve(__dirname, "../../packages/ui/tests/**/*.test.{ts,tsx}"),
      path.resolve(__dirname, "../../packages/utils/tests/**/*.test.{ts}"),
      path.resolve(__dirname, "../../packages/core-services/tests/**/*.test.{ts}"),
      path.resolve(__dirname, "../../packages/shared/tests/**/*.test.{ts,tsx}"),
      path.resolve(__dirname, "../../packages/security/src/index.test.ts"),
    ],
    exclude: [
      path.resolve(__dirname, "../../apps/web/tests/integration/**"),
      path.resolve(__dirname, "../../packages/*/tests/integration/**"),
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
    ],
    testTimeout: 5_000,
    hookTimeout: 5_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      include: [
        path.resolve(__dirname, "../../apps/web/tests/**"),
        path.resolve(__dirname, "../../packages/ui/**"),
        path.resolve(__dirname, "../../packages/utils/**"),
        path.resolve(__dirname, "../../tools/tests/**"),
      ],
      thresholds: { global: { branches: 80, functions: 85, lines: 85, statements: 85 } },
    },
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../apps/web"),
      "@/lib": path.resolve(__dirname, "../../apps/web/lib"),
      "@/components": path.resolve(__dirname, "../../apps/web/components"),
      "@/hooks": path.resolve(__dirname, "../../apps/web/hooks"),
      "@/middleware": path.resolve(__dirname, "../../apps/api/src/middleware"),
      "@/routes": path.resolve(__dirname, "../../apps/api/src/routes"),
      "@/types": path.resolve(__dirname, "../../apps/api/src/types"),
      "@neonpro/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@neonpro/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@neonpro/types": path.resolve(__dirname, "../../packages/types/src"),
      "@neonpro/shared": path.resolve(__dirname, "../../packages/shared/src"),
      react: path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
    },
  },
});
