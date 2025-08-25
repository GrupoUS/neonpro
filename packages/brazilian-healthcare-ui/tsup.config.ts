import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	sourcemap: true,
	minify: false,
	target: "es2022",
	external: ["react", "react-dom"],
	splitting: false,
	treeshake: true,
	jsx: "automatic",
});
