import { z } from 'zod';

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
  TOTP: 'totp',
  SMS: 'sms',
  EMAIL: 'email',
  BACKUP_CODES: 'backup_codes',
} as const;

export type MfaMethod = (typeof MfaMethod)[keyof typeof MfaMethod];

/**
 * MFA setup request schema
 */
export const mfaSetupSchema = z.object({
  userId: z.string().uuid('User ID deve ser um UUID válido'),
  method: z.enum(
    [MfaMethod.TOTP, MfaMethod.SMS, MfaMethod.EMAIL, MfaMethod.BACKUP_CODES],
    {
      errorMap: () => ({ message: 'Método MFA inválido' }),
    }
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
const BYTE_MASK = 0xff; // 255 - masks lower 8 bits
const HOTP_MASK = 0x7f; // 127 - masks lower 7 bits for sign bit removal

export const mfaVerificationSchema = z.object({
  userId: z.string().uuid('User ID deve ser um UUID válido'),
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
    .regex(/^\d+$/, 'Código deve conter apenas dígitos'),
  sessionId: z.string().uuid('Session ID deve ser um UUID válido'),
});

/**
 * MFA configuration for user
 */
export type MfaConfig = {
  userId: string;
  method: MfaMethod;
  secret?: string; // For TOTP
  phoneNumber?: string; // For SMS
  email?: string; // For email
  backupCodes?: string[]; // Backup codes
  isEnabled: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
};

/**
 * MFA verification result
 */
export type MfaVerificationResult = {
  success: boolean;
  method: MfaMethod;
  remainingAttempts?: number;
  lockoutUntil?: Date;
  message?: string;
};

/**
 * TOTP (Time-based One-Time Password) service
 * Implements RFC 6238 standard for authenticator apps
 */
/**
 * TOTP configuration constants
 */
const TOTP_ALGORITHM = 'SHA1';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_WINDOW = 1; // Allow 1 time step tolerance

/**
 * Generate a secret key for TOTP setup
 * Implements RFC 6238 standard for authenticator apps
 */
export function generateTotpSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
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
  issuer = 'NeonPro Healthcare'
): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS.toString(),
    period: TOTP_PERIOD.toString(),
  });

  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params}`;
}

/**
 * Generate TOTP code for current time
 */
export function generateTotpCode(secret: string, timestamp?: number): string {
  const time = Math.floor(
    (timestamp || Date.now()) / MILLISECONDS_PER_SECOND / TOTP_PERIOD
  );
  return generateHotp(secret, time);
}

/**
 * Verify TOTP code with time window tolerance
 */
export function verifyTotpCode(
  secret: string,
  code: string,
  timestamp?: number
): boolean {
  const time = Math.floor(
    (timestamp || Date.now()) / MILLISECONDS_PER_SECOND / TOTP_PERIOD
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
  // biome-ignore lint/suspicious/noBitwiseOperators: Bitwise mask required for 32-bit integer extraction in HOTP
  counterBuffer.writeUInt32BE(counter & 0xff_ff_ff_ff, BUFFER_OFFSET_HIGH_BITS);

  // Generate HMAC
  const crypto = require('node:crypto');
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  // biome-ignore lint/suspicious/noBitwiseOperators: Bitwise operations are required for HOTP cryptographic algorithm
  const offset = digest.at(-1) & 0x0f;
  // HOTP dynamic truncation algorithm (RFC 4226) requires bitwise operations
  // biome-ignore suspicious/noBitwiseOperators: HOTP algorithm requires bitwise operations
  const code =
    ((digest[offset] & HOTP_MASK) << 24) |
    ((digest[offset + 1] & BYTE_MASK) << 16) |
    ((digest[offset + 2] & BYTE_MASK) << 8) |
    (digest[offset + 3] & BYTE_MASK);
    (digest[offset + HOTP_OFFSET_BYTES] & BYTE_MASK);

  return (code % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, '0');
}

// Base32 decoding constants
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_PADDING_REGEX = /=+$/;
const BASE32_BITS_PER_CHAR = 5;
const BYTE_SIZE = 8;

/**
 * Decode Base32 string to buffer
 */
function base32Decode(encoded: string): Buffer {
  const cleanEncoded = encoded.toUpperCase().replace(BASE32_PADDING_REGEX, '');

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanEncoded.length; i++) {
    // biome-ignore suspicious/noBitwiseOperators: Base32 decoding requires bitwise operations
    value =
      (value << BASE32_BITS_PER_CHAR) | BASE32_CHARS.indexOf(cleanEncoded[i]);
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
    .padStart(SMS_CODE_LENGTH, '0');
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
  } catch (_error) {
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
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (i === BACKUP_CODE_SEPARATOR_POSITION) {
      code += '-'; // Add separator for readability
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
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = LOCKOUT_DURATION_MINUTES * MINUTES_TO_MILLISECONDS; // 15 minutes

/**
 * Setup MFA for user
 */
export async function setupMfa(
  request: z.infer<typeof mfaSetupSchema>
): Promise<{
  success: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  message?: string;
}> {
  try {
    const { userId, method, phoneNumber } = request;

    switch (method) {
      case MfaMethod.TOTP: {
        const secret = generateTotpSecret();
        const qrCode = generateTotpQrCodeUrl(secret, userId);

        return {
          success: true,
          secret,
          qrCode,
          message: 'Configure seu app autenticador com o QR code',
        };
      }

      case MfaMethod.SMS: {
        if (!(phoneNumber && validatePhoneNumber(phoneNumber))) {
          return {
            success: false,
            message: 'Número de telefone válido é obrigatório para SMS MFA',
          };
        }

        const smsCode = generateSmsCode();
        const smsSent = await sendSmsCode(phoneNumber, smsCode);

        if (!smsSent) {
          return {
            success: false,
            message: 'Falha ao enviar código SMS',
          };
        }

        return {
          success: true,
          message: 'Código enviado via SMS',
        };
      }

      case MfaMethod.BACKUP_CODES: {
        const backupCodes = generateBackupCodes();

        return {
          success: true,
          backupCodes,
          message: 'Códigos de backup gerados. Armazene em local seguro.',
        };
      }

      default:
        return {
          success: false,
          message: 'Método MFA não suportado',
        };
    }
  } catch (_error) {
    return {
      success: false,
      message: 'Erro interno ao configurar MFA',
    };
  }
}

/**
 * Verify MFA code
 */
export function verifyMfa(
  request: z.infer<typeof mfaVerificationSchema>
): MfaVerificationResult {
  try {
    const { userId, method, code } = request;

    // Check for lockout
    const lockoutResult = checkLockout(userId);
    if (lockoutResult.locked) {
      return {
        success: false,
        method,
        message:
          'Conta temporariamente bloqueada devido a tentativas excessivas',
      };
    }

    let verified = false;

    switch (method) {
      case MfaMethod.TOTP: {
        // In production, retrieve user's TOTP secret from database
        const totpSecret = getUserTotpSecret(userId);
        if (totpSecret) {
          verified = verifyTotpCode(totpSecret, code);
        }
        break;
      }

      case MfaMethod.SMS:
        // In production, retrieve and verify stored SMS code
        verified = verifySmsCodeForUser(userId, code);
        break;

      case MfaMethod.BACKUP_CODES:
        // In production, check if backup code exists and mark as used
        verified = verifyBackupCodeForUser(userId, code);
        break;
      default:
        return { success: false, method, message: 'Invalid MFA method' };
    }

    if (verified) {
      resetAttempts(userId);
      recordSuccessfulMfa(userId, method);

      return {
        success: true,
        method,
        message: 'MFA verificado com sucesso',
      };
    }
    const attempts = incrementAttempts(userId);
    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts);

    if (remainingAttempts === 0) {
      lockUser(userId);
      return {
        success: false,
        method,
        remainingAttempts: 0,
        lockoutUntil: new Date(Date.now() + LOCKOUT_DURATION),
        message:
          'Muitas tentativas incorretas. Conta bloqueada temporariamente.',
      };
    }

    return {
      success: false,
      method,
      remainingAttempts,
      message: `Código incorreto. ${remainingAttempts} tentativas restantes.`,
    };
  } catch (_error) {
    return {
      success: false,
      method: request.method,
      message: 'Erro interno na verificação MFA',
    };
  }
}

/**
 * Check if user is locked out
 */
function checkLockout(_userId: string): {
  locked: boolean;
  lockoutUntil?: Date;
} {
  // In production, check database for lockout status
  // Mock implementation
  return { locked: false };
}

/**
 * Get user's TOTP secret from secure storage
 */
function getUserTotpSecret(_userId: string): string | null {
  // In production, retrieve from encrypted database storage
  // Mock implementation
  return 'MOCK_SECRET_KEY_FOR_DEVELOPMENT';
}

/**
 * Verify SMS code from temporary storage
 */
function verifySmsCodeForUser(_userId: string, code: string): boolean {
  // In production, verify against temporarily stored SMS code
  // Mock implementation
  return code === '123456';
}

/**
 * Verify backup code and mark as used
 */
function verifyBackupCodeForUser(_userId: string, code: string): boolean {
  // In production, check database and mark code as used
  // Mock implementation
  return validateBackupCode(code);
}

/**
 * Increment failed attempts counter
 */
function incrementAttempts(_userId: string): number {
  // In production, increment counter in database
  // Mock implementation
  return 1;
}

/**
 * Reset failed attempts counter
 */
function resetAttempts(_userId: string): void {
  // In production, reset counter in database
  // Mock implementation
}

/**
 * Lock user account temporarily
 */
function lockUser(_userId: string): void {
  // In production, set lockout timestamp in database
  // Mock implementation
}

/**
 * Record successful MFA authentication
 */
function recordSuccessfulMfa(_userId: string, _method: MfaMethod): void {
  // In production, record successful MFA authentication in audit log
  // Mock implementation
}
