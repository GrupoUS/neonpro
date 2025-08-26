/**
 * Jest Configuration for NeonPro Compliance Package
 *
 * LGPD + ANVISA + CFM Compliance Testing
 * Brazilian Healthcare Regulatory Validation
 * Constitutional Data Protection Testing
 */

const { createJestConfig } = require("../../jest.shared");

/** @type {import('jest').Config} */
const config = createJestConfig({
	packageName: "neonpro-compliance",
	displayName: "NeonPro Compliance",
	rootDir: __dirname,

	// Additional setup files for compliance testing
	additionalSetupFiles: ["<rootDir>/jest.setup.js"],

	// Compliance coverage thresholds (highest standards)
	coverageThreshold: {
		global: {
			branches: 98, // Very high threshold for compliance
			functions: 98,
			lines: 98,
			statements: 98,
		},
		// LGPD compliance (100% coverage)
		"**/lgpd/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// ANVISA compliance (100% coverage)
		"**/anvisa/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// CFM compliance (100% coverage)
		"**/cfm/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// Audit trails (100% coverage)
		"**/audit/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},

	// Module name mapping for compliance package
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@/lgpd/(.*)$": "<rootDir>/src/lgpd/$1",
		"^@/anvisa/(.*)$": "<rootDir>/src/anvisa/$1",
		"^@/cfm/(.*)$": "<rootDir>/src/cfm/$1",
		"^@/audit/(.*)$": "<rootDir>/src/audit/$1",
		"^@/utils/(.*)$": "<rootDir>/src/utils/$1",
		"^@/types/(.*)$": "<rootDir>/src/types/$1",
		"^@/validators/(.*)$": "<rootDir>/src/validators/$1",
		// Test utilities
		"^@test/(.*)$": "<rootDir>/../../test-utils/$1",
		// Compliance test data
		"^@test/compliance/(.*)$": "<rootDir>/../../test-utils/compliance/$1",
	},

	// Compliance-specific test patterns
	testMatch: [
		"<rootDir>/**/__tests__/**/*.(ts|tsx)",
		"<rootDir>/**/*.(test|spec).(ts|tsx)",
		"<rootDir>/src/lgpd/**/*.test.(ts|tsx)",
		"<rootDir>/src/anvisa/**/*.test.(ts|tsx)",
		"<rootDir>/src/cfm/**/*.test.(ts|tsx)",
		"<rootDir>/src/audit/**/*.test.(ts|tsx)",
	],

	// Coverage collection for compliance components
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/*.config.{js,ts}",
		"!src/index.ts", // Export file
		"!src/types/**/*", // Type definitions
		"!src/schemas/**/*.json", // Compliance schemas
	],

	// Compliance testing globals
	globals: {
		__HEALTHCARE_MODE__: true,
		__LGPD_COMPLIANCE__: true,
		__ANVISA_VALIDATION__: true,
		__CFM_STANDARDS__: true,
		__COMPLIANCE_TESTING__: true,
		__AUDIT_TRAIL_TESTING__: true,
		__REGULATORY_VALIDATION__: true,
		__BRAZILIAN_HEALTHCARE_LAW__: true,
	},

	// Extended timeout for compliance validation
	testTimeout: 20_000,

	// Reporters for compliance testing
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "coverage",
				outputName: "compliance-junit.xml",
				suiteNameTemplate: "{title} - Compliance Tests",
			},
		],
		// Custom compliance reporter
		[
			"<rootDir>/../../test-utils/compliance-reporter.js",
			{
				lgpdCompliance: true,
				anvisaValidation: true,
				cfmStandards: true,
				auditTrails: true,
			},
		],
	],

	// Cache directory for compliance tests
	cacheDirectory: "<rootDir>/../../node_modules/.cache/jest-compliance",

	// Node environment for compliance validation
	testEnvironment: "node",

	// Verbose output for compliance testing
	verbose: true,

	// Clear mocks between compliance tests
	clearMocks: true,
	restoreMocks: true,
	resetMocks: true,

	// Sequential testing for compliance (no parallel execution)
	maxWorkers: 1, // Sequential for compliance validation

	// Bail on first failure for compliance
	bail: 1,

	// Error handling for compliance
	errorOnDeprecated: true,

	// Force exit for compliance tests
	forceExit: true,

	// Detect open handles for compliance
	detectOpenHandles: true,

	// Collect coverage from
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"/coverage/",
		"/dist/",
		"/__tests__/",
		"/test-utils/",
	],
});

module.exports = config;
