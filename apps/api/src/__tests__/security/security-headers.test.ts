/**
 * Security Headers Test Suite
 * Tests for enhanced security headers middleware including HSTS and CSP
 *
 * @version 1.0.0
 * @compliance LGPD, OWASP
 * @healthcare-platform NeonPro
 */

import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  healthcareSecurityHeadersMiddleware,
  securityHeadersMiddleware,
} from '../../middleware/security-headers';

describe('Security Headers Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe('Basic Security Headers', () => {
    it('should apply basic security headers', async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe(
        'strict-origin-when-cross-origin',
      );
      expect(response.headers.get('X-Request-ID')).toBeDefined();
    });

    it('should apply healthcare compliance headers', async () => {
      app.use('*', healthcareSecurityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      expect(response.headers.get('X-Healthcare-Compliance')).toBe(
        'LGPD,ANVISA,CFM',
      );
      expect(response.headers.get('X-Data-Classification')).toBe(
        'HIGHLY_RESTRICTED',
      );
      expect(response.headers.get('X-Audit-Trail')).toBe('enabled');
      expect(response.headers.get('X-Encryption-Status')).toBe('enabled');
    });

    it('should apply HSTS in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.use('*', healthcareSecurityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      const hstsHeader = response.headers.get('Strict-Transport-Security');
      expect(hstsHeader).toBeDefined();
      expect(hstsHeader).toContain('max-age=');
      expect(hstsHeader).toContain('includeSubDomains');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not apply HSTS in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.use('*', healthcareSecurityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      const hstsHeader = response.headers.get('Strict-Transport-Security');
      expect(hstsHeader).toBeNull();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Cross-Origin Security Headers', () => {
    it('should apply Cross-Origin Embedder Policy', async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe(
        'require-corp',
      );
    });

    it('should apply Cross-Origin Opener Policy', async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe(
        'same-origin',
      );
    });

    it('should apply Cross-Origin Resource Policy', async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe(
        'same-origin',
      );
    });
  });

  describe('Permissions Policy', () => {
    it('should apply restrictive permissions policy', async () => {
      app.use('*', securityHeadersMiddleware());
      app.get('/test', c => c.json({ message: 'test' }));

      const response = await app.request('/test');

      const permissionsPolicy = response.headers.get('Permissions-Policy');
      expect(permissionsPolicy).toBeDefined();
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
      expect(permissionsPolicy).toContain('payment=()');
    });
  });

  describe('Security Context', () => {
    it('should add security context to request', async () => {
      let capturedContext: any;

      app.use('*', securityHeadersMiddleware());
      app.use('*', (c, next) => {
        capturedContext = c.get('securityHeaders');
        return next();
      });
      app.get('/test', c => c.json({ message: 'test' }));

      await app.request('/test');

      expect(capturedContext).toBeDefined();
      expect(capturedContext.requestId).toBeDefined();
      expect(capturedContext.timestamp).toBeDefined();
      expect(capturedContext.headersApplied).toBeDefined();
      expect(Array.isArray(capturedContext.headersApplied)).toBe(true);
    });
  });
});
