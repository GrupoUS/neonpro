/**
 * CSRF Protection Implementation for NeonPro
 * Provides Cross-Site Request Forgery protection for forms and API endpoints
 */

import { createHash, randomBytes } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/client';

export type CSRFTokenData = {
  token: string;
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  userAgent: string;
  ipAddress: string;
};

export type CSRFValidationResult = {
  valid: boolean;
  error?: string;
  tokenData?: CSRFTokenData;
};

/**
 * CSRF Protection Manager
 */
export class CSRFProtection {
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
  private static readonly TOKEN_LENGTH = 32;
  private static readonly HEADER_NAME = 'X-CSRF-Token';
  private static readonly COOKIE_NAME = 'csrf-token';

  /**
   * Generate a new CSRF token
   */
  static generateToken(
    sessionId: string,
    userAgent: string,
    ipAddress: string
  ): CSRFTokenData {
    const token = randomBytes(CSRFProtection.TOKEN_LENGTH).toString('hex');
    const now = Date.now();

    return {
      token,
      sessionId,
      createdAt: now,
      expiresAt: now + CSRFProtection.TOKEN_EXPIRY,
      userAgent,
      ipAddress,
    };
  }

  /**
   * Create token hash for storage
   */
  static createTokenHash(tokenData: CSRFTokenData): string {
    return createHash('sha256')
      .update(
        `${tokenData.token}:${tokenData.sessionId}:${tokenData.userAgent}`
      )
      .digest('hex');
  }

  /**
   * Store CSRF token in database
   */
  static async storeToken(tokenData: CSRFTokenData): Promise<boolean> {
    try {
      const supabase = createClient();
      const tokenHash = CSRFProtection.createTokenHash(tokenData);

      const { error } = await supabase.from('csrf_tokens').insert({
        token_hash: tokenHash,
        session_id: tokenData.sessionId,
        expires_at: new Date(tokenData.expiresAt).toISOString(),
        user_agent: tokenData.userAgent,
        ip_address: tokenData.ipAddress,
        created_at: new Date(tokenData.createdAt).toISOString(),
      });

      return !error;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Validate CSRF token
   */
  static async validateToken(
    token: string,
    sessionId: string,
    userAgent: string,
    ipAddress: string
  ): Promise<CSRFValidationResult> {
    try {
      if (!(token && sessionId)) {
        return { valid: false, error: 'Missing CSRF token or session ID' };
      }

      const tokenData: CSRFTokenData = {
        token,
        sessionId,
        createdAt: 0,
        expiresAt: 0,
        userAgent,
        ipAddress,
      };

      const tokenHash = CSRFProtection.createTokenHash(tokenData);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('csrf_tokens')
        .select('*')
        .eq('token_hash', tokenHash)
        .eq('session_id', sessionId)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Invalid CSRF token' };
      }

      // Check expiration
      const expiresAt = new Date(data.expires_at).getTime();
      if (Date.now() > expiresAt) {
        // Clean up expired token
        await CSRFProtection.cleanupExpiredTokens();
        return { valid: false, error: 'CSRF token expired' };
      }

      // Validate user agent (optional strict check)
      if (
        process.env.CSRF_STRICT_UA === 'true' &&
        data.user_agent !== userAgent
      ) {
        return { valid: false, error: 'User agent mismatch' };
      }

      // Validate IP address (optional strict check)
      if (
        process.env.CSRF_STRICT_IP === 'true' &&
        data.ip_address !== ipAddress
      ) {
        return { valid: false, error: 'IP address mismatch' };
      }

      return {
        valid: true,
        tokenData: {
          token,
          sessionId,
          createdAt: new Date(data.created_at).getTime(),
          expiresAt,
          userAgent: data.user_agent,
          ipAddress: data.ip_address,
        },
      };
    } catch (_error) {
      return { valid: false, error: 'Token validation failed' };
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      await supabase.from('csrf_tokens').delete().lt('expires_at', now);
    } catch (_error) {}
  }

  /**
   * Middleware to validate CSRF tokens
   */
  static async validateCSRFMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // Skip CSRF validation for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null;
    }

    // Skip for health checks and monitoring
    const pathname = request.nextUrl.pathname;
    if (pathname.includes('/health') || pathname.includes('/monitoring')) {
      return null;
    }

    // Extract CSRF token from header or body
    const csrfToken =
      request.headers.get(CSRFProtection.HEADER_NAME) ||
      request.cookies.get(CSRFProtection.COOKIE_NAME)?.value;

    if (!csrfToken) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF token required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract session information
    const sessionId =
      request.cookies.get('session-id')?.value ||
      request.headers.get('X-Session-ID');

    if (!sessionId) {
      return new NextResponse(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = CSRFProtection.getClientIP(request);

    // Validate CSRF token
    const validation = await CSRFProtection.validateToken(
      csrfToken,
      sessionId,
      userAgent,
      ipAddress
    );

    if (!validation.valid) {
      return new NextResponse(
        JSON.stringify({ error: validation.error || 'Invalid CSRF token' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return null; // Validation passed
  }

  /**
   * Generate CSRF token for client
   */
  static async generateTokenForClient(
    request: NextRequest
  ): Promise<{ token: string; expires: number } | null> {
    try {
      const sessionId =
        request.cookies.get('session-id')?.value ||
        request.headers.get('X-Session-ID');

      if (!sessionId) {
        return null;
      }

      const userAgent = request.headers.get('user-agent') || '';
      const ipAddress = CSRFProtection.getClientIP(request);

      const tokenData = CSRFProtection.generateToken(
        sessionId,
        userAgent,
        ipAddress
      );
      const stored = await CSRFProtection.storeToken(tokenData);

      if (!stored) {
        return null;
      }

      return {
        token: tokenData.token,
        expires: tokenData.expiresAt,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (cfConnectingIP) {
      return cfConnectingIP;
    }
    if (realIP) {
      return realIP;
    }
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return request.ip || 'unknown';
  }
}

/**
 * React hook for CSRF protection
 */
export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCSRFToken() {
      try {
        const response = await fetch('/api/auth/csrf-token');
        if (response.ok) {
          const data = await response.json();
          setCSRFToken(data.token);
        }
      } catch (_error) {
      } finally {
        setLoading(false);
      }
    }

    fetchCSRFToken();
  }, []);

  return { csrfToken, loading };
}

// Export for use in other modules
export default CSRFProtection;
