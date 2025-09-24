import { describe, expect, it } from 'vitest'
import { InMemoryKPIService } from '../../index'

describe('KPI threshold breach detection', () => {
  const svc = new InMemoryKPIService()

  it('flags severity when value crosses threshold', async () => {
    await svc.register({
      id: 'KPI-LAT',
      name: 'Latency',
      target: 200,
      direction: 'lower-better',
      unit: 'ms',
    })
    const eval1 = await svc.evaluate('KPI-LAT', {
      value: 190,
      ts: new Date('2025-01-01'),
    })
    expect(eval1.status).toBe('within')
    const eval2 = await svc.evaluate('KPI-LAT', {
      value: 250,
      ts: new Date('2025-01-02'),
    })
    expect(eval2.status).toBe('breach')
    expect(eval2.delta).toBe(50)
  })
})
