import { z } from 'zod';

/**
 * Multi-Factor Authentication (MFA) service for healthcare platform
 * Implements TOTP (Time-based One-Time Password) and SMS-based authentication
 * Required for admin access and sensitive medical data operations
 */

/**
 * MFA method types supported by the system
 */
export enum MfaMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  BACKUP_CODES = 'backup_codes',
}

/**
 * MFA setup request schema
 */
export const mfaSetupSchema = z.object({
  userId: z.string().uuid('User ID deve ser um UUID válido'),
  method: z.nativeEnum(MfaMethod, { errorMap: () => ({ message: 'Método MFA inválido' }) }),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-()]{10,20}$/)
    .optional(),
  email: z.string().email().optional(),
});

/**
 * MFA verification request schema
 */
export const mfaVerificationSchema = z.object({
  userId: z.string().uuid('User ID deve ser um UUID válido'),
  method: z.nativeEnum(MfaMethod),
  code: z.string().min(6).max(8).regex(/^\d+$/, 'Código deve conter apenas dígitos'),
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
export class TotpService {
  private static readonly ALGORITHM = 'SHA1';
  private static readonly DIGITS = 6;
  private static readonly PERIOD = 30; // seconds
  private static readonly WINDOW = 1; // Allow 1 time step tolerance

  /**
   * Generate a secret key for TOTP setup
   */
  static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Generate QR code URL for authenticator app setup
   */
  static generateQrCodeUrl(
    secret: string,
    accountName: string,
    issuer = 'NeonPro Healthcare'
  ): string {
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: TotpService.ALGORITHM,
      digits: TotpService.DIGITS.toString(),
      period: TotpService.PERIOD.toString(),
    });

    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params}`;
  }

  /**
   * Generate TOTP code for current time
   */
  static generateCode(secret: string, timestamp?: number): string {
    const time = Math.floor((timestamp || Date.now()) / 1000 / TotpService.PERIOD);
    return TotpService.generateHotp(secret, time);
  }

  /**
   * Verify TOTP code with time window tolerance
   */
  static verifyCode(secret: string, code: string, timestamp?: number): boolean {
    const time = Math.floor((timestamp || Date.now()) / 1000 / TotpService.PERIOD);

    // Check current time and adjacent windows
    for (let i = -TotpService.WINDOW; i <= TotpService.WINDOW; i++) {
      if (TotpService.generateHotp(secret, time + i) === code) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate HMAC-based One-Time Password (HOTP)
   * Implementation of RFC 4226
   */
  private static generateHotp(secret: string, counter: number): string {
    // Convert secret from Base32
    const key = TotpService.base32Decode(secret);

    // Convert counter to 8-byte buffer
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / 0x1_00_00_00_00), 0);
    counterBuffer.writeUInt32BE(counter & 0xff_ff_ff_ff, 4);

    // Generate HMAC
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counterBuffer);
    const digest = hmac.digest();

    // Dynamic truncation
    const offset = digest.at(-1) & 0x0f;
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    return (code % 10 ** TotpService.DIGITS).toString().padStart(TotpService.DIGITS, '0');
  }

  /**
   * Decode Base32 string to buffer
   */
  private static base32Decode(encoded: string): Buffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    encoded = encoded.toUpperCase().replace(/=+$/, '');

    let bits = 0;
    let value = 0;
    const output = [];

    for (let i = 0; i < encoded.length; i++) {
      value = (value << 5) | chars.indexOf(encoded[i]);
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}

/**
 * SMS-based MFA service
 * Integrates with SMS providers for code delivery
 */
export class SmsService {
  private static readonly CODE_LENGTH = 6;

  /**
   * Generate random numeric code for SMS
   */
  static generateCode(): string {
    return Math.floor(Math.random() * 10 ** SmsService.CODE_LENGTH)
      .toString()
      .padStart(SmsService.CODE_LENGTH, '0');
  }

  /**
   * Send SMS code to phone number
   * In production, integrate with Twilio, AWS SNS, or similar service
   */
  static async sendCode(_phoneNumber: string, _code: string): Promise<boolean> {
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
  static validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,20}$/;
    return phoneRegex.test(phoneNumber);
  }
}

/**
 * Backup codes service for MFA recovery
 * Generates one-time use codes for account recovery
 */
export class BackupCodesService {
  private static readonly CODE_COUNT = 10;
  private static readonly CODE_LENGTH = 8;

  /**
   * Generate backup codes for user
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];

    for (let i = 0; i < BackupCodesService.CODE_COUNT; i++) {
      codes.push(BackupCodesService.generateSingleCode());
    }

    return codes;
  }

  /**
   * Generate single backup code
   */
  private static generateSingleCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < BackupCodesService.CODE_LENGTH; i++) {
      if (i === 4) {
        code += '-'; // Add separator for readability
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  }

  /**
   * Verify backup code format
   */
  static validateBackupCode(code: string): boolean {
    const codeRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return codeRegex.test(code.toUpperCase());
  }
}

/**
 * Main MFA service that orchestrates different authentication methods
 */
export class MfaService {
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Setup MFA for user
   */
  static async setupMfa(request: z.infer<typeof mfaSetupSchema>): Promise<{
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
          const secret = TotpService.generateSecret();
          const qrCode = TotpService.generateQrCodeUrl(secret, userId);

          return {
            success: true,
            secret,
            qrCode,
            message: 'Configure seu app autenticador com o QR code',
          };
        }

        case MfaMethod.SMS: {
          if (!(phoneNumber && SmsService.validatePhoneNumber(phoneNumber))) {
            return {
              success: false,
              message: 'Número de telefone válido é obrigatório para SMS MFA',
            };
          }

          const smsCode = SmsService.generateCode();
          const smsSent = await SmsService.sendCode(phoneNumber, smsCode);

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
          const backupCodes = BackupCodesService.generateBackupCodes();

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
  static async verifyMfa(
    request: z.infer<typeof mfaVerificationSchema>
  ): Promise<MfaVerificationResult> {
    try {
      const { userId, method, code, sessionId } = request;

      // Check for lockout
      const lockoutStatus = await MfaService.checkLockout(userId);
      if (lockoutStatus.locked) {
        return {
          success: false,
          method,
          lockoutUntil: lockoutStatus.lockoutUntil,
          message: 'Conta temporariamente bloqueada devido a tentativas excessivas',
        };
      }

      let verified = false;

      switch (method) {
        case MfaMethod.TOTP: {
          // In production, retrieve user's TOTP secret from database
          const totpSecret = await MfaService.getUserTotpSecret(userId);
          if (totpSecret) {
            verified = TotpService.verifyCode(totpSecret, code);
          }
          break;
        }

        case MfaMethod.SMS:
          // In production, retrieve and verify stored SMS code
          verified = await MfaService.verifySmsCode(userId, code);
          break;

        case MfaMethod.BACKUP_CODES:
          // In production, check if backup code exists and mark as used
          verified = await MfaService.verifyBackupCode(userId, code);
          break;
      }

      if (verified) {
        await MfaService.resetAttempts(userId);
        await MfaService.recordSuccessfulMfa(userId, method);

        return {
          success: true,
          method,
          message: 'MFA verificado com sucesso',
        };
      }
      const attempts = await MfaService.incrementAttempts(userId);
      const remainingAttempts = Math.max(0, MfaService.MAX_ATTEMPTS - attempts);

      if (remainingAttempts === 0) {
        await MfaService.lockUser(userId);
        return {
          success: false,
          method,
          remainingAttempts: 0,
          lockoutUntil: new Date(Date.now() + MfaService.LOCKOUT_DURATION),
          message: 'Muitas tentativas incorretas. Conta bloqueada temporariamente.',
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
  private static async checkLockout(
    _userId: string
  ): Promise<{ locked: boolean; lockoutUntil?: Date }> {
    // In production, check database for lockout status
    // Mock implementation
    return { locked: false };
  }

  /**
   * Get user's TOTP secret from secure storage
   */
  private static async getUserTotpSecret(_userId: string): Promise<string | null> {
    // In production, retrieve from encrypted database storage
    // Mock implementation
    return 'MOCK_SECRET_KEY_FOR_DEVELOPMENT';
  }

  /**
   * Verify SMS code from temporary storage
   */
  private static async verifySmsCode(_userId: string, code: string): Promise<boolean> {
    // In production, verify against temporarily stored SMS code
    // Mock implementation
    return code === '123456';
  }

  /**
   * Verify backup code and mark as used
   */
  private static async verifyBackupCode(_userId: string, code: string): Promise<boolean> {
    // In production, check database and mark code as used
    // Mock implementation
    return BackupCodesService.validateBackupCode(code);
  }

  /**
   * Increment failed attempts counter
   */
  private static async incrementAttempts(_userId: string): Promise<number> {
    // In production, increment counter in database
    // Mock implementation
    return 1;
  }

  /**
   * Reset failed attempts counter
   */
  private static async resetAttempts(_userId: string): Promise<void> {
    // In production, reset counter in database
    // Mock implementation
  }

  /**
   * Lock user account temporarily
   */
  private static async lockUser(_userId: string): Promise<void> {
    // In production, set lockout timestamp in database
    // Mock implementation
  }

  /**
   * Record successful MFA authentication
   */
  private static async recordSuccessfulMfa(_userId: string, _method: MfaMethod): Promise<void> {}
}
