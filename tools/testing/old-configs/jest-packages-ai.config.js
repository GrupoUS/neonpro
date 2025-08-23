/**
 * Jest Configuration for NeonPro AI Package
 *
 * AI Healthcare + Ethics Validation
 * Constitutional AI Compliance for Brazilian Healthcare
 * Medical Accuracy + Explainable AI Testing
 */

const { createJestConfig } = require("../../jest.shared");

/** @type {import('jest').Config} */
const config = createJestConfig({
	packageName: "neonpro-ai",
	displayName: "NeonPro AI Healthcare",
	rootDir: __dirname,

	// Additional setup files for AI testing
	additionalSetupFiles: ["<rootDir>/jest.setup.js"],

	// Healthcare AI coverage thresholds
	coverageThreshold: {
		global: {
			branches: 95, // High threshold for AI healthcare
			functions: 95,
			lines: 95,
			statements: 95,
		},
		// AI Ethics components (100% coverage)
		"**/ethics/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// Medical accuracy validation (100% coverage)
		"**/validation/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		// Treatment recommendation (≥98% coverage)
		"**/recommendation/**/*.{ts,tsx}": {
			branches: 98,
			functions: 98,
			lines: 98,
			statements: 98,
		},
		// Predictive models (≥95% coverage)
		"**/prediction/**/*.{ts,tsx}": {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		},
	},

	// Module name mapping for AI package
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@/ethics/(.*)$": "<rootDir>/src/ethics/$1",
		"^@/prediction/(.*)$": "<rootDir>/src/prediction/$1",
		"^@/recommendation/(.*)$": "<rootDir>/src/recommendation/$1",
		"^@/validation/(.*)$": "<rootDir>/src/validation/$1",
		"^@/utils/(.*)$": "<rootDir>/src/utils/$1",
		"^@/types/(.*)$": "<rootDir>/src/types/$1",
		// Test utilities
		"^@test/(.*)$": "<rootDir>/../../test-utils/$1",
		// AI model mocks
		"^@/models/(.*)$": "<rootDir>/../../test-utils/ai-models-mock.js",
	},

	// AI-specific test patterns
	testMatch: [
		"<rootDir>/**/__tests__/**/*.(ts|tsx)",
		"<rootDir>/**/*.(test|spec).(ts|tsx)",
		"<rootDir>/src/ethics/**/*.test.(ts|tsx)",
		"<rootDir>/src/prediction/**/*.test.(ts|tsx)",
		"<rootDir>/src/validation/**/*.test.(ts|tsx)",
	],

	// Coverage collection for AI components
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/*.config.{js,ts}",
		"!src/index.ts", // Export file
		"!src/types/**/*", // Type definitions
		"!src/models/**/*.json", // Model configuration files
	],

	// AI testing globals
	globals: {
		__HEALTHCARE_MODE__: true,
		__LGPD_COMPLIANCE__: true,
		__ANVISA_VALIDATION__: true,
		__CFM_STANDARDS__: true,
		__AI_TESTING__: true,
		__AI_ETHICS_VALIDATION__: true,
		__MEDICAL_ACCURACY_TESTING__: true,
		__EXPLAINABLE_AI__: true,
	},

	// Extended timeout for AI model testing
	testTimeout: 30_000,

	// Reporters for AI testing
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "coverage",
				outputName: "ai-healthcare-junit.xml",
				suiteNameTemplate: "{title} - AI Healthcare Tests",
			},
		],
	],

	// Cache directory for AI tests
	cacheDirectory: "<rootDir>/../../node_modules/.cache/jest-ai",

	// Node environment for AI algorithms
	testEnvironment: "node",

	// Transform ignore patterns for AI dependencies
	transformIgnorePatterns: [
		"/node_modules/(?!(.*\\.mjs$|@tensorflow|@huggingface|ml-matrix))",
	],

	// Verbose output for AI testing
	verbose: true,

	// Clear mocks between AI tests
	clearMocks: true,
	restoreMocks: true,
	resetMocks: true,

	// Max workers for AI testing (CPU intensive)
	maxWorkers: "25%", // Reduced for AI processing

	// Bail configuration
	bail: process.env.CI ? 1 : 0,

	// Worker configuration for AI tests
	workerIdleMemoryLimit: "1GB",
});

module.exports = config;
