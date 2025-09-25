import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

/**
 * Standardized Vitest Base Configuration for NEONPRO TDD Compliance
 *
 * TDD Principles Enforced:
 * - No empty test suites (passWithNoTests: false)
 * - Mandatory coverage thresholds (80% minimum)
 * - Consistent testing environment
 * - Proper mocking strategy (vi.mock only)
 */

export interface VitestBaseOptions {
  /** Package name for configuration customization */
  packageName?: string
  /** Custom coverage thresholds (overrides defaults) */
  coverageThresholds?: {
    branches?: number
    functions?: number
    lines?: number
    statements?: number
  }
  /** Additional test environment setup */
  setupFiles?: string[]
  /** Custom exclude patterns for coverage */
  coverageExclude?: string[]
}

export const createVitestConfig = (options: VitestBaseOptions = {}) => {
  const {
    packageName = '',
    coverageThresholds = {},
    setupFiles = [],
    coverageExclude = [],
  } = options

  // Default coverage thresholds aligned with TDD quality standards
  const defaultThresholds = {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
    ...coverageThresholds,
  }

  // Standard exclude patterns for healthcare applications
  const defaultExclude = [
    'node_modules/**',
    'dist/',
    'build/',
    '**/*.d.ts',
    '**/*.config.ts',
    '**/*.config.js',
    '**/types/**',
    '**/interfaces/**',
    '**/constants/**',
    ...coverageExclude,
  ]

  return defineConfig({
    test: {
      // TDD Compliance: Tests must exist and drive development
      passWithNoTests: false,

      // Standard test environment
      environment: 'node',
      globals: false,

      // Setup files for test environment
      setupFiles: [
        ...(packageName
          ? [
            resolve(
              __dirname,
              '..',
              '..',
              'tests',
              'setup/',
              `${packageName}.setup.ts`,
            ),
          ]
          : []),
        ...setupFiles,
      ],

      // Coverage configuration with TDD quality gates
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: defaultExclude,
        thresholds: {
          global: defaultThresholds,
        },
        // Clean coverage directory before runs
        clean: true,
        // Include all source files in coverage
        include: ['src/**/*.{ts,js,tsx,jsx}'],
      },

      // Mocking strategy - enforce vi.mock usage
      mockReset: true,
      restoreMocks: true,

      // Test timeout for healthcare validation scenarios
      testTimeout: 10000,

      // Hook timeout for async setup
      hookTimeout: 10000,

      // Verbose output for better debugging
      verbose: true,
      bail: false,
    },

    // Type checking configuration
    typecheck: {
      enabled: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },

    // No additional plugins by default - keep it simple
    plugins: [],
  })
}

// Export default configuration for common use cases
export default createVitestConfig()
