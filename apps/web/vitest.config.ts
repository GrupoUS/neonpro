import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test-setup.ts"],
    env: {
      NODE_ENV: "test",
      VITE_SUPABASE_URL:
        process.env.VITE_SUPABASE_URL ||
        "https://ownkoxryswokcdanrdgj.supabase.co",
      VITE_SUPABASE_ANON_KEY:
        process.env.VITE_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MTEwNDQsImV4cCI6MjA0MDE4NzA0NH0.2kD9rN4tOFgJQWbOhYHDxMkVqJ_3-0EfP5gK2vKC0-0",
    },
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules/**",
      "dist/**",
      ".vercel/**",
      "**/*.d.ts",
      "**/*.config.{js,ts}",
    ],
    reporters: ["default", "vitest-reporter"],
    bail: 1,
    timeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/*.stories.{ts,tsx}",
        "src/test-setup.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    transformMode: {
      web: [/\.[jt]sx?$/],
      ssr: [/\.ts$/],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@neonpro/types": path.resolve(__dirname, "../../packages/types/src"),
      "@neonpro/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@neonpro/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@neonpro/database": path.resolve(
        __dirname,
        "../../packages/database/src",
      ),
      "@neonpro/security": path.resolve(
        __dirname,
        "../../packages/security/src",
      ),
      "@neonpro/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
