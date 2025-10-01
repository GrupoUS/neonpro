/**
 * Simple test to verify SOLID validator functionality
 */

import { describe, it, expect } from 'vitest'
import { SOLIDPrinciplesValidator } from '../../src/analyzers/solid-principles-validator'

describe('SOLID Validator - Simple Test', () => {
  it('should create validator instance', () => {
    const validator = new SOLIDPrinciplesValidator()
    expect(validator).toBeDefined()
  })

  it('should demonstrate hard-coded values bug', async () => {
    const validator = new SOLIDPrinciplesValidator()
    
    // Call with different parameters
    const result1 = await validator.validateSRP()
    const result2 = await validator.validateSRP({
      componentPaths: ['test-path']
    })
    
    // This should fail because both results are identical (hard-coded bug)
    expect(result1).not.toEqual(result2)
    
    // But currently they are equal because of hard-coding
    expect(result1).toEqual(result2)
  })
})