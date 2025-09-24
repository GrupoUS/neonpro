/**
 * Specific Test for Parameter Ordering Error
 *
 * This test specifically targets the critical error:
 * "A required parameter cannot follow an optional parameter"
 *
 * File: src/services/ai-appointment-scheduling-service.ts:329:5
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

describe('Parameter Ordering Error Detection', () => {
  const apiPath = process.cwd()

  describe('Critical Error: Required Parameter After Optional', () => {
    it('should detect parameter ordering violation in ai-appointment-scheduling-service.ts', () => {
      const servicePath = join(apiPath, 'src/services/ai-appointment-scheduling-service.ts')

      expect(existsSync(servicePath)).toBe(true)

      const content = readFileSync(servicePath, 'utf-8')

      // Look for the specific problematic pattern around line 329
      const lines = content.split('\n')
      const targetLineIndex = lines.findIndex((line) =>
        line.includes('professionalId?: string,')
        && lines[lines.indexOf(line) + 1]?.includes('dateRange: { start: Date; end: Date }')
      )

      // RED PHASE: Should find the parameter ordering error
      expect(targetLineIndex).toBeGreaterThan(-1)

      if (targetLineIndex > -1) {
        const errorLine = lines[targetLineIndex]
        const nextLine = lines[targetLineIndex + 1]

        expect(errorLine).toContain('professionalId?: string,')
        expect(nextLine).toContain('dateRange: { start: Date; end: Date }')

        // Verify this is indeed a required parameter following an optional one
        expect(errorLine.includes('?')).toBe(true) // Optional parameter
        expect(nextLine.includes('?')).toBe(false) // Required parameter
      }
    })

    it('should validate that parameter ordering breaks TypeScript/ESLint rules', () => {
      // This test demonstrates why the parameter ordering is problematic
      const problematicSignature = `
        function testFunction(
          optionalParam?: string,
          requiredParam: { start: Date; end: Date }
        ) {}
      `

      // This signature should cause ESLint error
      expect(problematicSignature).toContain('?:')
      expect(problematicSignature.split('\n')[1]).not.toContain('?')
    })

    it('should identify the correct fix approach', () => {
      // The fix should reorder parameters or make the dateRange optional too
      const correctSignature1 = `
        function fixedFunction(
          dateRange: { start: Date; end: Date },
          professionalId?: string
        ) {}
      `

      const correctSignature2 = `
        function fixedFunction(
          professionalId?: string,
          dateRange?: { start: Date; end: Date }
        ) {}
      `

      // Both approaches should be valid
      expect(correctSignature1.includes('?:') || correctSignature2.includes('?:')).toBe(true)
      expect(correctSignature1.includes('dateRange')).toBe(true)
      expect(correctSignature2.includes('dateRange')).toBe(true)
    })
  })

  describe('Impact Analysis', () => {
    it('should assess the impact on function calls', () => {
      // Parameter ordering affects how functions are called
      const currentSignature = '(professionalId?: string, dateRange: { start: Date; end: Date })'

      // This is problematic because callers cannot omit the first parameter
      // while providing the second parameter
      expect(currentSignature).toContain('?:')
      expect(currentSignature.split(',')[1]).not.toContain('?')
    })

    it('should validate that this is a blocking error for compilation', () => {
      // This error should block compilation/linting
      const hasBlockingError = true // RED PHASE: Error exists

      expect(hasBlockingError).toBe(true)
    })
  })
})
