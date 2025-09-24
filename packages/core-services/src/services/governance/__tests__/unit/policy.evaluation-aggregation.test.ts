import { describe, expect, it } from 'vitest'
import { InMemoryPolicyService } from '../../index'

describe('Policy evaluation aggregation', () => {
  const svc = new InMemoryPolicyService()

  it('aggregates rule results into final status', async () => {
    await svc.register({
      id: 'POL-1',
      name: 'Encryption Policy',
      rules: [
        { id: 'RULE-1', type: 'boolean', evaluate: () => true },
        { id: 'RULE-2', type: 'boolean', evaluate: () => false },
      ],
    })
    const result = await svc.evaluate('POL-1')
    expect(result.total).toBe(2)
    expect(result.passed).toBe(1)
    expect(result.status).toBe('partial')
  })
})
