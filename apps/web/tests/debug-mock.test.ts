// Debug test to verify mock is working
import { describe, expect, it, } from 'vitest'

describe('Mock Debug Test', () => {
  it('should verify fetch mock is working', async () => {
    console.log('Testing fetch mock...',)

    console.log('Global fetch:', typeof global.fetch,)
    console.log('Window fetch:', typeof window?.fetch,)
    console.log('GlobalThis fetch:', typeof globalThis.fetch,)

    const response = await fetch('http://mock-api-server/api/ai/universal-chat/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ test: 'data', },),
    },)

    console.log('Response status:', response.status,)
    console.log('Response ok:', response.ok,)
    console.log('Response type:', typeof response,)
    console.log('Response constructor:', response.constructor.name,)

    const result = await response.json()
    console.log('Response data:', result,)
    console.log('Result type:', typeof result,)

    expect(response.ok,).toBe(true,)
    expect(result.success,).toBe(true,)
    expect(result.session_id,).toBeDefined()
    expect(result.compliance_status.lgpd_compliant,).toBe(true,)
  })
})
