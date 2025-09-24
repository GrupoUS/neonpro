/**
 * MSW Compatibility Test for Bun Environment
 * Tests if MSW can intercept fetch requests in Bun runtime
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('MSW Compatibility with Bun', () => {
  const server = setupServer(
    http.get('http://localhost:3000/api/test', () => {
      return HttpResponse.json({ message: 'MSW is working!' })
    }),
  

  beforeAll(async () => {
    console.log('🔧 Starting MSW server...')
    server.listen({ onUnhandledRequest: 'bypass' })
    console.log('✅ MSW server started')
  }

  afterAll(() => {
    console.log('🛑 Stopping MSW server...')
    server.close()
  }

  it('should intercept fetch requests', async () => {
    console.log('🧪 Testing MSW interception...')

    try {
      const response = await fetch('http://localhost:3000/api/test')
      const data = await response.json()

      console.log('📡 Response received:', data

      expect(response.status).toBe(200
      expect(data.message).toBe('MSW is working!')
    } catch (error) {
      console.error('❌ Fetch failed:', error
      throw error;
    }
  }, { timeout: 5000 }

  it('should handle non-mocked requests appropriately', async () => {
    try {
      // This should bypass MSW and potentially fail or succeed based on actual network
      const response = await fetch('http://localhost:3000/api/nonexistent')

      // We don't assert anything specific here, just want to see the behavior
      expect(response).toBeDefined()
    } catch (error) {
      // This is expected for non-existent endpoints
      expect(error).toBeDefined()
    }
  }, { timeout: 5000 }
}
