/**
 * Enhanced Session Manager Integration Tests
 *
 * These tests validate the comprehensive session security features
 * implemented in the enhanced session manager.
 *
 * @security_critical
 * @compliance OWASP Session Management Cheat Sheet
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EnhancedSessionManager } from '../../src/security/enhanced-session-manager';

describe('Enhanced Session Manager Security Tests', () => {
  let sessionManager: EnhancedSessionManager;
  let testUserId = 'test-user-123';
  let testIP = '192.168.1.100';
  let testUserAgent = 'Mozilla/5.0 (Test Browser)';

  beforeEach(() => {
    sessionManager = new EnhancedSessionManager({
      enableIPBinding: true,
      allowMobileSubnetChanges: true,
      regenerateSessionOnAuth: true,
      sessionIdEntropyBits: 128,
      maxConcurrentSessions: 3,
      idleTimeout: 30 * 60 * 1000, // 30 minutes
      absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours
      timeoutWarningThreshold: 5 * 60 * 1000, // 5 minutes
      enableAnomalyDetection: true,
      maxIPChangesPerHour: 3,
      enableGeolocationValidation: false,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
    }
  }

  afterEach(() => {
    sessionManager.destroy(
  }

  describe('Session ID Generation and Validation', () => {
    it('should generate secure session IDs with proper format', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Should be 32 character hex string
      expect(sessionId).toMatch(/^[a-f0-9]{32}$/i

      // Should have sufficient entropy
<<<<<<< HEAD
      const session = sessionManager.getSession(sessionId
      expect(session).toBeDefined(
      expect(session?.sessionId).toBe(sessionId
      expect(session?._userId).toBe(testUserId
    }
=======
      const session = sessionManager.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.sessionId).toBe(sessionId);
      expect(session?._userId).toBe(testUserId);
    });
>>>>>>> origin/main

    it('should validate session ID format', () => {
      const validSessionId = sessionManager.createSession(testUserId

      // Test private validation method indirectly through session validation
      const result = sessionManager.validateAndUpdateSession(validSessionId, testIP, testUserAgent
      expect(result.isValid).toBe(true);

      // Test invalid formats
      const invalidFormats = [
        'short-id',
        'predictable-session-id-123',
        '',
        'invalid-session-id!',
        '123456789012345678901234567890123', // 33 characters
      ];

      invalidFormats.forEach(invalidId => {
        const result = sessionManager.validateAndUpdateSession(invalidId, testIP, testUserAgent
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('Invalid session ID format')
      }
    }
  }

  describe('IP Binding Security', () => {
    it('should bind sessions to IP addresses', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Same IP should succeed
      let result = sessionManager.validateAndUpdateSession(sessionId, testIP, testUserAgent
      expect(result.isValid).toBe(true);
      expect(result.action).toBe('allow')

      // Different IP should fail
      result = sessionManager.validateAndUpdateSession(sessionId, '192.168.1.200', testUserAgent
      expect(result.isValid).toBe(false);
      expect(result.action).toBe('require_verification')
      expect(result.reason).toContain('IP address mismatch')
    }

    it('should handle mobile network IP changes in same subnet', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: '192.168.1.100',
        userAgent: testUserAgent,
      }

      // Mobile IP change in same subnet should warn but allow
      const result = sessionManager.validateAndUpdateSession(
        sessionId,
        '192.168.1.105',
        testUserAgent,
      
      expect(result.isValid).toBe(true);
      expect(result.action).toBe('warn')
      expect(result.warnings).toContain('Mobile network IP change detected')
      expect(result.newIP).toBe('192.168.1.105')

      // Session IP should be updated
      const session = sessionManager.getSession(sessionId
      expect(session?.ipAddress).toBe('192.168.1.105')
      expect(session?.ipChangeCount).toBe(1
    }

    it('should block excessive IP changes', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: '192.168.1.100',
        userAgent: testUserAgent,
      }

      // Simulate multiple IP changes
      const differentIPs = ['192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104'];

      for (let i = 0; i < differentIPs.length; i++) {
        const result = sessionManager.validateAndUpdateSession(
          sessionId,
          differentIPs[i],
          testUserAgent,
        

        if (i < 3) { // First 3 changes should be allowed with warnings
          expect(result.isValid).toBe(true);
          expect(result.action).toBe('warn')
        } else { // 4th change should be blocked
          expect(result.isValid).toBe(false);
          expect(result.action).toBe('block')
          expect(result.reason).toContain('Too many IP changes')
        }
      }
    }
  }

  describe('Session Fixation Protection', () => {
    it('should regenerate session ID', () => {
      const originalSessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      const originalSession = sessionManager.getSession(originalSessionId
      expect(originalSession).toBeDefined(

      // Regenerate session
      const newSessionId = sessionManager.regenerateSession(originalSessionId
      expect(newSessionId).toBeDefined(
      expect(newSessionId).not.toBe(originalSessionId

      // Original session should be removed
      expect(sessionManager.getSession(originalSessionId)).toBeUndefined(

      // New session should exist with same metadata
<<<<<<< HEAD
      const newSession = sessionManager.getSession(newSessionId
      expect(newSession).toBeDefined(
      expect(newSession?._userId).toBe(testUserId
      expect(newSession?.ipAddress).toBe(testIP
      expect(newSession?.sessionId).toBe(newSessionId
    }
=======
      const newSession = sessionManager.getSession(newSessionId);
      expect(newSession).toBeDefined();
      expect(newSession?._userId).toBe(testUserId);
      expect(newSession?.ipAddress).toBe(testIP);
      expect(newSession?.sessionId).toBe(newSessionId);
    });
>>>>>>> origin/main

    it('should return null when regenerating non-existent session', () => {
      const result = sessionManager.regenerateSession('non-existent-session')
      expect(result).toBeNull(
    }
  }

  describe('Concurrent Session Management', () => {
    it('should limit concurrent sessions per user', () => {
      const maxSessions = 3;
      const sessionIds: string[] = [];

      // Create maximum allowed sessions
      for (let i = 0; i < maxSessions; i++) {
        const sessionId = sessionManager.createSession(testUserId, {
          ipAddress: `192.168.1.${100 + i}`,
          userAgent: testUserAgent,
        }
        sessionIds.push(sessionId
      }

      // All sessions should exist
      sessionIds.forEach(sessionId => {
        expect(sessionManager.getSession(sessionId)).toBeDefined(
      }

      // Create one more session - should remove oldest
      const newSessionId = sessionManager.createSession(testUserId, {
        ipAddress: '192.168.1.200',
        userAgent: testUserAgent,
      }

      // Oldest session should be removed
      expect(sessionManager.getSession(sessionIds[0])).toBeUndefined(

      // New session and other sessions should exist
      expect(sessionManager.getSession(newSessionId)).toBeDefined(
      for (let i = 1; i < sessionIds.length; i++) {
        expect(sessionManager.getSession(sessionIds[i])).toBeDefined(
      }
    }

    it('should track user sessions correctly', () => {
      // Create sessions for multiple users
      const user1Sessions = [
        sessionManager.createSession('user-1', { ipAddress: '192.168.1.1' }),
        sessionManager.createSession('user-1', { ipAddress: '192.168.1.2' }),
      ];

      const user2Sessions = [
        sessionManager.createSession('user-2', { ipAddress: '192.168.1.3' }),
      ];

      // Verify user sessions
      const user1SessionList = sessionManager.getUserSessions('user-1')
      expect(user1SessionList).toHaveLength(2
      expect(user1SessionList.map(s => s.sessionId)).toEqual(expect.arrayContaining(user1Sessions)

      const user2SessionList = sessionManager.getUserSessions('user-2')
      expect(user2SessionList).toHaveLength(1
      expect(user2SessionList[0].sessionId).toBe(user2Sessions[0]

      // Remove all user sessions
      const removedCount = sessionManager.removeAllUserSessions('user-1')
      expect(removedCount).toBe(2
      expect(sessionManager.getUserSessions('user-1')).toHaveLength(0
      expect(sessionManager.getUserSessions('user-2')).toHaveLength(1); // Should still exist
    }
  }

  describe('Session Timeout Controls', () => {
    it('should implement absolute session timeout', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Manually set creation time to exceed absolute timeout
      const session = sessionManager.getSession(sessionId
      if (session) {
        session.createdAt = new Date(Date.now() - 9 * 60 * 60 * 1000); // 9 hours ago
        session.lastActivity = new Date(Date.now() - 9 * 60 * 60 * 1000
      }

      // Session should be expired
      const result = sessionManager.validateAndUpdateSession(sessionId, testIP, testUserAgent
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Session exceeded maximum duration')
    }

    it('should implement idle timeout', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Manually set last activity to exceed idle timeout
      const session = sessionManager.getSession(sessionId
      if (session) {
        session.lastActivity = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
      }

      // Session should be expired due to inactivity
      const result = sessionManager.validateAndUpdateSession(sessionId, testIP, testUserAgent
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Session expired due to inactivity')
    }

    it('should provide timeout warnings', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Set session to expire soon (within warning threshold)
      const session = sessionManager.getSession(sessionId
      if (session) {
        session.createdAt = new Date(Date.now() - (8 * 60 * 60 * 1000 - 3 * 60 * 1000); // 3 minutes before timeout
      }

      const result = sessionManager.validateAndUpdateSession(sessionId, testIP, testUserAgent
      expect(result.isValid).toBe(true);
      expect(result.timeoutWarning).toBeDefined(
      expect(result.timeoutWarning).toBeLessThanOrEqual(5 * 60 * 1000); // Within warning threshold
    }
  }

  describe('Anomaly Detection', () => {
    it('should detect IP address changes', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Change IP and user agent
      const result = sessionManager.validateAndUpdateSession(
        sessionId,
        '192.168.2.100',
        'Different Browser',
      
      expect(result.isValid).toBe(false);
      expect(result.action).toBe('require_verification')
      expect(result.warnings).toContain('IP address change detected')
      expect(result.warnings).toContain('User agent change detected')
    }

    it('should update security level based on risk', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      const session = sessionManager.getSession(sessionId
      expect(session?.securityLevel).toBe('normal')
      expect(session?.riskScore).toBe(0

      // Simulate suspicious activity
      const result = sessionManager.validateAndUpdateSession(
        sessionId,
        '192.168.2.100',
        'Different Browser',
      
      expect(result.isValid).toBe(false); // Should require verification due to risk

      const updatedSession = sessionManager.getSession(sessionId
      expect(updatedSession?.securityLevel).toBe('elevated')
      expect(updatedSession?.riskScore).toBeGreaterThan(0
    }

    it('should track consecutive failures', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      const session = sessionManager.getSession(sessionId
      expect(session?.consecutiveFailures).toBe(0

      // Simulate failed validations (by using invalid IPs that would fail)
      sessionManager.validateAndUpdateSession(sessionId, '192.168.2.100', testUserAgent
      sessionManager.validateAndUpdateSession(sessionId, '192.168.2.101', testUserAgent

      const updatedSession = sessionManager.getSession(sessionId
      expect(updatedSession?.consecutiveFailures).toBeGreaterThan(0
    }
  }

  describe('Session Cleanup', () => {
    it('should clean expired sessions', () => {
      // Create some sessions
      const activeSessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      const expiredSessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Manually set expired session to be old
      const expiredSession = sessionManager.getSession(expiredSessionId
      if (expiredSession) {
        expiredSession.lastActivity = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      }

      // Clean expired sessions
      const cleanedCount = sessionManager.cleanExpiredSessions(24); // 24 hours max
      expect(cleanedCount).toBe(1

      // Expired session should be removed, active session should remain
      expect(sessionManager.getSession(expiredSessionId)).toBeUndefined(
      expect(sessionManager.getSession(activeSessionId)).toBeDefined(
    }

    it('should provide session statistics', () => {
      // Create multiple sessions
      sessionManager.createSession('user-1', { ipAddress: '192.168.1.1' }
      sessionManager.createSession('user-1', { ipAddress: '192.168.1.2' }
      sessionManager.createSession('user-2', { ipAddress: '192.168.1.3' }

      const stats = sessionManager.getSessionStats(
      expect(stats.totalSessions).toBe(3
      expect(stats.activeUsers).toBe(2
      expect(stats.sessionsBySecurityLevel.normal).toBe(3
      expect(stats.averageRiskScore).toBe(0
    }
  }

  describe('Session Persistence and State', () => {
    it('should maintain session state across validations', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
        permissions: ['read', 'write'],
      }

      // Perform multiple validations
      const result1 = sessionManager.validateAndUpdateSession(sessionId, testIP, testUserAgent
      expect(result1.isValid).toBe(true);

      const result2 = sessionManager.validateAndUpdateSession(sessionId, testIP, testUserAgent
      expect(result2.isValid).toBe(true);

      // Session state should be preserved
<<<<<<< HEAD
      const session = sessionManager.getSession(sessionId
      expect(session?._userId).toBe(testUserId
      expect(session?.ipAddress).toBe(testIP
      expect(session?.permissions).toEqual(['read', 'write']
=======
      const session = sessionManager.getSession(sessionId);
      expect(session?._userId).toBe(testUserId);
      expect(session?.ipAddress).toBe(testIP);
      expect(session?.permissions).toEqual(['read', 'write']);
>>>>>>> origin/main
      expect(session?.refreshCount).toBe(2); // Should track refresh count
    }

    it('should handle session removal correctly', () => {
      const sessionId = sessionManager.createSession(testUserId, {
        ipAddress: testIP,
        userAgent: testUserAgent,
      }

      // Verify session exists
      expect(sessionManager.getSession(sessionId)).toBeDefined(
      expect(sessionManager.getUserSessions(testUserId)).toHaveLength(1

      // Remove session
      const removed = sessionManager.removeSession(sessionId
      expect(removed).toBe(true);

      // Verify session is gone
      expect(sessionManager.getSession(sessionId)).toBeUndefined(
      expect(sessionManager.getUserSessions(testUserId)).toHaveLength(0
    }
  }
}
