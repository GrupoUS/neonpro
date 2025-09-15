import { describe, it, expect } from 'vitest'
import app from '../../app'

// Basic contract test per spec: POST /api/v1/chat/query returns 200 SSE in mock mode

describe('POST /api/v1/chat/query', () => {
  it('returns 200 and streams when MOCK_MODE=true', async () => {
    const res = await app.request('/v1/chat/query?mock=true', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'u1',
        'x-clinic-id': 'c1',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      },
      body: JSON.stringify({ question: 'mock:balance', sessionId: '6e9b5f24-7b4d-4db8-9d1b-0db6b7f5a0e0' }),
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type') || '').toContain('text/event-stream')
  })
})
