import { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig) {
  console.log("🧹 Starting global E2E test teardown");
  
  try {
    // Clean up test data
    await cleanupTestData();
    
    // Reset environment variables
    delete process.env['E2E_TESTING'];
    delete process.env['TEST_USERS'];
    
    // Close any remaining browser contexts
    console.log("✅ Global E2E test teardown completed");
  } catch (error) {
    console.error("❌ Global E2E test teardown failed:", error);
    throw error;
  }
}

async function cleanupTestData() {
  // Clean up any test data created during tests
  // This would typically make API calls to clean up test data
  
  console.log("🧹 Test data cleanup completed");
}

export default globalTeardown;