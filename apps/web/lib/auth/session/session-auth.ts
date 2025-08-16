// =====================================================
// Session Authentication Service
// Story 1.4: Session Management & Security
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { DeviceManager } from './device-manager';
import { SecurityEventLogger } from './security-event-logger';
import { SessionManager } from './session-manager';
import { SessionNotificationService } from './session-notification-service';

// Types
export type SessionAuthConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  jwtSecret: string;
  enableDeviceTracking: boolean;
  enableLocationTracking: boolean;
  enableSecurityEvents: boolean;
  enableNotifications: boolean;
};

export type AuthenticationResult = {
  success: boolean;
  session?: SessionData;
  user?: UserData;
  error?: string;
  requiresMFA?: boolean;
  deviceRegistrationRequired?: boolean;
  securityWarnings?: string[];
};

export type SessionData = {
  id: string;
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent?: string;
  location?: LocationData;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  securityScore: number;
  metadata?: Record<string, any>;
};

export type UserData = {
  id: string;
  email: string;
  fullName?: string;
  role: 'owner' | 'manager' | 'staff' | 'patient';
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: Date;
};

export type LocationData = {
  country?: string;
  city?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
};

export type DeviceInfo = {
  fingerprint: string;
  name?: string;
  type?: string;
  browserInfo?: Record<string, any>;
  trusted: boolean;
};

// Session Authentication Service
export class SessionAuthService {
  private readonly supabase;
  private readonly sessionManager: SessionManager;
  private readonly deviceManager: DeviceManager;
  private readonly securityLogger: SecurityEventLogger;
  private readonly notificationService: SessionNotificationService;
  private readonly config: SessionAuthConfig;

  constructor(config: SessionAuthConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
    this.sessionManager = new SessionManager(this.supabase);
    this.deviceManager = new DeviceManager(this.supabase);
    this.securityLogger = new SecurityEventLogger(this.supabase);
    this.notificationService = new SessionNotificationService(this.supabase);
  }

  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  /**
   * Authenticate user with email and password
   */
  async authenticateWithPassword(
    email: string,
    password: string,
    deviceInfo: DeviceInfo,
    request: NextRequest,
  ): Promise<AuthenticationResult> {
    try {
      // Extract request metadata
      const ipAddress = this.extractIPAddress(request);
      const userAgent = request.headers.get('user-agent') || undefined;
      const location = await this.extractLocation(request);

      // Attempt Supabase authentication
      const { data: authData, error: authError } =
        await this.supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData.user) {
        await this.logSecurityEvent({
          userId: null,
          eventType: 'suspicious_login',
          severity: 'medium',
          details: {
            email,
            error: authError?.message,
            ipAddress,
            userAgent,
          },
          ipAddress,
          userAgent,
        });

        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Get user profile
      const userData = await this.getUserProfile(authData.user.id);
      if (!userData) {
        return {
          success: false,
          error: 'User profile not found',
        };
      }

      // Check if MFA is required
      if (userData.mfaEnabled && !authData.session?.access_token) {
        return {
          success: false,
          requiresMFA: true,
          error: 'MFA verification required',
        };
      }

      // Register or update device
      const deviceRegistration =
        await this.deviceManager.registerOrUpdateDevice(
          userData.id,
          deviceInfo,
          ipAddress,
        );

      // Check device trust status
      if (!deviceRegistration.trusted) {
        await this.logSecurityEvent({
          userId: userData.id,
          eventType: 'device_registration',
          severity: 'medium',
          details: {
            deviceFingerprint: deviceInfo.fingerprint,
            deviceName: deviceInfo.name,
            ipAddress,
            userAgent,
          },
          ipAddress,
          userAgent,
        });
      }

      // Calculate security score
      const securityScore = await this.calculateSecurityScore(
        userData.id,
        deviceInfo.fingerprint,
        ipAddress,
        location,
      );

      // Check concurrent session limits
      const canCreateSession =
        await this.sessionManager.checkConcurrentSessionLimit(
          userData.id,
          userData.role,
        );

      if (!canCreateSession) {
        // Enforce session limits by terminating oldest sessions
        await this.sessionManager.enforceSessionLimits(
          userData.id,
          userData.role,
        );
      }

      // Create new session
      const session = await this.sessionManager.createSession({
        userId: userData.id,
        deviceFingerprint: deviceInfo.fingerprint,
        ipAddress,
        userAgent,
        location,
        securityScore,
        userRole: userData.role,
      });

      // Log successful authentication
      await this.logSecurityEvent({
        userId: userData.id,
        sessionId: session.id,
        eventType: 'suspicious_login',
        severity: 'low',
        details: {
          sessionId: session.id,
          deviceFingerprint: deviceInfo.fingerprint,
          securityScore,
          ipAddress,
          userAgent,
        },
        ipAddress,
        userAgent,
      });

      // Send notifications if needed
      const securityWarnings: string[] = [];
      if (securityScore < 80) {
        securityWarnings.push('Unusual login activity detected');
        await this.notificationService.sendSecurityAlert(
          userData.id,
          session.id,
          'Unusual login activity detected',
          {
            securityScore,
            deviceTrusted: deviceRegistration.trusted,
            location,
          },
        );
      }

      if (!deviceRegistration.trusted) {
        securityWarnings.push('Login from new device');
        await this.notificationService.sendDeviceRegistrationNotification(
          userData.id,
          session.id,
          deviceInfo,
        );
      }

      return {
        success: true,
        session,
        user: userData,
        deviceRegistrationRequired: !deviceRegistration.trusted,
        securityWarnings,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * Authenticate user with OAuth provider
   */
  async authenticateWithOAuth(
    provider: 'google' | 'github' | 'azure',
    _deviceInfo: DeviceInfo,
    request: NextRequest,
  ): Promise<AuthenticationResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${request.nextUrl.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // OAuth flow will redirect to callback
      return {
        success: true,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'OAuth authentication failed',
      };
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    code: string,
    deviceInfo: DeviceInfo,
    request: NextRequest,
  ): Promise<AuthenticationResult> {
    try {
      const { data, error } =
        await this.supabase.auth.exchangeCodeForSession(code);

      if (error || !data.user) {
        return {
          success: false,
          error: 'OAuth callback failed',
        };
      }

      // Continue with session creation similar to password auth
      const ipAddress = this.extractIPAddress(request);
      const userAgent = request.headers.get('user-agent') || undefined;
      const location = await this.extractLocation(request);

      const userData = await this.getUserProfile(data.user.id);
      if (!userData) {
        return {
          success: false,
          error: 'User profile not found',
        };
      }

      // Register device and create session
      await this.deviceManager.registerOrUpdateDevice(
        userData.id,
        deviceInfo,
        ipAddress,
      );

      const securityScore = await this.calculateSecurityScore(
        userData.id,
        deviceInfo.fingerprint,
        ipAddress,
        location,
      );

      const session = await this.sessionManager.createSession({
        userId: userData.id,
        deviceFingerprint: deviceInfo.fingerprint,
        ipAddress,
        userAgent,
        location,
        securityScore,
        userRole: userData.role,
      });

      return {
        success: true,
        session,
        user: userData,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'OAuth callback processing failed',
      };
    }
  }

  /**
   * Verify MFA token
   */
  async verifyMFA(
    userId: string,
    token: string,
    deviceInfo: DeviceInfo,
    request: NextRequest,
  ): Promise<AuthenticationResult> {
    try {
      // Verify MFA token with Supabase
      const { data, error } = await this.supabase.auth.verifyOtp({
        token,
        type: 'totp',
      });

      if (error || !data.user) {
        await this.logSecurityEvent({
          userId,
          eventType: 'mfa_bypass_attempt',
          severity: 'high',
          details: {
            token: `${token.substring(0, 2)}****`,
            error: error?.message,
          },
          ipAddress: this.extractIPAddress(request),
          userAgent: request.headers.get('user-agent') || undefined,
        });

        return {
          success: false,
          error: 'Invalid MFA token',
        };
      }

      // Continue with session creation
      const ipAddress = this.extractIPAddress(request);
      const userAgent = request.headers.get('user-agent') || undefined;
      const location = await this.extractLocation(request);

      const userData = await this.getUserProfile(userId);
      if (!userData) {
        return {
          success: false,
          error: 'User profile not found',
        };
      }

      await this.deviceManager.registerOrUpdateDevice(
        userData.id,
        deviceInfo,
        ipAddress,
      );

      const securityScore = await this.calculateSecurityScore(
        userData.id,
        deviceInfo.fingerprint,
        ipAddress,
        location,
      );

      const session = await this.sessionManager.createSession({
        userId: userData.id,
        deviceFingerprint: deviceInfo.fingerprint,
        ipAddress,
        userAgent,
        location,
        securityScore,
        userRole: userData.role,
      });

      return {
        success: true,
        session,
        user: userData,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'MFA verification failed',
      };
    }
  }

  // =====================================================
  // SESSION VALIDATION METHODS
  // =====================================================

  /**
   * Validate existing session
   */
  async validateSession(
    sessionId: string,
    request: NextRequest,
  ): Promise<AuthenticationResult> {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session?.isActive) {
        return {
          success: false,
          error: 'Invalid or expired session',
        };
      }

      // Check if session has expired
      if (session.expiresAt < new Date()) {
        await this.sessionManager.terminateSession(sessionId, 'expired');
        return {
          success: false,
          error: 'Session expired',
        };
      }

      // Validate device fingerprint
      const currentDeviceFingerprint = request.headers.get(
        'x-device-fingerprint',
      );
      if (
        currentDeviceFingerprint &&
        currentDeviceFingerprint !== session.deviceFingerprint
      ) {
        await this.logSecurityEvent({
          userId: session.userId,
          sessionId: session.id,
          eventType: 'session_hijack_attempt',
          severity: 'critical',
          details: {
            expectedFingerprint: session.deviceFingerprint,
            actualFingerprint: currentDeviceFingerprint,
          },
          ipAddress: this.extractIPAddress(request),
          userAgent: request.headers.get('user-agent') || undefined,
        });

        await this.sessionManager.terminateSession(
          sessionId,
          'security_violation',
        );
        return {
          success: false,
          error: 'Session security violation',
        };
      }

      // Update last activity
      await this.sessionManager.updateLastActivity(sessionId);

      // Get user data
      const userData = await this.getUserProfile(session.userId);
      if (!userData) {
        return {
          success: false,
          error: 'User profile not found',
        };
      }

      return {
        success: true,
        session,
        user: userData,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Session validation failed',
      };
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(
    sessionId: string,
    request: NextRequest,
  ): Promise<AuthenticationResult> {
    try {
      const validation = await this.validateSession(sessionId, request);
      if (!(validation.success && validation.session)) {
        return validation;
      }

      // Extend session expiry
      const extendedSession = await this.sessionManager.extendSession(
        sessionId,
        validation.user?.role,
      );

      return {
        success: true,
        session: extendedSession,
        user: validation.user,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Session refresh failed',
      };
    }
  }

  // =====================================================
  // LOGOUT METHODS
  // =====================================================

  /**
   * Logout user and terminate session
   */
  async logout(
    sessionId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Terminate session
      await this.sessionManager.terminateSession(sessionId, 'user_logout');

      // Sign out from Supabase
      await this.supabase.auth.signOut();

      return { success: true };
    } catch (_error) {
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Terminate all user sessions
      await this.sessionManager.terminateAllUserSessions(
        userId,
        'user_logout_all',
      );

      // Sign out from Supabase
      await this.supabase.auth.signOut();

      return { success: true };
    } catch (_error) {
      return {
        success: false,
        error: 'Logout from all devices failed',
      };
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<UserData | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(
          `
          id,
          email,
          full_name,
          role,
          email_verified,
          phone_verified,
          mfa_enabled,
          last_login_at
        `,
        )
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        emailVerified: data.email_verified,
        phoneVerified: data.phone_verified,
        mfaEnabled: data.mfa_enabled,
        lastLoginAt: data.last_login_at
          ? new Date(data.last_login_at)
          : undefined,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Extract IP address from request
   */
  private extractIPAddress(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('remote-addr');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (remoteAddr) {
      return remoteAddr;
    }

    return '127.0.0.1'; // Fallback for development
  }

  /**
   * Extract location from request (simplified)
   */
  private async extractLocation(
    request: NextRequest,
  ): Promise<LocationData | undefined> {
    if (!this.config.enableLocationTracking) {
      return;
    }

    try {
      // In production, you would use a geolocation service
      // For now, we'll extract from headers if available
      const country =
        request.headers.get('cf-ipcountry') || request.headers.get('x-country');
      const timezone = request.headers.get('cf-timezone');

      if (country) {
        return {
          country,
          timezone: timezone || undefined,
        };
      }

      return;
    } catch (_error) {
      return;
    }
  }

  /**
   * Calculate security score for session
   */
  private async calculateSecurityScore(
    userId: string,
    deviceFingerprint: string,
    ipAddress: string,
    location?: LocationData,
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc(
        'calculate_session_security_score',
        {
          user_id_param: userId,
          device_fingerprint_param: deviceFingerprint,
          ip_address_param: ipAddress,
          location_param: location || null,
        },
      );

      if (error) {
        return 50; // Default medium security score
      }

      return data || 50;
    } catch (_error) {
      return 50;
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: {
    userId: string | null;
    sessionId?: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    if (!this.config.enableSecurityEvents) {
      return;
    }

    try {
      await this.securityLogger.logEvent({
        sessionId: event.sessionId,
        userId: event.userId,
        eventType: event.eventType as any,
        severity: event.severity as any,
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      });
    } catch (_error) {}
  }

  // =====================================================
  // MIDDLEWARE HELPERS
  // =====================================================

  /**
   * Create authentication middleware
   */
  createAuthMiddleware() {
    return async (request: NextRequest) => {
      const sessionId = request.cookies.get('session-id')?.value;

      if (!sessionId) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const validation = await this.validateSession(sessionId, request);

      if (!validation.success) {
        const response = NextResponse.redirect(
          new URL('/auth/login', request.url),
        );
        response.cookies.delete('session-id');
        return response;
      }

      // Add user data to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', validation.user?.id);
      requestHeaders.set('x-user-role', validation.user?.role);
      requestHeaders.set('x-session-id', validation.session?.id);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    };
  }

  /**
   * Set session cookie
   */
  setSessionCookie(
    response: NextResponse,
    sessionId: string,
    expiresAt: Date,
  ): void {
    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });
  }

  /**
   * Clear session cookie
   */
  clearSessionCookie(response: NextResponse): void {
    response.cookies.delete('session-id');
  }
}

// Export singleton instance
let sessionAuthInstance: SessionAuthService | null = null;

export function getSessionAuthService(): SessionAuthService {
  if (!sessionAuthInstance) {
    const config: SessionAuthConfig = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      jwtSecret: process.env.SUPABASE_JWT_SECRET!,
      enableDeviceTracking: process.env.ENABLE_DEVICE_TRACKING !== 'false',
      enableLocationTracking: process.env.ENABLE_LOCATION_TRACKING !== 'false',
      enableSecurityEvents: process.env.ENABLE_SECURITY_EVENTS !== 'false',
      enableNotifications: process.env.ENABLE_SESSION_NOTIFICATIONS !== 'false',
    };

    sessionAuthInstance = new SessionAuthService(config);
  }

  return sessionAuthInstance;
}

export default SessionAuthService;
