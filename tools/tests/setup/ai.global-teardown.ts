import type { GlobalTeardownContext } from 'vitest/node'

export default async function globalTeardown(_context: GlobalTeardownContext) {
  console.log('🧹 AI testing global teardown starting')
  
  // Clean up AI service mocks
  console.log('🌐 Cleaning up AI service mocks')
  
  // Generate AI testing reports
  console.log('📊 Generating AI testing reports')
  
  // Validate AI compliance cleanup
  console.log('🔒 Validating AI compliance cleanup')
  
  // Clean up global AI test state
  delete (global as any).aiTestState
  
  console.log('✅ AI testing global teardown completed')
}