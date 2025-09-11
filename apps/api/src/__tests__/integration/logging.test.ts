// T010 Logging contract test (GREEN phase base)
import { describe, it, expect } from 'vitest'
import { createLogger } from '@neonpro/utils/src/logging/logger'

describe('T010 structured logging', () => {
  it('produces required structured fields', () => {
    const logger = createLogger('api')
    const log = logger.info('test event')
    expect(log).toHaveProperty('ts')
    expect(log).toHaveProperty('level', 'info')
    expect(log).toHaveProperty('svc', 'api')
    expect(log).toHaveProperty('msg', 'test event')
  })
})


describe('T015 logger redaction', () => {
  it('redacts email and CPF values in message and extras', async () => {
    const { createLogger } = await import('../../../../../../packages/utils/src/logging/logger.ts')
    const logger = createLogger('test-redaction')

    const cpf = '123.456.789-09'
    const email = 'alice@example.com'
    const message = `Processing user ${email} with CPF ${cpf}`

    const logs: any[] = []
    // Monkey-patch console.log temporarily to capture structured log output
    const original = console.log
    try {
      // Capture only our log line
      ;(console as any).log = (...args: any[]) => {
        logs.push(args.join(' '))
      }
      logger.info(message, { email, cpf, nested: { cpf } })
    } finally {
      console.log = original
    }

    const output = logs.join('\n')
    expect(output).not.toContain(cpf)
    expect(output).not.toContain(email)
    // Generic placeholder should appear
    expect(output).toMatch(/\[REDACTED:email\]/)
    expect(output).toMatch(/\[REDACTED:cpf\]/)
  })
})
