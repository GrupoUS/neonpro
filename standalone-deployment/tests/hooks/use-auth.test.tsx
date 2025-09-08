/**
 * 🔐 Fixed Authentication Hook Tests - NeonPro Healthcare
 * ======================================================
 *
 * Using official TanStack Query testing patterns
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the hook we're testing
import { ApiHelpers } from "@neonpro/shared/api-client";
import { useAuth } from "../../hooks/enhanced/use-auth";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/test",
}));

describe("useAuth Hook - NeonPro Healthcare Authentication", () => {
  const createWrapper = () => {
    // Create QueryClient with official testing configuration
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // ✅ turns retries off
          gcTime: 0, // ✅ prevent cache persistence between tests
          staleTime: 0, // ✅ always refetch for tests
        },
        mutations: {
          retry: false, // ✅ no mutation retries in tests
        },
      },
    });

    return ({ children }: { children: ReactNode; }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("authentication Flow - Basic", () => {
    it("should initialize with unauthenticated state", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBeFalsy();
      expect(result.current.user).toBeNull();
      expect(result.current.loginError).toBeNull();
    });

    it("should have login function available", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loginAsync).toBeDefined();
      expect(typeof result.current.loginAsync).toBe("function");
    });

    it("should have logout function available", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.logoutAsync).toBeDefined();
      expect(typeof result.current.logoutAsync).toBe("function");
    });
  });

  describe("error Handling", () => {
    it("should handle ApiHelpers.formatError without throwing", () => {
      // Use ApiHelpers directly without top-level await in test body
      const formattedError = ApiHelpers.formatError("test error");
      expect(formattedError).toBe("test error");
    });
  });
});
