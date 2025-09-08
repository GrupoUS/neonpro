/**
 * Secure Cross-Platform Cryptography Utilities
 *
 * Provides secure crypto implementations for both Node.js and browser environments
 * Falls back gracefully and fails fast when no secure implementation is available
 *
 * @security Uses platform-native secure random number generators and crypto APIs
 * @compliance HIPAA, LGPD, ISO 27001 compliant cryptographic operations
 */

// Type definitions for crypto operations
export interface SecureRandomBytes {
  (size: number,): Buffer
}

export interface SecureRandomUUID {
  (): string
}

export interface SecureTimingSafeEqual {
  (a: Buffer, b: Buffer,): boolean
}

export interface SecureHMAC {
  update(data: Buffer | string,): SecureHMAC
  digest(encoding?: BufferEncoding,): Buffer | string
}

export interface SecureCreateHMAC {
  (algorithm: string, key: Buffer | string,): SecureHMAC
}

export interface SecureCrypto {
  randomBytes: SecureRandomBytes
  randomUUID: SecureRandomUUID
  timingSafeEqual: SecureTimingSafeEqual
  createHmac: SecureCreateHMAC
}

/**
 * Detect if running in Node.js environment
 */
function isNode(): boolean {
  return typeof process !== 'undefined'
    && process.versions != null
    && process.versions.node != null
}

/**
 * Detect if running in browser with Web Crypto API
 */
function hasWebCrypto(): boolean {
  return typeof globalThis !== 'undefined'
    && globalThis.crypto != null
    && typeof globalThis.crypto.getRandomValues === 'function'
}

/**
 * Secure random bytes implementation
 */
function createSecureRandomBytes(): SecureRandomBytes {
  if (isNode()) {
    // Use Node.js crypto
    const crypto = require('node:crypto',)
    return (size: number,): Buffer => {
      return crypto.randomBytes(size,)
    }
  } else if (hasWebCrypto()) {
    // Use Web Crypto API
    return (size: number,): Buffer => {
      const array = new Uint8Array(size,)
      globalThis.crypto.getRandomValues(array,)
      return Buffer.from(array,)
    }
  } else {
    // No secure implementation available - fail fast
    return (_size: number,): Buffer => {
      throw new Error(
        'No secure random number generator available. '
          + 'This application requires either Node.js crypto module or Web Crypto API.',
      )
    }
  }
}

/**
 * Secure UUID implementation
 */
function createSecureRandomUUID(): SecureRandomUUID {
  if (isNode()) {
    // Use Node.js crypto.randomUUID
    const crypto = require('node:crypto',)
    return (): string => {
      if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
      } else {
        // Fallback to manual UUID v4 generation for older Node versions
        return generateUUIDv4(createSecureRandomBytes(),)
      }
    }
  } else if (hasWebCrypto() && typeof globalThis.crypto.randomUUID === 'function') {
    // Use Web Crypto API randomUUID
    return (): string => {
      return globalThis.crypto.randomUUID()
    }
  } else if (hasWebCrypto()) {
    // Fallback to manual UUID v4 generation
    const secureRandomBytes = createSecureRandomBytes()
    return (): string => {
      return generateUUIDv4(secureRandomBytes,)
    }
  } else {
    // No secure implementation available - fail fast
    return (): string => {
      throw new Error(
        'No secure UUID generator available. '
          + 'This application requires either Node.js crypto module or Web Crypto API.',
      )
    }
  }
}

/**
 * Generate UUID v4 manually using secure random bytes
 */
function generateUUIDv4(randomBytes: SecureRandomBytes,): string {
  const bytes = randomBytes(16,)

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0F) | 0x40 // Version 4
  bytes[8] = (bytes[8] & 0x3F) | 0x80 // Variant 10

  const hex = bytes.toString('hex',)
  return [
    hex.slice(0, 8,),
    hex.slice(8, 12,),
    hex.slice(12, 16,),
    hex.slice(16, 20,),
    hex.slice(20, 32,),
  ].join('-',)
}

/**
 * Secure timing-safe comparison
 */
function createSecureTimingSafeEqual(): SecureTimingSafeEqual {
  if (isNode()) {
    // Use Node.js crypto.timingSafeEqual
    const crypto = require('node:crypto',)
    return (a: Buffer, b: Buffer,): boolean => {
      if (a.length !== b.length) {
        return false
      }
      return crypto.timingSafeEqual(a, b,)
    }
  } else {
    // Implement constant-time comparison for browsers
    return (a: Buffer, b: Buffer,): boolean => {
      // Incorporate length difference into the result to prevent timing leaks
      let result = a.length ^ b.length
      const maxLength = Math.max(a.length, b.length,)

      for (let i = 0; i < maxLength; i++) {
        const aVal = i < a.length ? a[i] : 0
        const bVal = i < b.length ? b[i] : 0
        result |= aVal ^ bVal
      }
      return result === 0
    }
  }
}

/**
 * Secure HMAC implementation
 */
function createSecureCreateHMAC(): SecureCreateHMAC {
  if (isNode()) {
    // Use Node.js crypto.createHmac
    const crypto = require('node:crypto',)
    return (algorithm: string, key: Buffer | string,): SecureHMAC => {
      const hmac = crypto.createHmac(algorithm, key,)
      return {
        update(data: Buffer | string,): SecureHMAC {
          hmac.update(data,)
          return this
        },
        digest(encoding?: BufferEncoding,): Buffer | string {
          return encoding ? hmac.digest(encoding,) : hmac.digest()
        },
      }
    }
  } else {
    // Browser environment - HMAC operations should be server-side for security
    return (_algorithm: string, _key: Buffer | string,): SecureHMAC => {
      throw new Error(
        'HMAC operations in browser environments are not supported for security reasons. '
          + 'Move TOTP/MFA operations to server-side API endpoints.',
      )
    }
  }
}

/**
 * Create secure crypto instance
 */
export function createSecureCrypto(): SecureCrypto {
  return {
    randomBytes: createSecureRandomBytes(),
    randomUUID: createSecureRandomUUID(),
    timingSafeEqual: createSecureTimingSafeEqual(),
    createHmac: createSecureCreateHMAC(),
  }
}

/**
 * Default secure crypto instance - ready to use
 */
export const secureCrypto = createSecureCrypto()

/**
 * Utility functions for common crypto operations
 */
export const cryptoUtils = {
  /**
   * Generate cryptographically secure random string
   */
  generateSecureToken(length: number = 32,): string {
    const bytes = secureCrypto.randomBytes(length,)
    return bytes.toString('base64url',).slice(0, length,)
  },

  /**
   * Generate secure password with specified character set
   */
  generateSecurePassword(length: number = 16,): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    const bytes = secureCrypto.randomBytes(length,)
    let result = ''

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length]
    }

    return result
  },

  /**
   * Create secure hash with salt
   */
  async createSecureHash(data: string, salt?: Buffer,): Promise<{ hash: string; salt: string }> {
    const actualSalt = salt || secureCrypto.randomBytes(32,)
    const hmac = secureCrypto.createHmac('sha256', actualSalt,)
    hmac.update(data,)
    const hash = await hmac.digest('base64',)

    return {
      hash: typeof hash === 'string' ? hash : hash.toString('base64',),
      salt: actualSalt.toString('base64',),
    }
  },
}

export default secureCrypto
