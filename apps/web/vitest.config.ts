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
    alias: [
      { find: /^@$/, replacement: path.resolve(__dirname, ".") },
      { find: /^@\/lib(.*)?$/, replacement: path.resolve(__dirname, "./lib") + "$1" },
      { find: /^@\/components(.*)?$/, replacement: path.resolve(__dirname, "./components") + "$1" },
      { find: /^@\/hooks(.*)?$/, replacement: path.resolve(__dirname, "./hooks") + "$1" },
      // Monorepo package aliases for tests (use source, not dist) with exact and subpath handling
      {
        find: /^@neonpro\/ui$/,
        replacement: path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      },
      {
        find: /^@neonpro\/shared$/,
        replacement: path.resolve(__dirname, "../../packages/shared/src/index.ts"),
      },
      {
        find: /^@neonpro\/utils$/,
        replacement: path.resolve(__dirname, "../../packages/utils/src/index.ts"),
      },
      {
        find: /^@neonpro\/types$/,
        replacement: path.resolve(__dirname, "../../packages/types/src/index.ts"),
      },
      {
        find: /^@neonpro\/ui\/(.*)$/,
        replacement: path.resolve(__dirname, "../../packages/ui/src") + "/$1",
      },
      {
        find: /^@neonpro\/shared\/(.*)$/,
        replacement: path.resolve(__dirname, "../../packages/shared/src") + "/$1",
      },
      {
        find: /^@neonpro\/utils\/(.*)$/,
        replacement: path.resolve(__dirname, "../../packages/utils/src") + "/$1",
      },
      {
        find: /^@neonpro\/types\/(.*)$/,
        replacement: path.resolve(__dirname, "../../packages/types/src") + "/$1",
      },
      // Explicit hot paths
      {
        find: "@neonpro/shared/api-client",
        replacement: path.resolve(__dirname, "../../packages/shared/src/api-client.ts"),
      },
      {
        find: "@neonpro/utils/validation",
        replacement: path.resolve(__dirname, "../../packages/utils/src/validation.ts"),
      },
    ],
  },
});
