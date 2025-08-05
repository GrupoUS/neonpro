#!/usr/bin/env node

/**
 * Simple Healthcare Implementation Validation
 */

const path = require("node:path");
const fs = require("node:fs");

// Add the project root to module resolution path
const projectRoot = path.join(__dirname, "..");
process.chdir(projectRoot);

// Load environment variables
require("dotenv").config({ path: path.join(projectRoot, ".env") });

console.log("🏥 NEONPRO HEALTHCARE VALIDATION (Simple)");
console.log("==========================================");

// Test 1: Environment Variables
console.log("\n🔍 Checking Environment Variables...");
const requiredEnvVars = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

let envPassed = 0;
requiredEnvVars.forEach((envVar) => {
  const exists = !!process.env[envVar];
  console.log(`${exists ? "✅" : "❌"} ${envVar}: ${exists ? "SET" : "MISSING"}`);
  if (exists) envPassed++;
});

console.log(`\n📊 Environment: ${envPassed}/${requiredEnvVars.length} variables configured`);

// Test 2: File Structure
console.log("\n🔍 Checking File Structure...");
const requiredFiles = [
  "prisma/schema.prisma",
  "apps/neonpro-web/src/lib/prisma.ts",
  "supabase/migrations/20250105_rls_policies_healthcare.sql",
];

let filesPassed = 0;
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(projectRoot, file));
  console.log(`${exists ? "✅" : "❌"} ${file}: ${exists ? "EXISTS" : "MISSING"}`);
  if (exists) filesPassed++;
});

console.log(`\n📊 Files: ${filesPassed}/${requiredFiles.length} required files found`);

// Test 3: Supabase Connection Test
console.log("\n🔍 Testing Supabase Connection...");

async function testSupabaseConnection() {
  try {
    const { createClient } = require("@supabase/supabase-js");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    // Test basic connection
    const { data, error } = await supabase.from("clinics").select("count").limit(1);

    if (error) {
      console.log(`❌ Supabase Connection: ${error.message}`);
      return false;
    } else {
      console.log("✅ Supabase Connection: SUCCESS");
      return true;
    }
  } catch (error) {
    console.log(`❌ Supabase Connection: ${error.message}`);
    return false;
  }
}

// Test 4: Database Schema Check
async function testDatabaseSchema() {
  console.log("\n🔍 Testing Database Schema...");

  try {
    const { createClient } = require("@supabase/supabase-js");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const healthcareTables = [
      "clinics",
      "patients",
      "appointments",
      "medical_records",
      "prescriptions",
      "audit_logs",
    ];

    let schemaPassed = 0;

    for (const table of healthcareTables) {
      try {
        const { data, error } = await supabase.from(table).select("*").limit(1);

        if (!error) {
          console.log(`✅ Table ${table}: ACCESSIBLE`);
          schemaPassed++;
        } else {
          console.log(`❌ Table ${table}: ${error.message}`);
        }
      } catch (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      }
    }

    console.log(`\n📊 Schema: ${schemaPassed}/${healthcareTables.length} tables accessible`);
    return schemaPassed === healthcareTables.length;
  } catch (error) {
    console.log(`❌ Schema Test Failed: ${error.message}`);
    return false;
  }
}

// Main validation
async function runValidation() {
  let totalTests = 0;
  let passedTests = 0;

  // Environment test
  totalTests++;
  if (envPassed === requiredEnvVars.length) passedTests++;

  // File structure test
  totalTests++;
  if (filesPassed === requiredFiles.length) passedTests++;

  // Supabase connection test
  totalTests++;
  const supabaseOk = await testSupabaseConnection();
  if (supabaseOk) passedTests++;

  // Schema test
  if (supabaseOk) {
    totalTests++;
    const schemaOk = await testDatabaseSchema();
    if (schemaOk) passedTests++;
  }

  // Final results
  console.log("\n📊 FINAL RESULTS");
  console.log("================");
  console.log(`✅ Tests Passed: ${passedTests}`);
  console.log(`❌ Tests Failed: ${totalTests - passedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log("\n🎉 All tests passed! Healthcare implementation is functional.");
  } else {
    console.log("\n⚠️  Some tests failed. Implementation needs attention.");
  }

  return passedTests === totalTests;
}

// Run validation
if (require.main === module) {
  runValidation()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    });
}

module.exports = { runValidation };
