// vitest.config.ts
import path2 from "path";
import { defineConfig as defineConfig2, mergeConfig } from "file:///C:/Users/Admin/neonpro/node_modules/.pnpm/vitest@2.1.9_@types+node@22.18.1_@vitest+ui@3.2.4_jsdom@26.1.0_terser@5.44.0/node_modules/vitest/dist/config.js";

// ../../.config/testing/vitest.config.ts
import path from "node:path";
import { defineConfig } from "file:///C:/Users/Admin/neonpro/node_modules/.pnpm/vitest@3.2.4_@types+node@20.19.13_@vitest+ui@3.2.4/node_modules/vitest/dist/config.js";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\neonpro\\.config\\testing";
var vitest_config_default = defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__vite_injected_original_dirname, "vitest.setup.ts")]
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "../../apps/web/src"),
      "@/components": path.resolve(__vite_injected_original_dirname, "../../apps/web/src/components"),
      "@/lib": path.resolve(__vite_injected_original_dirname, "../../apps/web/src/lib"),
      "@/hooks": path.resolve(__vite_injected_original_dirname, "../../apps/web/src/hooks"),
      "@neonpro/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src"),
      "@neonpro/shared": path.resolve(__vite_injected_original_dirname, "../../packages/shared/src"),
      "@neonpro/database": path.resolve(__vite_injected_original_dirname, "../../packages/database/src")
    }
  }
});

// vitest.config.ts
var __vite_injected_original_dirname2 = "C:\\Users\\Admin\\neonpro\\apps\\web";
var vitest_config_default2 = mergeConfig(vitest_config_default, defineConfig2({
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname2, "./src"),
      "@neonpro/shared": path2.resolve(__vite_injected_original_dirname2, "../../packages/shared/src"),
      "@neonpro/utils": path2.resolve(__vite_injected_original_dirname2, "../../packages/utils/src"),
      "@neonpro/database": path2.resolve(__vite_injected_original_dirname2, "../../packages/database/src")
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
    threads: false,
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "lib/**/*.{test,spec}.{ts,tsx}",
      "tools/tests/**/*.{test,spec}.{ts,tsx}"
    ],
    exclude: [
      "tools/tests/integration/**",
      "tools/tests/e2e/**",
      "tools/tests/performance/**",
      "lib/integration/**",
      "lib/e2e/**",
      "lib/performance/**",
      "lib/benchmarks/**",
      "src/lib/emergency/emergency-cache.test.ts"
      // Temporarily exclude flaky test
    ],
    testTimeout: 3e4,
    hookTimeout: 3e4,
    deps: {
      optimizer: {
        web: {
          include: [
            "@neonpro/shared",
            "@neonpro/utils"
          ]
        }
      }
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts"
      ]
    }
  }
}));
export {
  vitest_config_default2 as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICIuLi8uLi8uY29uZmlnL3Rlc3Rpbmcvdml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFkbWluXFxcXG5lb25wcm9cXFxcYXBwc1xcXFx3ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFkbWluXFxcXG5lb25wcm9cXFxcYXBwc1xcXFx3ZWJcXFxcdml0ZXN0LmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQWRtaW4vbmVvbnByby9hcHBzL3dlYi92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgc2hhcmVkIGZyb20gJy4uLy4uLy5jb25maWcvdGVzdGluZy92aXRlc3QuY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgbWVyZ2VDb25maWcoc2hhcmVkLCBkZWZpbmVDb25maWcoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAnQG5lb25wcm8vc2hhcmVkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMnKSxcbiAgICAgICdAbmVvbnByby91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91dGlscy9zcmMnKSxcbiAgICAgICdAbmVvbnByby9kYXRhYmFzZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9kYXRhYmFzZS9zcmMnKSxcbiAgICB9LFxuICB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBzZXR1cEZpbGVzOiBbJy4vc3JjL3Rlc3Qvc2V0dXAudHMnXSxcbiAgICBwb29sOiAnZm9ya3MnLFxuICAgIHRocmVhZHM6IGZhbHNlLFxuICAgIGluY2x1ZGU6IFtcbiAgICAgICdzcmMvKiovKi57dGVzdCxzcGVjfS57dHMsdHN4fScsXG4gICAgICAnbGliLyoqLyoue3Rlc3Qsc3BlY30ue3RzLHRzeH0nLFxuICAgICAgJ3Rvb2xzL3Rlc3RzLyoqLyoue3Rlc3Qsc3BlY30ue3RzLHRzeH0nLFxuICAgIF0sXG4gICAgZXhjbHVkZTogW1xuICAgICAgJ3Rvb2xzL3Rlc3RzL2ludGVncmF0aW9uLyoqJyxcbiAgICAgICd0b29scy90ZXN0cy9lMmUvKionLFxuICAgICAgJ3Rvb2xzL3Rlc3RzL3BlcmZvcm1hbmNlLyoqJyxcbiAgICAgICdsaWIvaW50ZWdyYXRpb24vKionLFxuICAgICAgJ2xpYi9lMmUvKionLFxuICAgICAgJ2xpYi9wZXJmb3JtYW5jZS8qKicsXG4gICAgICAnbGliL2JlbmNobWFya3MvKionLFxuICAgICAgJ3NyYy9saWIvZW1lcmdlbmN5L2VtZXJnZW5jeS1jYWNoZS50ZXN0LnRzJywgLy8gVGVtcG9yYXJpbHkgZXhjbHVkZSBmbGFreSB0ZXN0XG4gICAgXSxcbiAgICB0ZXN0VGltZW91dDogMzAwMDAsXG4gICAgaG9va1RpbWVvdXQ6IDMwMDAwLFxuICAgIGRlcHM6IHtcbiAgICAgIG9wdGltaXplcjoge1xuICAgICAgICB3ZWI6IHtcbiAgICAgICAgICBpbmNsdWRlOiBbXG4gICAgICAgICAgICAnQG5lb25wcm8vc2hhcmVkJyxcbiAgICAgICAgICAgICdAbmVvbnByby91dGlscycsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2pzb24nLCAnaHRtbCddLFxuICAgICAgZXhjbHVkZTogW1xuICAgICAgICAnbm9kZV9tb2R1bGVzLycsXG4gICAgICAgICdzcmMvdGVzdC8nLFxuICAgICAgICAnKiovKi5kLnRzJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbn0pKTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcbmVvbnByb1xcXFwuY29uZmlnXFxcXHRlc3RpbmdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFkbWluXFxcXG5lb25wcm9cXFxcLmNvbmZpZ1xcXFx0ZXN0aW5nXFxcXHZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluL25lb25wcm8vLmNvbmZpZy90ZXN0aW5nL3ZpdGVzdC5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5cbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgc2V0dXBGaWxlczogW3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICd2aXRlc3Quc2V0dXAudHMnKV0sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vYXBwcy93ZWIvc3JjJyksXG4gICAgICAnQC9jb21wb25lbnRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL2FwcHMvd2ViL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQC9saWInOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vYXBwcy93ZWIvc3JjL2xpYicpLFxuICAgICAgJ0AvaG9va3MnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vYXBwcy93ZWIvc3JjL2hvb2tzJyksXG4gICAgICAnQG5lb25wcm8vdXRpbHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvdXRpbHMvc3JjJyksXG4gICAgICAnQG5lb25wcm8vc2hhcmVkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3NoYXJlZC9zcmMnKSxcbiAgICAgICdAbmVvbnByby9kYXRhYmFzZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9kYXRhYmFzZS9zcmMnKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStSLE9BQU9BLFdBQVU7QUFDaFQsU0FBUyxnQkFBQUMsZUFBYyxtQkFBbUI7OztBQ0MxQyxPQUFPLFVBQVU7QUFDakIsU0FBUyxvQkFBb0I7QUFIN0IsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWSxDQUFDLEtBQUssUUFBUSxrQ0FBVyxpQkFBaUIsQ0FBQztBQUFBLEVBQ3pEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxvQkFBb0I7QUFBQSxNQUNqRCxnQkFBZ0IsS0FBSyxRQUFRLGtDQUFXLCtCQUErQjtBQUFBLE1BQ3ZFLFNBQVMsS0FBSyxRQUFRLGtDQUFXLHdCQUF3QjtBQUFBLE1BQ3pELFdBQVcsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQzdELGtCQUFrQixLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDcEUsbUJBQW1CLEtBQUssUUFBUSxrQ0FBVywyQkFBMkI7QUFBQSxNQUN0RSxxQkFBcUIsS0FBSyxRQUFRLGtDQUFXLDZCQUE2QjtBQUFBLElBQzVFO0FBQUEsRUFDRjtBQUNGLENBQUM7OztBRHRCRCxJQUFNQyxvQ0FBbUM7QUFJekMsSUFBT0MseUJBQVEsWUFBWSx1QkFBUUMsY0FBYTtBQUFBLEVBQzlDLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUtDLE1BQUssUUFBUUMsbUNBQVcsT0FBTztBQUFBLE1BQ3BDLG1CQUFtQkQsTUFBSyxRQUFRQyxtQ0FBVywyQkFBMkI7QUFBQSxNQUN0RSxrQkFBa0JELE1BQUssUUFBUUMsbUNBQVcsMEJBQTBCO0FBQUEsTUFDcEUscUJBQXFCRCxNQUFLLFFBQVFDLG1DQUFXLDZCQUE2QjtBQUFBLElBQzVFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWSxDQUFDLHFCQUFxQjtBQUFBLElBQ2xDLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxNQUNKLFdBQVc7QUFBQSxRQUNULEtBQUs7QUFBQSxVQUNILFNBQVM7QUFBQSxZQUNQO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLFFBQVEsTUFBTTtBQUFBLE1BQ2pDLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiZGVmaW5lQ29uZmlnIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lIiwgInZpdGVzdF9jb25maWdfZGVmYXVsdCIsICJkZWZpbmVDb25maWciLCAicGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSJdCn0K
