/**
 * Mobile API System Tests
 * Comprehensive test suite for mobile API functionality
 */

import type { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { MobileApiSystem } from "../mobile-api-system";
import type { MobileApiConfig, MobileApiRequest, NetworkCondition } from "../types";

// Mock Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      signInWithPassword: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: "test" } }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest
        .fn()
        .mockResolvedValue({ data: { session: { access_token: "test" } }, error: null }),
    },
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe("MobileApiSystem", () => {
  let apiSystem: MobileApiSystem;
  let mockConfig: MobileApiConfig["api"];

  beforeEach(() => {
    mockConfig = {
      baseUrl: "https://api.test.com",
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      compression: {
        enabled: true,
        algorithm: "gzip",
        level: 6,
      },
      security: {
        encryptionKey: "test-key",
        signatureValidation: true,
        rateLimiting: {
          enabled: true,
          maxRequests: 100,
          windowMs: 60000,
        },
      },
      supabaseUrl: "https://test.supabase.co",
      supabaseKey: "test-key",
    };

    apiSystem = new MobileApiSystem(mockConfig);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await apiSystem.shutdown();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await expect(apiSystem.initialize()).resolves.not.toThrow();
    });

    it("should handle initialization errors", async () => {
      const invalidConfig = { ...mockConfig, supabaseUrl: "" };
      const invalidApiSystem = new MobileApiSystem(invalidConfig);

      await expect(invalidApiSystem.initialize()).rejects.toThrow();
    });
  });

  describe("Authentication", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should authenticate user successfully", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await apiSystem.authenticate(credentials);
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it("should handle authentication failure", async () => {
      const mockSupabase = require("@supabase/supabase-js").createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Invalid credentials" },
      });

      const credentials = {
        email: "invalid@example.com",
        password: "wrongpassword",
      };

      const result = await apiSystem.authenticate(credentials);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should refresh token successfully", async () => {
      const result = await apiSystem.refreshToken();
      expect(result.success).toBe(true);
    });

    it("should logout successfully", async () => {
      await expect(apiSystem.logout()).resolves.not.toThrow();
    });
  });

  describe("API Requests", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should make successful GET request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/test",
        method: "GET",
        headers: {},
        params: {},
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ data: "test" });
      expect(response.status).toBe(200);
    });

    it("should make successful POST request with data", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ id: 1, name: "Created" }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/create",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { name: "Test Item" },
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: 1, name: "Created" });
      expect(response.status).toBe(201);
    });

    it("should handle request timeout", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 10000)),
      );

      const request: MobileApiRequest = {
        endpoint: "/slow",
        method: "GET",
        headers: {},
        timeout: 1000,
        cache: { enabled: false },
      };

      await expect(apiSystem.request(request)).rejects.toThrow();
    });

    it("should retry failed requests", async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: jest.fn().mockResolvedValue({ data: "success" }),
        });

      const request: MobileApiRequest = {
        endpoint: "/retry-test",
        method: "GET",
        headers: {},
        retryAttempts: 3,
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should handle 4xx client errors without retry", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ error: "Bad Request" }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/bad-request",
        method: "GET",
        headers: {},
        retryAttempts: 3,
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(global.fetch).toHaveBeenCalledTimes(1); // No retry for 4xx
    });
  });

  describe("Data Compression", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should compress request data when enabled", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const largeData = { data: "x".repeat(1000) };
      const request: MobileApiRequest = {
        endpoint: "/compress-test",
        method: "POST",
        headers: {},
        body: largeData,
        compression: {
          enabled: true,
          algorithm: "gzip",
          level: 6,
        },
        cache: { enabled: false },
      };

      await apiSystem.request(request);

      // Verify fetch was called with compressed data
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers["Content-Encoding"]).toBe("gzip");
    });

    it("should decompress response data when compressed", async () => {
      const compressedResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Encoding": "gzip" }),
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100)),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(compressedResponse);

      const request: MobileApiRequest = {
        endpoint: "/decompress-test",
        method: "GET",
        headers: {},
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);
    });
  });

  describe("Network Optimization", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should optimize request for slow network", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: "optimized" }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/optimize-test",
        method: "GET",
        headers: {},
        networkCondition: "slow" as NetworkCondition,
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);

      // Verify optimization was applied
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].timeout).toBeLessThan(mockConfig.timeout);
    });

    it("should batch multiple requests efficiently", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ results: [1, 2, 3] }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const requests: MobileApiRequest[] = [
        { endpoint: "/item/1", method: "GET", headers: {}, cache: { enabled: false } },
        { endpoint: "/item/2", method: "GET", headers: {}, cache: { enabled: false } },
        { endpoint: "/item/3", method: "GET", headers: {}, cache: { enabled: false } },
      ];

      const responses = await apiSystem.batchRequests(requests);
      expect(responses).toHaveLength(3);
      expect(responses.every((r) => r.success)).toBe(true);
    });
  });

  describe("Security", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should validate request signatures when enabled", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: "secure" }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/secure-test",
        method: "POST",
        headers: {},
        body: { sensitive: "data" },
        security: {
          signatureValidation: true,
          encryptPayload: true,
        },
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);

      // Verify security headers were added
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers["X-Signature"]).toBeDefined();
    });

    it("should encrypt sensitive data", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ encrypted: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const sensitiveData = { password: "secret123", token: "abc123" };
      const request: MobileApiRequest = {
        endpoint: "/encrypt-test",
        method: "POST",
        headers: {},
        body: sensitiveData,
        security: {
          encryptPayload: true,
        },
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);

      // Verify data was encrypted
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.password).not.toBe("secret123");
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should enforce rate limits", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: "success" }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/rate-limit-test",
        method: "GET",
        headers: {},
        cache: { enabled: false },
      };

      // Make requests up to the limit
      const promises = Array(mockConfig.security.rateLimiting.maxRequests + 10)
        .fill(null)
        .map(() => apiSystem.request(request));

      const results = await Promise.allSettled(promises);

      // Some requests should be rejected due to rate limiting
      const rejected = results.filter((r) => r.status === "rejected");
      expect(rejected.length).toBeGreaterThan(0);
    });
  });

  describe("Health Check", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should return healthy status when system is working", async () => {
      const health = await apiSystem.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.timestamp).toBeDefined();
      expect(health.responseTime).toBeGreaterThan(0);
    });

    it("should return unhealthy status when system has issues", async () => {
      // Simulate system issue
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("System down"));

      const health = await apiSystem.healthCheck();
      expect(health.healthy).toBe(false);
      expect(health.error).toBeDefined();
    });
  });

  describe("Performance Monitoring", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should track request metrics", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/metrics-test",
        method: "GET",
        headers: {},
        cache: { enabled: false },
      };

      await apiSystem.request(request);

      const metrics = apiSystem.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
    });

    it("should track error rates", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Test error"));

      const request: MobileApiRequest = {
        endpoint: "/error-test",
        method: "GET",
        headers: {},
        retryAttempts: 0,
        cache: { enabled: false },
      };

      try {
        await apiSystem.request(request);
      } catch (error) {
        // Expected error
      }

      const metrics = apiSystem.getMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    beforeEach(async () => {
      await apiSystem.initialize();
    });

    it("should handle empty response body", async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        headers: new Headers(),
        text: jest.fn().mockResolvedValue(""),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/empty-response",
        method: "DELETE",
        headers: {},
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);
      expect(response.status).toBe(204);
    });

    it("should handle malformed JSON response", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const request: MobileApiRequest = {
        endpoint: "/malformed-json",
        method: "GET",
        headers: {},
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(false);
      expect(response.error).toContain("Invalid JSON");
    });

    it("should handle very large payloads", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const largePayload = {
        data: "x".repeat(10 * 1024 * 1024), // 10MB
      };

      const request: MobileApiRequest = {
        endpoint: "/large-payload",
        method: "POST",
        headers: {},
        body: largePayload,
        compression: {
          enabled: true,
          algorithm: "gzip",
          level: 9,
        },
        cache: { enabled: false },
      };

      const response = await apiSystem.request(request);
      expect(response.success).toBe(true);
    });
  });
});
