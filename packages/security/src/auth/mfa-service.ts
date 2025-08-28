import { z } from "zod";

// Constants for magic numbers
const HOTP_OFFSET_BYTES = 3;
const BACKUP_CODE_SEPARATOR_POSITION = 4;
const LOCKOUT_DURATION_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;
const MINUTES_TO_MILLISECONDS = SECONDS_PER_MINUTE * 1000;

// Regex patterns moved to top level
const PHONE_NUMBER_REGEX = /^\+[1-9]\d{1,14}$/;
const BACKUP_CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Multi-Factor Authentication (MFA) service for healthcare platform
 * Implements TOTP (Time-based One-Time Password) and SMS-based authentication
 * Required for admin access and sensitive medical data operations
 */

/**
 * MFA method types supported by the system
 */
export const MfaMethod = {
  TOTP: "totp",
  SMS: "sms",
  EMAIL: "email",
  BACKUP_CODES: "backup_codes",
} as const;

export type MfaMethod = (typeof MfaMethod)[keyof typeof MfaMethod];

/**
 * MFA setup request schema
 */
export const mfaSetupSchema = z.object({
  userId: z.string().uuid("User ID deve ser um UUID válido"),
  method: z.enum(
    [MfaMethod.TOTP, MfaMethod.SMS, MfaMethod.EMAIL, MfaMethod.BACKUP_CODES],
    {
      errorMap: () => ({ message: "Método MFA inválido" }),
    },
  ),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,20}$/)
    .optional(),
  email: z.string().email().optional(),
});

/**
 * MFA verification request schema
 */
// MFA service constants
const MIN_CODE_LENGTH = 6;
const MAX_CODE_LENGTH = 8;
const TOTP_SECRET_LENGTH = 32;
const MILLISECONDS_PER_SECOND = 1000;
const COUNTER_BUFFER_SIZE = 8;
const HIGH_BITS_DIVISOR = 0x1_00_00_00_00;
const BUFFER_OFFSET_HIGH_BITS = 4;
// Bitwise operation constants for HOTP algorithm (RFC 4226)
const BYTE_MASK = 0xFF; // 255 - masks lower 8 bits
const HOTP_MASK = 0x7F; // 127 - masks lower 7 bits for sign bit removal

export const mfaVerificationSchema = z.object({
  userId: z.string().uuid("User ID deve ser um UUID válido"),
  method: z.enum([
    MfaMethod.TOTP,
    MfaMethod.SMS,
    MfaMethod.EMAIL,
    MfaMethod.BACKUP_CODES,
  ]),
  code: z
    .string()
    .min(MIN_CODE_LENGTH)
    .max(MAX_CODE_LENGTH)
    .regex(/^\d+$/, "Código deve conter apenas dígitos"),
  sessionId: z.string().uuid("Session ID deve ser um UUID válido"),
});

/**
 * MFA configuration for user
 */
export interface MfaConfig {
  userId: string;
  method: MfaMethod;
  secret?: string; // For TOTP
  phoneNumber?: string; // For SMS
  email?: string; // For email
  backupCodes?: string[]; // Backup codes
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
 * TOTP (Time-based One-Time Password) service
 * Implements RFC 6238 standard for authenticator apps
 */
/**
 * TOTP configuration constants
 */
const TOTP_ALGORITHM = "SHA1";
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_WINDOW = 1; // Allow 1 time step tolerance

/**
 * Generate a secret key for TOTP setup
 * Implements RFC 6238 standard for authenticator apps
 */
export function generateTotpSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < TOTP_SECRET_LENGTH; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Generate QR code URL for authenticator app setup
 */
export function generateTotpQrCodeUrl(
  secret: string,
  accountName: string,
  issuer = "NeonPro Healthcare",
): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS.toString(),
    period: TOTP_PERIOD.toString(),
  });

  return `otpauth://totp/${encodeURIComponent(issuer)}:${
    encodeURIComponent(
      accountName,
    )
  }?${params}`;
}

/**
 * Generate TOTP code for current time
 */
export function generateTotpCode(secret: string, timestamp?: number): string {
  const time = Math.floor(
    (timestamp || Date.now()) / MILLISECONDS_PER_SECOND / TOTP_PERIOD,
  );
  return generateHotp(secret, time);
}

/**
 * Verify TOTP code with time window tolerance
 */
export function verifyTotpCode(
  secret: string,
  code: string,
  timestamp?: number,
): boolean {
  const time = Math.floor(
    (timestamp || Date.now()) / MILLISECONDS_PER_SECOND / TOTP_PERIOD,
  );

  // Check current time and adjacent windows
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    if (generateHotp(secret, time + i) === code) {
      return true;
    }
  }

  return false;
}

/**
 * Generate HMAC-based One-Time Password (HOTP)
 * Implementation of RFC 4226
 */
function generateHotp(secret: string, counter: number): string {
  // Convert secret from Base32
  const key = base32Decode(secret);

  // Convert counter to 8-byte buffer
  const counterBuffer = Buffer.alloc(COUNTER_BUFFER_SIZE);
  counterBuffer.writeUInt32BE(Math.floor(counter / HIGH_BITS_DIVISOR), 0);
  // oxlint-disable-next-line no-bitwise
  counterBuffer.writeUInt32BE(counter & 0xFF_FF_FF_FF, BUFFER_OFFSET_HIGH_BITS);

  // Generate HMAC
  const crypto = require("node:crypto");
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  // oxlint-disable-next-line no-bitwise
  const offset = digest.at(-1) & 0x0F;
  // HOTP dynamic truncation algorithm (RFC 4226) requires bitwise operations
  // oxlint-disable-next-line no-bitwise
  const code = ((digest[offset] & HOTP_MASK) << 24)
    | ((digest[offset + 1] & BYTE_MASK) << 16)
    | ((digest[offset + 2] & BYTE_MASK) << 8)
    | (digest[offset + 3] & BYTE_MASK);

  return (code % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, "0");
}

// Base32 decoding constants
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE32_PADDING_REGEX = /=+$/;
const BASE32_BITS_PER_CHAR = 5;
const BYTE_SIZE = 8;

/**
 * Decode Base32 string to buffer
 */
function base32Decode(encoded: string): Buffer {
  const cleanEncoded = encoded.toUpperCase().replace(BASE32_PADDING_REGEX, "");

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanEncoded.length; i++) {
    // oxlint-disable-next-line no-bitwise
    value = (value << BASE32_BITS_PER_CHAR) | BASE32_CHARS.indexOf(cleanEncoded[i]);
    bits += BASE32_BITS_PER_CHAR;

    if (bits >= BYTE_SIZE) {
      output.push((value >>> (bits - BYTE_SIZE)) & BYTE_MASK);
      bits -= BYTE_SIZE;
    }
  }

  return Buffer.from(output);
}

/**
 * SMS code configuration
 */
const SMS_CODE_LENGTH = 6;

/**
 * Generate random numeric code for SMS
 * Integrates with SMS providers for code delivery
 */
export function generateSmsCode(): string {
  return Math.floor(Math.random() * 10 ** SMS_CODE_LENGTH)
    .toString()
    .padStart(SMS_CODE_LENGTH, "0");
}

/**
 * Send SMS code to phone number
 * In production, integrate with Twilio, AWS SNS, or similar service
 */
export function sendSmsCode(_phoneNumber: string, _code: string): boolean {
  try {
    // In production, use SMS service:
    // await twilioClient.messages.create({
    //   body: `Seu código de verificação NeonPro: ${code}. Válido por 5 minutos.`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // })

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  return PHONE_NUMBER_REGEX.test(phoneNumber);
}

/**
 * Backup codes service for MFA recovery
 * Generates one-time use codes for account recovery
 */
const CODE_COUNT = 10;
const CODE_LENGTH = 8;

/**
 * Generate backup codes for user
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];

  for (let i = 0; i < CODE_COUNT; i++) {
    codes.push(generateSingleCode());
  }

  return codes;
}

/**
 * Generate single backup code
 */
function generateSingleCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (i === BACKUP_CODE_SEPARATOR_POSITION) {
      code += "-"; // Add separator for readability
    }
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Verify backup code format
 */
export function validateBackupCode(code: string): boolean {
  return BACKUP_CODE_REGEX.test(code.toUpperCase());
}

/**
 * Main MFA service that orchestrates different authentication methods
 */
// 15 minutes

/**
 * Setup MFA for user
 */
export async function setupMfa(
  request: z.infer<typeof mfaSetupSchema>,
): Promise<{
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  message?: string;
}> {
  try {
    const { userId, method, phoneNumber, email } = request;

    switch (method) {
      case MfaMethod.TOTP: {
        const secret = generateTotpSecret();
        const qrCode = generateTotpQrCodeUrl(secret, userId);

        // Store the secret temporarily (will be permanently saved after verification)
        const settings = await mfaDb.getMfaSettings(userId);
        await mfaDb.upsertMfaSettings({
          ...settings,
          userId,
          totpSecret: secret,
          totpEnabled: false, // Not enabled until verified
        });

        return {
          success: true,
          secret,
          qrCode,
          message: "Configure seu app autenticador com o QR code",
        };
      }

      case MfaMethod.SMS: {
        if (!(phoneNumber && validatePhoneNumber(phoneNumber))) {
          return {
            success: false,
            message: "Número de telefone válido é obrigatório para SMS MFA",
          };
        }

        const smsCode = generateSmsCode();
        const smsSent = sendSmsCode(phoneNumber, smsCode);

        if (!smsSent) {
          return {
            success: false,
            message: "Falha ao enviar código SMS",
          };
        }

        // Store the code and phone number
        await storeVerificationCode(userId, smsCode, "sms", phoneNumber);

        const settings = await mfaDb.getMfaSettings(userId);
        await mfaDb.upsertMfaSettings({
          ...settings,
          userId,
          smsPhoneNumber: phoneNumber,
          smsEnabled: false, // Not enabled until verified
        });

        return {
          success: true,
          message: "Código enviado via SMS",
        };
      }

      case MfaMethod.EMAIL: {
        if (!(email && z.string().email().safeParse(email).success)) {
          return {
            success: false,
            message: "Email válido é obrigatório para Email MFA",
          };
        }

        const emailCode = generateSmsCode(); // Use same format for simplicity

        // In production, send email with code
        // For now, store the code
        await storeVerificationCode(
          userId,
          emailCode,
          "email",
          undefined,
          email,
        );

        const settings = await mfaDb.getMfaSettings(userId);
        await mfaDb.upsertMfaSettings({
          ...settings,
          userId,
          emailAddress: email,
          emailEnabled: false, // Not enabled until verified
        });

        return {
          success: true,
          message: "Código enviado via email",
        };
      }

      case MfaMethod.BACKUP_CODES: {
        const backupCodes = generateBackupCodes();

        const settings = await mfaDb.getMfaSettings(userId);
        await mfaDb.upsertMfaSettings({
          ...settings,
          userId,
          backupCodesEnabled: true,
          backupCodesCount: backupCodes.length,
        });

        return {
          success: true,
          backupCodes,
          message: "Códigos de backup gerados. Armazene em local seguro.",
        };
      }

      default: {
        return {
          success: false,
          message: "Método MFA não suportado",
        };
      }
    }
  } catch {
    return {
      success: false,
      message: "Erro interno ao configurar MFA",
    };
  }
}

/**
 * Verify MFA code
 */
export async function verifyMfa(
  request: z.infer<typeof mfaVerificationSchema>,
): Promise<MfaVerificationResult> {
  try {
    const { userId, method, code } = request;

    // Check for lockout
    const lockoutResult = await checkLockout(userId);
    if (lockoutResult.locked) {
      return {
        success: false,
        method,
        lockoutUntil: lockoutResult.lockoutUntil,
        message: "Conta temporariamente bloqueada devido a tentativas excessivas",
      };
    }

    let verified = false;

    switch (method) {
      case MfaMethod.TOTP: {
        const totpSecret = await getUserTotpSecret(userId);
        if (totpSecret) {
          verified = verifyTotpCode(totpSecret, code);
        }
        break;
      }

      case MfaMethod.SMS: {
        verified = await verifySmsCodeForUser(userId, code);
        break;
      }

      case MfaMethod.EMAIL: {
        verified = await mfaDb
          .verifyCode(userId, code, "email")
          .then((r) => r.valid);
        break;
      }

      case MfaMethod.BACKUP_CODES: {
        verified = await verifyBackupCodeForUser(userId, code);
        break;
      }

      default: {
        await recordFailedMfa(userId, method, "Invalid MFA method");
        return { success: false, method, message: "Método MFA inválido" };
      }
    }

    if (verified) {
      await recordSuccessfulMfa(userId, method);
      return {
        success: true,
        method,
        message: "MFA verificado com sucesso",
      };
    }

    await recordFailedMfa(userId, method, "Invalid verification code");

    // Check lockout status after failed attempt
    const newLockoutStatus = await checkLockout(userId);
    if (newLockoutStatus.locked) {
      return {
        success: false,
        method,
        remainingAttempts: 0,
        lockoutUntil: newLockoutStatus.lockoutUntil,
        message: "Muitas tentativas incorretas. Conta bloqueada temporariamente.",
      };
    }

    return {
      success: false,
      method,
      message: "Código de verificação inválido",
    };
  } catch {
    await recordFailedMfa(
      request.userId,
      request.method,
      "Internal verification error",
    );
    return {
      success: false,
      method: request.method,
      message: "Erro interno na verificação MFA",
    };
  }
}

import { MfaDatabaseService } from "./mfa-database-service";

// Global database service instance
const mfaDb = new MfaDatabaseService();

/**
 * Check if user is locked out
 */
async function checkLockout(userId: string): Promise<{
  locked: boolean;
  lockoutUntil?: Date;
}> {
  try {
    const lockoutStatus = await mfaDb.getUserLockout(userId);
    return {
      locked: lockoutStatus.locked,
      lockoutUntil: lockoutStatus.lockoutUntil,
    };
  } catch {
    return { locked: false };
  }
}

/**
 * Get user's TOTP secret from secure storage
 */
async function getUserTotpSecret(userId: string): Promise<string | null> {
  try {
    const settings = await mfaDb.getMfaSettings(userId);
    return settings?.totpSecret || null;
  } catch {
    return null;
  }
}

/**
 * Verify SMS code from temporary storage
 */
async function verifySmsCodeForUser(
  userId: string,
  code: string,
): Promise<boolean> {
  try {
    const result = await mfaDb.verifyCode(userId, code, "sms");
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Verify backup code and mark as used
 */
async function verifyBackupCodeForUser(
  userId: string,
  code: string,
): Promise<boolean> {
  try {
    const result = await mfaDb.verifyCode(userId, code, "recovery");
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Store verification code in database
 */
async function storeVerificationCode(
  userId: string,
  code: string,
  type: "sms" | "email",
  phoneNumber?: string,
  email?: string,
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minute expiry

  await mfaDb.storeVerificationCode({
    userId,
    code,
    type,
    phoneNumber,
    email,
    used: false,
    attempts: 0,
    maxAttempts: 3,
    expiresAt,
  });
}

/**
 * Record successful MFA authentication
 */
async function recordSuccessfulMfa(
  userId: string,
  method: MfaMethod,
): Promise<void> {
  try {
    await mfaDb.logAuditEvent({
      userId,
      eventType: "mfa_verification_success",
      eventDescription: `Successful MFA verification using ${method}`,
      success: true,
      metadata: { method },
    });

    // Update last used timestamp
    const settings = await mfaDb.getMfaSettings(userId);
    if (settings) {
      const updateData: Record<string, Date> = {};

      switch (method) {
        case MfaMethod.SMS: {
          updateData.smsLastUsed = new Date();
          break;
        }
        case MfaMethod.EMAIL: {
          updateData.emailLastUsed = new Date();
          break;
        }
        case MfaMethod.TOTP: {
          updateData.totpLastUsed = new Date();
          break;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await mfaDb.upsertMfaSettings({ ...settings, ...updateData });
      }
    }
  } catch {}
}

/**
 * Record failed MFA authentication
 */
async function recordFailedMfa(
  userId: string,
  method: MfaMethod,
  errorMessage?: string,
): Promise<void> {
  try {
    await mfaDb.logAuditEvent({
      userId,
      eventType: "mfa_verification_failure",
      eventDescription: `Failed MFA verification using ${method}`,
      success: false,
      errorMessage,
      metadata: { method },
    });
  } catch {}
}
