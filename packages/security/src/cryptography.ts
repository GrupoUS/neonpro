/* eslint-disable no-restricted-imports */
import * as crypto from 'crypto'

/**
 * Cryptography Manager for NeonPro healthcare platform
 * Provides cryptographic operations for audit logging and security
 * @version 1.0.0
 */

export interface CryptographyManager {
  generateSecureBytes(length: number): Buffer
  hash(data: string, options?: { iterations: number }): { hash: string; salt?: string }
}

export interface HashResult {
  hash: string
  salt?: string
}

/**
 * Cryptography Manager implementation
 */
export class CryptographyManagerImpl implements CryptographyManager {
  constructor() {
    // Initialize with default encryption manager if needed
  }

  /**
   * Generate cryptographically secure random bytes
   * @param length Number of bytes to generate
   * @returns Buffer with random bytes
   */
  generateSecureBytes(length: number): Buffer {
    return crypto.randomBytes(length)
  }

  /**
   * Hash data using SHA-256 with optional iterations
   * @param data Data to hash
   * @param options Hash options including iterations
   * @returns Hash result with hash and optional salt
   */
  hash(data: string, options: { iterations: number } = { iterations: 1 }): HashResult {
    if (options.iterations === 1) {
      // Simple hash for single iteration
      return {
        hash: crypto.createHash('sha256').update(data, 'utf8').digest('hex')
      }
    } else {
      // Multi-iteration hash with salt for security
      const salt = crypto.randomBytes(16).toString('hex')
      let hash = data

      for (let i = 0; i < options.iterations; i++) {
        hash = crypto.createHash('sha256').update(hash + salt, 'utf8').digest('hex')
      }

      return {
        hash,
        salt
      }
    }
  }
}

/**
 * Factory function to create cryptography manager
 * @returns CryptographyManager instance
 */
export function createCryptographyManager(): CryptographyManager {
  return new CryptographyManagerImpl()
}

// Export singleton instance for direct usage
export const cryptographyManager = createCryptographyManager()
