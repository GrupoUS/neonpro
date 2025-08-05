#!/usr/bin/env node

/**
 * NeonPro Healthcare API Deployment Validation Script
 * Validates Vercel deployment with healthcare compliance checks
 */

const https = require("node:https");
const { performance } = require("node:perf_hooks");

// Configuration
const ENVIRONMENTS = {
  preview: process.env.PREVIEW_URL,
  staging: "https://api-staging.neonpro.health",
  production: "https://api.neonpro.health",
};

const HEALTH_ENDPOINTS = ["/health", "/health/db", "/health/redis", "/health/jobs", "/metrics"];

const HEALTHCARE_ENDPOINTS = [
  "/api/v3/compliance/lgpd/status",
  "/api/v3/compliance/anvisa/status",
  "/api/version/stats",
];

const SECURITY_HEADERS = [
  "x-healthcare-compliance",
  "x-api-version",
  "x-bmad-methodology",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
];

/**
 * Make HTTP request with timeout
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();

    const req = https.request(
      url,
      {
        method: "GET",
        timeout: 10000,
        ...options,
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const duration = performance.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            duration: duration,
          });
        });
      },
    );

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

/**
 * Validate health endpoints
 */
async function validateHealthEndpoints(baseUrl) {
  console.log("🔍 Validating health endpoints...");

  const results = [];

  for (const endpoint of HEALTH_ENDPOINTS) {
    try {
      const response = await makeRequest(`${baseUrl}${endpoint}`);

      const isHealthy = response.statusCode === 200;
      const isPerformant = response.duration < 2000; // Under 2 seconds

      results.push({
        endpoint,
        status: isHealthy ? "PASS" : "FAIL",
        statusCode: response.statusCode,
        duration: Math.round(response.duration),
        performance: isPerformant ? "GOOD" : "SLOW",
      });

      console.log(
        `  ${isHealthy ? "✅" : "❌"} ${endpoint} - ${response.statusCode} (${Math.round(response.duration)}ms)`,
      );
    } catch (error) {
      results.push({
        endpoint,
        status: "ERROR",
        error: error.message,
      });

      console.log(`  ❌ ${endpoint} - ERROR: ${error.message}`);
    }
  }

  return results;
}

/**
 * Validate healthcare compliance endpoints
 */
async function validateHealthcareEndpoints(baseUrl) {
  console.log("🏥 Validating healthcare compliance endpoints...");

  const results = [];

  for (const endpoint of HEALTHCARE_ENDPOINTS) {
    try {
      const response = await makeRequest(`${baseUrl}${endpoint}`);

      const isWorking = response.statusCode === 200;

      results.push({
        endpoint,
        status: isWorking ? "PASS" : "FAIL",
        statusCode: response.statusCode,
        duration: Math.round(response.duration),
      });

      console.log(`  ${isWorking ? "✅" : "❌"} ${endpoint} - ${response.statusCode}`);
    } catch (error) {
      results.push({
        endpoint,
        status: "ERROR",
        error: error.message,
      });

      console.log(`  ❌ ${endpoint} - ERROR: ${error.message}`);
    }
  }

  return results;
}

/**
 * Validate security headers
 */
async function validateSecurityHeaders(baseUrl) {
  console.log("🔒 Validating security headers...");

  try {
    const response = await makeRequest(`${baseUrl}/api/v3/health`);
    const headers = response.headers;

    const results = [];

    for (const headerName of SECURITY_HEADERS) {
      const headerValue = headers[headerName.toLowerCase()];
      const isPresent = !!headerValue;

      results.push({
        header: headerName,
        status: isPresent ? "PASS" : "FAIL",
        value: headerValue || "MISSING",
      });

      console.log(`  ${isPresent ? "✅" : "⚠️ "} ${headerName}: ${headerValue || "MISSING"}`);
    }

    return results;
  } catch (error) {
    console.log(`  ❌ Security headers validation failed: ${error.message}`);
    return [];
  }
}

/**
 * Validate LGPD compliance
 */
async function validateLGPDCompliance(baseUrl) {
  console.log("🔐 Validating LGPD compliance...");

  const checks = [
    {
      name: "Data Protection Headers",
      test: async () => {
        const response = await makeRequest(`${baseUrl}/api/v3/patients`);
        return response.headers["x-data-protection"] === "lgpd-compliant";
      },
    },
    {
      name: "Consent Management Endpoint",
      test: async () => {
        const response = await makeRequest(`${baseUrl}/api/v3/compliance/lgpd/status`);
        return response.statusCode === 200;
      },
    },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const passed = await check.test();
      results.push({
        check: check.name,
        status: passed ? "PASS" : "FAIL",
      });

      console.log(`  ${passed ? "✅" : "❌"} ${check.name}`);
    } catch (error) {
      results.push({
        check: check.name,
        status: "ERROR",
        error: error.message,
      });

      console.log(`  ❌ ${check.name} - ERROR: ${error.message}`);
    }
  }

  return results;
}

/**
 * Validate ANVISA compliance
 */
async function validateANVISACompliance(baseUrl) {
  console.log("🏥 Validating ANVISA compliance...");

  const checks = [
    {
      name: "Medical Device Validation",
      test: async () => {
        const response = await makeRequest(`${baseUrl}/api/v3/compliance/anvisa/status`);
        return response.statusCode === 200;
      },
    },
    {
      name: "Audit Trail Implementation",
      test: async () => {
        const response = await makeRequest(`${baseUrl}/api/v3/audit/logs`);
        return response.statusCode === 200 || response.statusCode === 401; // Should be protected
      },
    },
  ];

  const results = [];

  for (const check of checks) {
    try {
      const passed = await check.test();
      results.push({
        check: check.name,
        status: passed ? "PASS" : "FAIL",
      });

      console.log(`  ${passed ? "✅" : "❌"} ${check.name}`);
    } catch (error) {
      results.push({
        check: check.name,
        status: "ERROR",
        error: error.message,
      });

      console.log(`  ❌ ${check.name} - ERROR: ${error.message}`);
    }
  }

  return results;
}

/**
 * Generate validation report
 */
function generateReport(environment, results) {
  console.log("\n📊 VALIDATION REPORT");
  console.log("=".repeat(50));
  console.log(`Environment: ${environment.toUpperCase()}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("=".repeat(50));

  let totalChecks = 0;
  let passedChecks = 0;

  Object.entries(results).forEach(([_category, categoryResults]) => {
    if (Array.isArray(categoryResults)) {
      categoryResults.forEach((result) => {
        totalChecks++;
        if (result.status === "PASS") passedChecks++;
      });
    }
  });

  const successRate = Math.round((passedChecks / totalChecks) * 100);

  console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedChecks}/${totalChecks})`);

  if (successRate >= 95) {
    console.log("🎉 EXCELLENT - Deployment ready for production!");
  } else if (successRate >= 80) {
    console.log("⚠️  GOOD - Minor issues detected, review recommended");
  } else {
    console.log("❌ ISSUES DETECTED - Deployment validation failed");
    process.exit(1);
  }

  return {
    environment,
    timestamp: new Date().toISOString(),
    successRate,
    totalChecks,
    passedChecks,
    details: results,
  };
}

/**
 * Main validation function
 */
async function validateDeployment(environment) {
  const baseUrl = ENVIRONMENTS[environment];

  if (!baseUrl) {
    console.error(`❌ Unknown environment: ${environment}`);
    process.exit(1);
  }

  console.log(`🚀 Starting NeonPro Healthcare API validation for ${environment.toUpperCase()}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log("-".repeat(60));

  try {
    const results = {
      health: await validateHealthEndpoints(baseUrl),
      healthcare: await validateHealthcareEndpoints(baseUrl),
      security: await validateSecurityHeaders(baseUrl),
      lgpd: await validateLGPDCompliance(baseUrl),
      anvisa: await validateANVISACompliance(baseUrl),
    };

    const report = generateReport(environment, results);

    // Save report to file
    const fs = require("node:fs");
    const reportPath = `./validation-report-${environment}-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

    return report;
  } catch (error) {
    console.error(`❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run validation
const environment = process.argv[2] || "preview";
validateDeployment(environment).catch(console.error);
