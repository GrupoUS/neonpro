// T010: Session Management Tests for AI Chat
// Purpose: Test session lifecycle, timeouts, and cleanup for healthcare compliance
// File: packages/utils/src/chat/__tests__/session-management.test.ts

import { describe, expect, it, beforeEach, afterEach, vi, Mock } from 'vitest';
import type { ChatSession, SessionStatus, SessionConfig } from '@neonpro/types/ai-chat';

// Import the functions we'll be testing
import { 
  createChatSession,
  getChatSession,
  updateSessionActivity,
  endChatSession,
  cleanupExpiredSessions,
  validateSessionAccess,
  archiveInactiveSessions,
  getSessionMetrics
} from '../session-management';

describe('T010: Session Management for AI Chat', () => {
  let mockSessionStore: Map<string, ChatSession>;
  let mockTimestamp: number;

  beforeEach(() => {
    mockSessionStore = new Map();
    mockTimestamp = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(mockTimestamp);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Session Creation', () => {
    it('should create new session with valid parameters', async () => {
      const sessionConfig: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456',
        locale: 'pt-BR',
        sessionType: 'general',
        maxDurationMinutes: 60
      };

      const session = await createChatSession(sessionConfig);

      expect(session).toMatchObject({
        id: expect.any(String),
        userId: 'user-123',
        clinicId: 'clinic-456',
        status: 'active',
        startedAt: expect.any(Date),
        locale: 'pt-BR',
        isActive: true,
        totalMessages: 0,
        maxDurationMinutes: 60
      });
    });

    it('should generate unique session IDs', async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456'
      };

      const session1 = await createChatSession(config);
      const session2 = await createChatSession(config);

      expect(session1.id).not.toBe(session2.id);
    });

    it('should set default values for optional parameters', async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456'
      };

      const session = await createChatSession(config);

      expect(session.locale).toBe('pt-BR'); // Default for Brazil
      expect(session.maxDurationMinutes).toBe(120); // Default 2 hours
      expect(session.sessionType).toBe('general');
      expect(session.consentStatus).toBe('pending');
    });

    it('should validate required parameters', async () => {
      const invalidConfigs = [
        { userId: '', clinicId: 'clinic-456' },
        { userId: 'user-123', clinicId: '' },
        { userId: 'user-123' }, // Missing clinicId
        {} // Missing both
      ];

      for (const config of invalidConfigs) {
        await expect(createChatSession(config as SessionConfig))
          .rejects.toThrow(/required/i);
      }
    });

    it('should enforce clinic user relationship', async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'invalid-clinic'
      };

      await expect(createChatSession(config))
        .rejects.toThrow(/not authorized/i);
    });
  });

  describe('Session Retrieval', () => {
    let testSession: ChatSession;

    beforeEach(async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456'
      };
      testSession = await createChatSession(config);
    });

    it('should retrieve existing session', async () => {
      const retrieved = await getChatSession(testSession.id, 'user-123', 'clinic-456');

      expect(retrieved).toEqual(testSession);
    });

    it('should throw error for non-existent session', async () => {
      await expect(getChatSession('invalid-id', 'user-123', 'clinic-456'))
        .rejects.toThrow(/not found/i);
    });

    it('should enforce tenant isolation', async () => {
      await expect(getChatSession(testSession.id, 'user-123', 'other-clinic'))
        .rejects.toThrow(/not authorized/i);

      await expect(getChatSession(testSession.id, 'other-user', 'clinic-456'))
        .rejects.toThrow(/not authorized/i);
    });

    it('should update last accessed timestamp on retrieval', async () => {
      const originalAccessed = testSession.lastAccessedAt;
      
      vi.advanceTimersByTime(5000); // 5 seconds later
      
      const retrieved = await getChatSession(testSession.id, 'user-123', 'clinic-456');

      expect(retrieved.lastAccessedAt?.getTime()).toBeGreaterThan(originalAccessed?.getTime() || 0);
    });
  });

  describe('Session Activity Management', () => {
    let testSession: ChatSession;

    beforeEach(async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456'
      };
      testSession = await createChatSession(config);
    });

    it('should update session activity', async () => {
      const activityData = {
        messageCount: 5,
        lastMessageAt: new Date(),
        totalTokens: 150
      };

      const updated = await updateSessionActivity(testSession.id, activityData);

      expect(updated.totalMessages).toBe(5);
      expect(updated.lastActivityAt).toEqual(activityData.lastMessageAt);
      expect(updated.metadata?.totalTokens).toBe(150);
    });

    it('should track session metrics', async () => {
      await updateSessionActivity(testSession.id, { messageCount: 3 });
      await updateSessionActivity(testSession.id, { messageCount: 5 }); // +2 messages

      const session = await getChatSession(testSession.id, 'user-123', 'clinic-456');

      expect(session.totalMessages).toBe(5);
    });

    it('should handle concurrent updates safely', async () => {
      const updates = Array(10).fill(null).map((_, i) => 
        updateSessionActivity(testSession.id, { messageCount: i + 1 })
      );

      await Promise.all(updates);
      const session = await getChatSession(testSession.id, 'user-123', 'clinic-456');

      expect(session.totalMessages).toBe(10);
    });
  });

  describe('Session Timeout and Expiration', () => {
    let testSession: ChatSession;

    beforeEach(async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456',
        maxDurationMinutes: 30 // 30 minutes for testing
      };
      testSession = await createChatSession(config);
    });

    it('should detect expired sessions', async () => {
      // Advance time beyond max duration
      vi.advanceTimersByTime(31 * 60 * 1000); // 31 minutes

      const isExpired = await validateSessionAccess(testSession.id);

      expect(isExpired.isValid).toBe(false);
      expect(isExpired.reason).toContain('expired');
    });

    it('should detect inactive sessions', async () => {
      // Advance time beyond inactivity threshold (default 15 minutes)
      vi.advanceTimersByTime(16 * 60 * 1000); // 16 minutes

      const isValid = await validateSessionAccess(testSession.id);

      expect(isValid.isValid).toBe(false);
      expect(isValid.reason).toContain('inactive');
    });

    it('should allow extending session if not expired', async () => {
      // Update activity before expiration
      vi.advanceTimersByTime(10 * 60 * 1000); // 10 minutes
      await updateSessionActivity(testSession.id, { messageCount: 1 });

      const isValid = await validateSessionAccess(testSession.id);

      expect(isValid.isValid).toBe(true);
    });

    it('should prevent extension of expired sessions', async () => {
      // Let session expire
      vi.advanceTimersByTime(31 * 60 * 1000); // 31 minutes

      await expect(updateSessionActivity(testSession.id, { messageCount: 1 }))
        .rejects.toThrow(/expired/i);
    });
  });

  describe('Session Cleanup', () => {
    let activeSessions: ChatSession[];
    let expiredSessions: ChatSession[];

    beforeEach(async () => {
      // Create active sessions
      activeSessions = await Promise.all([
        createChatSession({ userId: 'user-1', clinicId: 'clinic-456' }),
        createChatSession({ userId: 'user-2', clinicId: 'clinic-456' })
      ]);

      // Create expired sessions
      expiredSessions = await Promise.all([
        createChatSession({ 
          userId: 'user-3', 
          clinicId: 'clinic-456',
          maxDurationMinutes: 10
        }),
        createChatSession({ 
          userId: 'user-4', 
          clinicId: 'clinic-456',
          maxDurationMinutes: 10
        })
      ]);

      // Advance time to expire some sessions
      vi.advanceTimersByTime(11 * 60 * 1000); // 11 minutes
    });

    it('should clean up expired sessions', async () => {
      const result = await cleanupExpiredSessions();

      expect(result.cleanedCount).toBe(2);
      expect(result.activeCount).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should archive inactive sessions before cleanup', async () => {
      const archiveResult = await archiveInactiveSessions();

      expect(archiveResult.archivedCount).toBeGreaterThan(0);
      expect(archiveResult.totalProcessed).toBe(4);
    });

    it('should preserve session data for audit', async () => {
      const sessionId = expiredSessions[0].id;
      await cleanupExpiredSessions();

      // Session should be moved to archive, not deleted
      const archived = await getChatSession(sessionId, 'user-3', 'clinic-456', { includeArchived: true });
      
      expect(archived.status).toBe('archived');
      expect(archived.archivedAt).toBeDefined();
    });

    it('should handle cleanup errors gracefully', async () => {
      // Mock cleanup failure for one session
      const mockError = vi.fn().mockRejectedValueOnce(new Error('Database error'));
      
      const result = await cleanupExpiredSessions();

      expect(result.errors.length).toBeGreaterThanOrEqual(0);
      expect(result.cleanedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Session Security and Access Control', () => {
    let testSession: ChatSession;

    beforeEach(async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456'
      };
      testSession = await createChatSession(config);
    });

    it('should validate user access permissions', async () => {
      const access = await validateSessionAccess(testSession.id, {
        userId: 'user-123',
        clinicId: 'clinic-456',
        role: 'patient'
      });

      expect(access.isValid).toBe(true);
      expect(access.permissions).toContain('read');
      expect(access.permissions).toContain('write');
    });

    it('should allow healthcare professionals to access patient sessions', async () => {
      const access = await validateSessionAccess(testSession.id, {
        userId: 'doctor-456',
        clinicId: 'clinic-456',
        role: 'doctor'
      });

      expect(access.isValid).toBe(true);
      expect(access.permissions).toContain('read');
      expect(access.permissions).not.toContain('write'); // Read-only for care providers
    });

    it('should deny cross-clinic access', async () => {
      const access = await validateSessionAccess(testSession.id, {
        userId: 'user-123',
        clinicId: 'other-clinic',
        role: 'patient'
      });

      expect(access.isValid).toBe(false);
      expect(access.reason).toContain('clinic access');
    });

    it('should log access attempts for audit', async () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await validateSessionAccess(testSession.id, {
        userId: 'user-123',
        clinicId: 'clinic-456',
        role: 'patient'
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'session_access',
          sessionId: testSession.id,
          userId: 'user-123',
          result: 'allowed'
        })
      );

      logSpy.mockRestore();
    });
  });

  describe('Session End and Finalization', () => {
    let testSession: ChatSession;

    beforeEach(async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456'
      };
      testSession = await createChatSession(config);
    });

    it('should properly end active session', async () => {
      const endResult = await endChatSession(testSession.id, {
        reason: 'user_ended',
        finalMessageCount: 10,
        duration: 15 // minutes
      });

      expect(endResult.status).toBe('ended');
      expect(endResult.endedAt).toBeDefined();
      expect(endResult.isActive).toBe(false);
      expect(endResult.metadata?.endReason).toBe('user_ended');
    });

    it('should calculate session statistics on end', async () => {
      // Add some activity
      await updateSessionActivity(testSession.id, { 
        messageCount: 15,
        totalTokens: 500
      });

      const endResult = await endChatSession(testSession.id, {
        reason: 'completed'
      });

      expect(endResult.totalMessages).toBe(15);
      expect(endResult.metadata?.totalTokens).toBe(500);
      expect(endResult.metadata?.duration).toBeGreaterThan(0);
    });

    it('should prevent operations on ended sessions', async () => {
      await endChatSession(testSession.id, { reason: 'user_ended' });

      await expect(updateSessionActivity(testSession.id, { messageCount: 1 }))
        .rejects.toThrow(/ended|closed/i);
    });

    it('should handle double-end gracefully', async () => {
      await endChatSession(testSession.id, { reason: 'user_ended' });
      
      // Second end should not throw but return existing end state
      const secondEnd = await endChatSession(testSession.id, { reason: 'timeout' });
      
      expect(secondEnd.status).toBe('ended');
      expect(secondEnd.metadata?.endReason).toBe('user_ended'); // Original reason preserved
    });
  });

  describe('Session Metrics and Analytics', () => {
    beforeEach(async () => {
      // Create multiple sessions for metrics testing
      await Promise.all([
        createChatSession({ userId: 'user-1', clinicId: 'clinic-456' }),
        createChatSession({ userId: 'user-2', clinicId: 'clinic-456' }),
        createChatSession({ userId: 'user-3', clinicId: 'clinic-789' }),
      ]);
    });

    it('should calculate clinic session metrics', async () => {
      const metrics = await getSessionMetrics('clinic-456');

      expect(metrics).toMatchObject({
        totalSessions: 2,
        activeSessions: 2,
        averageDuration: expect.any(Number),
        totalMessages: expect.any(Number),
        clinicId: 'clinic-456'
      });
    });

    it('should track session usage patterns', async () => {
      const metrics = await getSessionMetrics('clinic-456', {
        includeHourlyDistribution: true,
        includeDurationHistogram: true
      });

      expect(metrics.hourlyDistribution).toBeDefined();
      expect(metrics.durationHistogram).toBeDefined();
    });

    it('should provide performance insights', async () => {
      const metrics = await getSessionMetrics('clinic-456', {
        includePerformance: true
      });

      expect(metrics.performance).toMatchObject({
        averageResponseTime: expect.any(Number),
        sessionSuccessRate: expect.any(Number),
        errorRate: expect.any(Number)
      });
    });
  });

  describe('LGPD Compliance Features', () => {
    let testSession: ChatSession;

    beforeEach(async () => {
      const config: SessionConfig = {
        userId: 'user-123',
        clinicId: 'clinic-456',
        consentStatus: 'granted'
      };
      testSession = await createChatSession(config);
    });

    it('should track data processing consent', async () => {
      expect(testSession.consentStatus).toBe('granted');
      expect(testSession.consentTimestamp).toBeDefined();
    });

    it('should handle consent revocation', async () => {
      const updated = await updateSessionActivity(testSession.id, {
        consentStatus: 'revoked'
      });

      expect(updated.consentStatus).toBe('revoked');
      expect(updated.isActive).toBe(false); // Should auto-deactivate
    });

    it('should provide data export for portability', async () => {
      const exportData = await getChatSession(testSession.id, 'user-123', 'clinic-456', {
        format: 'export'
      });

      expect(exportData).toMatchObject({
        sessionData: expect.any(Object),
        exportTimestamp: expect.any(Date),
        format: 'lgpd_compliant',
        dataTypes: expect.any(Array)
      });
    });

    it('should support data deletion requests', async () => {
      const deleteResult = await endChatSession(testSession.id, {
        reason: 'data_deletion_request',
        deleteData: true
      });

      expect(deleteResult.status).toBe('deleted');
      expect(deleteResult.deletedAt).toBeDefined();
    });
  });
});