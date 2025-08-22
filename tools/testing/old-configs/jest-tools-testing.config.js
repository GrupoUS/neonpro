/**
 * Root Jest Configuration for NeonPro Healthcare Platform
 *
 * Healthcare Quality Standards: ≥9.9/10
 * Coverage Requirements: ≥90% (Healthcare Override)
 * Compliance: LGPD + ANVISA + CFM
 */

const { createJestConfig } = require("./jest.shared");

/** @type {import('jest').Config} */
const config = {
	// Healthcare Testing Environment
	testEnvironment: "jsdom",
	preset: "ts-jest",

	// Monorepo Projects Configuration
	projects: [
		"<rootDir>/apps/web",
		"<rootDir>/packages/ui",
		"<rootDir>/packages/ai",
		"<rootDir>/packages/compliance",
		"<rootDir>/packages/db",
	],

	// Healthcare Test Setup
	setupFilesAfterEnv: [
		"<rootDir>/test-setup/healthcare-setup.js",
		"<rootDir>/test-setup/accessibility-matchers.js",
		"<rootDir>/test-setup/lgpd-compliance-helpers.js",
	],

	// Healthcare Coverage Thresholds (≥90% requirement)
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
		},
		// Critical Healthcare Paths (≥95% requirement)
		"**/healthcare/**/*.{ts,tsx}": {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		},
		// Compliance Code (≥95% requirement)
		"**/compliance/**/*.{ts,tsx}": {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		},
		// Patient Data Handlers (100% requirement)
		"**/patient/**/*.{ts,tsx}": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
	},

	// Coverage Collection
	collectCoverageFrom: [
		"apps/**/*.{ts,tsx}",
		"packages/**/*.{ts,tsx}",
		"!**/*.d.ts",
		"!**/*.stories.{ts,tsx}",
		"!**/*.config.{js,ts}",
		"!**/node_modules/**",
		"!**/dist/**",
		"!**/coverage/**",
	],

	// Healthcare Coverage Reporting
	coverageReporters: [
		"clover",
		"json",
		"lcov",
		["text", { skipFull: true }],
		["html", { subdir: "html" }],
		// Healthcare Compliance Reporter
		["json-summary", { file: "coverage/healthcare-summary.json" }],
	],

	// Test Match Patterns
	testMatch: [
		"**/__tests__/**/*.(ts|tsx)",
		"**/*.(test|spec).(ts|tsx)",
		"**/tests/healthcare/**/*.(ts|tsx)",
		"**/tests/compliance/**/*.(ts|tsx)",
	],

	// Module Name Mapping for Healthcare Paths
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/apps/web/src/$1",
		"^@neonpro/ui/(.*)$": "<rootDir>/packages/ui/src/$1",
		"^@neonpro/ai/(.*)$": "<rootDir>/packages/ai/src/$1",
		"^@neonpro/compliance/(.*)$": "<rootDir>/packages/compliance/src/$1",
		"^@neonpro/db/(.*)$": "<rootDir>/packages/db/src/$1",
		"^@test/(.*)$": "<rootDir>/test-utils/$1",
		// CSS and Asset Mocking
		"\\.(css|less|scss|sass)$": "identity-obj-proxy",
		"\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/test-utils/file-mock.js",
	},

	// Healthcare Test Environment Options
	testEnvironmentOptions: {
		url: "http://localhost:3000",
		// Healthcare-specific jsdom options
		customExportConditions: ["healthcare", "node"],
	},

	// Transform Configuration
	transform: {
		"^.+\\.(ts|tsx)$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.json",
				isolatedModules: true,
			},
		],
		"^.+\\.(js|jsx)$": [
			"babel-jest",
			{
				presets: ["next/babel"],
			},
		],
	},

	// Global Test Configuration
	globals: {
		"ts-jest": {
			tsconfig: "<rootDir>/tsconfig.json",
		},
		// Healthcare Testing Globals
		__HEALTHCARE_MODE__: true,
		__LGPD_COMPLIANCE__: true,
		__ANVISA_VALIDATION__: true,
		__CFM_STANDARDS__: true,
	},

	// Healthcare Test Timeout (extended for compliance validation)
	testTimeout: 15_000,

	// Reporters for Healthcare Quality
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputDirectory: "coverage",
				outputName: "healthcare-junit.xml",
				suiteNameTemplate: "{title} - Healthcare Test Suite",
			},
		],
		// Healthcare Compliance Reporter
		[
			"./test-utils/healthcare-reporter.js",
			{
				lgpdCompliance: true,
				anvisaValidation: true,
				cfmStandards: true,
			},
		],
	],

	// Cache Configuration
	cacheDirectory: "<rootDir>/node_modules/.cache/jest",

	// Error Handling for Healthcare Tests
	errorOnDeprecated: true,
	verbose: true,

	// Clear Mocks for Healthcare Testing Isolation
	clearMocks: true,
	restoreMocks: true,
	resetMocks: true,

	// Module Path Ignore Patterns
	modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/.next/", "<rootDir>/node_modules/"],

	// Watch Plugins for Development
	watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
};

module.exports = config;
