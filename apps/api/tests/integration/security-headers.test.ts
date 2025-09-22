/**
 * Security Headers Validation Test (T051)
 *
 * Validates that all required security headers are properly configured
 * for HTTPS endpoints in the NeonPro healthcare platform.
 *
 * Tests:
 * - HSTS (HTTP Strict Transport Security) headers
 * - CSP (Content Security Policy) headers
 * - X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
 * - Healthcare compliance headers (LGPD, HIPAA-ready)
 * - Referrer Policy and Permissions Policy
 */

import { createServer } from 'http';
import { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Security Headers Validation Test (T051)', () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    server = createServer(app.fetch);
    await new Promise<void>(resolve => {
      server.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('HSTS (HTTP Strict Transport Security)', () => {
    it('should include HSTS header with proper configuration', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const hstsHeader = response.headers.get('strict-transport-security');

      expect(hstsHeader).toBeTruthy();
      expect(hstsHeader).toMatch(/max-age=\d+/);

      // Extract max-age value
      const maxAgeMatch = hstsHeader?.match(/max-age=(\d+)/);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) : 0;

      // Should be at least 1 year (31536000 seconds)
      expect(maxAge).toBeGreaterThanOrEqual(31536000);

      // Should include subdomains
      expect(hstsHeader).toContain('includeSubDomains');

      // Should include preload directive for production
      if (process.env.NODE_ENV === 'production') {
        expect(hstsHeader).toContain('preload');
      }
    });

    it('should enforce HSTS for all API endpoints', async () => {
      const endpoints = [
        '/api/ai/data-agent',
        '/api/ai/sessions',
        '/api/health',
        '/api/ping',
      ];

      for (const endpoint of endpoints) {
        const isPostEndpoint = endpoint === '/api/ai/data-agent';
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: isPostEndpoint ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          ...(isPostEndpoint && { body: JSON.stringify({ _query: 'test' }) }),
        });

        const hstsHeader = response.headers.get('strict-transport-security');
        expect(hstsHeader).toBeTruthy();
        expect(hstsHeader).toMatch(/max-age=\d+/);
      }
    });
  });

  describe('Content Security Policy (CSP)', () => {
    it('should include comprehensive CSP header', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const cspHeader = response.headers.get('content-security-policy');

      expect(cspHeader).toBeTruthy();

      // Should restrict default sources
      expect(cspHeader).toMatch(/default-src\s+[^;]+/);

      // Should allow self for scripts and styles
      expect(cspHeader).toMatch(/script-src[^;]*'self'/);
      expect(cspHeader).toMatch(/style-src[^;]*'self'/);

      // Should restrict object and embed sources
      expect(cspHeader).toMatch(/object-src\s+'none'/);

      // Should include frame ancestors restriction
      expect(cspHeader).toMatch(/frame-ancestors\s+'none'/);
    });

    it('should include healthcare-specific CSP directives', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ _query: 'test healthcare query' }),
      });

      const cspHeader = response.headers.get('content-security-policy');
      expect(cspHeader).toBeTruthy();

      // Should restrict connect-src for healthcare data protection
      expect(cspHeader).toMatch(/connect-src[^;]*'self'/);

      // Should include base-uri restriction
      expect(cspHeader).toMatch(/base-uri\s+'self'/);
    });
  });

  describe('X-Frame-Options', () => {
    it('should prevent clickjacking with X-Frame-Options', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const xFrameOptions = response.headers.get('x-frame-options');

      expect(xFrameOptions).toBeTruthy();
      expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions);
    });

    it('should apply X-Frame-Options to all endpoints', async () => {
      const endpoints = [
        '/api/ai/data-agent',
        '/api/ai/sessions',
        '/api/health',
      ];

      for (const endpoint of endpoints) {
        const isPostEndpoint = endpoint === '/api/ai/data-agent';
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: isPostEndpoint ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          ...(isPostEndpoint && { body: JSON.stringify({ _query: 'test' }) }),
        });

        const xFrameOptions = response.headers.get('x-frame-options');
        expect(xFrameOptions).toBeTruthy();
      }
    });
  });

  describe('X-Content-Type-Options', () => {
    it('should prevent MIME type sniffing', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const xContentTypeOptions = response.headers.get('x-content-type-options');

      expect(xContentTypeOptions).toBe('nosniff');
    });
  });

  describe('X-XSS-Protection', () => {
    it('should enable XSS protection', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const xXssProtection = response.headers.get('x-xss-protection');

      expect(xXssProtection).toBeTruthy();
      expect(xXssProtection).toMatch(/1/);
      expect(xXssProtection).toMatch(/mode=block/);
    });
  });

  describe('Referrer Policy', () => {
    it('should include strict referrer policy', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const referrerPolicy = response.headers.get('referrer-policy');

      expect(referrerPolicy).toBeTruthy();
      expect(['strict-origin-when-cross-origin', 'same-origin', 'no-referrer']).toContain(
        referrerPolicy,
      );
    });
  });

  describe('Permissions Policy', () => {
    it('should restrict dangerous browser features', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const permissionsPolicy = response.headers.get('permissions-policy');

      if (permissionsPolicy) {
        // Should restrict camera and microphone for healthcare privacy
        expect(permissionsPolicy).toMatch(/camera=\(\)/);
        expect(permissionsPolicy).toMatch(/microphone=\(\)/);

        // Should restrict geolocation
        expect(permissionsPolicy).toMatch(/geolocation=\(\)/);
      }
    });
  });

  describe('Healthcare Compliance Headers', () => {
    it('should include LGPD compliance headers', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ _query: 'patient data query' }),
      });

      const healthcareCompliance = response.headers.get('x-healthcare-compliance');
      expect(healthcareCompliance).toBeTruthy();
      expect(healthcareCompliance).toContain('LGPD');
    });

    it('should include HIPAA-ready compliance indicators', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ _query: 'healthcare data query' }),
      });

      const healthcareCompliance = response.headers.get('x-healthcare-compliance');
      expect(healthcareCompliance).toBeTruthy();
      expect(healthcareCompliance).toContain('HIPAA-Ready');
    });

    it('should include data classification headers for sensitive endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ _query: 'sensitive patient information' }),
      });

      const dataClassification = response.headers.get('x-data-classification');
      if (dataClassification) {
        expect(['confidential', 'restricted', 'sensitive']).toContain(
          dataClassification.toLowerCase(),
        );
      }
    });
  });

  describe('Security Headers Consistency', () => {
    it('should apply all security headers consistently across endpoints', async () => {
      const endpoints = [
        { path: '/api/health', method: 'GET' },
        { path: '/api/ai/data-agent', method: 'POST' },
        { path: '/api/ai/sessions', method: 'GET' },
      ];

      const requiredHeaders = [
        'strict-transport-security',
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
        'referrer-policy',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          ...(endpoint.method === 'POST' && { body: JSON.stringify({ _query: 'test' }) }),
        });

        for (const header of requiredHeaders) {
          const headerValue = response.headers.get(header);
          expect(headerValue).toBeTruthy();
        }
      }
    });

    it('should not expose sensitive server information', async () => {
      const response = await fetch(`${baseUrl}/api/health`);

      // Should not expose server version
      const serverHeader = response.headers.get('server');
      if (serverHeader) {
        expect(serverHeader).not.toMatch(/\d+\.\d+/); // No version numbers
      }

      // Should not expose X-Powered-By
      const poweredBy = response.headers.get('x-powered-by');
      expect(poweredBy).toBeFalsy();
    });
  });
});
