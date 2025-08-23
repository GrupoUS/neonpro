import { defineConfig } from "tsup";

export default defineConfig({
	// Entry points for all services
	entry: {
		// Main entry point
		index: "src/index.ts",

		// Individual service entry points
		scheduling: "src/scheduling/index.ts",
		treatment: "src/treatment/index.ts",
		patient: "src/patient/index.ts",
		inventory: "src/inventory/index.ts",
		billing: "src/billing/index.ts",
		notification: "src/notification/index.ts",

		// Common utilities
		types: "src/types.ts",
		constants: "src/constants.ts",
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
	external: [
		"@neonpro/db",
		"@neonpro/domain",
		"@neonpro/utils",
		"date-fns",
		"zod",
	],

	// Target environment
	target: "node18",

	// Platform
	platform: "neutral",

	// Output directory
	outDir: "dist",

	// Bundle options
	bundle: true,

	// TypeScript config
	tsconfig: "./tsconfig.build.json",
});
