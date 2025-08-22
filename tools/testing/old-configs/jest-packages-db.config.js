/**
 * Jest Configuration for NeonPro Database Package
 *
 * Database + Row Level Security (RLS) Testing
 * Multi-Tenant Data Isolation Validation
 * Supabase Healthcare Database Testing
 */

const { createJestConfig } = require("../../jest.shared");

/** @type {import('jest').Config} */
const config = createJestConfig({
	packageName: "neonpro-db",
	displayName: "NeonPro Database",
	rootDir: __dirname,

	// Additional setup files for database testing
	additionalSetupFiles: ["<rootDir>/jest.setup.js"],

	// Database coverage thresholds
	coverageThreshold: {
		global: {
			branches: 95, // High threshold for database operations
			functions: 95,
			lines: 95,
			statements: 95,
		},
		// RLS policies (100% coverage)
		"**/rls/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// Multi-tenant isolation (100% coverage)
		"**/tenant/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// Patient data operations (100% coverage)
		"**/patient/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// Audit logging (100% coverage)
		"**/audit/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},

	// Module name mapping for database package
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@/schemas/(.*)$": "<rootDir>/src/schemas/$1",
		"^@/queries/(.*)$": "<rootDir>/src/queries/$1",
		"^@/mutations/(.*)$": "<rootDir>/src/mutations/$1",
		"^@/rls/(.*)$": "<rootDir>/src/rls/$1",
		"^@/utils/(.*)$": "<rootDir>/src/utils/$1",
		"^@/types/(.*)$": "<rootDir>/src/types/$1",
		"^@/migrations/(.*)$": "<rootDir>/src/migrations/$1",
		// Test utilities
		"^@test/(.*)$": "<rootDir>/../../test-utils/$1",
		// Database test utilities
		"^@test/db/(.*)$": "<rootDir>/../../test-utils/database/$1",
	},

	// Database-specific test patterns
	testMatch: [
		"<rootDir>/**/__tests__/**/*.(ts|tsx)",
		"<rootDir>/**/*.(test|spec).(ts|tsx)",
		"<rootDir>/src/queries/**/*.test.(ts|tsx)",
		"<rootDir>/src/mutations/**/*.test.(ts|tsx)",
		"<rootDir>/src/rls/**/*.test.(ts|tsx)",
		"<rootDir>/src/migrations/**/*.test.(ts|tsx)",
	],

	// Coverage collection for database components
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/*.config.{js,ts}",
		"!src/index.ts", // Export file
		"!src/types/**/*", // Type definitions
		"!src/schemas/**/*.sql", // SQL schema files
		"!src/migrations/**/*.sql", // SQL migration files
	],

	// Database testing globals
	globals: {
		__HEALTHCARE_MODE__: true,
		__LGPD_COMPLIANCE__: true,
		__ANVISA_VALIDATION__: true,
		__CFM_STANDARDS__: true,
		__DATABASE_TESTING__: true,
		__RLS_TESTING__: true,
		__MULTI_TENANT_TESTING__: true,
		__SUPABASE_TESTING__: true,
	},

	// Extended timeout for database operations
	testTimeout: 25_000,

	// Reporters for database testing
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "coverage",
				outputName: "database-junit.xml",
				suiteNameTemplate: "{title} - Database Tests",
			},
		],
	],

	// Cache directory for database tests
	cacheDirectory: "<rootDir>/../../node_modules/.cache/jest-db",

	// Node environment for database operations
	testEnvironment: "node",

	// Verbose output for database testing
	verbose: true,

	// Clear mocks between database tests
	clearMocks: true,
	restoreMocks: true,
	resetMocks: true,

	// Sequential testing for database operations
	maxWorkers: 1, // Sequential for database consistency

	// Bail configuration for database tests
	bail: process.env.CI ? 1 : 0,

	// Error handling for database tests
	errorOnDeprecated: true,

	// Detect open handles for database connections
	detectOpenHandles: true,

	// Force exit for database tests
	forceExit: true,

	// Setup and teardown for database tests
	globalSetup: "<rootDir>/jest.global-setup.js",
	globalTeardown: "<rootDir>/jest.global-teardown.js",

	// Transform ignore patterns for database dependencies
	transformIgnorePatterns: ["/node_modules/(?!(.*\\.mjs$|@supabase|pg))"],
});

module.exports = config;
