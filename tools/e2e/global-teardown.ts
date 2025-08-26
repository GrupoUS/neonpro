/**
 * Global Teardown for Playwright E2E Tests
 * ========================================
 *
 * This file runs once after all tests to clean up the test environment
 */

import type { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {}

export default globalTeardown;
