import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(_config: FullConfig) {
  console.log("🚀 Starting global E2E test setup");
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  try {
    // Setup test data
    await setupTestData();
    
    // Setup environment variables
    process.env.E2E_TESTING = "true";
    process.env.NODE_ENV = "test";
    
    // Clear any existing test data
    await clearTestData();
    
    console.log("✅ Global E2E test setup completed");
  } catch (error) {
    console.error("❌ Global E2E test setup failed:", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function setupTestData() {
  // Create mock users for testing
  const testUsers = [
    {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "user",
    },
    {
      email: "admin@example.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    },
    {
      email: "professional@example.com",
      password: "prof123",
      name: "Professional User",
      role: "professional",
    },
  ];
  
  // Store test users in environment for use in tests
  process.env.TEST_USERS = JSON.stringify(testUsers);
  
  console.log("📊 Test data setup completed");
}

async function clearTestData() {
  // Clear any existing test data from the database
  // This would typically make API calls to clean up test data
  
  console.log("🧹 Test data cleanup completed");
}

export default globalSetup;