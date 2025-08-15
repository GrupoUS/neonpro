/**
 * Security Middleware for Healthcare System
 * Implements security headers, input validation, and audit logging
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableCORS: boolean;
  rateLimitWindows: number;
  rateLimitMax: number;
  auditLogging: boolean;
  ipWhitelist?: string[];
  ipBlacklist?: string[];
}

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  // Security Headers Middleware
  async applySecurityHeaders(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next();

    if (this.config.enableCSP) {
      response.headers.set(
        'Content-Security-Policy',
        this.generateCSPHeader()
      );
    }

    if (this.config.enableHSTS) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Security headers for healthcare compliance
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Remove server identification
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');

    return response;
  }

  private generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  // Input Validation Middleware
  async validateInput(request: NextRequest): Promise<NextResponse | null> {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.clone().json();
        const validationResult = this.validateJSONInput(body);
        
        if (!validationResult.isValid) {
          await this.logSecurityEvent('input_validation_failed', validationResult.errors.join(', '), request);
          return NextResponse.json(
            { error: 'Invalid input', details: validationResult.errors },
            { status: 400 }
          );
        }
      } catch (error) {
        await this.logSecurityEvent('json_parse_error', `JSON parse error: ${error}`, request);
        return NextResponse.json(
          { error: 'Invalid JSON' },
          { status: 400 }
        );
      }
    }

    return null; // Continue processing
  }

  private validateJSONInput(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for common injection patterns
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
      /javascript:/gi, // Javascript protocol
      /on\w+\s*=/gi, // Event handlers
      /expression\s*\(/gi, // CSS expressions
      /@import/gi, // CSS imports
      /eval\s*\(/gi, // Eval function
      /document\.cookie/gi, // Cookie access
      /window\.location/gi, // Location manipulation
    ];

    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            errors.push(`Suspicious pattern detected in ${path || 'input'}: ${pattern.source}`);
          }
        }
        
        // Check for excessively long strings (potential DoS)
        if (value.length > 10000) {
          errors.push(`String too long in ${path || 'input'}: ${value.length} characters`);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively check object properties
        for (const [key, val] of Object.entries(value)) {
          checkValue(val, path ? `${path}.${key}` : key);
        }
      }
    };

    checkValue(data);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Audit Logging
  private async logSecurityEvent(eventType: string, description: string, request: NextRequest): Promise<void> {
    if (!this.config.auditLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      description,
      ip_address: this.getClientIP(request),
      user_agent: request.headers.get('user-agent') || 'unknown',
      path: request.nextUrl.pathname,
      method: request.method,
    };

    try {
      console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
           request.headers.get('x-real-ip') ||
           'unknown';
  }

  // Main middleware function
  async process(request: NextRequest): Promise<NextResponse> {
    try {
      // Validate input
      const inputValidationResult = await this.validateInput(request);
      if (inputValidationResult) return inputValidationResult;

      // Apply security headers
      const response = await this.applySecurityHeaders(request);

      return response;
    } catch (error) {
      await this.logSecurityEvent('middleware_error', `Error: ${error}`, request);
      
      return NextResponse.json(
        { error: 'Internal security error' },
        { status: 500 }
      );
    }
  }
}

// Default security configuration for healthcare
export const defaultHealthcareSecurityConfig: SecurityConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableCORS: true,
  rateLimitWindows: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // requests per window
  auditLogging: true,
  ipWhitelist: [], // Empty = allow all
  ipBlacklist: [] // Add known malicious IPs
};

// Create middleware instance
export const healthcareSecurityMiddleware = new SecurityMiddleware(defaultHealthcareSecurityConfig);