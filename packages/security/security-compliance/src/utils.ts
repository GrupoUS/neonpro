/**
 * Security utilities for NeonPro healthcare platform
 * Provides input sanitization, validation, and security helper functions
 * @version 1.0.0
 */

import { randomUUID } from 'crypto'

/**
 * Input sanitization utilities for preventing XSS and injection attacks
 */
// Type definitions for security utilities
type LogArgument = string | number | boolean | object | null | undefined
type SanitizedObject = Record<string, LogArgument>
type SanitizedLogArgument = LogArgument | SanitizedObject

export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS attacks
   * @param input The input string to sanitize
   * @returns Sanitized string
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }

    // Remove potentially dangerous characters
    return input
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Sanitize HTML content to prevent XSS
   * @param html The HTML content to sanitize
   * @returns Sanitized HTML string
   */
  static sanitizeHTML(html: string): string {
    if (typeof html !== 'string') {
      return ''
    }

    // Remove script tags and event handlers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
  }

  /**
   * Validate and sanitize email addresses
   * @param email The email to validate
   * @returns Sanitized email or empty string if invalid
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') {
      return ''
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return ''
    }

    return email.toLowerCase().trim()
  }

  /**
   * Sanitize phone numbers (Brazilian format)
   * @param phone The phone number to sanitize
   * @returns Sanitized phone number
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') {
      return ''
    }

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')

    // Validate Brazilian phone number length
    if (digitsOnly.length === 10 || digitsOnly.length === 11) {
      return digitsOnly
    }

    return ''
  }

  /**
   * Sanitize CPF (Brazilian tax ID)
   * @param cpf The CPF to sanitize
   * @returns Sanitized CPF or empty string if invalid
   */
  static sanitizeCPF(cpf: string): string {
    if (typeof cpf !== 'string') {
      return ''
    }

    // Remove all non-digit characters
    const digitsOnly = cpf.replace(/\D/g, '')

    // Validate CPF length
    if (digitsOnly.length !== 11) {
      return ''
    }

    return digitsOnly
  }

  /**
   * Validate CPF using the official algorithm
   * @param cpf The CPF to validate
   * @returns True if CPF is valid
   */
  static validateCPF(cpf: string): boolean {
    const sanitized = this.sanitizeCPF(cpf)
    if (!sanitized) {
      return false
    }

    // Check if all digits are the same (invalid CPF)
    if (/^(\d)\1{10}$/.test(sanitized)) {
      return false
    }

    // Calculate first verification digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(sanitized[i] || '0') * (10 - i)
    }
    let remainder = (sum * 10) % 11
    const digit1 = remainder === 10 ? 0 : remainder

    // Calculate second verification digit
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(sanitized[i] || '0') * (11 - i)
    }
    remainder = (sum * 10) % 11
    const digit2 = remainder === 10 ? 0 : remainder

    // Check if verification digits match
    return (
      parseInt(sanitized[9] || '0') === digit1 && parseInt(sanitized[10] || '0') === digit2
    )
  }

  /**
   * Sanitize RG (Brazilian ID)
   * @param rg The RG to sanitize
   * @returns Sanitized RG
   */
  static sanitizeRG(rg: string): string {
    if (typeof rg !== 'string') {
      return ''
    }

    // Remove all non-digit and non-X characters
    return rg.replace(/[^0-9X]/gi, '').toUpperCase()
  }

  /**
   * Generate secure random token
   * @param length Token length in bytes
   * @returns Hex-encoded random token
   */
  static generateToken(length: number = 32): string {
    return randomUUID().replace(/-/g, '').substring(0, length)
  }

  /**
   * Generate secure random nonce
   * @param length Nonce length
   * @returns Random nonce string
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
   * Check for common attack patterns in input
   * @param input The input to check
   * @returns True if suspicious patterns are found
   */
  static containsSuspiciousPatterns(input: string): boolean {
    if (typeof input !== 'string') {
      return false
    }

    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /onfocus=/i,
      /onblur=/i,
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
      /delete.*from/i,
      /update.*set/i,
      /exec\(/i,
      /eval\(/i,
      /system\(/i,
      /shell_exec\(/i,
      /\.\.\//i, // Path traversal
      /\/etc\/passwd/i,
      /cmd\.exe/i,
      /powershell/i,
      /bash/i,
    ]

    return suspiciousPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Mask sensitive data for logging and display
   * @param data The data to mask
   * @param maskChar Character to use for masking (default: '*')
   * @returns Masked data
   */
  static maskSensitiveData(data: string, maskChar: string = '*'): string {
    if (typeof data !== 'string' || data.length === 0) {
      return ''
    }

    // Don't mask very short strings
    if (data.length <= 4) {
      return maskChar.repeat(data.length)
    }

    // Show first 2 and last 2 characters, mask the rest
    const firstTwo = data.substring(0, 2)
    const lastTwo = data.substring(data.length - 2)
    const maskedLength = data.length - 4
    const masked = maskChar.repeat(maskedLength)

    return `${firstTwo}${masked}${lastTwo}`
  }

  /**
   * Validate password strength
   * @param password The password to validate
   * @returns Object with validation result and score
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (typeof password !== 'string') {
      return {
        isValid: false,
        score: 0,
        feedback: ['Password must be a string'],
      }
    }

    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score += 2
    }

    // Contains lowercase
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain lowercase letters')
    } else {
      score += 1
    }

    // Contains uppercase
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain uppercase letters')
    } else {
      score += 1
    }

    // Contains numbers
    if (!/\d/.test(password)) {
      feedback.push('Password must contain numbers')
    } else {
      score += 1
    }

    // Contains special characters
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain special characters')
    } else {
      score += 1
    }

    // No common patterns
    const commonPatterns = [
      /password/i,
      /123456/,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i,
      /welcome/i,
    ]

    if (commonPatterns.some(pattern => pattern.test(password))) {
      feedback.push('Password contains common patterns')
      score -= 1
    }

    return {
      isValid: score >= 5,
      score: Math.max(0, score),
      feedback,
    }
  }

  /**
   * Generate secure password
   * @param length Password length (default: 12)
   * @returns Generated secure password
   */
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    const allChars = lowercase + uppercase + numbers + special
    let password = ''

    // Ensure at least one character from each category
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += special.charAt(Math.floor(Math.random() * special.length))

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('')
  }
}

/**
 * Rate limiting utilities for preventing brute force attacks
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()

  /**
   * Check if request is allowed
   * @param key Identifier for rate limiting (IP, userId, etc.)
   * @param maxAttempts Maximum allowed attempts
   * @param windowMs Time window in milliseconds
   * @returns True if request is allowed
   */
  isAllowed(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60000,
  ): boolean {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  /**
   * Get remaining attempts for a key
   * @param key Identifier to check
   * @param maxAttempts Maximum allowed attempts
   * @param _windowMs Time window in milliseconds (currently unused in this method)
   * @returns Number of remaining attempts
   */
  getRemainingAttempts(
    key: string,
    maxAttempts: number = 5,
    _windowMs: number = 60000,
  ): number {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record || now > record.resetTime) {
      return maxAttempts
    }

    return Math.max(0, maxAttempts - record.count)
  }

  /**
   * Reset rate limiting for a key
   * @param key Identifier to reset
   */
  reset(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Clean up expired records
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

/**
 * Secure logging utilities that sanitize sensitive data before logging
 * Prevents logging of credentials, SQL queries, XSS payloads, and other sensitive data
 */
export class SecureLogger {
  /**
   * Initialize secure logging by replacing console methods with sanitized versions
   */
  static initialize(): void {
    // Import consoleManager dynamically to avoid circular dependencies
    const { consoleManager } = require('./console-manager')

    // Store original console methods before replacement
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    }

    // Create secure console methods
    const secureMethods = consoleManager.createSecureMethods((args: unknown[]) => {
      return args.map(arg => this.sanitizeLogArgument(arg as LogArgument))
    })

    // Replace console methods
    consoleManager.replaceMethods(secureMethods)

    // Store original console methods for restoration
    ;(SecureLogger as any).originalConsole = originalConsole
  }

  /**
   * Restore original console methods
   */
  static restore(): void {
    const originalConsole = (SecureLogger as any).originalConsole
    if (originalConsole) {
      // Directly restore the stored original methods
      console.log = originalConsole.log
      console.error = originalConsole.error
      console.warn = originalConsole.warn
      console.info = originalConsole.info
      console.debug = originalConsole.debug
    } else {
      // Fallback to console manager if no stored methods
      const { consoleManager } = require('./console-manager')
      consoleManager.restoreToOriginal()
    }
  }


  /**
   * Sanitize a single log argument
   */
  private static sanitizeLogArgument(arg: LogArgument): SanitizedLogArgument {
    if (typeof arg === 'string') {
      return this.sanitizeString(arg)
    } else if (typeof arg === 'object' && arg !== null) {
      return this.sanitizeObject(arg)
    }
    return arg
  }

  /**
   * Sanitize string content
   */
  private static sanitizeString(str: string): string {
    let sanitized = str

    // Mask database connection strings
    sanitized = sanitized.replace(
      /(postgresql|mysql|mongodb):\/\/([^:]+):([^@]+)@/gi,
      '$1://***:***@',
    )

    // Mask passwords in connection strings
    sanitized = sanitized.replace(/password=([^&\s]+)/gi, 'password=***')
    sanitized = sanitized.replace(/:([^@:@]+)@/g, ':***@')

    // Sanitize SQL injection patterns
    const sqlPatterns = [
      /DROP\s+TABLE/gi,
      /DELETE\s+FROM/gi,
      /INSERT\s+INTO/gi,
      /UPDATE\s+\w+\s+SET/gi,
      /UNION\s+SELECT/gi,
      /EXEC\s*\(/gi,
      /EVAL\s*\(/gi,
      /SYSTEM\s*\(/gi,
      /'\s*OR\s*'1'\s*=\s*'1'/gi,
      /'\s*OR\s*1\s*=\s*1/gi,
      /"\s*OR\s*"1"\s*=\s*"1"/gi,
      /;\s*DROP/gi,
      /;\s*SELECT/gi,
    ]

    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[SQL_QUERY_REDACTED]')
    })

    // Sanitize XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gis,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror[^>]*>/gi,
      /<svg[^>]*onload[^>]*>/gi,
      /<[^>]*on\w+\s*=[^>]*>/gi,
    ]

    xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[XSS_PAYLOAD_REDACTED]')
    })

    // Mask sensitive data patterns
    const sensitivePatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
      /\b\d{11}\b/g, // 11-digit numbers (potential CPF)
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
      /password[\s"':]*=[^\s"']*/gi,
      /secret[\s"':]*=[^\s"']*/gi,
      /token[\s"':]*=[^\s"']*/gi,
      /key[\s"':]*=[^\s"']*/gi,
      /api[_-]?key[\s"':]*=[^\s"']*/gi,
    ]

    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[SENSITIVE_DATA_REDACTED]')
    })

    return sanitized
  }

  /**
   * Sanitize object recursively
   */
  private static sanitizeObject(obj: LogArgument): SanitizedObject {
    if (obj === null || typeof obj !== 'object') {
      return obj as unknown as SanitizedObject
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeLogArgument(item)) as unknown as SanitizedObject
    }

    const sanitized: SanitizedObject = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Skip certain sensitive keys entirely
      if (this.isSensitiveKey(key)) {
        continue
      }

      sanitized[key] = this.sanitizeLogArgument(value as LogArgument)
    }

    return sanitized
  }

  /**
   * Check if a key is sensitive and should be redacted
   */
  private static isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'password',
      'secret',
      'token',
      'key',
      'authorization',
      'credential',
      'credit',
      'card',
      'cvv',
      'expiry',
      'ssn',
      'social',
      'security',
      'private',
      'confidential',
      'cpf',
      'rg',
      'cnh',
      'passport',
      'birthdate',
      'birthDate',
      'phone',
      'email',
      'address',
      'zip',
      'postal',
    ]

    return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))
  }
}

// Export singleton instances
export const securityUtils = SecurityUtils
export const rateLimiter = new RateLimiter()
export const secureLogger = SecureLogger