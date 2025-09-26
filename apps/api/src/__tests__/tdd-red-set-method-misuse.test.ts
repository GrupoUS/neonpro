/**
 * TDD RED Phase - Set Method Misuse Test
 * 
 * This test demonstrates the Set method misuse issue in healthcare-session-management-service.ts
 * where .indexOf() and .splice() are called on a Set object, causing TypeError.
 * 
 * Issue Location: apps/api/src/services/healthcare-session-management-service.ts:644-646
 * Problem: userSessions is a Set but code tries to use array methods
 * 
 * Expected Behavior:
 * - Expired session cleanup should work without throwing TypeError
 * - Session removal from userSessionMap should use proper Set methods
 * - Concurrent session enforcement should continue working
 * 
 * Security: Critical - Session cleanup affects security and compliance
 * Compliance: LGPD, ANVISA, CFM
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HealthcareSessionManagementService } from '../services/healthcare-session-management-service'

describe('TDD RED PHASE - Set Method Misuse in Session Cleanup', () => {
  beforeEach(() => {
    // Clear any existing sessions
    HealthcareSessionManagementService['sessions'].clear()
    HealthcareSessionManagementService['userSessionMap'].clear()
  })

  afterEach(() => {
    // Cleanup
    HealthcareSessionManagementService['sessions'].clear()
    HealthcareSessionManagementService['userSessionMap'].clear()
  })

  describe('Session Cleanup for Expired Sessions', () => {
    it('should remove expired session from userSessionMap without throwing TypeError', async () => {
      // Arrange: Create a user with multiple sessions
      const userId = 'user-123'
      const sessionId1 = 'session-1'
      const sessionId2 = 'session-2'
      
      // Manually create and add sessions to simulate the scenario
      const expiredSession = {
        sessionId: sessionId1,
        userId: userId,
        userRole: 'healthcare_professional',
        permissions: ['read_patient_data'],
        healthcareProvider: 'Hospital São Lucas',
        patientId: 'patient-456',
        consentLevel: 'full' as const,
        sessionType: 'standard' as const,
        mfaVerified: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        lastAccessedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        expiresAt: new Date(Date.now() - 1000), // 1 second ago (expired)
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        dataAccessLog: [],
        complianceFlags: {
          lgpdCompliant: true,
          anonymizationRequired: false,
          dataMinimizationApplied: true,
          retentionPolicyApplied: true,
          encryptionApplied: true,
          accessControlApplied: true,
          auditTrailEnabled: true,
          breachNotificationRequired: false
        }
      }

      const activeSession = {
        ...expiredSession,
        sessionId: sessionId2,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      }

      // Manually add sessions to simulate real scenario
      HealthcareSessionManagementService['sessions'].set(sessionId1, expiredSession)
      HealthcareSessionManagementService['sessions'].set(sessionId2, activeSession)

      // Simulate userSessionMap having a Set (as in the actual implementation)
      const userSessions = new Set([sessionId1, sessionId2])
      HealthcareSessionManagementService['userSessionMap'].set(userId, userSessions)

      // Act & Assert: This should fail because validateSession tries to use array methods on Set
      const result = await HealthcareSessionManagementService.validateSession(sessionId1)

      // Expected: Should handle expired session gracefully
      expect(result).toEqual({
        isValid: false,
        session: undefined,
        error: 'Session not found or expired'
      })

      // Expected: Expired session should be removed from sessions
      expect(HealthcareSessionManagementService['sessions'].has(sessionId1)).toBe(false)

      // Expected: Expired session should be removed from userSessionMap
      const remainingSessions = HealthcareSessionManagementService['userSessionMap'].get(userId)
      expect(remainingSessions?.has(sessionId1)).toBe(false)
      expect(remainingSessions?.has(sessionId2)).toBe(true) // Active session should remain
    })

    it('should handle concurrent session cleanup without throwing TypeError', async () => {
      // Arrange: Create multiple expired sessions for the same user
      const userId = 'user-123'
      const sessionIds = ['session-1', 'session-2', 'session-3']
      
      // Create sessions where some are expired
      const now = new Date()
      const sessions = sessionIds.map((sessionId, index) => ({
        sessionId,
        userId,
        userRole: 'healthcare_professional',
        permissions: ['read_patient_data'],
        healthcareProvider: 'Hospital São Lucas',
        patientId: 'patient-456',
        consentLevel: 'full' as const,
        sessionType: 'standard' as const,
        mfaVerified: true,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000),
        lastAccessedAt: new Date(now.getTime() - 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - (index + 1) * 1000), // All expired
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        dataAccessLog: [],
        complianceFlags: {
          lgpdCompliant: true,
          anonymizationRequired: false,
          dataMinimizationApplied: true,
          retentionPolicyApplied: true,
          encryptionApplied: true,
          accessControlApplied: true,
          auditTrailEnabled: true,
          breachNotificationRequired: false
        }
      }))

      // Manually add sessions
      sessions.forEach(session => {
        HealthcareSessionManagementService['sessions'].set(session.sessionId, session)
      })

      const userSessionsSet = new Set(sessionIds)
      HealthcareSessionManagementService['userSessionMap'].set(userId, userSessionsSet)

      // Act & Assert: Validate each expired session - should not throw TypeError
      for (const sessionId of sessionIds) {
        const result = await HealthcareSessionManagementService.validateSession(sessionId)
        expect(result).toEqual({
          isValid: false,
          session: undefined,
          error: 'Session not found or expired'
        })
      }

      // Expected: All sessions should be cleaned up
      expect(HealthcareSessionManagementService['sessions'].size).toBe(0)
      expect(HealthcareSessionManagementService['userSessionMap'].get(userId)?.size).toBe(0)
    })

    it('should preserve active sessions while cleaning expired ones', async () => {
      // Arrange: Mix of expired and active sessions
      const userId = 'user-123'
      const expiredSessionId = 'expired-session'
      const activeSessionId = 'active-session'
      
      const now = new Date()
      const expiredSession = {
        sessionId: expiredSessionId,
        userId,
        userRole: 'healthcare_professional',
        permissions: ['read_patient_data'],
        healthcareProvider: 'Hospital São Lucas',
        patientId: 'patient-456',
        consentLevel: 'full' as const,
        sessionType: 'standard' as const,
        mfaVerified: true,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000),
        lastAccessedAt: new Date(now.getTime() - 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 1000), // Expired
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        dataAccessLog: [],
        complianceFlags: {
          lgpdCompliant: true,
          anonymizationRequired: false,
          dataMinimizationApplied: true,
          retentionPolicyApplied: true,
          encryptionApplied: true,
          accessControlApplied: true,
          auditTrailEnabled: true,
          breachNotificationRequired: false
        }
      }

      const activeSession = {
        ...expiredSession,
        sessionId: activeSessionId,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000) // Active
      }

      // Manually add sessions
      HealthcareSessionManagementService['sessions'].set(expiredSessionId, expiredSession)
      HealthcareSessionManagementService['sessions'].set(activeSessionId, activeSession)

      const userSessionsSet = new Set([expiredSessionId, activeSessionId])
      HealthcareSessionManagementService['userSessionMap'].set(userId, userSessionsSet)

      // Act & Assert: Clean up expired session
      const result = await HealthcareSessionManagementService.validateSession(expiredSessionId)

      expect(result).toEqual({
        isValid: false,
        session: undefined,
        error: 'Session not found or expired'
      })

      // Expected: Expired session removed, active session remains
      expect(HealthcareSessionManagementService['sessions'].has(expiredSessionId)).toBe(false)
      expect(HealthcareSessionManagementService['sessions'].has(activeSessionId)).toBe(true)
      
      const remainingSessions = HealthcareSessionManagementService['userSessionMap'].get(userId)
      expect(remainingSessions?.has(expiredSessionId)).toBe(false)
      expect(remainingSessions?.has(activeSessionId)).toBe(true)
    })

    it('should handle case where userSessionMap has no sessions for user', async () => {
      // Arrange: Create expired session but no userSessionMap entry
      const sessionId = 'expired-session'
      const userId = 'user-123'
      
      const expiredSession = {
        sessionId,
        userId,
        userRole: 'healthcare_professional',
        permissions: ['read_patient_data'],
        healthcareProvider: 'Hospital São Lucas',
        patientId: 'patient-456',
        consentLevel: 'full' as const,
        sessionType: 'standard' as const,
        mfaVerified: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        lastAccessedAt: new Date(Date.now() - 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1000), // Expired
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        dataAccessLog: [],
        complianceFlags: {
          lgpdCompliant: true,
          anonymizationRequired: false,
          dataMinimizationApplied: true,
          retentionPolicyApplied: true,
          encryptionApplied: true,
          accessControlApplied: true,
          auditTrailEnabled: true,
          breachNotificationRequired: false
        }
      }

      // Add session but no userSessionMap entry
      HealthcareSessionManagementService['sessions'].set(sessionId, expiredSession)
      // userSessionMap does not have entry for this user

      // Act & Assert: Should handle gracefully without throwing TypeError
      const result = await HealthcareSessionManagementService.validateSession(sessionId)

      expect(result).toEqual({
        isValid: false,
        session: undefined,
        error: 'Session not found or expired'
      })

      // Expected: Session should be removed from sessions
      expect(HealthcareSessionManagementService['sessions'].has(sessionId)).toBe(false)
    })

    it('should not break concurrent session enforcement when cleaning expired sessions', async () => {
      // Arrange: Test concurrent session limit enforcement during cleanup
      const userId = 'user-123'
      const sessionId1 = 'session-1'
      const sessionId2 = 'session-2'
      const sessionId3 = 'session-3'
      
      const now = new Date()
      const expiredSession = {
        sessionId: sessionId1,
        userId,
        userRole: 'healthcare_professional',
        permissions: ['read_patient_data'],
        healthcareProvider: 'Hospital São Lucas',
        patientId: 'patient-456',
        consentLevel: 'full' as const,
        sessionType: 'standard' as const,
        mfaVerified: true,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000),
        lastAccessedAt: new Date(now.getTime() - 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 1000), // Expired
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        dataAccessLog: [],
        complianceFlags: {
          lgpdCompliant: true,
          anonymizationRequired: false,
          dataMinimizationApplied: true,
          retentionPolicyApplied: true,
          encryptionApplied: true,
          accessControlApplied: true,
          auditTrailEnabled: true,
          breachNotificationRequired: false
        }
      }

      const activeSession1 = {
        ...expiredSession,
        sessionId: sessionId2,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000)
      }

      const activeSession2 = {
        ...expiredSession,
        sessionId: sessionId3,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000)
      }

      // Add all sessions
      HealthcareSessionManagementService['sessions'].set(sessionId1, expiredSession)
      HealthcareSessionManagementService['sessions'].set(sessionId2, activeSession1)
      HealthcareSessionManagementService['sessions'].set(sessionId3, activeSession2)

      const userSessionsSet = new Set([sessionId1, sessionId2, sessionId3])
      HealthcareSessionManagementService['userSessionMap'].set(userId, userSessionsSet)

      // Act & Assert: Clean up expired session
      const result = await HealthcareSessionManagementService.validateSession(sessionId1)

      expect(result).toEqual({
        isValid: false,
        session: undefined,
        error: 'Session not found or expired'
      })

      // Expected: Concurrent session enforcement should still work
      // After cleanup, user should only have 2 active sessions
      const remainingSessions = HealthcareSessionManagementService['userSessionMap'].get(userId)
      expect(remainingSessions?.size).toBe(2)
      expect(remainingSessions?.has(sessionId1)).toBe(false)
      expect(remainingSessions?.has(sessionId2)).toBe(true)
      expect(remainingSessions?.has(sessionId3)).toBe(true)
    })
  })
})