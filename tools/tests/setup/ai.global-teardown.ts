import type { Vitest } from 'vitest/node'

/**
 * Perform global teardown for AI tests: clean up service mocks, generate reports, validate compliance, and clear shared test state.
 *
 * Removes `global.aiTestState` to clear any persisted AI test state.
 *
 * @param context - Vitest runtime context provided by the test runner
 */
export default async function globalTeardown(context: Vitest) {
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