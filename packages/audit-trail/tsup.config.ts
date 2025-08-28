import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    blockchain: "src/blockchain/index.ts",
    compliance: "src/compliance/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false, // Disable DTS generation to resolve project file issues
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node18",
  external: [
    "@neonpro/constitutional-layer",
    "@neonpro/core-services",
    "@neonpro/types",
    "@neonpro/utils",
  ],
});
