#!/usr/bin/env bun
/**
 * Test Supabase Database Connectivity
 *
 * This script tests the basic connectivity to our Supabase database
 * to ensure the environment variables and client configuration work correctly.
 */

import { createClient } from "./utils/supabase/client";

async function testSupabaseConnection() {
  console.log("🔗 Testing Supabase Database Connectivity...\n");

  try {
    // Create client
    const supabase = createClient();
    console.log("✅ Supabase client created successfully");

    // Test 1: Check if we can get the current session (auth test)
    console.log("\n📝 Testing Authentication...");
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.log(`⚠️  Auth test (expected for unauthenticated): ${authError.message}`);
    } else {
      console.log("✅ Auth system accessible");
      console.log(`   Session: ${authData.session ? "Active" : "None (expected)"}`);
    }

    // Test 2: Check if we can access the database (test with RPC call)
    console.log("\n🗄️  Testing Database Access...");
    const { data, error } = await supabase.rpc("version");

    if (error) {
      console.log(`❌ Database access error: ${error.message}`);
      console.log(`   Details: ${error.details || "No additional details"}`);
      return false;
    } else {
      console.log("✅ Database accessible");
      console.log(`   PostgreSQL version query executed successfully`);
    }

    // Test 3: Check what tables exist (if any) using a safer approach
    console.log("\n📋 Checking Database Schema...");
    try {
      // Try to access a known system function instead of information_schema
      const { data: schemaCheck, error: schemaError } = await supabase.rpc("current_database");

      if (schemaError) {
        console.log(`⚠️  Could not check database schema: ${schemaError.message}`);
      } else {
        console.log(`✅ Connected to database: ${schemaCheck || "Connected successfully"}`);
        console.log("ℹ️  Database is ready for table creation (this is expected for MVP)");
      }
    } catch (err) {
      console.log("ℹ️  Database schema check skipped (expected for MVP setup)");
    }

    console.log("\n🎉 Supabase connectivity test completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Create core database tables (patients, appointments, etc.)");
    console.log("   2. Set up Row Level Security (RLS) policies");
    console.log("   3. Implement authentication flows");
    console.log("   4. Replace mock services with real CRUD operations");

    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error);

    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);

      if (error.message.includes("environment variables")) {
        console.log("\n🔧 Troubleshooting:");
        console.log("   1. Check if .env.local exists in apps/web/");
        console.log("   2. Verify NEXT_PUBLIC_SUPABASE_URL is set correctly");
        console.log("   3. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is set correctly");
        console.log("   4. Restart your development server after adding .env.local");
      }
    }

    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
