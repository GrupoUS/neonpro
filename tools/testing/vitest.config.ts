/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./healthcare-setup.ts"],
		include: ["**/*.{test,spec}.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/e2e/**",
			"**/playwright/**",
		],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: [
				"**/node_modules/**",
				"**/dist/**",
				"**/*.config.*",
				"**/*.setup.*",
				"**/mocks/**",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../../apps/web"),
			"@/app": path.resolve(__dirname, "../../apps/web/app"),
			"@/lib": path.resolve(__dirname, "../../apps/web/app/lib"),
			"@/components": path.resolve(__dirname, "../../apps/web/app/components"),
			"@/contexts": path.resolve(__dirname, "../../apps/web/contexts"),
			"@/types": path.resolve(__dirname, "../../apps/web/app/lib/types"),
			"@/utils": path.resolve(__dirname, "../../packages/utils/src"),
		},
	},
});
