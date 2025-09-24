import { describe, expect, it } from 'vitest'
import { InMemoryEscalationService } from '../../index'

describe('EscalationService.trigger (contract)', () => {
  const svc = new InMemoryEscalationService()

  it('returns receipt id and timestamp', async () => {
    const receipt = await svc.trigger({
      pathId: 'ESC-001',
      kpiId: 'KPI-AI-HALLUCINATION',
      reason: 'Threshold breach',
    })
    expect(receipt.id).toMatch(/REC-/)
    expect(receipt.createdAt).toBeInstanceOf(Date)
  })
})
