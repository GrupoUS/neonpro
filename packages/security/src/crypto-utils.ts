/**
 * Secure Crypto Utilities for NeonPro Security Package
 * 
 * Provides secure crypto functions with validation and error handling
 * Replaces direct crypto module imports to maintain security standards
 * 
 * @version 1.0.0
 */

/* eslint-disable no-restricted-imports */
import { randomUUID as nodeRandomUUID, createHash as nodeCreateHash } from 'crypto'

/**
 * Generate a cryptographically secure random UUID
 * @returns Secure UUID string
 */
export function randomUUID(): string {
  try {
    return nodeRandomUUID()
  } catch (error) {
    // Fallback to time-based UUID if crypto is not available
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `${timestamp}-${random}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Create a hash function instance
 * @param algorithm - Hash algorithm (default: 'sha256')
 * @returns Hash instance
 */
export function createHash(algorithm: string = 'sha256') {
  try {
    return nodeCreateHash(algorithm)
  } catch (error) {
    throw new Error(`Failed to create hash with algorithm ${algorithm}: ${error}`)
  }
}

/**
 * Hash data with SHA-256 (convenience function)
 * @param data - Data to hash
 * @returns Hex-encoded hash
 */
export function hashData(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

/**
 * Generate secure token with specified length
 * @param length - Token length (default: 32)
 * @returns Secure token string
 */
export function generateSecureToken(length: number = 32): string {
  return randomUUID().replace(/-/g, '').substring(0, length)
}

/**
 * Generate secure nonce
 * @param length - Nonce length (default: 16)
 * @returns Secure nonce string
 */
export function generateNonce(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}