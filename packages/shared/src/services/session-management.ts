/**
 * @fileoverview Session Management Service
 * 
 * Comprehensive session management system for healthcare applications with:
 * - Secure session creation, validation, and lifecycle management
 * - Healthcare workflow support (patient, provider, emergency sessions)
 * - LGPD compliance and data retention policies
 * - Integration with authentication/authorization stack
 * - Advanced security features and audit logging
 * - Performance optimization and observability
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001, NIST Cybersecurity Framework
 */

import { z } from 'zod';
import { webcrypto } from 'node:crypto';

// Ensure crypto is available in both Node.js and browser environments
const crypto = globalThis.crypto || webcrypto;

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Session types for different healthcare workflows
 */
export enum SessionType {
  PATIENT = 'patient',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  ADMIN = 'admin',
  EMERGENCY = 'emergency',
  SYSTEM = 'system',
  API = 'api'
}

/**
 * Session status enumeration
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated'
}

/**
 * Session security levels
 */
export enum SessionSecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Healthcare context for session management
 */
export const HealthcareSessionContextSchema = z.object({
  facilityId: z.string().optional(),
  departmentId: z.string().optional(),
  patientId: z.string().optional(),
  providerId: z.string().optional(),
  emergencyCode: z.string().optional(),
  clinicalContext: z.enum(['consultation', 'surgery', 'emergency', 'administrative', 'research']).optional(),
  dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
  lgpdConsentId: z.string().optional(),
  auditTrailId: z.string().optional()
});

export type HealthcareSessionContext = z.infer<typeof HealthcareSessionContextSchema>;

/**
 * Session configuration schema
 */
export const SessionConfigSchema = z.object({
  maxIdleTime: z.number().min(300).max(86400), // 5 minutes to 24 hours
  maxSessionDuration: z.number().min(1800).max(604800), // 30 minutes to 7 days
  securityLevel: z.nativeEnum(SessionSecurityLevel),
  requireMFA: z.boolean().default(false),
  allowConcurrentSessions: z.boolean().default(false),
  maxConcurrentSessions: z.number().min(1).max(10).default(1),
  enableSessionBinding: z.boolean().default(true),
  lgpdRetentionDays: z.number().min(1).max(3650).default(2555), // 7 years default
  auditLevel: z.enum(['minimal', 'standard', 'comprehensive']).default('standard')
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

/**
 * Session data schema
 */
export const SessionDataSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  userType: z.nativeEnum(SessionType),
  status: z.nativeEnum(SessionStatus),
  securityLevel: z.nativeEnum(SessionSecurityLevel),
  
  // Timestamps
  createdAt: z.date(),
  lastAccessedAt: z.date(),
  expiresAt: z.date(),
  terminatedAt: z.date().optional(),
  
  // Security information
  ipAddress: z.string(),
  userAgent: z.string(),
  deviceFingerprint: z.string().optional(),
  mfaVerified: z.boolean().default(false),
  
  // Healthcare context
  healthcareContext: HealthcareSessionContextSchema.optional(),
  
  // Session binding
  csrfToken: z.string().optional(),
  sessionBinding: z.string().optional(),
  
  // Metadata
  metadata: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  
  // Compliance
  lgpdConsentVersion: z.string().optional(),
  auditTrailId: z.string().optional(),
  dataRetentionDate: z.date().optional()
});

export type SessionData = z.infer<typeof SessionDataSchema>;

/**
 * Session creation request schema
 */
export const CreateSessionRequestSchema = z.object({
  userId: z.string(),
  userType: z.nativeEnum(SessionType),
  securityLevel: z.nativeEnum(SessionSecurityLevel).default(SessionSecurityLevel.MEDIUM),
  ipAddress: z.string(),
  userAgent: z.string(),
  deviceFingerprint: z.string().optional(),
  healthcareContext: HealthcareSessionContextSchema.optional(),
  config: SessionConfigSchema.optional(),
  metadata: z.record(z.any()).default({})
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

/**
 * Session validation result schema
 */
export const SessionValidationResultSchema = z.object({
  isValid: z.boolean(),
  session: SessionDataSchema.optional(),
  reason: z.string().optional(),
  requiresRefresh: z.boolean().default(false),
  securityFlags: z.array(z.string()).default([]),
  complianceFlags: z.array(z.string()).default([])
});

export type SessionValidationResult = z.infer<typeof SessionValidationResultSchema>;

/**
 * Session activity event schema
 */
export const SessionActivityEventSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  eventType: z.enum([
    'session_created',
    'session_accessed',
    'session_refreshed',
    'session_expired',
    'session_revoked',
    'session_suspended',
    'session_terminated',
    'security_violation',
    'mfa_challenge',
    'emergency_access'
  ]),
  timestamp: z.date(),
  ipAddress: z.string(),
  userAgent: z.string(),
  details: z.record(z.any()).default({}),
  securityLevel: z.nativeEnum(SessionSecurityLevel),
  complianceContext: z.object({
    lgpdApplicable: z.boolean().default(false),
    auditRequired: z.boolean().default(true),
    dataRetentionApplied: z.boolean().default(false)
  }).default({})
});

export type SessionActivityEvent = z.infer<typeof SessionActivityEventSchema>;

// ============================================================================
// SESSION STORE INTERFACE
// ============================================================================

/**
 * Interface for session storage implementations
 */
export interface SessionStore {
  /**
   * Store a session
   */
  store(sessionData: SessionData): Promise<void>;
  
  /**
   * Retrieve a session by ID
   */
  get(sessionId: string): Promise<SessionData | null>;
  
  /**
   * Update a session
   */
  update(sessionId: string, updates: Partial<SessionData>): Promise<void>;
  
  /**
   * Delete a session
   */
  delete(sessionId: string): Promise<void>;
  
  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): Promise<SessionData[]>;
  
  /**
   * Get expired sessions
   */
  getExpiredSessions(before?: Date): Promise<SessionData[]>;
  
  /**
   * Clean up expired sessions
   */
  cleanup(retentionDays?: number): Promise<number>;
}

// ============================================================================
// DEFAULT SESSION CONFIGURATIONS
// ============================================================================

/**
 * Default session configurations by type
 */
export const DEFAULT_SESSION_CONFIGS: Record<SessionType, SessionConfig> = {
  [SessionType.PATIENT]: {
    maxIdleTime: 1800, // 30 minutes
    maxSessionDuration: 14400, // 4 hours
    securityLevel: SessionSecurityLevel.HIGH,
    requireMFA: false,
    allowConcurrentSessions: false,
    maxConcurrentSessions: 1,
    enableSessionBinding: true,
    lgpdRetentionDays: 2555, // 7 years
    auditLevel: 'comprehensive'
  },
  [SessionType.HEALTHCARE_PROVIDER]: {
    maxIdleTime: 3600, // 1 hour
    maxSessionDuration: 28800, // 8 hours
    securityLevel: SessionSecurityLevel.HIGH,
    requireMFA: true,
    allowConcurrentSessions: true,
    maxConcurrentSessions: 3,
    enableSessionBinding: true,
    lgpdRetentionDays: 2555, // 7 years
    auditLevel: 'comprehensive'
  },
  [SessionType.ADMIN]: {
    maxIdleTime: 1800, // 30 minutes
    maxSessionDuration: 14400, // 4 hours
    securityLevel: SessionSecurityLevel.CRITICAL,
    requireMFA: true,
    allowConcurrentSessions: false,
    maxConcurrentSessions: 1,
    enableSessionBinding: true,
    lgpdRetentionDays: 2555, // 7 years
    auditLevel: 'comprehensive'
  },
  [SessionType.EMERGENCY]: {
    maxIdleTime: 7200, // 2 hours
    maxSessionDuration: 86400, // 24 hours
    securityLevel: SessionSecurityLevel.CRITICAL,
    requireMFA: false, // Disabled for emergency access
    allowConcurrentSessions: true,
    maxConcurrentSessions: 5,
    enableSessionBinding: false, // Disabled for emergency access
    lgpdRetentionDays: 2555, // 7 years
    auditLevel: 'comprehensive'
  },
  [SessionType.SYSTEM]: {
    maxIdleTime: 3600, // 1 hour
    maxSessionDuration: 86400, // 24 hours
    securityLevel: SessionSecurityLevel.HIGH,
    requireMFA: false,
    allowConcurrentSessions: true,
    maxConcurrentSessions: 10,
    enableSessionBinding: false,
    lgpdRetentionDays: 365, // 1 year
    auditLevel: 'standard'
  },
  [SessionType.API]: {
    maxIdleTime: 7200, // 2 hours
    maxSessionDuration: 604800, // 7 days
    securityLevel: SessionSecurityLevel.MEDIUM,
    requireMFA: false,
    allowConcurrentSessions: true,
    maxConcurrentSessions: 100,
    enableSessionBinding: false,
    lgpdRetentionDays: 1095, // 3 years
    auditLevel: 'standard'
  }
};

// ============================================================================
// SESSION SECURITY UTILITIES
// ============================================================================

/**
 * Generate secure session ID
 */
export function generateSessionId(): string {
  // Use crypto.randomUUID() in browser, or fallback to secure random
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for Node.js environments
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    (crypto.getRandomValues as (array: Uint8Array) => Uint8Array)(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate session binding token
 */
export function generateSessionBinding(sessionId: string, userAgent: string, ipAddress: string): string {
  // Simple hash-based binding (in production, use proper HMAC)
  const data = `${sessionId}:${userAgent}:${ipAddress}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Generate device fingerprint
 */
export function generateDeviceFingerprint(userAgent: string, additionalData: Record<string, any> = {}): string {
  const data = {
    userAgent,
    language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...additionalData
  };
  
  const dataString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// ============================================================================
// SESSION VALIDATION UTILITIES
// ============================================================================

/**
 * Validate session expiry
 */
export function isSessionExpired(session: SessionData): boolean {
  return new Date() > session.expiresAt;
}

/**
 * Validate session idle timeout
 */
export function isSessionIdleTimeout(session: SessionData, config: SessionConfig): boolean {
  const idleTime = Date.now() - session.lastAccessedAt.getTime();
  return idleTime > (config.maxIdleTime * 1000);
}

/**
 * Validate session security binding
 */
export function validateSessionBinding(
  session: SessionData,
  currentUserAgent: string,
  currentIpAddress: string
): boolean {
  if (!session.sessionBinding) {
    return false;
  }
  
  const expectedBinding = generateSessionBinding(
    session.sessionId,
    currentUserAgent,
    currentIpAddress
  );
  
  return session.sessionBinding === expectedBinding;
}

/**
 * Assess session security risk
 */
export function assessSessionSecurityRisk(
  session: SessionData,
  currentIpAddress: string,
  currentUserAgent: string
): string[] {
  const risks: string[] = [];
  
  // IP address change
  if (session.ipAddress !== currentIpAddress) {
    risks.push('ip_address_change');
  }
  
  // User agent change
  if (session.userAgent !== currentUserAgent) {
    risks.push('user_agent_change');
  }
  
  // Long session duration
  const sessionDuration = Date.now() - session.createdAt.getTime();
  if (sessionDuration > 86400000) { // 24 hours
    risks.push('long_session_duration');
  }
  
  // High security level without MFA
  if (session.securityLevel === SessionSecurityLevel.CRITICAL && !session.mfaVerified) {
    risks.push('high_security_without_mfa');
  }
  
  return risks;
}

// ============================================================================
// LGPD COMPLIANCE UTILITIES
// ============================================================================

/**
 * Calculate LGPD data retention date
 */
export function calculateDataRetentionDate(
  sessionType: SessionType,
  config: SessionConfig,
  healthcareContext?: HealthcareSessionContext
): Date {
  let retentionDays = config.lgpdRetentionDays;
  
  // Healthcare-specific retention rules
  if (healthcareContext?.clinicalContext === 'emergency') {
    retentionDays = Math.max(retentionDays, 3650); // 10 years for emergency records
  }
  
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() + retentionDays);
  return retentionDate;
}

/**
 * Check if session data should be anonymized
 */
export function shouldAnonymizeSessionData(session: SessionData): boolean {
  if (!session.dataRetentionDate) {
    return false;
  }
  
  // Anonymize 30 days before retention date
  const anonymizationDate = new Date(session.dataRetentionDate);
  anonymizationDate.setDate(anonymizationDate.getDate() - 30);
  
  return new Date() > anonymizationDate;
}

/**
 * Anonymize session data for LGPD compliance
 */
export function anonymizeSessionData(session: SessionData): SessionData {
  return {
    ...session,
    userId: 'anonymized',
    ipAddress: 'anonymized',
    userAgent: 'anonymized',
    deviceFingerprint: undefined,
    healthcareContext: undefined,
    metadata: {},
    lgpdConsentVersion: undefined
  };
}

// ============================================================================
// HEALTHCARE SESSION UTILITIES
// ============================================================================

/**
 * Validate healthcare session context
 */
export function validateHealthcareContext(
  context: HealthcareSessionContext,
  userType: SessionType
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Patient sessions must have patient ID
  if (userType === SessionType.PATIENT && !context.patientId) {
    errors.push('Patient sessions require patientId');
  }
  
  // Provider sessions must have provider ID
  if (userType === SessionType.HEALTHCARE_PROVIDER && !context.providerId) {
    errors.push('Healthcare provider sessions require providerId');
  }
  
  // Emergency sessions must have emergency code
  if (userType === SessionType.EMERGENCY && !context.emergencyCode) {
    errors.push('Emergency sessions require emergencyCode');
  }
  
  // Clinical context validation
  if (context.clinicalContext && userType === SessionType.PATIENT) {
    const allowedPatientContexts = ['consultation', 'emergency'];
    if (!allowedPatientContexts.includes(context.clinicalContext)) {
      errors.push(`Invalid clinical context for patient: ${context.clinicalContext}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get emergency session override
 */
export function getEmergencySessionOverride(): Partial<SessionConfig> {
  return {
    maxIdleTime: 7200, // 2 hours
    maxSessionDuration: 86400, // 24 hours
    requireMFA: false,
    enableSessionBinding: false,
    auditLevel: 'comprehensive'
  };
}

// ============================================================================
// SESSION MANAGEMENT SERVICE
// ============================================================================

/**
 * Comprehensive Session Management Service
 */
export class SessionManagementService {
  private store: SessionStore;
  private activityLog: SessionActivityEvent[] = [];
  
  constructor(store: SessionStore) {
    this.store = store;
  }
  
  /**
   * Create a new session
   */
  async createSession(request: CreateSessionRequest): Promise<SessionData> {
    const validatedRequest = CreateSessionRequestSchema.parse(request);
    
    // Get configuration
    const defaultConfig = DEFAULT_SESSION_CONFIGS[validatedRequest.userType];
    const config = { ...defaultConfig, ...validatedRequest.config };
    
    // Validate healthcare context if provided
    if (validatedRequest.healthcareContext) {
      const contextValidation = validateHealthcareContext(
        validatedRequest.healthcareContext,
        validatedRequest.userType
      );
      
      if (!contextValidation.isValid) {
        throw new Error(`Invalid healthcare context: ${contextValidation.errors.join(', ')}`);
      }
    }
    
    // Check concurrent session limits
    if (!config.allowConcurrentSessions) {
      const existingSessions = await this.store.getUserSessions(validatedRequest.userId);
      const activeSessions = existingSessions.filter(s => s.status === SessionStatus.ACTIVE);
      
      if (activeSessions.length >= config.maxConcurrentSessions) {
        // Terminate oldest session
        const oldestSession = activeSessions.sort((a, b) => 
          a.createdAt.getTime() - b.createdAt.getTime()
        )[0];
        
        await this.terminateSession(oldestSession.sessionId, 'concurrent_limit_exceeded');
      }
    }
    
    // Generate session data
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (config.maxSessionDuration * 1000));
    const sessionId = generateSessionId();
    
    const sessionData: SessionData = {
      sessionId,
      userId: validatedRequest.userId,
      userType: validatedRequest.userType,
      status: SessionStatus.ACTIVE,
      securityLevel: validatedRequest.securityLevel,
      
      // Timestamps
      createdAt: now,
      lastAccessedAt: now,
      expiresAt,
      
      // Security information
      ipAddress: validatedRequest.ipAddress,
      userAgent: validatedRequest.userAgent,
      deviceFingerprint: validatedRequest.deviceFingerprint || 
        generateDeviceFingerprint(validatedRequest.userAgent),
      mfaVerified: false,
      
      // Healthcare context
      healthcareContext: validatedRequest.healthcareContext,
      
      // Session binding
      csrfToken: config.enableSessionBinding ? generateCSRFToken() : undefined,
      sessionBinding: config.enableSessionBinding ? 
        generateSessionBinding(sessionId, validatedRequest.userAgent, validatedRequest.ipAddress) : 
        undefined,
      
      // Metadata
      metadata: validatedRequest.metadata,
      tags: [],
      
      // Compliance
      lgpdConsentVersion: validatedRequest.healthcareContext?.lgpdConsentId,
      auditTrailId: validatedRequest.healthcareContext?.auditTrailId,
      dataRetentionDate: calculateDataRetentionDate(
        validatedRequest.userType,
        config,
        validatedRequest.healthcareContext
      )
    };
    
    // Store session
    await this.store.store(sessionData);
    
    // Log activity
    await this.logActivity({
      sessionId,
      userId: validatedRequest.userId,
      eventType: 'session_created',
      timestamp: now,
      ipAddress: validatedRequest.ipAddress,
      userAgent: validatedRequest.userAgent,
      details: {
        userType: validatedRequest.userType,
        securityLevel: validatedRequest.securityLevel,
        healthcareContext: validatedRequest.healthcareContext
      },
      securityLevel: validatedRequest.securityLevel,
      complianceContext: {
        lgpdApplicable: !!validatedRequest.healthcareContext?.lgpdConsentId,
        auditRequired: true,
        dataRetentionApplied: true
      }
    });
    
    return sessionData;
  }
  
  /**
   * Validate a session
   */
  async validateSession(
    sessionId: string,
    currentIpAddress: string,
    currentUserAgent: string
  ): Promise<SessionValidationResult> {
    const session = await this.store.get(sessionId);
    
    if (!session) {
      return {
        isValid: false,
        reason: 'Session not found'
      };
    }
    
    // Check session status
    if (session.status !== SessionStatus.ACTIVE) {
      return {
        isValid: false,
        session,
        reason: `Session status: ${session.status}`
      };
    }
    
    // Check expiration
    if (isSessionExpired(session)) {
      await this.expireSession(sessionId);
      return {
        isValid: false,
        session,
        reason: 'Session expired'
      };
    }
    
    // Get configuration
    const config = DEFAULT_SESSION_CONFIGS[session.userType];
    
    // Check idle timeout
    if (isSessionIdleTimeout(session, config)) {
      await this.expireSession(sessionId);
      return {
        isValid: false,
        session,
        reason: 'Session idle timeout'
      };
    }
    
    // Security validation
    const securityFlags = assessSessionSecurityRisk(session, currentIpAddress, currentUserAgent);
    
    // Session binding validation
    if (config.enableSessionBinding && 
        !validateSessionBinding(session, currentUserAgent, currentIpAddress)) {
      await this.logActivity({
        sessionId,
        userId: session.userId,
        eventType: 'security_violation',
        timestamp: new Date(),
        ipAddress: currentIpAddress,
        userAgent: currentUserAgent,
        details: { violation: 'session_binding_mismatch' },
        securityLevel: session.securityLevel,
        complianceContext: {
          lgpdApplicable: false,
          auditRequired: true,
          dataRetentionApplied: false
        }
      });
      
      return {
        isValid: false,
        session,
        reason: 'Session binding validation failed',
        securityFlags
      };
    }
    
    // Update last accessed time
    await this.store.update(sessionId, {
      lastAccessedAt: new Date()
    });
    
    return {
      isValid: true,
      session,
      securityFlags,
      requiresRefresh: securityFlags.length > 0
    };
  }
  
  /**
   * Refresh a session
   */
  async refreshSession(sessionId: string): Promise<SessionData> {
    const session = await this.store.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const config = DEFAULT_SESSION_CONFIGS[session.userType];
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + (config.maxSessionDuration * 1000));
    
    const updates: Partial<SessionData> = {
      lastAccessedAt: now,
      expiresAt: newExpiresAt,
      csrfToken: config.enableSessionBinding ? generateCSRFToken() : session.csrfToken
    };
    
    await this.store.update(sessionId, updates);
    
    // Log activity
    await this.logActivity({
      sessionId,
      userId: session.userId,
      eventType: 'session_refreshed',
      timestamp: now,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      details: { newExpiresAt },
      securityLevel: session.securityLevel,
      complianceContext: { lgpdApplicable: false, auditRequired: true, dataRetentionApplied: false }
    });
    
    const updatedSession = await this.store.get(sessionId);
    if (!updatedSession) {
      throw new Error('Failed to retrieve updated session');
    }
    
    return updatedSession;
  }
  
  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    const session = await this.store.get(sessionId);
    
    if (!session) {
      return; // Session already doesn't exist
    }
    
    const now = new Date();
    
    await this.store.update(sessionId, {
      status: SessionStatus.TERMINATED,
      terminatedAt: now
    });
    
    // Log activity
    await this.logActivity({
      sessionId,
      userId: session.userId,
      eventType: 'session_terminated',
      timestamp: now,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      details: { reason: reason || 'manual_termination' },
      securityLevel: session.securityLevel,
      complianceContext: {
        lgpdApplicable: false,
        auditRequired: true,
        dataRetentionApplied: false
      }
    });
  }
  
  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string, reason?: string): Promise<void> {
    const session = await this.store.get(sessionId);
    
    if (!session) {
      return;
    }
    
    const now = new Date();
    
    await this.store.update(sessionId, {
      status: SessionStatus.REVOKED,
      terminatedAt: now
    });
    
    // Log activity
    await this.logActivity({
      sessionId,
      userId: session.userId,
      eventType: 'session_revoked',
      timestamp: now,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      details: { reason: reason || 'manual_revocation' },
      securityLevel: session.securityLevel,
      complianceContext: {
        lgpdApplicable: false,
        auditRequired: true,
        dataRetentionApplied: false
      }
    });
  }
  
  /**
   * Expire a session
   */
  async expireSession(sessionId: string): Promise<void> {
    const session = await this.store.get(sessionId);
    
    if (!session) {
      return;
    }
    
    const now = new Date();
    
    await this.store.update(sessionId, {
      status: SessionStatus.EXPIRED,
      terminatedAt: now
    });
    
    // Log activity
    await this.logActivity({
      sessionId,
      userId: session.userId,
      eventType: 'session_expired',
      timestamp: now,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      details: { reason: 'automatic_expiration' },
      securityLevel: session.securityLevel,
      complianceContext: {
        lgpdApplicable: false,
        auditRequired: true,
        dataRetentionApplied: false
      }
    });
  }
  
  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    return this.store.getUserSessions(userId);
  }
  
  /**
   * Terminate all user sessions
   */
  async terminateAllUserSessions(userId: string, reason?: string): Promise<void> {
    const sessions = await this.store.getUserSessions(userId);
    const activeSessions = sessions.filter(s => s.status === SessionStatus.ACTIVE);
    
    for (const session of activeSessions) {
      await this.terminateSession(session.sessionId, reason);
    }
  }
  
  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const expiredSessions = await this.store.getExpiredSessions();
    let cleanedCount = 0;
    
    for (const session of expiredSessions) {
      if (shouldAnonymizeSessionData(session)) {
        // Anonymize session data
        const anonymizedSession = anonymizeSessionData(session);
        await this.store.update(session.sessionId, anonymizedSession);
      } else {
        // Mark as expired
        await this.expireSession(session.sessionId);
      }
      cleanedCount++;
    }
    
    return cleanedCount;
  }
  
  /**
   * Log session activity
   */
  private async logActivity(event: SessionActivityEvent): Promise<void> {
    const validatedEvent = SessionActivityEventSchema.parse(event);
    this.activityLog.push(validatedEvent);
    
    // In a real implementation, this would integrate with your logging system
    console.log('Session Activity:', JSON.stringify(validatedEvent, null, 2));
  }
  
  /**
   * Get session activity log
   */
  getActivityLog(sessionId?: string, userId?: string): SessionActivityEvent[] {
    return this.activityLog.filter(event => {
      if (sessionId && event.sessionId !== sessionId) return false;
      if (userId && event.userId !== userId) return false;
      return true;
    });
  }
  
  /**
   * Enable emergency access mode
   */
  async enableEmergencyAccess(
    userId: string,
    emergencyCode: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SessionData> {
    // Terminate all existing sessions
    await this.terminateAllUserSessions(userId, 'emergency_access_enabled');
    
    // Create emergency session
    const emergencySession = await this.createSession({
      userId,
      userType: SessionType.EMERGENCY,
      securityLevel: SessionSecurityLevel.CRITICAL,
      ipAddress,
      userAgent,
      healthcareContext: {
        emergencyCode,
        clinicalContext: 'emergency',
        dataClassification: 'restricted'
      },
      config: getEmergencySessionOverride()
    });
    
    // Log emergency access
    await this.logActivity({
      sessionId: emergencySession.sessionId,
      userId,
      eventType: 'emergency_access',
      timestamp: new Date(),
      ipAddress,
      userAgent,
      details: { emergencyCode },
      securityLevel: SessionSecurityLevel.CRITICAL,
      complianceContext: {
        lgpdApplicable: true,
        auditRequired: true,
        dataRetentionApplied: true
      }
    });
    
    return emergencySession;
  }
}

// ============================================================================
// MOCK IMPLEMENTATIONS FOR DEVELOPMENT
// ============================================================================

/**
 * In-memory session store for development and testing
 */
export class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, SessionData> = new Map();
  
  async store(sessionData: SessionData): Promise<void> {
    this.sessions.set(sessionData.sessionId, { ...sessionData });
  }
  
  async get(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    return session ? { ...session } : null;
  }
  
  async update(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.set(sessionId, { ...session, ...updates });
    }
  }
  
  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
  
  async getUserSessions(userId: string): Promise<SessionData[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .map(session => ({ ...session }));
  }
  
  async getExpiredSessions(before: Date = new Date()): Promise<SessionData[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.expiresAt < before)
      .map(session => ({ ...session }));
  }
  
  async cleanup(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    let cleanedCount = 0;
    const sessionsToDelete: string[] = [];
    
    // Collect sessions to delete
    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      if (session.dataRetentionDate && session.dataRetentionDate < cutoffDate) {
        sessionsToDelete.push(sessionId);
      }
    }
    
    // Delete collected sessions
    for (const sessionId of sessionsToDelete) {
      this.sessions.delete(sessionId);
      cleanedCount++;
    }
    
    return cleanedCount;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SessionManagementService;