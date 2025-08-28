import type { MfaMethod } from "./mfa-service";
export interface MfaSettings {
  id?: string;
  userId: string;
  clinicId?: string;
  mfaEnabled: boolean;
  preferredMethod?: MfaMethod;
  enforced: boolean;
  smsEnabled: boolean;
  smsPhoneNumber?: string;
  smsVerified: boolean;
  smsLastUsed?: Date;
  emailEnabled: boolean;
  emailAddress?: string;
  emailVerified: boolean;
  emailLastUsed?: Date;
  totpEnabled: boolean;
  totpSecret?: string;
  totpVerified: boolean;
  totpLastUsed?: Date;
  biometricEnabled: boolean;
  biometricVerified: boolean;
  biometricLastUsed?: Date;
  backupCodesEnabled: boolean;
  backupCodesCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface MfaVerificationCode {
  id?: string;
  userId: string;
  clinicId?: string;
  code: string;
  type: "sms" | "email" | "totp" | "recovery";
  phoneNumber?: string;
  email?: string;
  used: boolean;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  createdAt?: Date;
  verifiedAt?: Date;
}
export interface MfaAuditLog {
  id?: string;
  userId: string;
  clinicId?: string;
  eventType: string;
  eventDescription?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}
/**
 * Database operations for MFA functionality
 * Integrates with Supabase for persistent storage
 */
export declare class MfaDatabaseService {
  private readonly supabase;
  /**
   * Get MFA settings for a user
   */
  getMfaSettings(userId: string): Promise<MfaSettings | null>;
  /**
   * Create or update MFA settings
   */
  upsertMfaSettings(settings: Partial<MfaSettings>): Promise<MfaSettings>;
  /**
   * Store verification code
   */
  storeVerificationCode(code: Omit<MfaVerificationCode, "id">): Promise<string>;
  /**
   * Get and verify code
   */
  verifyCode(
    userId: string,
    code: string,
    type: MfaVerificationCode["type"],
  ): Promise<{
    valid: boolean;
    codeRecord?: MfaVerificationCode;
  }>;
  /**
   * Log MFA audit event
   */
  logAuditEvent(event: Omit<MfaAuditLog, "id" | "createdAt">): Promise<void>;
  /**
   * Clean expired verification codes
   */
  cleanExpiredCodes(): Promise<number>;
  /**
   * Get user lockout status
   */
  getUserLockout(userId: string): Promise<{
    locked: boolean;
    lockoutUntil?: Date;
    attempts: number;
  }>;
  private mapDbDataToSettings;
  private mapDbDataToCode;
}
