import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  root: ".",
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    host: true,
    port: 8080,
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "react-hook-form",
      "zod",
      "valibot",
      "clsx",
      "tailwind-merge",
      "lucide-react",
      "date-fns",
      "sonner",
      "@radix-ui/react-slot",
      "class-variance-authority",
    ],
  },
});