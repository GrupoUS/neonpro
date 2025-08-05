/**
 * Unit Tests for usePermissions React Hook
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Test suite for React hook that manages permissions in frontend components
 */

import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePermissions } from "@/hooks/usePermissions";
import type { UserRole } from "@/types/rbac";

// Mock the auth context
const mockUser = {
  id: "user-1",
  email: "test@example.com",
  role: "manager" as UserRole,
  clinicId: "clinic-1",
  iat: Date.now(),
  exp: Date.now() + 3600000,
};

// Mock the useAuth hook
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

/**
 * Mock successful API response
 */
function mockSuccessfulPermissionCheck(granted: boolean, reason?: string) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      granted,
      reason: reason || (granted ? "Permission granted" : "Permission denied"),
      roleUsed: mockUser.role,
    }),
  } as Response);
}

/**
 * Mock failed API response
 */
function mockFailedPermissionCheck() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({ error: "Internal server error" }),
  } as Response);
}

describe("usePermissions Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage cache
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic permission checking", () => {
    it("should check if user has a specific permission", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      let hasPermission: boolean | undefined;

      await act(async () => {
        hasPermission = await result.current.hasPermission("patients.read");
      });

      expect(hasPermission).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/permissions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission: "patients.read",
          resourceId: undefined,
          context: undefined,
        }),
      });
    });

    it("should return false when user lacks permission", async () => {
      mockSuccessfulPermissionCheck(false);

      const { result } = renderHook(() => usePermissions());

      let hasPermission: boolean | undefined;

      await act(async () => {
        hasPermission = await result.current.hasPermission("billing.manage");
      });

      expect(hasPermission).toBe(false);
    });

    it("should handle API errors gracefully", async () => {
      mockFailedPermissionCheck();

      const { result } = renderHook(() => usePermissions());

      let hasPermission: boolean | undefined;

      await act(async () => {
        hasPermission = await result.current.hasPermission("patients.read");
      });

      expect(hasPermission).toBe(false);
    });

    it("should check permission with resource ID", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.hasPermission("patients.read", "patient-123");
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/permissions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission: "patients.read",
          resourceId: "patient-123",
          context: undefined,
        }),
      });
    });

    it("should check permission with context", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());
      const context = { clinicId: "clinic-2" };

      await act(async () => {
        await result.current.hasPermission("patients.read", undefined, context);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/permissions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission: "patients.read",
          resourceId: undefined,
          context,
        }),
      });
    });
  });

  describe("Multiple permission checking", () => {
    it("should check if user has any of multiple permissions", async () => {
      // Mock multiple API calls
      mockSuccessfulPermissionCheck(false); // First permission denied
      mockSuccessfulPermissionCheck(true); // Second permission granted

      const { result } = renderHook(() => usePermissions());

      let hasAnyPermission: boolean | undefined;

      await act(async () => {
        hasAnyPermission = await result.current.hasAnyPermission([
          "billing.manage",
          "patients.read",
        ]);
      });

      expect(hasAnyPermission).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should return false when user has none of the permissions", async () => {
      mockSuccessfulPermissionCheck(false);
      mockSuccessfulPermissionCheck(false);

      const { result } = renderHook(() => usePermissions());

      let hasAnyPermission: boolean | undefined;

      await act(async () => {
        hasAnyPermission = await result.current.hasAnyPermission([
          "billing.manage",
          "users.manage",
        ]);
      });

      expect(hasAnyPermission).toBe(false);
    });

    it("should check if user has all required permissions", async () => {
      mockSuccessfulPermissionCheck(true);
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      let hasAllPermissions: boolean | undefined;

      await act(async () => {
        hasAllPermissions = await result.current.hasAllPermissions([
          "patients.read",
          "appointments.read",
        ]);
      });

      expect(hasAllPermissions).toBe(true);
    });

    it("should return false when user is missing any required permission", async () => {
      mockSuccessfulPermissionCheck(true); // First permission granted
      mockSuccessfulPermissionCheck(false); // Second permission denied

      const { result } = renderHook(() => usePermissions());

      let hasAllPermissions: boolean | undefined;

      await act(async () => {
        hasAllPermissions = await result.current.hasAllPermissions([
          "patients.read",
          "billing.manage",
        ]);
      });

      expect(hasAllPermissions).toBe(false);
    });
  });

  describe("Role checking", () => {
    it("should check if user has specific role", () => {
      const { result } = renderHook(() => usePermissions());

      const hasRole = result.current.hasRole("manager");

      expect(hasRole).toBe(true);
    });

    it("should return false for different role", () => {
      const { result } = renderHook(() => usePermissions());

      const hasRole = result.current.hasRole("owner");

      expect(hasRole).toBe(false);
    });

    it("should check if user has minimum role level", () => {
      const { result } = renderHook(() => usePermissions());

      const hasMinimumRole = result.current.hasMinimumRole("staff");

      expect(hasMinimumRole).toBe(true); // manager >= staff
    });

    it("should return false when user role is below minimum", () => {
      const { result } = renderHook(() => usePermissions());

      const hasMinimumRole = result.current.hasMinimumRole("owner");

      expect(hasMinimumRole).toBe(false); // manager < owner
    });
  });

  describe("Feature access checking", () => {
    it("should check if user can access a feature", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      let canAccess: boolean | undefined;

      await act(async () => {
        canAccess = await result.current.canAccess("patient-management");
      });

      expect(canAccess).toBe(true);
    });

    it("should check if user can manage a resource", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      let canManage: boolean | undefined;

      await act(async () => {
        canManage = await result.current.canManage("patients", "patient-123");
      });

      expect(canManage).toBe(true);
    });

    it("should check if user can view a resource", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      let canView: boolean | undefined;

      await act(async () => {
        canView = await result.current.canView("billing");
      });

      expect(canView).toBe(true);
    });
  });

  describe("Caching", () => {
    it("should cache permission results", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      // First call
      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      // Second call (should use cache)
      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      // Should only make one API call due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should clear cache when requested", async () => {
      mockSuccessfulPermissionCheck(true);
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      // First call
      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      // Second call (should make new API call)
      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should use localStorage for persistent caching", async () => {
      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      // Check if result was cached in localStorage
      const cacheKey = `perm_cache_${mockUser.id}_patients.read_undefined_undefined`;
      const cachedResult = localStorage.getItem(cacheKey);

      expect(cachedResult).toBeTruthy();

      if (cachedResult) {
        const parsed = JSON.parse(cachedResult);
        expect(parsed.granted).toBe(true);
      }
    });

    it("should respect cache expiration", async () => {
      // Set up expired cache entry
      const cacheKey = `perm_cache_${mockUser.id}_patients.read_undefined_undefined`;
      const expiredCache = {
        granted: true,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (expired)
        roleUsed: "manager",
      };
      localStorage.setItem(cacheKey, JSON.stringify(expiredCache));

      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      // Should make API call despite cache due to expiration
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading states", () => {
    it("should track loading state during permission checks", async () => {
      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ granted: true, roleUsed: "manager" }),
                } as Response),
              100,
            ),
          ),
      );

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.hasPermission("patients.read");
      });

      // Should be loading immediately after call
      expect(result.current.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => usePermissions());

      let hasPermission: boolean | undefined;

      await act(async () => {
        hasPermission = await result.current.hasPermission("patients.read");
      });

      expect(hasPermission).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it("should clear errors on successful requests", async () => {
      // First request fails
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      expect(result.current.error).toBeTruthy();

      // Second request succeeds
      mockSuccessfulPermissionCheck(true);

      await act(async () => {
        await result.current.hasPermission("appointments.read");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty permission arrays", async () => {
      const { result } = renderHook(() => usePermissions());

      const hasAny = await result.current.hasAnyPermission([]);
      const hasAll = await result.current.hasAllPermissions([]);

      expect(hasAny).toBe(false);
      expect(hasAll).toBe(true); // Vacuous truth
    });

    it("should handle undefined user gracefully", () => {
      // Mock useAuth to return no user
      jest.doMock("@/hooks/useAuth", () => ({
        useAuth: () => ({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }),
      }));

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasRole("manager")).toBe(false);
      expect(result.current.hasMinimumRole("staff")).toBe(false);
    });

    it("should handle malformed cache data", async () => {
      // Set malformed cache data
      const cacheKey = `perm_cache_${mockUser.id}_patients.read_undefined_undefined`;
      localStorage.setItem(cacheKey, "invalid-json");

      mockSuccessfulPermissionCheck(true);

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.hasPermission("patients.read");
      });

      // Should make API call despite cache due to malformed data
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
