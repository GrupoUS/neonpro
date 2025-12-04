/**
 * Data Encryption Service
 * Implements AES-256-GCM encryption for sensitive personal data (CPF, RG, etc.)
 * LGPD Article 46 - Security measures for personal data protection
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives an encryption key from a password using scrypt
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Gets encryption key from environment or generates one
 * WARNING: In production, use a proper key management service (AWS KMS, Azure Key Vault, etc.)
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('⚠️  ENCRYPTION_KEY not set! Using default key. DO NOT USE IN PRODUCTION!');
    return 'default-encryption-key-change-in-production-please-use-proper-kms';
  }

  return key;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns base64 encoded string with format: salt:iv:authTag:encryptedData
 *
 * @param plaintext - Data to encrypt (CPF, RG, etc.)
 * @returns Encrypted data as base64 string
 */
export function encryptPII(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    return '';
  }

  try {
    // Generate random salt and IV
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    // Derive key from password and salt
    const key = deriveKey(getEncryptionKey(), salt);

    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);

    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine all components: salt:iv:authTag:encryptedData
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'base64'),
    ]);

    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypts sensitive data encrypted with encryptPII
 *
 * @param ciphertext - Base64 encoded encrypted data
 * @returns Decrypted plaintext
 */
export function decryptPII(ciphertext: string): string {
  if (!ciphertext || ciphertext.trim() === '') {
    return '';
  }

  try {
    // Decode base64
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
    );
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

    // Derive key
    const key = deriveKey(getEncryptionKey(), salt);

    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Hashes data for comparison without storing plaintext
 * Useful for checking duplicates without decrypting
 */
export function hashPII(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    return '';
  }

  const salt = Buffer.from(getEncryptionKey());
  const hash = scryptSync(plaintext, salt, 32);
  return hash.toString('base64');
}

/**
 * Masks sensitive data for display (e.g., CPF: ***.***.***-12)
 *
 * @param data - Data to mask
 * @param type - Type of data (cpf, rg, phone, email)
 * @returns Masked string
 */
export function maskPII(data: string | null | undefined, type: 'cpf' | 'rg' | 'phone' | 'email'): string {
  if (!data) return 'Não informado';

  try {
    switch (type) {
      case 'cpf':
        // 123.456.789-01 -> ***.***.*89-01
        // Remove formatting first
        const cpfDigits = data.replace(/\D/g, '');
        if (cpfDigits.length === 11) {
          return `***.***.*${cpfDigits.substring(7, 9)}-${cpfDigits.substring(9)}`;
        }
        return '***.***.***-**';

      case 'rg':
        // 12.345.678-9 -> **.***.**8-9
        // Remove formatting and get last 2 characters
        const rgDigits = data.replace(/\D/g, '');
        if (rgDigits.length >= 2) {
          const lastTwo = rgDigits.slice(-2);
          return `**.***.**${lastTwo.substring(0, 1)}-${lastTwo.substring(1)}`;
        }
        return '**.***.**-*';

      case 'phone':
        // (11) 98765-4321 -> (11) ****-4321
        const phoneDigits = data.replace(/\D/g, '');
        if (phoneDigits.length === 11) {
          // Mobile: (11) 98765-4321
          return `(${phoneDigits.substring(0, 2)}) ****-${phoneDigits.substring(7)}`;
        }
        if (phoneDigits.length === 10) {
          // Landline: (11) 3456-7890
          return `(${phoneDigits.substring(0, 2)}) ****-${phoneDigits.substring(6)}`;
        }
        return '(**) ****-****';

      case 'email':
        // user@example.com -> u***@example.com
        const [username, domain] = data.split('@');
        if (!domain) return '***@***';
        const maskedUsername = username[0] + '***';
        return `${maskedUsername}@${domain}`;

      default:
        return '***';
    }
  } catch (error) {
    console.error('Masking error:', error);
    return '***';
  }
}

/**
 * Validates if data is properly encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data || data.trim() === '') {
    return false;
  }

  try {
    const combined = Buffer.from(data, 'base64');
    // Check minimum length: salt + iv + authTag + at least 1 byte of data
    return combined.length >= (SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH + 1);
  } catch {
    return false;
  }
}

/**
 * Encrypts multiple PII fields in an object
 */
export function encryptPIIFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value.trim() !== '') {
      result[field] = encryptPII(value) as any;
    }
  }

  return result;
}

/**
 * Decrypts multiple PII fields in an object
 */
export function decryptPIIFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string' && value.trim() !== '') {
      try {
        result[field] = decryptPII(value) as any;
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error);
        // Keep encrypted value if decryption fails
      }
    }
  }

  return result;
}

/**
 * Test encryption/decryption
 * Use this to verify encryption is working correctly
 */
export function testEncryption(): boolean {
  const testData = 'Test Sensitive Data 123';

  try {
    const encrypted = encryptPII(testData);
    const decrypted = decryptPII(encrypted);

    const success = testData === decrypted;

    if (success) {
      console.log('✅ Encryption test passed');
    } else {
      console.error('❌ Encryption test failed');
    }

    return success;
  } catch (error) {
    console.error('❌ Encryption test error:', error);
    return false;
  }
}
