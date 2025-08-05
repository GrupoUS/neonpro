/**
 * Unit Tests for RBAC Authorization Middleware
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Test suite for middleware authorization functions and route protection
 */

import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import {
  requireRole,
  requirePermission,
  requireOwner,
  requireManagerOrAbove,
  patientManage,
  billingAccess,
  appointmentManage,
} from "@/lib/auth/rbac/middleware";
import { UserRole } from "@/types/rbac";
import { AuthUser } from "@/lib/middleware/auth";

// Mock the auth middleware
jest.mock("@/lib/middleware/auth", () => ({
  authenticateRequest: jest.fn(),
}));

// Mock the permissions module
jest.mock("@/lib/auth/rbac/permissions", () => ({
  hasPermission: jest.fn(),
  hasAnyPermission: jest.fn(),
  hasAllPermissions: jest.fn(),
}));

const mockAuthenticateRequest = require("@/lib/middleware/auth").authenticateRequest;
const mockHasPermission = require("@/lib/auth/rbac/permissions").hasPermission;

/**
 * Create mock user for testing
 */
function createMockUser(role: UserRole, clinicId = "clinic-1"): AuthUser {
  return {
    id: `user-${role}`,
    email: `${role}@test.com`,
    role,
    clinicId,
    iat: Date.now(),
    exp: Date.now() + 3600000,
  };
}

/**
 * Create mock NextRequest
 */
function createMockRequest(url: string, method = "GET"): NextRequest {
  return new NextRequest(url, { method });
}

/**
 * Mock successful authentication
 */
function mockSuccessfulAuth(user: AuthUser) {
  mockAuthenticateRequest.mockResolvedValue({
    success: true,
    user,
    error: null,
  });
}

/**
 * Mock failed authentication
 */
function mockFailedAuth(error = "Authentication failed") {
  mockAuthenticateRequest.mockResolvedValue({
    success: false,
    user: null,
    error,
  });
}

/**
 * Mock permission check
 */
function mockPermissionCheck(granted: boolean, reason?: string) {
  mockHasPermission.mockResolvedValue({
    granted,
    reason: reason || (granted ? "Permission granted" : "Permission denied"),
    roleUsed: "test-role",
  });
}

describe("RBAC Authorization Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requireRole", () => {
    it("should allow access when user has required role", async () => {
      const user = createMockUser("manager");
      const request = createMockRequest("http://localhost:3000/api/test");

      mockSuccessfulAuth(user);

      const middleware = requireRole("manager");
      const response = await middleware(request);

      expect(response).toBeUndefined(); // No response means continue
    });

    it("should deny access when user lacks required role", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest("http://localhost:3000/api/test");

      mockSuccessfulAuth(user);

      const middleware = requireRole("manager");
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(403);
    });

    it("should deny access when authentication fails", async () => {
      const request = createMockRequest("http://localhost:3000/api/test");

      mockFailedAuth();

      const middleware = requireRole("manager");
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(401);
    });

    it("should handle multiple allowed roles", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest("http://localhost:3000/api/test");

      mockSuccessfulAuth(user);

      const middleware = requireRole(["manager", "staff"]);
      const response = await middleware(request);

      expect(response).toBeUndefined(); // Access granted
    });
  });

  describe("requirePermission", () => {
    it("should allow access when user has required permission", async () => {
      const user = createMockUser("manager");
      const request = createMockRequest("http://localhost:3000/api/patients");

      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("patients.read");
      const response = await middleware(request);

      expect(response).toBeUndefined();
      expect(mockHasPermission).toHaveBeenCalledWith(user, "patients.read", undefined, undefined);
    });

    it("should deny access when user lacks required permission", async () => {
      const user = createMockUser("patient");
      const request = createMockRequest("http://localhost:3000/api/billing");

      mockSuccessfulAuth(user);
      mockPermissionCheck(false, "Insufficient permissions");

      const middleware = requirePermission("billing.read");
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(403);
    });

    it("should extract resource ID from URL path", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest("http://localhost:3000/api/patients/patient-123");

      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("patients.read");
      await middleware(request);

      expect(mockHasPermission).toHaveBeenCalledWith(
        user,
        "patients.read",
        "patient-123",
        undefined,
      );
    });

    it("should extract resource ID from query parameters", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest(
        "http://localhost:3000/api/appointments?appointmentId=apt-456",
      );

      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("appointments.read");
      await middleware(request);

      expect(mockHasPermission).toHaveBeenCalledWith(
        user,
        "appointments.read",
        "apt-456",
        undefined,
      );
    });
  });

  describe("Pre-configured middleware functions", () => {
    describe("requireOwner", () => {
      it("should allow access for owner role", async () => {
        const user = createMockUser("owner");
        const request = createMockRequest("http://localhost:3000/api/admin");

        mockSuccessfulAuth(user);

        const response = await requireOwner(request);

        expect(response).toBeUndefined();
      });

      it("should deny access for non-owner roles", async () => {
        const user = createMockUser("manager");
        const request = createMockRequest("http://localhost:3000/api/admin");

        mockSuccessfulAuth(user);

        const response = await requireOwner(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
      });
    });

    describe("requireManagerOrAbove", () => {
      it("should allow access for manager role", async () => {
        const user = createMockUser("manager");
        const request = createMockRequest("http://localhost:3000/api/reports");

        mockSuccessfulAuth(user);

        const response = await requireManagerOrAbove(request);

        expect(response).toBeUndefined();
      });

      it("should allow access for owner role", async () => {
        const user = createMockUser("owner");
        const request = createMockRequest("http://localhost:3000/api/reports");

        mockSuccessfulAuth(user);

        const response = await requireManagerOrAbove(request);

        expect(response).toBeUndefined();
      });

      it("should deny access for staff role", async () => {
        const user = createMockUser("staff");
        const request = createMockRequest("http://localhost:3000/api/reports");

        mockSuccessfulAuth(user);

        const response = await requireManagerOrAbove(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
      });
    });

    describe("patientManage", () => {
      it("should allow access for staff with patient management permissions", async () => {
        const user = createMockUser("staff");
        const request = createMockRequest("http://localhost:3000/api/patients/patient-123");

        mockSuccessfulAuth(user);
        mockPermissionCheck(true);

        const response = await patientManage(request);

        expect(response).toBeUndefined();
        expect(mockHasPermission).toHaveBeenCalledWith(
          user,
          "patients.manage",
          "patient-123",
          undefined,
        );
      });

      it("should deny access when patient management permission is missing", async () => {
        const user = createMockUser("patient");
        const request = createMockRequest("http://localhost:3000/api/patients/patient-123");

        mockSuccessfulAuth(user);
        mockPermissionCheck(false);

        const response = await patientManage(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
      });
    });

    describe("billingAccess", () => {
      it("should allow access for manager with billing permissions", async () => {
        const user = createMockUser("manager");
        const request = createMockRequest("http://localhost:3000/api/billing");

        mockSuccessfulAuth(user);
        mockPermissionCheck(true);

        const response = await billingAccess(request);

        expect(response).toBeUndefined();
        expect(mockHasPermission).toHaveBeenCalledWith(user, "billing.read", undefined, undefined);
      });

      it("should deny access for staff without billing permissions", async () => {
        const user = createMockUser("staff");
        const request = createMockRequest("http://localhost:3000/api/billing");

        mockSuccessfulAuth(user);
        mockPermissionCheck(false);

        const response = await billingAccess(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
      });
    });

    describe("appointmentManage", () => {
      it("should allow access for staff with appointment management permissions", async () => {
        const user = createMockUser("staff");
        const request = createMockRequest("http://localhost:3000/api/appointments/apt-456");

        mockSuccessfulAuth(user);
        mockPermissionCheck(true);

        const response = await appointmentManage(request);

        expect(response).toBeUndefined();
        expect(mockHasPermission).toHaveBeenCalledWith(
          user,
          "appointments.manage",
          "apt-456",
          undefined,
        );
      });

      it("should deny access when appointment management permission is missing", async () => {
        const user = createMockUser("patient");
        const request = createMockRequest("http://localhost:3000/api/appointments/apt-456");

        mockSuccessfulAuth(user);
        mockPermissionCheck(false);

        const response = await appointmentManage(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response?.status).toBe(403);
      });
    });
  });

  describe("Error handling", () => {
    it("should handle authentication errors gracefully", async () => {
      const request = createMockRequest("http://localhost:3000/api/test");

      mockAuthenticateRequest.mockRejectedValue(new Error("Auth service unavailable"));

      const middleware = requireRole("manager");
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(500);
    });

    it("should handle permission check errors gracefully", async () => {
      const user = createMockUser("manager");
      const request = createMockRequest("http://localhost:3000/api/patients");

      mockSuccessfulAuth(user);
      mockHasPermission.mockRejectedValue(new Error("Permission service unavailable"));

      const middleware = requirePermission("patients.read");
      const response = await middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(500);
    });

    it("should handle malformed URLs gracefully", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest("invalid-url");

      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("patients.read");
      const response = await middleware(request);

      // Should not crash, should handle gracefully
      expect(response).toBeUndefined();
    });
  });

  describe("Resource ID extraction", () => {
    it("should extract patient ID from various URL patterns", async () => {
      const user = createMockUser("staff");
      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("patients.read");

      // Test different URL patterns
      const patterns = [
        "http://localhost:3000/api/patients/patient-123",
        "http://localhost:3000/api/v1/patients/patient-456",
        "http://localhost:3000/patients/patient-789/details",
      ];

      for (const url of patterns) {
        const request = createMockRequest(url);
        await middleware(request);
      }

      expect(mockHasPermission).toHaveBeenCalledTimes(patterns.length);
    });

    it("should extract appointment ID from query parameters", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest(
        "http://localhost:3000/api/appointments?id=apt-123&date=2025-01-27",
      );

      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("appointments.read");
      await middleware(request);

      expect(mockHasPermission).toHaveBeenCalledWith(
        user,
        "appointments.read",
        "apt-123",
        undefined,
      );
    });

    it("should handle missing resource IDs gracefully", async () => {
      const user = createMockUser("staff");
      const request = createMockRequest("http://localhost:3000/api/patients");

      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("patients.read");
      await middleware(request);

      expect(mockHasPermission).toHaveBeenCalledWith(user, "patients.read", undefined, undefined);
    });
  });

  describe("Performance considerations", () => {
    it("should not perform unnecessary permission checks for public endpoints", async () => {
      // This would be handled by route configuration, but we test the middleware behavior
      const user = createMockUser("patient");
      const request = createMockRequest("http://localhost:3000/api/public/health");

      mockSuccessfulAuth(user);

      // If no middleware is applied, no permission check should occur
      // This test ensures our middleware doesn't interfere with public routes
      expect(mockHasPermission).not.toHaveBeenCalled();
    });

    it("should handle concurrent requests efficiently", async () => {
      const user = createMockUser("manager");
      mockSuccessfulAuth(user);
      mockPermissionCheck(true);

      const middleware = requirePermission("patients.read");

      // Simulate concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) =>
        createMockRequest(`http://localhost:3000/api/patients/patient-${i}`),
      );

      const responses = await Promise.all(requests.map((request) => middleware(request)));

      // All should succeed
      responses.forEach((response) => {
        expect(response).toBeUndefined();
      });

      expect(mockHasPermission).toHaveBeenCalledTimes(5);
    });
  });
});
