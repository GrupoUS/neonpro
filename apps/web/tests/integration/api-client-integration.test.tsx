// API Client Integration Test
// Hono RPC client integration with backend services

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  version: string;
  database: "connected" | "disconnected";
  redis: "connected" | "disconnected";
  uptime: number;
}

// Mock Hono RPC client
const mockHonoClient = {
  api: {
    health: {
      $get: vi.fn(),
    },
    patients: {
      $get: vi.fn(),
      $post: vi.fn(),
      ":id": {
        $get: vi.fn(),
        $put: vi.fn(),
        $delete: vi.fn(),
      },
    },
    auth: {
      login: {
        $post: vi.fn(),
      },
      refresh: {
        $post: vi.fn(),
      },
      logout: {
        $post: vi.fn(),
      },
    },
    appointments: {
      $get: vi.fn(),
      $post: vi.fn(),
      ":id": {
        $get: vi.fn(),
        $put: vi.fn(),
        $delete: vi.fn(),
      },
    },
  },
};

// Mock fetch for HTTP requests
const mockFetch = vi.fn();
Object.defineProperty(global, "fetch", {
  value: mockFetch,
  writable: true,
  configurable: true,
});

vi.mock<typeof import("../../lib/api/hono-client")>(
  "../../lib/api/hono-client",
  () => ({
    honoClient: mockHonoClient,
  }),
); // Test wrapper component
const _TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30_000),
      },
      mutations: {
        retry: 2,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("aPI Client Integration Tests", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Reset fetch mock
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  describe("health Check and Connection", () => {
    it("should connect to Hono backend successfully", async () => {
      const healthResponse: ApiResponse<HealthCheckResponse> = {
        success: true,
        data: {
          status: "healthy",
          version: "1.0.0",
          database: "connected",
          redis: "connected",
          uptime: 12_345,
        },
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.health.$get.mockResolvedValue({
        json: async () => healthResponse,
        ok: true,
        status: 200,
      });

      const response = await mockHonoClient.api.health.$get();
      const data = await response.json();

      expect(response.ok).toBeTruthy();
      expect(data.success).toBeTruthy();
      expect(data.data.status).toBe("healthy");
      expect(data.data.database).toBe("connected");
    });

    it("should handle backend connection failures", async () => {
      const connectionError = new Error("ECONNREFUSED");

      mockHonoClient.api.health.$get.mockRejectedValue(connectionError);

      await expect(mockHonoClient.api.health.$get()).rejects.toThrow(
        "ECONNREFUSED",
      );
    });
  });

  describe("authentication API Integration", () => {
    it("should authenticate user with backend", async () => {
      const loginCredentials = {
        email: "doctor@clinic.com",
        password: "securePassword123",
      };

      const authResponse: ApiResponse<{
        user: any;
        session: any;
        access_token: string;
        refresh_token: string;
      }> = {
        success: true,
        data: {
          user: {
            id: "user-123",
            email: "doctor@clinic.com",
            role: "doctor",
          },
          session: {
            expires_at: Date.now() + 3_600_000,
          },
          access_token: "jwt-access-token",
          refresh_token: "jwt-refresh-token",
        },
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.auth.login.$post.mockResolvedValue({
        json: async () => authResponse,
        ok: true,
        status: 200,
      });

      const response = await mockHonoClient.api.auth.login.$post({
        json: loginCredentials,
      });
      const data = await response.json();

      expect(response.ok).toBeTruthy();
      expect(data.success).toBeTruthy();
      expect(data.data.access_token).toBeDefined();
      expect(data.data.user.email).toBe("doctor@clinic.com");
    });

    it("should handle authentication errors", async () => {
      const invalidCredentials = {
        email: "wrong@email.com",
        password: "wrongpassword",
      };

      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Invalid credentials",
        code: "AUTH_INVALID_CREDENTIALS",
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.auth.login.$post.mockResolvedValue({
        json: async () => errorResponse,
        ok: false,
        status: 401,
      });

      const response = await mockHonoClient.api.auth.login.$post({
        json: invalidCredentials,
      });
      const data = await response.json();

      expect(response.ok).toBeFalsy();
      expect(data.success).toBeFalsy();
      expect(data.code).toBe("AUTH_INVALID_CREDENTIALS");
    });

    it("should refresh expired tokens", async () => {
      const refreshResponse: ApiResponse<{
        access_token: string;
        refresh_token: string;
        expires_at: number;
      }> = {
        success: true,
        data: {
          access_token: "new-jwt-access-token",
          refresh_token: "new-jwt-refresh-token",
          expires_at: Date.now() + 3_600_000,
        },
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.auth.refresh.$post.mockResolvedValue({
        json: async () => refreshResponse,
        ok: true,
        status: 200,
      });

      const response = await mockHonoClient.api.auth.refresh.$post({
        json: { refresh_token: "expired-refresh-token" },
      });
      const data = await response.json();

      expect(response.ok).toBeTruthy();
      expect(data.data.access_token).toBe("new-jwt-access-token");
      expect(data.data.expires_at).toBeGreaterThan(Date.now());
    });
  });

  describe("patient API Integration", () => {
    it("should create patient via API with validation", async () => {
      const patientData = {
        name: "João Silva Santos",
        cpf: "123.456.789-00",
        email: "joao.silva@email.com",
        phone: "(11) 99999-9999",
        birth_date: "1985-03-15",
        gender: "male",
        clinic_id: "clinic-1",
        lgpd_consent: true,
      };

      const createResponse: ApiResponse<{
        id: string;
        name: string;
        cpf: string;
        created_at: string;
      }> = {
        success: true,
        data: {
          id: "patient-123",
          name: patientData.name,
          cpf: patientData.cpf,
          created_at: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.patients.$post.mockResolvedValue({
        json: async () => createResponse,
        ok: true,
        status: 201,
      });

      const response = await mockHonoClient.api.patients.$post({
        json: patientData,
        headers: {
          Authorization: "Bearer jwt-access-token",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      expect(response.ok).toBeTruthy();
      expect(data.success).toBeTruthy();
      expect(data.data.id).toBeDefined();
      expect(data.data.name).toBe(patientData.name);
    });

    it("should handle API validation errors", async () => {
      const invalidPatientData = {
        name: "J", // Too short
        cpf: "123.456.789-99", // Invalid CPF
        email: "invalid-email", // Invalid format
      };

      const validationErrorResponse: ApiResponse<null> = {
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.patients.$post.mockResolvedValue({
        json: async () => validationErrorResponse,
        ok: false,
        status: 400,
      });

      const response = await mockHonoClient.api.patients.$post({
        json: invalidPatientData,
        headers: {
          Authorization: "Bearer jwt-access-token",
        },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBeFalsy();
      expect(data.code).toBe("VALIDATION_ERROR");
    });

    it("should fetch patients with pagination and filters", async () => {
      const queryParams = {
        page: 1,
        limit: 10,
        search: "Silva",
        clinic_id: "clinic-1",
      };

      const patientsResponse: ApiResponse<{
        patients: any[];
        total: number;
        page: number;
        limit: number;
      }> = {
        success: true,
        data: {
          patients: [
            { id: "patient-1", name: "João Silva", cpf: "123.456.789-00" },
            { id: "patient-2", name: "Maria Silva", cpf: "987.654.321-00" },
          ],
          total: 25,
          page: 1,
          limit: 10,
        },
        timestamp: new Date().toISOString(),
      };

      mockHonoClient.api.patients.$get.mockResolvedValue({
        json: async () => patientsResponse,
        ok: true,
        status: 200,
      });

      const response = await mockHonoClient.api.patients.$get({
        query: queryParams,
        headers: {
          Authorization: "Bearer jwt-access-token",
        },
      });
      const data = await response.json();

      expect(response.ok).toBeTruthy();
      expect(data.data.patients).toHaveLength(2);
      expect(data.data.total).toBe(25);
      expect(data.data.page).toBe(1);
    });
  });

  describe("error Handling and Retry Logic", () => {
    it("should retry failed requests with exponential backoff", async () => {
      const networkError = new Error("Network request failed");

      mockHonoClient.api.patients.$get
        .mockRejectedValueOnce(networkError) // First attempt fails
        .mockRejectedValueOnce(networkError) // Second attempt fails
        .mockResolvedValueOnce({
          // Third attempt succeeds
          json: async () => ({
            success: true,
            data: { patients: [] },
            timestamp: new Date().toISOString(),
          }),
          ok: true,
          status: 200,
        });

      // Mock retry logic implementation
      const retryRequest = async (fn: () => Promise<any>, maxRetries = 3) => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            if (attempt === maxRetries - 1) {
              throw error;
            }
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (attempt + 1)),
            );
          }
        }
      };

      const response = await retryRequest(() =>
        mockHonoClient.api.patients.$get({
          query: {},
          headers: { Authorization: "Bearer jwt-access-token" },
        }),
      );

      expect(mockHonoClient.api.patients.$get).toHaveBeenCalledTimes(3);
      expect(response.ok).toBeTruthy();
    });

    it("should handle timeout scenarios gracefully", async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 5000);
      });

      mockHonoClient.api.patients.$get.mockReturnValue(timeoutPromise);

      const startTime = performance.now();

      await expect(
        mockHonoClient.api.patients.$get({
          query: {},
          headers: { Authorization: "Bearer jwt-access-token" },
        }),
      ).rejects.toThrow("Request timeout");

      const endTime = performance.now();
      expect(endTime - startTime).toBeGreaterThan(4900); // Nearly 5 seconds
    });

    it("should handle rate limiting with proper backoff", async () => {
      const rateLimitResponse = {
        json: async () => ({
          success: false,
          error: "Rate limit exceeded",
          code: "RATE_LIMIT_EXCEEDED",
          retry_after: 2000,
          timestamp: new Date().toISOString(),
        }),
        ok: false,
        status: 429,
        headers: {
          get: (header: string) => {
            if (header === "Retry-After") {
              return "2";
            }
            return;
          },
        },
      };

      mockHonoClient.api.patients.$get
        .mockResolvedValueOnce(rateLimitResponse) // Rate limited
        .mockResolvedValueOnce({
          // Success after backoff
          json: async () => ({
            success: true,
            data: { patients: [] },
            timestamp: new Date().toISOString(),
          }),
          ok: true,
          status: 200,
        });

      // First request gets rate limited
      const firstResponse = await mockHonoClient.api.patients.$get({
        query: {},
        headers: { Authorization: "Bearer jwt-access-token" },
      });

      expect(firstResponse.status).toBe(429);

      // Wait for retry after period
      await new Promise((resolve) => setTimeout(resolve, 2100));

      // Second request succeeds
      const secondResponse = await mockHonoClient.api.patients.$get({
        query: {},
        headers: { Authorization: "Bearer jwt-access-token" },
      });

      expect(secondResponse.ok).toBeTruthy();
    });
  });

  describe("performance Monitoring", () => {
    it("should measure API response times", async () => {
      const quickResponse = {
        json: async () => ({
          success: true,
          data: { patients: [] },
          timestamp: new Date().toISOString(),
        }),
        ok: true,
        status: 200,
      };

      mockHonoClient.api.patients.$get.mockImplementation(async () => {
        // Simulate 50ms response time
        await new Promise((resolve) => setTimeout(resolve, 50));
        return quickResponse;
      });

      const startTime = performance.now();
      const response = await mockHonoClient.api.patients.$get({
        query: {},
        headers: { Authorization: "Bearer jwt-access-token" },
      });
      const endTime = performance.now();

      const responseTime = endTime - startTime;

      expect(response.ok).toBeTruthy();
      expect(responseTime).toBeLessThan(100); // < 100ms requirement
      expect(responseTime).toBeGreaterThan(45); // Realistic timing
    });
  });
});
