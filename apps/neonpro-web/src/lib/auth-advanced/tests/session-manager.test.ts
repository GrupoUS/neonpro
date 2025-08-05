// Session Manager Tests
// Story 1.4: Session Management & Security Implementation

import type { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SecurityMonitor } from "../security-monitor";
import type { SessionManager } from "../session-manager";
import type { SessionConfig, SessionData, SessionMetrics } from "../types";

// Mock dependencies
vi.mock("../security-monitor");

describe("SessionManager", () => {
  let sessionManager: SessionManager;
  let mockSecurityMonitor: SecurityMonitor;
  let mockConfig: SessionConfig;

  beforeEach(() => {
    mockSecurityMonitor = new SecurityMonitor({} as any);
    mockConfig = {
      maxSessions: 5,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      extendThreshold: 5 * 60 * 1000, // 5 minutes
      heartbeatInterval: 60 * 1000, // 1 minute
      requireMFA: false,
      requireTrustedDevice: false,
      allowConcurrentSessions: true,
      trackLocation: true,
      logSecurityEvents: true,
      enableRateLimiting: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };

    sessionManager = new SessionManager(mockConfig, mockSecurityMonitor);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a new session successfully", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it("should reject session creation when max sessions exceeded", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      // Create max sessions
      for (let i = 0; i < mockConfig.maxSessions; i++) {
        await sessionManager.createSession({
          ...sessionData,
          deviceId: `device${i}`,
        });
      }

      // Try to create one more
      await expect(
        sessionManager.createSession({
          ...sessionData,
          deviceId: "deviceExtra",
        }),
      ).rejects.toThrow("Maximum number of sessions exceeded");
    });

    it("should require MFA when configured", async () => {
      sessionManager = new SessionManager({ ...mockConfig, requireMFA: true }, mockSecurityMonitor);

      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      await expect(sessionManager.createSession(sessionData)).rejects.toThrow(
        "MFA verification required",
      );
    });

    it("should require trusted device when configured", async () => {
      sessionManager = new SessionManager(
        { ...mockConfig, requireTrustedDevice: true },
        mockSecurityMonitor,
      );

      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: false,
        riskScore: 0.2,
        metadata: {},
      };

      await expect(sessionManager.createSession(sessionData)).rejects.toThrow(
        "Trusted device required",
      );
    });
  });

  describe("getSession", () => {
    it("should retrieve an existing session", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const retrievedSession = await sessionManager.getSession(sessionId);

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(sessionId);
      expect(retrievedSession?.userId).toBe("user123");
      expect(retrievedSession?.isActive).toBe(true);
    });

    it("should return null for non-existent session", async () => {
      const session = await sessionManager.getSession("non-existent");
      expect(session).toBeNull();
    });

    it("should return null for expired session", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);

      // Mock expired session
      vi.spyOn(Date, "now").mockReturnValue(Date.now() + mockConfig.sessionTimeout + 1000);

      const session = await sessionManager.getSession(sessionId);
      expect(session).toBeNull();
    });
  });

  describe("updateActivity", () => {
    it("should update session activity", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const originalSession = await sessionManager.getSession(sessionId);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      const success = await sessionManager.updateActivity(sessionId);
      const updatedSession = await sessionManager.getSession(sessionId);

      expect(success).toBe(true);
      expect(updatedSession?.lastActivity.getTime()).toBeGreaterThan(
        originalSession!.lastActivity.getTime(),
      );
    });

    it("should return false for non-existent session", async () => {
      const success = await sessionManager.updateActivity("non-existent");
      expect(success).toBe(false);
    });
  });

  describe("extendSession", () => {
    it("should extend session when near expiration", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);

      // Mock time near expiration
      vi.spyOn(Date, "now").mockReturnValue(
        Date.now() + mockConfig.sessionTimeout - mockConfig.extendThreshold + 1000,
      );

      const success = await sessionManager.extendSession(sessionId, 30 * 60 * 1000);
      expect(success).toBe(true);
    });

    it("should not extend session when not near expiration", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const success = await sessionManager.extendSession(sessionId, 30 * 60 * 1000);

      expect(success).toBe(false);
    });
  });

  describe("terminateSession", () => {
    it("should terminate an active session", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const success = await sessionManager.terminateSession(sessionId, "user_logout");

      expect(success).toBe(true);

      const session = await sessionManager.getSession(sessionId);
      expect(session?.isActive).toBe(false);
    });

    it("should return false for non-existent session", async () => {
      const success = await sessionManager.terminateSession("non-existent", "user_logout");
      expect(success).toBe(false);
    });
  });

  describe("validateSession", () => {
    it("should validate an active session", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const isValid = await sessionManager.validateSession(sessionId, "192.168.1.1", "Mozilla/5.0");

      expect(isValid).toBe(true);
    });

    it("should invalidate session with mismatched IP", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const isValid = await sessionManager.validateSession(
        sessionId,
        "192.168.1.2", // Different IP
        "Mozilla/5.0",
      );

      expect(isValid).toBe(false);
    });

    it("should invalidate session with mismatched user agent", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);
      const isValid = await sessionManager.validateSession(
        sessionId,
        "192.168.1.1",
        "Chrome/91.0", // Different user agent
      );

      expect(isValid).toBe(false);
    });
  });

  describe("getSessionMetrics", () => {
    it("should return session metrics", async () => {
      const metrics = await sessionManager.getSessionMetrics("user123", "7d");

      expect(metrics).toBeDefined();
      expect(typeof metrics.totalSessions).toBe("number");
      expect(typeof metrics.activeSessions).toBe("number");
      expect(typeof metrics.averageDuration).toBe("number");
      expect(Array.isArray(metrics.securityEvents)).toBe(true);
      expect(Array.isArray(metrics.deviceCount)).toBe(true);
      expect(Array.isArray(metrics.locationData)).toBe(true);
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("should cleanup expired sessions", async () => {
      const sessionData: Omit<SessionData, "id" | "createdAt" | "lastActivity" | "isActive"> = {
        userId: "user123",
        userRole: "user",
        deviceId: "device123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        mfaVerified: false,
        deviceTrusted: true,
        riskScore: 0.2,
        metadata: {},
      };

      const sessionId = await sessionManager.createSession(sessionData);

      // Mock expired time
      vi.spyOn(Date, "now").mockReturnValue(Date.now() + mockConfig.sessionTimeout + 1000);

      const cleanedCount = await sessionManager.cleanupExpiredSessions();
      expect(cleanedCount).toBeGreaterThan(0);

      const session = await sessionManager.getSession(sessionId);
      expect(session).toBeNull();
    });
  });
});
