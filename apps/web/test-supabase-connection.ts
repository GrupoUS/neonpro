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

    // Test 2: Check if we can access the database (simple system query)
    console.log("\n🗄️  Testing Database Access...");
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .limit(1);

    if (error) {
      console.log(`❌ Database access error: ${error.message}`);
      console.log(`   Details: ${error.details || "No additional details"}`);
      return false;
    } else {
      console.log("✅ Database accessible");
      console.log(`   Sample query executed successfully`);
    }

    // Test 3: Check what tables exist (if any)
    console.log("\n📋 Checking Available Tables...");
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .limit(10);

    if (tablesError) {
      console.log(`⚠️  Could not list tables: ${tablesError.message}`);
    } else {
      if (tables && tables.length > 0) {
        console.log("✅ Found existing tables:");
        tables.forEach(table => console.log(`   - ${table.table_name}`));
      } else {
        console.log("ℹ️  No custom tables found (fresh database - this is expected for MVP)");
      }
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
