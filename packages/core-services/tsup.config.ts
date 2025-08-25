import { defineConfig } from "tsup";

export default defineConfig({
	// Entry points for Enhanced Service Layer only
	entry: {
		// Main entry point for Enhanced Service Layer
		index: "src/base/index.ts",

		// Enhanced Service Layer types
		types: "src/types.ts",

		// Enhanced Patient Service example
		"enhanced-patient": "src/patient/enhanced-service.ts",
	},

	// Output formats
	format: ["cjs", "esm"],

	// Generate TypeScript declarations
	dts: true,

	// Source maps for debugging
	sourcemap: true,

	// Clean dist folder before build
	clean: true,

	// Minify production builds
	minify: false, // Keep readable for development

	// Splitting for better tree-shaking
	splitting: true,

	// External dependencies (not bundled)
	external: ["@neonpro/db", "@neonpro/domain", "@neonpro/utils", "@neonpro/cache", "date-fns", "zod"],

	// Target environment
	target: "node18",

	// Platform
	platform: "node",

	// Output directory
	outDir: "dist",

	// Bundle options
	bundle: true,

	// TypeScript config
	tsconfig: "./tsconfig.build.json",
});
