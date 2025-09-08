/**
 * 🔧 Simple Authentication Test - Mock Validation
 */

import { describe, expect, it, vi } from "vitest";

// Mock the API client module
vi.mock(
  "@neonpro/shared/api-client",
  () => ({
    ApiHelpers: {
      formatError: vi.fn((error: string) => error),
      handleApiError: vi.fn(),
      validateResponse: vi.fn(),
    },
    apiClient: {
      auth: {
        isAuthenticated: vi.fn(() => true),
        login: vi.fn(),
        logout: vi.fn(),
        getUser: vi.fn(),
      },
      api: {
        v1: {
          auth: {
            login: {
              $post: vi.fn(() => Promise.resolve({ ok: true })),
            },
            logout: {
              $post: vi.fn(() => Promise.resolve({ ok: true })),
            },
          },
        },
      },
    },
  }),
);

import { apiClient, ApiHelpers } from "@neonpro/shared/api-client";

describe("mock Validation", () => {
  it("should have properly mocked ApiHelpers.formatError", () => {
    expect(ApiHelpers.formatError).toBeDefined();
    expect(typeof ApiHelpers.formatError).toBe("function");

    const result = ApiHelpers.formatError("test error");
    expect(result).toBe("test error");
  });

  it("should have properly mocked apiClient structure", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.auth).toBeDefined();
    expect(apiClient.api).toBeDefined();
    expect(apiClient.api.v1).toBeDefined();
    expect(apiClient.api.v1.auth).toBeDefined();
    expect(apiClient.api.v1.auth.login).toBeDefined();
    expect(apiClient.api.v1.auth.login.$post).toBeDefined();
    expect(typeof apiClient.api.v1.auth.login.$post).toBe("function");
  });

  it("should have auth methods working", () => {
    expect(apiClient.auth.isAuthenticated).toBeDefined();
    expect(typeof apiClient.auth.isAuthenticated).toBe("function");
    expect(apiClient.auth.isAuthenticated()).toBeTruthy();
  });
});
