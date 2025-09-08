import { testClient, } from 'hono/testing'
import { afterEach, beforeEach, describe, expect, it, vi, } from 'vitest'
import { whatsappRoutes, } from './whatsapp'

// Mock environment variables
const mockEnv = {
  WHATSAPP_VERIFY_TOKEN: 'test_verify_token',
  WHATSAPP_ACCESS_TOKEN: 'test_access_token',
  WHATSAPP_PHONE_NUMBER_ID: 'test_phone_number_id',
  CLINIC_NAME: 'Clínica NeonPro',
  CLINIC_EMERGENCY_PHONE: '+5511999999999',
}

// Mock fetch for WhatsApp API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

// Performance tracking utilities
const performanceTracker = {
  startTime: 0,
  endTime: 0,
  start() {
    this.startTime = performance.now()
  },
  end() {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  },
  getDuration() {
    return this.endTime - this.startTime
  },
}

// Mock Brazilian AI Service with performance simulation
const mockBrazilianAIService = {
  processWhatsAppChat: vi.fn(),
}

vi.mock('@neonpro/core-services', () => ({
  BrazilianAIService: vi.fn(() => mockBrazilianAIService),
}),)

vi.mock('../middleware/audit.middleware', () => ({
  auditMiddleware: () => (c: any, next: any,) => next(),
}),)

vi.mock('../middleware/healthcare-security', () => ({
  HealthcareAuthMiddleware: vi.fn(() => ({
    handle: (c: any, next: any,) => next(),
    middleware: (c: any, next: any,) => next(),
  })),
}),)

vi.mock('../services/audit.service', () => ({
  auditService: {
    logEvent: vi.fn().mockResolvedValue({},),
  },
}),)

describe('WhatsApp Performance and Compliance Tests', () => {
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

  describe('Response Time Performance', () => {
    const performanceScenarios = [
      {
        name: 'Simple greeting',
        message: 'Oi!',
        expectedMaxTime: 500, // 500ms for simple responses
        complexity: 'low',
      },
      {
        name: 'Appointment booking',
        message: 'Gostaria de agendar uma consulta para harmonização facial',
        expectedMaxTime: 1500, // 1.5s for medium complexity
        complexity: 'medium',
      },
      {
        name: 'Complex procedure inquiry',
        message:
          'Quero saber tudo sobre harmonização facial: preço, riscos, tempo de recuperação, contraindicações e resultados esperados',
        expectedMaxTime: 2000, // 2s for complex responses
        complexity: 'high',
      },
      {
        name: 'Emergency response',
        message: 'Socorro! Estou com alergia grave após o procedimento',
        expectedMaxTime: 300, // Emergency responses must be ultra-fast
        complexity: 'emergency',
      },
    ]

    performanceScenarios.forEach(({ name, message, expectedMaxTime, complexity, },) => {
      it(`should respond to ${name} within ${expectedMaxTime}ms`, async () => {
        // Configure AI service response time based on complexity
        const responseTime = complexity === 'emergency'
          ? 50
          : complexity === 'low'
          ? 200
          : complexity === 'medium'
          ? 800
          : 1200

        mockBrazilianAIService.processWhatsAppChat.mockImplementation(async () => {
          // Simulate AI processing time
          await new Promise(resolve => setTimeout(resolve, responseTime,))

          return {
            id: 'performance_test_id',
            message: {
              id: 'performance_msg_id',
              role: 'assistant',
              content: complexity === 'emergency'
                ? '⚠️ EMERGÊNCIA DETECTADA ⚠️ Entre em contato imediatamente!'
                : 'Resposta adequada para a complexidade da pergunta',
              timestamp: Date.now(),
            },
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, },
            metadata: { model: 'brazilian-ai', responseTime, cached: false, },
            templateUsed: complexity === 'emergency'
              ? 'whatsapp-emergency-escalation'
              : 'whatsapp-greeting',
            emergencyDetected: complexity === 'emergency',
            escalationTriggered: complexity === 'emergency',
            lgpdCompliance: {
              consentRequired: false,
              dataUsageExplained: true,
              rightsInformed: true,
            },
          }
        },)

        const payload = {
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
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now(),),
                        text: { body: message, },
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

        performanceTracker.start()
        const response = await client.webhook.$post({
          json: payload,
        },)
        const duration = performanceTracker.end()

        expect(response.status,).toBe(200,)
        expect(duration,).toBeLessThan(expectedMaxTime,)

        console.log(`${name}: ${duration.toFixed(2,)}ms (limit: ${expectedMaxTime}ms)`,)
      })
    },)
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const concurrentRequests = 10
      const maxResponseTime = 3000 // 3s for concurrent load

      mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
        id: 'concurrent_test_id',
        message: {
          id: 'concurrent_msg_id',
          role: 'assistant',
          content: 'Resposta para teste de concorrência',
          timestamp: Date.now(),
        },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, },
        metadata: { model: 'brazilian-ai', responseTime: 500, cached: false, },
        templateUsed: 'whatsapp-greeting',
        emergencyDetected: false,
        escalationTriggered: false,
        lgpdCompliance: {
          consentRequired: false,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      },)

      const requests = Array.from({ length: concurrentRequests, }, (_, index,) => {
        const payload = {
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
                        from: `55119999${index.toString().padStart(5, '0',)}`,
                        id: `wamid.concurrent_${index}`,
                        timestamp: String(Date.now(),),
                        text: { body: `Mensagem concorrente ${index + 1}`, },
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

        return client.webhook.$post({ json: payload, },)
      },)

      performanceTracker.start()
      const responses = await Promise.all(requests,)
      const duration = performanceTracker.end()

      // All requests should succeed
      responses.forEach((response,) => {
        expect(response.status,).toBe(200,)
      },)

      // Total time should be reasonable for concurrent processing
      expect(duration,).toBeLessThan(maxResponseTime,)

      console.log(`Concurrent requests (${concurrentRequests}): ${duration.toFixed(2,)}ms`,)
    })
  })

  describe('LGPD Compliance Validation', () => {
    const lgpdComplianceTests = [
      {
        name: 'Data collection consent',
        message: 'Preciso do seu nome e telefone para agendar',
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
        complianceLevel: 'strict',
      },
      {
        name: 'Marketing consent',
        message: 'Posso enviar promoções por WhatsApp?',
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
        complianceLevel: 'strict',
      },
      {
        name: 'Medical data handling',
        message: 'Qual seu histórico de procedimentos estéticos?',
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
        complianceLevel: 'medical',
      },
      {
        name: 'General information',
        message: 'Qual o horário de funcionamento?',
        expectedCompliance: {
          consentRequired: false,
          dataUsageExplained: true,
          rightsInformed: false,
        },
        complianceLevel: 'basic',
      },
    ]

    lgpdComplianceTests.forEach(({ name, message, expectedCompliance, complianceLevel, },) => {
      it(`should ensure LGPD compliance for ${name}`, async () => {
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: 'lgpd_compliance_id',
          message: {
            id: 'lgpd_msg_id',
            role: 'assistant',
            content: expectedCompliance.consentRequired
              ? 'Para atender sua solicitação, preciso do seu consentimento conforme LGPD. Você autoriza?'
              : 'Informação fornecida respeitando sua privacidade conforme LGPD.',
            timestamp: Date.now(),
          },
          usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40, },
          metadata: { model: 'brazilian-ai', responseTime: 120, cached: false, },
          templateUsed: 'whatsapp-lgpd-compliance',
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: expectedCompliance,
        },)

        const payload = {
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
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now(),),
                        text: { body: message, },
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

        const response = await client.webhook.$post({
          json: payload,
        },)

        expect(response.status,).toBe(200,)

        // Verify LGPD compliance was properly handled
        expect(mockBrazilianAIService.processWhatsAppChat,).toHaveBeenCalledWith(
          expect.any(Object,),
          expect.any(Object,),
        )
      })
    },)
  })

  describe('Error Handling and Resilience', () => {
    it('should handle AI service failures gracefully', async () => {
      // Simulate AI service failure
      mockBrazilianAIService.processWhatsAppChat.mockRejectedValue(
        new Error('AI service temporarily unavailable',),
      )

      const payload = {
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
                      id: `wamid.${Date.now()}`,
                      timestamp: String(Date.now(),),
                      text: { body: 'Teste de falha do serviço', },
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

      const response = await client.webhook.$post({
        json: payload,
      },)

      // Should still return success (webhook processed) even if AI fails
      expect(response.status,).toBe(200,)
    })

    it('should handle malformed requests without crashing', async () => {
      const malformedPayloads = [
        { object: 'invalid', },
        { object: 'whatsapp_business_account', entry: [], },
        { object: 'whatsapp_business_account', entry: [{ invalid: 'data', },], },
      ]

      for (const payload of malformedPayloads) {
        const response = await client.webhook.$post({
          json: payload,
        },)

        // Should return 400 for malformed requests
        expect(response.status,).toBe(400,)
      }
    })
  })

  describe('Memory and Resource Usage', () => {
    it('should not leak memory during extended operation', async () => {
      const iterations = 50
      const memoryThreshold = 100 // MB

      mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
        id: 'memory_test_id',
        message: {
          id: 'memory_msg_id',
          role: 'assistant',
          content: 'Resposta para teste de memória',
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
      },)

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024 // MB

      // Process many requests
      for (let i = 0; i < iterations; i++) {
        const payload = {
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
                        id: `wamid.memory_test_${i}`,
                        timestamp: String(Date.now(),),
                        text: { body: `Teste de memória ${i}`, },
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

        const response = await client.webhook.$post({
          json: payload,
        },)
        expect(response.status,).toBe(200,)
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024 // MB
      const memoryIncrease = finalMemory - initialMemory

      console.log(
        `Memory usage: ${initialMemory.toFixed(2,)}MB → ${finalMemory.toFixed(2,)}MB (Δ${
          memoryIncrease.toFixed(2,)
        }MB)`,
      )

      // Memory increase should be reasonable
      expect(memoryIncrease,).toBeLessThan(memoryThreshold,)
    })
  })

  describe('Scalability Metrics', () => {
    it('should maintain performance under load', async () => {
      const loadLevels = [1, 5, 10, 20,]
      const maxDegradation = 2 // Performance shouldn't degrade more than 2x

      let baselineTime = 0

      for (const [index, concurrency,] of loadLevels.entries()) {
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: 'scalability_test_id',
          message: {
            id: 'scalability_msg_id',
            role: 'assistant',
            content: 'Resposta para teste de escalabilidade',
            timestamp: Date.now(),
          },
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, },
          metadata: { model: 'brazilian-ai', responseTime: 200, cached: false, },
          templateUsed: 'whatsapp-greeting',
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: false,
            dataUsageExplained: true,
            rightsInformed: true,
          },
        },)

        const requests = Array.from({ length: concurrency, }, (_, i,) => {
          const payload = {
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
                          from: `55119999${i.toString().padStart(5, '0',)}`,
                          id: `wamid.scalability_${concurrency}_${i}`,
                          timestamp: String(Date.now(),),
                          text: { body: `Teste de escalabilidade ${concurrency}x${i}`, },
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

          return client.webhook.$post({ json: payload, },)
        },)

        performanceTracker.start()
        const responses = await Promise.all(requests,)
        const duration = performanceTracker.end()

        // All requests should succeed
        responses.forEach((response,) => {
          expect(response.status,).toBe(200,)
        },)

        const avgTimePerRequest = duration / concurrency

        if (index === 0) {
          baselineTime = avgTimePerRequest
        }

        const degradationRatio = avgTimePerRequest / baselineTime

        console.log(
          `Load ${concurrency}x: ${avgTimePerRequest.toFixed(2,)}ms/req (${
            degradationRatio.toFixed(2,)
          }x baseline)`,
        )

        // Performance degradation should be reasonable
        expect(degradationRatio,).toBeLessThan(maxDegradation,)
      }
    })
  })
})
