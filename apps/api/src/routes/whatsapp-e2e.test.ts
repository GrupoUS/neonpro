import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { whatsappRoutes } from "./whatsapp";

// Mock environment variables
const mockEnv = {
  WHATSAPP_VERIFY_TOKEN: "test_verify_token",
  WHATSAPP_ACCESS_TOKEN: "test_access_token",
  WHATSAPP_PHONE_NUMBER_ID: "test_phone_number_id",
};

// Mock fetch for WhatsApp API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock all external dependencies to avoid database/service dependencies
vi.mock("@neonpro/core-services", () => ({
  BrazilianAIService: vi.fn(() => ({
    processWhatsAppChat: vi.fn().mockResolvedValue({
      id: "test_response_id",
      message: {
        id: "test_msg_id",
        role: "assistant",
        content: "Olá! Como posso ajudá-lo hoje? 😊",
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
    }),
  })),
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

describe("WhatsApp End-to-End Tests", () => {
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

  describe("Webhook Verification Flow", () => {
    it("should complete webhook verification flow successfully", async () => {
      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          "hub.challenge": "test_challenge_12345",
          "hub.verify_token": "test_verify_token",
        },
      });

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe("test_challenge_12345");
    });

    it("should reject invalid verification attempts", async () => {
      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          "hub.challenge": "test_challenge",
          "hub.verify_token": "invalid_token",
        },
      });

      expect(response.status).toBe(403);
    });
  });

  describe("Message Processing Flow", () => {
    const validWebhookPayload = {
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
                    id: "wamid.test123",
                    timestamp: "1234567890",
                    text: {
                      body: "Olá, gostaria de agendar uma consulta de harmonização facial",
                    },
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

    it("should process complete message flow successfully", async () => {
      const response = await client.webhook.$post({
        json: validWebhookPayload,
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toEqual({
        status: "success",
        message: "Webhook processed successfully",
      });
    });

    it("should handle multiple messages in single webhook", async () => {
      const multiMessagePayload = {
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
                      from: "5511999999999",
                      id: "wamid.test123",
                      timestamp: "1234567890",
                      text: { body: "Primeira mensagem" },
                      type: "text",
                    },
                    {
                      from: "5511999999999",
                      id: "wamid.test124",
                      timestamp: "1234567891",
                      text: { body: "Segunda mensagem" },
                      type: "text",
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const response = await client.webhook.$post({
        json: multiMessagePayload,
      });

      expect(response.status).toBe(200);
    });

    it("should handle status updates", async () => {
      const statusPayload = {
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
                  statuses: [
                    {
                      id: "wamid.test123",
                      status: "delivered",
                      timestamp: "1234567890",
                      recipient_id: "5511999999999",
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
        json: statusPayload,
      });

      expect(response.status).toBe(200);
    });
  });

  describe("Health Check Flow", () => {
    it("should return healthy status with all configurations", async () => {
      const response = await client.health.$get();

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        status: "healthy",
        timestamp: expect.any(String),
        configuration: {
          phoneNumberId: "test_phone_number_id",
          webhookConfigured: true,
        },
      });
    });

    it("should detect missing configuration", async () => {
      // Remove required env vars
      delete process.env.WHATSAPP_ACCESS_TOKEN;
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;

      const response = await client.health.$get();

      expect(response.status).toBe(500);

      const result = await response.json();
      expect(result).toMatchObject({
        status: "unhealthy",
        error: "Missing required environment variables",
        missing: expect.arrayContaining([
          "WHATSAPP_ACCESS_TOKEN",
          "WHATSAPP_PHONE_NUMBER_ID",
        ]),
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed webhook payload", async () => {
      const malformedPayload = {
        object: "invalid_object",
        entry: [],
      };

      const response = await client.webhook.$post({
        json: malformedPayload,
      });

      expect(response.status).toBe(400);
    });

    it("should handle missing webhook parameters", async () => {
      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          // Missing challenge and verify_token
        },
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Brazilian Templates Integration", () => {
    const brazilianScenarios = [
      {
        name: "Agendamento de consulta",
        message: "Olá, gostaria de agendar uma consulta",
        expectedTemplate: "whatsapp-appointment-booking",
      },
      {
        name: "Pergunta sobre procedimento",
        message: "Quanto custa um preenchimento labial?",
        expectedTemplate: "whatsapp-procedure-inquiry",
      },
      {
        name: "Cuidados pós-procedimento",
        message: "Como devo cuidar da pele depois do peeling?",
        expectedTemplate: "whatsapp-post-procedure-care",
      },
      {
        name: "Primeira interação",
        message: "Oi, tudo bem?",
        expectedTemplate: "whatsapp-greeting",
      },
    ];

    brazilianScenarios.forEach(({ name, message, expectedTemplate }) => {
      it(`should handle ${name} with appropriate template`, async () => {
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

        const response = await client.webhook.$post({
          json: payload,
        });

        expect(response.status).toBe(200);

        const result = await response.json();
        expect(result).toEqual({
          status: "success",
          message: "Webhook processed successfully",
        });
      });
    });
  });
});
