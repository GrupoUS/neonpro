import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/follow-up/index.ts",
    "src/chatbot/index.ts",
    "src/workflow/index.ts",
    "src/ml/index.ts",
    "src/ethics/index.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  external: ["react", "react-dom", "@supabase/supabase-js", "@tensorflow/tfjs"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
});
