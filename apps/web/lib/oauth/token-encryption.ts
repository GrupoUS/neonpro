import crypto from 'node:crypto';

/**
 * Token Encryption Service for NeonPro OAuth Integration
 * Implements AES-256-GCM encryption for secure token storage
 * Based on security best practices from OAuth 2.0 specifications
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is always 16 bytes
const SALT_LENGTH = 64; // 64 bytes salt for key derivation
const _TAG_LENGTH = 16; // GCM authentication tag length
const KEY_LENGTH = 32; // 256 bits key

interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
  tag: string;
}

export class TokenEncryptionService {
  private static getEncryptionKey(): string {
    const key = process.env.OAUTH_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('OAUTH_ENCRYPTION_KEY environment variable is required');
    }
    if (key.length < 32) {
      throw new Error('OAUTH_ENCRYPTION_KEY must be at least 32 characters');
    }
    return key;
  }

  private static deriveKey(masterKey: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(masterKey, salt, 100_000, KEY_LENGTH, 'sha512');
  }

  /**
   * Encrypts sensitive token data using AES-256-GCM
   */
  static encryptToken(token: string): EncryptionResult {
    try {
      const masterKey = TokenEncryptionService.getEncryptionKey();
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      const key = TokenEncryptionService.deriveKey(masterKey, salt);

      const cipher = crypto.createCipher(ALGORITHM, key);
      cipher.setAAD(Buffer.from('neonpro-oauth-token'));

      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      throw new Error(
        `Token encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypts token data using stored encryption parameters
   */
  static decryptToken(encryptionData: EncryptionResult): string {
    try {
      const masterKey = TokenEncryptionService.getEncryptionKey();
      const salt = Buffer.from(encryptionData.salt, 'hex');
      const _iv = Buffer.from(encryptionData.iv, 'hex');
      const tag = Buffer.from(encryptionData.tag, 'hex');
      const key = TokenEncryptionService.deriveKey(masterKey, salt);

      const decipher = crypto.createDecipher(ALGORITHM, key);
      decipher.setAAD(Buffer.from('neonpro-oauth-token'));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptionData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(
        `Token decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Securely compares two strings to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generates a cryptographically secure random state parameter
   */
  static generateSecureState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates a secure nonce for CSRF protection
   */
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Validates encryption data format
   */
  static validateEncryptionData(data: any): data is EncryptionResult {
    return (
      typeof data === 'object' &&
      typeof data.encrypted === 'string' &&
      typeof data.iv === 'string' &&
      typeof data.salt === 'string' &&
      typeof data.tag === 'string'
    );
  }
}
