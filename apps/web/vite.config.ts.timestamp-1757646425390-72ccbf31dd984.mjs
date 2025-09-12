// vite.config.ts
import { tanstackRouter } from "file:///C:/Users/Admin/neonpro/node_modules/.pnpm/@tanstack+router-plugin@1.131.41_@tanstack+react-router@1.131.41_vite@5.4.20/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import react from "file:///C:/Users/Admin/neonpro/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.20/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { defineConfig } from "file:///C:/Users/Admin/neonpro/node_modules/.pnpm/vite@5.4.20_@types+node@22.18.1_terser@5.44.0/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\neonpro\\apps\\web";
var vite_config_default = defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "single",
      autoCodeSplitting: true
    }),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@neonpro/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@neonpro/shared": path.resolve(__vite_injected_original_dirname, "../../packages/shared/src"),
      "@neonpro/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src"),
      "@neonpro/types": path.resolve(__vite_injected_original_dirname, "../../packages/types/src")
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  define: {
    // Vite requires these to be defined for Supabase
    global: "globalThis"
  },
  server: {
    host: "::",
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3004",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"]
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "@supabase/supabase-js"
    ]
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxuZW9ucHJvXFxcXGFwcHNcXFxcd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxuZW9ucHJvXFxcXGFwcHNcXFxcd2ViXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbi9uZW9ucHJvL2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdGFuc3RhY2tSb3V0ZXIgfSBmcm9tICdAdGFuc3RhY2svcm91dGVyLXBsdWdpbi92aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHRhbnN0YWNrUm91dGVyKHtcbiAgICAgIHRhcmdldDogJ3JlYWN0JyxcbiAgICAgIHJvdXRlc0RpcmVjdG9yeTogJy4vc3JjL3JvdXRlcycsXG4gICAgICBnZW5lcmF0ZWRSb3V0ZVRyZWU6ICcuL3NyYy9yb3V0ZVRyZWUuZ2VuLnRzJyxcbiAgICAgIHJvdXRlRmlsZUlnbm9yZVByZWZpeDogJy0nLFxuICAgICAgcXVvdGVTdHlsZTogJ3NpbmdsZScsXG4gICAgICBhdXRvQ29kZVNwbGl0dGluZzogdHJ1ZSxcbiAgICB9KSxcbiAgICByZWFjdCgpLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAnQG5lb25wcm8vdWknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvdWkvc3JjJyksXG4gICAgICAnQG5lb25wcm8vc2hhcmVkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMnKSxcbiAgICAgICdAbmVvbnByby91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91dGlscy9zcmMnKSxcbiAgICAgICdAbmVvbnByby90eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy90eXBlcy9zcmMnKSxcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IFsnLnRzJywgJy50c3gnLCAnLmpzJywgJy5qc3gnLCAnLmpzb24nXSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgLy8gVml0ZSByZXF1aXJlcyB0aGVzZSB0byBiZSBkZWZpbmVkIGZvciBTdXBhYmFzZVxuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnOjonLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwNCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgd3M6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcm94eSBlcnJvcicsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgICAgICByb3V0ZXI6IFsnQHRhbnN0YWNrL3JlYWN0LXJvdXRlciddLFxuICAgICAgICAgIHF1ZXJ5OiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxuICAgICAgICAgIHN1cGFiYXNlOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAncmVhY3QnLFxuICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAnQHRhbnN0YWNrL3JlYWN0LXJvdXRlcicsXG4gICAgICAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JyxcbiAgICAgICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnLFxuICAgIF0sXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICBqc3g6ICdh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
