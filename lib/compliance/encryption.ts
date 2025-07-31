/**
 * LGPD Compliance Framework - Data Encryption System
 * Sistema de criptografia para dados sensíveis LGPD
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 46 (Segurança dos Dados)
 */

import crypto from 'crypto';
import { z } from 'zod';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
  iterations: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  salt: string;
  algorithm: string;
  version: string;
}

export interface KeyDerivationOptions {
  password: string;
  salt: Buffer;
  iterations: number;
  keyLength: number;
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  SENSITIVE = 'sensitive' // LGPD sensitive data
}

export interface EncryptionMetadata {
  classification: DataClassification;
  purpose: string;
  retention: number; // days
  encrypted: boolean;
  algorithm: string;
  keyId: string;
  createdAt: Date;
  lastAccessed?: Date;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const EncryptedDataSchema = z.object({
  data: z.string(),
  iv: z.string(),
  tag: z.string(),
  salt: z.string(),
  algorithm: z.string(),
  version: z.string()
});

const EncryptionMetadataSchema = z.object({
  classification: z.nativeEnum(DataClassification),
  purpose: z.string().min(1),
  retention: z.number().positive(),
  encrypted: z.boolean(),
  algorithm: z.string(),
  keyId: z.string(),
  createdAt: z.date(),
  lastAccessed: z.date().optional()
});

// ============================================================================
// ENCRYPTION CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32, // 256 bits
  iterations: 100000 // PBKDF2 iterations
};

const ENCRYPTION_VERSION = '1.0';

// ============================================================================
// ENCRYPTION CLASS
// ============================================================================

export class LGPDEncryption {
  private config: EncryptionConfig;
  private masterKey: Buffer | null = null;

  constructor(config: Partial<EncryptionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // KEY MANAGEMENT
  // ============================================================================

  /**
   * Initialize master key from environment or generate new one
   */
  public initializeMasterKey(masterKeyHex?: string): void {
    if (masterKeyHex) {
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
    } else {
      // Get from environment variable
      const envKey = process.env.LGPD_MASTER_KEY;
      if (envKey) {
        this.masterKey = Buffer.from(envKey, 'hex');
      } else {
        throw new Error('Master key not provided and LGPD_MASTER_KEY not set');
      }
    }

    if (this.masterKey.length !== this.config.keyLength) {
      throw new Error(`Master key must be ${this.config.keyLength} bytes`);
    }
  }

  /**
   * Generate a new master key
   */
  public static generateMasterKey(keyLength: number = 32): string {
    return crypto.randomBytes(keyLength).toString('hex');
  }

  /**
   * Derive encryption key from master key and salt
   */
  private deriveKey(salt: Buffer): Buffer {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }

    return crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      this.config.iterations,
      this.config.keyLength,
      'sha256'
    );
  }

  /**
   * Generate data encryption key for specific context
   */
  public generateDataKey(context: string): { key: Buffer; keyId: string } {
    const contextSalt = crypto.createHash('sha256')
      .update(context)
      .digest();
    
    const key = this.deriveKey(contextSalt);
    const keyId = crypto.createHash('sha256')
      .update(key)
      .digest('hex')
      .substring(0, 16);

    return { key, keyId };
  }

  // ============================================================================
  // ENCRYPTION METHODS
  // ============================================================================

  /**
   * Encrypt sensitive data
   */
  public encrypt(
    plaintext: string,
    context: string = 'default',
    metadata?: Partial<EncryptionMetadata>
  ): EncryptedData {
    try {
      // Generate salt and derive key
      const salt = crypto.randomBytes(this.config.saltLength);
      const key = this.deriveKey(salt);

      // Generate IV
      const iv = crypto.randomBytes(this.config.ivLength);

      // Create cipher
      const cipher = crypto.createCipher(this.config.algorithm, key);
      cipher.setAAD(Buffer.from(context)); // Additional authenticated data

      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      const result: EncryptedData = {
        data: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt.toString('hex'),
        algorithm: this.config.algorithm,
        version: ENCRYPTION_VERSION
      };

      // Validate result
      EncryptedDataSchema.parse(result);

      return result;

    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decrypt(
    encryptedData: EncryptedData,
    context: string = 'default'
  ): string {
    try {
      // Validate input
      EncryptedDataSchema.parse(encryptedData);

      // Check version compatibility
      if (encryptedData.version !== ENCRYPTION_VERSION) {
        throw new Error(`Unsupported encryption version: ${encryptedData.version}`);
      }

      // Parse components
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');

      // Derive key
      const key = this.deriveKey(salt);

      // Create decipher
      const decipher = crypto.createDecipher(encryptedData.algorithm, key);
      decipher.setAAD(Buffer.from(context));
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // FIELD-LEVEL ENCRYPTION
  // ============================================================================

  /**
   * Encrypt object fields based on classification
   */
  public encryptFields(
    data: Record<string, any>,
    fieldClassifications: Record<string, DataClassification>,
    context: string = 'default'
  ): Record<string, any> {
    const result = { ...data };

    for (const [field, classification] of Object.entries(fieldClassifications)) {
      if (classification === DataClassification.SENSITIVE && data[field] !== undefined) {
        const fieldContext = `${context}.${field}`;
        result[field] = this.encrypt(String(data[field]), fieldContext);
        result[`${field}_encrypted`] = true;
        result[`${field}_classification`] = classification;
      }
    }

    return result;
  }

  /**
   * Decrypt object fields
   */
  public decryptFields(
    data: Record<string, any>,
    fieldClassifications: Record<string, DataClassification>,
    context: string = 'default'
  ): Record<string, any> {
    const result = { ...data };

    for (const [field, classification] of Object.entries(fieldClassifications)) {
      if (classification === DataClassification.SENSITIVE && 
          data[`${field}_encrypted`] === true &&
          data[field] !== undefined) {
        try {
          const fieldContext = `${context}.${field}`;
          result[field] = this.decrypt(data[field], fieldContext);
          delete result[`${field}_encrypted`];
          delete result[`${field}_classification`];
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Keep encrypted data if decryption fails
        }
      }
    }

    return result;
  }

  // ============================================================================
  // HASHING METHODS
  // ============================================================================

  /**
   * Create secure hash for data integrity
   */
  public hash(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256')
      .update(data + actualSalt)
      .digest('hex');
    
    return `${hash}:${actualSalt}`;
  }

  /**
   * Verify hash
   */
  public verifyHash(data: string, hash: string): boolean {
    try {
      const [expectedHash, salt] = hash.split(':');
      const actualHash = crypto.createHash('sha256')
        .update(data + salt)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedHash, 'hex'),
        Buffer.from(actualHash, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate secure random token
   */
  public generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create encryption metadata
   */
  public createMetadata(
    classification: DataClassification,
    purpose: string,
    retention: number,
    keyId: string
  ): EncryptionMetadata {
    const metadata: EncryptionMetadata = {
      classification,
      purpose,
      retention,
      encrypted: classification === DataClassification.SENSITIVE,
      algorithm: this.config.algorithm,
      keyId,
      createdAt: new Date()
    };

    // Validate metadata
    EncryptionMetadataSchema.parse(metadata);

    return metadata;
  }

  /**
   * Check if data should be encrypted based on classification
   */
  public shouldEncrypt(classification: DataClassification): boolean {
    return classification === DataClassification.SENSITIVE;
  }

  /**
   * Get encryption strength based on classification
   */
  public getEncryptionStrength(classification: DataClassification): 'none' | 'standard' | 'strong' {
    switch (classification) {
      case DataClassification.PUBLIC:
      case DataClassification.INTERNAL:
        return 'none';
      case DataClassification.CONFIDENTIAL:
        return 'standard';
      case DataClassification.RESTRICTED:
      case DataClassification.SENSITIVE:
        return 'strong';
      default:
        return 'none';
    }
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate encrypted data structure
   */
  public validateEncryptedData(data: any): data is EncryptedData {
    try {
      EncryptedDataSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate encryption metadata
   */
  public validateMetadata(metadata: any): metadata is EncryptionMetadata {
    try {
      EncryptionMetadataSchema.parse(metadata);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create LGPD encryption instance
 */
export function createLGPDEncryption(config?: Partial<EncryptionConfig>): LGPDEncryption {
  const encryption = new LGPDEncryption(config);
  encryption.initializeMasterKey();
  return encryption;
}

/**
 * Create encryption instance for testing
 */
export function createTestEncryption(): LGPDEncryption {
  const encryption = new LGPDEncryption();
  const testKey = LGPDEncryption.generateMasterKey();
  encryption.initializeMasterKey(testKey);
  return encryption;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LGPDEncryption;
export {
  DEFAULT_CONFIG as ENCRYPTION_CONFIG,
  ENCRYPTION_VERSION
};
