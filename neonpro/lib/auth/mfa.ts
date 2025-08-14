/**
 * Multi-Factor Authentication (MFA) System for NeonPro Healthcare Platform
 * 
 * Features:
 * - TOTP (Time-based One-Time Password) with authenticator apps
 * - SMS-based verification (fallback)
 * - QR code generation for easy setup
 * - Backup codes generation and management
 * - Healthcare compliance (LGPD, ANVISA, CFM)
 * - Rate limiting and account lockout
 * - Device registration and trust
 * - Emergency bypass for clinical emergencies
 * - Comprehensive audit logging
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import * as OTPAuth from 'otpauth';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

// Types and Interfaces
export interface MFAConfig {
  issuer: string;
  label: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  window: number;
}

export interface MFASetupResult {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
  recoveryToken: string;
}

export interface MFAVerificationResult {
  isValid: boolean;
  delta?: number;
  remainingAttempts: number;
  lockedUntil?: Date;
  isEmergencyBypass?: boolean;
  auditLogId: string;
}

export interface MFAUserSettings {
  userId: string;
  isEnabled: boolean;
  methods: MFAMethod[];
  trustedDevices: TrustedDevice[];
  emergencyContacts: EmergencyContact[];
  backupCodesUsed: number;
  lastVerified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MFAMethod {
  id: string;
  type: 'totp' | 'sms' | 'backup';
  name: string;
  isEnabled: boolean;
  isPrimary: boolean;
  phoneNumber?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface TrustedDevice {
  id: string;
  name: string;
  fingerprint: string;
  userAgent: string;
  ipAddress: string;
  location?: string;
  issuedAt: Date;
  expiresAt: Date;
  lastSeen: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  canAuthorizeBypass: boolean;
  createdAt: Date;
}

export interface MFAAuditLog {
  id: string;
  userId: string;
  action: 'setup' | 'verify' | 'bypass' | 'disable' | 'recover';
  method: string;
  result: 'success' | 'failure' | 'locked';
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  emergencyBypass?: boolean;
  metadata: Record&lt;string, unknown&gt;;
  timestamp: Date;
}

// Validation Schemas
export const MFASetupSchema = z.object({
  userId: z.string().uuid(),
  method: z.enum(['totp', 'sms']),
  phoneNumber: z.string().optional(),
  deviceName: z.string().min(1, 'Device name is required'),
  lgpdConsent: z.boolean().refine(val =&gt; val === true, 'LGPD consent is required'),
});

export const MFAVerificationSchema = z.object({
  userId: z.string().uuid(),
  token: z.string().min(6, 'Token must be at least 6 characters'),
  method: z.enum(['totp', 'sms', 'backup']),
  deviceFingerprint: z.string().optional(),
  emergencyBypass: z.boolean().optional(),
});

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMinutes: 15,
  lockoutMinutes: 30,
  emergencyBypassMaxPerDay: 3,
};

// Default MFA Configuration
const DEFAULT_MFA_CONFIG: MFAConfig = {
  issuer: 'NeonPro Healthcare',
  label: 'NeonPro Account',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  window: 1,
};

/**
 * Comprehensive MFA Service for Healthcare Platform
 */
export class MFAService {
  private supabase;
  private config: MFAConfig;

  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial&lt;MFAConfig&gt;) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_MFA_CONFIG, ...config };
  }

  /**
   * Setup MFA for a user with comprehensive healthcare compliance
   */
  async setupMFA(
    userId: string,
    method: 'totp' | 'sms',
    options: {
      phoneNumber?: string;
      deviceName: string;
      lgpdConsent: boolean;
      userAgent: string;
      ipAddress: string;
    }
  ): Promise&lt;MFASetupResult&gt; {
    try {
      // Validate input
      const validation = MFASetupSchema.parse({
        userId,
        method,
        phoneNumber: options.phoneNumber,
        deviceName: options.deviceName,
        lgpdConsent: options.lgpdConsent,
      });

      // Check if user already has MFA enabled
      const existingMFA = await this.getUserMFASettings(userId);
      if (existingMFA?.isEnabled) {
        throw new Error('MFA already enabled for this user');
      }

      // Generate cryptographically secure secret (20 bytes = 160 bits)
      const secret = new OTPAuth.Secret({ size: 20 });

      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: this.config.issuer,
        label: `${this.config.label} (${options.deviceName})`,
        algorithm: this.config.algorithm,
        digits: this.config.digits,
        period: this.config.period,
        secret: secret,
      });

      // Generate QR code URI
      const qrCodeUri = totp.toString();

      // Generate backup codes (8 codes, 10 characters each)
      const backupCodes = this.generateBackupCodes(8);

      // Generate recovery token
      const recoveryToken = this.generateRecoveryToken();

      // Store MFA configuration in database
      await this.storeMFAConfiguration(userId, {
        secret: secret.base32,
        method,
        phoneNumber: options.phoneNumber,
        deviceName: options.deviceName,
        backupCodes: await this.hashBackupCodes(backupCodes),
        recoveryToken: await this.hashRecoveryToken(recoveryToken),
      });

      // Create audit log entry
      await this.createAuditLog({
        userId,
        action: 'setup',
        method,
        result: 'success',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          deviceName: options.deviceName,
          lgpdConsent: options.lgpdConsent,
          phoneNumber: options.phoneNumber ? '***' + options.phoneNumber.slice(-4) : undefined,
        },
      });

      return {
        secret: secret.base32,
        qrCodeUri,
        backupCodes,
        recoveryToken,
      };

    } catch (error) {
      // Log setup failure
      await this.createAuditLog({
        userId,
        action: 'setup',
        method,
        result: 'failure',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }  /**
   * Verify MFA token with comprehensive security and healthcare compliance
   */
  async verifyMFA(
    userId: string,
    token: string,
    method: 'totp' | 'sms' | 'backup',
    options: {
      deviceFingerprint?: string;
      userAgent: string;
      ipAddress: string;
      emergencyBypass?: boolean;
      emergencyReason?: string;
    }
  ): Promise<MFAVerificationResult> {
    try {
      // Validate input
      const validation = MFAVerificationSchema.parse({
        userId,
        token,
        method,
        deviceFingerprint: options.deviceFingerprint,
        emergencyBypass: options.emergencyBypass,
      });

      // Check rate limiting
      const rateLimitResult = await this.checkRateLimit(userId, options.ipAddress);
      if (rateLimitResult.isLocked) {
        await this.createAuditLog({
          userId,
          action: 'verify',
          method,
          result: 'locked',
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          metadata: {
            lockedUntil: rateLimitResult.lockedUntil,
            remainingAttempts: 0,
          },
        });

        return {
          isValid: false,
          remainingAttempts: 0,
          lockedUntil: rateLimitResult.lockedUntil,
          auditLogId: '',
        };
      }

      // Handle emergency bypass for clinical emergencies
      if (options.emergencyBypass) {
        return await this.handleEmergencyBypass(userId, options);
      }

      // Get user MFA settings
      const mfaSettings = await this.getUserMFASettings(userId);
      if (!mfaSettings?.isEnabled) {
        throw new Error('MFA not enabled for this user');
      }

      let isValid = false;
      let delta: number | undefined;

      // Verify token based on method
      switch (method) {
        case 'totp':
          const totpResult = await this.verifyTOTP(userId, token);
          isValid = totpResult.isValid;
          delta = totpResult.delta;
          break;

        case 'sms':
          isValid = await this.verifySMS(userId, token);
          break;

        case 'backup':
          isValid = await this.verifyBackupCode(userId, token);
          break;

        default:
          throw new Error('Invalid MFA method');
      }

      // Update rate limiting
      await this.updateRateLimit(userId, options.ipAddress, isValid);

      // Create audit log
      const auditLogId = await this.createAuditLog({
        userId,
        action: 'verify',
        method,
        result: isValid ? 'success' : 'failure',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        deviceFingerprint: options.deviceFingerprint,
        metadata: {
          delta,
          remainingAttempts: rateLimitResult.remainingAttempts - 1,
        },
      });

      // Update trusted device if verification successful
      if (isValid && options.deviceFingerprint) {
        await this.updateTrustedDevice(userId, options.deviceFingerprint, options);
      }

      // Update last verified timestamp
      if (isValid) {
        await this.updateLastVerified(userId, method);
      }

      return {
        isValid,
        delta,
        remainingAttempts: rateLimitResult.remainingAttempts - 1,
        auditLogId,
      };

    } catch (error) {
      // Log verification error
      const auditLogId = await this.createAuditLog({
        userId,
        action: 'verify',
        method,
        result: 'failure',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Verify TOTP token using OTPAuth library
   */
  private async verifyTOTP(userId: string, token: string): Promise<{ isValid: boolean; delta?: number }> {
    // Get user's TOTP secret from database
    const { data: mfaData, error } = await this.supabase
      .from('user_mfa_settings')
      .select('secret')
      .eq('user_id', userId)
      .eq('method', 'totp')
      .single();

    if (error || !mfaData) {
      throw new Error('TOTP not configured for this user');
    }

    // Create TOTP instance with stored secret
    const totp = new OTPAuth.TOTP({
      issuer: this.config.issuer,
      label: this.config.label,
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period,
      secret: OTPAuth.Secret.fromBase32(mfaData.secret),
    });

    // Validate token with window tolerance
    const delta = totp.validate({
      token,
      window: this.config.window,
    });

    return {
      isValid: delta !== null,
      delta: delta ?? undefined,
    };
  }

  /**
   * Verify SMS token (stored in database temporarily)
   */
  private async verifySMS(userId: string, token: string): Promise<boolean> {
    const { data: smsData, error } = await this.supabase
      .from('user_mfa_sms_tokens')
      .select('token, expires_at')
      .eq('user_id', userId)
      .eq('used', false)
      .single();

    if (error || !smsData) {
      return false;
    }

    // Check if token has expired
    if (new Date() > new Date(smsData.expires_at)) {
      return false;
    }

    // Verify token (constant-time comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(smsData.token)
    );

    // Mark token as used if valid
    if (isValid) {
      await this.supabase
        .from('user_mfa_sms_tokens')
        .update({ used: true })
        .eq('user_id', userId)
        .eq('token', token);
    }

    return isValid;
  }

  /**
   * Verify backup code (one-time use)
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const { data: mfaData, error } = await this.supabase
      .from('user_mfa_settings')
      .select('backup_codes, backup_codes_used')
      .eq('user_id', userId)
      .single();

    if (error || !mfaData) {
      return false;
    }

    // Hash the provided code
    const hashedCode = await this.hashBackupCode(code);

    // Check if code exists and hasn't been used
    const isValid = mfaData.backup_codes.includes(hashedCode);

    if (isValid) {
      // Remove used backup code and increment usage counter
      const updatedBackupCodes = mfaData.backup_codes.filter(
        (storedCode: string) => storedCode !== hashedCode
      );

      await this.supabase
        .from('user_mfa_settings')
        .update({
          backup_codes: updatedBackupCodes,
          backup_codes_used: mfaData.backup_codes_used + 1,
        })
        .eq('user_id', userId);
    }

    return isValid;
  }  /**
   * Handle emergency bypass for clinical emergencies
   */
  private async handleEmergencyBypass(
    userId: string,
    options: {
      emergencyReason?: string;
      userAgent: string;
      ipAddress: string;
    }
  ): Promise<MFAVerificationResult> {
    // Check daily emergency bypass limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: bypassCount } = await this.supabase
      .from('mfa_audit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('emergency_bypass', true)
      .gte('timestamp', todayStart.toISOString());

    if (bypassCount && bypassCount.length >= RATE_LIMIT_CONFIG.emergencyBypassMaxPerDay) {
      throw new Error('Daily emergency bypass limit exceeded');
    }

    // Create audit log for emergency bypass
    const auditLogId = await this.createAuditLog({
      userId,
      action: 'bypass',
      method: 'emergency',
      result: 'success',
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      emergencyBypass: true,
      metadata: {
        reason: options.emergencyReason || 'Clinical emergency',
        bypassCount: (bypassCount?.length || 0) + 1,
      },
    });

    // Send emergency bypass notification
    await this.sendEmergencyBypassNotification(userId, options);

    return {
      isValid: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      isEmergencyBypass: true,
      auditLogId,
    };
  }

  /**
   * Send SMS OTP for fallback authentication
   */
  async sendSMSOTP(
    userId: string,
    options: {
      userAgent: string;
      ipAddress: string;
    }
  ): Promise<{ success: boolean; expiresIn: number }> {
    try {
      // Get user's phone number
      const mfaSettings = await this.getUserMFASettings(userId);
      const smsMethod = mfaSettings?.methods.find(m => m.type === 'sms' && m.isEnabled);

      if (!smsMethod?.phoneNumber) {
        throw new Error('SMS MFA not configured for this user');
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP in database
      await this.supabase
        .from('user_mfa_sms_tokens')
        .insert({
          user_id: userId,
          token: otp,
          expires_at: expiresAt.toISOString(),
          used: false,
        });

      // Send SMS via Supabase (or your SMS provider)
      // This would integrate with your SMS service
      await this.sendSMS(smsMethod.phoneNumber, otp);

      // Create audit log
      await this.createAuditLog({
        userId,
        action: 'verify',
        method: 'sms',
        result: 'success',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          phoneNumber: '***' + smsMethod.phoneNumber.slice(-4),
          expiresAt: expiresAt.toISOString(),
        },
      });

      return {
        success: true,
        expiresIn: 300, // 5 minutes in seconds
      };

    } catch (error) {
      await this.createAuditLog({
        userId,
        action: 'verify',
        method: 'sms',
        result: 'failure',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Disable MFA for a user (with proper authorization)
   */
  async disableMFA(
    userId: string,
    options: {
      adminUserId?: string;
      reason: string;
      userAgent: string;
      ipAddress: string;
    }
  ): Promise<{ success: boolean }> {
    try {
      // Verify admin authorization if provided
      if (options.adminUserId) {
        await this.verifyAdminAuthorization(options.adminUserId, 'disable_mfa');
      }

      // Disable MFA in database
      await this.supabase
        .from('user_mfa_settings')
        .update({
          is_enabled: false,
          disabled_at: new Date().toISOString(),
          disabled_reason: options.reason,
          disabled_by: options.adminUserId || userId,
        })
        .eq('user_id', userId);

      // Create audit log
      await this.createAuditLog({
        userId,
        action: 'disable',
        method: 'admin',
        result: 'success',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          adminUserId: options.adminUserId,
          reason: options.reason,
        },
      });

      return { success: true };

    } catch (error) {
      await this.createAuditLog({
        userId,
        action: 'disable',
        method: 'admin',
        result: 'failure',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Get MFA settings for a user
   */
  async getUserMFASettings(userId: string): Promise<MFAUserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_mfa_settings')
      .select(`
        *,
        user_mfa_methods(*),
        user_trusted_devices(*),
        user_emergency_contacts(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      isEnabled: data.is_enabled,
      methods: data.user_mfa_methods || [],
      trustedDevices: data.user_trusted_devices || [],
      emergencyContacts: data.user_emergency_contacts || [],
      backupCodesUsed: data.backup_codes_used || 0,
      lastVerified: new Date(data.last_verified),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }  /**
   * Generate backup codes for MFA recovery
   */
  private generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 10-character alphanumeric code
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate recovery token for account recovery
   */
  private generateRecoveryToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash backup codes for secure storage
   */
  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    const hashedCodes: string[] = [];
    for (const code of codes) {
      const hash = await this.hashBackupCode(code);
      hashedCodes.push(hash);
    }
    return hashedCodes;
  }

  /**
   * Hash individual backup code
   */
  private async hashBackupCode(code: string): Promise<string> {
    return crypto.pbkdf2Sync(code, 'neonpro-mfa-salt', 100000, 64, 'sha512').toString('hex');
  }

  /**
   * Hash recovery token for secure storage
   */
  private async hashRecoveryToken(token: string): Promise<string> {
    return crypto.pbkdf2Sync(token, 'neonpro-recovery-salt', 100000, 64, 'sha512').toString('hex');
  }

  /**
   * Store MFA configuration in database
   */
  private async storeMFAConfiguration(userId: string, config: {
    secret: string;
    method: 'totp' | 'sms';
    phoneNumber?: string;
    deviceName: string;
    backupCodes: string[];
    recoveryToken: string;
  }): Promise<void> {
    // Begin transaction
    const { error: settingsError } = await this.supabase
      .from('user_mfa_settings')
      .insert({
        user_id: userId,
        is_enabled: true,
        secret: config.secret,
        backup_codes: config.backupCodes,
        backup_codes_used: 0,
        recovery_token: config.recoveryToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (settingsError) {
      throw new Error(`Failed to store MFA settings: ${settingsError.message}`);
    }

    // Store MFA method
    const { error: methodError } = await this.supabase
      .from('user_mfa_methods')
      .insert({
        user_id: userId,
        type: config.method,
        name: config.deviceName,
        is_enabled: true,
        is_primary: true,
        phone_number: config.phoneNumber,
        created_at: new Date().toISOString(),
      });

    if (methodError) {
      throw new Error(`Failed to store MFA method: ${methodError.message}`);
    }
  }

  /**
   * Check rate limiting for MFA attempts
   */
  private async checkRateLimit(userId: string, ipAddress: string): Promise<{
    isLocked: boolean;
    remainingAttempts: number;
    lockedUntil?: Date;
  }> {
    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.windowMinutes * 60 * 1000);

    const { data: attempts } = await this.supabase
      .from('mfa_audit_logs')
      .select('result, timestamp')
      .eq('user_id', userId)
      .eq('action', 'verify')
      .gte('timestamp', windowStart.toISOString())
      .order('timestamp', { ascending: false });

    if (!attempts) {
      return { isLocked: false, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
    }

    const failedAttempts = attempts.filter(attempt => attempt.result === 'failure').length;

    if (failedAttempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      const lastFailure = attempts.find(attempt => attempt.result === 'failure');
      const lockedUntil = new Date(
        new Date(lastFailure!.timestamp).getTime() + RATE_LIMIT_CONFIG.lockoutMinutes * 60 * 1000
      );

      if (new Date() < lockedUntil) {
        return { isLocked: true, remainingAttempts: 0, lockedUntil };
      }
    }

    return {
      isLocked: false,
      remainingAttempts: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - failedAttempts),
    };
  }

  /**
   * Update rate limiting after verification attempt
   */
  private async updateRateLimit(userId: string, ipAddress: string, success: boolean): Promise<void> {
    // Rate limiting is handled through audit logs
    // This method is placeholder for additional rate limiting logic if needed
  }

  /**
   * Create comprehensive audit log entry
   */
  private async createAuditLog(log: Omit<MFAAuditLog, 'id' | 'timestamp'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('mfa_audit_logs')
      .insert({
        user_id: log.userId,
        action: log.action,
        method: log.method,
        result: log.result,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
        device_fingerprint: log.deviceFingerprint,
        emergency_bypass: log.emergencyBypass || false,
        metadata: log.metadata,
        timestamp: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create audit log:', error);
      return '';
    }

    return data?.id || '';
  }

  /**
   * Update trusted device information
   */
  private async updateTrustedDevice(
    userId: string,
    deviceFingerprint: string,
    options: {
      userAgent: string;
      ipAddress: string;
    }
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.supabase
      .from('user_trusted_devices')
      .upsert({
        user_id: userId,
        fingerprint: deviceFingerprint,
        user_agent: options.userAgent,
        ip_address: options.ipAddress,
        last_seen: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      });
  }

  /**
   * Update last verified timestamp
   */
  private async updateLastVerified(userId: string, method: string): Promise<void> {
    await this.supabase
      .from('user_mfa_settings')
      .update({
        last_verified: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await this.supabase
      .from('user_mfa_methods')
      .update({
        last_used: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('type', method);
  }  /**
   * Send SMS via integrated SMS service
   */
  private async sendSMS(phoneNumber: string, otp: string): Promise<void> {
    // This would integrate with your SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll use Supabase's built-in SMS functionality
    
    const message = `Seu código de verificação NeonPro é: ${otp}. Válido por 5 minutos. Não compartilhe este código.`;
    
    // In production, implement actual SMS sending
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // Supabase SMS integration would go here
    // await this.supabase.auth.sendOtp({ phone: phoneNumber, options: { message } });
  }

  /**
   * Send emergency bypass notification
   */
  private async sendEmergencyBypassNotification(
    userId: string,
    options: {
      emergencyReason?: string;
      userAgent: string;
      ipAddress: string;
    }
  ): Promise<void> {
    // Get user information
    const { data: user } = await this.supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!user) return;

    // Send notification to user and security team
    const notification = {
      to: user.email,
      subject: 'Alerta de Segurança: Bypass de MFA Utilizado',
      body: `
        Olá ${user.full_name},
        
        Um bypass de emergência foi utilizado em sua conta NeonPro Healthcare.
        
        Detalhes:
        - Data/Hora: ${new Date().toLocaleString('pt-BR')}
        - IP: ${options.ipAddress}
        - Navegador: ${options.userAgent}
        - Motivo: ${options.emergencyReason || 'Emergência clínica'}
        
        Se você não realizou esta ação, entre em contato com o suporte imediatamente.
        
        Equipe NeonPro Security
      `,
    };

    // In production, send actual email notification
    console.log('Emergency bypass notification:', notification);
  }

  /**
   * Verify admin authorization for sensitive operations
   */
  private async verifyAdminAuthorization(adminUserId: string, operation: string): Promise<void> {
    const { data: admin } = await this.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUserId)
      .in('role', ['admin', 'security_officer'])
      .single();

    if (!admin) {
      throw new Error('Insufficient permissions for this operation');
    }
  }

  /**
   * Generate MFA recovery codes
   */
  async generateNewBackupCodes(
    userId: string,
    options: {
      userAgent: string;
      ipAddress: string;
    }
  ): Promise<string[]> {
    try {
      // Verify MFA is enabled
      const mfaSettings = await this.getUserMFASettings(userId);
      if (!mfaSettings?.isEnabled) {
        throw new Error('MFA not enabled for this user');
      }

      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes(8);
      const hashedCodes = await this.hashBackupCodes(newBackupCodes);

      // Update database
      await this.supabase
        .from('user_mfa_settings')
        .update({
          backup_codes: hashedCodes,
          backup_codes_used: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Create audit log
      await this.createAuditLog({
        userId,
        action: 'recover',
        method: 'backup',
        result: 'success',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          codesGenerated: newBackupCodes.length,
        },
      });

      return newBackupCodes;

    } catch (error) {
      await this.createAuditLog({
        userId,
        action: 'recover',
        method: 'backup',
        result: 'failure',
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Get MFA statistics for dashboard/monitoring
   */
  async getMFAStatistics(userId?: string): Promise<{
    totalUsers: number;
    enabledUsers: number;
    totpUsers: number;
    smsUsers: number;
    emergencyBypassesToday: number;
    failedAttemptsToday: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const queries = await Promise.all([
      // Total users
      this.supabase.from('users').select('id', { count: 'exact', head: true }),
      
      // Enabled MFA users
      this.supabase
        .from('user_mfa_settings')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_enabled', true),
      
      // TOTP users
      this.supabase
        .from('user_mfa_methods')
        .select('user_id', { count: 'exact', head: true })
        .eq('type', 'totp')
        .eq('is_enabled', true),
      
      // SMS users
      this.supabase
        .from('user_mfa_methods')
        .select('user_id', { count: 'exact', head: true })
        .eq('type', 'sms')
        .eq('is_enabled', true),
      
      // Emergency bypasses today
      this.supabase
        .from('mfa_audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('emergency_bypass', true)
        .gte('timestamp', todayStart.toISOString()),
      
      // Failed attempts today
      this.supabase
        .from('mfa_audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'verify')
        .eq('result', 'failure')
        .gte('timestamp', todayStart.toISOString()),
    ]);

    return {
      totalUsers: queries[0].count || 0,
      enabledUsers: queries[1].count || 0,
      totpUsers: queries[2].count || 0,
      smsUsers: queries[3].count || 0,
      emergencyBypassesToday: queries[4].count || 0,
      failedAttemptsToday: queries[5].count || 0,
    };
  }
}

// Default MFA service instance
let mfaServiceInstance: MFAService | null = null;

/**
 * Get singleton MFA service instance
 */
export function getMFAService(): MFAService {
  if (!mfaServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    mfaServiceInstance = new MFAService(supabaseUrl, supabaseKey);
  }
  
  return mfaServiceInstance;
}

// Utility functions for client-side use
export const MFAUtils = {
  /**
   * Generate QR code data URL for display
   */
  generateQRCodeDataURL: async (uri: string): Promise<string> => {
    // This would use a QR code library like 'qrcode'
    // For now, return the URI - implement QR generation in the component
    return uri;
  },

  /**
   * Format backup codes for display
   */
  formatBackupCodes: (codes: string[]): string[] => {
    return codes.map(code => 
      code.replace(/(.{4})(.{4})(.{2})/, '$1-$2-$3')
    );
  },

  /**
   * Validate token format
   */
  validateToken: (token: string, method: 'totp' | 'sms' | 'backup'): boolean => {
    switch (method) {
      case 'totp':
        return /^\d{6}$/.test(token);
      case 'sms':
        return /^\d{6}$/.test(token);
      case 'backup':
        return /^[A-F0-9]{10}$/i.test(token.replace(/-/g, ''));
      default:
        return false;
    }
  },
};

export default MFAService;