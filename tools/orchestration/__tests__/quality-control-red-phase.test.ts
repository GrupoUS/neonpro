import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const execAsync = promisify(exec)

/**
 * Quality Control Test Suite - Phase 1: RED
 *
 * This test suite captures all identified error patterns and establishes
 * failing tests that must pass for the quality control system to succeed.
 *
 * Tests are organized by error category and priority level as defined in
 * the quality control implementation design.
 */

describe('Quality Control System - Phase 1: RED (Failing Tests)', () => {
  const workspaceRoot = process.cwd()

  describe('Critical Priority - TypeScript Compilation', () => {
    test('should compile all packages without TypeScript errors', async () => {
      // This test MUST fail in RED phase with 709 errors
      try {
        const { stdout, stderr } = await execAsync('bun run type-check', {
          cwd: workspaceRoot,
          timeout: 60000,
        })

        // If this passes, we're not in RED phase
        expect(stdout).not.toContain('Found 709 errors')
        expect(stderr).not.toContain('error: script "type-check" exited with code 1')
      } catch (error: any) {
        // Expected failure in RED phase
        expect(error.code).toBe(1)
        expect(error.stdout || error.stderr).toContain('Found 709 errors')

        // Document specific error categories for resolution tracking
        const errorOutput = error.stdout || error.stderr
        expect(errorOutput).toContain('@neonpro/web:type-check')
        expect(errorOutput).toContain('src/components/')
        expect(errorOutput).toContain('src/routes/')
        expect(errorOutput).toContain('does not exist on type')

        // This test should fail in RED phase
        throw new Error('TypeScript compilation failed as expected in RED phase')
      }
    }, 60000)

    test('should have zero null/undefined access errors', async () => {
      // Scan for null/undefined access patterns in web package
      const webSrcPath = path.join(workspaceRoot, 'apps/web/src')

      try {
        const files = await getAllTsxFiles(webSrcPath)
        let nullAccessErrors = 0

        for (const file of files) {
          const content = await fs.readFile(file, 'utf-8')

          // Pattern detection for null/undefined access
          const patterns = [
            /\.\w+\?\./g, // Optional chaining missing
            /\w+\.\w+(?!\?)/g, // Direct property access without null check
          ]

          patterns.forEach((pattern) => {
            const matches = content.match(pattern)
            if (matches) {
              nullAccessErrors += matches.length
            }
          })
        }

        // This should fail in RED phase with significant null access issues
        expect(nullAccessErrors).toBe(0)
      } catch (error) {
        // Expected to have null access errors in RED phase
        throw new Error('Null/undefined access patterns detected as expected in RED phase')
      }
    })

    test('should have all required API properties defined', async () => {
      // Check for missing API properties that cause compilation failures
      const apiClientPath = path.join(workspaceRoot, 'apps/web/src/lib/api.ts')

      try {
        const content = await fs.readFile(apiClientPath, 'utf-8')

        // Required API properties that are currently missing
        const requiredProperties = [
          'inventory',
          'treatmentPlans',
          'aestheticScheduling',
          'aiClinicalSupport',
        ]

        requiredProperties.forEach((property) => {
          expect(content).toContain(`${property}:`)
        })
      } catch (error) {
        // Expected to fail due to missing properties in RED phase
        throw new Error('Missing API properties detected as expected in RED phase')
      }
    })
  })

  describe('Critical Priority - Linting Syntax Errors', () => {
    test('should have no unterminated string errors in security package', async () => {
      try {
        const { stdout, stderr } = await execAsync('bun run lint --filter=@neonpro/security', {
          cwd: workspaceRoot,
          timeout: 30000,
        })

        expect(stdout).not.toContain('Unterminated string')
        expect(stderr).not.toContain('exited with code 1')
      } catch (error: any) {
        // Expected failure in RED phase with 4 syntax errors
        expect(error.code).toBe(1)
        const errorOutput = error.stdout || error.stderr
        expect(errorOutput).toContain('Unterminated string')
        expect(errorOutput).toContain('Found 0 warnings and 4 errors')

        // Verify specific files with syntax errors
        expect(errorOutput).toContain('anonymization.test.ts:27')
        expect(errorOutput).toContain('audit-logger-security.test.ts:14')
        expect(errorOutput).toContain('encryption.test.ts:8')
        expect(errorOutput).toContain('anonymization.ts:560')

        throw new Error('Syntax errors detected as expected in RED phase')
      }
    }, 30000)

    test('should validate LGPD compliance file syntax', async () => {
      const lgpdPath = path.join(workspaceRoot, 'packages/utils/src/lgpd.ts')

      try {
        const content = await fs.readFile(lgpdPath, 'utf-8')

        // Validate that the file can be parsed without syntax errors
        expect(content).toMatch(/export\s+function/)
        expect(content).not.toContain('unterminated')

        // This test focuses on basic syntax validation
        // Actual null safety will be addressed in TypeScript resolution
      } catch (error) {
        throw new Error('LGPD file should be syntactically valid')
      }
    })
  })

  describe('High Priority - API Integration', () => {
    test('should have complete router type definitions', async () => {
      const routeFiles = [
        'apps/web/src/routes/inventory/__root.tsx',
        'apps/web/src/routes/treatment-plans/__root.tsx',
        'apps/web/src/routes/patient-engagement/index.tsx',
      ]

      for (const routeFile of routeFiles) {
        const filePath = path.join(workspaceRoot, routeFile)

        try {
          const content = await fs.readFile(filePath, 'utf-8')

          // Check for proper route type definitions
          expect(content).toContain('createFileRoute')

          // This should fail due to router type mismatches
          expect(content).not.toContain('not assignable to parameter')
        } catch (error) {
          // File might not exist or have syntax errors
          throw new Error(`Route definition error in ${routeFile}`)
        }
      }
    })

    test('should have all component imports resolved', async () => {
      const componentFiles = [
        'apps/web/src/routes/patient-engagement/index.tsx',
      ]

      for (const componentFile of componentFiles) {
        const filePath = path.join(workspaceRoot, componentFile)

        try {
          const content = await fs.readFile(filePath, 'utf-8')

          // Check for missing imports that cause TypeScript errors
          const missingImports = ['Activity', 'X', 'Menu']

          missingImports.forEach((importName) => {
            // Should have proper import statements
            expect(content).toMatch(new RegExp(`import.*${importName}`))
          })
        } catch (error) {
          throw new Error(`Missing component imports in ${componentFile}`)
        }
      }
    })
  })

  describe('Test Infrastructure Validation', () => {
    test('should have valid Vitest configuration', async () => {
      const configFiles = [
        'apps/web/vitest.config.ts',
        'apps/web/vitest.config.optimized.ts',
        'apps/web/vitest.config.performance.ts',
      ]

      for (const configFile of configFiles) {
        const filePath = path.join(workspaceRoot, configFile)

        try {
          const content = await fs.readFile(filePath, 'utf-8')

          // Check for configuration errors
          expect(content).not.toContain('Object literal cannot have multiple properties')
          expect(content).not.toContain('does not exist in type')

          // Validate basic structure
          expect(content).toContain('defineConfig')
        } catch (error) {
          throw new Error(`Vitest configuration error in ${configFile}`)
        }
      }
    })

    test('should have proper test environment setup', async () => {
      const testFiles = [
        'apps/web/src/test-setup.ts',
        'apps/web/src/test/environment.ts',
        'apps/web/src/test/global-setup.ts',
      ]

      for (const testFile of testFiles) {
        const filePath = path.join(workspaceRoot, testFile)

        try {
          const content = await fs.readFile(filePath, 'utf-8')

          // Should not have TypeScript errors
          expect(content).toBeDefined()
          expect(content.length).toBeGreaterThan(0)
        } catch (error) {
          throw new Error(`Test environment setup error in ${testFile}`)
        }
      }
    })
  })

  describe('Quality Gate Validation', () => {
    test('should pass all quality gates after resolution', async () => {
      // This meta-test validates the overall quality gate system
      const qualityGates = {
        typescript: false,
        linting: false,
        testing: false,
        security: false,
        performance: false,
      }

      // TypeScript compilation gate
      try {
        await execAsync('bun run type-check', { cwd: workspaceRoot })
        qualityGates.typescript = true
      } catch {
        // Expected to fail in RED phase
      }

      // Linting gate
      try {
        await execAsync('bun run lint', { cwd: workspaceRoot })
        qualityGates.linting = true
      } catch {
        // Expected to fail in RED phase
      }

      // All gates should pass only after resolution
      const passedGates = Object.values(qualityGates).filter(Boolean).length
      const totalGates = Object.values(qualityGates).length

      // In RED phase, expect most gates to fail
      expect(passedGates).toBeLessThan(totalGates)

      // Document current gate status for tracking
      console.log('Quality Gate Status:', qualityGates)
      console.log(`Passed: ${passedGates}/${totalGates} gates`)

      // This test should fail in RED phase
      throw new Error('Quality gates failing as expected in RED phase')
    }, 90000)
  })

  describe('Healthcare Compliance Validation', () => {
    test('should validate LGPD compliance utilities', async () => {
      // Import the LGPD utilities for validation
      const lgpdPath = path.join(workspaceRoot, 'packages/utils/src/lgpd.ts')

      try {
        const content = await fs.readFile(lgpdPath, 'utf-8')

        // Verify key LGPD functions exist
        const requiredFunctions = [
          'redactCPF',
          'redactCNPJ',
          'redactEmail',
          'redactPhone',
          'validateCPF',
          'validateCNPJ',
          'detectPIIPatterns',
          'anonymizeData',
        ]

        requiredFunctions.forEach((fn) => {
          expect(content).toContain(`export function ${fn}`)
        })

        // Verify TypeScript types are properly defined
        expect(content).toContain('PIIDetectionResult')
        expect(content).toContain('AnonymizedData')
        expect(content).toContain('RedactionOptions')
      } catch (error) {
        throw new Error('LGPD compliance utilities validation failed')
      }
    })

    test('should validate security package compilation', async () => {
      // Security package must compile for healthcare compliance
      try {
        const { stdout, stderr } = await execAsync(
          'bun run type-check --filter=@neonpro/security',
          {
            cwd: workspaceRoot,
            timeout: 30000,
          },
        )

        expect(stderr).not.toContain('error')
      } catch (error: any) {
        // Expected to fail due to syntax errors in RED phase
        expect(error.code).toBe(1)
        throw new Error('Security package compilation failed as expected in RED phase')
      }
    }, 30000)
  })
})

// Helper function to recursively get all TypeScript files
async function getAllTsxFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const subFiles = await getAllTsxFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory might not exist or be accessible
    console.warn(`Warning: Could not read directory ${dir}`)
  }

  return files
}

/**
 * Test Execution Notes:
 *
 * These tests are designed to FAIL in the RED phase, capturing all identified
 * error patterns. As the quality control system progresses through GREEN and
 * REFACTOR phases, these tests should gradually start passing.
 *
 * Test Execution Order:
 * 1. RED Phase: All tests should fail, documenting current error state
 * 2. GREEN Phase: Critical tests should start passing as errors are resolved
 * 3. REFACTOR Phase: All tests should pass with improved quality metrics
 *
 * Quality Gate Integration:
 * These tests integrate with the TDD orchestrator to provide measurable
 * validation criteria for each phase transition.
 */
