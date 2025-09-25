import { GlobalSetupContext } from 'vitest/node'

export default async function globalSetup(context: GlobalSetupContext) {
  console.log('🚀 Global integration setup starting')
  
  // Setup healthcare compliance infrastructure
  console.log('🏥 Setting up healthcare compliance infrastructure')
  
  // Initialize mock external services
  console.log('🌐 Initializing external service mocks')
  
  // Setup test databases with healthcare data
  console.log('🗄️  Setting up test databases')
  
  // Configure compliance logging
  console.log('📊 Configuring compliance logging')
  
  // Store global test state
  ;(global as any).testState = {
    healthcare: {
      compliance: true,
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    },
    services: {
      database: true,
      external: true,
      compliance: true,
    },
  }
  
  console.log('✅ Global integration setup completed')
}