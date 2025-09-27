/**
 * Security Validation Utilities
 *
 * Common security validation patterns and utilities for NeonPro Platform.
 *
 * @version 2.0.0
 */

import { randomUUID, createHash } from '../crypto-utils'
import { SecurityResult, SECURITY_ERROR_CODES } from './security-interfaces'

/**
 * Common validation utilities for security operations
 */
export class SecurityValidator {
  /**
   * Validate IP address format
   * @param ip - The IP address string to validate
   * @returns true if the IP address is valid IPv4 format, false otherwise
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return ipv4Regex.test(ip)
  }

  /**
   * Extract IP subnet for mobile network tolerance
   * @param ip - The IP address to extract subnet from
   * @returns The first 3 octets of the IP address (subnet) or empty string if invalid
   */
  static extractIPSubnet(ip: string): string {
    if (!this.isValidIP(ip)) return ''
    const parts = ip.split('.')
    return parts.slice(0, 3).join('.')
  }

  /**
   * Validate session ID format and entropy
   * @param sessionId - The session ID to validate (must be 32-character hex string)
   * @returns SecurityResult indicating validation success/failure with severity level
   */
  static validateSessionId(sessionId: string): SecurityResult {
    // Check format (32 character hex string)
    if (!/^[a-f0-9]{32}$/i.test(sessionId)) {
      return {
        success: false,
        error: 'Invalid session ID format',
        errorCode: SECURITY_ERROR_CODES.VALIDATION_FAILED,
        severity: 'medium',
      }
    }

    // Check entropy
    const entropy = this.calculateEntropy(sessionId)
    if (entropy < 3.5) {
      return {
        success: false,
        error: 'Session ID entropy too low',
        errorCode: SECURITY_ERROR_CODES.VALIDATION_FAILED,
        severity: 'medium',
      }
    }

    return { success: true, severity: 'low' }
  }

  /**
   * Calculate entropy of a string
   * @param str - The input string to calculate entropy for
   * @returns The Shannon entropy value (higher values indicate more randomness)
   */
  static calculateEntropy(str: string): number {
    const chars = str.split('')
    const charCounts: { [key: string]: number } = {}

    chars.forEach(char => {
      charCounts[char] = (charCounts[char] || 0) + 1
    })

    const entropy = Object.values(charCounts).reduce((sum, count) => {
      const probability = count / chars.length
      return sum - probability * Math.log2(probability)
    }, 0)

    return entropy
  }

  /**
   * Generate secure random token with specified length
   * @param length - The desired length of the token (default: 32)
   * @returns A cryptographically secure random token string
   */
  static generateSecureToken(length: number = 32): string {
    return randomUUID().replace(/-/g, '').substring(0, length)
  }

  /**
   * Generate secure nonce
   * @param length - The desired length of the nonce (default: 16)
   * @returns A random alphanumeric nonce string
   */
  static generateNonce(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Hash data for comparison
   * @param data - The data string to hash
   * @returns SHA-256 hex-encoded hash of the input data
   */
  static hashData(data: string): string {
    return createHash('sha256').update(data, 'utf8').digest('hex')
  }

  /**
   * Compare hashed data with plaintext
   * @param plaintext - The plaintext data to compare
   * @param hash - The hash to compare against
   * @returns true if the plaintext hash matches the provided hash, false otherwise
   */
  static compareHash(plaintext: string, hash: string): boolean {
    return this.hashData(plaintext) === hash
  }
}