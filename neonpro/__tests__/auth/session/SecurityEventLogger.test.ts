/**
 * SecurityEventLogger Unit Tests
 * 
 * Comprehensive test suite for the SecurityEventLogger class,
 * covering event logging, analysis, and security monitoring features.
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { SecurityEventLogger } from '../../../lib/auth/session/SecurityEventLogger';
import { createMockSecurityEvent, createTestDatabase, cleanup } from './setup';
import type { SecurityConfig, SecurityEvent, SecurityEventType } from '../../../lib/auth/session/types';

// Mock Supabase
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
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
      lt: jest.fn()
    }))
  })),
  rpc: jest.fn()
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('SecurityEventLogger', () => {
  let securityLogger: SecurityEventLogger;
  let testDb: ReturnType<typeof createTestDatabase>;
  let mockConfig: SecurityConfig;

  beforeEach(() => {
    testDb = createTestDatabase();
    
    mockConfig = {
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
        duration: 24 * 60 * 60 * 1000 // 24 hours
      },
      notifications: {
        enabled: true,
        channels: ['email', 'push'],
        severity: 'medium'
      }
    };

    securityLogger = new SecurityEventLogger(mockConfig);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('Event Logging', () => {
    it('should log security event successfully', async () => {
      const eventData = {
        userId: 'user-123',
        sessionId: 'session-123',
        deviceId: 'device-123',
        type: 'login_attempt' as SecurityEventType,
        severity: 'medium' as const,
        description: 'User login attempt',
        details: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          success: true
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      };

      const mockEvent = createMockSecurityEvent(eventData);
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockEvent,
        error: null
      });

      const result = await securityLogger.logEvent(eventData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        userId: eventData.userId,
        type: eventData.type,
        severity: eventData.severity
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('security_events');
    });

    it('should log different event types', async () => {
      const eventTypes: SecurityEventType[] = [
        'login_attempt',
        'logout',
        'password_change',
        'device_registered',
        'suspicious_activity',
        'rate_limit_exceeded',
        'session_expired',
        'unauthorized_access'
      ];

      for (const type of eventTypes) {
        const eventData = {
          userId: 'user-123',
          type,
          severity: 'medium' as const,
          description: `Test ${type} event`,
          details: {},
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...'
        };

        const mockEvent = createMockSecurityEvent({ ...eventData, type });
        
        mockSupabase.from().insert().select().single.mockResolvedValue({
          data: mockEvent,
          error: null
        });

        const result = await securityLogger.logEvent(eventData);
        expect(result.success).toBe(true);
        expect(result.data?.type).toBe(type);
      }
    });

    it('should assign correlation IDs to related events', async () => {
      const correlationId = 'correlation-123';
      
      const events = [
        {
          userId: 'user-123',
          type: 'login_attempt' as SecurityEventType,
          severity: 'low' as const,
          description: 'Login started',
          correlationId
        },
        {
          userId: 'user-123',
          type: 'device_registered' as SecurityEventType,
          severity: 'medium' as const,
          description: 'Device registered during login',
          correlationId
        }
      ];

      for (const eventData of events) {
        const mockEvent = createMockSecurityEvent(eventData);
        
        mockSupabase.from().insert().select().single.mockResolvedValue({
          data: mockEvent,
          error: null
        });

        const result = await securityLogger.logEvent(eventData);
        expect(result.success).toBe(true);
        expect(result.data?.correlationId).toBe(correlationId);
      }
    });
  });

  describe('Event Analysis', () => {
    it('should detect failed login patterns', async () => {
      const failedLoginEvents = Array.from({ length: 6 }, (_, i) => 
        createMockSecurityEvent({
          id: `event-${i}`,
          userId: 'user-123',
          type: 'login_attempt',
          details: { success: false },
          createdAt: new Date(Date.now() - i * 60000).toISOString() // 1 minute apart
        })
      );

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
        data: failedLoginEvents,
        error: null
      });

      const result = await securityLogger.analyzeFailedLogins('user-123', 60); // Last 60 minutes

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(6);
      expect(result.data?.exceedsThreshold).toBe(true); // Exceeds threshold of 5
    });

    it('should detect suspicious activity patterns', async () => {
      const suspiciousEvents = [
        createMockSecurityEvent({
          type: 'unauthorized_access',
          severity: 'high',
          userId: 'user-123'
        }),
        createMockSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          userId: 'user-123'
        }),
        createMockSecurityEvent({
          type: 'rate_limit_exceeded',
          severity: 'medium',
          userId: 'user-123'
        })
      ];

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
        data: suspiciousEvents,
        error: null
      });

      const result = await securityLogger.analyzeSuspiciousActivity('user-123', 24); // Last 24 hours

      expect(result.success).toBe(true);
      expect(result.data?.riskScore).toBeGreaterThan(0.5);
      expect(result.data?.events).toHaveLength(3);
    });

    it('should calculate risk scores accurately', () => {
      const events = [
        createMockSecurityEvent({ type: 'login_attempt', severity: 'low' }),
        createMockSecurityEvent({ type: 'unauthorized_access', severity: 'high' }),
        createMockSecurityEvent({ type: 'suspicious_activity', severity: 'high' }),
        createMockSecurityEvent({ type: 'rate_limit_exceeded', severity: 'medium' })
      ];

      const riskScore = securityLogger.calculateRiskScore(events);
      
      expect(riskScore).toBeGreaterThan(0);
      expect(riskScore).toBeLessThanOrEqual(1);
      expect(riskScore).toBeGreaterThan(0.6); // Should be high due to high severity events
    });

    it('should identify anomalous patterns', async () => {
      const anomalousEvents = [
        createMockSecurityEvent({
          type: 'login_attempt',
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString()
        }),
        createMockSecurityEvent({
          type: 'login_attempt',
          ipAddress: '10.0.0.1', // Different IP
          createdAt: new Date(Date.now() - 5000).toISOString() // 5 seconds ago
        })
      ];

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
        data: anomalousEvents,
        error: null
      });

      const result = await securityLogger.detectAnomalies('user-123', 60);

      expect(result.success).toBe(true);
      expect(result.data?.anomalies).toBeDefined();
      expect(result.data?.anomalies.length).toBeGreaterThan(0);
    });
  });

  describe('Event Queries', () => {
    it('should get user security events', async () => {
      const userEvents = [
        createMockSecurityEvent({ id: 'event-1', userId: 'user-123' }),
        createMockSecurityEvent({ id: 'event-2', userId: 'user-123' })
      ];

      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: userEvents,
        error: null
      });

      const result = await securityLogger.getUserEvents('user-123', { limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].userId).toBe('user-123');
    });

    it('should filter events by type', async () => {
      const loginEvents = [
        createMockSecurityEvent({ type: 'login_attempt', userId: 'user-123' }),
        createMockSecurityEvent({ type: 'login_attempt', userId: 'user-123' })
      ];

      mockSupabase.from().select().eq().eq().order().limit.mockResolvedValue({
        data: loginEvents,
        error: null
      });

      const result = await securityLogger.getUserEvents('user-123', {
        type: 'login_attempt',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data?.every(event => event.type === 'login_attempt')).toBe(true);
    });

    it('should filter events by severity', async () => {
      const highSeverityEvents = [
        createMockSecurityEvent({ severity: 'high', userId: 'user-123' }),
        createMockSecurityEvent({ severity: 'high', userId: 'user-123' })
      ];

      mockSupabase.from().select().eq().eq().order().limit.mockResolvedValue({
        data: highSeverityEvents,
        error: null
      });

      const result = await securityLogger.getUserEvents('user-123', {
        severity: 'high',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data?.every(event => event.severity === 'high')).toBe(true);
    });

    it('should filter events by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const endDate = new Date();
      
      const recentEvents = [
        createMockSecurityEvent({ 
          userId: 'user-123',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        })
      ];

      mockSupabase.from().select().eq().gte().lte().order().limit.mockResolvedValue({
        data: recentEvents,
        error: null
      });

      const result = await securityLogger.getUserEvents('user-123', {
        startDate,
        endDate,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('Event Resolution', () => {
    it('should resolve security event', async () => {
      const mockEvent = createMockSecurityEvent({ resolved: false });
      const resolvedEvent = {
        ...mockEvent,
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: 'admin-123'
      };

      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: resolvedEvent,
        error: null
      });

      const result = await securityLogger.resolveEvent('event-123', 'admin-123', 'Issue resolved');

      expect(result.success).toBe(true);
      expect(result.data?.resolved).toBe(true);
      expect(result.data?.resolvedBy).toBe('admin-123');
    });

    it('should get unresolved events', async () => {
      const unresolvedEvents = [
        createMockSecurityEvent({ id: 'event-1', resolved: false }),
        createMockSecurityEvent({ id: 'event-2', resolved: false })
      ];

      mockSupabase.from().select().eq().order().limit.mockResolvedValue({
        data: unresolvedEvents,
        error: null
      });

      const result = await securityLogger.getUnresolvedEvents({ limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.every(event => !event.resolved)).toBe(true);
    });
  });

  describe('Event Cleanup', () => {
    it('should clean up old events', async () => {
      const oldEvents = [
        createMockSecurityEvent({
          id: 'old-1',
          createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() // 100 days ago
        }),
        createMockSecurityEvent({
          id: 'old-2',
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() // 120 days ago
        })
      ];

      mockSupabase.from().select().lt().mockResolvedValue({
        data: oldEvents,
        error: null
      });

      mockSupabase.from().delete().lt().mockResolvedValue({
        data: null,
        error: null
      });

      const result = await securityLogger.cleanupOldEvents(90); // 90 days retention

      expect(result.success).toBe(true);
      expect(result.data?.cleanedCount).toBe(2);
    });
  });

  describe('Alert System', () => {
    it('should trigger alerts for threshold violations', async () => {
      const failedLoginEvents = Array.from({ length: 6 }, (_, i) => 
        createMockSecurityEvent({
          type: 'login_attempt',
          details: { success: false },
          userId: 'user-123'
        })
      );

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
        data: failedLoginEvents,
        error: null
      });

      const alertSpy = jest.spyOn(securityLogger, 'triggerAlert').mockResolvedValue({
        success: true,
        data: { alertId: 'alert-123' }
      });

      await securityLogger.checkAlertThresholds('user-123');

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'failed_login_threshold',
          severity: 'high'
        })
      );
    });

    it('should auto-block users exceeding thresholds', async () => {
      const suspiciousEvents = Array.from({ length: 11 }, (_, i) => 
        createMockSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          userId: 'user-123'
        })
      );

      mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
        data: suspiciousEvents,
        error: null
      });

      const blockSpy = jest.spyOn(securityLogger, 'autoBlockUser').mockResolvedValue({
        success: true,
        data: { blocked: true }
      });

      await securityLogger.checkAutoBlock('user-123');

      expect(blockSpy).toHaveBeenCalledWith('user-123', expect.any(String));
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await securityLogger.logEvent({
        userId: 'user-123',
        type: 'login_attempt',
        severity: 'medium',
        description: 'Test event',
        details: {},
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Database connection failed');
    });

    it('should handle invalid event data', async () => {
      const invalidEventData = {
        userId: '', // Invalid empty userId
        type: 'invalid_type' as any, // Invalid event type
        severity: 'invalid_severity' as any, // Invalid severity
        description: 'Test event'
      };

      const result = await securityLogger.logEvent(invalidEventData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Performance', () => {
    it('should handle bulk event logging efficiently', async () => {
      const events = Array.from({ length: 100 }, (_, i) => ({
        userId: 'user-123',
        type: 'login_attempt' as SecurityEventType,
        severity: 'low' as const,
        description: `Bulk event ${i}`,
        details: {},
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      }));

      const mockEvents = events.map((event, i) => createMockSecurityEvent({ ...event, id: `bulk-${i}` }));
      
      mockSupabase.from().insert().select().mockResolvedValue({
        data: mockEvents,
        error: null
      });

      const startTime = Date.now();
      const result = await securityLogger.logBulkEvents(events);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data?.loggedCount).toBe(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});