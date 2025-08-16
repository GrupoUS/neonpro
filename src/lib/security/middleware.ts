/**
 * Security Middleware for NeonPro
 * Provides comprehensive security middleware for API protection
 * Story 3.3: Security Hardening & Audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { securityAPI } from './index';
import { z } from 'zod';

// Types
interface SecurityContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint: string;
  method: string;
  riskScore: number;
  authLevel: 'none' | 'basic' | 'mfa' | 'admin';
}

interface RateLimitConfig {
  requests: number;
  windowMinutes: number;
  identifier: 'ip' | 'user' | 'session';
}

interface SecurityConfig {
  requireAuth?: boolean;
  requireMFA?: boolean;
  requireAdmin?: boolean;
  rateLimits?: RateLimitConfig[];
  auditLevel?: 'none' | 'basic' | 'detailed' | 'complete';
  complianceFlags?: string[];
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Middleware Configuration Registry
const ENDPOINT_SECURITY_CONFIG: Record<string, SecurityConfig> = {
  // Authentication endpoints
  '/api/auth/login': {
    rateLimits: [
      { requests: 5, windowMinutes: 15, identifier: 'ip' },
      { requests: 3, windowMinutes: 5, identifier: 'ip' },
    ],
    auditLevel: 'complete',
    complianceFlags: ['AUTHENTICATION'],
    riskLevel: 'medium',
  },
  '/api/auth/register': {
    rateLimits: [{ requests: 3, windowMinutes: 60, identifier: 'ip' }],
    auditLevel: 'complete',
    complianceFlags: ['REGISTRATION', 'LGPD'],
    riskLevel: 'medium',
  },
  '/api/auth/reset-password': {
    rateLimits: [{ requests: 3, windowMinutes: 60, identifier: 'ip' }],
    auditLevel: 'complete',
    complianceFlags: ['PASSWORD_RESET'],
    riskLevel: 'medium',
  },

  // User management
  '/api/users/*': {
    requireAuth: true,
    rateLimits: [{ requests: 100, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'detailed',
    complianceFlags: ['USER_DATA', 'LGPD'],
    riskLevel: 'high',
  },
  '/api/admin/users/*': {
    requireAuth: true,
    requireAdmin: true,
    rateLimits: [{ requests: 200, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'complete',
    complianceFlags: ['ADMIN_ACCESS', 'USER_MANAGEMENT'],
    riskLevel: 'critical',
  },

  // Patient data
  '/api/patients/*': {
    requireAuth: true,
    requireMFA: true,
    rateLimits: [{ requests: 200, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'complete',
    complianceFlags: ['PATIENT_DATA', 'LGPD', 'ANVISA', 'CFM'],
    riskLevel: 'critical',
  },

  // Appointments
  '/api/appointments/*': {
    requireAuth: true,
    rateLimits: [{ requests: 300, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'detailed',
    complianceFlags: ['APPOINTMENT_DATA', 'LGPD'],
    riskLevel: 'high',
  },

  // Financial data
  '/api/financial/*': {
    requireAuth: true,
    requireMFA: true,
    rateLimits: [{ requests: 100, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'complete',
    complianceFlags: ['FINANCIAL_DATA', 'LGPD'],
    riskLevel: 'critical',
  },

  // Security endpoints
  '/api/security/*': {
    requireAuth: true,
    requireAdmin: true,
    rateLimits: [{ requests: 50, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'complete',
    complianceFlags: ['SECURITY_MANAGEMENT'],
    riskLevel: 'critical',
  },

  // ANVISA endpoints
  '/api/anvisa/*': {
    requireAuth: true,
    rateLimits: [{ requests: 50, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'complete',
    complianceFlags: ['ANVISA', 'REGULATORY'],
    riskLevel: 'critical',
  },

  // LGPD endpoints
  '/api/lgpd/*': {
    requireAuth: true,
    rateLimits: [{ requests: 20, windowMinutes: 60, identifier: 'user' }],
    auditLevel: 'complete',
    complianceFlags: ['LGPD', 'PRIVACY'],
    riskLevel: 'critical',
  },
};

/**
 * Security Middleware Class
 */
export class SecurityMiddleware {
  private supabase = createClient();

  /**
   * Main security middleware function
   */
  async handle(request: NextRequest): Promise<NextResponse | null> {
    try {
      const securityContext = await this.buildSecurityContext(request);
      const securityConfig = this.getSecurityConfig(securityContext.endpoint);

      // Rate limiting check
      await this.checkRateLimits(securityContext, securityConfig);

      // Authentication check
      await this.checkAuthentication(securityContext, securityConfig);

      // Authorization check
      await this.checkAuthorization(securityContext, securityConfig);

      // Create audit log
      await this.createAuditLog(
        securityContext,
        securityConfig,
        'REQUEST_ALLOWED'
      );

      // Add security headers
      const response = this.addSecurityHeaders(NextResponse.next());

      return response;
    } catch (error) {
      console.error('Security middleware error:', error);

      // Log security event
      await this.logSecurityEvent(request, error as Error);

      // Return appropriate error response
      return this.createErrorResponse(error as Error);
    }
  }

  /**
   * Build security context from request
   */
  private async buildSecurityContext(
    request: NextRequest
  ): Promise<SecurityContext> {
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const endpoint = request.nextUrl.pathname;
    const method = request.method;

    // Get session info if available
    const sessionInfo = await this.getSessionInfo(request);

    // Calculate risk score
    const riskScore = await this.calculateRiskScore({
      ipAddress,
      userAgent,
      endpoint,
      method,
      userId: sessionInfo?.userId,
    });

    return {
      userId: sessionInfo?.userId,
      sessionId: sessionInfo?.sessionId,
      ipAddress,
      userAgent,
      endpoint,
      method,
      riskScore,
      authLevel: sessionInfo?.authLevel || 'none',
    };
  }

  /**
   * Get security configuration for endpoint
   */
  private getSecurityConfig(endpoint: string): SecurityConfig {
    // Try exact match first
    if (ENDPOINT_SECURITY_CONFIG[endpoint]) {
      return ENDPOINT_SECURITY_CONFIG[endpoint];
    }

    // Try wildcard matches
    for (const pattern in ENDPOINT_SECURITY_CONFIG) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(endpoint)) {
          return ENDPOINT_SECURITY_CONFIG[pattern];
        }
      }
    }

    // Default configuration
    return {
      requireAuth: false,
      auditLevel: 'basic',
      riskLevel: 'low',
    };
  }

  /**
   * Check rate limits
   */
  private async checkRateLimits(
    context: SecurityContext,
    config: SecurityConfig
  ): Promise<void> {
    if (!config.rateLimits?.length) return;

    for (const limit of config.rateLimits) {
      const identifier = this.getRateLimitIdentifier(context, limit.identifier);

      const isWithinLimit = await securityAPI.checkRateLimit(
        limit.identifier,
        identifier,
        context.endpoint,
        limit.requests,
        limit.windowMinutes
      );

      if (!isWithinLimit) {
        // Create security alert for rate limit exceeded
        await securityAPI.createSecurityAlert({
          alert_type: 'RATE_LIMIT_EXCEEDED',
          title: `Rate limit exceeded for ${limit.identifier}`,
          description: `${limit.requests} requests in ${limit.windowMinutes} minutes limit exceeded`,
          severity: 'medium',
          source_type: 'automated',
          affected_user_id: context.userId,
          alert_data: {
            endpoint: context.endpoint,
            method: context.method,
            identifier_type: limit.identifier,
            identifier_value: identifier,
            limit: limit.requests,
            window_minutes: limit.windowMinutes,
          },
        });

        throw new Error('RATE_LIMIT_EXCEEDED');
      }
    }
  }

  /**
   * Check authentication requirements
   */
  private async checkAuthentication(
    context: SecurityContext,
    config: SecurityConfig
  ): Promise<void> {
    if (!config.requireAuth) return;

    if (context.authLevel === 'none') {
      throw new Error('AUTHENTICATION_REQUIRED');
    }

    if (
      config.requireMFA &&
      context.authLevel !== 'mfa' &&
      context.authLevel !== 'admin'
    ) {
      throw new Error('MFA_REQUIRED');
    }
  }

  /**
   * Check authorization requirements
   */
  private async checkAuthorization(
    context: SecurityContext,
    config: SecurityConfig
  ): Promise<void> {
    if (!config.requireAdmin) return;

    if (context.authLevel !== 'admin') {
      // Log unauthorized access attempt
      await securityAPI.createSecurityEvent({
        event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'warning',
        title: 'Unauthorized access attempt to admin endpoint',
        description: `User ${context.userId} attempted to access admin endpoint ${context.endpoint}`,
        event_data: {
          endpoint: context.endpoint,
          method: context.method,
          user_id: context.userId,
          ip_address: context.ipAddress,
          auth_level: context.authLevel,
        },
      });

      throw new Error('ADMIN_ACCESS_REQUIRED');
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    context: SecurityContext,
    config: SecurityConfig,
    action: string
  ): Promise<void> {
    if (config.auditLevel === 'none') return;

    const auditData: any = {
      action,
      resource_type: 'API_ENDPOINT',
      resource_id: context.endpoint,
      compliance_flags: config.complianceFlags || [],
      risk_level: config.riskLevel || 'low',
      metadata: {
        endpoint: context.endpoint,
        method: context.method,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        risk_score: context.riskScore,
        auth_level: context.authLevel,
        audit_level: config.auditLevel,
      },
    };

    if (config.auditLevel === 'detailed' || config.auditLevel === 'complete') {
      auditData.metadata.session_id = context.sessionId;
      auditData.metadata.timestamp = new Date().toISOString();
    }

    await securityAPI.createAuditLog(auditData);
  }

  /**
   * Get session information from request
   */
  private async getSessionInfo(request: NextRequest): Promise<{
    userId?: string;
    sessionId?: string;
    authLevel: 'none' | 'basic' | 'mfa' | 'admin';
  }> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();

      if (!session?.user) {
        return { authLevel: 'none' };
      }

      // Get user role and MFA status
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('role, mfa_enabled')
        .eq('id', session.user.id)
        .single();

      // Determine auth level
      let authLevel: 'none' | 'basic' | 'mfa' | 'admin' = 'basic';

      if (userProfile?.role === 'admin') {
        authLevel = 'admin';
      } else if (userProfile?.mfa_enabled) {
        authLevel = 'mfa';
      }

      return {
        userId: session.user.id,
        sessionId: session.access_token.slice(-10), // Last 10 chars as session ID
        authLevel,
      };
    } catch (error) {
      console.error('Failed to get session info:', error);
      return { authLevel: 'none' };
    }
  }

  /**
   * Calculate risk score for request
   */
  private async calculateRiskScore(params: {
    ipAddress?: string;
    userAgent?: string;
    endpoint: string;
    method: string;
    userId?: string;
  }): Promise<number> {
    let riskScore = 0;

    // Base risk by endpoint
    if (params.endpoint.includes('/admin/')) riskScore += 30;
    if (params.endpoint.includes('/patients/')) riskScore += 25;
    if (params.endpoint.includes('/financial/')) riskScore += 25;
    if (params.endpoint.includes('/security/')) riskScore += 20;

    // Method risk
    if (params.method === 'DELETE') riskScore += 15;
    if (params.method === 'PUT' || params.method === 'PATCH') riskScore += 10;
    if (params.method === 'POST') riskScore += 5;

    // IP reputation (simplified)
    if (params.ipAddress && this.isKnownBadIP(params.ipAddress)) {
      riskScore += 40;
    }

    // User risk factors
    if (params.userId) {
      const userRisk = await this.getUserRiskScore(params.userId);
      riskScore += userRisk;
    }

    // Time-based risk (off-hours access)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) riskScore += 10;

    return Math.min(riskScore, 100);
  }

  /**
   * Get risk score for user
   */
  private async getUserRiskScore(userId: string): Promise<number> {
    try {
      // Check recent failed auth attempts
      const { count: failedAttempts } = await this.supabase
        .from('auth_attempts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('success', false)
        .gte(
          'attempted_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      // Check security events involving user
      const { count: securityEvents } = await this.supabase
        .from('security_events')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte(
          'detected_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );

      return Math.min(
        (failedAttempts || 0) * 5 + (securityEvents || 0) * 10,
        50
      );
    } catch (error) {
      console.error('Failed to get user risk score:', error);
      return 0;
    }
  }

  /**
   * Check if IP is known to be bad
   */
  private isKnownBadIP(ipAddress: string): boolean {
    // Simplified check - in production, would check against threat intelligence feeds
    const knownBadIPs = [
      '192.168.1.100', // Example bad IP
    ];

    return knownBadIPs.includes(ipAddress);
  }

  /**
   * Get rate limit identifier value
   */
  private getRateLimitIdentifier(
    context: SecurityContext,
    type: string
  ): string {
    switch (type) {
      case 'ip':
        return context.ipAddress || 'unknown';
      case 'user':
        return context.userId || 'anonymous';
      case 'session':
        return context.sessionId || 'no-session';
      default:
        return 'unknown';
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    return (
      cfConnectingIP || xRealIP || xForwardedFor?.split(',')[0] || 'unknown'
    );
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: NextResponse): NextResponse {
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );

    // HSTS header
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );

    // CSP header
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co"
    );

    return response;
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    request: NextRequest,
    error: Error
  ): Promise<void> {
    try {
      const context = await this.buildSecurityContext(request);

      let severity: 'info' | 'warning' | 'error' | 'critical' = 'warning';
      let eventType = 'SECURITY_ERROR';

      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        severity = 'warning';
        eventType = 'RATE_LIMIT_EXCEEDED';
      } else if (error.message === 'AUTHENTICATION_REQUIRED') {
        severity = 'info';
        eventType = 'AUTHENTICATION_REQUIRED';
      } else if (error.message === 'MFA_REQUIRED') {
        severity = 'warning';
        eventType = 'MFA_REQUIRED';
      } else if (error.message === 'ADMIN_ACCESS_REQUIRED') {
        severity = 'error';
        eventType = 'UNAUTHORIZED_ACCESS_ATTEMPT';
      } else {
        severity = 'error';
        eventType = 'SECURITY_MIDDLEWARE_ERROR';
      }

      await securityAPI.createSecurityEvent({
        event_type: eventType,
        severity,
        title: `Security middleware: ${error.message}`,
        description: `Security event occurred during request processing`,
        event_data: {
          endpoint: context.endpoint,
          method: context.method,
          ip_address: context.ipAddress,
          user_agent: context.userAgent,
          user_id: context.userId,
          session_id: context.sessionId,
          risk_score: context.riskScore,
          error_message: error.message,
          stack_trace: error.stack,
        },
      });
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }
  }

  /**
   * Create error response
   */
  private createErrorResponse(error: Error): NextResponse {
    const errorResponses = {
      RATE_LIMIT_EXCEEDED: {
        status: 429,
        message: 'Too many requests. Please try again later.',
      },
      AUTHENTICATION_REQUIRED: {
        status: 401,
        message: 'Authentication required.',
      },
      MFA_REQUIRED: {
        status: 401,
        message: 'Multi-factor authentication required.',
      },
      ADMIN_ACCESS_REQUIRED: {
        status: 403,
        message: 'Administrator access required.',
      },
    };

    const errorResponse = errorResponses[
      error.message as keyof typeof errorResponses
    ] || {
      status: 500,
      message: 'Internal security error.',
    };

    return NextResponse.json(
      { error: errorResponse.message, code: error.message },
      { status: errorResponse.status }
    );
  }
}

// Export middleware function for Next.js
export async function securityMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const middleware = new SecurityMiddleware();
  return middleware.handle(request);
}

// Export middleware matcher configuration
export const securityMiddlewareConfig = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/admin/:path*'],
};
