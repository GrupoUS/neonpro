/**
 * Global Setup for Integration Tests
 * Handles database setup, external services, and global test environment
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";

// Global setup function
export default async function globalSetup() {
  console.log("🚀 Starting global setup for integration tests...");

  try {
    // Setup test database
    await setupTestDatabase();

    // Setup Supabase test environment
    await setupSupabaseTest();

    // Setup external service mocks
    await setupExternalServices();

    console.log("✅ Global setup completed successfully");
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  }
}

// Setup test database
async function setupTestDatabase() {
  console.log("📊 Setting up test database...");

  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    console.warn("⚠️ TEST_DATABASE_URL not set, skipping database setup");
    return;
  }

  try {
    // Run database migrations for test environment
    execSync("pnpm run db:migrate:test", { stdio: "inherit" });

    // Seed test data if needed
    execSync("pnpm run db:seed:test", { stdio: "inherit" });

    console.log("✅ Test database setup completed");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  }
}

// Setup Supabase test environment
async function setupSupabaseTest() {
  console.log("🔐 Setting up Supabase test environment...");

  const supabaseUrl = process.env.TEST_SUPABASE_URL;
  const supabaseKey = process.env.TEST_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase test credentials not set, using mocks");
    return;
  }

  try {
    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("_health_check")
      .select("*")
      .limit(1);

    if (error && !error.message.includes("relation")) {
      throw error;
    }

    console.log("✅ Supabase test environment ready");
  } catch (error) {
    console.error("❌ Supabase setup failed:", error);
    // Don't throw here, allow tests to run with mocks
    console.log("🔄 Falling back to Supabase mocks");
  }
}

// Setup external service mocks
async function setupExternalServices() {
  console.log("🌐 Setting up external service mocks...");

  // Setup mock servers or service stubs here
  // For example: email service, payment gateway, etc.

  // Mock email service
  process.env.EMAIL_SERVICE_URL = "http://localhost:3001/mock-email";

  // Mock payment service
  process.env.PAYMENT_SERVICE_URL = "http://localhost:3002/mock-payment";

  console.log("✅ External service mocks configured");
}

// Global teardown function
export async function globalTeardown() {
  console.log("🧹 Starting global teardown...");

  try {
    // Cleanup test database
    await cleanupTestDatabase();

    // Cleanup external services
    await cleanupExternalServices();

    console.log("✅ Global teardown completed");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw in teardown to avoid masking test failures
  }
}

// Cleanup test database
async function cleanupTestDatabase() {
  const databaseUrl = process.env.TEST_DATABASE_URL;

  if (!databaseUrl) {
    return;
  }

  try {
    // Clean up test data
    execSync("pnpm run db:clean:test", { stdio: "inherit" });
    console.log("✅ Test database cleaned up");
  } catch (error) {
    console.error("❌ Database cleanup failed:", error);
  }
}

// Cleanup external services
async function cleanupExternalServices() {
  // Cleanup any running mock servers or services
  console.log("✅ External services cleaned up");
}
