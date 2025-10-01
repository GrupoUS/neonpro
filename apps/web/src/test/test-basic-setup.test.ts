import { describe, it, expect } from 'vitest'
import './test-setup' // Ensure setup file is loaded

describe('Basic Test Setup', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have healthcare globals defined', () => {
    expect(global.HEALTHCARE_TEST_MODE).toBe(true)
    expect(global.LGPD_COMPLIANCE_ENABLED).toBe(true)
  })
})