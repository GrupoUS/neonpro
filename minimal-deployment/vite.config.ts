import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: "./public/index.html",
    },
  },
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
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
