/**
 * Supabase Authentication Adapter
 *
 * Adapts our AuthService to work with existing NeonPro database structure:
 * - profiles (main user table)
 * - active_user_sessions (session management)
 * - security_events (audit logging)
 */

import type { SupabaseClient, } from '@supabase/supabase-js'
import { createClient, } from '@supabase/supabase-js'
import * as jose from 'jose'
import nodeCrypto from 'node:crypto'

// Production-grade crypto implementation with fallbacks
const cryptoShim = {
  randomBytes: (size: number,): Uint8Array => {
    // Try Web Crypto API first (available in modern browsers and Node.js)
    const g = globalThis as any
    if (g?.crypto?.getRandomValues) {
      const array = new Uint8Array(size,)
      g.crypto.getRandomValues(array,)
      return array
    }

    // Use Node.js crypto as fallback (server-side)
    return new Uint8Array(nodeCrypto.randomBytes(size,),)
  },
  randomUUID: (): string => {
    // Try Web Crypto API first
    const g = globalThis as any
    if (g?.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID()
    }

    // Use Node.js crypto
    if (typeof nodeCrypto.randomUUID === 'function') {
      return nodeCrypto.randomUUID()
    }

    // RFC4122 v4 generator using secure random bytes
    const bytes = cryptoShim.randomBytes(16,)
    // Per RFC 4122 section 4.4
    bytes[6] = (bytes[6] & 0x0F) | 0x40 // version 4
    bytes[8] = (bytes[8] & 0x3F) | 0x80 // variant 10xxxxxx
    const toHex = (b: Uint8Array,) =>
      Array.from(b,).map((v,) => v.toString(16,).padStart(2, '0',)).join('',)
    const hex = toHex(bytes,)
    return `${hex.slice(0, 8,)}-${hex.slice(8, 12,)}-${hex.slice(12, 16,)}-${hex.slice(16, 20,)}-${
      hex.slice(20,)
    }`
  },
} as const

// Production-grade JWT implementation with security features
const jwt = {
  sign: async (
    payload: Record<string, unknown>,
    secret: string,
    options?: { expiresIn?: string },
  ): Promise<string> => {
    const secretKey = new TextEncoder().encode(secret,)

    try {
      // Use jose library for secure JWT handling
      return await new jose.SignJWT(payload as jose.JWTPayload,)
        .setProtectedHeader({ alg: 'HS256', },)
        .setIssuedAt()
        .setExpirationTime(options?.expiresIn || '1h',)
        .sign(secretKey,)
    } catch (error) {
      throw new Error(
        `JWT signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  },
  verify: async (token: string, secret: string,) => {
    const secretKey = new TextEncoder().encode(secret,)

    try {
      // Use jose library for secure JWT verification
      return await jose.jwtVerify(token, secretKey,)
    } catch (error) {
      throw new Error(
        `JWT verification failed: ${error instanceof Error ? error.message : 'Invalid token'}`,
      )
    }
  },
}

export interface AuthConfig {
  serviceName: string
  version: string
  jwtSecret: string
  jwtExpiresIn: string
  refreshTokenExpiresIn: string
  maxLoginAttempts: number
  sessionTimeout: number
}

export interface LoginCredentials {
  email: string
  password: string
  mfaCode?: string
  deviceInfo?: DeviceInfo
}

export interface DeviceInfo {
  userAgent: string
  ip: string
  fingerprint: string
  trusted: boolean
}

export interface LoginResult {
  success: boolean
  user?: User
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  requiresMfa?: boolean
  error?: string
}

export interface User {
  id: string
  email: string
  fullName: string
  role: string
  permissions: Record<string, unknown>
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt?: Date
}

export interface AuthSession {
  id: string
  sessionId: string
  userId: string
  deviceInfo: DeviceInfo
  startedAt: Date
  lastActivity: Date
  expiresAt: Date
  isActive: boolean
}

export class SupabaseAuthAdapter {
  private supabase: SupabaseClient
  private config: AuthConfig

  constructor(supabaseUrl: string, supabaseKey: string, config: AuthConfig,) {
    this.supabase = createClient(supabaseUrl, supabaseKey,)
    this.config = config
  }

  /**
   * Authenticate user using existing profiles table + Supabase Auth
   */
  async login(credentials: LoginCredentials,): Promise<LoginResult> {
    try {
      // First, try Supabase Auth sign-in
      const { data: authResult, error: authError, } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      },)

      if (authError || !authResult.user) {
        await this.logSecurityEvent('failed_login', {
          email: credentials.email,
          reason: 'invalid_credentials',
          ip: credentials.deviceInfo?.ip || '',
          error: authError?.message,
        },)
        return { success: false, error: 'Invalid credentials', }
      }

      // Fetch profile data from profiles table
      const { data: profile, error: profileError, } = await this.supabase
        .from('profiles',)
        .select('*',)
        .eq('id', authResult.user.id,)
        .eq('is_active', true,)
        .maybeSingle()

      if (profileError || !profile) {
        await this.logSecurityEvent('failed_login', {
          userId: authResult.user.id,
          email: credentials.email,
          reason: 'profile_not_found',
          ip: credentials.deviceInfo?.ip || '',
        },)
        return { success: false, error: 'User profile not found', }
      }

      // Check if account is locked
      if (profile.account_locked_until && new Date(profile.account_locked_until,) > new Date()) {
        return { success: false, error: 'Account temporarily locked', }
      }

      // Check MFA if enabled
      if (profile.mfa_enabled && !credentials.mfaCode) {
        return {
          success: false,
          requiresMfa: true,
          error: 'MFA code required',
        }
      }

      // Create session in active_user_sessions table
      const session = await this.createSession(profile, credentials.deviceInfo,)

      // Update last login and clear failed attempts
      await this.supabase
        .from('profiles',)
        .update({
          last_login_at: new Date().toISOString(),
          failed_login_attempts: 0,
          account_locked_until: null,
        },)
        .eq('id', profile.id,)

      // Generate tokens
      const accessToken = await this.generateAccessToken(profile, session.sessionId,)
      const refreshToken = await this.generateRefreshToken(profile.id, session.sessionId,)

      // Log successful login
      await this.logSecurityEvent('login_success', {
        userId: profile.id,
        sessionId: session.sessionId,
        ip: credentials.deviceInfo?.ip || '',
        userAgent: credentials.deviceInfo?.userAgent || '',
      },)

      return {
        success: true,
        user: this.mapProfileToUser(profile,),
        accessToken,
        refreshToken,
        sessionId: session.sessionId,
      }
    } catch {
      // // console.error("Login error:", error);
      return { success: false, error: 'Authentication service error', }
    }
  }

  /**
   * Register new user using Supabase Auth + profiles table
   */
  async register(userData: {
    email: string
    password: string
    fullName: string
    role?: string
  },): Promise<LoginResult> {
    try {
      // Sign up with Supabase Auth
      const { data: authResult, error: authError, } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      },)

      if (authError || !authResult.user) {
        return { success: false, error: authError?.message || 'Registration failed', }
      }

      // Create profile record
      const { error: profileError, } = await this.supabase
        .from('profiles',)
        .insert({
          id: authResult.user.id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role || 'patient',
          is_active: true,
          mfa_enabled: false,
          failed_login_attempts: 0,
          lgpd_consent_given: true, // Required for Brazilian compliance
          lgpd_consent_date: new Date().toISOString(),
        },)

      if (profileError) {
        // // console.error("Profile creation error:", profileError);
        return { success: false, error: 'Failed to create user profile', }
      }

      // Log registration
      await this.logSecurityEvent('user_registered', {
        userId: authResult.user.id,
        email: userData.email,
        role: userData.role || 'patient',
      },)

      return {
        success: true,
        error: 'Registration successful. Please check your email for confirmation.',
      }
    } catch {
      // // console.error("Registration error:", error);
      return { success: false, error: 'Registration service error', }
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(sessionId: string,): Promise<void> {
    try {
      // Update active_user_sessions
      await this.supabase
        .from('active_user_sessions',)
        .update({
          is_active: false,
          terminated_at: new Date().toISOString(),
          terminated_reason: 'user_logout',
        },)
        .eq('session_id', sessionId,)

      // Sign out from Supabase Auth
      await this.supabase.auth.signOut()

      // Log security event
      await this.logSecurityEvent('logout', { sessionId, },)
    } catch {
      // // console.error("Logout error:", error);
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser, }, } = await this.supabase.auth.getUser()

      if (!authUser) return null

      const { data: profile, } = await this.supabase
        .from('profiles',)
        .select('*',)
        .eq('id', authUser.id,)
        .eq('is_active', true,)
        .maybeSingle()

      return profile ? this.mapProfileToUser(profile,) : null
    } catch {
      // // console.error("Get current user error:", error);
      return null
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string,): Promise<LoginResult> {
    try {
      const { data, error, } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      },)

      if (error || !data.user) {
        return { success: false, error: 'Invalid refresh token', }
      }

      const { data: profile, } = await this.supabase
        .from('profiles',)
        .select('*',)
        .eq('id', data.user.id,)
        .eq('is_active', true,)
        .single()

      if (!profile) {
        return { success: false, error: 'User profile not found', }
      }

      // Update last activity
      await this.supabase
        .from('active_user_sessions',)
        .update({ last_activity: new Date().toISOString(), },)
        .eq('user_id', profile.id,)
        .eq('is_active', true,)

      return {
        success: true,
        user: this.mapProfileToUser(profile,),
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      }
    } catch {
      // // console.error("Refresh token error:", error);
      return { success: false, error: 'Token refresh failed', }
    }
  }

  /**
   * Create session in active_user_sessions table
   */
  private async createSession(profile: any, deviceInfo?: DeviceInfo,): Promise<AuthSession> {
    const sessionId = `session_${cryptoShim.randomUUID()}`
    const expiresAt = new Date(Date.now() + this.config.sessionTimeout,)

    const sessionData = {
      session_id: sessionId,
      user_id: profile.id,
      user_email: profile.email,
      user_role: profile.role,
      ip_address: deviceInfo?.ip || '127.0.0.1',
      user_agent: deviceInfo?.userAgent || '',
      device_fingerprint: deviceInfo?.fingerprint || '',
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true,
      privileged_actions_count: 0,
      suspicious_activity_detected: false,
    }

    const { data, error, } = await this.supabase
      .from('active_user_sessions',)
      .insert(sessionData,)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`,)
    }

    return {
      id: data.id,
      sessionId: sessionId,
      userId: profile.id,
      deviceInfo: deviceInfo || {
        userAgent: '',
        ip: '127.0.0.1',
        fingerprint: '',
        trusted: false,
      },
      startedAt: new Date(data.started_at,),
      lastActivity: new Date(data.last_activity,),
      expiresAt: expiresAt,
      isActive: true,
    }
  }

  /**
   * Generate JWT access token
   */
  private async generateAccessToken(profile: any, sessionId: string,): Promise<string> {
    const payload = {
      userId: profile.id,
      email: profile.email,
      role: profile.role,
      permissions: profile.permissions || {},
      sessionId,
      iat: Math.floor(Date.now() / 1000,),
      exp: Math.floor(Date.now() / 1000,) + this.parseTimeToSeconds(this.config.jwtExpiresIn,),
    }

    return jwt.sign(payload, this.config.jwtSecret,)
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(userId: string, sessionId: string,): Promise<string> {
    const payload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000,),
      exp: Math.floor(Date.now() / 1000,)
        + this.parseTimeToSeconds(this.config.refreshTokenExpiresIn,),
    }

    return jwt.sign(payload, this.config.jwtSecret,)
  }

  /**
   * Log security event to existing security_events table
   */
  private async logSecurityEvent(type: string, details: Record<string, unknown>,): Promise<void> {
    try {
      await this.supabase
        .from('security_events',)
        .insert({
          type,
          user_id: details.userId || null,
          ip: details.ip || null,
          user_agent: details.userAgent || null,
          details: details,
          risk_score: this.calculateRiskScore(type, details,),
        },)
    } catch {
      // // console.error("Failed to log security event:", error);
    }
  }

  /**
   * Map profiles table record to User interface
   */
  private mapProfileToUser(profile: any,): User {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name
        || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      role: profile.role,
      permissions: profile.permissions || {},
      isActive: profile.is_active,
      mfaEnabled: profile.mfa_enabled || false,
      lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at,) : undefined,
    }
  }

  /**
   * Calculate risk score for security events
   */
  private calculateRiskScore(type: string, details: Record<string, unknown>,): number {
    switch (type) {
      case 'failed_login':
        return details.reason === 'user_not_found' ? 3 : 5
      case 'login_success':
        return 1
      case 'logout':
        return 1
      case 'user_registered':
        return 2
      case 'account_locked':
        return 8
      default:
        return 3
    }
  }

  /**
   * Parse time string to seconds
   */
  private parseTimeToSeconds(timeString: string,): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86_400,
    }

    const match = timeString.match(/^(\d+)([smhd])$/,)
    if (!match) return 3600 // default 1 hour

    const [, value, unit,] = match
    return parseInt(value, 10,) * (units[unit] || 3600)
  }
}
