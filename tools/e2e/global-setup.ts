/**
 * Global Setup for Playwright E2E Tests
 * =====================================
 *
 * This file runs once before all tests to prepare the test environment
 */

import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
	console.log("🚀 Starting global E2E test setup...");

	// Verify test environment
	const baseURL = config.projects[0].use?.baseURL || "http://localhost:3000";
	console.log(`📍 Testing against: ${baseURL}`);

	// Basic browser warmup
	const browser = await chromium.launch();
	const page = await browser.newPage();

	try {
		// Basic connectivity check
		await page.goto(baseURL, { waitUntil: "networkidle", timeout: 10_000 });
		console.log("✅ Base URL is accessible");
	} catch (error) {
		console.warn("⚠️ Base URL check failed:", error);
	}

	await browser.close();
	console.log("✅ Global setup completed");
}

export default globalSetup;
