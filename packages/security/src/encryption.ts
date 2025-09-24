/**
 * Encryption utilities for NeonPro healthcare platform
 * Provides AES-256 encryption for sensitive data at rest and in transit
 * @version 1.0.0
 */

import * as crypto from 'crypto'

/**
 * Encryption Manager for handling sensitive data encryption/decryption
 * Implements AES-256-CBC for secure encryption
 */
export class EncryptionManager {
  private algorithm = 'aes-256-cbc'
  private keyLength = 32 // 256 bits
  private ivLength = 16 // 128 bits for CBC

  /**
   * Generate a secure random encryption key
   * @returns Base64 encoded encryption key
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('base64')
  }

  /**
   * Validate if a key is properly formatted
   * @param key The key to validate
   * @returns True if key is valid
   */
  validateKey(key: string): boolean {
    try {
      const buffer = Buffer.from(key, 'base64')
      return buffer.length === this.keyLength
    } catch {
      return false
    }
  }

  /**
   * Encrypt data using AES-256-CBC
   * @param data Data to encrypt
   * @param key Base64 encoded encryption key
   * @returns Base64 encoded encrypted data with IV
   */
  encryptData(data: string, key: string): string {
    if (!this.validateKey(key)) {
      throw new Error('Invalid encryption key')
    }

    const iv = crypto.randomBytes(this.ivLength)

    try {
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(key, 'base64'),
        iv,
      )

      let encrypted = cipher.update(data, 'utf8', 'binary')
      encrypted += cipher.final('binary')

      // Combine IV + encrypted data and encode as base64
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'binary')])
      return combined.toString('base64')
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   * @param encryptedData Base64 encoded encrypted data with IV
   * @param key Base64 encoded encryption key
   * @returns Decrypted data
   */
  decryptData(encryptedData: string, key: string): string {
    if (!this.validateKey(key)) {
      throw new Error('Invalid decryption key')
    }

    try {
      const combined = Buffer.from(encryptedData, 'base64')

      // Extract IV (first 16 bytes) and encrypted data (rest)
      const iv = combined.subarray(0, this.ivLength)
      const encrypted = combined.subarray(this.ivLength)

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(key, 'base64'),
        iv,
      )

      let decrypted = decipher.update(encrypted, 'binary', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error('Invalid encrypted data')
    }
  }

  /**
   * Decrypt data using AES-256-CBC
   * @param encryptedData Base64 encoded encrypted data with IV
   * @param key Base64 encoded encryption key
   * @returns Decrypted data
   */
  decryptDataWithKeyError(encryptedData: string, key: string): string {
    if (!this.validateKey(key)) {
      throw new Error('Invalid decryption key')
    }

    try {
      const combined = Buffer.from(encryptedData, 'base64')

      // Extract IV (first 16 bytes) and encrypted data (rest)
      const iv = combined.subarray(0, this.ivLength)
      const encrypted = combined.subarray(this.ivLength)

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(key, 'base64'),
        iv,
      )

      let decrypted = decipher.update(encrypted, 'binary', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error('Invalid encrypted data')
    }
  }

  /**
   * Encrypt specific fields in an object
   * @param obj Object to encrypt
   * @param key Encryption key
   * @param sensitiveFields Array of field names to encrypt
   * @returns Object with encrypted fields
   */
  encryptObject<T extends Record<string, unknown>>(
    obj: T,
    key: string,
    sensitiveFields: string[],
  ): T {
    const result = { ...obj } as T

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === 'string') {
        ;(result as Record<string, unknown>)[field] = this.encryptData(
          result[field] as string,
          key,
        )
      }
    }

    return result
  }

  /**
   * Decrypt specific fields in an object
   * @param obj Object to decrypt
   * @param key Encryption key
   * @param sensitiveFields Array of field names to decrypt
   * @returns Object with decrypted fields
   */
  decryptObject<T extends Record<string, unknown>>(
    obj: T,
    key: string,
    sensitiveFields: string[],
  ): T {
    const result = { ...obj } as T

    for (const field of sensitiveFields) {
      if (result[field] && typeof result[field] === 'string') {
        try {
          ;(result as Record<string, unknown>)[field] = this.decryptData(
            result[field] as string,
            key,
          )
        } catch (error) {
          // Field might not be encrypted, leave as is
          void error
          // Note: Decryption failures are expected for non-encrypted fields
        }
      }
    }

    return result
  }

  /**
   * Hash sensitive data for comparison purposes
   * @param data The data to hash
   * @returns SHA-256 hash of the data
   */
  hashData(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
  }

  /**
   * Compare hashed data with plaintext
   * @param plaintext The plaintext data
   * @param hash The hash to compare against
   * @returns True if the plaintext matches the hash
   */
  compareHash(plaintext: string, hash: string): boolean {
    return this.hashData(plaintext) === hash
  }
}

/**
 * Key management utilities for secure key storage and rotation
 */
export class KeyManager {
  private static instance: KeyManager
  private keys: Map<string, string> = new Map()
  private keyMetadata: Map<string, { createdAt: Date; expiresAt?: Date }> = new Map()

  /**
   * Get singleton instance of KeyManager
   */
  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager()
    }
    return KeyManager.instance
  }

  /**
   * Store a key with optional expiration
   * @param keyId The identifier for the key
   * @param key The key value (base64 encoded)
   * @param expiresAt Optional expiration date
   */
  storeKey(keyId: string, key: string, expiresAt?: Date): void {
    this.keys.set(keyId, key)
    this.keyMetadata.set(keyId, {
      createdAt: new Date(),
      expiresAt,
    })
  }

  /**
   * Retrieve a key by ID
   * @param keyId The key identifier
   * @returns The key value or null if not found/expired
   */
  getKey(keyId: string): string | null {
    const key = this.keys.get(keyId)
    const metadata = this.keyMetadata.get(keyId)

    if (!key || !metadata) {
      return null
    }

    // Check if key has expired
    if (metadata.expiresAt && new Date() > metadata.expiresAt) {
      this.keys.delete(keyId)
      this.keyMetadata.delete(keyId)
      return null
    }

    return key
  }

  /**
   * Remove a key from storage
   * @param keyId The key identifier
   */
  removeKey(keyId: string): void {
    this.keys.delete(keyId)
    this.keyMetadata.delete(keyId)
  }

  /**
   * List all stored key IDs
   * @returns Array of key identifiers
   */
  listKeys(): string[] {
    return Array.from(this.keys.keys())
  }

  /**
   * Rotate a key by creating a new one and marking the old for expiration
   * @param keyId The key identifier
   * @param ttl Time to live for the old key in seconds
   * @returns The new key value
   */
  rotateKey(keyId: string, ttl: number = 3600): string {
    const oldKey = this.getKey(keyId)
    const encryptionManager = new EncryptionManager()
    const newKey = encryptionManager.generateKey()

    // Store new key
    this.storeKey(keyId, newKey)

    // Keep old key for TTL period
    if (oldKey) {
      const expiresAt = new Date(Date.now() + ttl * 1000)
      this.storeKey(`${keyId}_old`, oldKey, expiresAt)
    }

    return newKey
  }

  /**
   * Clean up expired keys
   */
  cleanup(): void {
    const now = new Date()
    this.keyMetadata.forEach((metadata, keyId) => {
      if (metadata.expiresAt && now > metadata.expiresAt) {
        this.removeKey(keyId)
      }
    })
  }
}

// Export singleton instances
export const encryptionManager = new EncryptionManager()
export const keyManager = KeyManager.getInstance()
