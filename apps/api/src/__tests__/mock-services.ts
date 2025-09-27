/**
 * Mock Services for Authentication Testing
 *
 * Provides mock implementations of services needed for authentication testing
 */

// Mock Session Management Service
export class MockHealthcareSessionManagementService {
  static async validateSession(_sessionId: string) {
    return {
      isValid: _sessionId === 'valid-session-id',
      session: _sessionId === 'valid-session-id'
        ? {
          id: _sessionId,
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        }
        : null,
    }
  }

  static async createSession(userId: string, options: any = {}) {
    return {
      id: 'session-' + Math.random().toString(36).substr(2, 9),
      userId,
      isActive: true,
      ...options,
    }
  }
}

// Mock Security Validation Service
export class MockSecurityValidationService {
  static async validateRequest(_request: any) {
    return {
      isValid: true,
      threats: [],
      score: 1.0,
    }
  }

  static async validateSecurityContext(_context: any) {
    return {
      isValid: true,
      issues: [],
    }
  }

  static async validateRequestSecurity(_request: any) {
    return {
      isValid: true,
      securityScore: 95,
      threats: [],
    }
  }
}

// Mock Audit Trail Service
export class MockAuditTrailService {
  static async logEvent(_event: any) {
    // Mock implementation
    return Promise.resolve()
  }

  static async logSecurityEvent(_event: any) {
    // Mock implementation for test compatibility
    return Promise.resolve()
  }
}

// Mock Enhanced Session Manager
export class MockEnhancedSessionManager {
  static async validateSession(_sessionId: string) {
    return {
      isValid: _sessionId === 'valid-session-id',
      session: _sessionId === 'valid-session-id'
        ? {
          id: _sessionId,
          userId: 'user-123',
          userRole: 'healthcare_professional',
          isActive: true,
        }
        : null,
    }
  }

  static async createSession(userId: string, options: any = {}) {
    return {
      id: 'session-' + Math.random().toString(36).substr(2, 9),
      userId,
      isActive: true,
      ...options,
    }
  }

  getSession(_sessionId: string) {
    if (_sessionId === 'valid-session-id') {
      return {
        id: _sessionId,
        userId: 'user-123',
        role: 'healthcare_professional',
        permissions: ['read_patient_data'],
        healthcareProvider: 'test-hospital',
        patientId: 'patient-123',
        consentLevel: 'full' as const,
        mfaVerified: true,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      }
    }
    return null
  }

  destroySession(_sessionId: string) {
    // Mock implementation
    return true
  }
}

// Mock Session Cookie Utils
export const SessionCookieUtils = {
  validateSessionCookies: (cookieHeader: string, _secretKey: string, _sessionManager: any) => {
    if (cookieHeader && cookieHeader.includes('session-123')) {
      return {
        isValid: true,
        sessionId: 'session-123',
      }
    }
    return {
      isValid: false,
      sessionId: null,
    }
  },
  extractSessionCookie: () => 'valid-session-cookie',
}

export {
  MockAuditTrailService as AuditTrailService,
  MockEnhancedSessionManager as EnhancedSessionManager,
  MockHealthcareSessionManagementService as HealthcareSessionManagementService,
  MockSecurityValidationService as SecurityValidationService,
}
