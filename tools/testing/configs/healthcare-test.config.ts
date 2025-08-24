/**
 * NEONPRO Healthcare Testing Configuration
 * Healthcare-grade testing setup with LGPD compliance validation
 * Quality Standard: ≥9.9/10 Healthcare Override
 */

import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Healthcare Testing Environment
		environment: "jsdom",
		setupFiles: ["./setup/healthcare-setup.ts", "./setup/lgpd-compliance-setup.ts", "./setup/mock-supabase-setup.ts"],

		// Performance Requirements for Healthcare
		testTimeout: 10_000, // 10s max for healthcare operations
		hookTimeout: 5000, // 5s max for setup/teardown

		// Healthcare Coverage Requirements (≥95%)
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov", "json"],
			thresholds: {
				global: {
					branches: 95,
					functions: 95,
					lines: 95,
					statements: 95,
				},
			},
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.test.{ts,tsx}",
				"**/*.spec.{ts,tsx}",
				"**/types.ts",
				"**/test-utils.ts",
			],
		},

		// Healthcare Data Isolation
		pool: "forks", // Ensure complete isolation
		poolOptions: {
			forks: {
				singleFork: false,
				minForks: 1,
				maxForks: 4,
			},
		},

		// Healthcare Test Patterns
		include: [
			"**/__tests__/**/*.{test,spec}.{ts,tsx}",
			"**/tests/**/*.{test,spec}.{ts,tsx}",
			"**/*.{test,spec}.{ts,tsx}",
		],
		exclude: ["node_modules/", "dist/", "build/", ".next/", "coverage/", "**/*.e2e.{test,spec}.{ts,tsx}"],

		// Healthcare Test Globals
		globals: {
			__HEALTHCARE_MODE__: true,
			__LGPD_COMPLIANCE__: true,
			__TEST_TENANT_ID__: "test-tenant-healthcare",
			__SUPABASE_TEST_MODE__: true,
		},

		// Healthcare Test Reporters
		reporter: [
			"verbose",
			"html",
			"json",
			["junit", { outputFile: "test-results/healthcare-junit.xml" }],
			["json", { outputFile: "test-results/healthcare-results.json" }],
		],

		// Healthcare Test Output
		outputFile: {
			html: "test-results/healthcare-coverage.html",
			json: "test-results/healthcare-results.json",
		},
	},

	// Healthcare Resolve Configuration
	resolve: {
		alias: {
			"@": resolve(__dirname, "../../apps/web"),
			"@/lib": resolve(__dirname, "../../apps/web/lib"),
			"@/components": resolve(__dirname, "../../apps/web/components"),
			"@/types": resolve(__dirname, "../../packages/types/src"),
			"@/compliance": resolve(__dirname, "../../packages/compliance/src"),
			"@/utils": resolve(__dirname, "../../packages/utils/src"),
			"@/ui": resolve(__dirname, "../../packages/ui/src"),
			"@test-utils": resolve(__dirname, "./utils"),
		},
	},

	// Healthcare Build Configuration
	define: {
		__HEALTHCARE_TEST__: true,
		__LGPD_COMPLIANCE_TEST__: true,
	},
});
