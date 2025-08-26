/**
 * 🧹 Global Teardown for NeonPro E2E Tests
 *
 * Cleanup and performance metrics collection
 */

import type { FullConfig } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

async function globalTeardown(config: FullConfig) {
  const startTime = Date.now();

  try {
    // Collect performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      globalSetupTime: Number.parseInt(
        process.env.GLOBAL_SETUP_TIME || "0",
        10,
      ),
      totalTestDuration: Date.now() - startTime,
      environment: process.env.NODE_ENV || "test",
      workers: config.workers,
      projects: config.projects?.length || 0,
      baseURL: config.use?.baseURL,
    };

    // Save performance metrics
    const metricsPath = join(
      process.cwd(),
      "tools",
      "testing",
      "e2e",
      "reports",
      "performance-summary.json",
    );
    writeFileSync(metricsPath, JSON.stringify(metrics, undefined, 2));
  } catch {}

  const _teardownTime = Date.now() - startTime;
}

export default globalTeardown;
