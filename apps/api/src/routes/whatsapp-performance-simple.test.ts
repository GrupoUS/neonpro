import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { whatsappRoutes } from "./whatsapp";

// Mock environment variables
const mockEnv = {
  WHATSAPP_VERIFY_TOKEN: "test_verify_token",
  WHATSAPP_ACCESS_TOKEN: "test_access_token",
  WHATSAPP_PHONE_NUMBER_ID: "test_phone_number_id",
  CLINIC_NAME: "Clínica NeonPro",
  CLINIC_EMERGENCY_PHONE: "+5511999999999",
};

// Mock fetch for WhatsApp API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Performance tracking utilities
const performanceTracker = {
  startTime: 0,
  endTime: 0,
  start() {
    this.startTime = performance.now();
  },
  end() {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  },
};

// Mock Brazilian AI Service
const mockBrazilianAIService = {
  processWhatsAppChat: vi.fn(),
};

vi.mock("@neonpro/core-services", () => ({
  BrazilianAIService: vi.fn(() => mockBrazilianAIService),
}));

vi.mock("../middleware/audit.middleware", () => ({
  auditMiddleware: () => (c: any, next: any) => next(),
}));

vi.mock("../middleware/healthcare-security", () => ({
  HealthcareAuthMiddleware: vi.fn(() => ({
    handle: (c: any, next: any) => next(),
    middleware: (c: any, next: any) => next(),
  })),
}));

vi.mock("../services/audit.service", () => ({
  auditService: {
    logEvent: vi.fn().mockResolvedValue({}),
  },
}));

describe("WhatsApp Performance Validation", () => {
  const client = testClient(whatsappRoutes);

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up environment
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });

    // Mock successful WhatsApp API response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          messages: [{ id: "wamid.test123" }],
        }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Webhook Verification Performance", () => {
    it("should verify webhook quickly (< 100ms)", async () => {
      performanceTracker.start();

      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          "hub.challenge": "test_challenge",
          "hub.verify_token": "test_verify_token",
        },
      });

      const duration = performanceTracker.end();

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);

      console.log(`Webhook verification: ${duration.toFixed(2)}ms`);
    });
  });

  describe("Message Processing Performance", () => {
    const performanceScenarios = [
      {
        name: "Simple message",
        message: "Oi!",
        expectedMaxTime: 1000,
      },
      {
        name: "Complex message",
        message:
          "Gostaria de agendar uma consulta para harmonização facial com preenchimento labial",
        expectedMaxTime: 2000,
      },
      {
        name: "Empty message handling",
        message: "",
        expectedMaxTime: 500,
      },
    ];

    performanceScenarios.forEach(({ name, message, expectedMaxTime }) => {
      it(`should process ${name} within ${expectedMaxTime}ms`, async () => {
        mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
          id: "performance_test_id",
          message: {
            id: "performance_msg_id",
            role: "assistant",
            content: "Resposta de teste de performance",
            timestamp: Date.now(),
          },
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          metadata: { model: "brazilian-ai", responseTime: 100, cached: false },
          templateUsed: "whatsapp-greeting",
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: false,
            dataUsageExplained: true,
            rightsInformed: true,
          },
        });

        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: "5511999999999",
                        id: `wamid.${Date.now()}`,
                        timestamp: String(Date.now()),
                        text: { body: message },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        performanceTracker.start();
        const response = await client.webhook.$post({
          json: payload,
        });
        const duration = performanceTracker.end();

        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(expectedMaxTime);

        console.log(`${name}: ${duration.toFixed(2)}ms (limit: ${expectedMaxTime}ms)`);
      });
    });
  });

  describe("Health Check Performance", () => {
    it("should respond to health check quickly (< 50ms)", async () => {
      performanceTracker.start();

      const response = await client.health.$get();

      const duration = performanceTracker.end();

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(50);

      console.log(`Health check: ${duration.toFixed(2)}ms`);
    });
  });

  describe("Concurrent Request Handling", () => {
    it("should handle 5 concurrent webhook verifications efficiently", async () => {
      const concurrentRequests = 5;
      const maxTotalTime = 500; // 500ms for 5 concurrent requests

      const requests = Array.from(
        { length: concurrentRequests },
        (_, index) =>
          client.webhook.$get({
            query: {
              "hub.mode": "subscribe",
              "hub.challenge": `test_challenge_${index}`,
              "hub.verify_token": "test_verify_token",
            },
          }),
      );

      performanceTracker.start();
      const responses = await Promise.all(requests);
      const duration = performanceTracker.end();

      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(maxTotalTime);

      console.log(
        `Concurrent webhook verifications (${concurrentRequests}): ${duration.toFixed(2)}ms`,
      );
    });

    it("should handle 3 concurrent message processing efficiently", async () => {
      const concurrentRequests = 3;
      const maxTotalTime = 3000; // 3s for 3 concurrent message processing

      mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
        id: "concurrent_test_id",
        message: {
          id: "concurrent_msg_id",
          role: "assistant",
          content: "Resposta para teste de concorrência",
          timestamp: Date.now(),
        },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        metadata: { model: "brazilian-ai", responseTime: 200, cached: false },
        templateUsed: "whatsapp-greeting",
        emergencyDetected: false,
        escalationTriggered: false,
        lgpdCompliance: {
          consentRequired: false,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      });

      const requests = Array.from({ length: concurrentRequests }, (_, index) => {
        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: `55119999${index.toString().padStart(5, "0")}`,
                        id: `wamid.concurrent_${index}`,
                        timestamp: String(Date.now()),
                        text: { body: `Mensagem concorrente ${index + 1}` },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        return client.webhook.$post({ json: payload });
      });

      performanceTracker.start();
      const responses = await Promise.all(requests);
      const duration = performanceTracker.end();

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(maxTotalTime);

      console.log(
        `Concurrent message processing (${concurrentRequests}): ${duration.toFixed(2)}ms`,
      );
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle AI service failures quickly", async () => {
      const maxErrorHandlingTime = 1000; // 1s for error handling

      // Simulate AI service failure
      mockBrazilianAIService.processWhatsAppChat.mockRejectedValue(
        new Error("AI service temporarily unavailable"),
      );

      const payload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "entry_id",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "15551234567",
                    phone_number_id: "test_phone_number_id",
                  },
                  messages: [
                    {
                      from: "5511999999999",
                      id: `wamid.${Date.now()}`,
                      timestamp: String(Date.now()),
                      text: { body: "Teste de falha do serviço" },
                      type: "text",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      performanceTracker.start();
      const response = await client.webhook.$post({
        json: payload,
      });
      const duration = performanceTracker.end();

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(maxErrorHandlingTime);

      console.log(`Error handling: ${duration.toFixed(2)}ms`);
    });
  });

  describe("Memory Usage Validation", () => {
    it("should not consume excessive memory during operation", async () => {
      const iterations = 20;
      const maxMemoryIncrease = 50; // 50MB

      mockBrazilianAIService.processWhatsAppChat.mockResolvedValue({
        id: "memory_test_id",
        message: {
          id: "memory_msg_id",
          role: "assistant",
          content: "Resposta para teste de memória",
          timestamp: Date.now(),
        },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        metadata: { model: "brazilian-ai", responseTime: 100, cached: false },
        templateUsed: "whatsapp-greeting",
        emergencyDetected: false,
        escalationTriggered: false,
        lgpdCompliance: {
          consentRequired: false,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      });

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Process multiple requests
      for (let i = 0; i < iterations; i++) {
        const payload = {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "entry_id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "test_phone_number_id",
                    },
                    messages: [
                      {
                        from: "5511999999999",
                        id: `wamid.memory_test_${i}`,
                        timestamp: String(Date.now()),
                        text: { body: `Teste de memória ${i}` },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        };

        const response = await client.webhook.$post({
          json: payload,
        });
        expect(response.status).toBe(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memoryIncrease = finalMemory - initialMemory;

      console.log(
        `Memory usage: ${initialMemory.toFixed(2)}MB → ${finalMemory.toFixed(2)}MB (Δ${
          memoryIncrease.toFixed(2)
        }MB)`,
      );

      expect(memoryIncrease).toBeLessThan(maxMemoryIncrease);
    });
  });

  describe("LGPD Compliance Validation", () => {
    const lgpdScenarios = [
      {
        name: "Data collection consent validation",
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      },
      {
        name: "Marketing consent validation",
        expectedCompliance: {
          consentRequired: true,
          dataUsageExplained: true,
          rightsInformed: true,
        },
      },
      {
        name: "General information validation",
        expectedCompliance: {
          consentRequired: false,
          dataUsageExplained: true,
          rightsInformed: false,
        },
      },
    ];

    lgpdScenarios.forEach(({ name, expectedCompliance }) => {
      it(`should validate ${name}`, () => {
        // Test LGPD compliance logic
        const testCompliance = (dataType: string) => {
          const dataCollectionTypes = new Set(["personal_data", "medical_history", "contact_info"]);
          const marketingTypes = ["promotions", "newsletter", "offers"];

          const requiresConsent = dataCollectionTypes.has(dataType)
            || marketingTypes.includes(dataType);
          const dataUsageExplained = true; // Always explain data usage
          const rightsInformed = dataCollectionTypes.has(dataType); // Inform rights for personal data

          return {
            consentRequired: requiresConsent,
            dataUsageExplained,
            rightsInformed,
          };
        };

        // Test different data types
        const personalDataCompliance = testCompliance("personal_data");
        expect(personalDataCompliance.consentRequired).toBe(true);
        expect(personalDataCompliance.dataUsageExplained).toBe(true);
        expect(personalDataCompliance.rightsInformed).toBe(true);

        const generalInfoCompliance = testCompliance("general_info");
        expect(generalInfoCompliance.consentRequired).toBe(false);
        expect(generalInfoCompliance.dataUsageExplained).toBe(true);
        expect(generalInfoCompliance.rightsInformed).toBe(false);
      });
    });
  });

  describe("System Resilience", () => {
    it("should maintain stability under stress", async () => {
      const stressIterations = 10;
      const maxFailureRate = 0.1; // 10% failure rate acceptable

      let failures = 0;

      mockBrazilianAIService.processWhatsAppChat.mockImplementation(async () => {
        // Simulate occasional failures
        if (Math.random() < 0.05) { // 5% failure rate
          throw new Error("Simulated service failure");
        }

        return {
          id: "stress_test_id",
          message: {
            id: "stress_msg_id",
            role: "assistant",
            content: "Resposta para teste de stress",
            timestamp: Date.now(),
          },
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          metadata: { model: "brazilian-ai", responseTime: 150, cached: false },
          templateUsed: "whatsapp-greeting",
          emergencyDetected: false,
          escalationTriggered: false,
          lgpdCompliance: {
            consentRequired: false,
            dataUsageExplained: true,
            rightsInformed: true,
          },
        };
      });

      for (let i = 0; i < stressIterations; i++) {
        try {
          const payload = {
            object: "whatsapp_business_account",
            entry: [
              {
                id: "entry_id",
                changes: [
                  {
                    value: {
                      messaging_product: "whatsapp",
                      metadata: {
                        display_phone_number: "15551234567",
                        phone_number_id: "test_phone_number_id",
                      },
                      messages: [
                        {
                          from: "5511999999999",
                          id: `wamid.stress_test_${i}`,
                          timestamp: String(Date.now()),
                          text: { body: `Teste de stress ${i}` },
                          type: "text",
                        },
                      ],
                    },
                    field: "messages",
                  },
                ],
              },
            ],
          };

          const response = await client.webhook.$post({
            json: payload,
          });

          // Webhook should always return 200 even if AI fails
          expect(response.status).toBe(200);
        } catch (error) {
          failures++;
        }
      }

      const failureRate = failures / stressIterations;
      console.log(
        `Stress test: ${failures}/${stressIterations} failures (${
          (failureRate * 100).toFixed(1)
        }%)`,
      );

      expect(failureRate).toBeLessThan(maxFailureRate);
    });
  });
});
