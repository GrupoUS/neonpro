// Jest Configuration for Tax API Tests
// Story 5.5: Brazilian Tax System Integration
// Author: VoidBeast V6.0 Master Orchestrator

module.exports = {
  displayName: "Tax APIs - Story 5.5",
  testMatch: ["**/__tests__/api/tax/**/*.test.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../../../$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setup.ts"],
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage/tax-apis",
  coverageReporters: ["text", "lcov", "html"],
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/", "/coverage/"],
  testTimeout: 30000, // 30 seconds for tax API operations
  maxWorkers: 4,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./test-results/tax-apis",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: true,
      },
    ],
  ],
};
