import { describe, expect, it } from 'vitest'
import { InMemoryKPIService } from '../../index'

describe('KPIService.archive (contract)', () => {
  const svc = new InMemoryKPIService()

  it('requires rationale and sets status Archived', async () => {
    // First register the KPI
    await svc.register({
      id: 'KPI-X',
      name: 'Test KPI',
      target: 100,
      direction: 'lower-better',
    })

    const archived = await svc.archive({
      id: 'KPI-X',
      rationale: 'Replaced by KPI-Y',
    })
    expect(archived.status).toBe('Archived')
  })

  it('throws if rationale missing', async () => {
    // First register the KPI
    await svc.register({
      id: 'KPI-Y',
      name: 'Test KPI Y',
      target: 100,
      direction: 'lower-better',
    })

    // @ts-expect-error testing missing rationale
    await expect(svc.archive({ id: 'KPI-Y' })).rejects.toThrow(/rationale/i)
  })
})
