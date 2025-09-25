/**
 * Mock Services for Authentication Testing
 * 
 * Provides mock implementations of services needed for authentication testing
 */

// Mock Session Management Service
export class MockHealthcareSessionManagementService {
  static async validateSession(sessionId: string) {
    return {
      isValid: sessionId === 'valid-session-id',
      session: sessionId === 'valid-session-id' ? {
        id: sessionId,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        isActive: true,
      } : null
    }
  }

  static async createSession(userId: string, options: any = {}) {
    return {
      id: 'session-' + Math.random().toString(36).substr(2, 9),
      userId,
      isActive: true,
      ...options
    }
  }
}

// Mock Security Validation Service
export class MockSecurityValidationService {
  static async validateRequest(request: any) {
    return {
      isValid: true,
      threats: [],
      score: 1.0
    }
  }

  static async validateSecurityContext(context: any) {
    return {
      isValid: true,
      issues: []
    }
  }
}

// Mock Audit Trail Service
export class MockAuditTrailService {
  static async logEvent(event: any) {
    // Mock implementation
    return Promise.resolve()
  }

  static async logSecurityEvent(userId: string, action: string, resource: string, details: any = {}) {
    // Mock implementation
    return Promise.resolve()
  }
}

// Mock Enhanced Session Manager
export class MockEnhancedSessionManager {
  static async validateSession(sessionId: string) {
    return {
      isValid: sessionId === 'valid-session-id',
      session: sessionId === 'valid-session-id' ? {
        id: sessionId,
        userId: 'user-123',
        userRole: 'healthcare_professional',
        isActive: true,
      } : null
    }
  }

  static async createSession(userId: string, options: any = {}) {
    return {
      id: 'session-' + Math.random().toString(36).substr(2, 9),
      userId,
      isActive: true,
      ...options
    }
  }
}

// Mock Session Cookie Utils
export const SessionCookieUtils = {
  validateSessionCookies: () => ({ isValid: true }),
  extractSessionCookie: () => 'valid-session-cookie'
}

export {
  MockHealthcareSessionManagementService as HealthcareSessionManagementService,
  MockSecurityValidationService as SecurityValidationService,
  MockAuditTrailService as AuditTrailService,
  MockEnhancedSessionManager as EnhancedSessionManager
}