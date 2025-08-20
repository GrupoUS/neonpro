import { createClient } from '@supabase/supabase-js';
import type { MfaMethod } from './mfa-service';

export type MfaSettings = {
  id?: string;
  userId: string;
  clinicId?: string;
  mfaEnabled: boolean;
  preferredMethod?: MfaMethod;
  enforced: boolean;

  // SMS settings
  smsEnabled: boolean;
  smsPhoneNumber?: string;
  smsVerified: boolean;
  smsLastUsed?: Date;

  // Email settings
  emailEnabled: boolean;
  emailAddress?: string;
  emailVerified: boolean;
  emailLastUsed?: Date;

  // TOTP settings
  totpEnabled: boolean;
  totpSecret?: string;
  totpVerified: boolean;
  totpLastUsed?: Date;

  // Biometric settings
  biometricEnabled: boolean;
  biometricVerified: boolean;
  biometricLastUsed?: Date;

  // Backup codes
  backupCodesEnabled: boolean;
  backupCodesCount: number;

  createdAt?: Date;
  updatedAt?: Date;
};

export type MfaVerificationCode = {
  id?: string;
  userId: string;
  clinicId?: string;
  code: string;
  type: 'sms' | 'email' | 'totp' | 'recovery';
  phoneNumber?: string;
  email?: string;
  used: boolean;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  createdAt?: Date;
  verifiedAt?: Date;
};

export type MfaAuditLog = {
  id?: string;
  userId: string;
  clinicId?: string;
  eventType: string;
  eventDescription?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
};

/**
 * Database operations for MFA functionality
 * Integrates with Supabase for persistent storage
 */
export class MfaDatabaseService {
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Get MFA settings for a user
   */
  async getMfaSettings(userId: string): Promise<MfaSettings | null> {
    const { data, error } = await this.supabase
      .from('user_mfa_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default
        return {
          userId,
          mfaEnabled: false,
          enforced: false,
          smsEnabled: false,
          smsVerified: false,
          emailEnabled: false,
          emailVerified: false,
          totpEnabled: false,
          totpVerified: false,
          biometricEnabled: false,
          biometricVerified: false,
          backupCodesEnabled: false,
          backupCodesCount: 0,
        };
      }
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      mfaEnabled: data.mfa_enabled,
      preferredMethod: data.preferred_method as MfaMethod,
      enforced: data.enforced,
      smsEnabled: data.sms_enabled,
      smsPhoneNumber: data.sms_phone_number,
      smsVerified: data.sms_verified,
      smsLastUsed: data.sms_last_used
        ? new Date(data.sms_last_used)
        : undefined,
      emailEnabled: data.email_enabled,
      emailAddress: data.email_address,
      emailVerified: data.email_verified,
      emailLastUsed: data.email_last_used
        ? new Date(data.email_last_used)
        : undefined,
      totpEnabled: data.totp_enabled,
      totpSecret: data.totp_secret,
      totpVerified: data.totp_verified,
      totpLastUsed: data.totp_last_used
        ? new Date(data.totp_last_used)
        : undefined,
      biometricEnabled: data.biometric_enabled,
      biometricVerified: data.biometric_verified,
      biometricLastUsed: data.biometric_last_used
        ? new Date(data.biometric_last_used)
        : undefined,
      backupCodesEnabled: data.backup_codes_enabled,
      backupCodesCount: data.backup_codes_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Create or update MFA settings
   */
  async upsertMfaSettings(
    settings: Partial<MfaSettings>
  ): Promise<MfaSettings> {
    const dbData = {
      user_id: settings.userId,
      clinic_id: settings.clinicId,
      mfa_enabled: settings.mfaEnabled,
      preferred_method: settings.preferredMethod,
      enforced: settings.enforced,
      sms_enabled: settings.smsEnabled,
      sms_phone_number: settings.smsPhoneNumber,
      sms_verified: settings.smsVerified,
      sms_last_used: settings.smsLastUsed?.toISOString(),
      email_enabled: settings.emailEnabled,
      email_address: settings.emailAddress,
      email_verified: settings.emailVerified,
      email_last_used: settings.emailLastUsed?.toISOString(),
      totp_enabled: settings.totpEnabled,
      totp_secret: settings.totpSecret,
      totp_verified: settings.totpVerified,
      totp_last_used: settings.totpLastUsed?.toISOString(),
      biometric_enabled: settings.biometricEnabled,
      biometric_verified: settings.biometricVerified,
      biometric_last_used: settings.biometricLastUsed?.toISOString(),
      backup_codes_enabled: settings.backupCodesEnabled,
      backup_codes_count: settings.backupCodesCount,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('user_mfa_settings')
      .upsert(dbData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapDbDataToSettings(data);
  }

  /**
   * Store verification code
   */
  async storeVerificationCode(
    code: Omit<MfaVerificationCode, 'id'>
  ): Promise<string> {
    const dbData = {
      user_id: code.userId,
      clinic_id: code.clinicId,
      code: code.code,
      type: code.type,
      phone_number: code.phoneNumber,
      email: code.email,
      used: code.used,
      attempts: code.attempts,
      max_attempts: code.maxAttempts,
      expires_at: code.expiresAt.toISOString(),
    };

    const { data, error } = await this.supabase
      .from('mfa_verification_codes')
      .insert(dbData)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  /**
   * Get and verify code
   */
  async verifyCode(
    userId: string,
    code: string,
    type: MfaVerificationCode['type']
  ): Promise<{
    valid: boolean;
    codeRecord?: MfaVerificationCode;
  }> {
    // Get the most recent unused code of this type for the user
    const { data: codes, error } = await this.supabase
      .from('mfa_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!codes || codes.length === 0) {
      return { valid: false };
    }

    const codeRecord = codes[0];

    // Check if code matches
    const valid =
      codeRecord.code === code && codeRecord.attempts < codeRecord.max_attempts;

    // Increment attempts and potentially mark as used
    const updates: any = {
      attempts: codeRecord.attempts + 1,
    };

    if (valid) {
      updates.used = true;
      updates.verified_at = new Date().toISOString();
    }

    await this.supabase
      .from('mfa_verification_codes')
      .update(updates)
      .eq('id', codeRecord.id);

    return {
      valid,
      codeRecord: this.mapDbDataToCode(codeRecord),
    };
  }

  /**
   * Log MFA audit event
   */
  async logAuditEvent(
    event: Omit<MfaAuditLog, 'id' | 'createdAt'>
  ): Promise<void> {
    const dbData = {
      user_id: event.userId,
      clinic_id: event.clinicId,
      event_type: event.eventType,
      event_description: event.eventDescription,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      success: event.success,
      error_message: event.errorMessage,
      metadata: event.metadata,
    };

    const { error } = await this.supabase.from('mfa_audit_logs').insert(dbData);

    if (error) {
      throw error;
    }
  }

  /**
   * Clean expired verification codes
   */
  async cleanExpiredCodes(): Promise<number> {
    const { data, error } = await this.supabase
      .from('mfa_verification_codes')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw error;
    }

    return data?.length || 0;
  }

  /**
   * Get user lockout status
   */
  async getUserLockout(userId: string): Promise<{
    locked: boolean;
    lockoutUntil?: Date;
    attempts: number;
  }> {
    const { data, error } = await this.supabase
      .from('mfa_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('used', false)
      .gte('attempts', 'max_attempts')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return { locked: false, attempts: 0 };
    }

    const record = data[0];
    return {
      locked: record.attempts >= record.max_attempts,
      lockoutUntil: new Date(record.expires_at),
      attempts: record.attempts,
    };
  }

  private mapDbDataToSettings(data: any): MfaSettings {
    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      mfaEnabled: data.mfa_enabled,
      preferredMethod: data.preferred_method,
      enforced: data.enforced,
      smsEnabled: data.sms_enabled,
      smsPhoneNumber: data.sms_phone_number,
      smsVerified: data.sms_verified,
      smsLastUsed: data.sms_last_used
        ? new Date(data.sms_last_used)
        : undefined,
      emailEnabled: data.email_enabled,
      emailAddress: data.email_address,
      emailVerified: data.email_verified,
      emailLastUsed: data.email_last_used
        ? new Date(data.email_last_used)
        : undefined,
      totpEnabled: data.totp_enabled,
      totpSecret: data.totp_secret,
      totpVerified: data.totp_verified,
      totpLastUsed: data.totp_last_used
        ? new Date(data.totp_last_used)
        : undefined,
      biometricEnabled: data.biometric_enabled,
      biometricVerified: data.biometric_verified,
      biometricLastUsed: data.biometric_last_used
        ? new Date(data.biometric_last_used)
        : undefined,
      backupCodesEnabled: data.backup_codes_enabled,
      backupCodesCount: data.backup_codes_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbDataToCode(data: any): MfaVerificationCode {
    return {
      id: data.id,
      userId: data.user_id,
      clinicId: data.clinic_id,
      code: data.code,
      type: data.type,
      phoneNumber: data.phone_number,
      email: data.email,
      used: data.used,
      attempts: data.attempts,
      maxAttempts: data.max_attempts,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
    };
  }
}
