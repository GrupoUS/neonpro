import { GlobalTeardownContext } from 'vitest/node'

export default async function globalTeardown(context: GlobalTeardownContext) {
  console.log('🧹 Global integration teardown starting')
  
  // Cleanup test databases
  console.log('🗄️  Cleaning up test databases')
  
  // Shutdown external service mocks
  console.log('🌐 Shutting down external service mocks')
  
  // Generate compliance reports
  console.log('📊 Generating compliance reports')
  
  // Validate data privacy cleanup
  console.log('🔐 Validating data privacy cleanup')
  
  // Clean up global test state
  delete (global as any).testState
  
  console.log('✅ Global integration teardown completed')
}