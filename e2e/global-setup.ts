/**
 * Playwright Global Setup
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 * 
 * Global setup for E2E tests
 * Prepares test environment and authentication
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for NEONPRO E2E tests...');

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    
    // Try to connect to the server with retries
    let retries = 30;
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        console.log('✅ Development server is ready');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to connect to development server at ${baseURL}`);
        }
        console.log(`⏳ Retrying connection... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Perform any authentication setup if needed
    // For now, we'll just verify the main page loads
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
