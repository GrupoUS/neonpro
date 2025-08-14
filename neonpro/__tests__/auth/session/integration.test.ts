/**
 * Session Management System - Integration Tests
 * 
 * Comprehensive integration test suite for the complete session management system,
 * testing interactions between SessionManager, DeviceManager, and SecurityEventLogger.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { UnifiedSessionSystem } from '../../../lib/auth/session/UnifiedSessionSystem';
import { SessionManager } from '../../../lib/auth/session/SessionManager';
import { DeviceManager } from '../../../lib/auth/session/DeviceManager';
import { SecurityEventLogger } from '../../../lib/auth/session/SecurityEventLogger';
import { 
  createMockSession, 
  createMockDevice, 
  createMockSecurityEvent, 
  createMockUser,
  createTestDatabase, 
  cleanup,
  waitFor
} from './setup';
import type { 
  SessionConfig, 
  DeviceConfig, 
  SecurityConfig,
  SessionData,
  DeviceData
} from '../../../lib/auth/session/types';

// Mock Supabase with comprehensive responses
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        maybeSingle: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      })),
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn()
          }))
        }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      in: jest.fn(() => ({
        select: jest.fn()
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
      in: jest.fn(),
      lt: jest.fn()
    }))
  })),
  rpc: jest.fn(),
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn()
  }
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('Session Management System - Integration Tests', () => {
  let unifiedSystem: UnifiedSessionSystem;
  let sessionManager: SessionManager;
  let deviceManager: DeviceManager;
  let securityLogger: SecurityEventLogger;
  let testDb: ReturnType<typeof createTestDatabase>;
  let testUser: ReturnType<typeof createMockUser>;

  beforeEach(() => {
    testDb = createTestDatabase();
    const seedData = testDb.seed();
    testUser = seedData.user;
    
    const sessionConfig: SessionConfig = {
      maxSessions: 5,
      sessionTimeout: 24 * 60 * 60 * 1000,
      inactivityTimeout: 30 * 60 * 1000,
      extendOnActivity: true,
      requireDeviceVerification: true,
      allowConcurrentSessions: true,
      secureMode: false,
      cookieSettings: {
        name: 'session_token',
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
      }
    };

    const deviceConfig: DeviceConfig = {
      maxDevicesPerUser: 10,
      trustDuration: 30 * 24 * 60 * 60 * 1000,
      requireVerification: true,
      autoTrustSameNetwork: true,
      blockSuspiciousDevices: true,
      fingerprintAlgorithm: 'sha256',
      trackingEnabled: true
    };

    const securityConfig: SecurityConfig = {
      enableLogging: true,
      logLevel: 'info',
      retentionDays: 90,
      alertThresholds: {
        failedLogins: 5,
        suspiciousActivity: 3,
        rateLimit: 10
      },
      autoBlock: {
        enabled: true,
        threshold: 10,
        duration: 24 * 60 * 60 * 1000
      },
      notifications: {
        enabled: true,
        channels: ['email', 'push'],
        severity: 'medium'
      }
    };

    sessionManager = new SessionManager(sessionConfig);
    deviceManager = new DeviceManager(deviceConfig);
    securityLogger = new SecurityEventLogger(securityConfig);
    
    unifiedSystem = new UnifiedSessionSystem({
      session: sessionConfig,
      device: deviceConfig,
      security: securityConfig
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    it('should handle complete login flow with device registration', async () => {
      const loginData = {
        userId: testUser.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceInfo: {
          name: 'Windows Desktop',
          type: 'desktop' as const,
          screen: { width: 1920, height: 1080 },
          timezone: 'America/New_York',
          language: 'en-US'
        }
      };

      // Mock device registration
      const mockDevice = createMockDevice({
        userId: loginData.userId,
        name: loginData.deviceInfo.name,
        type: loginData.deviceInfo.type,
        userAgent: loginData.userAgent
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // Device not found
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockDevice,
        error: null
      });

      // Mock session creation
      const mockSession = createMockSession({
        userId: loginData.userId,
        deviceId: mockDevice.id,
        ipAddress: loginData.ipAddress,
        userAgent: loginData.userAgent
      });

      mockSupabase.from().select().eq().mockResolvedValueOnce({
        data: [], // No existing sessions
        error: null
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockSession,
        error: null
      });

      // Mock security event logging
      const mockSecurityEvent = createMockSecurityEvent({
        userId: loginData.userId,
        sessionId: mockSession.id,
        deviceId: mockDevice.id,
        type: 'login_attempt',
        details: { success: true }
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockSecurityEvent,
        error: null
      });

      // Execute complete login flow
      const result = await unifiedSystem.authenticateUser(loginData);

      expect(result.success).toBe(true);
      expect(result.data?.session).toBeDefined();
      expect(result.data?.device).toBeDefined();
      expect(result.data?.token).toBeDefined();
      
      // Verify all components were called
      expect(mockSupabase.from).toHaveBeenCalledWith('devices');
      expect(mockSupabase.from).toHaveBeenCalledWith('sessions');
      expect(mockSupabase.from).toHaveBeenCalledWith('security_events');
    });

    it('should handle trusted device login', async () => {
      const trustedDevice = createMockDevice({
        userId: testUser.id,
        trusted: true,
        trustExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      const loginData = {
        userId: testUser.id,
        deviceFingerprint: trustedDevice.fingerprint,
        ipAddress: '192.168.1.100',
        userAgent: trustedDevice.userAgent
      };

      // Mock trusted device lookup
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: trustedDevice,
        error: null
      });

      // Mock session creation for trusted device
      const mockSession = createMockSession({
        userId: loginData.userId,
        deviceId: trustedDevice.id,
        ipAddress: loginData.ipAddress,
        userAgent: loginData.userAgent
      });

      mockSupabase.from().select().eq().mockResolvedValueOnce({
        data: [],
        error: null
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockSession,
        error: null
      });

      const result = await unifiedSystem.authenticateWithTrustedDevice(loginData);

      expect(result.success).toBe(true);
      expect(result.data?.requiresVerification).toBe(false);
      expect(result.data?.session).toBeDefined();
    });

    it('should handle suspicious login attempt', async () => {
      const suspiciousLoginData = {
        userId: testUser.id,
        ipAddress: '1.2.3.4', // Different country IP
        userAgent: 'Suspicious Bot/1.0',
        deviceInfo: {
          name: 'Unknown Device',
          type: 'unknown' as const
        }
      };

      // Mock suspicious device detection
      const suspiciousDevice = createMockDevice({
        userId: suspiciousLoginData.userId,
        name: suspiciousLoginData.deviceInfo.name,
        type: suspiciousLoginData.deviceInfo.type,
        userAgent: suspiciousLoginData.userAgent,
        blocked: true,
        blockedReason: 'Suspicious activity detected'
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: suspiciousDevice,
        error: null
      });

      // Mock security event for suspicious activity
      const securityEvent = createMockSecurityEvent({
        userId: suspiciousLoginData.userId,
        type: 'suspicious_activity',
        severity: 'high',
        details: {
          reason: 'Unusual location and user agent',
          ipAddress: suspiciousLoginData.ipAddress,
          userAgent: suspiciousLoginData.userAgent
        }
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: securityEvent,
        error: null
      });

      const result = await unifiedSystem.authenticateUser(suspiciousLoginData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DEVICE_BLOCKED');
      expect(result.data?.securityEvent).toBeDefined();
    });
  });

  describe('Session Lifecycle Management', () => {
    it('should handle session activity updates', async () => {
      const activeSession = createMockSession({
        userId: testUser.id,
        status: 'active'
      });

      // Mock session validation
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: activeSession,
        error: null
      });

      // Mock activity update
      const updatedSession = {
        ...activeSession,
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: updatedSession,
        error: null
      });

      // Mock security event logging
      const activityEvent = createMockSecurityEvent({
        userId: testUser.id,
        sessionId: activeSession.id,
        type: 'session_activity',
        severity: 'low'
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: activityEvent,
        error: null
      });

      const result = await unifiedSystem.updateSessionActivity(activeSession.id);

      expect(result.success).toBe(true);
      expect(result.data?.session.lastActivity).toBeDefined();
      expect(result.data?.securityEvent).toBeDefined();
    });

    it('should handle session termination with cleanup', async () => {
      const activeSession = createMockSession({
        userId: testUser.id,
        status: 'active'
      });

      // Mock session termination
      const terminatedSession = {
        ...activeSession,
        status: 'terminated',
        terminatedAt: new Date().toISOString()
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: terminatedSession,
        error: null
      });

      // Mock security event logging
      const logoutEvent = createMockSecurityEvent({
        userId: testUser.id,
        sessionId: activeSession.id,
        type: 'logout',
        severity: 'low'
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: logoutEvent,
        error: null
      });

      const result = await unifiedSystem.terminateSession(activeSession.id, 'user_logout');

      expect(result.success).toBe(true);
      expect(result.data?.session.status).toBe('terminated');
      expect(result.data?.securityEvent.type).toBe('logout');
    });

    it('should handle bulk session cleanup', async () => {
      const expiredSessions = [
        createMockSession({ 
          id: 'expired-1',
          userId: testUser.id,
          expiresAt: new Date(Date.now() - 60000).toISOString()
        }),
        createMockSession({ 
          id: 'expired-2',
          userId: testUser.id,
          expiresAt: new Date(Date.now() - 120000).toISOString()
        })
      ];

      // Mock expired session query
      mockSupabase.from().select().mockResolvedValueOnce({
        data: expiredSessions,
        error: null
      });

      // Mock bulk session deletion
      mockSupabase.from().delete().in().mockResolvedValueOnce({
        data: null,
        error: null
      });

      // Mock cleanup event logging
      const cleanupEvent = createMockSecurityEvent({
        userId: 'system',
        type: 'session_cleanup',
        severity: 'low',
        details: { cleanedCount: 2 }
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: cleanupEvent,
        error: null
      });

      const result = await unifiedSystem.performCleanup({
        expiredSessions: true,
        inactiveDevices: false,
        oldSecurityEvents: false
      });

      expect(result.success).toBe(true);
      expect(result.data?.sessionsCleanedCount).toBe(2);
    });
  });

  describe('Device Trust Workflow', () => {
    it('should handle device trust verification process', async () => {
      const untrustedDevice = createMockDevice({
        userId: testUser.id,
        trusted: false
      });

      const verificationCode = '123456';
      
      // Mock device trust initiation
      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: untrustedDevice,
        error: null
      });

      // Mock verification code storage (would be in a separate table)
      const verificationResult = await unifiedSystem.initiateDeviceTrust(
        untrustedDevice.id,
        'email'
      );

      expect(verificationResult.success).toBe(true);
      expect(verificationResult.data?.verificationMethod).toBe('email');

      // Mock verification code validation
      const trustedDevice = {
        ...untrustedDevice,
        trusted: true,
        trustExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: trustedDevice,
        error: null
      });

      // Mock trust event logging
      const trustEvent = createMockSecurityEvent({
        userId: testUser.id,
        deviceId: untrustedDevice.id,
        type: 'device_trusted',
        severity: 'medium'
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: trustEvent,
        error: null
      });

      const trustResult = await unifiedSystem.verifyDeviceTrust(
        untrustedDevice.id,
        verificationCode
      );

      expect(trustResult.success).toBe(true);
      expect(trustResult.data?.device.trusted).toBe(true);
    });

    it('should handle automatic trust revocation', async () => {
      const expiredTrustDevice = createMockDevice({
        userId: testUser.id,
        trusted: true,
        trustExpiresAt: new Date(Date.now() - 60000).toISOString() // Expired
      });

      // Mock expired trust detection
      mockSupabase.from().select().mockResolvedValueOnce({
        data: [expiredTrustDevice],
        error: null
      });

      // Mock trust revocation
      const revokedDevice = {
        ...expiredTrustDevice,
        trusted: false,
        trustExpiresAt: null
      };

      mockSupabase.from().update().in().mockResolvedValueOnce({
        data: [revokedDevice],
        error: null
      });

      const result = await unifiedSystem.revokeExpiredTrust();

      expect(result.success).toBe(true);
      expect(result.data?.revokedCount).toBe(1);
    });
  });

  describe('Security Monitoring Integration', () => {
    it('should detect and respond to security threats', async () => {
      const threatData = {
        userId: testUser.id,
        ipAddress: '1.2.3.4',
        userAgent: 'Malicious Bot/1.0',
        attempts: 10
      };

      // Mock threat detection
      const threatEvents = Array.from({ length: 10 }, (_, i) => 
        createMockSecurityEvent({
          userId: threatData.userId,
          type: 'unauthorized_access',
          severity: 'high',
          ipAddress: threatData.ipAddress
        })
      );

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValueOnce({
        data: threatEvents,
        error: null
      });

      // Mock auto-block response
      const blockEvent = createMockSecurityEvent({
        userId: threatData.userId,
        type: 'user_blocked',
        severity: 'critical',
        details: { reason: 'Automated threat response' }
      });

      mockSupabase.from().insert().select().single.mockResolvedValueOnce({
        data: blockEvent,
        error: null
      });

      const result = await unifiedSystem.handleSecurityThreat(threatData);

      expect(result.success).toBe(true);
      expect(result.data?.action).toBe('user_blocked');
      expect(result.data?.severity).toBe('critical');
    });

    it('should generate security reports', async () => {
      const reportPeriod = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date()
      };

      // Mock security events for report
      const securityEvents = [
        createMockSecurityEvent({ type: 'login_attempt', severity: 'low' }),
        createMockSecurityEvent({ type: 'suspicious_activity', severity: 'high' }),
        createMockSecurityEvent({ type: 'device_registered', severity: 'medium' })
      ];

      mockSupabase.from().select().gte().lte().order().limit.mockResolvedValueOnce({
        data: securityEvents,
        error: null
      });

      // Mock statistics
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          totalEvents: 150,
          highSeverityEvents: 25,
          blockedAttempts: 10,
          newDevices: 5
        },
        error: null
      });

      const result = await unifiedSystem.generateSecurityReport(reportPeriod);

      expect(result.success).toBe(true);
      expect(result.data?.summary).toBeDefined();
      expect(result.data?.events).toHaveLength(3);
      expect(result.data?.statistics).toBeDefined();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent session operations', async () => {
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => 
        unifiedSystem.authenticateUser({
          userId: `user-${i}`,
          ipAddress: `192.168.1.${i + 100}`,
          userAgent: 'Test Browser',
          deviceInfo: {
            name: `Device ${i}`,
            type: 'desktop'
          }
        })
      );

      // Mock concurrent responses
      for (let i = 0; i < 10; i++) {
        mockSupabase.from().select().eq().single.mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' }
        });
        
        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: createMockDevice({ userId: `user-${i}` }),
          error: null
        });
        
        mockSupabase.from().select().eq().mockResolvedValueOnce({
          data: [],
          error: null
        });
        
        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: createMockSession({ userId: `user-${i}` }),
          error: null
        });
        
        mockSupabase.from().insert().select().single.mockResolvedValueOnce({
          data: createMockSecurityEvent({ userId: `user-${i}` }),
          error: null
        });
      }

      const results = await Promise.all(concurrentOperations);

      expect(results).toHaveLength(10);
      expect(results.every(result => result.success)).toBe(true);
    });

    it('should maintain performance under load', async () => {
      const startTime = Date.now();
      
      // Simulate high-load scenario
      const operations = [
        unifiedSystem.validateSession('test-token'),
        unifiedSystem.updateSessionActivity('session-123'),
        unifiedSystem.getUserSessions(testUser.id),
        unifiedSystem.getDeviceStats(testUser.id),
        unifiedSystem.getSecurityEvents(testUser.id)
      ];

      // Mock all responses
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: createMockSession(),
        error: null
      });
      
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: createMockSession(),
        error: null
      });
      
      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: [createMockSession()],
        error: null
      });
      
      mockSupabase.rpc.mockResolvedValue({
        data: { total: 5, trusted: 3, blocked: 0 },
        error: null
      });
      
      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: [createMockSecurityEvent()],
        error: null
      });

      await Promise.all(operations);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});