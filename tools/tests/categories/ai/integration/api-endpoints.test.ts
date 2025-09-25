/**
 * RED PHASE TESTS - API Endpoints
 * 
 * Tests for AI API routes, CopilotKit bridge, and security middleware
 * Following TDD methodology - these tests should FAIL initially
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Hono } from 'hono'
import { supabase } from '@neonpro/database'
import chatRoutes from '../../../../../apps/api/src/routes/chat'

// Mock dependencies
vi.mock('@neonpro/database')
vi.mock('../../../../../apps/api/src/config/ai', () => ({
  DEFAULT_PRIMARY: 'gpt-4',
  streamWithFailover: vi.fn(),
  generateWithFailover: vi.fn(),
}))

const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
}

vi.mocked(supabase).mockImplementation(() => mockSupabase as any)

describe('AI API Integration - Endpoints', () => {
  let app: Hono
  let mockStreamWithFailover: any
  let mockGenerateWithFailover: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Import mocked functions
    const aiConfig = require('../../../../../apps/api/src/config/ai')
    mockStreamWithFailover = aiConfig.streamWithFailover
    mockGenerateWithFailover = aiConfig.generateWithFailover

    // Setup mock implementations
    mockStreamWithFailover.mockResolvedValue({
      body: {
        getReader: () => ({
          read: vi.fn().mockResolvedValue({ 
            done: false, 
            value: new TextEncoder().encode('Test response chunk') 
          }),
        }),
      },
      headers: new Map([['X-Chat-Model', 'gpt-4']]),
    })

    mockGenerateWithFailover.mockResolvedValue({
      text: 'Generated explanation',
      usage: { total_tokens: 50 },
    })

    // Create test app
    app = new Hono()
    app.route('/chat', chatRoutes)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('POST /chat/query', () => {
    it('should accept valid query requests', async () => {
      const payload = {
        question: 'What treatments are available for acne?',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-clinic-id': 'clinic001',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toContain('text/event-stream')
      expect(response.headers.get('X-Chat-Model')).toBe('gpt-4')
    })

    it('should validate request schema', async () => {
      const invalidPayload = {
        question: '', // Empty question
        sessionId: 'invalid-uuid', // Invalid UUID
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(invalidPayload),
      })

      expect(response.status).toBe(400)
    })

    it('should enforce rate limiting', async () => {
      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'rate_limited_user',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      // Make requests rapidly to trigger rate limit
      const responses = await Promise.all(
        Array.from({ length: 15 }, () => 
          app.request('/chat/query', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          })
        )
      )

      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('should require valid role and consent', async () => {
      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const testCases = [
        {
          headers: {
            'x-user-id': 'user123',
            'x-role': 'INVALID_ROLE',
            'x-consent': 'true',
          },
          expectedStatus: 403,
        },
        {
          headers: {
            'x-user-id': 'user123',
            'x-role': 'CLINICAL_STAFF',
            'x-consent': 'false',
          },
          expectedStatus: 403,
        },
        {
          headers: {
            'x-user-id': 'user123',
            'x-role': 'CLINICAL_STAFF',
            // Missing consent header
          },
          expectedStatus: 403,
        },
      ]

      for (const testCase of testCases) {
        const response = await app.request('/chat/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...testCase.headers,
          },
          body: JSON.stringify(payload),
        })

        expect(response.status).toBe(testCase.expectedStatus)
      }
    })

    it('should handle mock mode for testing', async () => {
      const payload = {
        question: 'mock:balance',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query?mock=true', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('X-Chat-Model')).toBe('mock:model')
    })

    it('should classify query types correctly', async () => {
      const testQueries = [
        { query: 'tratamento com botox', expectedType: 'treatment' },
        { query: 'saldo da minha conta', expectedType: 'finance' },
        { query: 'tratamento e pagamento', expectedType: 'mixed' },
        { query: 'como funciona o sistema', expectedType: 'other' },
      ]

      for (const { query, expectedType } of testQueries) {
        const payload = {
          question: query,
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
        }

        const headers = {
          'Content-Type': 'application/json',
          'x-user-id': 'user123',
          'x-role': 'CLINICAL_STAFF',
          'x-consent': 'true',
        }

        await app.request('/chat/query?mock=true', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })

        // Check that audit logging would capture the correct query type
        // This would be verified through mock calls to the audit log
      }
    })

    it('should handle AI service failures gracefully', async () => {
      mockStreamWithFailover.mockRejectedValue(new Error('AI service unavailable'))

      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(500)
    })

    it('should audit all query attempts', async () => {
      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-clinic-id': 'clinic001',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // Verify audit log was called
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_audit_events')
    })
  })

  describe('GET /chat/session/:id', () => {
    it('should retrieve existing session information', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user123'

      const mockSessionData = {
        id: sessionId,
        user_id: userId,
        clinic_id: 'clinic001',
        started_at: '2024-01-20T10:00:00Z',
        last_activity_at: '2024-01-20T10:30:00Z',
        locale: 'pt-BR',
      }

      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: mockSessionData, 
          error: null 
        }),
      }

      mockSupabase.from.mockReturnValue(mockTableBuilder)

      const response = await app.request(`/chat/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe(sessionId)
      expect(data.locale).toBe('pt-BR')
    })

    it('should create new session if not found', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      const userId = 'user123'
      const clinicId = 'clinic001'

      // Session not found
      const mockTableBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        }),
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: sessionId,
            user_id: userId,
            clinic_id: clinicId,
            started_at: '2024-01-20T10:00:00Z',
            last_activity_at: '2024-01-20T10:00:00Z',
            locale: 'pt-BR',
          },
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockTableBuilder)

      const response = await app.request(`/chat/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'x-clinic-id': clinicId,
        },
      })

      expect(response.status).toBe(200)
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_chat_sessions')
    })

    it('should handle mock fallback for sessions', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'

      const response = await app.request(`/chat/session/${sessionId}?mock=true`, {
        method: 'GET',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe(sessionId)
      expect(data.startedAt).toBeDefined()
      expect(data.lastActivityAt).toBeDefined()
    })
  })

  describe('POST /chat/explanation', () => {
    it('should generate explanations with LGPD safeguards', async () => {
      const payload = {
        text: 'O paciente foi diagnosticado com acne vulgaris grau II. Recomendamos tratamento com tretinoina 0.05%.',
        locale: 'pt-BR',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/explanation', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.explanation).toBeDefined()
      expect(data.traceId).toBeDefined()
    })

    it('should redact PII from input text', async () => {
      const payload = {
        text: 'Paciente João Silva, CPF: 123.456.789-00, telefone: 11987654321, email: joao@email.com',
        locale: 'pt-BR',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/explanation?mock=true', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // The explanation should not contain the original PII
      expect(data.explanation).not.toContain('123.456.789-00')
      expect(data.explanation).not.toContain('11987654321')
      expect(data.explanation).not.toContain('joao@email.com')
    })

    it('should validate explanation request payload', async () => {
      const invalidPayload = {
        text: '', // Empty text
        locale: 'invalid-locale',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/explanation', {
        method: 'POST',
        headers,
        body: JSON.stringify(invalidPayload),
      })

      expect(response.status).toBe(422)
    })

    it('should require consent for explanations', async () => {
      const payload = {
        text: 'Test explanation text',
        locale: 'pt-BR',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'false', // Invalid consent
      }

      const response = await app.request('/chat/explanation', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(403)
    })

    it('should handle different locales', async () => {
      const testCases = [
        { locale: 'pt-BR', expectedPrefix: 'Explicação:' },
        { locale: 'en-US', expectedPrefix: 'Explanation:' },
      ]

      for (const { locale, expectedPrefix } of testCases) {
        const payload = {
          text: 'Test medical term explanation',
          locale,
        }

        const headers = {
          'Content-Type': 'application/json',
          'x-user-id': 'user123',
          'x-role': 'CLINICAL_STAFF',
          'x-consent': 'true',
        }

        const response = await app.request('/chat/explanation?mock=true', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.explanation).toContain(expectedPrefix)
      }
    })

    it('should audit explanation requests', async () => {
      const payload = {
        text: 'Test explanation',
        locale: 'pt-BR',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-clinic-id': 'clinic001',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      await app.request('/chat/explanation', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('ai_audit_events')
    })
  })

  describe('GET /chat/suggestions', () => {
    it('should return locale-specific suggestions', async () => {
      const testCases = [
        { 
          locale: 'pt-BR', 
          expectedSuggestions: [
            'Quais foram os últimos tratamentos do paciente?',
            'Resumo financeiro do paciente',
            'Agendar retorno para avaliação clínica',
          ]
        },
        { 
          locale: 'en-US', 
          expectedSuggestions: [
            "What were the patient's most recent treatments?",
            'Patient financial summary',
            'Schedule a follow-up appointment',
          ]
        },
      ]

      for (const { locale, expectedSuggestions } of testCases) {
        const response = await app.request(`/chat/suggestions?locale=${locale}`, {
          method: 'GET',
        })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.suggestions).toEqual(expectedSuggestions)
        expect(data.locale).toBe(locale)
      }
    })

    it('should handle optional session ID parameter', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      
      const response = await app.request(`/chat/suggestions?sessionId=${sessionId}`, {
        method: 'GET',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.sessionId).toBe(sessionId)
      expect(data.suggestions).toBeDefined()
    })

    it('should default to pt-BR locale', async () => {
      const response = await app.request('/chat/suggestions', {
        method: 'GET',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.locale).toBe('pt-BR')
      expect(data.suggestions).toContain('tratamentos do paciente')
    })
  })

  describe('GET /chat/health', () => {
    it('should return health status', async () => {
      const response = await app.request('/chat/health', {
        method: 'GET',
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.status).toBe('ok')
      expect(data.route).toBe('chat.query')
    })
  })

  describe('Security Middleware', () => {
    it('should enforce content type validation', async () => {
      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      // Send with invalid content type
      const response = await app.request('/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // Invalid content type
          'x-user-id': 'user123',
          'x-role': 'CLINICAL_STAFF',
          'x-consent': 'true',
        },
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(400)
    })

    it('should validate request size limits', async () => {
      // Create a very large query (over 4000 characters)
      const largeQuery = 'x'.repeat(5000)
      const payload = {
        question: largeQuery,
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(400)
    })

    it('should sanitize request headers', async () => {
      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user<script>alert(1)</script>123', // XSS attempt
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // Should either sanitize the header or reject the request
      expect([200, 400]).toContain(response.status)
    })

    it('should handle CORS preflight requests', async () => {
      const response = await app.request('/chat/query', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      })

      expect([200, 204]).toContain(response.status)
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(500)
    })

    it('should handle malformed JSON payloads', async () => {
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: 'invalid json{',
      })

      expect(response.status).toBe(400)
    })

    it('should handle unexpected errors gracefully', async () => {
      // Mock an unexpected error
      const originalEnv = process.env
      process.env.AI_AUDIT_DB = 'true'
      
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const payload = {
        question: 'Test question',
        sessionId: '123e4567-e89b-12d3-a456-426614174000',
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'user123',
        'x-role': 'CLINICAL_STAFF',
        'x-consent': 'true',
      }

      const response = await app.request('/chat/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      expect(response.status).toBe(500)
      
      // Restore environment
      process.env = originalEnv
    })
  })
})