/**
 * Session Security Middleware
 * 
 * Provides comprehensive session security validation including IP binding,
 * anomaly detection, and progressive security measures.
 * 
 * @security_critical
 * @compliance OWASP Session Management Cheat Sheet, LGPD
 * @version 1.0.0
 */

import { Context, Next } from 'hono';
import { unauthorized, forbidden } from '../utils/responses';
import { EnhancedSessionManager, EnhancedSessionMetadata } from '../security/enhanced-session-manager';
import { SessionCookieUtils } from '../security/session-cookie-utils';

export interface SessionSecurityConfig {
  // IP Binding
  enableIPBinding: boolean;
  allowMobileSubnetChanges: boolean;
  
  // Session Fixation Protection
  regenerateSessionOnAuth: boolean;
  
  // Concurrent Sessions
  maxConcurrentSessions: number;
  
  // Timeout Controls
  idleTimeout: number;
  absoluteTimeout: number;
  timeoutWarningThreshold: number;
  
  // Anomaly Detection
  enableAnomalyDetection: boolean;
  maxIPChangesPerHour: number;
  
  // Progressive Security
  enableProgressiveSecurity: boolean;
  mfaRequiredThreshold: number;
  
  // Security Headers
  enableSecurityHeaders: boolean;
  
  // Session Secret for cookie signing
  sessionSecret: string;
}

export interface SessionSecurityContext {
  sessionId: string;
  userId: string;
  session: EnhancedSessionMetadata;
  securityLevel: 'normal' | 'elevated' | 'high';
  riskScore: number;
  requiresAdditionalVerification: boolean;
  warnings: string[];
  timeoutWarning?: number;
}

export class SessionSecurityMiddleware {
  private sessionManager: EnhancedSessionManager;
  private config: SessionSecurityConfig;

  constructor(config: SessionSecurityConfig) {
    this.config = config;
    
    // Initialize enhanced session manager
    this.sessionManager = new EnhancedSessionManager({
      enableIPBinding: config.enableIPBinding,
      allowMobileSubnetChanges: config.allowMobileSubnetChanges,
      regenerateSessionOnAuth: config.regenerateSessionOnAuth,
      maxConcurrentSessions: config.maxConcurrentSessions,
      idleTimeout: config.idleTimeout,
      absoluteTimeout: config.absoluteTimeout,
      timeoutWarningThreshold: config.timeoutWarningThreshold,
      enableAnomalyDetection: config.enableAnomalyDetection,
      maxIPChangesPerHour: config.maxIPChangesPerHour
    });
  }

  /**
   * Main session security middleware
   */
  async sessionSecurity(c: Context, next: Next) {
    try {
      // Extract session information from various sources
      const sessionInfo = this.extractSessionInfo(c);
      
      // Validate session cookies if present
      if (sessionInfo.cookieHeader) {
        const cookieValidation = SessionCookieUtils.validateSessionCookies(
          sessionInfo.cookieHeader,
          this.config.sessionSecret,
          this.sessionManager
        );
        
        if (!cookieValidation.isValid) {
          return unauthorized(c, cookieValidation.error || 'Invalid session cookies');
        }
        
        sessionInfo.sessionId = cookieValidation.sessionId;
      }

      // Validate session ID
      if (!sessionInfo.sessionId) {
        return unauthorized(c, 'Session ID required');
      }

      // Validate and update session
      const sessionValidation = this.sessionManager.validateAndUpdateSession(
        sessionInfo.sessionId,
        sessionInfo.clientIP,
        sessionInfo.userAgent
      );

      if (!sessionValidation.isValid) {
        this.handleSecurityViolation(c, sessionValidation.action, sessionValidation.reason);
        return;
      }

      const session = sessionValidation.session!;

      // Handle progressive security measures
      const progressiveSecurityResult = this.handleProgressiveSecurity(session);
      if (progressiveSecurityResult.requiresMFA) {
        return this.requireMFA(c, progressiveSecurityResult.reason);
      }

      // Add security headers
      if (this.config.enableSecurityHeaders) {
        this.addSecurityHeaders(c, session);
      }

      // Add timeout warning header if needed
      if (sessionValidation.timeoutWarning) {
        c.header('X-Session-Timeout-Warning', Math.ceil(sessionValidation.timeoutWarning / 1000).toString());
      }

      // Add security context to request
      const securityContext: SessionSecurityContext = {
        sessionId: session.sessionId,
        userId: session.userId,
        session,
        securityLevel: session.securityLevel,
        riskScore: session.riskScore,
        requiresAdditionalVerification: progressiveSecurityResult.requiresVerification,
        warnings: sessionValidation.warnings || [],
        timeoutWarning: sessionValidation.timeoutWarning
      };

      c.set('sessionSecurity', securityContext);
      c.set('sessionId', session.sessionId);
      c.set('userId', session.userId);

      return next();
    } catch (error) {
      console.error('Session security error:', error);
      return unauthorized(c, 'Session security validation failed');
    }
  }

  /**
   * Session fixation protection middleware
   */
  async sessionFixationProtection(c: Context, next: Next) {
    if (!this.config.regenerateSessionOnAuth) {
      return next();
    }

    const sessionId = c.get('sessionId');
    if (!sessionId) {
      return next();
    }

    // Check if this is an authentication request
    const isAuthRequest = this.isAuthenticationRequest(c);
    if (isAuthRequest) {
      // Regenerate session ID to prevent fixation
      const newSessionId = this.sessionManager.regenerateSession(sessionId);
      if (newSessionId) {
        c.set('sessionId', newSessionId);
        
        // Update security context if present
        const securityContext = c.get('sessionSecurity') as SessionSecurityContext;
        if (securityContext) {
          securityContext.sessionId = newSessionId;
          securityContext.session.sessionId = newSessionId;
        }
      }
    }

    return next();
  }

  /**
   * Concurrent session management middleware
   */
  async concurrentSessionManagement(c: Context, next: Next) {
    const userId = c.get('userId');
    if (!userId) {
      return next();
    }

    const userSessions = this.sessionManager.getUserSessions(userId);
    
    // Check for concurrent sessions from different IPs
    const currentIP = this.getClientIP(c);
    const otherIPSessions = userSessions.filter(session => 
      session.ipAddress && session.ipAddress !== currentIP
    );

    if (otherIPSessions.length > 0) {
      // Log concurrent session activity
      console.warn(`Concurrent session detected for user ${userId} from different IP: ${currentIP}`);
      
      // Add warning header
      c.header('X-Concurrent-Sessions-Warning', 'true');
      
      // Update security context
      const securityContext = c.get('sessionSecurity') as SessionSecurityContext;
      if (securityContext) {
        securityContext.warnings.push('Concurrent session activity detected');
        securityContext.session.securityLevel = 'elevated';
        securityContext.session.riskScore = Math.max(securityContext.session.riskScore, 50);
      }
    }

    return next();
  }

  /**
   * Session cleanup middleware
   */
  async sessionCleanup(c: Context, next: Next) {
    // Perform session cleanup
    const cleanedCount = this.sessionManager.cleanExpiredSessions();
    
    if (cleanedCount > 0) {
      console.log(`Session security: Cleaned ${cleanedCount} expired sessions`);
    }

    return next();
  }

  /**
   * Session termination middleware (for logout)
   */
  async sessionTermination(c: Context, next: Next) {
    const sessionId = c.get('sessionId');
    const userId = c.get('userId');

    if (sessionId && userId) {
      // Remove current session
      this.sessionManager.removeSession(sessionId);
      
      // Optionally remove all user sessions
      const removeAll = c.req.query('all') === 'true';
      if (removeAll) {
        const removedCount = this.sessionManager.removeAllUserSessions(userId);
        console.log(`Session termination: Removed ${removedCount} sessions for user ${userId}`);
      }

      // Set cleanup cookies
      const cleanupCookies = SessionCookieUtils.createCleanupCookies();
      c.header('Set-Cookie', cleanupCookies);
    }

    return next();
  }

  /**
   * Extract session information from request
   */
  private extractSessionInfo(c: Context) {
    return {
      sessionId: c.req.header('x-session-id') || c.req.header('X-Session-ID'),
      cookieHeader: c.req.header('cookie'),
      clientIP: this.getClientIP(c),
      userAgent: c.req.header('user-agent')
    };
  }

  /**
   * Get client IP address from request
   */
  private getClientIP(c: Context): string | undefined {
    return (
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      c.req.header('x-client-ip') ||
      c.req.header('cf-connecting-ip') || // Cloudflare
      undefined
    );
  }

  /**
   * Handle security violations
   */
  private handleSecurityViolation(
    c: Context, 
    action: 'allow' | 'warn' | 'block' | 'require_verification' | 'require_mfa',
    reason?: string
  ) {
    switch (action) {
      case 'block':
        console.warn(`Session security: Blocking request - ${reason}`);
        return forbidden(c, reason || 'Security violation detected');
      
      case 'require_verification':
        console.warn(`Session security: Requiring verification - ${reason}`);
        return c.json({
          success: false,
          error: 'Additional verification required',
          code: 'SESSION_VERIFICATION_REQUIRED',
          reason
        }, 403);
      
      case 'require_mfa':
        console.warn(`Session security: Requiring MFA - ${reason}`);
        return c.json({
          success: false,
          error: 'Multi-factor authentication required',
          code: 'MFA_REQUIRED',
          reason
        }, 403);
      
      case 'warn':
        console.warn(`Session security: Warning - ${reason}`);
        c.header('X-Security-Warning', reason);
        break;
      
      case 'allow':
      default:
        // Allow request to proceed
        break;
    }
  }

  /**
   * Handle progressive security measures
   */
  private handleProgressiveSecurity(session: EnhancedSessionMetadata) {
    if (!this.config.enableProgressiveSecurity) {
      return {
        requiresVerification: false,
        requiresMFA: false,
        reason: undefined
      };
    }

    const riskFactors: string[] = [];
    let totalRisk = session.riskScore;

    // Additional risk factors
    if (session.securityLevel === 'high') {
      riskFactors.push('High security level');
      totalRisk += 30;
    }

    if (session.ipChangeCount > this.config.maxIPChangesPerHour) {
      riskFactors.push('Excessive IP changes');
      totalRisk += 40;
    }

    if (session.consecutiveFailures > 3) {
      riskFactors.push('Consecutive authentication failures');
      totalRisk += 50;
    }

    // Determine action based on risk score
    if (totalRisk >= this.config.mfaRequiredThreshold) {
      return {
        requiresVerification: true,
        requiresMFA: true,
        reason: `High risk session detected: ${riskFactors.join(', ')}`
      };
    }

    if (totalRisk >= 60) {
      return {
        requiresVerification: true,
        requiresMFA: false,
        reason: `Medium risk session detected: ${riskFactors.join(', ')}`
      };
    }

    return {
      requiresVerification: false,
      requiresMFA: false,
      reason: undefined
    };
  }

  /**
   * Require MFA authentication
   */
  private requireMFA(c: Context, reason: string) {
    return c.json({
      success: false,
      error: 'Multi-factor authentication required',
      code: 'MFA_REQUIRED',
      reason,
      verificationMethods: ['email', 'sms', 'authenticator']
    }, 403);
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(c: Context, session: EnhancedSessionMetadata) {
    // Security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    
    // Session security headers
    c.header('X-Session-Security-Level', session.securityLevel);
    c.header('X-Session-Risk-Score', session.riskScore.toString());
    
    if (session.ipAddress) {
      c.header('X-Session-IP', session.ipAddress);
    }
    
    // Add timestamp for freshness
    c.header('X-Session-Timestamp', Date.now().toString());
  }

  /**
   * Check if request is an authentication request
   */
  private isAuthenticationRequest(c: Context): boolean {
    const path = c.req.path;
    const method = c.req.method;
    
    return (
      (path.includes('/login') && method === 'POST') ||
      (path.includes('/auth') && method === 'POST') ||
      (path.includes('/register') && method === 'POST')
    );
  }

  /**
   * Get session manager instance
   */
  getSessionManager(): EnhancedSessionManager {
    return this.sessionManager;
  }

  /**
   * Get session security statistics
   */
  getSecurityStats() {
    return {
      ...this.sessionManager.getSessionStats(),
      config: this.config
    };
  }

  /**
   * Destroy session manager
   */
  destroy() {
    this.sessionManager.destroy();
  }
}

// Factory function to create session security middleware
export function createSessionSecurity(config: SessionSecurityConfig) {
  const middleware = new SessionSecurityMiddleware(config);
  
  return {
    sessionSecurity: middleware.sessionSecurity.bind(middleware),
    sessionFixationProtection: middleware.sessionFixationProtection.bind(middleware),
    concurrentSessionManagement: middleware.concurrentSessionManagement.bind(middleware),
    sessionCleanup: middleware.sessionCleanup.bind(middleware),
    sessionTermination: middleware.sessionTermination.bind(middleware),
    getSessionManager: () => middleware.getSessionManager(),
    getSecurityStats: () => middleware.getSecurityStats(),
    destroy: () => middleware.destroy()
  };
}