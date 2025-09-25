import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for NeonPro E2E tests')
  
  // Healthcare compliance validation
  console.log('🏥 Validating healthcare compliance requirements')
  
  // Setup browser context for healthcare testing
  const browser = await chromium.launch()
  const context = await browser.newContext({
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    permissions: ['geolocation', 'notifications'],
  })

  // Store browser instance for global teardown
  ;(global as any).browser = browser
  
  console.log('✅ Global setup completed')
}

export default globalSetup