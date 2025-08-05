#!/usr/bin/env node

/**
 * NEONPRO HEALTHCARE - VERCEL DEPLOYMENT READINESS VALIDATION
 *
 * This script validates that the project is ready for Vercel deployment:
 * - Vercel configuration files
 * - Environment variables setup
 * - Health check endpoints
 * - Build configuration
 * - Prisma setup for Vercel
 */

const fs = require("node:fs");
const path = require("node:path");

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Project root
const projectRoot = path.join(__dirname, "..");
const webAppRoot = path.join(projectRoot, "apps", "neonpro-web");

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function logTest(name, status, details = "") {
  const statusText = status === "pass" ? "✅ PASS" : status === "fail" ? "❌ FAIL" : "⚠️  WARN";
  const color = status === "pass" ? colors.green : status === "fail" ? colors.red : colors.yellow;

  console.log(`${color}${statusText}${colors.reset} ${name}`);
  if (details) console.log(`   ${details}`);

  results.tests.push({ name, status, details });
  if (status === "pass") results.passed++;
  else if (status === "fail") results.failed++;
  else results.warnings++;
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_error) {
    return null;
  }
}

// Test 1: Vercel Configuration Files
function testVercelConfiguration() {
  console.log("\n🔍 Testing Vercel Configuration Files...");

  // Root vercel.json
  const rootVercelConfig = path.join(projectRoot, "vercel.json");
  if (fileExists(rootVercelConfig)) {
    const config = readJsonFile(rootVercelConfig);
    if (config && config.framework === "nextjs") {
      logTest("Root vercel.json exists and configured", "pass", "Next.js framework configured");
    } else {
      logTest(
        "Root vercel.json configuration",
        "fail",
        "Missing or invalid Next.js framework config",
      );
    }
  } else {
    logTest("Root vercel.json file", "fail", "File not found");
  }

  // App-specific vercel.json
  const appVercelConfig = path.join(webAppRoot, "vercel.json");
  if (fileExists(appVercelConfig)) {
    logTest("App-specific vercel.json exists", "pass", "Located in apps/neonpro-web/");
  } else {
    logTest(
      "App-specific vercel.json",
      "warn",
      "Optional but recommended for app-specific settings",
    );
  }
}

// Test 2: Package.json Configuration
function testPackageJsonConfiguration() {
  console.log("\n🔍 Testing Package.json Configuration...");

  const packageJsonPath = path.join(webAppRoot, "package.json");
  if (fileExists(packageJsonPath)) {
    const packageJson = readJsonFile(packageJsonPath);

    if (packageJson) {
      // Check build script
      if (packageJson.scripts?.build) {
        const buildScript = packageJson.scripts.build;
        if (buildScript.includes("prisma generate")) {
          logTest("Build script includes Prisma generation", "pass", buildScript);
        } else {
          logTest(
            "Build script Prisma generation",
            "fail",
            'Missing "prisma generate" in build script',
          );
        }
      } else {
        logTest("Build script exists", "fail", "No build script found");
      }

      // Check Prisma dependencies
      const hasPrismaClient = packageJson.dependencies?.["@prisma/client"];
      const hasPrisma = packageJson.dependencies?.prisma;

      if (hasPrismaClient && hasPrisma) {
        logTest("Prisma dependencies", "pass", "Both @prisma/client and prisma found");
      } else {
        logTest("Prisma dependencies", "fail", "Missing Prisma dependencies");
      }

      // Check postinstall script
      if (packageJson.scripts?.postinstall) {
        logTest("Postinstall script exists", "pass", "Will generate Prisma client after install");
      } else {
        logTest("Postinstall script", "warn", 'Consider adding "prisma generate" to postinstall');
      }
    }
  } else {
    logTest("Package.json file", "fail", "File not found in apps/neonpro-web/");
  }
}

// Test 3: Environment Variables Template
function testEnvironmentVariables() {
  console.log("\n🔍 Testing Environment Variables...");

  const envVercelPath = path.join(projectRoot, ".env.vercel");
  if (fileExists(envVercelPath)) {
    const envContent = fs.readFileSync(envVercelPath, "utf8");

    const requiredVars = [
      "DATABASE_URL",
      "DIRECT_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
    ];

    let foundVars = 0;
    requiredVars.forEach((varName) => {
      if (envContent.includes(varName)) {
        foundVars++;
      }
    });

    if (foundVars === requiredVars.length) {
      logTest(
        "Environment variables template",
        "pass",
        `All ${requiredVars.length} required variables documented`,
      );
    } else {
      logTest(
        "Environment variables template",
        "fail",
        `Only ${foundVars}/${requiredVars.length} required variables found`,
      );
    }
  } else {
    logTest("Environment variables template", "fail", ".env.vercel file not found");
  }
}

// Test 4: Prisma Configuration
function testPrismaConfiguration() {
  console.log("\n🔍 Testing Prisma Configuration...");

  const prismaSchemaPath = path.join(projectRoot, "prisma", "schema.prisma");
  if (fileExists(prismaSchemaPath)) {
    const schemaContent = fs.readFileSync(prismaSchemaPath, "utf8");

    // Check for Vercel-compatible binary targets
    if (schemaContent.includes("binaryTargets")) {
      logTest("Prisma binary targets configured", "pass", "Ready for Vercel deployment");
    } else {
      logTest(
        "Prisma binary targets",
        "warn",
        "Consider adding binaryTargets for better Vercel compatibility",
      );
    }

    // Check for healthcare models (using Pascal case model names)
    const healthcareModels = [
      "Profile",
      "Clinic",
      "Patient",
      "Appointment",
      "MedicalRecord",
      "Prescription",
      "AuditLog",
    ];
    let foundTables = 0;

    healthcareModels.forEach((model) => {
      if (schemaContent.includes(`model ${model}`)) {
        foundTables++;
      }
    });

    if (foundTables === healthcareModels.length) {
      logTest(
        "Healthcare schema completeness",
        "pass",
        `All ${healthcareModels.length} healthcare models defined`,
      );
    } else {
      logTest(
        "Healthcare schema completeness",
        "fail",
        `Only ${foundTables}/${healthcareModels.length} healthcare models found`,
      );
    }
  } else {
    logTest("Prisma schema file", "fail", "schema.prisma not found");
  }
}

// Test 5: Health Check Endpoints
function testHealthCheckEndpoints() {
  console.log("\n🔍 Testing Health Check Endpoints...");

  const healthEndpoint = path.join(webAppRoot, "src", "app", "api", "health", "route.ts");
  if (fileExists(healthEndpoint)) {
    const healthContent = fs.readFileSync(healthEndpoint, "utf8");

    if (healthContent.includes("prisma.$queryRaw") && healthContent.includes("SELECT 1")) {
      logTest("Health check endpoint", "pass", "Database connectivity test included");
    } else {
      logTest("Health check endpoint", "warn", "Missing database connectivity test");
    }
  } else {
    logTest("Health check endpoint", "fail", "/api/health/route.ts not found");
  }

  const readyEndpoint = path.join(webAppRoot, "src", "app", "api", "ready", "route.ts");
  if (fileExists(readyEndpoint)) {
    logTest("Readiness check endpoint", "pass", "/api/ready/route.ts exists");
  } else {
    logTest(
      "Readiness check endpoint",
      "warn",
      "/api/ready/route.ts not found - optional but recommended",
    );
  }
}

// Test 6: API Routes Structure
function testApiRoutesStructure() {
  console.log("\n🔍 Testing API Routes Structure...");

  const apiDir = path.join(webAppRoot, "src", "app", "api");
  if (fileExists(apiDir)) {
    logTest("API directory exists", "pass", "src/app/api/ found");

    // Check for Prisma API routes
    const prismaApiDir = path.join(apiDir, "prisma");
    if (fileExists(prismaApiDir)) {
      logTest("Prisma API routes directory", "pass", "api/prisma/ found");

      // Check for patients endpoint
      const patientsEndpoint = path.join(prismaApiDir, "patients", "route.ts");
      if (fileExists(patientsEndpoint)) {
        logTest("Patients API endpoint", "pass", "api/prisma/patients/route.ts found");
      } else {
        logTest("Patients API endpoint", "fail", "api/prisma/patients/route.ts not found");
      }
    } else {
      logTest("Prisma API routes directory", "fail", "api/prisma/ not found");
    }
  } else {
    logTest("API directory", "fail", "src/app/api/ not found");
  }
}

// Test 7: Documentation
function testDocumentation() {
  console.log("\n🔍 Testing Documentation...");

  const vercelGuide = path.join(projectRoot, "VERCEL_DEPLOYMENT_GUIDE.md");
  if (fileExists(vercelGuide)) {
    logTest("Vercel deployment guide", "pass", "VERCEL_DEPLOYMENT_GUIDE.md exists");
  } else {
    logTest("Vercel deployment guide", "warn", "VERCEL_DEPLOYMENT_GUIDE.md not found");
  }

  const validationReport = path.join(projectRoot, "VALIDATION_REPORT.md");
  if (fileExists(validationReport)) {
    logTest("Implementation validation report", "pass", "VALIDATION_REPORT.md exists");
  } else {
    logTest("Implementation validation report", "warn", "VALIDATION_REPORT.md not found");
  }
}

// Main validation function
async function runValidation() {
  console.log(
    `${colors.bold}${colors.blue}🚀 NEONPRO HEALTHCARE - VERCEL DEPLOYMENT READINESS VALIDATION${colors.reset}`,
  );
  console.log("================================================================================");
  console.log(`📅 Started at: ${new Date().toISOString()}`);

  try {
    testVercelConfiguration();
    testPackageJsonConfiguration();
    testEnvironmentVariables();
    testPrismaConfiguration();
    testHealthCheckEndpoints();
    testApiRoutesStructure();
    testDocumentation();
  } catch (error) {
    console.error("❌ Validation failed with error:", error);
  }

  // Final results
  console.log("\n📊 VALIDATION SUMMARY");
  console.log("===================");
  console.log(`${colors.green}✅ Tests Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Tests Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);

  const totalTests = results.passed + results.failed + results.warnings;
  const successRate = ((results.passed / totalTests) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);

  console.log("\n🎯 DEPLOYMENT READINESS ASSESSMENT");
  console.log("================================");

  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 READY FOR VERCEL DEPLOYMENT!${colors.reset}`);
    console.log("✅ All critical tests passed");
    console.log("✅ Your NeonPro Healthcare app is ready to deploy to Vercel");

    if (results.warnings > 0) {
      console.log(
        `\n${colors.yellow}⚠️  Note: ${results.warnings} warnings found - these are optional improvements${colors.reset}`,
      );
    }

    console.log("\n🚀 NEXT STEPS:");
    console.log("1. Run: vercel");
    console.log("2. Configure environment variables in Vercel dashboard");
    console.log("3. Deploy: vercel --prod");
    console.log("4. Test: curl https://your-app.vercel.app/api/health");
  } else {
    console.log(`${colors.red}${colors.bold}❌ NOT READY FOR DEPLOYMENT${colors.reset}`);
    console.log(`❌ ${results.failed} critical issues found`);
    console.log("\n🔧 REQUIRED FIXES:");

    results.tests.forEach((test) => {
      if (test.status === "fail") {
        console.log(`   ❌ ${test.name}: ${test.details}`);
      }
    });

    console.log("\n📚 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions");
  }

  console.log(`\n📅 Completed at: ${new Date().toISOString()}`);

  // Exit with error code if critical tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run validation
if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { runValidation };
