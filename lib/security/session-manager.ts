import { z } from 'zod'

/**
 * Healthcare Session Management
 * Implements secure session handling with healthcare-specific requirements
 * - Short session timeouts for sensitive data
 * - Role-based session permissions
 * - Audit trail for all session activities
 * - Multi-factor authentication support
 */

// User roles in healthcare system
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
  SYSTEM = 'system'
}

// Session status
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended'
}

// MFA methods
export enum MFAMethod {
  SMS = 'sms',
  EMAIL = 'email',
  TOTP = 'totp',
  BIOMETRIC = 'biometric',
  HARDWARE_TOKEN = 'hardware_token'
}

// Session schema
export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userRole: z.nativeEnum(UserRole),
  status: z.nativeEnum(SessionStatus),
  
  // Security metadata
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido'),
  userAgent: z.string(),
  deviceFingerprint: z.string().optional(),
  
  // Session timing
  createdAt: z.date(),
  lastAccessAt: z.date(),
  expiresAt: z.date(),
  timeoutWarningAt: z.date().optional(),
  
  // MFA information
  mfaVerified: z.boolean().default(false),
  mfaMethod: z.nativeEnum(MFAMethod).optional(),
  mfaVerifiedAt: z.date().optional(),
  
  // Permissions and access control
  permissions: z.array(z.string()),
  allowedPatients: z.array(z.string().uuid()).optional(), // For restricted access
  
  // Session metadata
  loginMethod: z.enum(['password', 'sso', 'certificate', 'biometric']),
  riskScore: z.number().min(0).max(100).default(0),
  
  // Tracking
  requestCount: z.number().default(0),
  lastEndpoint: z.string().optional(),
  
  createdBy: z.string().optional(),
  terminatedBy: z.string().optional(),
  terminationReason: z.string().optional()
})

export type Session = z.infer<typeof sessionSchema>

export class HealthcareSessionManager {
  // Session timeout configurations (in minutes)
  private static readonly SESSION_TIMEOUTS = {
    [UserRole.ADMIN]: 30,        // 30 minutes for admin
    [UserRole.DOCTOR]: 60,       // 1 hour for doctors
    [UserRole.NURSE]: 45,        // 45 minutes for nurses
    [UserRole.RECEPTIONIST]: 120, // 2 hours for reception
    [UserRole.PATIENT]: 30,      // 30 minutes for patients
    [UserRole.SYSTEM]: 1440      // 24 hours for system
  }

  // Risk thresholds for additional security measures
  private static readonly RISK_THRESHOLDS = {
    MFA_REQUIRED: 30,
    SESSION_REVIEW: 50,
    AUTOMATIC_TERMINATION: 80
  }

  /**
   * Create a new session with healthcare security requirements
   */
  static async createSession(params: {
    userId: string
    userRole: UserRole
    ipAddress: string
    userAgent: string
    deviceFingerprint?: string
    loginMethod: 'password' | 'sso' | 'certificate' | 'biometric'
    permissions?: string[]
    allowedPatients?: string[]
  }): Promise<Session> {
    const now = new Date()
    const timeoutMinutes = this.SESSION_TIMEOUTS[params.userRole]
    const expiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000)
    const timeoutWarningAt = new Date(expiresAt.getTime() - 5 * 60 * 1000) // 5 minutes before

    // Calculate initial risk score based on various factors
    const riskScore = await this.calculateRiskScore({
      userRole: params.userRole,
      ipAddress: params.ipAddress,
      loginMethod: params.loginMethod,
      deviceFingerprint: params.deviceFingerprint
    })

    const session: Session = {
      id: crypto.randomUUID(),
      userId: params.userId,
      userRole: params.userRole,
      status: SessionStatus.ACTIVE,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceFingerprint: params.deviceFingerprint,
      createdAt: now,
      lastAccessAt: now,
      expiresAt,
      timeoutWarningAt,
      mfaVerified: false,
      permissions: params.permissions || await this.getDefaultPermissions(params.userRole),
      allowedPatients: params.allowedPatients,
      loginMethod: params.loginMethod,
      riskScore,
      requestCount: 0
    }

    // Validate session
    const validated = sessionSchema.parse(session)
    
    // Store session securely (Redis recommended for healthcare)
    await this.storeSession(validated)
    
    // Log session creation
    await this.logSessionEvent(validated.id, 'session_created', {
      userRole: params.userRole,
      riskScore,
      loginMethod: params.loginMethod
    })

    // Check if MFA is required
    if (riskScore >= this.RISK_THRESHOLDS.MFA_REQUIRED || this.requiresMFA(params.userRole)) {
      await this.initiateMFA(validated.id)
    }

    return validated
  }

  /**
   * Validate and refresh session
   */
  static async validateSession(sessionId: string, ipAddress: string): Promise<{
    valid: boolean
    session?: Session
    reason?: string
    requiresMFA?: boolean
  }> {
    try {
      const session = await this.getSession(sessionId)
      
      if (!session) {
        return { valid: false, reason: 'Session not found' }
      }

      // Check session status
      if (session.status !== SessionStatus.ACTIVE) {
        return { valid: false, reason: `Session is ${session.status}` }
      }

      // Check expiration
      if (new Date() > session.expiresAt) {
        await this.terminateSession(sessionId, 'expired')
        return { valid: false, reason: 'Session expired' }
      }

      // Validate IP address (healthcare security requirement)
      if (session.ipAddress !== ipAddress) {
        await this.flagSuspiciousActivity(sessionId, 'ip_mismatch', {
          originalIp: session.ipAddress,
          currentIp: ipAddress
        })
        // Don't automatically terminate - could be legitimate network change
        // But increase risk score
        session.riskScore = Math.min(100, session.riskScore + 20)
      }

      // Update last access
      session.lastAccessAt = new Date()
      session.requestCount += 1

      // Check if session is approaching timeout
      const timeUntilTimeout = session.expiresAt.getTime() - Date.now()
      const shouldWarn = timeUntilTimeout <= 5 * 60 * 1000 // 5 minutes

      // Extend session if user is active (healthcare workflow consideration)
      if (timeUntilTimeout <= 10 * 60 * 1000) { // Extend when 10 minutes left
        const extension = this.SESSION_TIMEOUTS[session.userRole] * 60 * 1000
        session.expiresAt = new Date(Date.now() + extension)
        session.timeoutWarningAt = new Date(session.expiresAt.getTime() - 5 * 60 * 1000)
      }

      await this.updateSession(session)

      // Check if additional security measures are needed
      const requiresMFA = !session.mfaVerified && 
        (session.riskScore >= this.RISK_THRESHOLDS.MFA_REQUIRED || this.requiresMFA(session.userRole))

      return {
        valid: true,
        session,
        requiresMFA
      }

    } catch (error) {
      console.error('Session validation error:', error)
      return { valid: false, reason: 'Session validation failed' }
    }
  }

  /**
   * Verify MFA for session
   */
  static async verifyMFA(
    sessionId: string,
    method: MFAMethod,
    code: string
  ): Promise<{ success: boolean; session?: Session }> {
    const session = await this.getSession(sessionId)
    if (!session) {
      return { success: false }
    }

    // Verify MFA code (implementation depends on method)
    const isValid = await this.verifyMFACode(session.userId, method, code)
    
    if (isValid) {
      session.mfaVerified = true
      session.mfaMethod = method
      session.mfaVerifiedAt = new Date()
      session.riskScore = Math.max(0, session.riskScore - 30) // Reduce risk after MFA

      await this.updateSession(session)
      await this.logSessionEvent(sessionId, 'mfa_verified', { method })

      return { success: true, session }
    } else {
      // Log failed MFA attempt
      await this.logSessionEvent(sessionId, 'mfa_failed', { method })
      await this.flagSuspiciousActivity(sessionId, 'mfa_failure', { method })
      
      return { success: false }
    }
  }

  /**
   * Terminate session
   */
  static async terminateSession(
    sessionId: string,
    reason: string,
    terminatedBy?: string
  ): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return

    session.status = SessionStatus.TERMINATED
    session.terminationReason = reason
    session.terminatedBy = terminatedBy

    await this.updateSession(session)
    await this.removeSessionFromCache(sessionId)
    
    await this.logSessionEvent(sessionId, 'session_terminated', {
      reason,
      terminatedBy,
      duration: Date.now() - session.createdAt.getTime()
    })
  }

  /**
   * Get all active sessions for a user (for concurrent session management)
   */
  static async getUserSessions(userId: string): Promise<Session[]> {
    // TODO: Query all active sessions for user
    return []
  }

  /**
   * Terminate all sessions for a user (security response)
   */
  static async terminateAllUserSessions(
    userId: string,
    reason: string,
    terminatedBy: string
  ): Promise<number> {
    const sessions = await this.getUserSessions(userId)
    
    for (const session of sessions) {
      await this.terminateSession(session.id, reason, terminatedBy)
    }

    await this.logSessionEvent('system', 'all_sessions_terminated', {
      userId,
      reason,
      terminatedBy,
      count: sessions.length
    })

    return sessions.length
  }

  /**
   * Monitor for suspicious activity across all sessions
   */
  static async monitorSuspiciousActivity(): Promise<Array<{
    sessionId: string
    userId: string
    riskScore: number
    flags: string[]
    recommendation: string
  }>> {
    // TODO: Implement comprehensive monitoring
    return []
  }

  // Private helper methods
  private static async storeSession(session: Session): Promise<void> {
    // TODO: Store in Redis or secure session store
    console.log('Session stored:', session.id)
  }

  private static async getSession(sessionId: string): Promise<Session | null> {
    // TODO: Retrieve from session store
    return null
  }

  private static async updateSession(session: Session): Promise<void> {
    // TODO: Update session in store
    console.log('Session updated:', session.id)
  }

  private static async removeSessionFromCache(sessionId: string): Promise<void> {
    // TODO: Remove from session store
    console.log('Session removed:', sessionId)
  }

  private static async calculateRiskScore(params: {
    userRole: UserRole
    ipAddress: string
    loginMethod: string
    deviceFingerprint?: string
  }): Promise<number> {
    let riskScore = 0

    // Base risk by role
    const roleRisk = {
      [UserRole.ADMIN]: 40,
      [UserRole.DOCTOR]: 20,
      [UserRole.NURSE]: 15,
      [UserRole.RECEPTIONIST]: 10,
      [UserRole.PATIENT]: 5,
      [UserRole.SYSTEM]: 0
    }
    riskScore += roleRisk[params.userRole]

    // Login method risk
    const methodRisk = {
      'password': 20,
      'sso': 10,
      'certificate': 5,
      'biometric': 0
    }
    riskScore += methodRisk[params.loginMethod as keyof typeof methodRisk] || 30

    // TODO: Add more risk factors
    // - Unusual IP address
    // - New device
    // - Time of access
    // - Location anomalies

    return Math.min(100, riskScore)
  }

  private static async getDefaultPermissions(role: UserRole): Promise<string[]> {
    const permissions = {
      [UserRole.ADMIN]: ['all'],
      [UserRole.DOCTOR]: ['read_patients', 'write_patients', 'read_medical_records', 'write_medical_records', 'prescribe'],
      [UserRole.NURSE]: ['read_patients', 'update_patient_vitals', 'read_medical_records'],
      [UserRole.RECEPTIONIST]: ['read_patients', 'create_appointments', 'update_appointments', 'billing'],
      [UserRole.PATIENT]: ['read_own_data', 'book_appointments'],
      [UserRole.SYSTEM]: ['system_operations']
    }
    return permissions[role] || []
  }

  private static requiresMFA(role: UserRole): boolean {
    // Require MFA for high-privilege roles
    return [UserRole.ADMIN, UserRole.DOCTOR].includes(role)
  }

  private static async initiateMFA(sessionId: string): Promise<void> {
    // TODO: Initiate MFA process
    console.log('MFA initiated for session:', sessionId)
  }

  private static async verifyMFACode(
    userId: string,
    method: MFAMethod,
    code: string
  ): Promise<boolean> {
    // TODO: Implement MFA verification
    return true // Placeholder
  }

  private static async logSessionEvent(
    sessionId: string,
    event: string,
    metadata: Record<string, any>
  ): Promise<void> {
    // TODO: Log to audit system
    console.log('Session event:', { sessionId, event, metadata })
  }

  private static async flagSuspiciousActivity(
    sessionId: string,
    type: string,
    details: Record<string, any>
  ): Promise<void> {
    // TODO: Flag for security review
    console.log('Suspicious activity flagged:', { sessionId, type, details })
  }
}