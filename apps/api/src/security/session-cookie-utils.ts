/**
 * Secure Session Cookie Utilities
 * 
 * Provides secure cookie handling for session management including
 * validation, integrity checking, and secure attribute management.
 * 
 * @security_critical
 * @compliance OWASP Session Management Cheat Sheet
 * @version 1.0.0
 */

import { EnhancedSessionManager } from './enhanced-session-manager';

export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface CookieValidationResult {
  isValid: boolean;
  sessionId?: string;
  error?: string;
  warnings?: string[];
}

export class SessionCookieUtils {
  private static readonly DEFAULT_COOKIE_CONFIG: CookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60, // 8 hours
    priority: 'high'
  };

  private static readonly SESSION_COOKIE_NAME = 'sessionId';
  private static readonly CSRF_COOKIE_NAME = 'csrfToken';
  private static readonly SESSION_SIGNATURE_COOKIE_NAME = 'sessionSig';

  /**
   * Generate secure session cookie with signature
   */
  static generateSecureSessionCookie(
    sessionId: string,
    config: Partial<CookieConfig> = {},
    secretKey: string
  ): string {
    const cookieConfig = { ...this.DEFAULT_COOKIE_CONFIG, ...config };
    
    // Generate CSRF token for session
    const csrfToken = this.generateCSRFToken();
    
    // Generate session signature for integrity
    const sessionSignature = this.generateSessionSignature(sessionId, secretKey);
    
    // Create session cookie string
    const sessionCookie = this.formatCookie(
      this.SESSION_COOKIE_NAME,
      sessionId,
      cookieConfig
    );
    
    // Create CSRF cookie string
    const csrfCookie = this.formatCookie(
      this.CSRF_COOKIE_NAME,
      csrfToken,
      {
        ...cookieConfig,
        httpOnly: false, // Allow JavaScript access for CSRF token
        maxAge: cookieConfig.maxAge // Match session cookie lifetime
      }
    );
    
    // Create signature cookie string
    const signatureCookie = this.formatCookie(
      this.SESSION_SIGNATURE_COOKIE_NAME,
      sessionSignature,
      {
        ...cookieConfig,
        httpOnly: true,
        maxAge: cookieConfig.maxAge
      }
    );
    
    return `${sessionCookie}; ${csrfCookie}; ${signatureCookie}`;
  }

  /**
   * Validate session cookies and extract session ID
   */
  static validateSessionCookies(
    cookieHeader: string | undefined,
    secretKey: string,
    sessionManager: EnhancedSessionManager
  ): CookieValidationResult {
    if (!cookieHeader) {
      return {
        isValid: false,
        error: 'No session cookies found'
      };
    }

    const warnings: string[] = [];
    
    try {
      // Parse cookies
      const cookies = this.parseCookieHeader(cookieHeader);
      
      // Get session ID
      const sessionId = cookies[this.SESSION_COOKIE_NAME];
      if (!sessionId) {
        return {
          isValid: false,
          error: 'Session ID cookie missing'
        };
      }

      // Validate session ID format
      if (!this.validateSessionIdFormat(sessionId)) {
        return {
          isValid: false,
          error: 'Invalid session ID format'
        };
      }

      // Validate session signature
      const providedSignature = cookies[this.SESSION_SIGNATURE_COOKIE_NAME];
      if (!providedSignature) {
        return {
          isValid: false,
          error: 'Session signature missing'
        };
      }

      const expectedSignature = this.generateSessionSignature(sessionId, secretKey);
      if (providedSignature !== expectedSignature) {
        return {
          isValid: false,
          error: 'Session signature invalid'
        };
      }

      // Validate CSRF token (if present)
      const csrfToken = cookies[this.CSRF_COOKIE_NAME];
      if (csrfToken && !this.validateCSRFToken(csrfToken)) {
        warnings.push('CSRF token format invalid');
      }

      // Check if session exists in session manager
      const session = sessionManager.getSession(sessionId);
      if (!session) {
        return {
          isValid: false,
          error: 'Session not found or expired'
        };
      }

      // Check cookie security attributes
      this.validateCookieSecurity(cookieHeader, warnings);

      return {
        isValid: true,
        sessionId,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to parse session cookies'
      };
    }
  }

  /**
   * Generate cryptographically secure CSRF token
   */
  private static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token format
   */
  private static validateCSRFToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Generate session signature for integrity
   */
  private static generateSessionSignature(sessionId: string, secretKey: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(sessionId);
    const key = encoder.encode(secretKey);
    
    return crypto.subtle
      .sign('HMAC', key, data)
      .then(signature => {
        const signatureArray = new Uint8Array(signature);
        return Array.from(signatureArray, byte => byte.toString(16).padStart(2, '0')).join('');
      });
  }

  /**
   * Validate session ID format
   */
  private static validateSessionIdFormat(sessionId: string): boolean {
    return /^[a-f0-9]{32}$/.test(sessionId);
  }

  /**
   * Parse cookie header into object
   */
  private static parseCookieHeader(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        cookies[name.trim()] = valueParts.join('=').trim();
      }
    });
    
    return cookies;
  }

  /**
   * Format cookie string with attributes
   */
  private static formatCookie(name: string, value: string, config: CookieConfig): string {
    const attributes: string[] = [];
    
    attributes.push(`${name}=${value}`);
    
    if (config.httpOnly) attributes.push('HttpOnly');
    if (config.secure) attributes.push('Secure');
    if (config.sameSite) attributes.push(`SameSite=${config.sameSite}`);
    if (config.path) attributes.push(`Path=${config.path}`);
    if (config.domain) attributes.push(`Domain=${config.domain}`);
    if (config.maxAge) attributes.push(`Max-Age=${config.maxAge}`);
    if (config.expires) attributes.push(`Expires=${config.expires.toUTCString()}`);
    if (config.priority) attributes.push(`Priority=${config.priority}`);
    
    return attributes.join('; ');
  }

  /**
   * Validate cookie security attributes
   */
  private static validateCookieSecurity(cookieHeader: string, warnings: string[]): void {
    // Check for HttpOnly flag
    if (!cookieHeader.includes('HttpOnly')) {
      warnings.push('Session cookie missing HttpOnly flag');
    }

    // Check for Secure flag
    if (!cookieHeader.includes('Secure')) {
      warnings.push('Session cookie missing Secure flag');
    }

    // Check for SameSite flag
    if (!cookieHeader.includes('SameSite')) {
      warnings.push('Session cookie missing SameSite flag');
    }

    // Check for secure SameSite value
    if (cookieHeader.includes('SameSite=None') && !cookieHeader.includes('Secure')) {
      warnings.push('SameSite=None requires Secure flag');
    }

    // Check for reasonable Max-Age
    const maxAgeMatch = cookieHeader.match(/Max-Age=(\d+)/);
    if (maxAgeMatch) {
      const maxAge = parseInt(maxAgeMatch[1], 10);
      if (maxAge > 24 * 60 * 60) { // More than 24 hours
        warnings.push('Session cookie Max-Age exceeds recommended duration');
      }
    }
  }

  /**
   * Create session cleanup cookie (for logout)
   */
  static createCleanupCookies(): string {
    const expiredConfig = {
      ...this.DEFAULT_COOKIE_CONFIG,
      maxAge: 0,
      expires: new Date(0) // Expired immediately
    };

    const sessionCookie = this.formatCookie(this.SESSION_COOKIE_NAME, '', expiredConfig);
    const csrfCookie = this.formatCookie(this.CSRF_COOKIE_NAME, '', expiredConfig);
    const signatureCookie = this.formatCookie(this.SESSION_SIGNATURE_COOKIE_NAME, '', expiredConfig);

    return `${sessionCookie}; ${csrfCookie}; ${signatureCookie}`;
  }

  /**
   * Extract session ID from cookie header (basic extraction without validation)
   */
  static extractSessionId(cookieHeader: string | undefined): string | undefined {
    if (!cookieHeader) return undefined;

    const cookies = this.parseCookieHeader(cookieHeader);
    return cookies[this.SESSION_COOKIE_NAME];
  }

  /**
   * Check if request has session cookies
   */
  static hasSessionCookies(cookieHeader: string | undefined): boolean {
    if (!cookieHeader) return false;

    const cookies = this.parseCookieHeader(cookieHeader);
    return !!(cookies[this.SESSION_COOKIE_NAME] && cookies[this.SESSION_SIGNATURE_COOKIE_NAME]);
  }

  /**
   * Get CSRF token from cookies
   */
  static getCSRFToken(cookieHeader: string | undefined): string | undefined {
    if (!cookieHeader) return undefined;

    const cookies = this.parseCookieHeader(cookieHeader);
    return cookies[this.CSRF_COOKIE_NAME];
  }

  /**
   * Validate CSRF token against request
   */
  static validateCSRFRequest(
    cookieHeader: string | undefined,
    csrfTokenHeader: string | undefined
  ): { isValid: boolean; error?: string } {
    const cookieCSRFToken = this.getCSRFToken(cookieHeader);
    
    if (!cookieCSRFToken) {
      return {
        isValid: false,
        error: 'CSRF token missing from cookies'
      };
    }

    if (!csrfTokenHeader) {
      return {
        isValid: false,
        error: 'CSRF token missing from request headers'
      };
    }

    if (cookieCSRFToken !== csrfTokenHeader) {
      return {
        isValid: false,
        error: 'CSRF token mismatch'
      };
    }

    return { isValid: true };
  }
}