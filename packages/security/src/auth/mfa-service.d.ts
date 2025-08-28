import { z } from "zod";
/**
 * Multi-Factor Authentication (MFA) service for healthcare platform
 * Implements TOTP (Time-based One-Time Password) and SMS-based authentication
 * Required for admin access and sensitive medical data operations
 */
/**
 * MFA method types supported by the system
 */
export declare const MfaMethod: {
  readonly TOTP: "totp";
  readonly SMS: "sms";
  readonly EMAIL: "email";
  readonly BACKUP_CODES: "backup_codes";
};
export type MfaMethod = (typeof MfaMethod)[keyof typeof MfaMethod];
/**
 * MFA setup request schema
 */
export declare const mfaSetupSchema: z.ZodObject<
  {
    userId: z.ZodString;
    method: z.ZodEnum<["totp", "sms", "email", "backup_codes"]>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  {
    userId: string;
    method: "email" | "sms" | "totp" | "backup_codes";
    email?: string | undefined;
    phoneNumber?: string | undefined;
  },
  {
    userId: string;
    method: "email" | "sms" | "totp" | "backup_codes";
    email?: string | undefined;
    phoneNumber?: string | undefined;
  }
>;
export declare const mfaVerificationSchema: z.ZodObject<
  {
    userId: z.ZodString;
    method: z.ZodEnum<["totp", "sms", "email", "backup_codes"]>;
    code: z.ZodString;
    sessionId: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    code: string;
    sessionId: string;
    userId: string;
    method: "email" | "sms" | "totp" | "backup_codes";
  },
  {
    code: string;
    sessionId: string;
    userId: string;
    method: "email" | "sms" | "totp" | "backup_codes";
  }
>;
/**
 * MFA configuration for user
 */
export interface MfaConfig {
  userId: string;
  method: MfaMethod;
  secret?: string;
  phoneNumber?: string;
  email?: string;
  backupCodes?: string[];
  isEnabled: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}
/**
 * MFA verification result
 */
export interface MfaVerificationResult {
  success: boolean;
  method: MfaMethod;
  remainingAttempts?: number;
  lockoutUntil?: Date;
  message?: string;
}
/**
 * Generate a secret key for TOTP setup
 * Implements RFC 6238 standard for authenticator apps
 */
export declare function generateTotpSecret(): string;
/**
 * Generate QR code URL for authenticator app setup
 */
export declare function generateTotpQrCodeUrl(
  secret: string,
  accountName: string,
  issuer?: string,
): string;
/**
 * Generate TOTP code for current time
 */
export declare function generateTotpCode(
  secret: string,
  timestamp?: number,
): string;
/**
 * Verify TOTP code with time window tolerance
 */
export declare function verifyTotpCode(
  secret: string,
  code: string,
  timestamp?: number,
): boolean;
/**
 * Generate random numeric code for SMS
 * Integrates with SMS providers for code delivery
 */
export declare function generateSmsCode(): string;
/**
 * Send SMS code to phone number
 * In production, integrate with Twilio, AWS SNS, or similar service
 */
export declare function sendSmsCode(
  _phoneNumber: string,
  _code: string,
): boolean;
/**
 * Validate phone number format
 */
export declare function validatePhoneNumber(phoneNumber: string): boolean;
/**
 * Generate backup codes for user
 */
export declare function generateBackupCodes(): string[];
/**
 * Verify backup code format
 */
export declare function validateBackupCode(code: string): boolean;
/**
 * Main MFA service that orchestrates different authentication methods
 */
/**
 * Setup MFA for user
 */
export declare function setupMfa(
  request: z.infer<typeof mfaSetupSchema>,
): Promise<{
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  message?: string;
}>;
/**
 * Verify MFA code
 */
export declare function verifyMfa(
  request: z.infer<typeof mfaVerificationSchema>,
): Promise<MfaVerificationResult>;
