/**
 * 🚀 Global Setup for NeonPro E2E Tests
 *
 * Performance optimizations and healthcare-specific configurations
 */

import { chromium } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const startTime = Date.now();

  // Performance optimization: Pre-warm browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(config.use?.baseURL || 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });

    // Check if app is ready
    await page.waitForSelector('body', { timeout: 10_000 });

    // Pre-cache critical resources
    await page.evaluate(() => {
      // Pre-load critical images and resources
      const criticalImages = ['/logo.png', '/favicon.ico'];

      criticalImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });

    // Set Brazilian healthcare context
    await page.addInitScript(() => {
      window.localStorage.setItem('healthcare-locale', 'pt-BR');
      window.localStorage.setItem('healthcare-timezone', 'America/Sao_Paulo');
      window.localStorage.setItem('test-environment', 'e2e');
    });
  } catch {} finally {
    await context.close();
    await browser.close();
  }

  const setupTime = Date.now() - startTime;

  // Store performance metrics
  process.env.GLOBAL_SETUP_TIME = setupTime.toString();
}

export default globalSetup;
