/**
 * Token Management Service
 *
 * Handles token blacklisting, refresh token rotation, and token lifecycle management
 * with healthcare compliance requirements.
 *
 * Features:
 * - Token blacklisting and revocation
 * - Refresh token rotation
 * - Token binding to prevent theft
 * - Session invalidation
 * - Audit logging for token operations
 *
 * @security_critical CVSS: 8.5
 * Compliance: LGPD, ANVISA, OWASP
 * @author AI Development Agent
 * @version 1.0.0
 */

import { Context } from 'hono'
import jwt from 'jsonwebtoken'
import { createAdminClient } from '../clients/supabase'
import { jwtValidator } from '../security/jwt-validator'

// Token management interfaces
interface TokenInfo {
  jti?: string
  sub: string
  type: 'access' | 'refresh'
  issuedAt: number
  expiresAt: number
  deviceId?: string
  ipAddress?: string
  userAgent?: string
}

interface RefreshTokenRotation {
  oldTokenHash: string
  newToken: string
  rotatedAt: number
  reason: string
}

interface TokenBinding {
  _userId: string
  deviceId: string
  fingerprint: string
  createdAt: number
  lastUsed: number
  isActive: boolean
}

/**
 * Token Management Service
 */
export class TokenManagementService {
  private tokenStore = new Map<string, TokenInfo>()
  private refreshTokens = new Map<string, string>() // token_hash -> user_id
  private tokenBindings = new Map<string, TokenBinding>() // user_id -> binding
  private rotationHistory: RefreshTokenRotation[] = []

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Blacklist a token (immediate revocation)
   */
  async blacklistToken(
    token: string,
    reason: string,
    ttlMs: number = 24 * 60 * 60 * 1000, // 24 hours default
    _context?: Context,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate token first to get payload
      const validationResult = await jwtValidator.validateToken(
        token,
        _context,
      )

      if (validationResult.isValid && validationResult._payload) {
        const payload = validationResult.payload

        // Add to JWT validator blacklist
        jwtValidator.addToBlacklist(payload.jti, payload.sub, reason, ttlMs)

        // Add to internal token store for tracking
        const tokenInfo: TokenInfo = {
          jti: payload.jti,
          sub: payload.sub,
          type: 'access',
          issuedAt: payload.iat || Math.floor(Date.now() / 1000),
          expiresAt: payload.exp || Math.floor(Date.now() / 1000) + 3600,
          ipAddress: context?.req.header('x-forwarded-for'),
          userAgent: context?.req.header('user-agent'),
        }

        this.tokenStore.set(payload.jti || token, tokenInfo)

        // Log the revocation for audit purposes
        await this.logTokenRevocation(tokenInfo, reason, _context)

        return { success: true }
      }

      // If token is invalid but we still want to blacklist it (hash-based)
      const tokenHash = this.hashToken(token)
      this.tokenStore.set(tokenHash, {
        sub: 'unknown',
        type: 'access',
        issuedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + ttlMs / 1000,
      })

      return { success: true }
    } catch {
      console.error('Token blacklisting error:', error)
      return { success: false, error: 'Failed to blacklist token' }
    }
  }

  /**
   * Blacklist all tokens for a user (full session revocation)
   */
  async blacklistUserTokens(
    _userId: string,
    reason: string,
    excludeCurrentToken?: string,
  ): Promise<{ success: boolean; revokedCount: number }> {
    try {
      let revokedCount = 0

      // Add user to JWT validator blacklist
      jwtValidator.addToBlacklist(undefined, userId, reason)

      // Find and blacklist all user tokens
      for (const [key, tokenInfo] of this.tokenStore.entries()) {
        if (tokenInfo.sub === _userId) {
          // Skip current token if specified
          if (excludeCurrentToken && key === excludeCurrentToken) {
            continue
          }

          const tokenInfoRevoked: TokenInfo = {
            ...tokenInfo,
            expiresAt: Math.floor(Date.now() / 1000), // Expire immediately
          }

          this.tokenStore.set(key, tokenInfoRevoked)
          revokedCount++
        }
      }

      // Clear refresh tokens for user
      for (const [tokenHash, uid] of this.refreshTokens.entries()) {
        if (uid === _userId) {
          this.refreshTokens.delete(tokenHash)
          revokedCount++
        }
      }

      // Clear token bindings for user
      this.tokenBindings.delete(userId)

      return { success: true, revokedCount }
    } catch {
      console.error('User token blacklisting error:', error)
      return { success: false, revokedCount: 0 }
    }
  }

  /**
   * Create refresh token with rotation support
   */
  async createRefreshToken(
    _userId: string,
    _context?: Context,
  ): Promise<{ token: string; expiresAt: number }> {
    try {
      const jti = crypto.randomUUID()
      const issuedAt = Math.floor(Date.now() / 1000)
      const expiresAt = issuedAt + 7 * 24 * 60 * 60 // 7 days

      const payload = {
        sub: userId,
        jti,
        type: 'refresh',
        iat: issuedAt,
        exp: expiresAt,
        aud: 'refresh',
      }

      const secret = process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET ||
        'refresh-secret'
      const token = jwt.sign(payload, secret, { algorithm: 'HS256' })

      // Store refresh token hash
      const tokenHash = this.hashToken(token)
      this.refreshTokens.set(tokenHash, _userId)

      // Create token binding for theft prevention
      await this.createTokenBinding(userId, _context)

      return { token, expiresAt }
    } catch {
      console.error('Refresh token creation error:', error)
      throw new Error('Failed to create refresh token')
    }
  }

  /**
   * Validate and rotate refresh token
   */
  async rotateRefreshToken(
    refreshToken: string,
    _context?: Context,
  ): Promise<{
    success: boolean
    newToken?: string
    error?: string
    rotationReason?: string
  }> {
    try {
      const tokenHash = this.hashToken(refreshToken)
      const userId = this.refreshTokens.get(tokenHash)

      if (!_userId) {
        return {
          success: false,
          error: 'Invalid or expired refresh token',
        }
      }

      // Validate refresh token
      const secret = process.env.JWT_REFRESH_SECRET ||
        process.env.JWT_SECRET ||
        'refresh-secret'
      const payload = jwt.verify(refreshToken, secret) as any

      // Verify token binding to prevent theft
      const bindingValid = await this.validateTokenBinding(userId, _context)
      if (!bindingValid) {
        // Potential token theft - blacklist all user tokens
        await this.blacklistUserTokens(
          userId,
          'Suspicious activity detected - possible token theft',
        )

        return {
          success: false,
          error: 'Token binding validation failed',
        }
      }

      // Check if rotation is needed (based on usage patterns)
      const rotationReason = this.shouldRotateToken(payload)

      if (rotationReason) {
        // Create new refresh token
        const { token: newToken } = await this.createRefreshToken(
          userId,
          _context,
        )

        // Blacklist old refresh token
        this.refreshTokens.delete(tokenHash)

        // Record rotation
        this.rotationHistory.push({
          oldTokenHash: tokenHash,
          newToken: this.hashToken(newToken),
          rotatedAt: Date.now(),
          reason: rotationReason,
        })

        return {
          success: true,
          newToken,
          rotationReason,
        }
      }

      return { success: true }
    } catch {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          error: 'Invalid refresh token',
        }
      }

      console.error('Refresh token rotation error:', error)
      return {
        success: false,
        error: 'Token rotation failed',
      }
    }
  }

  /**
   * Create token binding for theft prevention
   */
  private async createTokenBinding(
    _userId: string,
    _context?: Context,
  ): Promise<void> {
    try {
      const deviceId = context?.req.header('x-device-id') || 'unknown'
      const fingerprint = this.generateFingerprint(context)

      const binding: TokenBinding = {
        userId,
        deviceId,
        fingerprint,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        isActive: true,
      }

      this.tokenBindings.set(userId, binding)
    } catch {
      console.error('Token binding creation error:', error)
    }
  }

  /**
   * Validate token binding to prevent theft
   */
  private async validateTokenBinding(
    _userId: string,
    _context?: Context,
  ): Promise<boolean> {
    try {
      const binding = this.tokenBindings.get(userId)
      if (!binding || !binding.isActive) {
        return false
      }

      const currentFingerprint = this.generateFingerprint(context)
      const deviceId = context?.req.header('x-device-id') || 'unknown'

      // Check if device ID matches
      if (binding.deviceId !== deviceId && binding.deviceId !== 'unknown') {
        console.warn(
          `Device ID mismatch for user ${userId}: expected ${binding.deviceId}, got ${deviceId}`,
        )
        return false
      }

      // Check if fingerprint matches (with some tolerance for legitimate changes)
      const fingerprintSimilarity = this.calculateFingerprintSimilarity(
        binding.fingerprint,
        currentFingerprint,
      )

      if (fingerprintSimilarity < 0.7) {
        // 70% similarity threshold
        console.warn(
          `Fingerprint mismatch for user ${userId}: similarity ${fingerprintSimilarity}`,
        )
        return false
      }

      // Update last used time
      binding.lastUsed = Date.now()

      return true
    } catch {
      console.error('Token binding validation error:', error)
      return false
    }
  }

  /**
   * Generate device fingerprint for token binding
   */
  private generateFingerprint(_context?: Context): string {
    const userAgent = context?.req.header('user-agent') || ''
    const acceptLanguage = context?.req.header('accept-language') || ''
    const acceptEncoding = context?.req.header('accept-encoding') || ''

    // Simple fingerprint based on headers
    const fingerprintData = `${userAgent}:${acceptLanguage}:${acceptEncoding}`

    // Create hash (simple implementation for demo)
    let hash = 0
    for (let i = 0; i < fingerprintData.length; i++) {
      const char = fingerprintData.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16)
  }

  /**
   * Calculate similarity between two fingerprints
   */
  private calculateFingerprintSimilarity(
    fingerprint1: string,
    fingerprint2: string,
  ): number {
    if (fingerprint1 === fingerprint2) return 1.0

    // Simple similarity calculation based on common prefixes
    const minLength = Math.min(fingerprint1.length, fingerprint2.length)
    let commonChars = 0

    for (let i = 0; i < minLength; i++) {
      if (fingerprint1[i] === fingerprint2[i]) {
        commonChars++
      } else {
        break
      }
    }

    return commonChars / Math.max(fingerprint1.length, fingerprint2.length)
  }

  /**
   * Determine if token should be rotated
   */
  private shouldRotateToken(_payload: any): string | null {
    const now = Math.floor(Date.now() / 1000)
    const tokenAge = now - (payload.iat || now)

    // Rotate tokens older than 3 days
    if (tokenAge > 3 * 24 * 60 * 60) {
      return 'Token age exceeds rotation threshold'
    }

    // Rotate tokens that will expire soon (within 1 day)
    const timeToExpiry = (payload.exp || now + 3600) - now
    if (timeToExpiry < 24 * 60 * 60) {
      return 'Token nearing expiration'
    }

    return null
  }

  /**
   * Hash token for secure storage
   */
  private hashToken(token: string): string {
    // Simple hash implementation - in production, use proper cryptographic hash
    let hash = 0
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Log token revocation for audit purposes
   */
  private async logTokenRevocation(
    tokenInfo: TokenInfo,
    reason: string,
    _context?: Context,
  ): Promise<void> {
    try {
      const supabase = createAdminClient()

      await supabase.from('audit_events').insert({
        event_type: 'token_revocation',
        user_id: tokenInfo.sub,
        resource_type: 'token',
        resource_id: tokenInfo.jti,
        action: 'revoke',
        details: {
          reason,
          tokenType: tokenInfo.type,
          issuedAt: new Date(tokenInfo.issuedAt * 1000).toISOString(),
          expiresAt: new Date(tokenInfo.expiresAt * 1000).toISOString(),
          ipAddress: tokenInfo.ipAddress,
          userAgent: tokenInfo.userAgent,
        },
        ip_address: context?.req.header('x-forwarded-for'),
        user_agent: context?.req.header('user-agent'),
      })
    } catch {
      console.error('Audit logging error:', error)
      // Don't fail the operation if audit logging fails
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Math.floor(Date.now() / 1000)

    // Clean expired tokens
    for (const [key, tokenInfo] of this.tokenStore.entries()) {
      if (tokenInfo.expiresAt <= now) {
        this.tokenStore.delete(key)
      }
    }

    // Clean old rotation history (keep last 1000 entries)
    if (this.rotationHistory.length > 1000) {
      this.rotationHistory = this.rotationHistory.slice(-1000)
    }

    // Clean JWT validator rate limits
    jwtValidator.cleanupRateLimit()
  }

  /**
   * Get token statistics (for monitoring)
   */
  getStatistics(): {
    activeTokens: number
    activeRefreshTokens: number
    activeBindings: number
    rotationHistorySize: number
  } {
    return {
      activeTokens: this.tokenStore.size,
      activeRefreshTokens: this.refreshTokens.size,
      activeBindings: this.tokenBindings.size,
      rotationHistorySize: this.rotationHistory.length,
    }
  }

  /**
   * Check if token is blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    try {
      const tokenHash = this.hashToken(token)
      return this.tokenStore.has(tokenHash)
    } catch {
      return false
    }
  }
}

// Global token management service instance
export const tokenManagementService = new TokenManagementService()
