/**
 * SessionManager Unit Tests
 *
 * Comprehensive test suite for the SessionManager class,
 * covering session creation, validation, cleanup, and security features.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { SessionManager } from "../../../lib/auth/session/SessionManager";
import { createMockSession, createMockDevice, createTestDatabase, cleanup } from "./setup";
import type { SessionConfig, SessionData, DeviceData } from "../../../lib/auth/session/types";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        maybeSingle: jest.fn(),
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
  rpc: jest.fn(),
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let testDb: ReturnType<typeof createTestDatabase>;
  let mockConfig: SessionConfig;

  beforeEach(() => {
    testDb = createTestDatabase();

    mockConfig = {
      maxSessions: 5,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      extendOnActivity: true,
      requireDeviceVerification: false,
      allowConcurrentSessions: true,
      secureMode: false,
      cookieSettings: {
        name: "session_token",
        secure: false,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    };

    sessionManager = new SessionManager(mockConfig);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe("Session Creation", () => {
    it("should create a new session successfully", async () => {
      const sessionData = {
        userId: "user-123",
        deviceId: "device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      };

      const mockSession = createMockSession(sessionData);

      // Mock Supabase response
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.createSession(sessionData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        userId: sessionData.userId,
        deviceId: sessionData.deviceId,
        status: "active",
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("sessions");
    });

    it("should generate unique session tokens", async () => {
      const sessionData = {
        userId: "user-123",
        deviceId: "device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      };

      const tokens = new Set();

      for (let i = 0; i < 10; i++) {
        const mockSession = createMockSession({ ...sessionData, id: `session-${i}` });
        mockSupabase.from().insert().select().single.mockResolvedValue({
          data: mockSession,
          error: null,
        });

        const result = await sessionManager.createSession(sessionData);
        if (result.success && result.token) {
          tokens.add(result.token);
        }
      }

      expect(tokens.size).toBe(10); // All tokens should be unique
    });

    it("should enforce maximum session limit", async () => {
      const sessionData = {
        userId: "user-123",
        deviceId: "device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      };

      // Mock existing sessions at limit
      const existingSessions = Array.from({ length: 5 }, (_, i) =>
        createMockSession({ ...sessionData, id: `session-${i}` }),
      );

      mockSupabase.from().select().eq().mockResolvedValue({
        data: existingSessions,
        error: null,
      });

      const result = await sessionManager.createSession(sessionData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SESSION_LIMIT_EXCEEDED");
    });
  });

  describe("Session Validation", () => {
    it("should validate active session successfully", async () => {
      const mockSession = createMockSession({
        status: "active",
        expiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.validateSession("valid-token");

      expect(result.valid).toBe(true);
      expect(result.session).toMatchObject(mockSession);
    });

    it("should reject expired session", async () => {
      const mockSession = createMockSession({
        status: "active",
        expiresAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.validateSession("expired-token");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("expired");
    });

    it("should reject inactive session", async () => {
      const mockSession = createMockSession({
        status: "inactive",
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.validateSession("inactive-token");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("inactive");
    });

    it("should handle non-existent session", async () => {
      mockSupabase
        .from()
        .select()
        .eq()
        .single.mockResolvedValue({
          data: null,
          error: { code: "PGRST116" }, // Not found
        });

      const result = await sessionManager.validateSession("non-existent-token");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("not_found");
    });
  });

  describe("Session Updates", () => {
    it("should update session activity", async () => {
      const mockSession = createMockSession();
      const updatedSession = {
        ...mockSession,
        lastActivity: new Date().toISOString(),
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: updatedSession,
        error: null,
      });

      const result = await sessionManager.updateActivity("session-123");

      expect(result.success).toBe(true);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          lastActivity: expect.any(String),
        }),
      );
    });

    it("should extend session expiration on activity", async () => {
      const mockSession = createMockSession();
      const futureExpiration = new Date(Date.now() + mockConfig.sessionTimeout).toISOString();

      const updatedSession = {
        ...mockSession,
        expiresAt: futureExpiration,
        lastActivity: new Date().toISOString(),
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: updatedSession,
        error: null,
      });

      const result = await sessionManager.updateActivity("session-123");

      expect(result.success).toBe(true);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(String),
          lastActivity: expect.any(String),
        }),
      );
    });
  });

  describe("Session Termination", () => {
    it("should terminate single session", async () => {
      mockSupabase
        .from()
        .update()
        .eq()
        .select()
        .single.mockResolvedValue({
          data: { ...createMockSession(), status: "terminated" },
          error: null,
        });

      const result = await sessionManager.terminateSession("session-123");

      expect(result.success).toBe(true);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "terminated",
          terminatedAt: expect.any(String),
        }),
      );
    });

    it("should terminate all user sessions", async () => {
      const mockSessions = [
        createMockSession({ id: "session-1" }),
        createMockSession({ id: "session-2" }),
        createMockSession({ id: "session-3" }),
      ];

      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockSessions,
        error: null,
      });

      mockSupabase
        .from()
        .update()
        .in()
        .mockResolvedValue({
          data: mockSessions.map((s) => ({ ...s, status: "terminated" })),
          error: null,
        });

      const result = await sessionManager.terminateAllSessions("user-123");

      expect(result.success).toBe(true);
      expect(result.data?.terminatedCount).toBe(3);
    });
  });

  describe("Session Cleanup", () => {
    it("should clean up expired sessions", async () => {
      const expiredSessions = [
        createMockSession({
          id: "expired-1",
          expiresAt: new Date(Date.now() - 60000).toISOString(),
        }),
        createMockSession({
          id: "expired-2",
          expiresAt: new Date(Date.now() - 120000).toISOString(),
        }),
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: expiredSessions,
        error: null,
      });

      mockSupabase.from().delete().eq().mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await sessionManager.cleanupExpiredSessions();

      expect(result.success).toBe(true);
      expect(result.data?.cleanedCount).toBe(2);
    });

    it("should clean up inactive sessions", async () => {
      const inactiveSessions = [
        createMockSession({
          id: "inactive-1",
          lastActivity: new Date(Date.now() - mockConfig.inactivityTimeout - 60000).toISOString(),
        }),
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: inactiveSessions,
        error: null,
      });

      mockSupabase
        .from()
        .update()
        .in()
        .mockResolvedValue({
          data: inactiveSessions.map((s) => ({ ...s, status: "inactive" })),
          error: null,
        });

      const result = await sessionManager.cleanupInactiveSessions();

      expect(result.success).toBe(true);
      expect(result.data?.inactiveCount).toBe(1);
    });
  });

  describe("Session Queries", () => {
    it("should get user sessions", async () => {
      const userSessions = [
        createMockSession({ id: "session-1", userId: "user-123" }),
        createMockSession({ id: "session-2", userId: "user-123" }),
      ];

      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: userSessions,
        error: null,
      });

      const result = await sessionManager.getUserSessions("user-123");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].userId).toBe("user-123");
    });

    it("should get session statistics", async () => {
      const mockStats = {
        total: 100,
        active: 85,
        inactive: 10,
        expired: 5,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await sessionManager.getSessionStats();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockStats);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockSupabase
        .from()
        .insert()
        .select()
        .single.mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        });

      const result = await sessionManager.createSession({
        userId: "user-123",
        deviceId: "device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Database connection failed");
    });

    it("should handle invalid input data", async () => {
      const result = await sessionManager.createSession({
        userId: "", // Invalid empty userId
        deviceId: "device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Security Features", () => {
    it("should detect suspicious activity patterns", async () => {
      // Mock multiple rapid session creation attempts
      const sessionData = {
        userId: "user-123",
        deviceId: "device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      };

      // Simulate rate limiting
      for (let i = 0; i < 10; i++) {
        mockSupabase
          .from()
          .insert()
          .select()
          .single.mockResolvedValue({
            data: null,
            error: { code: "RATE_LIMIT_EXCEEDED" },
          });

        const result = await sessionManager.createSession(sessionData);

        if (i > 5) {
          // After 5 attempts, should be rate limited
          expect(result.success).toBe(false);
          expect(result.error?.code).toBe("RATE_LIMIT_EXCEEDED");
        }
      }
    });

    it("should validate session token format", async () => {
      const invalidTokens = [
        "", // Empty
        "short", // Too short
        "invalid-format-token", // Invalid format
        null, // Null
        undefined, // Undefined
      ];

      for (const token of invalidTokens) {
        const result = await sessionManager.validateSession(token as any);
        expect(result.valid).toBe(false);
        expect(result.reason).toBe("invalid_token");
      }
    });
  });
});
