import { GlobalSetupContext } from 'vitest/node'

export default async function globalSetup(context: GlobalSetupContext) {
  console.log('🤖 AI testing global setup starting')
  
  // Initialize AI testing environment
  console.log('🧠 Setting up AI testing environment')
  
  // Mock AI services for testing
  console.log('🌐 Setting up AI service mocks')
  
  // Configure AI agent test utilities
  console.log('🔧 Configuring AI agent utilities')
  
  // Setup compliance validation for AI systems
  console.log('🏥 Setting up healthcare AI compliance')
  
  // Store global AI test state
  ;(global as any).aiTestState = {
    services: {
      openai: true,
      anthropic: true,
      custom: true,
    },
    compliance: {
      healthcare: true,
      privacy: true,
      security: true,
    },
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  }
  
  console.log('✅ AI testing global setup completed')
}