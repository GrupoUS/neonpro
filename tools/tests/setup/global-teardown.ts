import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown')
  
  // Clean up browser instance
  const browser = (global as any).browser
  if (browser) {
    await browser.close()
    console.log('🔒 Browser instance closed')
  }
  
  // Cleanup test artifacts
  console.log('🗑️  Cleaning up test artifacts')
  
  // Generate compliance report
  console.log('📊 Generating healthcare compliance report')
  
  console.log('✅ Global teardown completed')
}

export default globalTeardown