/**
 * Minimal Playwright Configuration for Testing
 * ===========================================
 *
 * Simplified config without webServer for basic E2E validation
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tools/e2e",
	testMatch: ["**/test-basic.spec.ts"],

	// Optimized settings
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : 2,

	// Timeouts
	timeout: 30_000,

	// Reporting
	reporter: "list",

	// Output - CONSOLIDATED TO TOOLS STRUCTURE
	outputDir: "tools/reports/test-results/e2e-minimal",

	use: {
		// Test against external URL for now
		baseURL: "https://neonpro.vercel.app",

		// Basic settings
		actionTimeout: 15_000,
		navigationTimeout: 30_000,

		// Minimal features
		headless: true,
		screenshot: "only-on-failure",
		video: "retain-on-failure",
		trace: "on-first-retry",
	},

	// Single browser project for testing
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	// No webServer - test against external endpoint
});
