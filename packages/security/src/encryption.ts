/**
 * Encryption utilities for NeonPro healthcare platform
 * Provides AES-256 encryption for sensitive data at rest and in transit
 * @version 1.0.0
 */

import crypto from "crypto";

/**
 * Encryption Manager for handling sensitive data encryption/decryption
 * Implements AES-256-GCM for authenticated encryption
 */
export class EncryptionManager {
  private algorithm = "aes-256-gcm";
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 96 bits for GCM

  /**
   * Generate a secure random encryption key
   * @returns Base64 encoded encryption key
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString("base64");
  }

  /**
   * Validate if a key is properly formatted
   * @param key The key to validate
   * @returns True if key is valid
   */
  validateKey(key: string): boolean {
    try {
      const buffer = Buffer.from(key, "base64");
      return buffer.length === this.keyLength;
    } catch {
      return false;
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data Data to encrypt
   * @param key Base64 encoded encryption key
   * @returns Base64 encoded encrypted data with IV and auth tag
   */
  encryptData(data: string, key: string): string {
    if (!this.validateKey(key)) {
      throw new Error("Invalid encryption key");
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(key, "base64"),
      iv,
    );

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = (cipher as any).getAuthTag();

    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, "hex"),
      authTag,
    ]);

    return combined.toString("base64");
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encryptedData Base64 encoded encrypted data with IV and auth tag
   * @param key Base64 encoded encryption key
   * @returns Decrypted data
   */
  decryptData(encryptedData: string, key: string): string {
    if (!this.validateKey(key)) {
      throw new Error("Invalid encryption key");
    }

    const combined = Buffer.from(encryptedData, "base64");

    // Extract IV (first 16 bytes), auth tag (last 16 bytes), and encrypted data (middle)
    const iv = combined.subarray(0, this.ivLength);
    const authTag = combined.subarray(-16);
    const encrypted = combined.subarray(this.ivLength, -16);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(key, "base64"),
      iv,
    );
    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Encrypt specific fields in an object
   * @param obj Object to encrypt
   * @param key Encryption key
   * @param sensitiveFields Array of field names to encrypt
   * @returns Object with encrypted fields
   */
  encryptObject<T extends Record<string, any>>(
    obj: T,
    key: string,
    sensitiveFields: string[],
  ): T {
    const result = { ...obj } as T;

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === "string") {
        (result as any)[field] = this.encryptData(result[field], key);
      }
    }

    return result;
  }

  /**
   * Decrypt specific fields in an object
   * @param obj Object to decrypt
   * @param key Encryption key
   * @param sensitiveFields Array of field names to decrypt
   * @returns Object with decrypted fields
   */
  decryptObject<T extends Record<string, any>>(
    obj: T,
    key: string,
    sensitiveFields: string[],
  ): T {
    const result = { ...obj } as T;

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === "string") {
        try {
          (result as any)[field] = this.decryptData(result[field], key);
        } catch (error) {
          // Field might not be encrypted, leave as is
          console.warn(`Failed to decrypt field ${field}:`, error);
        }
      }
    }

    return result;
  }

  /**
   * Hash sensitive data for comparison purposes
   * @param data The data to hash
   * @returns SHA-256 hash of the data
   */
  hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Compare hashed data with plaintext
   * @param plaintext The plaintext data
   * @param hash The hash to compare against
   * @returns True if the plaintext matches the hash
   */
  compareHash(plaintext: string, hash: string): boolean {
    return this.hashData(plaintext) === hash;
  }
}

/**
 * Key management utilities for secure key storage and rotation
 */
export class KeyManager {
  private static instance: KeyManager;
  private keys: Map<string, string> = new Map();
  private keyMetadata: Map<string, { createdAt: Date; expiresAt?: Date }> =
    new Map();

  /**
   * Get singleton instance of KeyManager
   */
  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  /**
   * Store a key with optional expiration
   * @param keyId The identifier for the key
   * @param key The key value (base64 encoded)
   * @param expiresAt Optional expiration date
   */
  storeKey(keyId: string, key: string, expiresAt?: Date): void {
    this.keys.set(keyId, key);
    this.keyMetadata.set(keyId, {
      createdAt: new Date(),
      expiresAt,
    });
  }

  /**
   * Retrieve a key by ID
   * @param keyId The key identifier
   * @returns The key value or null if not found/expired
   */
  getKey(keyId: string): string | null {
    const key = this.keys.get(keyId);
    const metadata = this.keyMetadata.get(keyId);

    if (!key || !metadata) {
      return null;
    }

    // Check if key has expired
    if (metadata.expiresAt && new Date() > metadata.expiresAt) {
      this.keys.delete(keyId);
      this.keyMetadata.delete(keyId);
      return null;
    }

    return key;
  }

  /**
   * Remove a key from storage
   * @param keyId The key identifier
   */
  removeKey(keyId: string): void {
    this.keys.delete(keyId);
    this.keyMetadata.delete(keyId);
  }

  /**
   * List all stored key IDs
   * @returns Array of key identifiers
   */
  listKeys(): string[] {
    return Array.from(this.keys.keys());
  }

  /**
   * Rotate a key by creating a new one and marking the old for expiration
   * @param keyId The key identifier
   * @param ttl Time to live for the old key in seconds
   * @returns The new key value
   */
  rotateKey(keyId: string, ttl: number = 3600): string {
    const oldKey = this.getKey(keyId);
    const newKey = new EncryptionManager().generateKey();

    // Store new key
    this.storeKey(keyId, newKey);

    // Keep old key for TTL period
    if (oldKey) {
      const expiresAt = new Date(Date.now() + ttl * 1000);
      this.storeKey(`${keyId}_old`, oldKey, expiresAt);
    }

    return newKey;
  }

  /**
   * Clean up expired keys
   */
  cleanup(): void {
    const now = new Date();
    for (const [keyId, metadata] of this.keyMetadata.entries()) {
      if (metadata.expiresAt && now > metadata.expiresAt) {
        this.removeKey(keyId);
      }
    }
  }
}

// Export singleton instances
export const encryptionManager = new EncryptionManager();
export const keyManager = KeyManager.getInstance();
