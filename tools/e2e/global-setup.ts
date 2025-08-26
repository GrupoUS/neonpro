/**
 * Global Setup for Playwright E2E Tests
 * =====================================
 *
 * This file runs once before all tests to prepare the test environment
 */

import { chromium } from "@playwright/test";
import type { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  // Verify test environment
  const baseURL = config.projects[0].use?.baseURL || "http://localhost:3000";

  // Basic browser warmup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Basic connectivity check
    await page.goto(baseURL, { waitUntil: "networkidle", timeout: 10_000 });
  } catch {}

  await browser.close();
}

export default globalSetup;
