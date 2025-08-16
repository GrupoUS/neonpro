/**
 * 🏥 Healthcare Jest Configuration - NeonPro
 * ≥90% Coverage Requirements with Patient Data Protection
 * Constitutional Healthcare Testing Standards
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './apps/web',
})

// Healthcare-specific Jest configuration
const healthcareJestConfig = {
  displayName: '🏥 Healthcare Tests',
  
  // Test environment optimized for healthcare components
  testEnvironment: 'jsdom',
  
  // Healthcare test patterns
  testMatch: [
    '<rootDir>/apps/web/__tests__/healthcare/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/apps/web/components/**/*.healthcare.test.{js,jsx,ts,tsx}',
    '<rootDir>/apps/web/app/**/*.healthcare.test.{js,jsx,ts,tsx}'
  ],
  
  // Coverage thresholds for healthcare quality (≥90%)
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Healthcare-specific higher thresholds
    'apps/web/components/patient/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'apps/web/lib/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'apps/web/lib/services/': {
      branches: 92,
      functions: 92,
      lines: 92,
      statements: 92
    }
  },
  
  // Coverage reporting for healthcare compliance
  collectCoverageFrom: [
    'apps/web/components/**/*.{js,jsx,ts,tsx}',
    'apps/web/lib/**/*.{js,jsx,ts,tsx}',
    'apps/web/app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.config.{js,ts}',
    '!**/coverage/**'
  ],
  
  // Healthcare test setup
  setupFilesAfterEnv: [
    '<rootDir>/apps/web/__tests__/healthcare/setup/healthcare-test-setup.ts'
  ],
  
  // Module name mapping for healthcare imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@/components/(.*)$': '<rootDir>/apps/web/components/$1',
    '^@/lib/(.*)$': '<rootDir>/apps/web/lib/$1',
    '^@/app/(.*)$': '<rootDir>/apps/web/app/$1',
    '^@/types/(.*)$': '<rootDir>/apps/web/types/$1',
    '^@/utils/(.*)$': '<rootDir>/apps/web/utils/$1'
  },
  
  // Transform configuration for healthcare components
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Module file extensions for healthcare testing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Healthcare test timeout (patient safety consideration)
  testTimeout: 10000,
  
  // Verbose reporting for healthcare audit trails
  verbose: true,
  
  // Healthcare-specific global variables
  globals: {
    'HEALTHCARE_TEST_MODE': true,
    'PATIENT_DATA_PROTECTION': true,
    'LGPD_COMPLIANCE_REQUIRED': true,
    'ANVISA_COMPLIANCE_REQUIRED': true,
    'CFM_COMPLIANCE_REQUIRED': true
  },
  
  // Error on deprecated APIs (healthcare quality standards)
  errorOnDeprecated: true,
  
  // Clear mocks between tests (patient data protection)
  clearMocks: true,
  
  // Restore mocks after each test (healthcare security)
  restoreMocks: true,
  
  // Healthcare-specific reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/healthcare',
        filename: 'healthcare-test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: '🏥 NeonPro Healthcare Test Report'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage/healthcare',
        outputName: 'healthcare-junit.xml',
        suiteName: 'NeonPro Healthcare Tests'
      }
    ]
  ]
}

// Create and export the configuration
module.exports = createJestConfig(healthcareJestConfig)