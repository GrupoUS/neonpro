import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  minify: false,
  target: "es2022",
  external: [],
  splitting: false,
  treeshake: true,
  tsconfig: "./tsconfig.json",
});
