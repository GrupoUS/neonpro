import { testClient, } from 'hono/testing'
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest'
import { whatsappRoutes, } from './whatsapp'

// Mock environment variables
const mockEnv = {
  WHATSAPP_VERIFY_TOKEN: 'test_verify_token',
  WHATSAPP_ACCESS_TOKEN: 'test_access_token',
  WHATSAPP_PHONE_NUMBER_ID: 'test_phone_number_id',
}

// Mock fetch for WhatsApp API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock all external dependencies
vi.mock('@neonpro/core-services', () => ({
  BrazilianAIService: vi.fn(() => ({
    processWhatsAppChat: vi.fn().mockResolvedValue({
      id: 'test_response_id',
      message: {
        id: 'test_msg_id',
        role: 'assistant',
        content: 'Olá! Como posso ajudá-lo hoje? 😊',
        timestamp: Date.now(),
      },
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, },
      metadata: { model: 'brazilian-ai', responseTime: 100, cached: false, },
      templateUsed: 'whatsapp-greeting',
      emergencyDetected: false,
      escalationTriggered: false,
      lgpdCompliance: {
        consentRequired: false,
        dataUsageExplained: true,
        rightsInformed: true,
      },
    },),
  })),
}),)

vi.mock('../middleware/audit.middleware', () => ({
  auditMiddleware: () => (c: any, next: any,) => next(),
}),)

vi.mock('../middleware/healthcare-security', () => ({
  HealthcareAuthMiddleware: vi.fn(() => ({
    handle: (c: any, next: any,) => {
      // Mock authenticated user with clinic access
      c.set('user', {
        id: 'test-user-id',
        roles: ['admin',],
        clinicIds: ['550e8400-e29b-41d4-a716-446655440000',],
      },)
      return next()
    },
    middleware: (c: any, next: any,) => {
      // Mock authenticated user with clinic access
      c.set('user', {
        id: 'test-user-id',
        roles: ['admin',],
        clinicIds: ['550e8400-e29b-41d4-a716-446655440000',],
      },)
      return next()
    },
  })),
}),)

vi.mock('../services/audit.service', () => ({
  auditService: {
    logEvent: vi.fn().mockResolvedValue({},),
  },
}),)

// Mock helper functions used in whatsapp.ts
vi.mock('./whatsapp', async (importOriginal,) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    sendWhatsAppMessage: vi.fn().mockResolvedValue({
      messageId: 'wamid.test123',
      timestamp: new Date().toISOString(),
    },),
    isFirstContact: vi.fn().mockResolvedValue(false,),
    getPreviousInteractionCount: vi.fn().mockResolvedValue(0,),
  }
},)

describe('WhatsApp Integration Tests', () => {
  const client = testClient(whatsappRoutes,)

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Set up environment
    Object.entries(mockEnv,).forEach(([key, value,],) => {
      process.env[key] = value
    },)

    // Mock successful WhatsApp API response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          messages: [{ id: 'wamid.test123', },],
        },),
    },)
  },)

  afterEach(() => {
    vi.resetAllMocks()
  },)

  describe('Webhook Verification', () => {
    it('should verify webhook with correct token', async () => {
      const response = await client.webhook.$get({
        query: {
          'hub.mode': 'subscribe',
          'hub.challenge': 'test_challenge',
          'hub.verify_token': 'test_verify_token',
        },
      },)

      expect(response.status,).toBe(200,)
      const text = await response.text()
      expect(text,).toBe('test_challenge',)
    })

    it('should reject webhook with incorrect token', async () => {
      const response = await client.webhook.$get({
        query: {
          'hub.mode': 'subscribe',
          'hub.challenge': 'test_challenge',
          'hub.verify_token': 'wrong_token',
        },
      },)

      expect(response.status,).toBe(403,)
    })
  })

  describe('Message Processing', () => {
    const validWebhookPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'entry_id',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '15551234567',
                  phone_number_id: 'test_phone_number_id',
                },
                messages: [
                  {
                    from: '5511999999999',
                    id: 'wamid.test123',
                    timestamp: '1234567890',
                    text: {
                      body: 'Olá, gostaria de agendar uma consulta',
                    },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }

    it('should process incoming text message successfully', async () => {
      const response = await client.webhook.$post({
        json: validWebhookPayload,
      },)

      expect(response.status,).toBe(200,)

      const result = await response.json()
      expect(result,).toEqual({
        status: 'success',
        message: 'Webhook processed successfully',
      },)
    })

    it('should handle empty message content gracefully', async () => {
      const emptyMessagePayload = {
        ...validWebhookPayload,
        entry: [
          {
            ...validWebhookPayload.entry[0],
            changes: [
              {
                ...validWebhookPayload.entry[0].changes[0],
                value: {
                  ...validWebhookPayload.entry[0].changes[0].value,
                  messages: [
                    {
                      from: '5511999999999',
                      id: 'wamid.test123',
                      timestamp: '1234567890',
                      text: {
                        body: '',
                      },
                      type: 'text',
                    },
                  ],
                },
              },
            ],
          },
        ],
      }

      const response = await client.webhook.$post({
        json: emptyMessagePayload,
      },)

      expect(response.status,).toBe(200,)
    })
  })

  describe('Health Check', () => {
    it('should return healthy status when properly configured', async () => {
      const response = await client.health.$get()

      expect(response.status,).toBe(200,)

      const result = await response.json()
      expect(result,).toMatchObject({
        status: 'healthy',
        configuration: {
          phoneNumberId: 'test_phone_number_id',
          webhookConfigured: true,
        },
      },)
    })

    it('should return unhealthy status when missing environment variables', async () => {
      // Remove required env var
      delete process.env.WHATSAPP_ACCESS_TOKEN

      const response = await client.health.$get()

      expect(response.status,).toBe(500,)

      const result = await response.json()
      expect(result,).toMatchObject({
        status: 'unhealthy',
        error: 'Missing required environment variables',
        missing: ['WHATSAPP_ACCESS_TOKEN',],
      },)
    })
  })

  describe('Send Message', () => {
    const validSendPayload = {
      to: '+5511999999999',
      message: 'Sua consulta foi agendada para amanhã às 14h',
      type: 'text' as const,
      clinicId: '550e8400-e29b-41d4-a716-446655440000',
      messageType: 'appointment_reminder' as const,
    }

    it('should send message successfully', async () => {
      const response = await client.send.$post({
        json: validSendPayload,
      },)

      expect(response.status,).toBe(200,)

      const result = await response.json()
      expect(result,).toMatchObject({
        status: 'success',
        messageId: expect.any(String,),
        timestamp: expect.any(String,),
      },)
    })

    it('should validate phone number format', async () => {
      const invalidPayload = {
        ...validSendPayload,
        to: 'invalid-phone',
      }

      const response = await client.send.$post({
        json: invalidPayload,
      },)

      expect(response.status,).toBe(400,)
    })
  })
})
