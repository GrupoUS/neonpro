// ============================================================================
// Session Management System - Tests
// NeonPro - Session Management & Security
// ============================================================================

import type { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import type { SessionSystem } from "../index";
import type { SessionManager } from "../session-manager";
import type { SecurityMonitor } from "../security-monitor";
import type { DeviceManager } from "../device-manager";
import type { AuditLogger } from "../audit-logger";
import type {
  UserSession,
  DeviceRegistration,
  SessionSecurityEvent,
  SessionConfig,
} from "../types";
import type {
  generateSessionToken,
  generateDeviceId,
  calculateSecurityScore,
  isSessionExpired,
  needsRenewal,
} from "../utils";

// ============================================================================
// MOCKS
// ============================================================================

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    then: vi.fn(),
  })),
  rpc: vi.fn(),
};

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  keys: vi.fn(),
  flushdb: vi.fn(),
};

// Mock EventEmitter
const mockEventEmitter = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  removeAllListeners: vi.fn(),
};

// ============================================================================
// TEST DATA
// ============================================================================

const mockUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  role: "user",
};

const mockClinic = {
  id: "987fcdeb-51a2-43d1-9f12-345678901234",
  name: "Test Clinic",
};

const mockDeviceFingerprint = {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  screen: { width: 1920, height: 1080 },
  timezone: "America/Sao_Paulo",
  language: "pt-BR",
  platform: "Win32",
  plugins: ["Chrome PDF Plugin", "Chrome PDF Viewer"],
  canvas: "canvas_hash_123",
  webgl: "webgl_hash_456",
};

const mockSessionConfig: SessionConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  renewalThreshold: 0.25,
  maxConcurrentSessions: 3,
  requireDeviceVerification: false,
  enableLocationTracking: true,
  enableDeviceFingerprinting: true,
  tokenRotationInterval: 15 * 60 * 1000,
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
  maxSessionDuration: 8 * 60 * 60 * 1000,
  cleanupInterval: 60 * 60 * 1000,
  retainExpiredSessions: 24 * 60 * 60 * 1000,
  redis: {
    enabled: true,
    keyPrefix: "test:session:",
    ttl: 1800,
  },
  lgpd: {
    enabled: true,
    consentRequired: true,
    dataRetentionDays: 365,
    anonymizeAfterDays: 1095,
  },
};

// ============================================================================
// SESSION MANAGER TESTS
// ============================================================================

describe("SessionManager", () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionManager = new SessionManager(
      mockSupabase as any,
      mockRedis as any,
      mockEventEmitter as any,
      mockSessionConfig,
    );
  });

  describe("createSession", () => {
    it("should create a new session successfully", async () => {
      const mockSession: UserSession = {
        id: generateSessionToken(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        sessionToken: generateSessionToken(),
        refreshToken: generateSessionToken(),
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + mockSessionConfig.sessionTimeout),
        lastActivityAt: new Date(),
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          city: "São Paulo",
          country: "Brazil",
          timestamp: new Date(),
        },
        status: "active",
        isSupicious: false,
        securityScore: 100,
        consentVersion: "1.0",
        dataProcessingPurposes: ["authentication", "security"],
      };

      mockSupabase.from().insert().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.createSession({
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          city: "São Paulo",
          country: "Brazil",
          timestamp: new Date(),
        },
      });

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.userId).toBe(mockUser.id);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_sessions");
    });

    it("should handle session creation errors", async () => {
      mockSupabase
        .from()
        .insert()
        .single.mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        });

      const result = await sessionManager.createSession({
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("validateSession", () => {
    it("should validate an active session", async () => {
      const mockSession: UserSession = {
        id: generateSessionToken(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        sessionToken: generateSessionToken(),
        refreshToken: generateSessionToken(),
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        lastActivityAt: new Date(),
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        status: "active",
        isSupicious: false,
        securityScore: 100,
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await sessionManager.validateSession("valid_token");

      expect(result.valid).toBe(true);
      expect(result.session).toBeDefined();
    });

    it("should reject expired sessions", async () => {
      const expiredSession: UserSession = {
        id: generateSessionToken(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        sessionToken: generateSessionToken(),
        refreshToken: generateSessionToken(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        lastActivityAt: new Date(),
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        status: "active",
        isSupicious: false,
        securityScore: 100,
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: expiredSession,
        error: null,
      });

      const result = await sessionManager.validateSession("expired_token");

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("expired");
    });
  });

  describe("renewSession", () => {
    it("should renew a session that needs renewal", async () => {
      const sessionNeedingRenewal: UserSession = {
        id: generateSessionToken(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        sessionToken: generateSessionToken(),
        refreshToken: generateSessionToken(),
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        lastActivityAt: new Date(),
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        status: "active",
        isSupicious: false,
        securityScore: 100,
      };

      const renewedSession = {
        ...sessionNeedingRenewal,
        sessionToken: generateSessionToken(),
        expiresAt: new Date(Date.now() + mockSessionConfig.sessionTimeout),
        updatedAt: new Date(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: sessionNeedingRenewal,
        error: null,
      });

      mockSupabase.from().update().eq().single.mockResolvedValue({
        data: renewedSession,
        error: null,
      });

      const result = await sessionManager.renewSession("token_needing_renewal");

      expect(result.success).toBe(true);
      expect(result.session?.sessionToken).not.toBe(sessionNeedingRenewal.sessionToken);
    });
  });
});

// ============================================================================
// SECURITY MONITOR TESTS
// ============================================================================

describe("SecurityMonitor", () => {
  let securityMonitor: SecurityMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    securityMonitor = new SecurityMonitor(mockSupabase as any, mockEventEmitter as any);
  });

  describe("validateSessionSecurity", () => {
    it("should validate secure session creation", async () => {
      const sessionData = {
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          city: "São Paulo",
          country: "Brazil",
          timestamp: new Date(),
        },
      };

      // Mock no blacklisted IP
      mockSupabase.from().select().eq().mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await securityMonitor.validateSessionSecurity(sessionData);

      expect(result.allowed).toBe(true);
      expect(result.securityScore).toBeGreaterThan(50);
    });

    it("should block blacklisted IP addresses", async () => {
      const sessionData = {
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
      };

      // Mock blacklisted IP
      mockSupabase
        .from()
        .select()
        .eq()
        .mockResolvedValue({
          data: [{ ip_address: "192.168.1.100", reason: "Suspicious activity" }],
          error: null,
        });

      const result = await securityMonitor.validateSessionSecurity(sessionData);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("blacklisted");
    });
  });

  describe("detectSuspiciousActivity", () => {
    it("should detect unusual location access", async () => {
      const currentSession = {
        userId: mockUser.id,
        ipAddress: "192.168.1.100",
        location: {
          latitude: 40.7128, // New York
          longitude: -74.006,
          city: "New York",
          country: "USA",
          timestamp: new Date(),
        },
      };

      const recentSessions = [
        {
          userId: mockUser.id,
          ipAddress: "192.168.1.101",
          location: {
            latitude: -23.5505, // São Paulo
            longitude: -46.6333,
            city: "São Paulo",
            country: "Brazil",
            timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          },
        },
      ];

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
        data: recentSessions,
        error: null,
      });

      const result = await securityMonitor.detectSuspiciousActivity(currentSession as any);

      expect(result.suspicious).toBe(true);
      expect(result.reasons).toContain("impossible_travel");
    });
  });
});

// ============================================================================
// DEVICE MANAGER TESTS
// ============================================================================

describe("DeviceManager", () => {
  let deviceManager: DeviceManager;

  beforeEach(() => {
    vi.clearAllMocks();
    deviceManager = new DeviceManager(mockSupabase as any, mockEventEmitter as any);
  });

  describe("registerDevice", () => {
    it("should register a new device", async () => {
      const deviceData = {
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        deviceName: "Test Device",
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
      };

      const mockDevice: DeviceRegistration = {
        id: generateDeviceId(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        deviceName: "Test Device",
        deviceType: "desktop",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        registrationIp: "192.168.1.100",
        registrationUserAgent: mockDeviceFingerprint.userAgent,
        isTrusted: false,
        isBlocked: false,
        trustLevel: 50,
        sessionCount: 0,
        securityEventsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from().insert().single.mockResolvedValue({
        data: mockDevice,
        error: null,
      });

      const result = await deviceManager.registerDevice(deviceData);

      expect(result.success).toBe(true);
      expect(result.device).toBeDefined();
      expect(result.device?.deviceType).toBe("desktop");
    });
  });

  describe("validateDevice", () => {
    it("should validate a trusted device", async () => {
      const trustedDevice: DeviceRegistration = {
        id: generateDeviceId(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        deviceType: "desktop",
        firstSeenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        lastSeenAt: new Date(),
        registrationIp: "192.168.1.100",
        registrationUserAgent: mockDeviceFingerprint.userAgent,
        isTrusted: true,
        isBlocked: false,
        trustLevel: 90,
        sessionCount: 100,
        securityEventsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: trustedDevice,
        error: null,
      });

      const result = await deviceManager.validateDevice(mockUser.id, mockDeviceFingerprint);

      expect(result.valid).toBe(true);
      expect(result.device?.isTrusted).toBe(true);
      expect(result.trustLevel).toBe(90);
    });

    it("should reject blocked devices", async () => {
      const blockedDevice: DeviceRegistration = {
        id: generateDeviceId(),
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        deviceType: "desktop",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        registrationIp: "192.168.1.100",
        registrationUserAgent: mockDeviceFingerprint.userAgent,
        isTrusted: false,
        isBlocked: true,
        trustLevel: 0,
        sessionCount: 1,
        securityEventsCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: blockedDevice,
        error: null,
      });

      const result = await deviceManager.validateDevice(mockUser.id, mockDeviceFingerprint);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("blocked");
    });
  });
});

// ============================================================================
// UTILITY TESTS
// ============================================================================

describe("Session Utilities", () => {
  describe("generateSessionToken", () => {
    it("should generate valid session tokens", () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();

      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
      expect(/^[a-f0-9]{64}$/.test(token1)).toBe(true);
    });
  });

  describe("calculateSecurityScore", () => {
    it("should calculate security score correctly", () => {
      const highSecurityFactors = {
        deviceTrusted: true,
        locationSuspicious: false,
        ipSuspicious: false,
        recentSecurityEvents: 0,
        sessionAge: 30, // 30 minutes
        fingerprintMatch: 1.0,
      };

      const lowSecurityFactors = {
        deviceTrusted: false,
        locationSuspicious: true,
        ipSuspicious: true,
        recentSecurityEvents: 3,
        sessionAge: 600, // 10 hours
        fingerprintMatch: 0.3,
      };

      const highScore = calculateSecurityScore(highSecurityFactors);
      const lowScore = calculateSecurityScore(lowSecurityFactors);

      expect(highScore).toBeGreaterThan(80);
      expect(lowScore).toBeLessThan(30);
    });
  });

  describe("isSessionExpired", () => {
    it("should correctly identify expired sessions", () => {
      const activeSession: UserSession = {
        id: "test",
        userId: mockUser.id,
        clinicId: mockClinic.id,
        sessionToken: "token",
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        lastActivityAt: new Date(),
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: "test",
        status: "active",
        isSupicious: false,
        securityScore: 100,
      };

      const expiredSession: UserSession = {
        ...activeSession,
        expiresAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      };

      expect(isSessionExpired(activeSession)).toBe(false);
      expect(isSessionExpired(expiredSession)).toBe(true);
    });
  });

  describe("needsRenewal", () => {
    it("should correctly identify sessions needing renewal", () => {
      const sessionNeedingRenewal: UserSession = {
        id: "test",
        userId: mockUser.id,
        clinicId: mockClinic.id,
        sessionToken: "token",
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        lastActivityAt: new Date(),
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: "test",
        status: "active",
        isSupicious: false,
        securityScore: 100,
      };

      const freshSession: UserSession = {
        ...sessionNeedingRenewal,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        expiresAt: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
      };

      expect(needsRenewal(sessionNeedingRenewal, 0.25)).toBe(true);
      expect(needsRenewal(freshSession, 0.25)).toBe(false);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("SessionSystem Integration", () => {
  let sessionSystem: SessionSystem;

  beforeEach(async () => {
    vi.clearAllMocks();
    sessionSystem = new SessionSystem();

    // Initialize with test configuration
    await sessionSystem.initialize({
      supabase: mockSupabase as any,
      redis: mockRedis as any,
      config: mockSessionConfig,
    });
  });

  afterEach(async () => {
    await sessionSystem.shutdown();
  });

  describe("Full Session Lifecycle", () => {
    it("should handle complete session lifecycle", async () => {
      // 1. Create session
      const createResult = await sessionSystem.createSession({
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          city: "São Paulo",
          country: "Brazil",
          timestamp: new Date(),
        },
      });

      expect(createResult.success).toBe(true);
      expect(createResult.session).toBeDefined();

      const sessionToken = createResult.session!.sessionToken;

      // 2. Validate session
      const validateResult = await sessionSystem.validateSession(sessionToken);
      expect(validateResult.valid).toBe(true);

      // 3. Update activity
      const activityResult = await sessionSystem.updateActivity(sessionToken, {
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
      });
      expect(activityResult.success).toBe(true);

      // 4. Terminate session
      const terminateResult = await sessionSystem.terminateSession(sessionToken, "user_logout");
      expect(terminateResult.success).toBe(true);

      // 5. Validate terminated session
      const finalValidateResult = await sessionSystem.validateSession(sessionToken);
      expect(finalValidateResult.valid).toBe(false);
    });
  });

  describe("Security Event Handling", () => {
    it("should handle security events properly", async () => {
      // Create session
      const createResult = await sessionSystem.createSession({
        userId: mockUser.id,
        clinicId: mockClinic.id,
        deviceFingerprint: mockDeviceFingerprint,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
      });

      expect(createResult.success).toBe(true);

      // Simulate security event
      const securityEvent: SessionSecurityEvent = {
        id: "event_123",
        sessionId: createResult.session!.id,
        userId: mockUser.id,
        clinicId: mockClinic.id,
        eventType: "suspicious_login",
        threatLevel: "medium",
        description: "Unusual login pattern detected",
        details: {
          reason: "Multiple failed attempts",
          attempts: 3,
        },
        riskScore: 75,
        ipAddress: "192.168.1.100",
        userAgent: mockDeviceFingerprint.userAgent,
        detectedAt: new Date(),
        createdAt: new Date(),
      };

      // Handle security event
      const eventResult = await sessionSystem.handleSecurityEvent(securityEvent);
      expect(eventResult.success).toBe(true);

      // Check if session security score was updated
      const validateResult = await sessionSystem.validateSession(
        createResult.session!.sessionToken,
      );
      expect(validateResult.session?.securityScore).toBeLessThan(100);
    });
  });
});
