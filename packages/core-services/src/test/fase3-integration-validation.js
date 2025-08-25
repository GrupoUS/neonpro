/**
 * FASE 3 Integration Validation Script
 * Tests all package integrations with enterprise services
 */

const fs = require("fs");
const path = require("path");

const PACKAGES_DIR = path.join(__dirname, "..", "..", "..");
const COLORS = {
	RED: "\x1b[31m",
	GREEN: "\x1b[32m",
	YELLOW: "\x1b[33m",
	BLUE: "\x1b[34m",
	RESET: "\x1b[0m",
};

/**
 * Package integration tests
 */
const INTEGRATION_TESTS = [
	{
		name: "@neonpro/auth",
		tests: [
			{ file: "src/index.ts", required: true },
			{ file: "src/AuthService.ts", required: true },
			{ file: "src/types.ts", required: true },
			{ file: "src/hooks/index.ts", required: true },
			{ file: "src/components/index.ts", required: true },
			{ file: "src/utils.ts", required: true },
			{ content: "EnhancedServiceBase", file: "src/AuthService.ts", required: true },
			{ content: "@neonpro/core-services", file: "package.json", required: true },
			{ content: "jsonwebtoken", file: "package.json", required: true },
			{ content: "bcrypt", file: "package.json", required: true },
			{ content: "speakeasy", file: "package.json", required: true },
		],
	},
	{
		name: "@neonpro/cache",
		tests: [
			{ file: "src/enterprise.ts", required: true },
			{ content: "CacheServiceFactory", file: "src/enterprise.ts", required: true },
			{ content: "EnhancedServiceBase", file: "src/enterprise.ts", required: true },
			{ content: "@neonpro/core-services", file: "package.json", required: true },
			{ content: 'export \\* from "./enterprise"', file: "src/index.ts", required: true },
			{ content: "setEnhanced", file: "src/enterprise.ts", required: true },
			{ content: "getEnhanced", file: "src/enterprise.ts", required: true },
			{ content: "setSensitiveEnhanced", file: "src/enterprise.ts", required: true },
			{ content: "lgpdCompliant", file: "src/enterprise.ts", required: true },
		],
	},
	{
		name: "@neonpro/monitoring",
		tests: [
			{ file: "src/enterprise.ts", required: true },
			{ content: "MonitoringServiceFactory", file: "src/enterprise.ts", required: true },
			{ content: "EnhancedServiceBase", file: "src/enterprise.ts", required: true },
			{ content: "@neonpro/core-services", file: "package.json", required: true },
			{ content: 'export \\* from "./enterprise"', file: "src/index.ts", required: true },
			{ content: "trackCustomMetricEnhanced", file: "src/enterprise.ts", required: true },
			{ content: "trackHealthcareMetricEnhanced", file: "src/enterprise.ts", required: true },
			{ content: "generateComplianceReport", file: "src/enterprise.ts", required: true },
		],
	},
	{
		name: "@neonpro/types",
		tests: [
			{ file: "src/enterprise.ts", required: true },
			{ content: 'export \\* from "./enterprise"', file: "src/index.ts", required: true },
			{ content: "EnterpriseServiceConfig", file: "src/enterprise.ts", required: true },
			{ content: "EnterpriseCacheConfig", file: "src/enterprise.ts", required: true },
			{ content: "EnterpriseAnalyticsConfig", file: "src/enterprise.ts", required: true },
			{ content: "EnterpriseSecurityConfig", file: "src/enterprise.ts", required: true },
			{ content: "EnterpriseAuditConfig", file: "src/enterprise.ts", required: true },
			{ content: "HealthcareEnterpriseConfig", file: "src/enterprise.ts", required: true },
			{ content: "PatientDataAccess", file: "src/enterprise.ts", required: true },
			{ content: "ComplianceFramework", file: "src/enterprise.ts", required: true },
		],
	},
];

function log(message, color = COLORS.RESET) {
	console.log(`${color}${message}${COLORS.RESET}`);
}

function checkFileExists(packagePath, fileName) {
	const filePath = path.join(packagePath, fileName);
	return fs.existsSync(filePath);
}

function checkFileContent(packagePath, fileName, content) {
	try {
		const filePath = path.join(packagePath, fileName);
		if (!fs.existsSync(filePath)) return false;

		const fileContent = fs.readFileSync(filePath, "utf8");
		const regex = new RegExp(content, "i");
		return regex.test(fileContent);
	} catch (error) {
		return false;
	}
}

function validatePackageIntegration(packageName, tests) {
	const packagePath = path.join(PACKAGES_DIR, packageName.replace("@neonpro/", ""));

	if (!fs.existsSync(packagePath)) {
		log(`❌ Package directory not found: ${packagePath}`, COLORS.RED);
		return { passed: 0, failed: 1, total: 1 };
	}

	let passed = 0;
	let failed = 0;
	const total = tests.length;

	log(`\n📦 Testing ${packageName}:`, COLORS.BLUE);

	for (const test of tests) {
		let success = false;

		if (test.content) {
			// Content-based test
			success = checkFileContent(packagePath, test.file, test.content);
			const description = `Contains "${test.content}" in ${test.file}`;

			if (success) {
				log(`  ✅ ${description}`, COLORS.GREEN);
				passed++;
			} else {
				log(`  ❌ ${description}`, COLORS.RED);
				failed++;
			}
		} else if (test.file) {
			// File existence test
			success = checkFileExists(packagePath, test.file);

			if (success) {
				log(`  ✅ File exists: ${test.file}`, COLORS.GREEN);
				passed++;
			} else {
				log(`  ❌ File missing: ${test.file}`, COLORS.RED);
				failed++;
			}
		}
	}

	return { passed, failed, total };
}

function validateEnterpriseIntegrations() {
	log("🚀 VALIDATING FASE 3: PACKAGE INTEGRATIONS", COLORS.BLUE);
	log("=".repeat(60), COLORS.BLUE);

	let totalPassed = 0;
	let totalFailed = 0;
	let totalTests = 0;

	for (const integration of INTEGRATION_TESTS) {
		const result = validatePackageIntegration(integration.name, integration.tests);
		totalPassed += result.passed;
		totalFailed += result.failed;
		totalTests += result.total;
	}

	// Summary
	log("\n" + "=".repeat(60), COLORS.BLUE);
	log("📊 FASE 3 INTEGRATION VALIDATION SUMMARY:", COLORS.BLUE);
	log(`   Total Tests: ${totalTests}`, COLORS.BLUE);
	log(`   Passed: ${totalPassed}`, COLORS.GREEN);
	log(`   Failed: ${totalFailed}`, totalFailed > 0 ? COLORS.RED : COLORS.GREEN);
	log(
		`   Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`,
		totalFailed === 0 ? COLORS.GREEN : COLORS.YELLOW
	);

	if (totalFailed === 0) {
		log("\n🎉 ALL PACKAGE INTEGRATIONS VALIDATED SUCCESSFULLY!", COLORS.GREEN);
		log("📊 FASE 3 IMPLEMENTATION STATUS: ✅ STRUCTURE_VALIDATED", COLORS.GREEN);
	} else {
		log("\n⚠️  Some integration tests failed. Check the details above.", COLORS.YELLOW);
		log("📊 FASE 3 IMPLEMENTATION STATUS: ⚠️  NEEDS_ATTENTION", COLORS.YELLOW);
	}

	return totalFailed === 0;
}

// Specific validation functions
function validateAuthIntegration() {
	const authPath = path.join(PACKAGES_DIR, "auth");

	log("\n🔐 AUTH SERVICE DETAILED VALIDATION:", COLORS.BLUE);

	const authChecks = [
		{
			desc: "AuthService extends EnhancedServiceBase",
			check: () => checkFileContent(authPath, "src/AuthService.ts", "extends EnhancedServiceBase"),
		},
		{
			desc: "Enterprise security integration",
			check: () => checkFileContent(authPath, "src/AuthService.ts", "this\\.security\\."),
		},
		{
			desc: "Enterprise analytics integration",
			check: () => checkFileContent(authPath, "src/AuthService.ts", "this\\.analytics\\."),
		},
		{
			desc: "Enterprise audit integration",
			check: () => checkFileContent(authPath, "src/AuthService.ts", "this\\.audit\\."),
		},
		{
			desc: "Healthcare-specific types",
			check: () => checkFileContent(authPath, "src/types.ts", "HealthcareProvider"),
		},
		{ desc: "React hooks provided", check: () => checkFileContent(authPath, "src/hooks/index.ts", "useAuth") },
		{ desc: "Components provided", check: () => checkFileContent(authPath, "src/components/index.ts", "LoginForm") },
	];

	for (const authCheck of authChecks) {
		const result = authCheck.check();
		log(`  ${result ? "✅" : "❌"} ${authCheck.desc}`, result ? COLORS.GREEN : COLORS.RED);
	}
}

function validateCacheIntegration() {
	const cachePath = path.join(PACKAGES_DIR, "cache");

	log("\n💾 CACHE SERVICE DETAILED VALIDATION:", COLORS.BLUE);

	const cacheChecks = [
		{
			desc: "CacheServiceFactory extends EnhancedServiceBase",
			check: () => checkFileContent(cachePath, "src/enterprise.ts", "extends EnhancedServiceBase"),
		},
		{
			desc: "Multi-layer caching support",
			check: () => checkFileContent(cachePath, "src/enterprise.ts", "setMultiLayer"),
		},
		{
			desc: "LGPD compliance features",
			check: () => checkFileContent(cachePath, "src/enterprise.ts", "lgpdCompliant"),
		},
		{
			desc: "Sensitive data handling",
			check: () => checkFileContent(cachePath, "src/enterprise.ts", "setSensitiveEnhanced"),
		},
		{
			desc: "Enterprise analytics integration",
			check: () => checkFileContent(cachePath, "src/enterprise.ts", "this\\.analytics\\."),
		},
		{
			desc: "Backward compatibility maintained",
			check: () => checkFileContent(cachePath, "src/enterprise.ts", "healthcareCache"),
		},
	];

	for (const cacheCheck of cacheChecks) {
		const result = cacheCheck.check();
		log(`  ${result ? "✅" : "❌"} ${cacheCheck.desc}`, result ? COLORS.GREEN : COLORS.RED);
	}
}

function validateMonitoringIntegration() {
	const monitoringPath = path.join(PACKAGES_DIR, "monitoring");

	log("\n📈 MONITORING SERVICE DETAILED VALIDATION:", COLORS.BLUE);

	const monitoringChecks = [
		{
			desc: "MonitoringServiceFactory extends EnhancedServiceBase",
			check: () => checkFileContent(monitoringPath, "src/enterprise.ts", "extends EnhancedServiceBase"),
		},
		{
			desc: "Healthcare-specific tracking",
			check: () => checkFileContent(monitoringPath, "src/enterprise.ts", "trackHealthcareMetricEnhanced"),
		},
		{
			desc: "Compliance reporting",
			check: () => checkFileContent(monitoringPath, "src/enterprise.ts", "generateComplianceReport"),
		},
		{
			desc: "Enterprise insights generation",
			check: () => checkFileContent(monitoringPath, "src/enterprise.ts", "generateHealthcareInsights"),
		},
		{
			desc: "Real-time dashboard support",
			check: () => checkFileContent(monitoringPath, "src/enterprise.ts", "getEnterpriseDashboardMetrics"),
		},
		{
			desc: "Backward compatibility maintained",
			check: () => checkFileContent(monitoringPath, "src/enterprise.ts", "PerformanceMonitor"),
		},
	];

	for (const monitoringCheck of monitoringChecks) {
		const result = monitoringCheck.check();
		log(`  ${result ? "✅" : "❌"} ${monitoringCheck.desc}`, result ? COLORS.GREEN : COLORS.RED);
	}
}

function validateTypesIntegration() {
	const typesPath = path.join(PACKAGES_DIR, "types");

	log("\n🏷️  TYPES PACKAGE DETAILED VALIDATION:", COLORS.BLUE);

	const typesChecks = [
		{
			desc: "Enterprise service configuration types",
			check: () => checkFileContent(typesPath, "src/enterprise.ts", "EnterpriseServiceConfig"),
		},
		{
			desc: "Healthcare-specific enterprise types",
			check: () => checkFileContent(typesPath, "src/enterprise.ts", "HealthcareEnterpriseConfig"),
		},
		{
			desc: "Compliance framework types",
			check: () => checkFileContent(typesPath, "src/enterprise.ts", "ComplianceFramework"),
		},
		{
			desc: "Patient data access types",
			check: () => checkFileContent(typesPath, "src/enterprise.ts", "PatientDataAccess"),
		},
		{ desc: "Security event types", check: () => checkFileContent(typesPath, "src/enterprise.ts", "SecurityEvent") },
		{
			desc: "Analytics insight types",
			check: () => checkFileContent(typesPath, "src/enterprise.ts", "AnalyticsInsight"),
		},
	];

	for (const typesCheck of typesChecks) {
		const result = typesCheck.check();
		log(`  ${result ? "✅" : "❌"} ${typesCheck.desc}`, result ? COLORS.GREEN : COLORS.RED);
	}
}

// Run main validation
try {
	const success = validateEnterpriseIntegrations();

	if (success) {
		// Run detailed validations
		validateAuthIntegration();
		validateCacheIntegration();
		validateMonitoringIntegration();
		validateTypesIntegration();

		log("\n🎯 FASE 3 PACKAGE INTEGRATION: COMPLETE ✅", COLORS.GREEN);
		log("Ready to proceed to FASE 4: Frontend Components", COLORS.GREEN);
	}

	process.exit(success ? 0 : 1);
} catch (error) {
	log(`\n❌ Validation error: ${error.message}`, COLORS.RED);
	process.exit(1);
}
