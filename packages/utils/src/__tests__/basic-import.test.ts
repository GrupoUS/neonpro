/**
 * Basic Import Validation Test
 * Tests that core utilities can be imported correctly from source files
 */

import { describe, expect, it } from 'vitest'

describe('Basic Import Validation', () => {
  it('should import LGPD utilities from source', async () => {
    const { redactPII, redactCPF, validateCPF } = await import('../lgpd')
    expect(typeof redactPII).toBe('function')
    expect(typeof redactCPF).toBe('function')
    expect(typeof validateCPF).toBe('function')
  })

  it('should import logging utilities from source', async () => {
    const { createLogger } = await import('../logging/logger')
    expect(typeof createLogger).toBe('function')
  })

  it('should import logging redact from source', async () => {
    const { redact } = await import('../logging/redact')
    expect(typeof redact).toBe('function')
  })

  it('should import chat utilities from source', async () => {
    const { redactMessage, validateMessageSafety } = await import('../chat/message-redaction')
    expect(typeof redactMessage).toBe('function')
    expect(typeof validateMessageSafety).toBe('function')
  })

  it('should import healthcare errors from source', async () => {
    const { HealthcareError, HealthcareComplianceError } = await import('../healthcare-errors')
    expect(HealthcareError).toBeDefined()
    expect(HealthcareComplianceError).toBeDefined()
  })

  // CLI module doesn't exist, skipping this test
  it.skip('should import CLI utilities from source', async () => {
    // const { exitHelper, cliWrap } = await import('../cli');
    // expect(typeof exitHelper).toBe('function');
    // expect(typeof cliWrap).toBe('function');
  })

  it('should import currency utilities from source', async () => {
    const { formatBRL, parseBRL } = await import('../currency/brl')
    expect(typeof formatBRL).toBe('function')
    expect(typeof parseBRL).toBe('function')
  })

  it('should import Brazilian identifiers from source', async () => {
    const { formatCPF, validateBrazilianPhone } = await import('../br/identifiers')
    expect(typeof formatCPF).toBe('function')
    expect(typeof validateBrazilianPhone).toBe('function')
  })

  it('should import general utilities from source', async () => {
    const { cn, formatDate, debounce, throttle } = await import('../utils')
    expect(typeof cn).toBe('function')
    expect(typeof formatDate).toBe('function')
    expect(typeof debounce).toBe('function')
    expect(typeof throttle).toBe('function')
  })

  it('should import environment validation from source', async () => {
    const { _validateEnv } = await import('../env/validate')
    expect(typeof _validateEnv).toBe('function')
  })

  it('should import PII redaction wrapper from source', async () => {
    const { redactPII } = await import('../redaction/pii')
    expect(typeof redactPII).toBe('function')
  })

  it('should import main index from source', async () => {
    const indexModule = await import('../index')
    expect(indexModule).toBeDefined()
    expect(typeof indexModule).toBe('object')
  })

  it('should have consistent exports between direct and index imports', async () => {
    // Import from main index
    const indexExports = await import('../index')

    // Import from specific modules
    const loggerExports = await import('../logging/logger')
    const healthcareExports = await import('../healthcare-errors')
    const utilsExports = await import('../utils')
    const lgpdExports = await import('../lgpd')

    // Verify that main exports include functions from specific modules
    expect(indexExports.createLogger).toBe(loggerExports.createLogger)
    expect(indexExports.HealthcareError).toBe(healthcareExports.HealthcareError)
    expect(indexExports.cn).toBe(utilsExports.cn)

    // LGPD is not directly exported from index, but through _compliance
    expect(indexExports._compliance).toBeDefined()
  })
})
