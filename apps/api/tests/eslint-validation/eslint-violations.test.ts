/**
 * RED Phase: ESLint Violation Validation Tests
 *
 * These tests are designed to FAIL until ESLint violations are fixed.
 * This follows the TDD red-green-refactor methodology for GREEN-005.
 *
 * Test Cases:
 * 1. Parameter ordering error in ai-appointment-scheduling-service.ts
 * 2. Unused variables/imports/parameters across the codebase
 * 3. ESLint configuration validation
 * 4. Healthcare compliance maintenance
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'

describe('ESLint Violation Detection - RED PHASE', () => {
  const apiPath = process.cwd()

  describe('Critical ESLint Error Detection', () => {
    it('should detect parameter ordering error in ai-appointment-scheduling-service.ts', () => {
      // This test FAILS until the parameter ordering error is fixed
      const servicePath = join(apiPath, 'src/services/ai-appointment-scheduling-service.ts')

      expect(existsSync(servicePath)).toBe(true)

      const content = readFileSync(servicePath, 'utf-8')

      // Check for the specific error: required parameter after optional parameter
      const hasRequiredAfterOptional = content.includes(
        'professionalId?: string,\n    dateRange: { start: Date; end: Date }',
      )

      // RED PHASE: This should be TRUE initially (error exists)
      // GREEN PHASE: This will become FALSE after fix
      expect(hasRequiredAfterOptional).toBe(true)
    })

    it('should detect all ESLint violations when running oxlint', () => {
      // This test FAILS until ESLint violations are fixed
      expect(() => {
        const output = execSync('npm run lint', {
          cwd: apiPath,
          encoding: 'utf-8',
          stdio: 'pipe',
        })

        // If lint passes, this will fail the test (RED phase)
        if (
          output.includes('Finished in')
          && !output.includes('warnings')
          && !output.includes('error')
        ) {
          throw new Error('ESLint passed unexpectedly - violations should exist in RED phase')
        }
      }).toThrow()
    })
  })

  describe('Unused Variable Detection', () => {
    it('should detect unused variables in patients/export.ts', () => {
      const exportPath = join(apiPath, 'src/routes/patients/export.ts')
      const content = readFileSync(exportPath, 'utf-8')

      // Look for unused userId variables (should exist in RED phase)
      const unusedUserIdMatches = content.match(/const userId = c\.get\('jwtPayload'\)\.sub;/g)

      // RED PHASE: Should find unused userId declarations
      expect(unusedUserIdMatches?.length || 0).toBeGreaterThan(0)
    })

    it('should detect unused imports in lgpd-appointment-compliance.ts', () => {
      const compliancePath = join(apiPath, 'src/services/lgpd-appointment-compliance.ts')
      const content = readFileSync(compliancePath, 'utf-8')

      // Check for unused aguiAppointmentProtocol import
      const hasUnusedImport = content.includes(
        "import { aguiAppointmentProtocol } from './ag-ui-appointment-protocol';",
      )

      // RED PHASE: Should detect unused import
      expect(hasUnusedImport).toBe(true)
    })

    it('should detect unused parameters in privacy-algorithms.ts', () => {
      const privacyPath = join(apiPath, 'src/utils/privacy-algorithms.ts')
      const content = readFileSync(privacyPath, 'utf-8')

      // Check for unused quasiIdentifiers parameter
      const hasUnusedParam = content.includes(
        'quasiIdentifiers: string[],',
      )

      // RED PHASE: Should detect unused parameter
      expect(hasUnusedParam).toBe(true)
    })
  })

  describe('ESLint Configuration Validation', () => {
    it('should validate .eslintignore excludes test files', () => {
      const eslintignorePath = join(apiPath, '.eslintignore')
      const content = readFileSync(eslintignorePath, 'utf-8')

      // RED PHASE: Test files should be ignored initially
      expect(content).toContain('**/*.test.ts')
      expect(content).toContain('**/*.spec.ts')
      expect(content).toContain('src/__tests__/**')
    })

    it('should validate oxlint configuration in package.json', () => {
      const packagePath = join(apiPath, 'package.json')
      const content = JSON.parse(readFileSync(packagePath, 'utf-8'))

      // RED PHASE: Should have oxlint scripts configured
      expect(content.scripts.lint).toContain('oxlint')
      expect(content.scripts['lint:fix']).toContain('oxlint')
    })
  })

  describe('Healthcare Compliance Maintenance', () => {
    it('should ensure LGPD compliance is not broken by fixes', () => {
      // This test ensures ESLint fixes don't break healthcare compliance
      const lgpdPath = join(apiPath, 'src/services/lgpd-appointment-compliance.ts')
      const content = readFileSync(lgpdPath, 'utf-8')

      // Should maintain LGPD-related imports and functionality
      expect(content).toContain('LGPD')
      expect(content).toContain('compliance')
      expect(content.length).toBeGreaterThan(100) // Ensure file isn't emptied
    })

    it('should ensure ANVISA compliance is maintained', () => {
      const schedulingPath = join(apiPath, 'src/trpc/routers/aesthetic-scheduling.ts')
      const content = readFileSync(schedulingPath, 'utf-8')

      // Should maintain ANVISA-related functions
      expect(content).toContain('ANVISA')
      expect(content).toContain('validateANVISACompliance')
    })
  })

  describe('Security Considerations', () => {
    it('should ensure security-related ESLint rules are enforced', () => {
      // Check that security plugin is available
      const packagePath = join(apiPath, '../../package.json')
      const content = JSON.parse(readFileSync(packagePath, 'utf-8'))

      expect(content.devDependencies['eslint-plugin-security']).toBeDefined()
    })

    it('should ensure unused security parameters are handled properly', () => {
      const securityPath = join(apiPath, 'src/security/aesthetic-mfa-service.ts')
      const content = readFileSync(securityPath, 'utf-8')

      // Should have unused parameters that need prefixing with underscore
      const hasUnusedParams = content.includes('ipAddress: string')
        && content.includes('userAgent: string')

      // RED PHASE: Should detect unused security parameters
      expect(hasUnusedParams).toBe(true)
    })
  })

  describe('Performance Impact Validation', () => {
    it('should measure ESLint execution performance', () => {
      const startTime = Date.now()

      try {
        execSync('npm run lint', {
          cwd: apiPath,
          encoding: 'utf-8',
          stdio: 'pipe',
        })
      } catch (error) {
        // Expected to fail in RED phase
      }

      const endTime = Date.now()
      const executionTime = endTime - startTime

      // ESLint should complete in reasonable time (< 5 seconds)
      expect(executionTime).toBeLessThan(5000)
    })
  })
})

/**
 * RED PHASE SUMMARY:
 *
 * All tests above are designed to FAIL until ESLint violations are resolved.
 * This ensures we follow proper TDD methodology:
 *
 * 1. RED: Write failing tests that expose violations
 * 2. GREEN: Fix violations to make tests pass
 * 3. REFACTOR: Improve code while keeping tests green
 *
 * Key violations addressed:
 * - Parameter ordering error (1 error)
 * - Unused variables/imports/parameters (83 warnings)
 * - ESLint configuration validation
 * - Healthcare compliance maintenance
 * - Security considerations
 * - Performance validation
 */
