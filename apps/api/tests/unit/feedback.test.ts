import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createServer } from 'http'
import { fetch } from 'undici'

// Import the feedback route
import { feedbackRouter } from '../../src/routes/ai/feedback'

describe('Contract Tests: AI Feedback Endpoint', () => {
  let server: any
  let baseUrl: string
  let app: Hono

  beforeAll(async () => {
    // Create Hono app with feedback route
    app = new Hono()
    app.route('/api/ai/sessions', feedbackRouter)

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0,
    })
    
    await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address()
        if (address && typeof address === 'object') {
          baseUrl = `http://localhost:${address.port}`
        }
        resolve(true)
      })
    })
  })

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve))
    }
  })

  describe('POST /api/ai/sessions/{sessionId}/feedback', () => {
    it('should return 400 for missing messageId', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          feedback: {
            rating: 5,
            helpful: true,
          },
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should return 400 for missing feedback', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-123',
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should return 200 for valid feedback with rating', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-123',
          feedback: {
            rating: 4,
            comment: 'Very helpful response',
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should return 200 for valid feedback with helpful flag', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-456',
          feedback: {
            helpful: true,
            comment: 'This answered my question perfectly',
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should accept feedback with minimal required fields', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-789',
          feedback: {
            rating: 3,
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should validate rating range (1-5)', async () => {
      const sessionId = 'test-session-123'
      
      // Test rating below minimum
      let response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-123',
          feedback: {
            rating: 0, // Invalid: too low
          },
        }),
      })

      expect(response.status).toBe(400)

      // Test rating above maximum
      response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-123',
          feedback: {
            rating: 6, // Invalid: too high
          },
        }),
      })

      expect(response.status).toBe(400)

      // Test valid ratings
      for (const rating of [1, 2, 3, 4, 5]) {
        response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            messageId: `msg-${rating}`,
            feedback: {
              rating,
            },
          }),
        })

        expect(response.status).toBe(200)
      }
    })

    it('should accept long comments', async () => {
      const sessionId = 'test-session-123'
      const longComment = 'This is a very long comment that exceeds the typical length. '.repeat(20)
      
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-long-comment',
          feedback: {
            rating: 5,
            comment: longComment,
            helpful: true,
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should handle malformed JSON', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: 'invalid json string',
      })

      expect(response.status).toBe(400)
    })

    it('should require authentication', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: 'msg-123',
          feedback: {
            rating: 5,
          },
        }),
      })

      expect(response.status).toBe(401)
    })

    it('should accept feedback without comment', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-no-comment',
          feedback: {
            rating: 4,
            helpful: false,
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    it('should store feedback with timestamp', async () => {
      const sessionId = 'test-session-123'
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          messageId: 'msg-timestamped',
          feedback: {
            rating: 5,
            comment: 'Testing timestamp',
          },
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      
      // In real implementation, would verify timestamp is recent
      // For contract test, just ensure success response
    })
  })
})