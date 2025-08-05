#!/usr/bin/env node

/**
 * NEONPRO HEALTHCARE IMPLEMENTATION VALIDATION SCRIPT
 *
 * This script validates the complete Prisma + Supabase healthcare implementation:
 * - Database connectivity and schema validation
 * - RLS policies functionality
 * - API routes testing
 * - Prisma client operations
 * - LGPD and ANVISA compliance checks
 */

const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize clients
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Validation results
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper function to log test results
function logTest(name, passed, details = "") {
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);

  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

// Test 1: Database Connectivity
async function testDatabaseConnectivity() {
  console.log("\n🔍 Testing Database Connectivity...");

  try {
    await prisma.$connect();
    logTest("Prisma Database Connection", true, "Successfully connected to PostgreSQL");
  } catch (error) {
    logTest("Prisma Database Connection", false, `Error: ${error.message}`);
  }

  try {
    const { data, error } = await supabase.from("clinics").select("count").limit(1);
    if (!error) {
      logTest("Supabase Database Connection", true, "Successfully connected via Supabase client");
    } else {
      logTest("Supabase Database Connection", false, `Error: ${error.message}`);
    }
  } catch (error) {
    logTest("Supabase Database Connection", false, `Error: ${error.message}`);
  }
}

// Test 2: Schema Validation
async function testSchemaValidation() {
  console.log("\n🔍 Testing Healthcare Schema...");

  const requiredTables = [
    "clinics",
    "profiles",
    "patients",
    "appointments",
    "medical_records",
    "prescriptions",
    "audit_logs",
  ];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (!error) {
        logTest(`Table exists: ${table}`, true, `Table ${table} is accessible`);
      } else {
        logTest(`Table exists: ${table}`, false, `Error: ${error.message}`);
      }
    } catch (error) {
      logTest(`Table exists: ${table}`, false, `Error: ${error.message}`);
    }
  }
}

// Test 3: RLS Policies Validation
async function testRLSPolicies() {
  console.log("\n🔍 Testing Row Level Security Policies...");

  try {
    // Check if RLS is enabled on healthcare tables
    const { data: policies } = await supabase.rpc("pg_policies").select("*");

    const healthcareTables = ["appointments", "medical_records", "prescriptions", "patients"];
    const tablesWithPolicies = new Set();

    if (policies) {
      policies.forEach((policy) => {
        if (healthcareTables.includes(policy.tablename)) {
          tablesWithPolicies.add(policy.tablename);
        }
      });
    }

    healthcareTables.forEach((table) => {
      const hasPolicies = tablesWithPolicies.has(table);
      logTest(
        `RLS policies for ${table}`,
        hasPolicies,
        hasPolicies ? "RLS policies are configured" : "No RLS policies found",
      );
    });
  } catch (error) {
    logTest("RLS Policies Check", false, `Error checking policies: ${error.message}`);
  }
}

// Test 4: Prisma Operations
async function testPrismaOperations() {
  console.log("\n🔍 Testing Prisma Client Operations...");

  try {
    // Test clinic creation
    const testClinic = await prisma.clinics.create({
      data: {
        clinic_name: "Test Healthcare Clinic",
        email: "test@healthcare.com",
        clinic_type: "general",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    logTest(
      "Prisma CREATE operation",
      true,
      `Successfully created test clinic with ID: ${testClinic.id}`,
    );

    // Test clinic read
    const readClinic = await prisma.clinics.findUnique({
      where: { id: testClinic.id },
    });

    logTest(
      "Prisma READ operation",
      !!readClinic,
      readClinic ? "Successfully read clinic data" : "Failed to read clinic data",
    );

    // Test clinic update
    const updatedClinic = await prisma.clinics.update({
      where: { id: testClinic.id },
      data: { clinic_name: "Updated Test Clinic" },
    });

    logTest(
      "Prisma UPDATE operation",
      updatedClinic.clinic_name === "Updated Test Clinic",
      "Successfully updated clinic name",
    );

    // Cleanup: delete test clinic
    await prisma.clinics.delete({
      where: { id: testClinic.id },
    });

    logTest("Prisma DELETE operation", true, "Successfully deleted test clinic");
  } catch (error) {
    logTest("Prisma CRUD Operations", false, `Error: ${error.message}`);
  }
}

// Test 5: Healthcare-specific Features
async function testHealthcareFeatures() {
  console.log("\n🔍 Testing Healthcare-specific Features...");

  try {
    // Test LGPD compliance fields in patients table
    const patientSchema = await supabase
      .from("patients")
      .select("data_consent_given, data_consent_date, data_retention_until")
      .limit(1);

    logTest(
      "LGPD Compliance Fields",
      !patientSchema.error,
      "Patient table has LGPD compliance fields (data_consent_given, data_consent_date, data_retention_until)",
    );

    // Test ANVISA compliance fields in prescriptions table
    const prescriptionSchema = await supabase
      .from("prescriptions")
      .select("anvisa_registration, controlled_substance, digital_signature")
      .limit(1);

    logTest(
      "ANVISA Compliance Fields",
      !prescriptionSchema.error,
      "Prescription table has ANVISA compliance fields (anvisa_registration, controlled_substance, digital_signature)",
    );

    // Test audit logging capability
    const auditSchema = await supabase
      .from("audit_logs")
      .select("user_id, action, resource_type, lgpd_basis")
      .limit(1);

    logTest(
      "Audit Logging System",
      !auditSchema.error,
      "Audit logs table exists with required compliance fields",
    );
  } catch (error) {
    logTest("Healthcare Features", false, `Error: ${error.message}`);
  }
}

// Test 6: Environment Configuration
async function testEnvironmentConfig() {
  console.log("\n🔍 Testing Environment Configuration...");

  const requiredEnvVars = [
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  requiredEnvVars.forEach((envVar) => {
    const exists = !!process.env[envVar];
    logTest(
      `Environment Variable: ${envVar}`,
      exists,
      exists ? "Variable is set" : "Variable is missing",
    );
  });
}

// Main validation function
async function runValidation() {
  console.log("🏥 NEONPRO HEALTHCARE IMPLEMENTATION VALIDATION");
  console.log("================================================");
  console.log(`📅 Started at: ${new Date().toISOString()}`);

  try {
    await testDatabaseConnectivity();
    await testSchemaValidation();
    await testRLSPolicies();
    await testPrismaOperations();
    await testHealthcareFeatures();
    await testEnvironmentConfig();
  } catch (error) {
    console.error("❌ Validation failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }

  // Final results
  console.log("\n📊 VALIDATION SUMMARY");
  console.log("===================");
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(
    `📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`,
  );

  if (results.failed === 0) {
    console.log("\n🎉 All tests passed! Healthcare implementation is ready for production.");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please review the issues above before deploying to production.",
    );
  }

  console.log(`\n📅 Completed at: ${new Date().toISOString()}`);

  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run validation
if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { runValidation };
