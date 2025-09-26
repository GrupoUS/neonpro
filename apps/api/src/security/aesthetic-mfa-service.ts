/**
 * Multi-Factor Authentication Service for Aesthetic Clinic Professionals
 * T083 - Healthcare Professional MFA with TOTP and Backup Codes
 *
 * Features:
 * - TOTP-based multi-factor authentication
 * - Backup code generation and validation
 * - Recovery options for lost devices
 * - Session-based MFA enforcement
 * - Compliance with Brazilian healthcare security standards
 */

import crypto from 'crypto'
import { qrcode } from 'qrcode'
import { speakeasy } from 'speakeasy'
import { createAdminClient } from '../clients/supabase'
import { logger } from "@/utils/healthcare-errors"
import { EnhancedSessionManager } from './enhanced-session-manager'

// TOTP Configuration
const TOTP_CONFIG = {
  window: 2, // Allow 2 time step windows before/after
  step: 30, // 30-second time steps
  digits: 6, // 6-digit codes
  algorithm: 'sha512', // Strong hashing algorithm
  encoding: 'base32',
} as const

// Backup Code Configuration
const BACKUP_CODE_CONFIG = {
  count: 10, // Number of backup codes to generate
  length: 8, // Length of each backup code
  prefix: 'AESTHETIC-', // Prefix for backup codes
  validDays: 365, // Backup codes valid for 1 year
} as const

// MFA Status
export const MFA_STATUS = {
  NOT_SETUP: 'not_setup',
  SETUP_PENDING: 'setup_pending',
  SETUP_COMPLETE: 'setup_complete',
  MFA_ENFORCED: 'mfa_enforced',
  TEMPORARILY_DISABLED: 'temporarily_disabled',
} as const

export type MFAStatus = (typeof MFA_STATUS)[keyof typeof MFA_STATUS]

// MFA Method
export const MFA_METHOD = {
  TOTP: 'totp',
  BACKUP_CODE: 'backup_code',
  SMS: 'sms', // Future implementation
  EMAIL: 'email', // Future implementation
} as const

export type MFAMethod = (typeof MFA_METHOD)[keyof typeof MFA_METHOD]

// MFA Setup Data
export interface MFASetupData {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  setupDate: Date
  expiresAt: Date
}

// MFA Verification Result
export interface MFAVerificationResult {
  success: boolean
  method: MFAMethod
  userId: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  riskScore: number
  backupCodeUsed?: boolean
}

// MFA Session
export interface MFASession {
  userId: string
  mfaVerified: boolean
  verifiedAt: Date
  verifiedMethod: MFAMethod
  verifiedIP: string
  expiresAt: Date
  riskAssessment: {
    score: number
    factors: string[]
  }
}

// MFA Enforcement Policy
export interface MFAEnforcementPolicy {
  enforceForRoles: string[]
  enforceForSensitiveOperations: string[]
  gracePeriodHours: number
  allowTemporaryDisable: boolean
  requiredForNewUsers: boolean
}

// MFA Security Event
export interface MFASecurityEvent {
  id: string
  userId: string
  eventType: 'mfa_setup' | 'mfa_verification' | 'mfa_failure' | 'backup_code_used' | 'mfa_disabled'
  method: MFAMethod
  success: boolean
  ipAddress: string
  userAgent: string
  timestamp: Date
  details: Record<string, any>
  riskScore: number
}

/**
 * MFA Service for Aesthetic Clinic Professionals
 */
export class AestheticMFAService {
  private supabase: SupabaseClient
  private sessionManager: EnhancedSessionManager
  private auditEvents: MFASecurityEvent[] = []
  private activeSessions = new Map<string, MFASession>()

  constructor() {
    this.supabase = createAdminClient()
    this.sessionManager = new EnhancedSessionManager()
  }

  /**
   * Initialize MFA setup for a user
   */
  async initializeMFASetup(
    userId: string,
    userIP: string,
    userAgent: string,
  ): Promise<MFASetupData> {
    try {
      // Check if MFA is already set up
      const existingMFA = await this.getUserMFAStatus(userId)
      if (existingMFA === MFA_STATUS.SETUP_COMPLETE) {
        throw new Error('MFA already set up for this user')
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `NeonPro Aesthetic Clinic:${userId}`,
        issuer: 'NeonPro Aesthetic Clinic',
        length: 32,
        ...TOTP_CONFIG,
      })

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!)

      // Generate backup codes
      const backupCodes = this.generateBackupCodes()

      // Store MFA setup data temporarily
      const setupData: MFASetupData = {
        secret: secret.base32!,
        qrCodeUrl,
        backupCodes,
        setupDate: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours to complete setup
      }

      // Store in database (temporary table)
      await this.storeTempMFAPending(userId, setupData)

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_setup',
        method: MFA_METHOD.TOTP,
        success: true,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { setupId: secret.base32 },
        riskScore: 0.2,
      })

      logger.info('MFA setup initialized', {
        userId,
        ip: userIP,
        userAgent,
        setupId: secret.base32,
      })

      return setupData
    } catch {
      logger.error('MFA setup initialization failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        ip: userIP,
        userAgent,
      })

      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_setup',
        method: MFA_METHOD.TOTP,
        success: false,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) },
        riskScore: 0.8,
      })

      throw new Error('Failed to initialize MFA setup')
    }
  }

  /**
   * Complete MFA setup with TOTP verification
   */
  async completeMFASetup(
    userId: string,
    totpCode: string,
    secret: string,
    backupCodes: string[],
    userIP: string,
    userAgent: string,
  ): Promise<boolean> {
    try {
      // Verify TOTP code
      const verification = this.verifyTOTP(totpCode, secret)
      if (!verification) {
        throw new Error('Invalid TOTP code')
      }

      // Store MFA configuration
      await this.storeMFAConfiguration(userId, {
        secret,
        backupCodes,
        setupDate: new Date(),
        method: MFA_METHOD.TOTP,
      })

      // Update user MFA status
      await this.updateUserMFAStatus(userId, MFA_STATUS.SETUP_COMPLETE)

      // Clear temporary setup data
      await this.clearTempMFAPending(userId)

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_setup',
        method: MFA_METHOD.TOTP,
        success: true,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { setupComplete: true },
        riskScore: 0.1,
      })

      logger.info('MFA setup completed successfully', {
        userId,
        ip: userIP,
        userAgent,
      })

      return true
    } catch {
      logger.error('MFA setup completion failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        ip: userIP,
        userAgent,
      })

      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_setup',
        method: MFA_METHOD.TOTP,
        success: false,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) },
        riskScore: 0.9,
      })

      throw new Error('Failed to complete MFA setup')
    }
  }

  /**
   * Verify TOTP code
   */
  async verifyTOTPCode(
    userId: string,
    totpCode: string,
    userIP: string,
    userAgent: string,
  ): Promise<MFAVerificationResult> {
    try {
      // Get user's MFA configuration
      const mfaConfig = await this.getUserMFAConfiguration(userId)
      if (!mfaConfig) {
        throw new Error('MFA not set up for user')
      }

      // Verify TOTP code
      const isValid = this.verifyTOTP(totpCode, mfaConfig.secret)
      if (!isValid) {
        throw new Error('Invalid TOTP code')
      }

      // Perform risk assessment
      const riskAssessment = await this.performRiskAssessment(userId, userIP, userAgent)

      // Create MFA session
      const mfaSession: MFASession = {
        userId,
        mfaVerified: true,
        verifiedAt: new Date(),
        verifiedMethod: MFA_METHOD.TOTP,
        verifiedIP: userIP,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        riskAssessment,
      }

      this.activeSessions.set(userId, mfaSession)

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_verification',
        method: MFA_METHOD.TOTP,
        success: true,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { riskScore: riskAssessment.score },
        riskScore: riskAssessment.score,
      })

      logger.info('MFA verification successful', {
        userId,
        method: MFA_METHOD.TOTP,
        ip: userIP,
        userAgent,
        riskScore: riskAssessment.score,
      })

      return {
        success: true,
        method: MFA_METHOD.TOTP,
        userId,
        timestamp: new Date(),
        ipAddress: userIP,
        userAgent,
        riskScore: riskAssessment.score,
      }
    } catch {
      logger.error('MFA verification failed', {
        userId,
        method: MFA_METHOD.TOTP,
        error: error instanceof Error ? error.message : String(error),
        ip: userIP,
        userAgent,
      })

      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_verification',
        method: MFA_METHOD.TOTP,
        success: false,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) },
        riskScore: 0.9,
      })

      throw new Error('MFA verification failed')
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(
    userId: string,
    backupCode: string,
    userIP: string,
    userAgent: string,
  ): Promise<MFAVerificationResult> {
    try {
      // Get user's MFA configuration
      const mfaConfig = await this.getUserMFAConfiguration(userId)
      if (!mfaConfig || !mfaConfig.backupCodes) {
        throw new Error('No backup codes available')
      }

      // Find and validate backup code
      const codeIndex = mfaConfig.backupCodes.indexOf(backupCode)
      if (codeIndex === -1) {
        throw new Error('Invalid backup code')
      }

      // Remove used backup code
      mfaConfig.backupCodes.splice(codeIndex, 1)
      await this.updateMFAConfiguration(userId, mfaConfig)

      // Perform risk assessment (higher risk for backup code usage)
      const riskAssessment = await this.performRiskAssessment(userId, userIP, userAgent)
      riskAssessment.score = Math.max(riskAssessment.score, 0.6) // Minimum risk score for backup codes
      riskAssessment.factors.push('backup_code_used')

      // Create MFA session
      const mfaSession: MFASession = {
        userId,
        mfaVerified: true,
        verifiedAt: new Date(),
        verifiedMethod: MFA_METHOD.BACKUP_CODE,
        verifiedIP: userIP,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours (shorter for backup codes)
        riskAssessment,
      }

      this.activeSessions.set(userId, mfaSession)

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'backup_code_used',
        method: MFA_METHOD.BACKUP_CODE,
        success: true,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { remainingBackupCodes: mfaConfig.backupCodes.length },
        riskScore: riskAssessment.score,
      })

      logger.warn('MFA backup code used', {
        userId,
        ip: userIP,
        userAgent,
        remainingCodes: mfaConfig.backupCodes.length,
      })

      return {
        success: true,
        method: MFA_METHOD.BACKUP_CODE,
        userId,
        timestamp: new Date(),
        ipAddress: userIP,
        userAgent,
        riskScore: riskAssessment.score,
        backupCodeUsed: true,
      }
    } catch {
      logger.error('MFA backup code verification failed', {
        userId,
        method: MFA_METHOD.BACKUP_CODE,
        error: error instanceof Error ? error.message : String(error),
        ip: userIP,
        userAgent,
      })

      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_verification',
        method: MFA_METHOD.BACKUP_CODE,
        success: false,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : String(error) },
        riskScore: 0.9,
      })

      throw new Error('Backup code verification failed')
    }
  }

  /**
   * Check if MFA is verified for user session
   */
  isMFAVerified(userId: string): boolean {
    const session = this.activeSessions.get(userId)
    if (!session) {
      return false
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.activeSessions.delete(userId)
      return false
    }

    return session.mfaVerified
  }

  /**
   * Get MFA verification status
   */
  getMFAStatus(userId: string): MFASession | null {
    const session = this.activeSessions.get(userId)
    if (!session || session.expiresAt < new Date()) {
      return null
    }
    return session
  }

  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(
    userId: string,
    userIP: string,
    userAgent: string,
  ): Promise<string[]> {
    try {
      // Verify user is already MFA verified
      if (!this.isMFAVerified(userId)) {
        throw new Error('MFA verification required')
      }

      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes()

      // Update MFA configuration
      const mfaConfig = await this.getUserMFAConfiguration(userId)
      if (mfaConfig) {
        mfaConfig.backupCodes = newBackupCodes
        await this.updateMFAConfiguration(userId, mfaConfig)
      }

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_setup',
        method: MFA_METHOD.BACKUP_CODE,
        success: true,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { backupCodesRegenerated: true, count: newBackupCodes.length },
        riskScore: 0.3,
      })

      logger.info('MFA backup codes regenerated', {
        userId,
        ip: userIP,
        userAgent,
      })

      return newBackupCodes
    } catch {
      logger.error('Backup code regeneration failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        ip: userIP,
        userAgent,
      })

      throw new Error('Failed to regenerate backup codes')
    }
  }

  /**
   * Disable MFA for user (emergency only)
   */
  async disableMFA(
    userId: string,
    reason: string,
    userIP: string,
    userAgent: string,
  ): Promise<boolean> {
    try {
      // Remove MFA configuration
      await this.removeMFAConfiguration(userId)

      // Update user MFA status
      await this.updateUserMFAStatus(userId, MFA_STATUS.NOT_SETUP)

      // Clear active sessions
      this.activeSessions.delete(userId)

      // Log security event
      await this.logSecurityEvent({
        userId,
        eventType: 'mfa_disabled',
        method: MFA_METHOD.TOTP,
        success: true,
        ipAddress: userIP,
        userAgent,
        timestamp: new Date(),
        details: { reason, emergency: true },
        riskScore: 0.8,
      })

      logger.warn('MFA disabled (emergency)', {
        userId,
        reason,
        ip: userIP,
        userAgent,
      })

      return true
    } catch {
      logger.error('MFA disable failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        ip: userIP,
        userAgent,
      })

      throw new Error('Failed to disable MFA')
    }
  }

  /**
   * Get MFA enforcement policy
   */
  async getMFAEnforcementPolicy(): Promise<MFAEnforcementPolicy> {
    return {
      enforceForRoles: ['admin', 'professional', 'clinic_manager'],
      enforceForSensitiveOperations: [
        'patient_data_access',
        'financial_transactions',
        'treatment_plans',
        'medical_records',
        'system_configuration',
      ],
      gracePeriodHours: 72, // 3 days
      allowTemporaryDisable: true,
      requiredForNewUsers: true,
    }
  }

  /**
   * Get MFA security events for user
   */
  async getMFASecurityEvents(userId: string, limit: number = 50): Promise<MFASecurityEvent[]> {
    // In a real implementation, this would query the database
    // For now, return recent events from memory
    return this.auditEvents
      .filter(event => event.userId === userId)
      .slice(-limit)
      .reverse()
  }

  // Private helper methods

  private verifyTOTP(token: string, secret: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: TOTP_CONFIG.encoding,
        token,
        window: TOTP_CONFIG.window,
        step: TOTP_CONFIG.step,
        digits: TOTP_CONFIG.digits,
        algorithm: TOTP_CONFIG.algorithm as any,
      })
    } catch {
      logger.error('TOTP verification error', { error })
      return false
    }
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < BACKUP_CODE_CONFIG.count; i++) {
      const randomBytes = crypto.randomBytes(BACKUP_CODE_CONFIG.length)
      const code = randomBytes.toString('hex').toUpperCase()
      codes.push(`${BACKUP_CODE_CONFIG.prefix}${code}`)
    }
    return codes
  }

  private async performRiskAssessment(
    userId: string,
    userIP: string,
    userAgent: string,
  ): Promise<{ score: number; factors: string[] }> {
    let riskScore = 0
    const riskFactors: string[] = []

    // Check for known suspicious IP addresses
    if (await this.isSuspiciousIP(userIP)) {
      riskScore += 0.4
      riskFactors.push('suspicious_ip')
    }

    // Check for unusual user agent
    if (await this.isUnusualUserAgent(userId, userAgent)) {
      riskScore += 0.3
      riskFactors.push('unusual_user_agent')
    }

    // Check for geolocation anomalies
    if (await this.isGeolocationAnomaly(userId, userIP)) {
      riskScore += 0.5
      riskFactors.push('geolocation_anomaly')
    }

    // Check for time-based anomalies
    if (await this.isTimeAnomaly(userId)) {
      riskScore += 0.2
      riskFactors.push('time_anomaly')
    }

    // Cap risk score at 1.0
    riskScore = Math.min(riskScore, 1.0)

    return {
      score: riskScore,
      factors: riskFactors,
    }
  }

  private async logSecurityEvent(event: MFASecurityEvent): Promise<void> {
    // Add unique ID
    const eventWithId: MFASecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
    }

    // Store in memory (in production, this would be stored in database)
    this.auditEvents.push(eventWithId)

    // Keep only last 1000 events in memory
    if (this.auditEvents.length > 1000) {
      this.auditEvents = this.auditEvents.slice(-1000)
    }

    // In production, this would be stored in the database
    try {
      await this.supabase.from('mfa_security_events').insert({
        user_id: event.userId,
        event_type: event.eventType,
        method: event.method,
        success: event.success,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        timestamp: event.timestamp,
        details: event.details,
        risk_score: event.riskScore,
      })
    } catch {
      logger.error('Failed to log MFA security event', { error })
    }
  }

  // Database operations (simplified for this example)
  private async getUserMFAStatus(_userId: string): Promise<MFAStatus> {
    // In production, this would query the database
    return MFA_STATUS.NOT_SETUP
  }

  private async storeTempMFAPending(userId: string, setupData: MFASetupData): Promise<void> {
    // Store temporary MFA setup data
    await this.supabase.from('mfa_setup_pending').insert({
      user_id: userId,
      secret: setupData.secret,
      backup_codes: setupData.backupCodes,
      setup_date: setupData.setupDate,
      expires_at: setupData.expiresAt,
    })
  }

  private async storeMFAConfiguration(userId: string, config: any): Promise<void> {
    // Store MFA configuration
    await this.supabase.from('mfa_configurations').insert({
      user_id: userId,
      secret: config.secret,
      backup_codes: config.backupCodes,
      setup_date: config.setupDate,
      method: config.method,
    })
  }

  private async updateUserMFAStatus(userId: string, status: MFAStatus): Promise<void> {
    // Update user MFA status
    await this.supabase
      .from('users')
      .update({ mfa_status: status })
      .eq('id', userId)
  }

  private async clearTempMFAPending(userId: string): Promise<void> {
    // Clear temporary setup data
    await this.supabase
      .from('mfa_setup_pending')
      .delete()
      .eq('user_id', userId)
  }

  private async getUserMFAConfiguration(userId: string): Promise<any> {
    // Get user MFA configuration
    const { data, error } = await this.supabase
      .from('mfa_configurations')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return null
    }

    return data
  }

  private async updateMFAConfiguration(userId: string, config: any): Promise<void> {
    // Update MFA configuration
    await this.supabase
      .from('mfa_configurations')
      .update({
        backup_codes: config.backupCodes,
        updated_at: new Date(),
      })
      .eq('user_id', userId)
  }

  private async removeMFAConfiguration(userId: string): Promise<void> {
    // Remove MFA configuration
    await this.supabase
      .from('mfa_configurations')
      .delete()
      .eq('user_id', userId)
  }

  private async isSuspiciousIP(_ipAddress: string): Promise<boolean> {
    // Check against known malicious IP databases
    // For now, return false
    return false
  }

  private async isUnusualUserAgent(_userId: string, _userAgent: string): Promise<boolean> {
    // Check if user agent is unusual for this user
    // For now, return false
    return false
  }

  private async isGeolocationAnomaly(_userId: string, _ipAddress: string): Promise<boolean> {
    // Check if IP address is from unusual location for this user
    // For now, return false
    return false
  }

  private async isTimeAnomaly(_userId: string): Promise<boolean> {
    // Check if login time is unusual for this user
    // For now, return false
    return false
  }
}

export default AestheticMFAService
