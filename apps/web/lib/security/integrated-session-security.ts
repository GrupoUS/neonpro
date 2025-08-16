/**
 * Integrated Session Security Manager for NeonPro
 * Combines all session security features into a unified system
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/client';
import { CSRFProtection } from './csrf-protection';
import {
  type SessionFingerprint,
  SessionHijackingProtection,
} from './session-hijacking-protection';
import { SessionTimeoutManager } from './session-timeout-manager';

export type SecurityConfig = {
  csrf: {
    enabled: boolean;
    strictMode: boolean;
  };
  hijackingProtection: {
    enabled: boolean;
    riskThreshold: number;
    requireReauthThreshold: number;
  };
  timeout: {
    enabled: boolean;
    maxInactivityMinutes: number;
    warningIntervals: number[];
    extendOnActivity: boolean;
  };
  concurrentSessions: {
    enabled: boolean;
    maxSessions: number;
    terminateOldest: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
};

export type SecurityCheckResult = {
  allowed: boolean;
  action: 'allow' | 'challenge' | 'block' | 'terminate';
  reason?: string;
  requiresReauth?: boolean;
  csrfToken?: string;
  warnings?: string[];
  riskScore: number;
};

export type SessionSecurityContext = {
  sessionId: string;
  userId: string;
  fingerprint: SessionFingerprint;
  isAuthenticated: boolean;
  lastActivity: number;
  riskScore: number;
  requiresReauth: boolean;
};

/**
 * Integrated Session Security Manager
 */
export class IntegratedSessionSecurity {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    csrf: {
      enabled: true,
      strictMode: false,
    },
    hijackingProtection: {
      enabled: true,
      riskThreshold: 6,
      requireReauthThreshold: 8,
    },
    timeout: {
      enabled: true,
      maxInactivityMinutes: 30,
      warningIntervals: [10, 5, 2, 1],
      extendOnActivity: true,
    },
    concurrentSessions: {
      enabled: true,
      maxSessions: 3,
      terminateOldest: true,
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      burstLimit: 10,
    },
  };

  /**
   * Initialize session security for a new session
   */
  static async initializeSessionSecurity(
    sessionId: string,
    userId: string,
    request: NextRequest,
    config: Partial<SecurityConfig> = {},
  ): Promise<boolean> {
    try {
      const fullConfig = {
        ...IntegratedSessionSecurity.DEFAULT_CONFIG,
        ...config,
      };
      const fingerprint =
        SessionHijackingProtection.generateFingerprint(request);

      // Store session fingerprint
      if (fullConfig.hijackingProtection.enabled) {
        await SessionHijackingProtection.storeSessionFingerprint(
          sessionId,
          userId,
          fingerprint,
        );
      }

      // Initialize session timeout
      if (fullConfig.timeout.enabled) {
        await SessionTimeoutManager.initializeSessionTimeout(
          sessionId,
          userId,
          {
            maxInactivityMinutes: fullConfig.timeout.maxInactivityMinutes,
            warningIntervals: fullConfig.timeout.warningIntervals,
            extendOnActivity: fullConfig.timeout.extendOnActivity,
            requireReauthForSensitive: true,
            gracePeriodMinutes: 2,
          },
        );
      }

      // Check concurrent sessions
      if (fullConfig.concurrentSessions.enabled) {
        const concurrentCheck =
          await SessionHijackingProtection.detectConcurrentSessions(
            userId,
            sessionId,
            fullConfig.concurrentSessions.maxSessions,
          );

        if (
          concurrentCheck.hasExcess &&
          fullConfig.concurrentSessions.terminateOldest
        ) {
          await SessionHijackingProtection.terminateSessions(
            concurrentCheck.sessionsToTerminate,
          );
        }
      }

      // Store security configuration
      await IntegratedSessionSecurity.storeSecurityConfig(
        sessionId,
        fullConfig,
      );

      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Comprehensive security check for requests
   */
  static async performSecurityCheck(
    request: NextRequest,
    sessionId?: string,
  ): Promise<SecurityCheckResult> {
    try {
      let riskScore = 0;
      const warnings: string[] = [];
      let requiresReauth = false;
      let csrfToken: string | undefined;

      // Get security configuration
      const config = sessionId
        ? await IntegratedSessionSecurity.getSecurityConfig(sessionId)
        : IntegratedSessionSecurity.DEFAULT_CONFIG;

      // 1. CSRF Protection Check
      if (
        config.csrf.enabled &&
        !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
      ) {
        const csrfResult = await CSRFProtection.validateCSRFMiddleware(request);
        if (csrfResult) {
          return {
            allowed: false,
            action: 'block',
            reason: 'CSRF token validation failed',
            riskScore: 10,
          };
        }

        // Generate new CSRF token for response
        const tokenResult =
          await CSRFProtection.generateTokenForClient(request);
        if (tokenResult) {
          csrfToken = tokenResult.token;
        }
      }

      // 2. Session Hijacking Protection
      if (sessionId && config.hijackingProtection.enabled) {
        const fingerprint =
          SessionHijackingProtection.generateFingerprint(request);
        const hijackingCheck =
          await SessionHijackingProtection.validateSessionFingerprint(
            sessionId,
            fingerprint,
          );

        riskScore += hijackingCheck.riskScore;

        if (!hijackingCheck.valid) {
          return {
            allowed: false,
            action: 'terminate',
            reason: hijackingCheck.reason,
            riskScore: hijackingCheck.riskScore,
            requiresReauth: true,
          };
        }

        if (
          hijackingCheck.riskScore >=
          config.hijackingProtection.requireReauthThreshold
        ) {
          requiresReauth = true;
          warnings.push(
            'Session security risk detected - reauthentication required',
          );
        } else if (
          hijackingCheck.riskScore >= config.hijackingProtection.riskThreshold
        ) {
          warnings.push('Suspicious session activity detected');
        }
      }

      // 3. Session Timeout Check
      if (sessionId && config.timeout.enabled) {
        const timeoutCheck =
          await SessionTimeoutManager.checkSessionTimeout(sessionId);

        if (timeoutCheck.shouldTimeout) {
          return {
            allowed: false,
            action: 'terminate',
            reason: 'Session has timed out',
            riskScore: 10,
            requiresReauth: true,
          };
        }

        if (timeoutCheck.requiresReauth) {
          requiresReauth = true;
          warnings.push(
            'Session approaching timeout - reauthentication recommended',
          );
        }

        // Update activity if extending on activity
        if (config.timeout.extendOnActivity) {
          await SessionTimeoutManager.updateActivity(sessionId, {
            userId: '', // Will be filled from session context
            lastActivity: Date.now(),
            activityType: 'api_call',
            path: request.nextUrl.pathname,
          });
        }
      }

      // 4. Determine final action
      let action: 'allow' | 'challenge' | 'block' | 'terminate' = 'allow';

      if (riskScore >= 8) {
        action = 'terminate';
        requiresReauth = true;
      } else if (riskScore >= 6 || requiresReauth) {
        action = 'challenge';
        requiresReauth = true;
      } else if (riskScore >= 3) {
        action = 'allow';
        warnings.push('Elevated security risk detected');
      }

      return {
        allowed: action !== 'terminate' && action !== 'block',
        action,
        riskScore,
        requiresReauth,
        csrfToken,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (_error) {
      return {
        allowed: false,
        action: 'block',
        reason: 'Security check error',
        riskScore: 10,
      };
    }
  }

  /**
   * Create security middleware
   */
  static createSecurityMiddleware() {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      // Extract session ID from request
      const sessionId =
        request.cookies.get('session-id')?.value ||
        request.headers.get('X-Session-ID');

      // Perform security check
      const securityResult =
        await IntegratedSessionSecurity.performSecurityCheck(
          request,
          sessionId,
        );

      // Handle security decision
      if (!securityResult.allowed) {
        const response = new NextResponse(
          JSON.stringify({
            error: securityResult.reason || 'Security check failed',
            action: securityResult.action,
            requiresReauth: securityResult.requiresReauth,
            riskScore: securityResult.riskScore,
          }),
          {
            status: securityResult.action === 'terminate' ? 401 : 403,
            headers: { 'Content-Type': 'application/json' },
          },
        );

        return response;
      }

      // Add security headers to response
      const response = NextResponse.next();

      // Add CSRF token if available
      if (securityResult.csrfToken) {
        response.headers.set('X-CSRF-Token', securityResult.csrfToken);
      }

      // Add security warnings
      if (securityResult.warnings) {
        response.headers.set(
          'X-Security-Warnings',
          securityResult.warnings.join('; '),
        );
      }

      // Add risk score for debugging
      if (process.env.NODE_ENV === 'development') {
        response.headers.set(
          'X-Security-Risk-Score',
          securityResult.riskScore.toString(),
        );
      }

      return response;
    };
  }

  /**
   * Get session security context
   */
  static async getSessionSecurityContext(
    sessionId: string,
  ): Promise<SessionSecurityContext | null> {
    try {
      const supabase = createClient();

      // Get session information
      const { data: sessionData } = await supabase
        .from('session_fingerprints')
        .select('user_id, fingerprint_data, last_seen')
        .eq('session_id', sessionId)
        .single();

      if (!sessionData) {
        return null;
      }

      // Get timeout information
      const { data: timeoutData } = await supabase
        .from('session_timeouts')
        .select('last_activity, timeout_at, is_active')
        .eq('session_id', sessionId)
        .single();

      // Calculate risk score and auth requirements
      const lastActivity = timeoutData
        ? new Date(timeoutData.last_activity).getTime()
        : new Date(sessionData.last_seen).getTime();

      const isActive = timeoutData?.is_active ?? true;
      const timeoutAt = timeoutData
        ? new Date(timeoutData.timeout_at).getTime()
        : 0;
      const requiresReauth =
        !isActive || (timeoutAt > 0 && Date.now() > timeoutAt);

      return {
        sessionId,
        userId: sessionData.user_id,
        fingerprint: sessionData.fingerprint_data as SessionFingerprint,
        isAuthenticated: isActive && !requiresReauth,
        lastActivity,
        riskScore: requiresReauth ? 10 : 0,
        requiresReauth,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Store security configuration
   */
  private static async storeSecurityConfig(
    sessionId: string,
    config: SecurityConfig,
  ): Promise<void> {
    try {
      const supabase = createClient();

      await supabase.from('session_security_configs').upsert({
        session_id: sessionId,
        config,
        created_at: new Date().toISOString(),
      });
    } catch (_error) {}
  }

  /**
   * Get security configuration
   */
  private static async getSecurityConfig(
    sessionId: string,
  ): Promise<SecurityConfig> {
    try {
      const supabase = createClient();

      const { data } = await supabase
        .from('session_security_configs')
        .select('config')
        .eq('session_id', sessionId)
        .single();

      return data?.config || IntegratedSessionSecurity.DEFAULT_CONFIG;
    } catch (_error) {
      return IntegratedSessionSecurity.DEFAULT_CONFIG;
    }
  }

  /**
   * Cleanup expired security data
   */
  static async cleanupSecurityData(): Promise<void> {
    try {
      await SessionTimeoutManager.cleanupExpiredSessions();
      await CSRFProtection.cleanupExpiredTokens();

      // Cleanup old security events (older than 90 days)
      const supabase = createClient();
      const ninetyDaysAgo = new Date(
        Date.now() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString();

      await supabase
        .from('security_events')
        .delete()
        .lt('timestamp', ninetyDaysAgo);
    } catch (_error) {}
  }
}

export default IntegratedSessionSecurity;
