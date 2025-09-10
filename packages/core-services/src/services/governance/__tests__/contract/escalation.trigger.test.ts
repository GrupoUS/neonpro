import { describe, it, expect } from 'vitest'
import { InMemoryEscalationService } from '../../index'

describe('EscalationService.trigger (contract)', () => {
  it('returns receipt id and timestamp', async () => {
    const svc = new InMemoryEscalationService()
    const receipt = await svc.trigger({ pathId: 'ESC-001', kpiId: 'KPI-AI-HALLUCINATION', reason: 'Threshold breach' })
    expect(receipt.id).toMatch(/REC-/)
    expect(receipt.createdAt).toBeInstanceOf(Date)
  })
})
