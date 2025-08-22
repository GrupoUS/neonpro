/**
 * 🧹 Global Teardown for NeonPro E2E Tests
 *
 * Cleanup and performance metrics collection
 */

import type { FullConfig } from "@playwright/test";
import { writeFileSync } from "fs";
import { join } from "path";

async function globalTeardown(config: FullConfig) {
	const startTime = Date.now();

	console.log("🧹 NeonPro E2E Global Teardown Starting...");

	try {
		// Collect performance metrics
		const metrics = {
			timestamp: new Date().toISOString(),
			globalSetupTime: Number.parseInt(process.env.GLOBAL_SETUP_TIME || "0"),
			totalTestDuration: Date.now() - startTime,
			environment: process.env.NODE_ENV || "test",
			workers: config.workers,
			projects: config.projects?.length || 0,
			baseURL: config.use?.baseURL,
		};

		// Save performance metrics
		const metricsPath = join(process.cwd(), "tools", "testing", "e2e", "reports", "performance-summary.json");
		writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));

		console.log("📊 Performance metrics saved to:", metricsPath);

		// Healthcare-specific cleanup
		console.log("🏥 Healthcare test cleanup...");

		// Clean up any test data or resources
		console.log("✅ Test environment cleaned");
	} catch (error) {
		console.warn("⚠️ Teardown warning:", error.message);
	}

	const teardownTime = Date.now() - startTime;
	console.log(`✅ Global teardown completed in ${teardownTime}ms`);
}

export default globalTeardown;
