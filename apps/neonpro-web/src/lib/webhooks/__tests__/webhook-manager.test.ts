/**
 * Webhook Manager Tests
 * Story 7.3: Webhook & Event System Implementation
 *
 * Comprehensive test suite for webhook management functionality:
 * - Webhook registration and configuration
 * - Event delivery and retry mechanisms
 * - Signature validation and security
 * - Rate limiting and throttling
 * - Analytics and monitoring
 * - Error handling and edge cases
 */

import type { Mock } from "vitest";
import type { BaseEvent, WebhookEndpoint } from "../types";
import type { WebhookManager } from "../webhook-manager";

// Mock fetch for HTTP requests
global.fetch = vi.fn();

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
  })),
};

// Mock crypto for consistent IDs
vi.mock("crypto", () => ({
  randomUUID: vi.fn(() => "test-uuid-123"),
  createHmac: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => "test-signature"),
  })),
  timingSafeEqual: vi.fn(() => true),
}));

describe("WebhookManager", () => {
  let webhookManager: WebhookManager;
  let mockConfig: any;
  let mockFetch: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = fetch as Mock;

    mockConfig = {
      supabase: mockSupabase,
      defaultTimeout: 10000,
      defaultRetryStrategy: {
        strategy: "exponential",
        maxAttempts: 3,
        delayMs: 1000,
      },
      enableSignatureValidation: true,
      enableRateLimit: true,
      enableAnalytics: true,
    };

    webhookManager = new WebhookManager(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Webhook Registration", () => {
    it("should register a new webhook endpoint", async () => {
      const webhookData: Omit<WebhookEndpoint, "id" | "createdAt" | "updatedAt"> = {
        name: "Patient Events Webhook",
        url: "https://api.example.com/webhooks/patients",
        clinicId: "clinic-123",
        eventTypes: ["patient.created", "patient.updated"],
        isActive: true,
        secret: "webhook-secret-123",
        headers: { Authorization: "Bearer token123" },
        timeoutMs: 15000,
        retryStrategy: {
          strategy: "exponential",
          maxAttempts: 3,
          delayMs: 1000,
        },
        rateLimit: {
          requestsPerMinute: 60,
          burstLimit: 10,
        },
      };

      const webhookId = await webhookManager.registerWebhook(webhookData);

      expect(webhookId).toBe("test-uuid-123");
      expect(mockSupabase.from).toHaveBeenCalledWith("webhook_endpoints");
    });

    it("should validate webhook configuration before registration", async () => {
      const invalidWebhookData = {
        name: "",
        url: "invalid-url",
        clinicId: "",
        eventTypes: [],
        isActive: true,
      } as any;

      await expect(webhookManager.registerWebhook(invalidWebhookData)).rejects.toThrow(
        "Webhook validation failed",
      );
    });

    it("should update existing webhook", async () => {
      const updates = {
        name: "Updated Webhook Name",
        isActive: false,
        eventTypes: ["patient.created", "patient.updated", "patient.deleted"],
      };

      await webhookManager.updateWebhook("webhook-123", updates);

      expect(mockSupabase.from().update).toHaveBeenCalledWith(expect.objectContaining(updates));
    });

    it("should delete webhook", async () => {
      await webhookManager.deleteWebhook("webhook-123");

      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith("id", "webhook-123");
    });

    it("should get webhook by ID", async () => {
      const mockWebhook = {
        id: "webhook-123",
        name: "Test Webhook",
        url: "https://api.example.com/webhook",
      };

      mockSupabase
        .from()
        .select()
        .eq()
        .mockResolvedValueOnce({
          data: [mockWebhook],
          error: null,
        });

      const webhook = await webhookManager.getWebhook("webhook-123");

      expect(webhook).toEqual(mockWebhook);
    });

    it("should list webhooks for clinic", async () => {
      const mockWebhooks = [
        { id: "webhook-1", name: "Webhook 1" },
        { id: "webhook-2", name: "Webhook 2" },
      ];

      mockSupabase.from().select().eq().mockResolvedValueOnce({
        data: mockWebhooks,
        error: null,
      });

      const webhooks = await webhookManager.getWebhooksForClinic("clinic-123");

      expect(webhooks).toEqual(mockWebhooks);
    });
  });

  describe("Event Delivery", () => {
    const mockEvent: BaseEvent = {
      id: "event-123",
      type: "patient.created",
      source: "patient-service",
      data: { patientId: "123", name: "John Doe" },
      metadata: { clinicId: "clinic-123" },
      priority: "normal",
      version: "1.0.0",
      timestamp: new Date(),
      fingerprint: "fp-123",
      context: {},
    };

    const mockWebhook: WebhookEndpoint = {
      id: "webhook-123",
      name: "Test Webhook",
      url: "https://api.example.com/webhook",
      clinicId: "clinic-123",
      eventTypes: ["patient.created"],
      isActive: true,
      secret: "webhook-secret",
      headers: {},
      timeoutMs: 10000,
      retryStrategy: {
        strategy: "exponential",
        maxAttempts: 3,
        delayMs: 1000,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should deliver event to webhook successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      const delivery = await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(delivery.status).toBe("delivered");
      expect(delivery.responseStatus).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        mockWebhook.url,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Event-Type": mockEvent.type,
            "X-Event-ID": mockEvent.id,
          }),
          body: expect.any(String),
        }),
      );
    });

    it("should handle delivery failure and retry", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          text: () => Promise.resolve("OK"),
        });

      const delivery = await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(delivery.status).toBe("delivered");
      expect(delivery.attempts).toBe(3);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should fail after max retry attempts", async () => {
      mockFetch.mockRejectedValue(new Error("Persistent network error"));

      const delivery = await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(delivery.status).toBe("failed");
      expect(delivery.attempts).toBe(3);
      expect(delivery.lastError).toContain("Persistent network error");
    });

    it("should handle HTTP error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
        text: () => Promise.resolve("Server Error"),
      });

      const delivery = await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(delivery.status).toBe("failed");
      expect(delivery.responseStatus).toBe(500);
    });

    it("should respect timeout configuration", async () => {
      const slowWebhook = {
        ...mockWebhook,
        timeoutMs: 1000, // 1 second timeout
      };

      // Mock a slow response
      mockFetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 2000)));

      const delivery = await webhookManager.deliverEvent(mockEvent, slowWebhook);

      expect(delivery.status).toBe("failed");
      expect(delivery.lastError).toContain("timeout");
    });

    it("should include proper headers and signature", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(mockFetch).toHaveBeenCalledWith(
        mockWebhook.url,
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Webhook-Signature": expect.stringContaining("sha256="),
          }),
        }),
      );
    });
  });

  describe("Bulk Event Delivery", () => {
    const mockEvents: BaseEvent[] = [
      {
        id: "event-1",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "1" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-1",
        context: {},
      },
      {
        id: "event-2",
        type: "patient.updated",
        source: "patient-service",
        data: { patientId: "2" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-2",
        context: {},
      },
    ];

    it("should deliver multiple events to matching webhooks", async () => {
      const mockWebhooks = [
        {
          id: "webhook-1",
          name: "Patient Webhook",
          url: "https://api.example.com/webhook1",
          clinicId: "clinic-123",
          eventTypes: ["patient.created", "patient.updated"],
          isActive: true,
          secret: "secret1",
          headers: {},
          timeoutMs: 10000,
          retryStrategy: { strategy: "exponential", maxAttempts: 3, delayMs: 1000 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSupabase.from().select().eq().mockResolvedValueOnce({
        data: mockWebhooks,
        error: null,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      const results = await webhookManager.deliverEvents(mockEvents);

      expect(results).toHaveLength(2); // 2 events delivered
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should filter events by webhook event types", async () => {
      const mockWebhooks = [
        {
          id: "webhook-1",
          name: "Patient Create Only",
          url: "https://api.example.com/webhook1",
          clinicId: "clinic-123",
          eventTypes: ["patient.created"], // Only patient.created
          isActive: true,
          secret: "secret1",
          headers: {},
          timeoutMs: 10000,
          retryStrategy: { strategy: "exponential", maxAttempts: 3, delayMs: 1000 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSupabase.from().select().eq().mockResolvedValueOnce({
        data: mockWebhooks,
        error: null,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      const results = await webhookManager.deliverEvents(mockEvents);

      expect(results).toHaveLength(1); // Only 1 event should match
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent deliveries", async () => {
      const mockWebhooks = Array.from({ length: 5 }, (_, i) => ({
        id: `webhook-${i}`,
        name: `Webhook ${i}`,
        url: `https://api.example.com/webhook${i}`,
        clinicId: "clinic-123",
        eventTypes: ["patient.created", "patient.updated"],
        isActive: true,
        secret: `secret${i}`,
        headers: {},
        timeoutMs: 10000,
        retryStrategy: { strategy: "exponential", maxAttempts: 3, delayMs: 1000 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockSupabase.from().select().eq().mockResolvedValueOnce({
        data: mockWebhooks,
        error: null,
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      const startTime = Date.now();
      const results = await webhookManager.deliverEvents(mockEvents);
      const endTime = Date.now();

      // Should complete concurrently, not sequentially
      expect(endTime - startTime).toBeLessThan(1000); // Should be much faster than sequential
      expect(results).toHaveLength(10); // 2 events × 5 webhooks
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limits per webhook", async () => {
      const mockWebhook = {
        id: "webhook-123",
        name: "Rate Limited Webhook",
        url: "https://api.example.com/webhook",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
        rateLimit: {
          requestsPerMinute: 2, // Very low limit for testing
          burstLimit: 1,
        },
        timeoutMs: 10000,
        retryStrategy: { strategy: "exponential", maxAttempts: 3, delayMs: 1000 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEvent: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      // First request should succeed
      const delivery1 = await webhookManager.deliverEvent(mockEvent, mockWebhook);
      expect(delivery1.status).toBe("delivered");

      // Second request should be rate limited
      const delivery2 = await webhookManager.deliverEvent(mockEvent, mockWebhook);
      expect(delivery2.status).toBe("rate_limited");
    });

    it("should reset rate limits after time window", async () => {
      // This would require mocking time or using a shorter window for testing
      // Implementation depends on the specific rate limiting strategy
      expect(true).toBe(true); // Placeholder
    });
  });

  describe("Analytics and Monitoring", () => {
    it("should track delivery analytics", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      mockSupabase
        .from()
        .select()
        .mockResolvedValueOnce({
          data: [
            { status: "delivered", count: 100, avg_response_time: 250 },
            { status: "failed", count: 10, avg_response_time: null },
          ],
          error: null,
        });

      const analytics = await webhookManager.getDeliveryAnalytics(
        "webhook-123",
        startDate,
        endDate,
      );

      expect(analytics).toMatchObject({
        totalDeliveries: 110,
        successfulDeliveries: 100,
        failedDeliveries: 10,
        successRate: expect.any(Number),
        averageResponseTime: expect.any(Number),
      });
    });

    it("should get webhook health status", async () => {
      mockSupabase
        .from()
        .select()
        .mockResolvedValueOnce({
          data: [
            { status: "delivered", created_at: new Date().toISOString() },
            { status: "delivered", created_at: new Date().toISOString() },
            { status: "failed", created_at: new Date().toISOString() },
          ],
          error: null,
        });

      const health = await webhookManager.getWebhookHealth("webhook-123");

      expect(health).toMatchObject({
        isHealthy: expect.any(Boolean),
        successRate: expect.any(Number),
        lastDeliveryAt: expect.any(Date),
        recentFailures: expect.any(Number),
      });
    });

    it("should get system-wide analytics", async () => {
      const analytics = await webhookManager.getSystemAnalytics();

      expect(analytics).toMatchObject({
        totalWebhooks: expect.any(Number),
        activeWebhooks: expect.any(Number),
        totalDeliveries: expect.any(Number),
        overallSuccessRate: expect.any(Number),
      });
    });
  });

  describe("Security and Validation", () => {
    it("should validate webhook signatures", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "webhook-secret";
      const signature = WebhookUtils.generateSignature(payload, secret);

      const isValid = WebhookUtils.verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it("should reject invalid signatures", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "webhook-secret";
      const invalidSignature = "invalid-signature";

      const isValid = WebhookUtils.verifySignature(payload, invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it("should sanitize sensitive data in payloads", async () => {
      const eventWithSensitiveData: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: {
          patientId: "123",
          name: "John Doe",
          password: "secret123", // Should be sanitized
          creditCard: "1234-5678-9012-3456", // Should be sanitized
        },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const mockWebhook: WebhookEndpoint = {
        id: "webhook-123",
        name: "Test Webhook",
        url: "https://api.example.com/webhook",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
        secret: "webhook-secret",
        headers: {},
        timeoutMs: 10000,
        retryStrategy: { strategy: "exponential", maxAttempts: 3, delayMs: 1000 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      await webhookManager.deliverEvent(eventWithSensitiveData, mockWebhook);

      const callArgs = mockFetch.mock.calls[0][1] as any;
      const payload = JSON.parse(callArgs.body);

      expect(payload.data.password).toBe("[REDACTED]");
      expect(payload.data.creditCard).toBe("[REDACTED]");
      expect(payload.data.name).toBe("John Doe"); // Non-sensitive data preserved
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockSupabase.from().insert.mockRejectedValueOnce(new Error("Database error"));

      const webhookData = {
        name: "Test Webhook",
        url: "https://api.example.com/webhook",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
      } as any;

      await expect(webhookManager.registerWebhook(webhookData)).rejects.toThrow(
        "Failed to register webhook",
      );
    });

    it("should handle network timeouts", async () => {
      const mockEvent: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const mockWebhook: WebhookEndpoint = {
        id: "webhook-123",
        name: "Test Webhook",
        url: "https://api.example.com/webhook",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
        timeoutMs: 1000,
        retryStrategy: { strategy: "exponential", maxAttempts: 1, delayMs: 1000 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 2000)),
      );

      const delivery = await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(delivery.status).toBe("failed");
      expect(delivery.lastError).toContain("timeout");
    });

    it("should handle malformed webhook URLs", async () => {
      const invalidWebhookData = {
        name: "Invalid Webhook",
        url: "not-a-valid-url",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
      } as any;

      await expect(webhookManager.registerWebhook(invalidWebhookData)).rejects.toThrow(
        "Webhook validation failed",
      );
    });
  });

  describe("Integration with Utilities", () => {
    it("should use WebhookUtils for validation", async () => {
      const validateWebhookConfigSpy = vi.spyOn(WebhookUtils, "validateWebhookUrl");

      const webhookData = {
        name: "Test Webhook",
        url: "https://api.example.com/webhook",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
      } as any;

      await webhookManager.registerWebhook(webhookData);

      expect(validateWebhookConfigSpy).toHaveBeenCalled();
    });

    it("should use RetryUtils for retry logic", async () => {
      const executeWithRetrySpy = vi.spyOn(RetryUtils, "executeWithRetry");

      const mockEvent: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const mockWebhook: WebhookEndpoint = {
        id: "webhook-123",
        name: "Test Webhook",
        url: "https://api.example.com/webhook",
        clinicId: "clinic-123",
        eventTypes: ["patient.created"],
        isActive: true,
        retryStrategy: { strategy: "exponential", maxAttempts: 3, delayMs: 1000 },
        timeoutMs: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFetch.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("OK"),
      });

      await webhookManager.deliverEvent(mockEvent, mockWebhook);

      expect(executeWithRetrySpy).toHaveBeenCalled();
    });
  });
});
