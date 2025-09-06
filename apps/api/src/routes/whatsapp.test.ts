/**
 * WhatsApp Integration Tests
 * Tests for WhatsApp Business API webhook endpoints and message processing
 */

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

// Centralized singleton mock for BrazilianAIService
const mockBrazilianAIService = {
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
};

vi.mock("@neonpro/core-services", () => ({
  BrazilianAIService: vi.fn(() => mockBrazilianAIService),
}));

describe("WhatsApp Routes", () => {
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

  describe("GET /webhook - Webhook Verification", () => {
    it("should verify webhook with correct token", async () => {
      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          "hub.challenge": "test_challenge",
          "hub.verify_token": "test_verify_token",
        },
      });

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe("test_challenge");
    });

    it("should reject webhook with incorrect token", async () => {
      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          "hub.challenge": "test_challenge",
          "hub.verify_token": "wrong_token",
        },
      });

      expect(response.status).toBe(403);
    });

    it("should reject webhook with missing parameters", async () => {
      const response = await client.webhook.$get({
        query: {
          "hub.mode": "subscribe",
          // Missing challenge and verify_token
        },
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /webhook - Message Processing", () => {
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
                      body: "Olá, gostaria de agendar uma consulta",
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

    it("should process incoming text message successfully", async () => {
      const response = await client.webhook.$post({
        json: validWebhookPayload,
      });

      expect(response.status).toBe(200);

      // Verify AI service was called
      expect(mockBrazilianAIService.processWhatsAppChat).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: "Olá, gostaria de agendar uma consulta",
            }),
          ]),
          whatsappContext: expect.objectContaining({
            phoneNumber: "5511999999999",
            messageType: "text",
            isFirstContact: false,
            previousInteractions: 0,
          }),
        }),
        expect.objectContaining({
          requestId: expect.stringContaining("whatsapp_"),
          userId: "5511999999999",
          source: "whatsapp-webhook",
        }),
      );

      // Verify WhatsApp API was called to send response
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("graph.facebook.com"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Authorization": "Bearer test_access_token",
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining("Olá! Como posso ajudá-lo hoje? 😊"),
        }),
      );
    });

    it("should handle message status updates", async () => {
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

    it("should handle empty message content gracefully", async () => {
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
                      from: "5511999999999",
                      id: "wamid.test123",
                      timestamp: "1234567890",
                      text: {
                        body: "",
                      },
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
        json: emptyMessagePayload,
      });

      expect(response.status).toBe(200);

      // Should not call AI service for empty messages
      expect(mockBrazilianAIService.processWhatsAppChat).not.toHaveBeenCalled();
    });

    it("should send fallback message on AI service error", async () => {
      // Mock AI service to throw error via centralized mock
      mockBrazilianAIService.processWhatsAppChat.mockRejectedValueOnce(
        new Error("AI service error"),
      );

      const response = await client.webhook.$post({
        json: validWebhookPayload,
      });

      expect(response.status).toBe(200);

      // Verify fallback message was sent
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("graph.facebook.com"),
        expect.objectContaining({
          body: expect.stringContaining("Nossa equipe irá responder em breve"),
        }),
      );
    });

    it("should handle invalid webhook payload", async () => {
      const invalidPayload = {
        object: "invalid_object",
        entry: [],
      };

      const response = await client.webhook.$post({
        json: invalidPayload,
      });

      expect(response.status).toBe(200); // WhatsApp expects 200 even for invalid payloads
    });
  });

  describe("POST /send - Send Message", () => {
    const sendMessagePayload = {
      to: "5511999999999",
      message: "Sua consulta foi agendada para amanhã às 14h",
      type: "text" as const,
      clinicId: "clinic_123",
      messageType: "appointment_reminder" as const,
    };

    it("should send message successfully", async () => {
      const response = await client.send.$post({
        json: sendMessagePayload,
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        success: true,
        messageId: expect.stringMatching(/^wamid\.|^mock_/),
        to: "5511999999999",
      });

      // Verify WhatsApp API was called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("graph.facebook.com"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Authorization": "Bearer test_access_token",
          }),
          body: expect.stringContaining(sendMessagePayload.message),
        }),
      );
    });

    it("should validate phone number format", async () => {
      const invalidPayload = {
        ...sendMessagePayload,
        to: "invalid_phone",
      };

      const response = await client.send.$post({
        json: invalidPayload,
      });

      expect(response.status).toBe(400);
    });

    it("should handle WhatsApp API errors", async () => {
      // Mock WhatsApp API error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ error: "Invalid phone number" }),
      });

      const response = await client.send.$post({
        json: sendMessagePayload,
      });

      expect(response.status).toBe(500);
    });
  });

  describe("GET /health - Health Check", () => {
    it("should return healthy status", async () => {
      const response = await client.health.$get();

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result).toMatchObject({
        status: "healthy",
        service: "whatsapp-api",
        timestamp: expect.any(String),
      });
    });
  });
});
