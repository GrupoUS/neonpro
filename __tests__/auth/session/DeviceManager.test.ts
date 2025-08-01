/**
 * DeviceManager Unit Tests
 * 
 * Comprehensive test suite for the DeviceManager class,
 * covering device registration, trust management, and security features.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { DeviceManager } from '../../../lib/auth/session/DeviceManager';
import { createMockDevice, createTestDatabase, cleanup } from './setup';
import type { DeviceConfig, DeviceData } from '../../../lib/auth/session/types';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        maybeSingle: jest.fn()
      })),
      in: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn()
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
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  })),
  rpc: jest.fn()
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('DeviceManager', () => {
  let deviceManager: DeviceManager;
  let testDb: ReturnType<typeof createTestDatabase>;
  let mockConfig: DeviceConfig;

  beforeEach(() => {
    testDb = createTestDatabase();
    
    mockConfig = {
      maxDevicesPerUser: 10,
      trustDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      requireVerification: false,
      autoTrustSameNetwork: false,
      blockSuspiciousDevices: true,
      fingerprintAlgorithm: 'sha256',
      trackingEnabled: true
    };

    deviceManager = new DeviceManager(mockConfig);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('Device Registration', () => {
    it('should register a new device successfully', async () => {
      const deviceData = {
        userId: 'user-123',
        fingerprint: 'device-fingerprint-123',
        name: 'Test Device',
        type: 'desktop' as const,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };

      const mockDevice = createMockDevice(deviceData);
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockDevice,
        error: null
      });

      const result = await deviceManager.registerDevice(deviceData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        userId: deviceData.userId,
        fingerprint: deviceData.fingerprint,
        name: deviceData.name,
        type: deviceData.type
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('devices');
    });

    it('should detect existing device by fingerprint', async () => {
      const existingDevice = createMockDevice({
        fingerprint: 'existing-fingerprint',
        userId: 'user-123'
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: existingDevice,
        error: null
      });

      const result = await deviceManager.getDeviceByFingerprint('existing-fingerprint');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(existingDevice);
    });

    it('should enforce device limit per user', async () => {
      const existingDevices = Array.from({ length: 10 }, (_, i) => 
        createMockDevice({ 
          id: `device-${i}`,
          userId: 'user-123',
          fingerprint: `fingerprint-${i}`
        })
      );

      mockSupabase.from().select().eq().mockResolvedValue({
        data: existingDevices,
        error: null
      });

      const deviceData = {
        userId: 'user-123',
        fingerprint: 'new-device-fingerprint',
        name: 'New Device',
        type: 'mobile' as const,
        userAgent: 'Mobile Browser'
      };

      const result = await deviceManager.registerDevice(deviceData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DEVICE_LIMIT_EXCEEDED');
    });

    it('should generate unique device fingerprints', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      ];

      const fingerprints = userAgents.map(ua => 
        deviceManager.generateFingerprint({
          userAgent: ua,
          screen: { width: 1920, height: 1080 },
          timezone: 'America/New_York',
          language: 'en-US'
        })
      );

      // All fingerprints should be unique
      const uniqueFingerprints = new Set(fingerprints);
      expect(uniqueFingerprints.size).toBe(fingerprints.length);
    });
  });

  describe('Device Trust Management', () => {
    it('should trust a device successfully', async () => {
      const mockDevice = createMockDevice({ trusted: false });
      const trustedDevice = {
        ...mockDevice,
        trusted: true,
        trustExpiresAt: new Date(Date.now() + mockConfig.trustDuration).toISOString()
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: trustedDevice,
        error: null
      });

      const result = await deviceManager.trustDevice('device-123');

      expect(result.success).toBe(true);
      expect(result.data?.trusted).toBe(true);
      expect(result.data?.trustExpiresAt).toBeDefined();
    });

    it('should revoke device trust', async () => {
      const mockDevice = createMockDevice({ trusted: true });
      const untrustedDevice = {
        ...mockDevice,
        trusted: false,
        trustExpiresAt: null
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: untrustedDevice,
        error: null
      });

      const result = await deviceManager.revokeTrust('device-123');

      expect(result.success).toBe(true);
      expect(result.data?.trusted).toBe(false);
      expect(result.data?.trustExpiresAt).toBeNull();
    });

    it('should check if device trust is expired', () => {
      const expiredDevice = createMockDevice({
        trusted: true,
        trustExpiresAt: new Date(Date.now() - 60000).toISOString() // 1 minute ago
      });

      const validDevice = createMockDevice({
        trusted: true,
        trustExpiresAt: new Date(Date.now() + 60000).toISOString() // 1 minute from now
      });

      expect(deviceManager.isTrustExpired(expiredDevice)).toBe(true);
      expect(deviceManager.isTrustExpired(validDevice)).toBe(false);
    });

    it('should auto-trust devices on same network', async () => {
      // Configure auto-trust for same network
      const configWithAutoTrust = {
        ...mockConfig,
        autoTrustSameNetwork: true
      };
      
      deviceManager = new DeviceManager(configWithAutoTrust);

      const existingDevice = createMockDevice({
        userId: 'user-123',
        trusted: true,
        metadata: { lastIpAddress: '192.168.1.100' }
      });

      const newDeviceData = {
        userId: 'user-123',
        fingerprint: 'new-device-fingerprint',
        name: 'New Device',
        type: 'mobile' as const,
        userAgent: 'Mobile Browser',
        ipAddress: '192.168.1.101' // Same network
      };

      mockSupabase.from().select().eq().mockResolvedValue({
        data: [existingDevice],
        error: null
      });

      const autoTrustedDevice = createMockDevice({
        ...newDeviceData,
        trusted: true
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: autoTrustedDevice,
        error: null
      });

      const result = await deviceManager.registerDevice(newDeviceData);

      expect(result.success).toBe(true);
      expect(result.data?.trusted).toBe(true);
    });
  });

  describe('Device Blocking', () => {
    it('should block a suspicious device', async () => {
      const mockDevice = createMockDevice({ blocked: false });
      const blockedDevice = {
        ...mockDevice,
        blocked: true,
        blockedAt: new Date().toISOString(),
        blockedReason: 'Suspicious activity detected'
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: blockedDevice,
        error: null
      });

      const result = await deviceManager.blockDevice('device-123', 'Suspicious activity detected');

      expect(result.success).toBe(true);
      expect(result.data?.blocked).toBe(true);
      expect(result.data?.blockedReason).toBe('Suspicious activity detected');
    });

    it('should unblock a device', async () => {
      const mockDevice = createMockDevice({ blocked: true });
      const unblockedDevice = {
        ...mockDevice,
        blocked: false,
        blockedAt: null,
        blockedReason: null
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: unblockedDevice,
        error: null
      });

      const result = await deviceManager.unblockDevice('device-123');

      expect(result.success).toBe(true);
      expect(result.data?.blocked).toBe(false);
    });

    it('should detect suspicious device patterns', async () => {
      const suspiciousDevices = [
        createMockDevice({
          userAgent: 'Bot/1.0',
          type: 'unknown',
          name: 'Unknown Device'
        }),
        createMockDevice({
          userAgent: 'Suspicious Browser',
          metadata: { 
            rapidRequests: true,
            unusualBehavior: true
          }
        })
      ];

      for (const device of suspiciousDevices) {
        const riskScore = deviceManager.calculateRiskScore(device);
        expect(riskScore).toBeGreaterThan(0.7); // High risk
      }
    });
  });

  describe('Device Information', () => {
    it('should get user devices', async () => {
      const userDevices = [
        createMockDevice({ id: 'device-1', userId: 'user-123' }),
        createMockDevice({ id: 'device-2', userId: 'user-123' })
      ];

      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: userDevices,
        error: null
      });

      const result = await deviceManager.getUserDevices('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].userId).toBe('user-123');
    });

    it('should get device statistics', async () => {
      const mockStats = {
        total: 50,
        trusted: 35,
        blocked: 5,
        active: 40
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null
      });

      const result = await deviceManager.getDeviceStats('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(mockStats);
    });

    it('should parse user agent information', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ];

      const expectedResults = [
        { browser: 'Chrome', os: 'Windows', device: 'desktop' },
        { browser: 'Safari', os: 'iOS', device: 'mobile' },
        { browser: 'Chrome', os: 'macOS', device: 'desktop' }
      ];

      userAgents.forEach((ua, index) => {
        const parsed = deviceManager.parseUserAgent(ua);
        expect(parsed.browser).toContain(expectedResults[index].browser);
        expect(parsed.os).toContain(expectedResults[index].os);
        expect(parsed.device).toBe(expectedResults[index].device);
      });
    });
  });

  describe('Device Cleanup', () => {
    it('should clean up inactive devices', async () => {
      const inactiveDevices = [
        createMockDevice({
          id: 'inactive-1',
          lastSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
        }),
        createMockDevice({
          id: 'inactive-2',
          lastSeen: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() // 120 days ago
        })
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: inactiveDevices,
        error: null
      });

      mockSupabase.from().delete().in().mockResolvedValue({
        data: null,
        error: null
      });

      const result = await deviceManager.cleanupInactiveDevices(60); // 60 days threshold

      expect(result.success).toBe(true);
      expect(result.data?.cleanedCount).toBe(2);
    });

    it('should revoke expired trust', async () => {
      const expiredTrustDevices = [
        createMockDevice({
          id: 'expired-1',
          trusted: true,
          trustExpiresAt: new Date(Date.now() - 60000).toISOString() // 1 minute ago
        })
      ];

      mockSupabase.from().select().mockResolvedValue({
        data: expiredTrustDevices,
        error: null
      });

      mockSupabase.from().update().in().mockResolvedValue({
        data: expiredTrustDevices.map(d => ({ ...d, trusted: false, trustExpiresAt: null })),
        error: null
      });

      const result = await deviceManager.revokeExpiredTrust();

      expect(result.success).toBe(true);
      expect(result.data?.revokedCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await deviceManager.registerDevice({
        userId: 'user-123',
        fingerprint: 'device-fingerprint',
        name: 'Test Device',
        type: 'desktop',
        userAgent: 'Mozilla/5.0...'
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Database connection failed');
    });

    it('should handle invalid device data', async () => {
      const invalidDeviceData = {
        userId: '', // Invalid empty userId
        fingerprint: 'device-fingerprint',
        name: 'Test Device',
        type: 'invalid_type' as any, // Invalid device type
        userAgent: 'Mozilla/5.0...'
      };

      const result = await deviceManager.registerDevice(invalidDeviceData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Security Features', () => {
    it('should detect device fingerprint collisions', async () => {
      const existingDevice = createMockDevice({
        fingerprint: 'collision-fingerprint',
        userId: 'user-123'
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: existingDevice,
        error: null
      });

      const result = await deviceManager.registerDevice({
        userId: 'user-456', // Different user, same fingerprint
        fingerprint: 'collision-fingerprint',
        name: 'Suspicious Device',
        type: 'desktop',
        userAgent: 'Mozilla/5.0...'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FINGERPRINT_COLLISION');
    });

    it('should validate device fingerprint format', () => {
      const invalidFingerprints = [
        '', // Empty
        'short', // Too short
        'invalid-characters-!@#$%', // Invalid characters
        null, // Null
        undefined // Undefined
      ];

      for (const fingerprint of invalidFingerprints) {
        const isValid = deviceManager.validateFingerprint(fingerprint as any);
        expect(isValid).toBe(false);
      }

      // Valid fingerprint
      const validFingerprint = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';
      expect(deviceManager.validateFingerprint(validFingerprint)).toBe(true);
    });
  });
});