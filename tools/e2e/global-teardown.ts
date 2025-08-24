/**
 * Global Teardown for Playwright E2E Tests
 * ========================================
 *
 * This file runs once after all tests to clean up the test environment
 */

import type { FullConfig } from "@playwright/test";

async function globalTeardown(config: FullConfig) {
	console.log("🧹 Starting global E2E test teardown...");

	// Cleanup any global test artifacts
	// This could include database cleanup, file cleanup, etc.

	console.log("✅ Global teardown completed");
}

export default globalTeardown;
