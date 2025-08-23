/// <reference types="vitest" />

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "happy-dom",
		include: [
			"src/**/*.{test,spec}.{ts,tsx}",
			"tests/**/*.{test,spec}.{ts,tsx}",
			"__tests__/**/*.{test,spec}.{ts,tsx}",
		],
		exclude: ["node_modules/**", "dist/**", "coverage/**"],
		testTimeout: 25_000, // Extended for DevOps operations
		hookTimeout: 25_000,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.test.ts",
				"**/*.spec.ts",
				"coverage/",
				"vitest.config.ts",
			],
		},
	},
});
