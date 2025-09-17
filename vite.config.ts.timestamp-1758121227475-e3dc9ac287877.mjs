// ../../vite.config.ts
import { defineConfig } from "file:///home/vibecode/neonpro/node_modules/vite/dist/node/index.js";
import react from "file:///home/vibecode/neonpro/node_modules/@vitejs/plugin-react/dist/index.js";
import { tanstackRouter } from "file:///home/vibecode/neonpro/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import path from "path";
var __vite_injected_original_dirname = "/home/vibecode/neonpro";
var vite_config_default = defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: "./apps/web/src/routes",
      generatedRouteTree: "./apps/web/src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "single",
      autoCodeSplitting: true
    }),
    react()
  ],
  root: "./apps/web",
  publicDir: "./public",
  css: {
    postcss: "./postcss.config.js"
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./apps/web/src"),
      "@neonpro/ui": path.resolve(__vite_injected_original_dirname, "./packages/ui/src"),
      "@neonpro/ui/lib/utils": path.resolve(__vite_injected_original_dirname, "./packages/ui/src/utils"),
      "@neonpro/ui/theme": path.resolve(__vite_injected_original_dirname, "./packages/ui/src/theme"),
      "@neonpro/shared": path.resolve(__vite_injected_original_dirname, "./packages/shared/src"),
      "@neonpro/utils": path.resolve(__vite_injected_original_dirname, "./packages/utils/src"),
      "@neonpro/types": path.resolve(__vite_injected_original_dirname, "./packages/types/src")
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  define: {
    global: "globalThis"
  },
  server: {
    host: true,
    port: 8080,
    open: false
  },
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "./dist"),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vdml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS92aWJlY29kZS9uZW9ucHJvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS92aWJlY29kZS9uZW9ucHJvL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ZpYmVjb2RlL25lb25wcm8vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHsgdGFuc3RhY2tSb3V0ZXIgfSBmcm9tICdAdGFuc3RhY2svcm91dGVyLXBsdWdpbi92aXRlJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHRhbnN0YWNrUm91dGVyKHtcclxuICAgICAgdGFyZ2V0OiAncmVhY3QnLFxyXG4gICAgICByb3V0ZXNEaXJlY3Rvcnk6ICcuL2FwcHMvd2ViL3NyYy9yb3V0ZXMnLFxyXG4gICAgICBnZW5lcmF0ZWRSb3V0ZVRyZWU6ICcuL2FwcHMvd2ViL3NyYy9yb3V0ZVRyZWUuZ2VuLnRzJyxcclxuICAgICAgcm91dGVGaWxlSWdub3JlUHJlZml4OiAnLScsXHJcbiAgICAgIHF1b3RlU3R5bGU6ICdzaW5nbGUnLFxyXG4gICAgICBhdXRvQ29kZVNwbGl0dGluZzogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgcmVhY3QoKSxcclxuICBdLFxyXG4gIHJvb3Q6ICcuL2FwcHMvd2ViJyxcclxuICBwdWJsaWNEaXI6ICcuL3B1YmxpYycsXHJcbiAgY3NzOiB7XHJcbiAgICBwb3N0Y3NzOiAnLi9wb3N0Y3NzLmNvbmZpZy5qcycsXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL2FwcHMvd2ViL3NyYycpLFxyXG4gICAgICAnQG5lb25wcm8vdWknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9wYWNrYWdlcy91aS9zcmMnKSxcclxuICAgICAgJ0BuZW9ucHJvL3VpL2xpYi91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3BhY2thZ2VzL3VpL3NyYy91dGlscycpLFxyXG4gICAgICAnQG5lb25wcm8vdWkvdGhlbWUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9wYWNrYWdlcy91aS9zcmMvdGhlbWUnKSxcclxuICAgICAgJ0BuZW9ucHJvL3NoYXJlZCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3BhY2thZ2VzL3NoYXJlZC9zcmMnKSxcclxuICAgICAgJ0BuZW9ucHJvL3V0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vcGFja2FnZXMvdXRpbHMvc3JjJyksXHJcbiAgICAgICdAbmVvbnByby90eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3BhY2thZ2VzL3R5cGVzL3NyYycpLFxyXG4gICAgfSxcclxuICAgIGV4dGVuc2lvbnM6IFsnLnRzJywgJy50c3gnLCAnLmpzJywgJy5qc3gnLCAnLmpzb24nXSxcclxuICB9LFxyXG4gIGRlZmluZToge1xyXG4gICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IHRydWUsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgb3BlbjogZmFsc2UsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9kaXN0JyksXHJcbiAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxyXG4gICAgICAgICAgcm91dGVyOiBbJ0B0YW5zdGFjay9yZWFjdC1yb3V0ZXInXSxcclxuICAgICAgICAgIHF1ZXJ5OiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxyXG4gICAgICAgICAgc3VwYWJhc2U6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgJ3JlYWN0JyxcclxuICAgICAgJ3JlYWN0LWRvbScsXHJcbiAgICAgICdAdGFuc3RhY2svcmVhY3Qtcm91dGVyJyxcclxuICAgICAgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsXHJcbiAgICAgICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnLFxyXG4gICAgXSxcclxuICB9LFxyXG4gIGVzYnVpbGQ6IHtcclxuICAgIGpzeDogJ2F1dG9tYXRpYycsXHJcbiAgICBqc3hJbXBvcnRTb3VyY2U6ICdyZWFjdCcsXHJcbiAgfSxcclxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLG9CQUFvQjtBQUNqUixPQUFPLFdBQVc7QUFDbEIsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxNQUNSLGlCQUFpQjtBQUFBLE1BQ2pCLG9CQUFvQjtBQUFBLE1BQ3BCLHVCQUF1QjtBQUFBLE1BQ3ZCLFlBQVk7QUFBQSxNQUNaLG1CQUFtQjtBQUFBLElBQ3JCLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixXQUFXO0FBQUEsRUFDWCxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDN0MsZUFBZSxLQUFLLFFBQVEsa0NBQVcsbUJBQW1CO0FBQUEsTUFDMUQseUJBQXlCLEtBQUssUUFBUSxrQ0FBVyx5QkFBeUI7QUFBQSxNQUMxRSxxQkFBcUIsS0FBSyxRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLE1BQ3RFLG1CQUFtQixLQUFLLFFBQVEsa0NBQVcsdUJBQXVCO0FBQUEsTUFDbEUsa0JBQWtCLEtBQUssUUFBUSxrQ0FBVyxzQkFBc0I7QUFBQSxNQUNoRSxrQkFBa0IsS0FBSyxRQUFRLGtDQUFXLHNCQUFzQjtBQUFBLElBQ2xFO0FBQUEsSUFDQSxZQUFZLENBQUMsT0FBTyxRQUFRLE9BQU8sUUFBUSxPQUFPO0FBQUEsRUFDcEQ7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUSxLQUFLLFFBQVEsa0NBQVcsUUFBUTtBQUFBLElBQ3hDLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM3QixRQUFRLENBQUMsd0JBQXdCO0FBQUEsVUFDakMsT0FBTyxDQUFDLHVCQUF1QjtBQUFBLFVBQy9CLFVBQVUsQ0FBQyx1QkFBdUI7QUFBQSxRQUNwQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLEtBQUs7QUFBQSxJQUNMLGlCQUFpQjtBQUFBLEVBQ25CO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
