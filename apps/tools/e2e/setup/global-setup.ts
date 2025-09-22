import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');
  
  const { baseURL } = config.projects[0].use;
  if (!baseURL) {
    throw new Error('BASE_URL environment variable is required');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check if the application is healthy
    const isHealthy = await page.evaluate(() => {
      return document.readyState === 'complete' && 
             !document.querySelector('.error-boundary');
    });

    if (!isHealthy) {
      throw new Error('Application is not healthy');
    }

    console.log('✅ Application is ready for E2E testing');
    
    // Set up test data (in a real app, this would connect to a test database)
    await page.evaluate(() => {
      // Clear any existing test data
      localStorage.clear();
      sessionStorage.clear();
      
      // Set up test environment
      window.localStorage.setItem('test-environment', 'e2e');
      window.localStorage.setItem('test-mode', 'true');
    });

  } catch (error) {
    console.error('❌ E2E setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ E2E test setup completed');
}

export default globalSetup;